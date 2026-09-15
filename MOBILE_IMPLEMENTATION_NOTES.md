# Mobile implementation and verification

Implementation date: September 12, 2026 (America/Chicago).
Layout separation verified: September 14, 2026 (America/New_York).

The approved responsive implementation is complete locally. Physical mobile
verification and the additional browser checks listed below remain pending.
Nothing has been deployed.

## Delivered behavior

- One chart and scenario controller remain mounted while layouts change. Phones
  and tablets use a scrolling page; desktop layout begins at 1,224px using the
  shared breakpoint definition.
- Full and compact results show the inputs that produced their completed values.
  On phones and tablets, the return comparison comes first in both visual and
  keyboard order. Desktop restores the original Ratchets + Argon Shorts = Accrued
  Cash = Liquid Returns vs Hodling Returns presentation and keyboard order.
  Pending changes retain the previous result context and disable export immediately.
- Numeric editors use drafts, Save/Enter, Cancel/Escape, and validation. Quantity
  remains whole BTC; purchase value is derived. A saved 0% threshold restores
  correctly. Calendar pickers use UTC dates and the six-calendar-month rule,
  including month-end and leap-year cases, through December 31, 2025.
- Start and End selectors determine which overlapping 44px handle receives a
  drag. Handles also support keyboard adjustment. Pointer capture is released
  on completion, cancellation, Escape, resize, and component disposal.
- Chart geometry updates after Chart.js layout. Mobile axis labels use the actual
  time scale and reduce their density on narrow screens; desktop uses the original
  divided year strip. Chart prices are shown through the range endpoints;
  hovering or tapping the chart does not open a price/fee tooltip.
- Editors and explanations use contained dialogs. Navigation and educational
  dialogs work at phone widths. Editor sheets follow the visual viewport when
  available, including its reduced height while a software keyboard is open.
  Event subscriptions are disposed with their
  components; price-drop and removal dialogs use stable handlers.
- Mobile activity rows expand to show every field and render in batches of 25.
  Desktop retains the seven-column activity table. Exports contain every daily
  record, independently of the number of rendered activity rows.
- The guided tour is desktop-only. Mobile has optional help, FAQs, video, and
  whitepapers, with an “Explore the simulator” welcome action. A desktop tour
  pauses on mobile and resumes at its existing step when desktop returns.
- Focus styles, control names, keyboard operation, reduced-motion handling,
  flexible widths, and safe-area spacing are included.

No dependency was added. Vault formulas, historical datasets, the fixed Argon
target, CSV columns, and the saved scenario schema remain unchanged. Request
identifiers and calculation metadata are runtime-only. The desktop page can
scroll on short windows so its controls and chart axis remain reachable.

## Automated verification

| Check | Result |
| --- | --- |
| Original accounting suite | All 14 existing tests pass; expected values unchanged |
| Full test suite | 35 tests pass across five files |
| UTC/date checks in America/Chicago | Full suite passes |
| UTC/date checks in Asia/Tokyo | All 13 scenario, store, and historical tests pass |
| `yarn exec vue-tsc -b` | Passes with no type errors |
| `yarn build` | Passes |
| `git diff --check` | Passes |

The new tests cover numeric normalization, invalid drafts, UTC conversion,
month-end date bounds, restoration, inactive drops and EXIT, worker coalescing,
delayed/out-of-order responses, failures/retry, disposal, export readiness, and
detached export snapshots. Historical scenarios include six-month ranges near
both data boundaries, multiple BTC, 0% and 100% thresholds, a full-history range,
multiple ordinary drops, and an EXIT drop.

The ZIP integration test runs the existing exporter, opens the resulting archive,
and checks `data/data.csv`, all 585 default-scenario daily rows, the unchanged
16-column header, and the final net returns.

### Recorded default comparison

Inputs: October 2, 2020 through May 9, 2022; 1 BTC; 10% ratchet threshold; no
configured drops; fixed $1.058 target.

| Output                     | Before | After |
|----------------------------| --- | --- |
| Ratchets                   | 59 | 59 |
| Argon Shorts               | 0 | 0 |
| Accrued cash, displayed    | $170.4K | $170.4K |
| Liquid returns, displayed  | 1,505% | 1,505% |
| Hodling returns, displayed | 221% | 221% |

The historical regression test additionally checks accrued cash of $170,402.76,
final accrued value of $170,397.93, and 61 vault actions. Displayed cash and final
accrued value are distinct existing model outputs; they are not interchangeable.

The pre-existing Vite warning about chunks larger than 500 kB remains. The main
JavaScript bundle is approximately 1.24 MB before gzip versus 1.26 MB at baseline;
the worker remains approximately 567 kB. This work does not introduce code
splitting. These sizes are not a substitute for device latency measurements.

