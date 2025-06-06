# Oratorij Programerska - Zbirka Iger

Preprosta statična spletna stran za gostovanje in igranje HTML iger, zgrajena z minimalnimi orodji in zasnovana za letne posodobitve brez upravljanja odvisnosti.

## 🎮 Funkcionalnosti

- **Organizacija iger po letih** - Igre so organizirane po letih v mapah
- **Trije načini igranja** za vsako igro:
  - 🚀 Igraj v novem zavihku
  - 📺 Igraj v vdelani okvir
  - 💾 Prenesi datoteko igre
- **Odziven dizajn** - Deluje na namiznih in mobilnih napravah
- **Avtomatična objava** - GitHub Actions avtomatsko gradi in objavlja

## 📁 Struktura Projekta

```
.
├── igre/                    # Mapa iger
│   └── 2025/               # Mapa leta
│       ├── igra.html       # Datoteke iger
│       └── lacni shrak.html
├── index.html              # Glavna predloga
├── build.sh               # Skript za gradnjo
├── .github/
│   └── workflows/
│       └── deploy.yml     # GitHub Actions workflow
└── README.md
```

## 🚀 Hiter Začetek

### Dodajanje Novih Iger

1. Ustvari mapo leta v `igre/`, če še ne obstaja:
   ```bash
   mkdir -p igre/2025
   ```

2. Dodaj datoteke HTML iger v mapo leta:
   ```bash
   cp moja-super-igra.html igre/2025/
   ```

3. Potrdi in potisni - stran se bo avtomatično ponovno zgradila in objavila!

### Lokalni Razvoj

#### Generiraj statično stran:
```bash
./build.sh generate
```
To ustvari mapo `dist/` z zgrajeno stranjo.

#### Zaženi razvojni strežnik:
```bash
./build.sh run
```
To generira stran in zažene lokalni strežnik na `http://localhost:8080`.

## 🔧 Kako Deluje

### Proces Gradnje

1. **Skeniranje**: Skript `build.sh` skenira strukturo mape `igre/`
2. **Generiranje Podatkov**: Ustvari JavaScript objekt z vsemi razpoložljivimi igrami
3. **Hidracija Predloge**: Zamenja nadomestno besedilo v `index.html` s podatki iger
4. **Kopiranje Datotek**: Kopira vse datoteke iger v izhodno mapo

### Sistem Predlog

Datoteka `index.html` vsebuje nadomestno besedilo:
```javascript
// GAMES_DATA_PLACEHOLDER - To bo zamenjal shell skript
const GAMES_DATA = {};
```

Skript za gradnjo to zamenja z dejanskimi podatki iger:
```javascript
const GAMES_DATA = {
  "2025": [
    {"name": "igra", "path": "igre/2025/igra.html"},
    {"name": "lacni shrak", "path": "igre/2025/lacni shrak.html"}
  ]
};
```

## 📦 Objava

### GitHub Pages (Priporočeno)

Projekt vključuje GitHub Actions workflow, ki:

1. **Se sproži** ob potiskih v main/master vejo, ko se spremenijo igre ali datoteke predlog
2. **Zgradi** statično stran z uporabo shell skripta
3. **Objavi** na GitHub Pages avtomatično

Za omogočitev:
1. Pojdi v nastavitve svojega repozitorija
2. Navigiraj do razdelka Pages
3. Nastavi vir na "GitHub Actions"
4. Potisni spremembe za sprožitev objave

### Ročna Objava


Generiraj stran in naloži mapo `dist/` na katero koli statično gostovalno storitev:

```bash
./build.sh generate
# Naloži vsebino mape dist/ na svojega ponudnika gostovanja
```

## 🎯 Zahteve za Igre

Igre morajo biti samostojne HTML datoteke, ki lahko delujejo neodvisno. Lahko vključujejo:
- Vdelan CSS in JavaScript
- Base64-kodirane resurse
- Zunanje CDN vire (z internetno povezavo)

## 🛠️ Prilagajanje

### Oblikovanje
Uredi CSS v `index.html` za prilagoditev videza.

### Funkcionalnost
Spremeni JavaScript v `index.html` za dodajanje novih funkcij.

### Proces Gradnje
Posodobi `build.sh` za spreminjanje načina obdelovanja ali organiziranja iger.

## 🔍 Odpravljanje Težav

### Težave s Skriptom za Gradnjo
- Prepričaj se, da je skript izvršljiv: `chmod +x build.sh`
- Preveri, da so datoteke iger pravilno poimenovane s `.html` končnico
- Preveri, da mape let vsebujejo samo številska imena

### Težave z GitHub Actions
- Preveri zavihek Actions v svojem repozitoriju za dnevnike gradnje
- Prepričaj se, da je GitHub Pages omogočen v nastavitvah repozitorija
- Preveri, da ima workflow potrebna dovoljenja

### Težave z Lokalnim Strežnikom
Skript poskuša več možnosti strežnika:
- Python 3: `python3 -m http.server`
- Python 2: `python -m SimpleHTTPServer`
- PHP: `php -S localhost:8080`
- Ruby: `ruby -run -e httpd`

Namesti katerega koli od teh za zagon razvojnega strežnika.

## 📝 Licenca

Ta projekt je namenjen izobraževalni uporabi. Igre in vsebina lahko imajo svoje licence.

## 🤝 Prispevanje

1. Dodaj svoje igre v ustrezno mapo leta
2. Testiraj lokalno z `./build.sh run`
3. Potrdi in potisni - avtomatična objava bo uredila ostalo!

---

*Zgrajeno z ❤️ za preprosto, vzdržljivo spletno gostovanje*
