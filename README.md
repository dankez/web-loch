# Loch Web 2.0 - Speleo 3D Engine

## 🌐 Prehľad projektu
Loch Web 2.0 je moderná, webová reimplementácia 3D prehliadača Loch (zo systému Therion). Slúži na vizualizáciu jaskynných systémov z binárnych súborov `.lox` s dôrazom na presnú speleologickú analýzu a jednoduché nasadenie na hosting (WebSupport).

## 🛠 Technický Stack
- **Frontend:** React 18 (TypeScript) + Vite
- **3D Engine:** Three.js (Z-up orientácia)
- **Math:** Custom speleo-vztahy (Azimuth, Inclination, JTSK handling)
- **Parser:** Low-level Binary DataView parser (Therion LOX spec)

## 🧠 Kľúčová Logika & Filozofia

### 1. Binárny Parser (LoxLoader.ts)
Parser nečíta súbor náhodne, ale striktne podľa chunkov:
- **Chunk 0x01 (Survey):** Názvy a hierarchia.
- **Chunk 0x02 (Station):** 64-bit Double súradnice X, Y, Z. Implementovaný **Auto-Offset** (prvá stanica = [0,0,0] v Three.js), čím eliminujeme trasenie obrazu pri veľkých JTSK súradniciach.
- **Chunk 0x03 (Shot):** Rozlišujeme medzi **Survey Legs** (hlavný polygón) a **Splays** (pomocné merania).
  - *Filozofia dĺžky:* Do celkovej dĺžky jaskyne sa započítavajú len reálne ťahy (Legs), nie splays ani povrchové merania.

### 2. Vizualizácia (ThreeView.tsx)
- **Orientácia:** Z je vždy výška (Z-up).
- **Farebnosť:** Polygonálny ťah je zafarbený podľa nadmorskej výšky (Altitude Gradient: Modrá = najnižšie, Červená = najvyššie).
- **Interakcia:** Implementované `OrbitControls` pre rotáciu, zoom a pan.
- **Z-Buffer:** Transparentné splays (šedé) sú vykreslené oddelene, aby nerušili vizuálnu integritu hlavného ťahu.

### 3. Analytické nástroje
- **Virtual Leg:** Matematický modul na výpočet reálnej 3D vzdialenosti, azimutu a sklonu medzi ľubovoľnými dvoma kliknutými bodmi.
- **Surface Proximity:** Výpočet "nadložia" – vertikálna vzdialenosť od jaskynnej chodby k povrchovému DEM modelu.

### 4. Logging & Debug
Aplikácia obsahuje reálny `Session Log`. Každý binárny chunk, počet načítaných staníc a prípadné chyby dekódovania sú zaznamenané a stiahnuteľné ako `.log` súbor.

## 🚀 Budúci vývoj (Next Steps)
- **Surface Grid (.txt):** Plná integrácia externých DMR5 modelov terénu (parser je hotový, treba prepojiť mesh v Three.js).
- **Lox Section 0x03:** Implementácia triangulácie stien (Scraps) pre zobrazenie objemu chodieb.
- **TopoDroid Integration:** Rozšírenie o priamu podporu `.tdx` archívov (SQLite).

## 📂 Štruktúra projektu
- `/src/loaders/LoxLoader.ts` - Mozog binárneho spracovania.
- `/src/components/ThreeView.tsx` - 3D Viewport a rendering.
- `/src/utils/math.ts` - Speleo matematika.
- `/src/components/HUD.tsx` - Real-time štatistiky.

---
**Stav k 13.04.2026:** Prototyp je plne funkčný, overený na reálnych .lox súboroch (model-simple, model2), štatistiky dĺžky a hĺbky sedia. Pripravené na Build.
