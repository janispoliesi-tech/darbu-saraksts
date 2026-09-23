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
- **Kompakts saraksts.** Rindā redzams tikai darba nosaukums (treknrakstā) — datums un
  prioritātes uzraksts ir paslēpti. **Prioritāte redzama ar krāsainu svītru rindas malā:**
  sarkans = augsta, dzeltens = vidēja, pelēks = zema (iestatījumos to var nomainīt uz
  punktu, fonu vai ķeksīša krāsu). Katrā rindā ir zīmuļa (rediģēt) un miskastes (dzēst)
  poga.
- **Jauna darba pievienošana ir ekrāna apakšā** — šaura josla ar vienu lauku.
  Ieraksti un nospied Enter. Poga ar trim punktiem atver logu ar piezīmi,
  termiņu, prioritāti un sadaļu.
- **Sadaļas augšpusē kā cilnes** — horizontāli ritināmas ar pirkstu vai peli.
  Cilņu galā poga „+ Sadaļa“: nosaukums, krāsa un ikona (61 ikona: māja, mūris,
  koks, traktors, āmurs, ķivere, kāpnes, lietus, uguns u.c.).
- **Izpildītie darbi automātiski aizslīd saraksta apakšā un paliek nosvītroti.**
  Tos var atzīmēt atpakaļ, izdzēst pa vienam vai notīrīt visus uzreiz.
- **Iestatījumu lapa** (zobrata ikona augšā pa labi) — skat. zemāk.
- **Pieteikšanās ar e-pastu un paroli.** Reģistrējoties parole jāievada divreiz, un pie
  katra paroles lauka ir actiņa, ar ko ierakstīto var apskatīt. Pieteikšanās ekrānā ir
  saite „Aizmirsi paroli?“ — tā atsūta e-pastu, pēc kura atvēršanas aplikācija piedāvā
  ievadīt jaunu paroli.
- **Lietotāja vārds.** Katrs cilvēks norāda savu vārdu, un pārējie redz tieši to,
  nevis e-pastu.
- **Kopīgošana pa sadaļām.** Pie sadaļas nosaukuma ir poga, kas rāda, vai tā ir
  privāta vai kopīgota. Īpašnieks tur uzaicina cilvēkus pēc e-pasta — **uzreiz uz
  vienu vai vairākām sadaļām** —, redz visus dalībniekus un **var tos izņemt**.
  Uzaicinātais var pats pamest sadaļu.
- **Izmaiņas parādās uzreiz** visiem, kas atvēruši to pašu sadaļu (Supabase Realtime).

### Iestatījumu lapa

| Sadaļa | Ko var mainīt |
|---|---|
| **Profils** | Lietotāja vārds, e-pasts, iziešana no konta |
| **Stili** | Dzīvs priekšskatījums ar parauga darbiem, 5 gatavie stili (Noklusētais, Minimālisms, Mīksts, Liels un skaidrs, Blīvs), poga „Atjaunot noklusējumu“ |
| **Krāsas** | **Tēma** (sistēmas / gaiša / tumša / melna), **pamatkrāsa** (16 krāsas + sava krāsa), fona tonis (neitrāls / silts / vēss / pamatkrāsas), kontrasts (parasts / augsts), sadaļas krāsa kā pamatkrāsa |
| **Teksts** | **Fonts** (7 fonti), **teksta izmērs** (85–130 %), darbu teksta biezums (parasts / vidējs / pustrekns / trekns) |
| **Izkārtojums** | Stūru noapaļojums (taisni / nedaudz / vidēji / apaļi), rindu blīvums (4 pakāpes), satura platums, saraksta izskats (bloks / kartītes / bez rāmja), atdalītāji (līnijas / svītrains / nav), ķeksīša forma, augšējās joslas stils, cilņu stils, ikonas cilnēs, animācijas |
| **Darbi** | Kārtošana (prioritāte / termiņš / secība / jaunākie / A–Z), termiņi sarakstā, datuma formāts, prioritātes attēlojums, piezīmes (ikona / 1 rinda / 2 rindas / visu), pogas rindā (vienmēr / zem peles / nerādīt), izpildītie (rādīt, sakļauti, nosvītroti vai blāvi), skaitlis uz cilnēm |
| **Uzvedība** | Jauna darba noklusētā prioritāte, apstiprinājums pirms dzēšanas, ko rādīt atverot lietotni (sākuma lapu vai pēdējo sarakstu) |
| **Saraksts** | Nosaukums, visas sadaļas ar norādi „privāta“ vai „kopīgota“ — uzklikšķinot atveras dalībnieku pārvaldība; saraksta dzēšana vai pamešana |

