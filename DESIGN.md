---
name: ThaiScout AI
description: A code-led Recce Grid workspace for Thai film-location scouting.
colors:
  mist: "#ccd9e2"
  paper: "#f7f4ee"
  ink: "#193a61"
  blue: "#285185"
  blue-deep: "#193f6d"
  orange: "#d67940"
  wine: "#6f4849"
  muted: "#64758a"
  line: "rgba(40,81,133,.18)"
typography:
  display:
    fontFamily: "DM Serif Display, Mitr, serif"
    fontSize: "clamp(29px, 3.05vw, 47px)"
    fontWeight: 400
    lineHeight: 0.99
    letterSpacing: "-0.045em"
  body:
    fontFamily: "DM Sans, Mitr, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "DM Sans, Mitr, sans-serif"
    fontSize: "10px"
    fontWeight: 800
    letterSpacing: "0.08em"
rounded:
  micro: "4px"
  control: "8px"
  card: "12px"
  field: "14px"
  sheet: "16px"
  pill: "999px"
spacing:
  micro: "4px"
  xs: "8px"
  sm: "12px"
  control: "15px"
  md: "16px"
  lg: "20px"
  xl: "24px"
  panel: "28px"
  header: "36px"
components:
  button-search:
    backgroundColor: "{colors.orange}"
    textColor: "#ffffff"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "9px 13px"
  button-utility:
    backgroundColor: "#ffffff"
    textColor: "{colors.blue}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    size: "36px"
  button-save-active:
    backgroundColor: "{colors.wine}"
    textColor: "#ffffff"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "7px 9px"
  field-brief:
    backgroundColor: "#ffffff"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.field}"
    padding: "15px"
  card-location-selected:
    backgroundColor: "#fffaf4"
    textColor: "{colors.blue-deep}"
    rounded: "{rounded.card}"
    padding: "12px"
  chip-suggestion:
    backgroundColor: "#f6edef"
    textColor: "{colors.wine}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "4px 8px"
---

# Design System: ThaiScout AI

## Overview

**Creative North Star: "The Recce Grid"**

ThaiScout AI is a code-led production desk, not a destination-browsing site. The visual language turns a folded recce sheet into an active workspace: warm paper carries the brief and ranked findings; a cool live map occupies the other half; precise blue rules keep the two in one operational frame. Editorial display type lets the Thai creative brief feel like a film treatment, while compact sans-serif metadata behaves like crew notes.

The atmosphere is calm, precise, and tactile without becoming nostalgic. Orange is the moment of action or live state; wine marks a location that has crossed the line from candidate to committed recce point. The sheet may feel soft at its edges, but information hierarchy, status color, and map pin geometry remain unequivocal.

**Key Characteristics:**

- Split list-and-map workstation built for comparison at a glance.
- Warm paper, cool map mist, crisp navy rules, and sparse production-orange signals.
- Thai-first editorial headline paired with highly scannable production metadata.
- Selection and saved-state are visible simultaneously in list, map, dock, and route.

## Colors

The palette separates the working sheet, spatial map, current action, and committed recce state; color is always tied to meaning rather than decoration.

### Primary

- **Scout Blue:** Primary interactive ink for navigation, map-result pins, controls, data labels, and trusted working context. It is the ordinary actionable state.
- **Deep Coordinate Blue:** The darker text and heading ink, reserved for high-emphasis place names and the product mark.

### Secondary

- **Call Sheet Orange:** The single active accent for search, active tabs, live dots, selected pins, focus outlines, and selected-location labels. Use it to point to the current action or current place.

### Tertiary

- **Recce Wine:** A restrained commitment color for saved locations, account identity, and provenance/status language. It means “held for the team,” not generic error or decoration.

### Neutral

- **Map Mist:** The page field and map-adjacent cool ground; it keeps the sheet readable without a stark white application background.
- **Warm Paper:** The primary workspace surface. It is used for the top bar, result pane, and the folded sheet frame.
- **Production Ink:** Standard readable text inside briefs and fields.
- **Crew Note:** Supporting metadata, locations, and secondary explanatory copy.
- **Blue Rule:** Low-contrast dividers and borders that organize information without boxing every element.

**The State-Only Accent Rule.** Orange identifies the current operation or selected location, and wine identifies a saved recce point. Do not use either as a broad decorative wash or interchange their meanings.

## Typography

**Display Font:** DM Serif Display with Mitr and a serif fallback.

**Body Font:** DM Sans with Mitr and a sans-serif fallback.

**Character:** The serif/sans pairing separates the director’s visual intention from the scout’s operational notes. Mitr keeps Thai language coverage coherent in both roles; labels stay dense, direct, and mostly uppercase only for compact English system language.

### Hierarchy

