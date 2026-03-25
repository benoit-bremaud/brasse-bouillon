# Product Backlog — Brasse-Bouillon

> **Single source of truth** for all User Stories.
> Supersedes `docs/user_stories.md` and `docs/requirements/user_stories.md`.

## Personas

| ID | Name | Type | Description |
|----|------|------|-------------|
| P1 | Nicolas | Beginner (30-35) | Tech-savvy first-time brewer, needs tutorials and guided recipes |
| P2 | Claire | Intermediate (35-45) | Creative amateur brewer, wants to organize and share recipes |
| P3 | Marc | Expert (45+) | Technical consultant, seeks advanced tools and precise calculations |

## Epics

| Epic | Name | MoSCoW | Description |
|------|------|--------|-------------|
| E01 | Authentication & User Profile | Must-Have | Registration, login, password reset, profile management |
| E02 | Recipe Management | Must-Have | CRUD for recipes with ingredients, steps, search, and filtering |
| E03 | Brewing Calculators | Must-Have | Standalone calculation tools (ABV, IBU, SRM, carbonation, etc.) |
| E04 | Batch Tracking | Must-Have | Create batches from recipes, track sessions, record measurements |
| E05 | Ingredient Library | Must-Have | Browse and search ingredient data sheets (hops, malts, yeasts, water) |
| E06 | Brewing Academy | Must-Have | Educational topics, glossary, guided tutorials by skill level |
| E07 | Label Designer & Scanner | Should-Have | Custom bottle labels, barcode scanning for commercial beers |
| E08 | Dashboard & Navigation | Must-Have | Home dashboard, bottom tab navigation, explore/discovery hub |
| E09 | Community & Sharing | Nice-to-Have | Share recipes publicly, rate, comment, browse community content |
| E10 | Equipment & Shop | Nice-to-Have | Equipment catalog, supplier directory, shop integration |

## Sprint Plan

| Sprint | Dates | Goal | Stories | SP |
|--------|-------|------|---------|----|
| Done | Prior sprints | Already built features | 30 | ~89 |
| S4 | Mar 25 - Apr 15 | Core Recipe CRUD — create, edit, delete recipes with ingredients and steps | 8 | ~31 |
| S5 | Apr 15 - May 6 | Complete Experience — search, auto-calc, batch recording, profile, glossary | 12 | ~41 |
| S6 | May 6 - May 27 | Demo Polish + Community — tutorial, sharing, favorites, equipment | 7 | ~29 |
| Future | Post-soutenance | Deferred features | 4 | ~14 |

---

## E01 — Authentication & User Profile

### US-0101: Register an account

**As a** Nicolas (Beginner),
**I want to** create an account with email and password,
**So that** I can save my recipes and personal data.

**Acceptance Criteria:**
- [ ] Given I am on the register screen, when I enter a valid email and password, then my account is created
- [ ] Given I enter an already-used email, when I submit, then an error message is displayed
- [ ] Given registration succeeds, when I am redirected, then I land on the dashboard

**Story Points:** 3 | **Priority:** Must-Have | **Status:** Done | **Sprint:** -
**Epic:** E01 | **Persona:** Nicolas

---

### US-0102: Log in to the app

**As a** any user,
**I want to** log in with my credentials,
**So that** I can access my personal space.

**Acceptance Criteria:**
- [ ] Given I am on the login screen, when I enter valid credentials, then I am authenticated and redirected to the dashboard
- [ ] Given I enter invalid credentials, when I submit, then an error message is displayed
- [ ] Given I am already logged in, when I open the app, then I am redirected to the dashboard

**Story Points:** 2 | **Priority:** Must-Have | **Status:** Done | **Sprint:** -
**Epic:** E01 | **Persona:** Any

---

### US-0103: Reset forgotten password

**As a** any user,
**I want to** request a password reset via email,
**So that** I can recover access to my account.

**Acceptance Criteria:**
- [ ] Given I am on the forgot-password screen, when I enter my email and submit, then a reset link is sent
- [ ] Given the backend does not support password reset, when I submit, then a clear fallback message is displayed

**Story Points:** 3 | **Priority:** Must-Have | **Status:** Done | **Sprint:** -
**Epic:** E01 | **Persona:** Any

---

### US-0104: View and edit my profile

**As a** any user,
**I want to** view and update my profile information (name, avatar, bio),
**So that** my identity is reflected in the app.

**Acceptance Criteria:**
- [ ] Given I am on the profile screen, when I view it, then my current name, avatar, and bio are displayed
- [ ] Given I modify a field and save, when I return to the profile, then the updated data is shown
- [ ] Given I leave a required field empty, when I save, then a validation error is displayed

**Story Points:** 3 | **Priority:** Should-Have | **Status:** To Do | **Sprint:** S5
**Epic:** E01 | **Persona:** Any

---

### US-0105: Log out of the app

**As a** any user,
**I want to** log out of the application,
**So that** my session is secured when I leave.