Iestatījumu lapas augšā ir cilnes, ar kurām var uzreiz pāriet uz vajadzīgo sadaļu.

### Katram savs izskats

**Pamatkrāsa** nomaina visu izcelto elementu krāsu: pogas, ķeksīšus, slēdžus un
pievienošanas pogu. Var izvēlēties no 16 krāsām vai ar pēdējo pogu uzlikt jebkuru savu
krāsu. Tumšajam režīmam katrai gatavajai krāsai ir sava, gaišāka versija, lai teksts uz
tās paliek salasāms; savai krāsai teksta krāsu (balta vai tumša) aplikācija izvēlas pati.
Tās pašas 16 krāsas pieejamas arī sadaļām.

**Teksta izmērs** ar slīdni palielina vai samazina darbu nosaukumus, piezīmes, sadaļu
virsrakstus un cilnes (85–130 %), neizjaucot izkārtojumu.

**Fonti** (Inter, Roboto, Nunito, Montserrat, Source Serif, JetBrains Mono) ir iekļauti
pašā aplikācijā, tāpēc izskatās vienādi visās ierīcēs un neielādējas no ārējiem
serveriem. Pārlūks lejupielādē tikai to fontu, kas izvēlēts.

**Gatavie stili** vienā klikšķī nomaina formu, blīvumu un teksta izskatu, bet
neaiztiek krāsas. Pēc tam jebkuru iestatījumu var mainīt atsevišķi.

Izskats glabājas **kontā**, nevis ierīcē — telefonā, planšetē un datorā tas izskatās
vienādi, un pēc pieteikšanās jaunā ierīcē viss atgriežas pats. Katram lietotājam ir
savs: kopīgotā sadaļā divi cilvēki var redzēt vienu un to pašu sarakstu pilnīgi
dažādās krāsās. Izvēle darbojas uzreiz, bez lapas pārlādes.

> Ja vēlies šo iespēju, **`supabase/schema.sql` jāpalaiž atkārtoti** — tas pievieno
> profilam lauku, kurā izskats glabājas. Bez tā viss strādā, tikai izskats paliek
> konkrētajā ierīcē.

---

## 1. solis — Supabase

1. Izveido kontu: <https://supabase.com> → **New project**.
   - *Name:* `darbu-saraksts`
   - *Database Password:* izdomā un **saglabā to** (vēlāk to nevar apskatīt).
   - *Region:* `Central EU (Frankfurt)` — tuvākais Latvijai.
2. Kad projekts izveidots (~2 min), atver **SQL Editor → New query**.
3. Atver šī projekta failu **`supabase/schema.sql`**, nokopē **visu saturu**, ielīmē
   un nospied **Run**.

   Apakšā parādīsies apstiprinājuma tabula:

   | parbaude | rezultats |
   |---|---|
   | Shēmas versija | 2026-09-22 (sadaļu izveide salabota) |
   | Sadaļu izveides labojums | ir |
   | Izskata glabāšana kontā | ir |
   | Kopīgošana pa sadaļām | ir |
   | Tavi saraksti / sadaļas / darbi | *skaits* |

   > **Ja šī tabula neparādās, fails nav izpildījies līdz galam** — parasti tāpēc, ka
   > ielīmēta tikai daļa. Iezīmē visu failu (Ctrl+A tekstā) un ielīmē vēlreiz.
   > Ja kāda rinda rāda „TRŪKST“, palaid failu vēlreiz.
   >
   > Failu var palaist cik reizes vien vajag — tas neko nedzēš un atjaunina vecāku versiju.
   > Skaitļi apakšējās rindās rāda, ka tavi dati ir vietā.

