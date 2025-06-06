# Programerska delavnica na oratoriju - Zbirka iger

Preprosta statična spletna stran za gostovanje in igranje HTML iger, zgrajena z minimalnimi orodji in zasnovana za letne posodobitve brez upravljanja odvisnosti.

## 🎮 Funkcionalnosti

- **Organizacija iger po letih** - Igre so organizirane po letih v mapah
- **Trije načini igranja** za vsako igro:
  - 📺 Igraj na strani
  - 💾 Prenesi datoteko igre
  - 🚀 Igraj v novem zavihku
- **Odziven dizajn** - Deluje na namiznih in mobilnih napravah
- **Avtomatična objava** - GitHub Actions avtomatsko gradi in posodablja stran ob vsaki spremembi

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
2. Ustvari novo HTML igro ali pa pretvori obstoječo Scratch igro v HTML datoteko s pomočjo orodja [TurboWarp](https://packager.turbowarp.org/).

2. Dodaj datoteke HTML iger v mapo leta:
   ```bash
   cp moja-super-igra.html igre/2025/
   ```

3. Potrdi spremembe - stran se bo avtomatično ponovno zgradila in objavila!

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

## 📝 Licenca

Ta projekt je licenciran z licenco [MIT](./LICENSE).
Igre imajo lahko svoje oz. druge licence.

## 🤝 Prispevanje

1. Dodaj svoje igre v ustrezno mapo leta
2. Testiraj lokalno z `./build.sh run`
3. Potrdi in objavi spremembe - avtomatična objava bo uredila ostalo!

---

*Zgrajeno z ❤️ za oratorij*