**Acceptance Criteria:**
- [ ] Given I am authenticated, when I tap "Log out", then my session is cleared and I am redirected to the login screen
- [ ] Given I am logged out, when I try to access a protected screen, then I am redirected to login

**Story Points:** 1 | **Priority:** Must-Have | **Status:** Done | **Sprint:** -
**Epic:** E01 | **Persona:** Any

---

## E02 — Recipe Management

### US-0201: Browse recipe list

**As a** Claire (Intermediate brewer),
**I want to** see all my recipes in a scrollable list,
**So that** I can quickly find a recipe to brew.

**Acceptance Criteria:**
- [ ] Given I have saved recipes, when I open the recipes screen, then all my recipes are displayed in a list
- [ ] Given each recipe card, when I view it, then I see the name, style, and key parameters (ABV, IBU)
- [ ] Given I have no recipes, when I open the screen, then an empty state message is shown

**Story Points:** 3 | **Priority:** Must-Have | **Status:** Done | **Sprint:** -
**Epic:** E02 | **Persona:** Claire

---

### US-0202: View recipe details

**As a** any user,
**I want to** tap a recipe to see its full details (ingredients, steps, parameters),
**So that** I understand the recipe before brewing.

**Acceptance Criteria:**
- [ ] Given I tap a recipe, when the detail screen opens, then I see name, style, description, ingredients, and steps
- [ ] Given the recipe has calculated values, when I view details, then IBU, ABV, and color are displayed

**Story Points:** 3 | **Priority:** Must-Have | **Status:** Done | **Sprint:** -
**Epic:** E02 | **Persona:** Any

---

### US-0203: Create a new recipe

**As a** Claire (Intermediate brewer),
**I want to** create a recipe with name, style, description, and ingredients,
**So that** I can record my own brewing creations.

**Acceptance Criteria:**
- [ ] Given I am on the recipe list, when I tap "Create", then a recipe form opens
- [ ] Given I fill in name and style, when I save, then the recipe appears in my list
- [ ] Given I add ingredients (hops, malts, yeast), when I save, then they are stored with the recipe

**Story Points:** 5 | **Priority:** Must-Have | **Status:** To Do | **Sprint:** S4
**Epic:** E02 | **Persona:** Claire

---

### US-0204: Edit an existing recipe

**As a** any user,
**I want to** modify any field of a saved recipe,
**So that** I can correct or improve it over time.

**Acceptance Criteria:**
- [ ] Given I am on a recipe detail screen, when I tap "Edit", then the form opens pre-filled with current data
- [ ] Given I modify fields and save, when I return to the detail screen, then the updated data is shown
- [ ] Given I cancel editing, when I go back, then no changes are persisted

**Story Points:** 5 | **Priority:** Must-Have | **Status:** To Do | **Sprint:** S4
**Epic:** E02 | **Persona:** Any

---

### US-0205: Delete a recipe

**As a** any user,
**I want to** delete a recipe I no longer need,
**So that** my recipe list stays organized.

**Acceptance Criteria:**
- [ ] Given I am on a recipe detail screen, when I tap "Delete" and confirm, then the recipe is removed from my list
- [ ] Given I tap "Delete", when a confirmation dialog appears, then I can cancel to keep the recipe

**Story Points:** 2 | **Priority:** Must-Have | **Status:** To Do | **Sprint:** S4
**Epic:** E02 | **Persona:** Any

---

### US-0206: Add hops to a recipe

**As a** Claire (Intermediate brewer),
**I want to** add hop additions with name, alpha-acid %, quantity, and timing,
**So that** the recipe has accurate hopping data for IBU calculation.

**Acceptance Criteria:**
- [ ] Given I am editing a recipe, when I tap "Add Hop", then a hop form appears with fields for name, alpha-acid, quantity (g), and boil time (min)
- [ ] Given I fill in hop data and save, when I view the recipe, then the hop appears in the ingredients list
- [ ] Given I add multiple hops, when I view the recipe, then all additions are listed with their timing

**Story Points:** 3 | **Priority:** Must-Have | **Status:** To Do | **Sprint:** S4
**Epic:** E02 | **Persona:** Claire

---

### US-0207: Add fermentables to a recipe

**As a** Claire (Intermediate brewer),
**I want to** add malts/fermentables with name, EBC color, type, and quantity,
**So that** the recipe has an accurate grain bill.

**Acceptance Criteria:**
- [ ] Given I am editing a recipe, when I tap "Add Fermentable", then a form appears with fields for name, EBC, type (base/specialty/sugar), and quantity (kg)
- [ ] Given I add fermentables, when I view the recipe, then the grain bill is listed with percentages

**Story Points:** 3 | **Priority:** Must-Have | **Status:** To Do | **Sprint:** S4
**Epic:** E02 | **Persona:** Claire

---

### US-0208: Add yeast to a recipe

**As a** Claire (Intermediate brewer),
**I want to** add yeast with strain name, attenuation, and temperature range,
**So that** the recipe has complete fermentation data.

