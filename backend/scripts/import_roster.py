"""
One-off import of the academy's real roster from its Excel export
("Réponses au formulaire 1" sheet) into the dev Postgres database.
Bulk historical import via direct DB writes (not the REST API) —
appropriate for a one-time data-migration script, not how the app
itself creates data day-to-day.

NOT IDEMPOTENT for players/parents: re-running will create duplicate
rows. Coaches/groups ARE idempotent (looked up by email/name first).
If you need to re-import, delete the previously-imported players and
parents first.

Usage:
    pip install openpyxl psycopg2-binary bcrypt
    XLSX_PATH="C:\\path\\to\\roster.xlsx" SEASON_ID="<uuid>" python import_roster.py

Env vars (all optional except XLSX_PATH and SEASON_ID):
    XLSX_PATH   path to the .xlsx export (required)
    SEASON_ID   UUID of the season these players belong to (required)
    DB_HOST     default "localhost"
    DB_PORT     default "5434" (the mongil_basket_postgres Docker container)
    DB_NAME     default "mongil_basket"
    DB_USER     default "mongil_basket"
    DB_PASSWORD default "mongil_basket_dev"

Decisions made per user direction when this was first run (2026-09-08):
- Import every row with a player name, even if incomplete. Rows missing
  a date of birth (required by the Player schema) get a clearly fake
  placeholder (2000-01-01 -> renders as ~26 years old, an obvious flag
  for admin follow-up) plus a note in medicalNotes explaining why.
- Distinct coach labels in the sheet (e.g. "Mme Amira" vs "Mlle Amira")
  are treated as distinct coaches/groups — edit COACH_DEFS below to
  match your own sheet's coach labels before running.
- Only fields with a real home in the current schema are imported:
  player name/DOB, coach/group assignment, parent phone/address.
  Columns like weight/height/uniform-size/insurance/monthly-payment
  have no matching entity yet (Payment doesn't exist until Phase 9)
  and are intentionally NOT imported — resist the urge to add new
  columns just to fit a spreadsheet; extend the schema deliberately
  when the corresponding phase actually needs it.
"""

import datetime
import os
import re
import sys
import uuid

import bcrypt
import openpyxl
import psycopg2

sys.stdout.reconfigure(encoding="utf-8")

XLSX_PATH = os.environ.get("XLSX_PATH")
SEASON_ID = os.environ.get("SEASON_ID")
if not XLSX_PATH or not SEASON_ID:
    sys.exit("Set XLSX_PATH and SEASON_ID env vars before running (see module docstring).")

DB = dict(
    host=os.environ.get("DB_HOST", "localhost"),
    port=os.environ.get("DB_PORT", "5434"),
    dbname=os.environ.get("DB_NAME", "mongil_basket"),
    user=os.environ.get("DB_USER", "mongil_basket"),
    password=os.environ.get("DB_PASSWORD", "mongil_basket_dev"),
)
PLACEHOLDER_DOB = datetime.date(2000, 1, 1)
IMPORT_PASSWORD_HASH = bcrypt.hashpw(b"ImportPending2026!", bcrypt.gensalt()).decode()

# Edit to match the coach labels actually present in your sheet's COACH column.
COACH_DEFS = {
    "Mme Amira": dict(
        email="mme.amira@mongilbasket.academy",
        first="Amira",
        last="(Mme)",
        group_name="Grandes Filles - Mme Amira",
    ),
    "Mlle Amira": dict(
        email="mlle.amira@mongilbasket.academy",
        first="Amira",
        last="(Mlle)",
        group_name="Grandes Filles - Mlle Amira",
    ),
    "Coach Fathi": dict(
        email="fathi@mongilbasket.academy",
        first="Fathi",
        last="Coach",
        group_name="Garcons - Coach Fathi",
    ),
    "Coach Ines": dict(
        email="ines@mongilbasket.academy",
        first="Ines",
        last="Coach",
        group_name="Groupe - Coach Ines",
    ),
    "Coach Hejer": dict(
        email="hejer@mongilbasket.academy",
        first="Hejer",
        last="Coach",
        group_name="Groupe - Coach Hejer",
    ),
}


def split_name(full_name):
    parts = str(full_name).strip().split()
    if len(parts) == 1:
        return parts[0], parts[0]
    return parts[0], " ".join(parts[1:])


def slugify_email_local(text, counter):
    base = re.sub(r"[^a-z0-9]+", ".", text.lower()).strip(".")
    return f"import.parent.{counter}.{base}@mongilbasket.academy" if base else f"import.parent.{counter}@mongilbasket.academy"