4. Atver **Project Settings (zobrats) → API** un saglabā divas **dažādas** vērtības:

   | Mainīgais | Ko tur likt | Kā izskatās |
   |---|---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | **Project URL** | `https://xxxxxxxxxxxx.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Publishable** vai **anon public** atslēga | `sb_publishable_…` vai `eyJhbGciOi…` |

   > Tā ir **adrese** un **atslēga** — divas atšķirīgas lietas. Nesajauc tās vietām:
   > adresei jāsākas ar `https://` un jābeidzas ar `.supabase.co`.
   >
   > Der gan jaunā „Publishable key“, gan vecākā „anon public“ atslēga (pēdējā atrodama
   > sadaļā *Legacy API keys*). Abas ir publiskas un drošas pārlūkā — datus sargā
   > datubāzes RLS politikas. **`service_role` un `secret` atslēgas neizmanto nekur.**

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

   > ⚠️ **Nosaukumam obligāti jāsākas ar `NEXT_PUBLIC_`.** Next.js apzināti nenodod
   > pārlūkam mainīgos bez šī priekšvārda — tā sargā slepenās atslēgas. Ja nosaukums būs
   > `SUPABASE_URL`, aplikācija to neredzēs un rādīs „Nav ievadīti Supabase dati“.

5. **Deploy**. Pēc minūtes saņemsi adresi, piem. `https://darbu-saraksts.vercel.app`.

Turpmāk katrs `git push` uz `main` automātiski atjaunos vietni.

---

## 4. solis — pēdējie Supabase iestatījumi

Lai e-pasta apstiprināšanas un paroles atjaunošanas saites vestu uz tavu vietni, nevis uz `localhost`:

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

Kopīgošana notiek **pa sadaļām**, nevis visam sarakstam. Vienā reizē cilvēku var
uzaicināt uz vienu vai vairākām sadaļām.

1. Atver sadaļu un spied pogu pie tās nosaukuma — tā rāda **„Privāta“** vai
   dalībnieku skaitu. (To pašu var izdarīt Iestatījumos → Saraksts.)
2. Ieraksti e-pastu, zem tā atzīmē sadaļas, uz kurām uzaicināt (atvērtā sadaļa jau ir
   atzīmēta; „Atzīmēt visas“ atzīmē visas saraksta sadaļas), un spied **„Uzaicināt“**.
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
│   │   ├── PasswordInput.tsx  ← paroles lauks ar actiņu
│   │   ├── NewPasswordScreen.tsx ← jaunas paroles ievade pēc atjaunošanas saites
│   │   ├── AppShell.tsx       ← pārslēdz sākuma lapu / sarakstu / iestatījumus
│   │   ├── HomePage.tsx       ← sākuma lapa ar visiem sarakstiem
│   │   ├── BoardView.tsx      ← viens saraksts: cilnes, darbi, visa loģika
│   │   ├── SettingsPage.tsx   ← iestatījumi (profils, stili, izskats, uzvedība, sadaļu kopīgošana)
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
│       ├── colors.ts          ← krāsu komplekts (pamatkrāsām un sadaļām)
│       ├── icons.ts           ← ikonu komplekts
│       ├── settings.ts        ← lietotāja iestatījumi, gatavie stili, fonti
│       ├── errors.ts          ← kļūdu paskaidrojumi latviski
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

**Krāsas un izskats** — `src/app/globals.css`, mainīgo sadaļa `:root` (gaišajam režīmam),
`:root[data-theme='dark']` (tumšajam) un `:root[data-theme='black']` (melnajam).

**Krāsu komplekts** — `globals.css`, mainīgie `--ac-teal … --ac-ink` (abos režīmos
atsevišķi) un saraksts `COLORS` failā `src/lib/colors.ts`. Lai pievienotu jaunu krāsu,
jāpapildina abas vietas un jāpieliek rindas `:root[data-accent='…']` un
`[data-color='…']`.

**Stūru noapaļojums** — `globals.css`, mainīgie `--r-xs`, `--r-sm`, `--r`, `--r-lg`,
`--r-pill` un to vērtības rindās `:root[data-radius='…']`.

**Teksta izmēra robežas** — `src/lib/settings.ts`, `FONT_SCALE`.

**Fonti** — `src/lib/settings.ts`, saraksts `FONTS`, un importi failā
`src/app/layout.tsx`.

**Gatavie stili** — `src/lib/settings.ts`, saraksts `PRESETS`.

**Prioritātes krāsas** — `globals.css`, mainīgie `--danger` (augsta), `--warn` (vidēja)
un `--calm` (zema).

**Noklusētie iestatījumi** jauniem lietotājiem — `src/lib/settings.ts`,
objekts `DEFAULT_SETTINGS`.