**Acceptance Criteria:**
- [ ] Given I am editing a recipe, when I tap "Add Yeast", then a form appears with fields for strain, attenuation (%), and temp range
- [ ] Given I add yeast, when I view the recipe, then the yeast information is displayed

**Story Points:** 3 | **Priority:** Must-Have | **Status:** To Do | **Sprint:** S4
**Epic:** E02 | **Persona:** Claire

---

### US-0209: Add water profile to a recipe

**As a** Marc (Expert brewer),
**I want to** specify or import a water profile for my recipe,
**So that** I can brew with the correct water chemistry for the style.

**Acceptance Criteria:**
- [ ] Given I am editing a recipe, when I tap "Water Profile", then I can enter mineral concentrations (Ca, Mg, Na, SO4, Cl, HCO3)
- [ ] Given I want to use my local water, when I tap "Import from HubEau", then my location's water data is pre-filled

**Story Points:** 3 | **Priority:** Should-Have | **Status:** To Do | **Sprint:** S5
**Epic:** E02 | **Persona:** Marc

---

### US-0210: Add brewing steps to a recipe

**As a** Claire (Intermediate brewer),
**I want to** define ordered steps with time and temperature for each phase,
**So that** I have a clear process to follow when brewing.

**Acceptance Criteria:**
- [ ] Given I am editing a recipe, when I tap "Add Step", then I can enter step name, duration, and temperature
- [ ] Given I add multiple steps, when I view them, then they are displayed in order
- [ ] Given I want to reorder steps, when I drag a step, then the order updates

**Story Points:** 5 | **Priority:** Must-Have | **Status:** To Do | **Sprint:** S4
**Epic:** E02 | **Persona:** Claire

---

### US-0211: Duplicate a recipe

**As a** Claire (Intermediate brewer),
**I want to** copy an existing recipe as a starting point,
**So that** I can experiment with variants without losing the original.

**Acceptance Criteria:**
- [ ] Given I am on a recipe detail screen, when I tap "Duplicate", then a copy is created with "(Copy)" appended to the name
- [ ] Given I edit the copy, when I save, then the original recipe remains unchanged

**Story Points:** 2 | **Priority:** Should-Have | **Status:** To Do | **Sprint:** S5
**Epic:** E02 | **Persona:** Claire

---

### US-0212: Search and filter recipes

**As a** Nicolas (Beginner),
**I want to** search recipes by name, style, or keyword,
**So that** I find what I want quickly.

**Acceptance Criteria:**
- [ ] Given I am on the recipe list, when I type in the search bar, then results filter in real time
- [ ] Given I filter by style (e.g., IPA, Stout), when I select a filter, then only matching recipes are shown
- [ ] Given no results match, when the list is empty, then a "no results" message is displayed

**Story Points:** 3 | **Priority:** Should-Have | **Status:** To Do | **Sprint:** S5
**Epic:** E02 | **Persona:** Nicolas

---

### US-0213: Auto-calculate IBU and ABV from recipe ingredients

**As a** any user,
**I want to** see IBU and ABV computed automatically from recipe ingredients,
**So that** I know the beer profile without doing manual math.

**Acceptance Criteria:**
- [ ] Given a recipe has hops with alpha-acid and boil time, when I view the recipe, then IBU is calculated and displayed
- [ ] Given a recipe has an OG and yeast attenuation, when I view the recipe, then ABV is estimated and displayed
- [ ] Given an ingredient is missing data, when the calculation cannot complete, then a warning is shown

**Story Points:** 5 | **Priority:** Must-Have | **Status:** To Do | **Sprint:** S5
**Epic:** E02 | **Persona:** Any

---

## E03 — Brewing Calculators

### US-0301: ABV calculator

**As a** Nicolas (Beginner),
**I want to** enter OG and FG to calculate alcohol by volume,
**So that** I know my beer's strength.

**Acceptance Criteria:**
- [ ] Given I enter OG and FG values, when I tap "Calculate", then the ABV is displayed
- [ ] Given I enter invalid values (FG > OG), when I tap "Calculate", then an error message is shown

**Story Points:** 3 | **Priority:** Must-Have | **Status:** Done | **Sprint:** -
**Epic:** E03 | **Persona:** Nicolas

---

### US-0302: IBU calculator

**As a** Claire (Intermediate brewer),
**I want to** enter hop data to calculate bitterness units,
**So that** I can predict the bitterness profile of my beer.

**Acceptance Criteria:**
- [ ] Given I enter hop weight, alpha-acid %, boil time, and batch volume, when I calculate, then IBU is displayed
- [ ] Given I add multiple hop additions, when I calculate, then the total IBU is the sum of all contributions

**Story Points:** 5 | **Priority:** Must-Have | **Status:** Done | **Sprint:** -
**Epic:** E03 | **Persona:** Claire

---

### US-0303: SRM/Color calculator

**As a** Claire (Intermediate brewer),
**I want to** enter grain bill data to estimate beer color,
**So that** I know what color to expect before brewing.