- **Display** (400, `clamp(29px, 3.05vw, 47px)`, 0.99): The Thai-first workspace headline; tightly tracked and limited to the sheet heading.
- **Brand** (700, 21px, 1): The product wordmark uses the display family with slightly tightened tracking.
- **Location title** (800, 13px, normal): Dense, single-line result names; truncate rather than wrap into the action column.
- **Body** (400, 14px, 1.55): The editable creative brief; it needs enough leading for Thai prose and constraint-heavy production notes.
- **Metadata** (650–750, 10–12px, normal): Province, count, short explanations, and controls.
- **Label** (800, 8–10px, tracked 0.06–0.13em): Overlines, source status, map labels, and dock labels. Use compact uppercase English labels only where they function as system metadata.

**The Treatment-Then-Call-Sheet Rule.** Use display type for the creative proposition and DM Sans/Mitr for every task, status, fact, or control. Do not promote raw metadata to editorial display type.

## Layout

The desktop shell is a 16px-inset paper sheet. Its 62px top bar joins a workspace with a left control/results pane (`minmax(410px, 43%)`) and a flexible map stage. The workspace is at least `calc(100vh - 94px)` tall, so the map and ranked list behave as one production board instead of two stacked cards. The left pane follows a deliberate hierarchy: 36px/28px heading space, 28px field margins, 28–30px list/tooling gutters, then a fixed provenance footer.

The normal rhythm is 4, 8, 12, 15, 16, 20, 24, 28, and 36px. Keep list rows compact, with a 25px number column and a separate 36px action affordance; this leaves scanning room for Thai place names and crew facts.

At `1020px` and below, collapse the split workspace into a single column: results first, then a 570px map. Surface a compact “ดูหมุด” action beside the source status so a crew member can jump directly from evidence to geography; it moves keyboard focus to the map after the scroll. At `650px` and below, remove the 16px outer frame; use a 55px top bar; hide nonessential top-bar context and the Recce Board shortcut; reduce pane gutters to 16–20px; preserve a 520px map; and make interactive card, close, save, dock, and Leaflet zoom targets at least 44px. The map dock remains over the map, but moves to 15px margins and sits above the legend/controls.

## Elevation & Depth

Depth is a restrained hybrid: the large sheet is defined by borders and shared geometry, while only brief entry, selected evidence, map controls, popups, and the selected-location dock rise above their local context. Shadows are blue-tinted and diffuse, never black or dramatic. The map itself provides spatial depth; UI panels need only enough lift to remain legible over it.

### Shadow Vocabulary

- **Brand offset:** `2px 3px 0 #6f4849` — a small printed-registration offset behind the blue brand mark.
- **Field lift:** `0 9px 28px rgba(40,81,133,.08)` — the creative brief field above the paper sheet.
- **Selected evidence:** `0 4px 14px rgba(111,72,73,.07)` — the chosen row, intentionally quieter than a popup.
- **Map utility lift:** `0 5px 16px rgba(40,81,133,.08)` — labels, legend, and map tools over cartography.
- **Dock lift:** `0 14px 32px rgba(25,58,97,.16)` — the selected-location dock, the strongest persistent overlay.

**The Map-First Depth Rule.** Lift only interfaces that must float over a map or clarify a current decision. At rest, results belong to the paper through alignment and rules, not card shadows.

## Shapes

The sheet has gently rounded 16px outer corners. Most controls are practical 8px rectangles; result rows and the dock grow to 12px; the brief field is 14px. The signature geometry is the asymmetric folded corner (`8px 8px 8px 3px`) on the orange search button and the `10px 4px 10px 4px` mark/dock icon. Pills are reserved for optional suggestions and compact counts. Map pins are directional teardrops made from a rotated square with three rounded corners, explicitly tied to spatial location.

Borders are fine, blue-tinted, and low contrast. Do not create a card grid inside the result pane: use one shared paper surface, rows, dividers, and state changes.

## Components

### Navigation

The top bar is the sheet’s registration strip: product mark on the left, low-contrast live/provenance context in the center, and Recce/account actions on the right. The active view switcher belongs below the brief; it uses muted text at rest, Scout Blue text when active, and a 2px Call Sheet Orange underline. On mobile, retain brand and account access but remove explanatory center text and the top Recce shortcut.

### Brief Field

The brief field is the creative-to-operational handoff. It is a white 14px-radius panel with a blue-tinted border and ambient lift; its header pairs a small icon/label with an agent-status indicator and a quiet reset action when text is present. The textarea is borderless, 14px body text, at least 96px high, and visibly resizable. The province control and search action sit beneath a single top rule. Ctrl/Cmd+Enter runs the current brief without moving focus away from writing.

### Buttons

- **Search:** Call Sheet Orange fill, white 12px/800 text, asymmetric 8px/3px folded corner, 9px × 13px padding, and an orange 4px printed edge. Hover rises 2px and extends that edge to 6px; active settles 2px with a 2px edge. Disabled state uses `opacity: .65` and `cursor: wait`.
- **Utility / Ask AI:** White with a subtle blue border and Scout Blue icon/text. Hover fills Scout Blue and reverses to white. The square utility action is 36px on desktop and at least 44px on mobile.
- **Save Recce:** Starts as a white outlined control. On save, it switches to solid Recce Wine with white text and retains its position/index, so the state reads as commitment rather than a transient success toast.
- **Dock action:** Scout Blue solid action on the map dock; it drops its text on small screens only after retaining a 44px icon target and an accessible name.