---

## Ja kaut kas nestrādā

> **Svarīgākais par Vercel:** `NEXT_PUBLIC_…` vērtības tiek iebūvētas lapā **būvēšanas
> brīdī**. Tāpēc pēc katras to pievienošanas vai labošanas obligāti jāveic
> **Deployments → pēdējais izvietojums → ⋯ → Redeploy**. Bez tā lapa turpina strādāt
> ar vecajām (vai tukšajām) vērtībām.

| Problēma | Risinājums |
|---|---|
| Lapa paziņo, kas nav kārtībā ar Supabase datiem | Aplikācija pati pasaka konkrēto kļūdu un kā to salabot — izpildi, kas rakstīts, un veic Redeploy. |
| „Application error: a client-side exception has occurred“ | Tā rāda vecākas versijas, kad savienojuma dati bija nepareizi. Atjauno projekta failus ar jaunāko versiju — tad lapas vietā parādās paskaidrojums latviski. |
| „Nav ievadīti Supabase dati“, lai gan Vercel mainīgie ir pievienoti | Pārbaudi nosaukumus — tiem jāsākas ar `NEXT_PUBLIC_`. `SUPABASE_URL` nedarbosies, vajag `NEXT_PUBLIC_SUPABASE_URL`. |
| Pievienoju mainīgos, bet nekas nemainās | Nav veikts **Redeploy** (skat. piezīmi augstāk). |
| Vērtībā nejauši iekļuvis kas lieks | Adrese jāieraksta tikai kā `https://xxxx.supabase.co` — bez pēdiņām, bez mainīgā nosaukuma priekšā un bez `/dashboard/...` daļas. Atstarpes, pēdiņas un trūkstošo `https://` aplikācija salabo pati. |
| Adrese un atslēga sajauktas vietām | URL mainīgajā jābūt `https://…supabase.co`, atslēgas mainīgajā — `sb_publishable_…` vai `eyJ…`. Aplikācija to pamana un pasaka. |
| „Invalid path specified in request URL“ | Adresei ir kaut kas klāt aiz domēna (piem., `/rest/v1`). Jābūt tikai `https://xxxx.supabase.co`. Jaunākā versija lieko noņem pati. |
| „Invalid API key“ | Atslēga nav no tā paša projekta, kura adrese norādīta, vai ir nokopēta nepilnīgi. |
| Reģistrējos, bet nekas nenotiek | Ieslēgta e-pasta apstiprināšana — pārbaudi pastu (arī mēstules). Vai izslēdz to: Supabase → Authentication → Providers → Email → *Confirm email*. |
| Apstiprinājuma saite ved uz `localhost` | Supabase → Authentication → **URL Configuration** → uzstādi Site URL uz Vercel adresi (4. solis). |
| Kļūda par `relation does not exist` | Nav palaists `supabase/schema.sql`. Palaid to SQL Editor. |
| „Datubāze neatļāva šo darbību“, veidojot jaunu sadaļu | Palaid **jaunāko** `supabase/schema.sql` (2026-09-22 vai jaunāku) — vecākās versijās sadaļu redzamības noteikums bija tāds, ka tikko izveidota sadaļa pati sev nebija redzama, un datubāze izveidi atteica. Pārliecinies, ka apstiprinājuma tabulā rindā „Sadaļu izveides labojums“ ir „ir“. |
| Izvēlētā krāsa vai teksta izmērs neseko uz citu ierīci | Tas pats: `supabase/schema.sql` jāpalaiž atkārtoti, lai profilam pievienotos lauks `settings`. |
| Uzaicinātais neredz sadaļu | Viņam jāreģistrējas **ar tieši to pašu e-pasta adresi**, uz kuru sūtīts uzaicinājums. Pēc pieteikšanās saraksts parādās viņa sākuma lapā zem „Kopīgots ar mani“. |
| Uzaicinātais neredz visas sadaļas | Tā arī paredzēts — viņš redz tikai tās, uz kurām ir uzaicināts. Uzaicinot atzīmē visas vajadzīgās sadaļas (vai spied „Atzīmēt visas“). |
| Izmaiņas neparādās otram lietotājam | Pārlādē lapu. Realtime tiek pieslēgts automātiski `schema.sql` beigās. |

---

Kods ir latviski komentēts. Sāc ar `src/components/BoardView.tsx`.