## Browser verification performed

Environment: Codex in-app browser on macOS 26.6.1, build 25G76. The embedded browser
engine/version was not exposed by the available controls; no claim is made about
other browser versions.

Viewport coverage: 320×568, 375×667, 390×844, 568×320, 844×390, 767×768,
768×1024, 1024×768, 1223×768, 1224×768, 1279×720, 1280×720, and 1920×1080.
After layout settles, the checked pages fit the viewport horizontally. Resizing
keeps one canvas and preserves the selected dates.

Verified workflows:

- Enter rounds 3.6 BTC to 4 and starts a new calculation. The pending display
  retains the old quantity until its replacement completes.
- Blank and malformed numeric values show an error; Cancel and Escape preserve
  committed values. A numeric draft survives 390px to 1,224px resizing.
- Saving 0% and reloading preserves the disabled threshold.
- Calendar selection commits the chosen UTC date. Calendar navigation remains
  inside the editor; short-landscape calendar content scrolls with Close reachable.
- Add/cancel/reopen/insert and remove/cancel/reopen/remove produce one action.
- Keyboard Home on End clamps to the minimum six-month range. At 390px, dragging
  the shared handle area with End selected changes only End; repeating with Start
  selected changes only Start. The dragging cursor clears on release.
- Clicking a result at phone width and pressing Enter at desktop width open a
  stable explanation directly. View full results scrolls to and focuses results.
- Activity expands from 25 to 50 to all 61 default actions. Expanded rows expose
  BTC price, fees, accrued cash, and accrued value. The desktop table exposes all
  seven columns in a bounded panel.
- The download control can be activated when ready. ZIP contents are independently
  verified by the automated integration test; native mobile saving/sharing remains
  part of device verification.
- Reset restores defaults and the welcome screen; skipping welcome works.
- The initial implementation tested all four mobile tour topics and desktop tour
  panels. Mobile tours were subsequently removed by request; see the layout
  separation verification below for current behavior.
- FAQ, formulas, and whitepaper navigation fit phone widths. The formula image
  loads. The existing Wistia player initializes, plays, pauses, and closes in the
  mobile video dialog.

Browser checks used the available UI automation. They are not a committed browser
test harness or a physical touch-device test.

### Follow-up: first-visit desktop dialog

Caleb's screenshot exposed a regression missed by the initial wide-screen checks:
the shared mobile rule overrode the welcome dialog's desktop maximum width. The
rule now constrains `width` while preserving each dialog's `max-width`. A fresh
first-visit browser tab verified the centered 768px welcome card at 1280×720,
1920×1080, and 2560×1440, plus contained widths at 320×568 and 390×844. The welcome
screen scrolls to its working Skip action on shorter displays. The build passes.

### Follow-up: original desktop main page restored

At 1,224px and wider, the main page restores the original purple logo, compact
header icons, equation-style scoreboard, introduction, uppercase configuration
sentences, inline editor triggers, price-drop section, action buttons, tall slider
rails, nibs, and divided 2010–2025 year strip. The mobile layout and shared
validation/calculation paths remain in place. At that stage, desktop and mobile
date triggers had distinct IDs and remained mounted. The layout separation below
replaces that arrangement with one shared editor host and interchangeable triggers.
The welcome dialog was not changed by this restoration.

Verification used an untouched Git HEAD copy (`3c3826c`) served temporarily on a
separate local port. At 1728×999 CSS pixels (the supplied screenshot's 3456×1998
retina resolution), the scoreboard cards, introduction, configuration block,
action row, canvas, and year strip matched the original measured positions and
dimensions, within subpixel rounding. Both versions were also compared visually.
The original proportional layout was checked at 1920×1080. The temporary baseline
server and browser tab were closed afterward.

Additional live checks in the Codex in-app browser:

- 320×740, 390×844, 768×1024, 1223×768, 1224×768, 1280×720,
  1728×999, and 1920×1080: no horizontal page overflow; one chart canvas;
  mobile/desktop controls and metric order switch at the shared breakpoint.
- Desktop date editor stays open and usable after switching to 390px width.
- Mobile quantity changes save and recalculate, and persist when returning to
  desktop. The reference quantity of one BTC was restored after checking.
- Keyboard arrows change the endpoint by one day. Dragging the restored nib
  updates the date and results; its calendar restores the reference date.
- The help icon opens its menu; result buttons open the matching explanation.
- The invisible 44px desktop nib hit area stays within the page bounds, avoiding
  extra vertical scrolling while preserving the original visible nib position.
- Reference results remain 59 ratchets, zero argon shorts, $170.4K accrued cash,
  1,505% Liquid Returns, and 221% Hodling Returns.
