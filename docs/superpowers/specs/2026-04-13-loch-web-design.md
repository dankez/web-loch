# Design Spec: Loch Web 2.0 (Cave Viewer & Analysis Tool)

## 1. Účel projektu
Vytvoriť webovú aplikáciu pre speleológov na interaktívne prezeranie 3D modelov jaskýň vo formáte `.lox` s pokročilými analytickými nástrojmi na meranie a porovnávanie jaskyne s povrchom (LiDAR/DEM).

## 2. Technická Architektúra
*   **Frontend:** React 18+ (UI komponenty, správa stavu).
*   **3D Engine:** Three.js s integráciou modulu `CaveView.js` (LoxLoader).
*   **Výpočtové jadro:** Vlastné JS moduly pre prácu s JTSK súradnicami a priestorovou matematikou.
*   **Hosting:** Statický webový priestor (optimalizované pre WebSupport).

## 3. Moduly a Funkcie

### 3.1. Loader & Data Support
*   **LOX Loader:** Natívne načítanie .lox súborov (jaskyňa + integrovaný povrch).
*   **External Surface Loader:** Možnosť nahrať externý `grid` súbor (txt s výškami) pre prípady, kedy povrch nie je v .lox súbore.
*   **Bitmap Overlay:** Podpora textúrovania povrchu (napr. ortofotomapa alebo tieňovaný reliéf).

### 3.2. Analytické nástroje
*   **Virtual Leg (Meranie):**
    *   Výpočet 3D vzdialenosti.
    *   Výpočet azimutu (0-360°).
    *   Výpočet sklonu (inklinácie).
*   **LiDAR Proximity (Nadložie):**
    *   Dynamické určovanie hĺbky jaskyne pod povrchom.
    *   Zobrazenie vertikálnej kolmice k terénu.

### 3.3. Používateľské Rozhranie (Loch Classic)
*   **Sidebar:** Stromová štruktúra (Cave Tree), zoznam ťahov a staníc.
*   **Main View:** Plnoobrazovkový 3D viewport s podporou myši a dotyku.
*   **Status Bar:** Aktuálne súradnice kurzora a výsledky analýzy v reálnom čase.

## 4. Akceptačné kritériá
1.  Úspešné načítanie a zobrazenie testovacieho .lox súboru.
2.  Funkčné meranie medzi dvoma bodmi s presnosťou na 2 desatinné miesta.
3.  Správne vykreslenie terénu z .txt gridu podľa zadaných súradníc.
4.  Možnosť hostovania na verejnom webe bez potreby databázy alebo backendu.
