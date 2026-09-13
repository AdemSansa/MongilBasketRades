"""One-off script: infer and set gender for live Neon players based on
group membership (single-gender groups are deterministic) and, for the
two mixed groups, Tunisian first-name classification. Not idempotent-safe
to re-run blindly since it always overwrites -- fine here since it's a
one-time correction, not part of the regular import pipeline."""

import psycopg2

CONN_STRING = (
    "postgresql://neondb_owner:npg_PfMkZS36rNvg@"
    "ep-calm-scene-ae917z17-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require"
)

# Players in the two mixed groups ("Groupe - Coach Hejer", "Groupe - Coach Ines")
# plus the 2 groupless players, classified by Tunisian first-name convention.
GENDER_MAP = {
    "77558aa8-4cc5-4355-8527-949995ab1101": "FEMALE",  # Abrar Madiouni
    "45ed7654-ce7c-4e4e-9a9f-14a9f6f25782": "MALE",  # Achref Ghozzi
    "b2b941b1-8458-43f6-9fbe-57424d43365f": "MALE",  # Ahmed Ghozzi
    "9f9b3bee-1882-4ea9-b1f2-c85c193ed59e": "MALE",  # Ahmed Najari
    "279d22db-b4aa-42af-a96e-2d959e07c504": "FEMALE",  # Aicha Amri
    "19fa3ad8-8ec7-45ee-be94-2deaaa528e6e": "MALE",  # Amir Flifla
    "6238c8dc-fd5e-4110-bc2f-c4bccc0c83bb": "MALE",  # Arken Daii
    "39cf7350-40c2-4251-842f-cd18159b9cf1": "FEMALE",  # Assia Larguech
    "39c6016d-1972-41fe-83a0-8badcc9f4b8f": "MALE",  # Ayoub Achouri
    "e34e815c-18d2-4f27-8ce4-d65a5f2903a6": "FEMALE",  # Abrar marzoughi
    "73822153-9579-40a5-acf7-2519a0bf2a36": "MALE",  # Ahmed Ajej
    "0de4ad43-68b5-4633-bd79-3f778abd3c24": "MALE",  # Ajed ben romdhan
    "f72bce86-0737-4648-ac3d-9795ec72666e": "MALE",  # Anas Ben Jeddi
    "3d731fcc-a948-40d1-bf1c-177a3a387361": "FEMALE",  # Assil Ben Slimen
    "e0bfba9b-69ff-49c3-a172-47aef9254546": "MALE",  # Ayoub issaoui
    "cf7cca7c-dcfc-4b82-937c-66f885704e8e": "MALE",  # Aziz Kouki
    "6414c798-a736-4695-874b-54c80e213f45": "FEMALE",  # Balkis Rezgui
    "f77dc79e-8d77-469c-b275-f8d31330dc98": "FEMALE",  # Baya Amri
    "d6ad7a22-826a-4942-9afd-699cdd2ab82d": "MALE",  # Bayrem Barhoumi
    "f27519d7-bb63-4dc9-b0d4-43664453a2c2": "MALE",  # Bayrem Ouled Dhifa
    "22ea4ef7-d1a4-4045-9f05-123c9798137c": "MALE",  # Brahim rezgui
    "33669bc0-c443-4f62-94a0-265acf8aad2a": "FEMALE",  # Chayma Sehli
    "05f38562-5afd-4ee8-b458-8a0ddc1631e0": "MALE",  # Elyes saidi
    "70c9f1b6-5603-4b66-8bd4-de0e48a908ef": "FEMALE",  # Emna Dridi
    "6095b6f2-73f6-448f-af18-8fc684ef0583": "FEMALE",  # Eya Daly
    "04c16f41-a878-4e61-b3da-03bf2fafc8a8": "FEMALE",  # Fatma Flifla
    "55788ee4-7543-49e5-bac6-ac2243aed313": "MALE",  # Feres Ben Hamed
    "b4fc4b42-ff4e-4c00-a89f-21f16cadff68": "MALE",  # Haroun Gaaloul
    "cced330e-eb52-467c-821b-dc1f7bee2b96": "MALE",  # Haroun Talbi
    "e912d5d8-35f3-4405-b57b-6ac7da90c3f2": "MALE",  # Haroun Mneri
    "c28ca9e4-8dde-4ce1-91b5-b76a1764237f": "MALE",  # Haroun fayache
    "2cafef2c-5986-4ed4-9460-a6e5e7b29f31": "FEMALE",  # Iline Chili
    "b58f62cb-479c-45f9-ae07-c3e3e36bd763": "FEMALE",  # Isra Boukharouba
    "12106c81-96d1-439b-8c27-7556b3861f25": "FEMALE",  # Iline yaakoubi
    "54ef4994-6459-4831-a236-7e65c7ac9029": "FEMALE",  # Iline ayari
    "e992a25d-2b91-42f3-97ed-8ac1e904c7cb": "MALE",  # Jad Manai
    "a166f5b1-9bc0-45bc-b61b-8aa243264550": "MALE",  # Jed Rezgui
    "7c7714fc-5a3d-4d89-9b41-9a224bcd5885": "MALE",  # Jed Boushih
    "7b487aaf-74b9-4949-90e9-0ea2b6949414": "MALE",  # Jed Ghrairi
    "98d4f613-4172-464a-905b-196100ba63ad": "FEMALE",  # Joud Chamekhi
    "f5cf06ed-e301-499e-867f-342270e5b60c": "FEMALE",  # Kmar Amiri
    "d24d82c4-0283-431a-8d65-215d68f9990f": "FEMALE",  # Kmar Sayed
    "bc2ed149-d743-45e1-873e-944b285bac06": "FEMALE",  # Kenza Hakiri
    "e7ad223b-4864-46f2-a3df-90d4fd20e753": "FEMALE",  # Kenza robbena
    "08497525-334d-4dda-9d48-61b4bc4daded": "FEMALE",  # Kmar Mehiri
    "8a24c447-d459-4427-ba36-3adcc9663c3c": "FEMALE",  # Lina Krouna
    "1338ddeb-1b86-4cc9-a64d-6e02344d3799": "FEMALE",  # Linda Chebbi
    "ee241c08-0278-4c03-8bfa-81b2149f87b9": "FEMALE",  # Lilia Boukraa
    "9f22564e-7ada-4c57-88b1-6f1dbd93cf5a": "FEMALE",  # Lilia Maknassi
    "7ff1cfe1-f816-47b5-b0d2-8c2990e23ff4": "FEMALE",  # Mariem Ben Sassi
    "0604c327-4682-467c-a4a5-b2f7b95c84cc": "FEMALE",  # Maya Radhouani
    "ad9b26d2-aea0-4c3e-b8bd-54e7463af6dc": "FEMALE",  # Mayar Bali
    "0faa513c-f2e6-4c45-9c84-e7de17788048": "FEMALE",  # Mayar Ben Hamouda
    "999ba6dd-e046-4a3b-bfb1-36466cce4da8": "MALE",  # Med Wassim Lengliz
    "8db24add-cc8f-4f7d-b372-a581cdb664a7": "MALE",  # Med Feres Jerbi
    "8a654d93-5a19-448d-8a56-72ab477fddcc": "MALE",  # Med Iyed Naes
    "9e7710b7-ac25-4263-87ad-355c4fb9969d": "MALE",  # Med Taha Ben Mrad
    "774944c3-87e5-429e-844c-c272fb6cce61": "MALE",  # Med Amine Labidi
    "b406a398-43b9-4200-8789-fb05bef7e0cb": "MALE",  # Med Zribi
    "4a6c5284-9872-4213-8a9c-a68fbda55c8f": "MALE",  # Med Idriss Berkhais
    "d6e55d0e-3f40-4bc3-8597-b15ad2d44c7e": "MALE",  # Med Adem Chebbi
    "fb071a28-e004-4d67-9e54-98c656105b1f": "MALE",  # Med Iyed Lengliz
    "1518f82b-8552-4601-92d7-29cb3afb5f97": "FEMALE",  # Miral Trabelsi
    "96e52265-2501-40a4-ae09-cc2a89177371": "FEMALE",  # Mirana Aline Kabaoui
    "92ee2870-ff4b-4773-a1d4-8bf67ac57dbd": "MALE",  # Mondher Mbarek
    "2fa7356e-86fc-4570-8e1d-c71166cdb337": "FEMALE",  # Mariem Fatnassi
    "41245e6f-288e-4318-95ac-cceeec85b9c3": "MALE",  # Med bara fadeoui
    "bba9e6e5-8f33-4d4a-aa39-bdd0ccbbe6d8": "MALE",  # Med karim sliti
    "5f1cd157-1ab7-4a03-9bca-b8e6883f3278": "MALE",  # Mouhamed Kaouach
    "4aff2a6b-fa69-4266-9862-56b5aedc87bf": "FEMALE",  # Nadine Mejri
    "2800d455-6c22-43a5-935f-b924097c79d0": "FEMALE",  # Nadine Yahia
    "43e37aa7-0623-46b8-94c5-cd2932f322c9": "FEMALE",  # Nermine Mneri
    "acefe290-3d53-4265-88ee-0a87f0a89854": "MALE",  # Nijed Abidi
    "8084ba25-b3bb-4a88-a823-fef43ac7626d": "FEMALE",  # Noujoud Abidi
    "32f833c7-3e66-49a8-a909-5d74bd2af5f3": "FEMALE",  # Nour Mansour
    "db86ff0f-c963-48c9-819d-38d20b0992c8": "FEMALE",  # Nadine yaakoubi
    "9ddf71bf-5fe9-4cdf-b7a2-3bd2331bd917": "FEMALE",  # Nouran montassar
    "5b1f5c37-1ee1-4bea-8a71-969a6ea90a7c": "MALE",  # Oubaid Allah Ben Bousseha
    "2dd82f04-5d57-40f5-a569-c77f99aeaea7": "FEMALE",  # Roukaya Massmoudi
    "36e48bc6-9a7e-40c2-aa53-34c07534a004": "MALE",  # Salim Gafsi
    "59475c32-ab5d-4169-88da-8c094cbcbfe3": "FEMALE",  # Salima Larguech
    "3fd4e1b2-ddec-47d3-b0fe-0906c86bca33": "FEMALE",  # Sarra Bouziri
    "76a2190b-10b4-4427-a501-bb20922f6758": "MALE",  # Salim souki
    "5e635041-16cd-4f32-9593-67416f528638": "FEMALE",  # Salima Zribi
    "cb32eb40-0b0e-407f-ada1-b543b038ffb9": "FEMALE",  # Sarrah Ben Azzouz
    "c5fefcd4-9719-4da3-8842-2eea0e34ada8": "MALE",  # Skander mejri
    "12c4aaa3-fb96-4374-a002-5c4dc3290d48": "FEMALE",  # Syrine khemiri
    "de82c3ae-d363-420f-bf8e-117d4838455f": "MALE",  # Taha Yassine Haj Ammar
    "cb48c7a6-86c4-4518-87b5-afd3a14a212d": "MALE",  # Taha Bali
    "f99d09b3-dab1-4999-acb1-d59caef6b210": "MALE",  # Taki Allah Saffar
    "a4407414-9a5e-4733-9ab4-cfd3ccfbfb5e": "MALE",  # Yahia Souisi
    "fa239b83-baa2-4738-bc00-308cfb3701ec": "FEMALE",  # Yasmine Jouini
    "50dad73e-44ce-453b-b237-a7a76d5502bf": "MALE",  # Youssef Ghanem
    "7a9c75cc-a551-4c0d-9a09-72dcd588be8c": "MALE",  # Youssef Bougatef
    "20d0a512-835b-470a-ba86-5390285464df": "MALE",  # Youssef touati
    "15625c61-277e-422e-a516-55524c3467f7": "MALE",  # Youssef bouassida
    "d9b8f3ac-79d9-42d6-a5c9-add49ecdabbb": "MALE",  # Youssef Labress
    "74b804ea-37ed-4459-9803-c160d55578f9": "MALE",  # Zakaria Saidi
    "71dcc332-3524-4b5b-acb2-100d2e343f32": "MALE",  # Zayen Hmidi
}


def main():
    conn = psycopg2.connect(CONN_STRING)
    cur = conn.cursor()

    cur.execute(
        "UPDATE players SET gender='MALE' "
        "WHERE current_group_id = (SELECT id FROM groups WHERE name='Garcons - Coach Fathi');"
    )
    print("Boys group updated:", cur.rowcount)

    cur.execute(
        "UPDATE players SET gender='FEMALE' "
        "WHERE current_group_id IN (SELECT id FROM groups WHERE name IN "
        "('Grandes Filles - Mlle Amira','Grandes Filles - Mme Amira'));"
    )
    print("Girls groups updated:", cur.rowcount)

    for player_id, gender in GENDER_MAP.items():
        cur.execute("UPDATE players SET gender=%s WHERE id=%s;", (gender, player_id))
    print("Name-inferred rows attempted:", len(GENDER_MAP))

    conn.commit()

    cur.execute("SELECT gender, COUNT(*) FROM players GROUP BY gender;")
    print("Final breakdown:", cur.fetchall())
    cur.execute("SELECT COUNT(*) FROM players WHERE gender IS NULL;")
    print("Still null:", cur.fetchone())
    conn.close()


if __name__ == "__main__":
    main()