**Acceptance Criteria:**
- [ ] Given I enter grain types and quantities, when I calculate, then the SRM value and a color swatch are displayed
- [ ] Given I modify the grain bill, when I recalculate, then the color updates

**Story Points:** 3 | **Priority:** Must-Have | **Status:** Done | **Sprint:** -
**Epic:** E03 | **Persona:** Claire

---

### US-0304: Carbonation calculator

**As a** any user,
**I want to** calculate priming sugar quantity for bottling,
**So that** I get the right carbonation level for my beer style.

**Acceptance Criteria:**
- [ ] Given I select a beer style and enter batch volume and temperature, when I calculate, then the sugar quantity is displayed
- [ ] Given I can choose between sugar types (dextrose, table sugar, honey), when I select one, then the quantity adjusts

**Story Points:** 3 | **Priority:** Must-Have | **Status:** Done | **Sprint:** -
**Epic:** E03 | **Persona:** Any

---

### US-0305: Dilution calculator

**As a** Marc (Expert brewer),
**I want to** calculate water additions to reach a target gravity,
**So that** I can adjust my wort precisely.

**Acceptance Criteria:**
- [ ] Given I enter current gravity, current volume, and target gravity, when I calculate, then the water volume to add is displayed

**Story Points:** 3 | **Priority:** Must-Have | **Status:** Done | **Sprint:** -
**Epic:** E03 | **Persona:** Marc

---

### US-0306: Refractometer correction calculator

**As a** Marc (Expert brewer),
**I want to** correct refractometer readings during fermentation,
**So that** I get accurate gravity readings despite alcohol presence.

**Acceptance Criteria:**
- [ ] Given I enter OG (Brix) and current reading (Brix), when I calculate, then the corrected specific gravity is displayed

**Story Points:** 3 | **Priority:** Must-Have | **Status:** Done | **Sprint:** -
**Epic:** E03 | **Persona:** Marc

---

### US-0307: Fermentables calculator

**As a** Claire (Intermediate brewer),
**I want to** calculate expected OG from my grain bill,
**So that** I can plan grain quantities for my target strength.

**Acceptance Criteria:**
- [ ] Given I enter grain types, quantities, and batch volume, when I calculate, then the estimated OG is displayed
- [ ] Given I adjust efficiency %, when I recalculate, then the OG changes accordingly

**Story Points:** 3 | **Priority:** Must-Have | **Status:** Done | **Sprint:** -
**Epic:** E03 | **Persona:** Claire

---

### US-0308: Hops calculator

**As a** Claire (Intermediate brewer),
**I want to** calculate hop contributions and find substitutions,
**So that** I can adjust my hop schedule confidently.

**Acceptance Criteria:**
- [ ] Given I enter hop data and utilization parameters, when I calculate, then the IBU contribution per addition is shown
- [ ] Given I select a hop variety, when I view substitutions, then alternative hops with similar profiles are listed

**Story Points:** 3 | **Priority:** Must-Have | **Status:** Done | **Sprint:** -
**Epic:** E03 | **Persona:** Claire

---

### US-0309: Efficiency/Yield calculator

**As a** Marc (Expert brewer),
**I want to** calculate brewhouse efficiency from my measurements,
**So that** I can track and improve my process over time.

**Acceptance Criteria:**
- [ ] Given I enter grain bill, pre-boil gravity, and volume, when I calculate, then the brewhouse efficiency % is displayed

**Story Points:** 3 | **Priority:** Must-Have | **Status:** Done | **Sprint:** -
**Epic:** E03 | **Persona:** Marc

---

### US-0310: Water chemistry calculator

**As a** Marc (Expert brewer),
**I want to** analyze and adjust my water mineral profile,
**So that** I can match target water profiles for a beer style.

**Acceptance Criteria:**
- [ ] Given I enter my source water minerals, when I select a target profile, then the required additions (gypsum, CaCl2, etc.) are calculated
- [ ] Given I tap "Import from HubEau", when my location's data loads, then the source water fields are pre-filled

**Story Points:** 5 | **Priority:** Must-Have | **Status:** Done | **Sprint:** -
**Epic:** E03 | **Persona:** Marc

---

## E04 — Batch Tracking

### US-0401: Browse batch list

**As a** Claire (Intermediate brewer),
**I want to** see all my batches in a list,
**So that** I can track my brewing history.

**Acceptance Criteria:**
- [ ] Given I have active batches, when I open the batches screen, then all batches are listed with name, recipe, date, and status
- [ ] Given I have no batches, when I open the screen, then an empty state message is shown

**Story Points:** 3 | **Priority:** Must-Have | **Status:** Done | **Sprint:** -
**Epic:** E04 | **Persona:** Claire

---

### US-0402: View batch details

**As a** any user,
**I want to** tap a batch to see its full details, timeline, and notes,
**So that** I understand what happened during this brew.

