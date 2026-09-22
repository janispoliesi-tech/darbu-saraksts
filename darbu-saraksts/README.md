# Darbu saraksts

Darāmo darbu saraksts ar sadaļām — **Darbi mājās**, **Būvniecība**, **Teritorija** un
jebkurām citām, ko izveido pats. Viena adrese telefonam, planšetei un datoram.

**Next.js (React) → Vercel · Supabase (datubāze + reģistrēšanās)**

---

## Saturs

1. [Kā tas ir sakārtots](#kā-tas-ir-sakārtots)
2. [Ko aplikācija prot](#ko-aplikācija-prot)
3. [1. solis — Supabase](#1-solis--supabase)
4. [2. solis — GitHub](#2-solis--github)
5. [3. solis — Vercel](#3-solis--vercel)
6. [4. solis — pēdējie Supabase iestatījumi](#4-solis--pēdējie-supabase-iestatījumi)
7. [Izstrāde uz sava datora](#izstrāde-uz-sava-datora)
8. [Kā darbojas kopīgošana](#kā-darbojas-kopīgošana)
9. [Mapju struktūra](#mapju-struktūra)
10. [Pielāgošana](#pielāgošana)
11. [Ja kaut kas nestrādā](#ja-kaut-kas-nestrādā)

---

## Kā tas ir sakārtots

```
Sākuma lapa  →  Saraksts  →  Sadaļa  →  Darbi
                (Mans saraksts)  (Būvniecība)
```

- **Sākuma lapa** rāda visus tavus sarakstus un tos, ko citi kopīgojuši ar tevi.
- **Cilvēkus uzaicina uz KONKRĒTU SADAĻU, nevis uz visu sarakstu.**
  Sadaļa, uz kuru neviens nav uzaicināts, ir **privāta** — to redz tikai tu.
  Tā vienā sarakstā var būt gan kopīgota „Būvniecība“, gan pilnīgi privāti
  „Darbi mājās“.

---

## Ko aplikācija prot

- **Sākuma lapa** ar visiem sarakstiem — tur arī pārslēdzas starp tiem un veido jaunus.
- **Kompakts saraksts.** Rindā redzams tikai darba nosaukums — datums un prioritātes
  uzraksts ir paslēpti. **Prioritāte redzama ar krāsainu svītru rindas malā:**
  sarkans = augsta, dzeltens = vidēja, pelēks = zema. Katrā rindā ir zīmuļa
  (rediģēt) un miskastes (dzēst) poga.
- **Jauna darba pievienošana ir ekrāna apakšā** — šaura josla ar vienu lauku.
  Ieraksti un nospied Enter. Poga ar trim punktiem atver logu ar piezīmi,
  termiņu, prioritāti un sadaļu.
- **Sadaļas augšpusē kā cilnes** — horizontāli ritināmas ar pirkstu vai peli.
  Cilņu galā poga „+ Sadaļa“: nosaukums, krāsa un ikona (61 ikona: māja, mūris,
  koks, traktors, āmurs, ķivere, kāpnes, lietus, uguns u.c.).
- **Izpildītie darbi automātiski aizslīd saraksta apakšā un paliek nosvītroti.**
  Tos var atzīmēt atpakaļ, izdzēst pa vienam vai notīrīt visus uzreiz.
- **Iestatījumu lapa** (zobrata ikona augšā pa labi) — skat. zemāk.
- **Lietotāja vārds.** Katrs cilvēks norāda savu vārdu, un pārējie redz tieši to,
  nevis e-pastu.
- **Kopīgošana pa sadaļām.** Pie sadaļas nosaukuma ir poga, kas rāda, vai tā ir
  privāta vai kopīgota. Īpašnieks tur uzaicina cilvēkus pēc e-pasta, redz visus
  dalībniekus un **var tos izņemt**. Uzaicinātais var pats pamest sadaļu.
- **Izmaiņas parādās uzreiz** visiem, kas atvēruši to pašu sadaļu (Supabase Realtime).

### Iestatījumu lapa

| Sadaļa | Ko var mainīt |
|---|---|
| **Profils** | Lietotāja vārds, e-pasts, iziešana no konta |
| **Izskats** | Tēma (sistēmas / gaišs / tumšs), rindu blīvums, vai rādīt termiņus (nerādīt / tikai nokavētos / vienmēr), prioritātes krāsa, piezīmes, izpildīto sadaļa, skaitlis uz cilnēm, kārtošana |
| **Saraksts** | Nosaukums, visas sadaļas ar norādi „privāta“ vai „kopīgota“ — uzklikšķinot atveras dalībnieku pārvaldība; saraksta dzēšana vai pamešana |

Izskata iestatījumi glabājas konkrētajā ierīcē, tāpēc telefonā un datorā tie var būt
atšķirīgi. Vārds un saraksti ir piesaistīti kontam.

---

## 1. solis — Supabase

1. Izveido kontu: <https://supabase.com> → **New project**.
   - *Name:* `darbu-saraksts`
   - *Database Password:* izdomā un **saglabā to** (vēlāk to nevar apskatīt).
   - *Region:* `Central EU (Frankfurt)` — tuvākais Latvijai.
2. Kad projekts izveidots (~2 min), atver **SQL Editor → New query**.
3. Atver šī projekta failu **`supabase/schema.sql`**, nokopē **visu saturu**, ielīmē
   un nospied **Run**. Ja apakšā parādās „Success“ — viss kārtībā.

   > Šo failu var palaist arī atkārtoti — tas neko nedzēš un vienlaikus atjaunina
   > vecāku versiju.

4. Atver **Project Settings (zobrats) → API** un saglabā divas vērtības:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** atslēga → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

   > `anon` atslēga ir publiska un droša izmantošanai pārlūkā — datus sargā
   > datubāzes RLS politikas, kas jau ir shēmā. **`service_role` atslēgu neizmanto nekur.**

5. **Authentication → Providers → Email** — pārliecinies, ka tas ir ieslēgts.
   - Ja gribi izmēģināt ātri, tur vari **izslēgt „Confirm email“** — tad reģistrācija
     notiek uzreiz, bez e-pasta apstiprināšanas.
6. *(Neobligāti)* **Google pieteikšanās:** Authentication → Providers → **Google** →
   ieslēdz un ievadi Google Cloud Client ID/Secret. Pēc tam vides mainīgajos uzstādi
   `NEXT_PUBLIC_ENABLE_GOOGLE=true` — parādīsies poga „Turpināt ar Google“.

---

## 2. solis — GitHub

Projekta mapē:

```bash
git init
git add .
git commit -m "Darbu saraksts"
git branch -M main
git remote add origin https://github.com/TAVS-LIETOTAJS/darbu-saraksts.git
git push -u origin main
```

> `.gitignore` jau nodrošina, ka uz GitHub **netiek** augšupielādēts `node_modules/`,
> `.next/` un `.env.local` (tavas atslēgas!).

---

## 3. solis — Vercel

1. <https://vercel.com> → pieraksties ar GitHub kontu.
2. **Add New → Project → Import** savu `darbu-saraksts` repozitoriju.
3. Framework Preset: **Next.js** — atpazīs pats. Build komandas mainīt nevajag.
4. Atver **Environment Variables** un pievieno:

   | Nosaukums | Vērtība |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxxxxx.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOi...` |
   | `NEXT_PUBLIC_ENABLE_GOOGLE` | `true` *(tikai ja ieslēdzi Google)* |

5. **Deploy**. Pēc minūtes saņemsi adresi, piem. `https://darbu-saraksts.vercel.app`.

Turpmāk katrs `git push` uz `main` automātiski atjaunos vietni.

---

## 4. solis — pēdējie Supabase iestatījumi

Lai e-pasta apstiprināšana un pieteikšanās saites vestu uz tavu vietni, nevis uz `localhost`:

**Supabase → Authentication → URL Configuration**

- **Site URL:** `https://darbu-saraksts.vercel.app`
- **Redirect URLs:** pievieno abus:
  - `https://darbu-saraksts.vercel.app/**`
  - `http://localhost:3000/**`

Saglabā. Tagad viss strādā gan uz Vercel, gan uz tava datora.

---

## Izstrāde uz sava datora

Vajadzīgs **Node.js 18.18 vai jaunāks** (<https://nodejs.org>).

```bash
npm install

cp .env.example .env.local      # Windows: copy .env.example .env.local
# ieraksti .env.local savas Supabase vērtības

npm run dev                     # http://localhost:3000
```

| Komanda | Ko dara |
|---|---|
| `npm run dev` | Izstrādes serveris ar automātisku pārlādi |
| `npm run build` | Pārbauda tipus un uzbūvē tāpat kā Vercel |
| `npm start` | Palaiž uzbūvēto versiju |

---

## Kā darbojas kopīgošana

Kopīgošana notiek **pa vienai sadaļai**, nevis visam sarakstam.

1. Atver sadaļu un spied pogu pie tās nosaukuma — tā rāda **„Privāta“** vai
   dalībnieku skaitu. (To pašu var izdarīt Iestatījumos → Saraksts.)
2. Ieraksti e-pastu un spied **„Uzaicināt“**.
   - Ja cilvēks **jau ir reģistrējies** — viņš tiek pievienots uzreiz.
   - Ja **vēl nav** — uzaicinājums gaida. Tiklīdz viņš reģistrēsies **ar tieši to pašu
     e-pasta adresi**, sadaļa viņam parādīsies automātiski.
3. Uzaicinātais savā sākuma lapā redz tavu sarakstu sadaļā „Kopīgots ar mani“,
   bet, to atverot, **redz tikai tās sadaļas, uz kurām ir uzaicināts**. Pārējās
   viņam neeksistē.
4. Tajās sadaļās viņš var pievienot, labot un dzēst darbus, bet **nevar** veidot jaunas
   sadaļas, uzaicināt citus vai dzēst sarakstu. Viņš var pats pamest sadaļu vai visu sarakstu.
5. Īpašnieks jebkurā brīdī ar miskastes pogu **izņem cilvēku no sadaļas** — pieeja
   pazūd uzreiz.
6. Vārdu katrs maina pats **Iestatījumos → Profils**; izmaiņas parādās visur, kur viņš ir.

> Aplikācija pati **nesūta** uzaicinājuma e-pastu — par to jāpaziņo pašam
> (piem., ar ziņu: „reģistrējies šeit ar savu Gmail adresi“). Tas ir apzināti: tā nav
> nepieciešams konfigurēt e-pasta sūtītāju. Ja vēlāk gribi automātiskas vēstules,
> Supabase sadaļā **Authentication → Users → Invite user** var nosūtīt uzaicinājumu
> manuāli, vai arī pievienot Edge Function ar savu e-pasta pakalpojumu.

---

## Mapju struktūra

```
darbu-saraksts/
├── src/
│   ├── app/
│   │   ├── globals.css        ← viss dizains (krāsas, izkārtojums, tumšais režīms)
│   │   ├── icon.svg           ← ikona pārlūka cilnē
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── AppRoot.tsx        ← izvēlas: pieteikšanās vai aplikācija
│   │   ├── AuthScreen.tsx     ← reģistrēšanās / pieteikšanās
│   │   ├── AppShell.tsx       ← pārslēdz sākuma lapu / sarakstu / iestatījumus
│   │   ├── HomePage.tsx       ← sākuma lapa ar visiem sarakstiem
│   │   ├── BoardView.tsx      ← viens saraksts: cilnes, darbi, visa loģika
│   │   ├── SettingsPage.tsx   ← iestatījumi (profils, izskats, sadaļu kopīgošana)
│   │   ├── ShareDialog.tsx    ← kas redz konkrēto sadaļu + uzaicināšana
│   │   ├── SectionTabs.tsx    ← cilnes augšā + „+ Sadaļa“
│   │   ├── QuickAdd.tsx       ← pievienošanas josla ekrāna apakšā
│   │   ├── TaskList.tsx       ← saraksts + izpildīto daļa apakšā
│   │   ├── TaskRow.tsx        ← viena darba rinda
│   │   ├── TaskDialog.tsx     ← darba izveide un rediģēšana
│   │   ├── SectionDialog.tsx  ← sadaļas izveide/rediģēšana
│   │   ├── IconPicker.tsx     ← ikonu un krāsu izvēle
│   │   ├── Modal.tsx
│   │   └── Icon.tsx
│   └── lib/
│       ├── icons.ts           ← ikonu komplekts un krāsas
│       ├── settings.ts        ← lietotāja iestatījumi un tēma
│       ├── format.ts          ← datumi, kārtošana, dalībnieku vārdi
│       ├── auth.ts            ← droša iziešana no konta
│       ├── supabase.ts        ← savienojums ar Supabase
│       └── types.ts
├── supabase/
│   └── schema.sql             ← datubāzes shēma (jāpalaiž Supabase SQL Editor)
├── .env.example
├── next.config.mjs
├── package.json
└── tsconfig.json
```

---

## Pielāgošana

**Sākuma sadaļas** (ko saņem katrs jauns saraksts) — `supabase/schema.sql`, funkcijā
`create_board`:

```sql
(v_board, 'Darbi mājās', 'home',   'teal',   0),
(v_board, 'Būvniecība',  'bricks', 'amber',  1),
(v_board, 'Teritorija',  'tree',   'green',  2);
```

**Jauna ikona** — `src/lib/icons.ts`: pievieno rindu `ICONS` sarakstā (SVG saturs 24×24
rūtiņā) un ieraksti tās atslēgu kādā no `ICON_GROUPS` grupām.

**Krāsas un izskats** — `src/app/globals.css`, mainīgo sadaļa `:root` (gaišajam režīmam)
un `:root[data-theme='dark']` (tumšajam).

**Prioritātes krāsas** — `globals.css`, mainīgie `--danger` (augsta), `--warn` (vidēja)
un `--calm` (zema).

**Noklusētie iestatījumi** jauniem lietotājiem — `src/lib/settings.ts`,
objekts `DEFAULT_SETTINGS`.

---

## Ja kaut kas nestrādā

| Problēma | Risinājums |
|---|---|
| „Trūkst Supabase datu“ | Nav `.env.local` (lokāli) vai Environment Variables (Vercel). Pēc pievienošanas Vercel jāveic **Redeploy**. |
| Reģistrējos, bet nekas nenotiek | Ieslēgta e-pasta apstiprināšana — pārbaudi pastu (arī mēstules). Vai izslēdz to: Supabase → Authentication → Providers → Email → *Confirm email*. |
| Apstiprinājuma saite ved uz `localhost` | Supabase → Authentication → **URL Configuration** → uzstādi Site URL uz Vercel adresi (4. solis). |
| Kļūda par `relation does not exist` | Nav palaists `supabase/schema.sql`. Palaid to SQL Editor. |
| Uzaicinātais neredz sadaļu | Viņam jāreģistrējas **ar tieši to pašu e-pasta adresi**, uz kuru sūtīts uzaicinājums. Pēc pieteikšanās saraksts parādās viņa sākuma lapā zem „Kopīgots ar mani“. |
| Uzaicinātais neredz visas sadaļas | Tā arī paredzēts — viņš redz tikai tās, uz kurām ir uzaicināts. Katru sadaļu jākopīgo atsevišķi. |
| Izmaiņas neparādās otram lietotājam | Pārlādē lapu. Realtime tiek pieslēgts automātiski `schema.sql` beigās. |

---

Kods ir latviski komentēts. Sāc ar `src/components/BoardView.tsx`.