- All 32 tests pass. Type checking, production build, and whitespace checks pass.
  The existing bundle-size warning remains. No physical-device coverage is implied.

### Follow-up: chart price tooltip removed

Per Caleb's request, the chart no longer renders the floating price/fee tooltip
or reacts to hover/tap inspection. The range-bar price labels remain available
and update as the bars move. Live browser checks confirmed that chart clicks show
no tooltip and dragging a bar updates its date and attached price. Type checking
passes. This supersedes the earlier tap-to-inspect behavior in the mobile plan.

### Follow-up: separate desktop and mobile presentation

The approved September 14 refactor introduces `src/layouts/DesktopLayout.vue`
and `MobileLayout.vue`, plus separate headers and result presentations in the
same directory. Each presentation owns its markup and styles. `Header.vue`
selects the header; `Main.vue` selects the scenario presentation while retaining
the chart, range controller, selected endpoint, and gesture lifecycle.

Both presentations use the existing simulator store, worker queue, scenario
validation, and exports. `SimulationResults.ts` formats and explains the completed
snapshot for either results view. `ScenarioEditor.ts` holds the current field,
draft, errors, and commit actions. `ScenarioEditorDialog.vue` is mounted once in
`App.vue`, so replacing a layout cannot destroy the editor or its calendar's
navigated month. Closing restores focus to the current layout's matching trigger.
The shared price-drop, help, and other dialog hosts remain outside the branches.

The old combined `ResultsSummary.vue` and `MobileTour.vue` are removed. Mobile
has no tour steps, menu entry, welcome recommendation, or FAQ tour instructions.
Desktop keeps its tour anchors, four steps, and saved progress. Desktop activity
closes when leaving its layout; shared scenario data and open dialogs persist.

Verification in a fresh Codex in-app browser session:

- At 1728×999, before/after measurements of the header, branding, scoreboard,
  introduction, configuration, price-drop section, actions, chart region, and
  canvas match exactly. The desktop screenshot was also compared visually.
- At 320×568, 390×844, 768×1024, 1223×768, 1224×768, 1280×720, and
  1920×1080, exactly one scenario layout and one canvas are present, with no
  horizontal overflow. Inputs and all five reference results survive resizing.
- A desktop quantity draft of 3.6 survives resizing to mobile; Enter saves four
  BTC through the shared commit path and restores focus. The reference quantity
  was restored afterward.
- A mobile date editor navigated from October to November retains that calendar
  month on desktop. Choosing November 2 commits the start date and restores focus
  to the desktop trigger. October 2 was restored afterward.
- Desktop range-bar dragging still updates its endpoint, and the dragging state
  clears on release. Chart clicks do not open a price tooltip.
- First-visit mobile welcome provides “Explore the simulator.” Mobile menu and
  FAQ contain no tour instructions. A desktop tour paused at step two disappears
  on mobile, resumes at step two on desktop, and reaches Finish through all four
  steps. No tour component is mounted on mobile.
- A result explanation opens on mobile and remains open when desktop mounts.
  The clean test session reports no browser console errors.
- All 35 tests pass, including three added editor integration tests covering
  presentation disposal, draft/cancel/validation behavior, and current date bounds.
  Type checking, production build, and whitespace checks pass. The existing Vite
  warning for bundles larger than 500 kB remains.

These are browser viewport checks, not physical-device or standalone browser
certification. No dependency, calculation formula, dataset, or persistence schema
changed in this refactor.

### Follow-up: restore original desktop control overlays

The approved restoration uses the Git version as the desktop visual reference.
`DesktopPopover.vue` positions the compact quantity/ratchet editors, calendars,
activity table, result explanations, control tooltips, and header help menu with
the existing Popper dependency. Panels retain their original arrows, dimensions,
and compact spacing; overflow handling keeps them usable near viewport edges.
`DesktopDialog.vue` supplies the original price-drop and removal modal shell.
Existing desktop help/video dialogs regain their original close-button placement.

`ScenarioEditorFields.vue` shares the form and commit behavior between desktop
popovers and mobile sheets. Drafts, validation errors, and calendar navigation
live in the shared editor session. Keyboard focus moves after positioning makes
the panel visible; Escape returns it to the trigger. Desktop config row guidance
and Add Price Drop explanations are restored. The mobile menu has no tour code.

Live verification against an untouched Git copy on a separate local preview:

- At 1728×999, the quantity popover matches the reference rectangle exactly:
  300×158 at x=80, y=401.296875. The Vault Activity table also matches exactly:
  width 831.7265625, top 20, bottom 609.296875, with all 61 reference rows.
- Quantity Save, arrow adjustment, Cancel, Escape, and date selection work.
  A quantity draft survives desktop → 390px mobile → desktop; selecting a date
  updates the range. Calendar navigation survives both layout changes.