### Chips

Suggestion chips are the only pill treatment: pale wine fill, wine text, fine wine border, 4px × 8px padding. Hover reverses to white text on Recce Wine. Result tags are smaller practical labels: category uses pale wine; production capability uses pale blue. Do not use pills for primary navigation or location cards.

### Cards / Containers

The workspace itself is the main container. Location results are 12px-radius rows, not independent cards: transparent at rest, mist-tinted on hover, and warm-white selected state with an orange-tinted border, a left inset, and quiet wine-tinted lift. The map dock is a 12px rounded white overlay with its stronger dock lift and a folded orange icon tile. Brief content and map overlays may be raised; routine rows remain flat.

### Location Result

Each row is a two-column decision unit: an indexed main button on the left and explicit AI/save controls on the right. Keep the title to one line, metadata compact, the insight to two lines, and tag facts beneath it. Selection sets `aria-pressed`; saving changes both the row button and map pin/route state. The ranking number, match score, selected visual state, recce index, and map pin must all agree.

### Map System

The Leaflet canvas is a live work surface, not a decorative image. Blue pins are ordinary results; orange is the selected pin; wine is a saved Recce point and carries its `#` order. Two or more saved places are joined by a 4px orange dashed route (`6 8`). Selecting a result flies to it over 0.8 seconds at zoom 14 and opens its grounded popup; if no item is selected, fit bounds to available pins. Overlays use near-opaque white (`.93–.97`) and the same 8–12px control geometry as the sheet.

### Location Dossier Modal

The AI detail surface is a full-viewport dossier (`z-index: 2000`) so Leaflet controls, pins, and popups can never layer above it. It has no outer padding, backdrop frame, or exposed map gutter: warm paper fills the viewport. A 270px mist sidebar keeps the creative brief, source facts, coordinates, contact detail, and grounding warning visible, while the scrollable main column holds source description, cinematic read, logistics, permits, and grounded Q&A. On small screens, the sidebar becomes a two-column facts strip above the document. Escape and the clearly labelled close control dismiss the dossier; opening moves focus to close, Tab is contained inside the dialog, and dismissal restores focus to the invoker. Failure states offer an explicit retry rather than requiring dismissal and reopening.

### Loading, Empty, and Error States

Loading uses three 110px rounded skeleton rows with a cool blue-grey 1.2s sweep. Search failure is an inline, accessible alert with muted rose text on a pale rose surface; it should not replace existing evidence. Empty results keep the list area intact and pair an orange compass icon with a direct Thai next step. Map loading uses a rotated orange pin mark and concise progress text.

### Motion and Interaction

Use short, mechanical state feedback: `.15–.18s ease` for row, chip, and control color changes; `.16s ease` for the search-button press; `.75s linear infinite` for the loader; `1.2s ease infinite` for skeleton loading; and Leaflet’s `0.8s` fly-to for a selected place. Motion demonstrates state and geography, never adds atmosphere. Respect `prefers-reduced-motion` by removing nonessential transforms, map fly animation, and repeating shimmer/spinner animation while leaving the final state immediately visible.

### Accessibility

All controls retain native semantic elements and visible keyboard focus: a 3px Call Sheet Orange outline offset by 3px. Every icon-only action has an accessible name; the brief has a visually hidden label; list updates are announced with `aria-live="polite"`; search errors use `role="alert"`; view/result selection uses `aria-pressed`; and map, workspace, and view switcher have descriptive accessible labels. Maintain readable Navy/Ink text on paper and white, do not convey selected/saved/ordinary map status by color alone (use selected state, numbering, labels, and route semantics), and preserve the 44px mobile target rules.

## Do's and Don'ts

### Do:

- **Do** keep the map and ranked list semantically synchronized: a selected location is orange and opens its map context; a saved location is wine and receives the same Recce order everywhere.
- **Do** let the warm paper pane carry brief, facts, and decisions while the cool map owns geography.
- **Do** use compact, concrete metadata and grounded-source status around every creative inference.
- **Do** use the asymmetric folded-corner treatment only for intentional action marks, not as a general radius replacement.
- **Do** preserve keyboard focus, Thai language labels, live/error announcements, and mobile 44px touch targets whenever a component is extended.

### Don't:

- **Don't** turn ThaiScout AI into a generic travel booking or destination-discovery interface; this is a production desk.
- **Don't** use Call Sheet Orange and Recce Wine interchangeably, or scatter them across large decorative surfaces.
- **Don't** fragment the result list into many elevated cards, rounded pills, or decorative gradients.
- **Don't** hide map selection, saved state, or route order in color alone.
- **Don't** add slow, ambient, or autoplay motion; interactions should communicate a decision, search, or change in geographic context.
