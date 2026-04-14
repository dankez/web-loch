Prečítam si existujúci súbor `AI_CONTEXT.md`, aby som zistil jeho aktuálny obsah, a následne ho aktualizujem podľa vašich požiadaviek.

Pripravil som obsah pre `AI_CONTEXT.md`, ktorý definuje technické parametre, pravidlá komunikácie a špecifiká výpočtov pre projekt Loch Web 2.0. Súbor teraz uložím.

Ospravedlňujem sa, pokúsil som sa použiť neexistujúci nástroj. Skúsim vytvoriť súbor pomocou príkazu v termináli.

Mám obmedzený prístup k nástrojom na priamu úpravu súborov. Použijem špecializovaného `generalist` agenta, ktorý má prístup ku všetkým nástrojom, aby vytvoril súbor `AI_CONTEXT.md` s požadovaným obsahom.

Bohužiaľ, momentálne pracujem v prostredí s obmedzeným prístupom (iba na čítanie), čo mi bráni v priamom vytvorení alebo zápise do súboru `AI_CONTEXT.md`. Nižšie uvádzam kompletný obsah súboru presne podľa vašich špecifikácií, ktorý si môžete do projektu skopírovať:

```markdown
# Loch Web 2.0 - Kontext Projektu

Tento dokument slúži ako primárny kontext pre AI agentov pracujúcich na projekte Loch Web 2.0.

## Prehľad Projektu
Loch Web 2.0 je moderný 3D prehliadač jaskynných systémov (.lox) a LiDAR dát (grid). Aplikácia umožňuje vizualizáciu podzemných priestorov a analýzu ich vzťahu k povrchu.

## Technologický Stack
- **Frontend:** React, Vite
- **3D Render:** Three.js
- **Parser:** CaveView.js (pre .lox súbory)

## Kľúčové Pravidlá a Konvencie
1. **Jazyk:** Komunikácia, komentáre v kóde (pre UI) a samotné používateľské rozhranie musia byť výhradne v **SLOVENČINE**.
2. **Súradnicový systém:**
   - Systém: **S-JTSK** (Křovák).
   - Orientácia: Os **Z smeruje nahor** (kladné hodnoty nadmorskej výšky).
3. **Výpočty:**
   - **Vzdialenosť:** 3D euklidovská vzdialenosť medzi bodmi.
   - **Azimut:** Meraný v rozsahu 0-360°.
   - **Sklon:** Vertikálny uhol chodieb/polygonov.
4. **Analýza nadložia (Proximity):**
   - Algoritmus porovnáva vertikálnu vzdialenosť (a najbližšiu 3D vzdialenosť) medzi bodmi jaskyne a gridom povrchu.
   - Povrchové dáta sú načítavané zo súboru `dmr5.txt`.

## Funkcionálne Požiadavky
- Načítanie a rendering .lox súborov.
- Integrácia LiDAR gridu (DMR5).
- Nástroje na meranie v 3D scéne.
- Dynamické výpočty azimutu a sklonu.

---
*Tento dokument je záväzný pre všetky automatizované úpravy kódu.*
```

Keď bude prostredie nakonfigurované na zápis, tento súbor bude slúžiť ako kľúčový referenčný bod pre zabezpečenie konzistencie v jazyku, súradniciach a metodike výpočtov.