- At 1280×720, ratchet editing, the scrolling activity table, and the exit
  calendar stay in the viewport; the calendar flips above its trigger as needed.
- Result explanations and help open on desktop. Add Price Drop rejects an empty
  date, accepts a valid date/price, recalculates, and opens the original removal
  confirmation. Removal restores the reference scenario. A price-drop draft also
  survives changing to mobile. Reset, FAQ, details/formula, whitepapers, and video
  overlays open and dismiss. External document navigation and video playback
  were not part of this restoration check.
- 320×568, 390×844, 768×1024, 1223×768, 1224×768, 1280×720,
  1728×999, and 1920×1080 retain one canvas and have no horizontal page overflow.
  Mobile activity still expands into detail rows and offers batched loading.
- The desktop tour reaches all four steps, disappears on mobile, resumes on
  desktop, and finishes. Mobile has no tour component or menu action.
- Dragging the middle of the tall start bar changes its endpoint; the date
  calendar restores it. The removed chart price tooltip remains absent.
- Activity row hover uses the original lock marker and highlights entry/exit
  range bars; closing the table clears the highlight.
- The fresh test preview reports no browser console errors. All 37 tests pass,
  including calendar-session persistence and draft-only bounded arrow updates.
  Type checking and the production build pass; the existing bundle-size warning
  remains. No calculation formula, dataset, dependency, or persisted schema was
  changed for this restoration.

These checks used browser viewport emulation, not physical devices.

### Follow-up: show the complete Bitcoin history

The approved full-history change removes the December 31, 2025 display cutoff.
`ScenarioConfig.ts` derives the selectable range from every bundled price record,
and `Main.vue` passes that same range to the chart. `ChartOptions.ts`, `Chart.vue`,
and `XAxis.vue` generate year intervals from the real scale bounds, preserving
the compact year/divider styling and allowing partial first and last years.
Mobile labels leave room for the final year. The tour reads the shared bounds.

The bundled data currently has 5,869 price records, from August 18, 2010 through
September 11, 2026. Future dataset updates extend the range and labels after a
rebuild/reload. Existing selected dates remain selected. The six-calendar-month
minimum, calculations, price/fee datasets, and storage format are unchanged.

Verification:

- All 42 tests pass with `yarn test --maxWorkers=1 --no-file-parallelism`.
  Coverage includes the final date in the editor, worker request, persisted
  scenario, and export; full-history and latest-six-month calculation/export
  consistency; and appending another year of records without a fixed cutoff.
  Year intervals also include a newly arriving January 1 record.
- The initial parallel run hit the existing ZIP-export test's five-second
  timeout during unusually slow local execution. The serial rerun passed using
  the existing test timeout; no test timeout or build configuration was changed.
- Type checking and the production build pass. Vite's existing large-bundle
  warning remains.
- Live desktop checks confirmed the year labels extend through 2026, the end
  handle reaches September 11, 2026, and moving beyond the boundary is clamped.
  The calendar enables the final day and disables later days/months. The latest
  endpoint price is $76,540.35.
- Mobile calendar selection between September 10 and 11 updates the endpoint
  and price. The latest selected date survives switching layouts and reloading.
- At 320×568, 390×844, 768×1024, 1223×768, 1224×768, 1280×720,
  1728×999, and 1920×1080, the page has one canvas and no horizontal overflow.
  Desktop and phone screenshots were inspected for year-label spacing.
- The desktop tour displays the actual first and last dataset dates.

These are local browser viewport checks, not physical-device certification.

## Checks still required before release

Caleb or a designated tester should record the exact device, OS, and browser
versions when completing these checks:

1. Physical iOS Safari and Android Chrome: repeat editing, date selection, help,
   activity, playback, reset, and downloading/sharing the ZIP. Mobile should have
   no guided tour.
2. Software keyboards: focused numeric fields, Save, Cancel, Close, and scrolling
   remain reachable in portrait and landscape, including notched devices.
3. Actual touch gestures: vertical scroll beginning on a handle, horizontal drag,
   pinch zoom, pointer cancellation, a second finger, interrupted capture, and
   rotation during a drag. The cancellation paths are implemented; physical
   behavior has not been verified here.
4. Increased system text size, 200% browser zoom, VoiceOver/TalkBack, reduced-motion
   settings, and mixed touch/keyboard input on large tablets.
5. Current standalone desktop Safari/Chrome (and any other intended support target),
   including native download completion and keyboard focus restoration.
6. Measure input responsiveness, worker completion latency, and scrolling on a
   representative midrange phone with long simulations. No hardware performance
   benchmark or before/after interaction-latency comparison was available locally.

Complete these checks and obtain publication authorization before deployment.