**Acceptance Criteria:**
- [ ] Given I tap a batch, when the detail screen opens, then I see the linked recipe, brew date, status, and all recorded data
- [ ] Given the batch has measurements, when I view details, then gravity, temperature, and pH readings are displayed

**Story Points:** 3 | **Priority:** Must-Have | **Status:** Done | **Sprint:** -
**Epic:** E04 | **Persona:** Any

---

### US-0403: Create a batch from a recipe

**As a** Claire (Intermediate brewer),
**I want to** start a new batch linked to one of my recipes,
**So that** my batch inherits all recipe parameters automatically.

**Acceptance Criteria:**
- [ ] Given I am on a recipe detail screen, when I tap "Start Batch", then a new batch is created with the recipe's parameters
- [ ] Given the batch is created, when I view the batch, then the recipe name and all ingredients/steps are shown

**Story Points:** 5 | **Priority:** Must-Have | **Status:** To Do | **Sprint:** S4
**Epic:** E04 | **Persona:** Claire

---

### US-0404: Record measurements during a batch

**As a** Marc (Expert brewer),
**I want to** log gravity, temperature, and pH at each step,
**So that** I have a precise brewing journal for analysis.

**Acceptance Criteria:**
- [ ] Given I am on a batch detail screen, when I tap "Add Measurement", then I can enter gravity, temperature, pH, and a timestamp
- [ ] Given I add measurements over time, when I view the batch, then all readings are displayed chronologically

**Story Points:** 5 | **Priority:** Must-Have | **Status:** To Do | **Sprint:** S5
**Epic:** E04 | **Persona:** Marc

---

### US-0405: Add notes to a batch

**As a** Claire (Intermediate brewer),
**I want to** write free-text notes at any point during brewing,
**So that** I can remember observations and adjustments for next time.

**Acceptance Criteria:**
- [ ] Given I am on a batch detail screen, when I tap "Add Note", then a text input appears with an auto-filled timestamp
- [ ] Given I save a note, when I view the batch, then the note appears in the timeline

**Story Points:** 2 | **Priority:** Should-Have | **Status:** To Do | **Sprint:** S5
**Epic:** E04 | **Persona:** Claire

---

### US-0406: View batch timeline

**As a** any user,
**I want to** see a visual timeline of my batch progress,
**So that** I understand where I am in the brewing process.

**Acceptance Criteria:**
- [ ] Given a batch has steps from the recipe, when I view the timeline, then each step is shown with its status (pending/in progress/done)
- [ ] Given I complete a step, when I mark it done, then the timeline updates visually

**Story Points:** 3 | **Priority:** Should-Have | **Status:** Done | **Sprint:** -
**Epic:** E04 | **Persona:** Any

---

### US-0407: Complete and archive a batch

**As a** any user,
**I want to** mark a batch as finished,
**So that** my active and completed batches are clearly separated.

**Acceptance Criteria:**
- [ ] Given a batch is in progress, when I tap "Complete Batch", then the batch status changes to "Completed"
- [ ] Given the batch is completed, when I view the batch list, then it appears in the "Completed" section

**Story Points:** 2 | **Priority:** Should-Have | **Status:** To Do | **Sprint:** S5
**Epic:** E04 | **Persona:** Any

---

## E05 — Ingredient Library

### US-0501: Browse ingredient categories

**As a** Nicolas (Beginner),
**I want to** see ingredient categories (hops, malts, yeasts, water, additives),
**So that** I can explore what ingredients are available.

**Acceptance Criteria:**
- [ ] Given I open the ingredients screen, when the page loads, then I see category cards for hops, malts, yeasts, water, and additives
- [ ] Given I tap a category, when the screen transitions, then I see the list of ingredients in that category

**Story Points:** 2 | **Priority:** Must-Have | **Status:** Done | **Sprint:** -
**Epic:** E05 | **Persona:** Nicolas

---

### US-0502: View ingredient list by category

**As a** any user,
**I want to** browse all ingredients within a category,
**So that** I can find specific ingredients for my recipe.

**Acceptance Criteria:**
- [ ] Given I select a category (e.g., Hops), when the list loads, then all ingredients are displayed with name and key properties
- [ ] Given the list is long, when I scroll, then items load smoothly

**Story Points:** 3 | **Priority:** Must-Have | **Status:** Done | **Sprint:** -
**Epic:** E05 | **Persona:** Any

---

### US-0503: View ingredient detail sheet

**As a** any user,
**I want to** see full details for a specific ingredient (properties, usage, style pairings),
**So that** I understand how to use it in my recipes.

**Acceptance Criteria:**
- [ ] Given I tap an ingredient, when the detail screen opens, then I see all properties (alpha-acid for hops, EBC for malts, attenuation for yeasts, etc.)
- [ ] Given the ingredient has style pairings, when I view details, then recommended beer styles are listed

**Story Points:** 3 | **Priority:** Must-Have | **Status:** Done | **Sprint:** -
**Epic:** E05 | **Persona:** Any

---

### US-0504: Search ingredients