def main():
    wb = openpyxl.load_workbook(XLSX_PATH, data_only=True)
    ws = wb["Réponses au formulaire 1"]

    rows = []
    for row in ws.iter_rows(min_row=2, values_only=True):
        name = row[1]
        if not name or not str(name).strip():
            continue
        raw_dob = row[3]
        if isinstance(raw_dob, datetime.datetime):
            dob = raw_dob.date()
        elif isinstance(raw_dob, datetime.date):
            dob = raw_dob
        else:
            # A handful of cells hold malformed partial strings like "08/08/"
            # (day/month with no year) rather than a real date or blank —
            # treat anything that isn't a clean date object as missing.
            dob = None

        rows.append(
            dict(
                timestamp=row[0],
                name=str(name).strip(),
                coach=(row[2] or "").strip(),
                dob=dob,
                address=(row[4] or "").strip() or None,
                phone=(str(row[5]).strip() if row[5] else None),
            )
        )

    print(f"Parsed {len(rows)} player rows from the sheet.")

    conn = psycopg2.connect(**DB)
    cur = conn.cursor()

    # --- Coaches + groups -------------------------------------------------
    coach_group_ids = {}  # sheet coach label -> group_id
    for label, spec in COACH_DEFS.items():
        cur.execute("SELECT id FROM users WHERE email = %s", (spec["email"],))
        existing = cur.fetchone()
        if existing:
            user_id = existing[0]
            print(f"Coach user already exists: {spec['email']}")
        else:
            user_id = str(uuid.uuid4())
            cur.execute(
                """INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, status, created_at, updated_at)
                   VALUES (%s, %s, %s, 'COACH', %s, %s, NULL, 'ACTIVE', now(), now())""",
                (user_id, spec["email"], IMPORT_PASSWORD_HASH, spec["first"], spec["last"]),
            )

        cur.execute("SELECT id FROM coaches WHERE user_id = %s", (user_id,))
        existing_coach = cur.fetchone()
        if existing_coach:
            coach_id = existing_coach[0]
        else:
            coach_id = str(uuid.uuid4())
            cur.execute(
                "INSERT INTO coaches (id, user_id, bio) VALUES (%s, %s, %s)",
                (coach_id, user_id, "Imported from the academy's real roster spreadsheet."),
            )

        cur.execute("SELECT id FROM groups WHERE name = %s AND season_id = %s", (spec["group_name"], SEASON_ID))
        existing_group = cur.fetchone()
        if existing_group:
            group_id = existing_group[0]
        else:
            group_id = str(uuid.uuid4())
            # Capacity padded above the real roster size for this coach so the whole real group fits without waitlisting.
            roster_count = sum(1 for r in rows if r["coach"] == label)
            capacity = max(roster_count + 15, 20)
            cur.execute(
                """INSERT INTO groups (id, name, season_id, age_min, age_max, capacity, coach_id, status)
                   VALUES (%s, %s, %s, 5, 14, %s, %s, 'ACTIVE')""",
                (group_id, spec["group_name"], SEASON_ID, capacity, coach_id),
            )
        coach_group_ids[label] = group_id

    conn.commit()
    print(f"Coaches/groups ready: {list(COACH_DEFS.keys())}")

    # --- Parents (dedup by phone) + players --------------------------------
    parent_id_by_phone = {}
    players_created = 0
    placeholder_dob_count = 0
    unassigned_group_count = 0
    counter = 0

    for r in rows:
        counter += 1
        first_name, last_name = split_name(r["name"])

        # Dedup parent by phone (likely siblings); otherwise a fresh synthetic parent per player.
        parent_key = r["phone"] if r["phone"] else f"__no_phone_{counter}"
        if parent_key in parent_id_by_phone:
            parent_id = parent_id_by_phone[parent_key]
        else:
            user_id = str(uuid.uuid4())
            email = slugify_email_local(last_name, counter)
            cur.execute(
                """INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, status, created_at, updated_at)
                   VALUES (%s, %s, %s, 'PARENT', 'Parent', %s, %s, 'ACTIVE', now(), now())""",
                (user_id, email, IMPORT_PASSWORD_HASH, last_name, r["phone"]),
            )
            parent_id = str(uuid.uuid4())
            cur.execute(
                "INSERT INTO parents (id, user_id, address) VALUES (%s, %s, %s)",
                (parent_id, user_id, r["address"]),
            )
            parent_id_by_phone[parent_key] = parent_id

        dob = r["dob"]
        medical_notes = None
        if not dob:
            dob = PLACEHOLDER_DOB
            placeholder_dob_count += 1
            medical_notes = "DOB not provided on the academy roster — placeholder used (2000-01-01). Follow up with the family for the real date."

        group_id = coach_group_ids.get(r["coach"])
        if not group_id:
            unassigned_group_count += 1

        registration_date = r["timestamp"].date() if isinstance(r["timestamp"], datetime.datetime) else datetime.date.today()

        player_id = str(uuid.uuid4())
        cur.execute(
            """INSERT INTO players (id, first_name, last_name, date_of_birth, medical_notes,
                                     emergency_contact_phone, status, registration_date, parent_id, current_group_id,
                                     created_at, updated_at)
               VALUES (%s, %s, %s, %s, %s, %s, 'ACTIVE', %s, %s, %s, now(), now())""",
            (player_id, first_name, last_name, dob, medical_notes, r["phone"], registration_date, parent_id, group_id),
        )
        players_created += 1

    conn.commit()
    cur.close()
    conn.close()

    print(f"Players created: {players_created}")
    print(f"Unique parent accounts: {len(set(parent_id_by_phone.values()))}")
    print(f"Placeholder DOB used: {placeholder_dob_count}")
    print(f"Players with no coach match (left unassigned): {unassigned_group_count}")


if __name__ == "__main__":
    main()
