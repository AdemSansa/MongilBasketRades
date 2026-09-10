import autoTable from 'jspdf-autotable';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';

import { GroupAttendanceReport, MonthlyAttendanceReport } from '../models/report.model';
import { Player } from '../models/player.model';

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function ageFromDob(dateOfBirth: string): number {
  const dob = new Date(dateOfBirth);
  const now = new Date();
  let years = now.getFullYear() - dob.getFullYear();
  if (now.getMonth() < dob.getMonth() || (now.getMonth() === dob.getMonth() && now.getDate() < dob.getDate())) {
    years--;
  }
  return years;
}

export function exportPlayersToExcel(players: Player[], groupName: (groupId: string | null) => string): void {
  const rows = players.map((p) => ({
    'First Name': p.firstName,
    'Last Name': p.lastName,
    Age: ageFromDob(p.dateOfBirth),
    'Date of Birth': p.dateOfBirth,
    Gender: p.gender ?? '',
    Group: groupName(p.currentGroupId),
    Status: p.status,
    Registered: p.registrationDate,
    'Emergency Contact': p.emergencyContactName ?? '',
    'Emergency Phone': p.emergencyContactPhone ?? '',
    'Medical Notes': p.medicalNotes ?? '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Players');
  const arrayBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([arrayBuffer], { type: 'application/octet-stream' });
  const date = new Date().toISOString().slice(0, 10);
  triggerDownload(blob, `players-${date}.xlsx`);
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const STATUS_ABBREVIATION: Record<string, string> = {
  PRESENT: 'P',
  ABSENT: 'A',
  LATE: 'L',
  EXCUSED: 'E',
};

function renderGroupTable(doc: jsPDF, group: GroupAttendanceReport, startY: number): number {
  const dateColumns = group.sessions.map((s) => s.date.slice(5));
  const head = [['Player', ...dateColumns, 'Rate']];
  const body = group.players.map((row) => [
    row.playerName,
    ...group.sessions.map((s) => STATUS_ABBREVIATION[row.marksBySessionId[s.id]] ?? '—'),
    `${row.rate}%`,
  ]);

  autoTable(doc, {
    startY,
    head,
    body,
    headStyles: { fillColor: [18, 41, 77] },
    styles: { fontSize: 8, cellPadding: 2 },
    margin: { left: 14, right: 14 },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (doc as any).lastAutoTable.finalY + 10;
}

export function exportMonthlyAttendancePdf(report: MonthlyAttendanceReport, coachLabel: string): void {
  const doc = new jsPDF({ orientation: 'landscape' });
  const monthLabel = `${MONTH_NAMES[report.month - 1]} ${report.year}`;

  doc.setFontSize(16);
  doc.text('Mongil Basket Rades — Attendance Report', 14, 16);
  doc.setFontSize(11);
  doc.text(`${monthLabel} · ${coachLabel}`, 14, 24);

  if (report.groups.length === 0) {
    doc.setFontSize(11);
    doc.text('No groups found for this selection.', 14, 36);
  } else {
    let y = 32;
    report.groups.forEach((group, index) => {
      if (index > 0) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(13);
      doc.text(`${group.groupName} — Coach ${group.coachName}`, 14, y);
      y += 6;

      if (group.sessions.length === 0) {
        doc.setFontSize(10);
        doc.text('No sessions recorded this month.', 14, y + 6);
      } else {
        renderGroupTable(doc, group, y);
      }
    });
  }

  const coachSlug = coachLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const monthStr = String(report.month).padStart(2, '0');
  doc.save(`attendance-${report.year}-${monthStr}-${coachSlug}.pdf`);
}