**As a** Nicolas (Beginner),
**I want to** search for an ingredient by name or property,
**So that** I can find it quickly without browsing every category.

**Acceptance Criteria:**
- [ ] Given I am on the ingredient list, when I type in the search bar, then results filter in real time
- [ ] Given no results match, when the list is empty, then a "no results" message is displayed

**Story Points:** 3 | **Priority:** Should-Have | **Status:** To Do | **Sprint:** S5
**Epic:** E05 | **Persona:** Nicolas

---

### US-0505: View water profile for my location

**As a** Marc (Expert brewer),
**I want to** see the water quality data for my area (via HubEau API),
**So that** I can plan water adjustments for my brews.

**Acceptance Criteria:**
- [ ] Given I am on the water tool, when I enter my commune or postal code, then my local water data is displayed
- [ ] Given the API returns data, when I view results, then key minerals (Ca, Mg, Na, SO4, Cl, HCO3, pH) are shown

**Story Points:** 5 | **Priority:** Must-Have | **Status:** Done | **Sprint:** -
**Epic:** E05 | **Persona:** Marc

---

## E06 — Brewing Academy

### US-0601: Browse academy topics

**As a** Nicolas (Beginner),
**I want to** see a hub of educational topics organized by category,
**So that** I can learn about brewing progressively.

**Acceptance Criteria:**
- [ ] Given I open the academy screen, when the page loads, then topics are grouped by category with icons
- [ ] Given I tap a topic, when the screen transitions, then I see the topic's content

**Story Points:** 3 | **Priority:** Must-Have | **Status:** Done | **Sprint:** -
**Epic:** E06 | **Persona:** Nicolas

---

### US-0602: View academy topic details

**As a** Nicolas (Beginner),
**I want to** read detailed content about a brewing topic,
**So that** I can learn at my own pace.

**Acceptance Criteria:**
- [ ] Given I tap a topic, when the detail screen opens, then I see structured content with text and illustrations
- [ ] Given the topic has related calculators, when I view it, then a link to the relevant calculator is shown

**Story Points:** 3 | **Priority:** Must-Have | **Status:** Done | **Sprint:** -
**Epic:** E06 | **Persona:** Nicolas

---

### US-0603: Access interactive glossary

**As a** Nicolas (Beginner),
**I want to** look up brewing terms in a searchable glossary,
**So that** I understand technical vocabulary used in recipes and tutorials.

**Acceptance Criteria:**
- [ ] Given I open the glossary, when the page loads, then terms are listed alphabetically
- [ ] Given I type in the search bar, when I search, then matching terms are filtered in real time
- [ ] Given I tap a term, when I view it, then a clear definition with examples is shown

**Story Points:** 3 | **Priority:** Should-Have | **Status:** To Do | **Sprint:** S5
**Epic:** E06 | **Persona:** Nicolas

---

### US-0604: Follow guided first-brew tutorial

**As a** Nicolas (Beginner),
**I want to** follow a step-by-step interactive tutorial for my first batch,
**So that** I succeed my first brew without feeling overwhelmed.

**Acceptance Criteria:**
- [ ] Given I open the tutorial, when it starts, then I see a numbered sequence of steps with clear instructions
- [ ] Given I complete a step, when I tap "Next", then the next step is shown with progress indication
- [ ] Given I finish the tutorial, when the last step is done, then a completion screen congratulates me

**Story Points:** 8 | **Priority:** Should-Have | **Status:** To Do | **Sprint:** S6
**Epic:** E06 | **Persona:** Nicolas

---

### US-0605: View beginner-friendly recipes

**As a** Nicolas (Beginner),
**I want to** filter academy content to see only beginner-level recipes,
**So that** I find recipes adapted to my skill level.

**Acceptance Criteria:**
- [ ] Given I am in the academy, when I select "Beginner" filter, then only beginner-tagged content is shown
- [ ] Given beginner recipes, when I view them, then they have simplified instructions and fewer ingredients

**Story Points:** 3 | **Priority:** Should-Have | **Status:** To Do | **Sprint:** S6
**Epic:** E06 | **Persona:** Nicolas

---

## E07 — Label Designer & Scanner

### US-0701: Browse my labels

**As a** Claire (Intermediate brewer),
**I want to** see a list of custom labels I have created,
**So that** I can manage my label designs.

**Acceptance Criteria:**
- [ ] Given I have created labels, when I open the labels screen, then all my labels are shown as visual thumbnails
- [ ] Given I have no labels, when I open the screen, then an empty state with "Create your first label" is shown

**Story Points:** 2 | **Priority:** Should-Have | **Status:** Done | **Sprint:** -
**Epic:** E07 | **Persona:** Claire

---

### US-0702: Create a custom label

**As a** Claire (Intermediate brewer),
**I want to** design a label with name, color palette, and template for my bottles,
**So that** my bottles have a personal visual identity.

**Acceptance Criteria:**
- [ ] Given I tap "Create Label", when the editor opens, then I can enter a name, choose colors, and select a template
- [ ] Given I finish designing, when I save, then the label appears in my label list

**Story Points:** 5 | **Priority:** Should-Have | **Status:** Done | **Sprint:** -
**Epic:** E07 | **Persona:** Claire

---

### US-0703: Link a label to a batch

**As a** Claire (Intermediate brewer),
**I want to** associate a label with a specific batch,
**So that** I know which label goes on which bottles.

**Acceptance Criteria:**
- [ ] Given I have a batch and a label, when I link them, then the batch detail shows the associated label
- [ ] Given I view my labels, when a label is linked, then the batch name is displayed

**Story Points:** 2 | **Priority:** Should-Have | **Status:** Done | **Sprint:** -
**Epic:** E07 | **Persona:** Claire

---

### US-0704: Scan a beer barcode

**As a** any user,
**I want to** scan a commercial beer barcode with my phone camera,
**So that** I can catalog and review beers I have tasted.

**Acceptance Criteria:**
- [ ] Given I tap "Scan", when the camera opens, then it detects barcodes in the viewfinder
- [ ] Given a barcode is recognized, when the scan completes, then the beer information is displayed (or "Not found" if unknown)

**Story Points:** 5 | **Priority:** Should-Have | **Status:** Done | **Sprint:** -
**Epic:** E07 | **Persona:** Any

---

### US-0705: View scan result

**As a** any user,
**I want to** see the details of a scanned beer (name, style, brewery),
**So that** I learn about the beer I scanned.

**Acceptance Criteria:**
- [ ] Given a scan found a match, when I view the result, then name, style, brewery, and ABV are shown
- [ ] Given a scan did not find a match, when I view the result, then I can submit the beer for review

**Story Points:** 3 | **Priority:** Should-Have | **Status:** Done | **Sprint:** -
**Epic:** E07 | **Persona:** Any

---

### US-0706: View pending scans

**As a** any user,
**I want to** see my scans that are awaiting admin review,
**So that** I know my submissions are being processed.

**Acceptance Criteria:**
- [ ] Given I have submitted unknown beers, when I view pending scans, then each submission is listed with its status

**Story Points:** 2 | **Priority:** Should-Have | **Status:** Done | **Sprint:** -
**Epic:** E07 | **Persona:** Any

---

## E08 — Dashboard & Navigation

### US-0801: View dashboard home

**As a** any user,
**I want to** see a summary of my recent batches, recipes, and quick actions,
**So that** I have a central starting point in the app.

**Acceptance Criteria:**
- [ ] Given I am authenticated, when I open the app, then the dashboard shows recent recipes, active batches, and quick-action buttons
- [ ] Given I tap a quick action, when I select it, then I navigate to the relevant screen

**Story Points:** 3 | **Priority:** Must-Have | **Status:** Done | **Sprint:** -
**Epic:** E08 | **Persona:** Any

---

### US-0802: Navigate via bottom tab bar

**As a** any user,
**I want to** switch between main sections using a persistent bottom navigation,
**So that** I move through the app effortlessly.

**Acceptance Criteria:**
- [ ] Given the bottom tab bar is visible, when I tap a tab, then the corresponding section opens
- [ ] Given I am on a nested screen, when I view the tab bar, then the active tab is highlighted

**Story Points:** 3 | **Priority:** Must-Have | **Status:** Done | **Sprint:** -
**Epic:** E08 | **Persona:** Any

---

### US-0803: Explore discovery hub

**As a** Nicolas (Beginner),
**I want to** see curated content and featured sections on an explore screen,
**So that** I discover new features and content in the app.

**Acceptance Criteria:**
- [ ] Given I navigate to the explore screen, when it loads, then I see featured recipes, trending topics, and suggested tools
- [ ] Given I tap a featured item, when I select it, then I navigate to the relevant detail screen

**Story Points:** 3 | **Priority:** Should-Have | **Status:** Done | **Sprint:** -
**Epic:** E08 | **Persona:** Nicolas

---

## E09 — Community & Sharing

### US-0901: Share a recipe publicly

**As a** Claire (Intermediate brewer),
**I want to** make one of my recipes visible to the community,
**So that** other brewers can see, try, and give feedback on my recipe.

**Acceptance Criteria:**
- [ ] Given I am on a recipe detail screen, when I tap "Share", then the recipe visibility changes to public
- [ ] Given the recipe is shared, when another user browses public recipes, then my recipe appears in the list

**Story Points:** 5 | **Priority:** Nice-to-Have | **Status:** To Do | **Sprint:** S6
**Epic:** E09 | **Persona:** Claire

---

### US-0902: Browse public recipes

**As a** Nicolas (Beginner),
**I want to** browse recipes shared by other community members,
**So that** I discover new recipes and get inspiration.

**Acceptance Criteria:**
- [ ] Given I open the community section, when it loads, then I see a list of public recipes with author, style, and rating
- [ ] Given I tap a public recipe, when the detail opens, then I see full recipe details (read-only)

**Story Points:** 5 | **Priority:** Nice-to-Have | **Status:** To Do | **Sprint:** S6
**Epic:** E09 | **Persona:** Nicolas

---

### US-0903: Rate a public recipe

**As a** any user,
**I want to** give a 1-5 star rating to a public recipe,
**So that** the community can identify popular and well-made recipes.

**Acceptance Criteria:**
- [ ] Given I am viewing a public recipe, when I tap a star rating, then my rating is saved
- [ ] Given the recipe has ratings, when I view it, then the average rating is displayed

**Story Points:** 3 | **Priority:** Nice-to-Have | **Status:** To Do | **Sprint:** Future
**Epic:** E09 | **Persona:** Any

---

### US-0904: Comment on a public recipe

**As a** any user,
**I want to** leave a comment on a shared recipe,
**So that** I can give feedback, ask questions, or share tips with the author.

**Acceptance Criteria:**
- [ ] Given I am viewing a public recipe, when I type a comment and submit, then it appears in the comments section
- [ ] Given the recipe has comments, when I view them, then they are listed chronologically with author names

**Story Points:** 3 | **Priority:** Nice-to-Have | **Status:** To Do | **Sprint:** Future
**Epic:** E09 | **Persona:** Any

---

### US-0905: Save a recipe to favorites

**As a** any user,
**I want to** bookmark recipes I want to brew later,
**So that** I have a personal curated list of recipes to try.

**Acceptance Criteria:**
- [ ] Given I am viewing any recipe, when I tap the bookmark icon, then the recipe is added to my favorites
- [ ] Given I have favorites, when I open my favorites list, then all bookmarked recipes are shown

**Story Points:** 2 | **Priority:** Nice-to-Have | **Status:** To Do | **Sprint:** S6
**Epic:** E09 | **Persona:** Any

---

## E10 — Equipment & Shop

### US-1001: Browse equipment catalog

**As a** Nicolas (Beginner),
**I want to** see a list of brewing equipment with descriptions,
**So that** I know what tools I need to start brewing.

**Acceptance Criteria:**
- [ ] Given I open the equipment screen, when it loads, then equipment items are listed with name, image, and description
- [ ] Given I tap an item, when the detail opens, then full specs and recommended use are shown

**Story Points:** 3 | **Priority:** Nice-to-Have | **Status:** To Do | **Sprint:** S6
**Epic:** E10 | **Persona:** Nicolas

---

### US-1002: Browse shop categories

**As a** Nicolas (Beginner),
**I want to** see categorized shop listings (ingredients, equipment, kits),
**So that** I can explore what is available for purchase.

**Acceptance Criteria:**
- [ ] Given I open the shop screen, when it loads, then categories are displayed with icons
- [ ] Given I tap a category, when the list loads, then products in that category are shown

**Story Points:** 3 | **Priority:** Nice-to-Have | **Status:** To Do | **Sprint:** S6
**Epic:** E10 | **Persona:** Nicolas

---

### US-1003: View shop product details

**As a** any user,
**I want to** see detailed product information with descriptions and pricing,
**So that** I can make an informed purchase decision.

**Acceptance Criteria:**
- [ ] Given I tap a product, when the detail opens, then I see name, description, price, and availability
- [ ] Given the product has reviews, when I view details, then the average rating is shown

**Story Points:** 3 | **Priority:** Nice-to-Have | **Status:** To Do | **Sprint:** Future
**Epic:** E10 | **Persona:** Any

---

### US-1004: Generate shopping list from recipe

**As a** Nicolas (Beginner),
**I want to** generate an automatic shopping list based on a recipe's ingredients,
**So that** I do not forget anything when buying supplies.

**Acceptance Criteria:**
- [ ] Given I am on a recipe detail screen, when I tap "Shopping List", then a list of all ingredients with quantities is generated
- [ ] Given the shopping list, when I view it, then I can check off items as I buy them

**Story Points:** 5 | **Priority:** Should-Have | **Status:** To Do | **Sprint:** Future
**Epic:** E10 | **Persona:** Nicolas

---

## Summary

| Epic | Done | To Do | Total | Total SP |
|------|------|-------|-------|----------|
| E01 - Auth & Profile | 4 | 1 | 5 | 12 |
| E02 - Recipe Management | 2 | 11 | 13 | 48 |
| E03 - Brewing Calculators | 10 | 0 | 10 | 34 |
| E04 - Batch Tracking | 3 | 4 | 7 | 23 |
| E05 - Ingredient Library | 4 | 1 | 5 | 16 |
| E06 - Brewing Academy | 2 | 3 | 5 | 20 |
| E07 - Label Designer & Scanner | 6 | 0 | 6 | 19 |
| E08 - Dashboard & Navigation | 3 | 0 | 3 | 9 |
| E09 - Community & Sharing | 0 | 5 | 5 | 18 |
| E10 - Equipment & Shop | 0 | 4 | 4 | 14 |
| **Total** | **34** | **29** | **63** | **213** |
