# Mobile-Friendly Implementation Plan

Status: implementation approved by Caleb and completed locally. The original source-review findings below describe the pre-implementation baseline. See [MOBILE_IMPLEMENTATION_NOTES.md](MOBILE_IMPLEMENTATION_NOTES.md) for completed checks and remaining release verification. Deployment has not been authorized or performed.

September 14 revision: separate desktop/mobile presentation over shared state,
chart/controller, editor sessions, and calculation libraries. The guided tour is
desktop-only; mobile retains optional help and FAQs.

Desktop overlay restoration: preserve the original Git presentation for every
desktop control, including compact numeric editors, anchored calendars and result
explanations, the activity table above its button, the header help menu, and
price-drop/confirmation dialogs. Mobile keeps its own sheets and expandable
activity. Share editor fields, draft state, validation, and calculation results.

Full-history follow-up approved: derive the chart and selectable date range from
the complete Bitcoin dataset. Generate desktop/mobile year labels and tour date
text from those bounds. This supersedes the original redesign's December 31,
2025 cutoff; updating and rebuilding the dataset should extend the UI without
another code change. Keep existing selected dates and the six-month minimum.

## Objective and scope

Make the simulator usable on phones and tablets while preserving its desktop experience and financial calculations. This is a responsive UI redesign with targeted corrections to input handling, calculation readiness, and component lifecycle.

Keep the vault formulas, historical datasets, Argon target snapshot, routing, and stored configuration format unchanged. Small changes to the store, worker queue, worker messages, and presentation utilities are in scope where necessary to keep inputs, results, and exports consistent. Runtime calculation identifiers must not become new persisted scenario fields.

No new runtime dependency is expected. Reuse Vue, Pinia, Chart.js, Headless UI, the existing calendar, and Vitest. Any additional development dependency needed for browser testing must be identified before installation through the normal change-control workflow.

## Current behavior and verified constraints

- `src/App.vue` replaces the simulator with a larger-screen message below 1,224px.
- The application shell uses `h-screen` and a 60rem minimum width.
- The header uses fixed-width sections and an absolutely positioned scoreboard.
- `src/panels/Main.vue` places configuration and explanatory text over the chart using absolute positioning.
- Hover opens several explanations; clicking a returns statistic currently only changes whether an already-open insight stays visible.
- Chart handles use pointer capture, but lack cancellation handling and are small. At a six-month selection, their centers would be approximately 9px apart on a 320px viewport and 11px apart on a 390px viewport, assuming the current timeline and 50px chart padding.
- Chart markers perform some collision and resize handling, but the endpoint coordinates owned by Main are not consistently recomputed after the chart changes size.
- Global insight and tooltip utilities produce viewport coordinates that are used by absolutely positioned overlays. A scrolling page requires a consistent positioning strategy.
- The desktop tour relies on viewport cutouts and polls target positions every 100ms. Its instructions include dragging and mouse hover.
- The activity panel is an anchored, seven-column table.
- Calculations already run in a worker. `VaultQueue` keeps the latest pending request, but publishes completed snapshots even when newer inputs exist.
- Download handlers await a boolean `isLoaded` property rather than calculation completion. The snapshot property is never set to true in the current calculation path.
- A saved 0% ratchet threshold restores as 10% because the store uses a truthy fallback.
- Pressing Enter in the numeric editor calls `save()` without its required close callback.
- Configuration is saved in session storage. Reload in the same session is supported; this work does not introduce cross-device or permanent persistence.
- At review time, the dataset begins on August 18, 2010 and extends through September 11, 2026. The chart's nominal lower bound is August 17, 2010 and its displayed upper bound is December 31, 2025.

The implementation should address the listed readiness, editor, and lifecycle problems where they intersect the mobile workflows. Preserve correct desktop behavior while recording these deliberate corrections separately from visual changes.

## Responsive layout and interaction decisions

### Layout breakpoints

| Available width | Layout |
| --- | --- |
| 320–767px | Single column; compact results; separate chart and scenario sections; expandable activity rows |
| 768–1,223px | Wider stacked sections; results may share one row; two-column form fields where they fit; expandable activity rows |
| 1,224px and above | Restore the original desktop appearance, including the header, scoreboard, configuration sentences, and chart styling; retain the desktop activity table |

Use one shared definition for the 1,224px layout boundary wherever both CSS and JavaScript require it. Add a named Tailwind screen and a small shared layout helper if needed; do not independently duplicate numerical thresholds throughout components. Audit existing `xl:` rules at 1,280px so they do not accidentally control the new desktop mode.

Breakpoints choose layout, not input capability. Touch, keyboard, and mouse must work at every supported width, including large tablets and narrow desktop windows. Hover may remain a convenience; every essential action must have an explicit activation path. Use the event's pointer type and capability queries only for enhancements.

### Phone and tablet page order

1. Compact branding and a labeled actions menu.
2. Full results comparison, with the range and quantity that produced those results.
3. Bitcoin price chart.
4. Start and End date controls immediately below the chart, with the corresponding bought/exited prices and explicit endpoint selection.
5. Bitcoin quantity, calculated purchase value, and ratchet threshold.
6. Configured Argon price drops and the Add action.
7. Compact result summary repeated beside the end of the scenario controls, followed by a View full results button.
8. Expandable vault activity and download action.
9. Expandable introduction and links to video, FAQ, formulas, and whitepapers.

The compact result summary uses the same completed result model as the full scoreboard. It appears in normal document flow so it remains reachable without obscuring inputs or the software keyboard. Valid edits update its pending/completed state. View full results scrolls to and focuses the full results section, respecting reduced-motion preferences.

Present the two return percentages as the primary comparison. Ratchets, Argon shorts, and accrued cash are supporting statistics. Allow all dates, titles, labels, and large values to wrap. Retain visible context explaining the fixed mainnet target used by the simulation.

Use one column for result cards when two columns cannot fit at the user's text size. On phones, begin with a chart height around 320px; allow additional height on taller screens and a shorter chart on short landscape viewports. Final sizing must be verified at the baseline review stage.

### Chart endpoint selection

Keep date fields as the precise way to choose a range. Retain dragging as a convenience.

Provide two distinct, labeled Start and End selection buttons beside the date fields. Start is selected initially on phone/tablet; tapping either selector changes the endpoint that receives a drag in an overlapping handle area. Reflect selection visually and through accessible state.

When handle hit areas do not overlap, directly pressing a handle selects and drags that endpoint. When they overlap, the previously selected endpoint owns the shared area. Apply this rule at any viewport width where overlap occurs. Keep the two endpoint selectors reachable so either endpoint remains selectable without precision tapping.

Increase handle activation areas to at least 44×44 CSS pixels around the nibs; do not turn the entire chart into overlapping drag zones. Preserve the line and nib appearance where practical. On desktop, preserve the existing modifier-key behavior for moving both endpoints.

On phone/tablet, show persistent bought/exited dates and prices below the chart instead of keeping both floating endpoint labels inside it. Per Caleb's follow-up, price inspection uses the range endpoints; hovering or tapping the chart must not open a price tooltip.

## Input and scenario contract

Use a shared validation and commit path for desktop editors, mobile controls, keyboard adjustments, and chart gestures. Separate draft input, committed scenario state, and completed calculation results.

| Field or operation | Required behavior |
| --- | --- |
| Bitcoin quantity | Finite whole BTC with a minimum of one; preserve the current rounding/minimum normalization on commit and show the normalized value |
| Purchase value | Read-only value calculated from historical price and committed quantity; do not introduce a new price or dollar-amount input |
| Ratchet threshold | Finite percentage from 0 to 100; preserve clamping on commit; zero disables ratcheting and must survive reload |
| Start and End dates | Date-only UTC values; endpoints must exist in the dataset and stay within the supported display horizon |
| Minimum duration | At least six calendar months, using UTC calendar arithmetic rather than an approximate number of days |
| Display horizon | Derive both bounds from the complete Bitcoin dataset; use the same range for the chart, calendars, handles, year labels, and tour text |
| Ordinary price drop | A date strictly inside the selected range, no duplicate drop on that date, and a finite USD price greater than zero and below the fixed Argon target |
| Existing EXIT drop | Preserve the EXIT sentinel and its interpretation when the exit date changes; do not convert it into an ordinary dated drop |
| Invalid or incomplete draft | Show a field-specific error; do not start a calculation or save NaN, an unavailable date, or a partial numeric string |
| Out-of-range configured drops | Keep saved drops when the range changes, apply only eligible drops to the simulation, and identify inactive drops in the configuration list |
| Reset | Keep the confirmation flow and restore the existing defaults; discard transient editor and calculation state |

Numeric editors keep Save and Cancel. Typing changes a draft; Save or Enter validates and commits once. Cancel or Escape discards the draft. Use numeric/decimal input modes appropriate to each field while allowing temporary editing states such as an empty string or trailing decimal point.

For standalone endpoint calendars, selecting a valid date commits once and closes the picker. Disable unavailable and disallowed dates. Any direct date-entry path must validate before committing rather than silently replacing an invalid date with an unrelated endpoint. Gesture updates may clamp at valid boundaries.

Use the existing calendar within a contained mobile editor sheet, with practical month/year navigation across the supported history. A calendar inside the Add Price Drop dialog stays within that dialog's focus and scrolling context; it does not create a competing modal.

Price-drop date and price remain drafts until Insert. Revalidate both against the latest committed scenario when inserting. Cancel and reopening must not leave stale listeners or cause a later insertion to happen twice.

Normalize saved configuration on initial load before calculating. Preserve valid existing configurations and the current session-storage format. Scope restoration changes to validated defaults and the confirmed zero-threshold bug.

## Architecture and state ownership

### One chart and one scenario controller

Keep one mounted chart and one scenario controller throughout responsive layout changes. Use separate desktop and mobile presentation components for headers, scenario controls, and results. Keep committed state, validation, calculations, exports, result formatting, and editor sessions shared. Mount the editor dialog and other overlays outside the conditional layout branches so open drafts and calendar navigation survive resizing.

Main remains the scenario coordinator. Extract validation/date lookup helpers from chart-dependent UI methods so a committed scenario can be validated without depending on canvas pixel positions. Shared results components consume one result model and must not create their own calculation requests.

Keep global dialogs mounted under stable ownership in App. Changing a breakpoint must not recreate the simulator, restart calculations, duplicate DOM IDs, or discard a valid editor draft. Keep the active dialog open and reflow its content. Preserve focus or move it to the equivalent visible control.

Remove event-bus handlers with the exact callback used to register them. Replace per-open response listeners with stable handlers or explicitly dispose them on both success and cancellation. Clean up observers, timers, pointer capture, scheduled animation frames, and global keyboard listeners.

### Results must match a completed request

Assign a monotonically increasing runtime request identifier to every committed scenario change that requires recalculation. Mark the requested scenario as pending immediately, including when submission is deferred until an animation frame.

Include the identifier and a normalized copy of the calculation inputs with the worker request and response. Retain the queue's existing latest-pending-request behavior. Only promote a response to the current result when it matches the latest requested identifier.

The previous completed result may remain visible during calculation, labeled Updating and accompanied by its own completed date range and quantity. Do not relabel old percentages with new inputs or combine old snapshot amounts with new quantities in a breakdown.

Expose explicit idle/pending/ready/error state. Mark a snapshot ready only after a successful complete calculation. Distinguish initial data availability from calculation completion. If a worker calculation fails, show a retry path and prevent export of a misleading result.

Full results, the compact summary, breakdowns, activity, and exported data must all consume the same completed result and its inputs. Refresh or dismiss open breakdowns consistently when the completed result changes.

Disable export until the latest requested scenario is complete, and guard the export handler as well as the button. Capture that immutable completed snapshot when exporting. Remove the ineffective boolean await from both current download paths. A later edit must not change an export already being generated from the captured snapshot.

### Resize changes geometry, not scenario state

Use a separate geometry synchronization path. Recompute handles, selected-range shading, markers, highlights, and label placement after Chart.js has finished updating its layout. A container observer may initiate the work, but reading old point positions directly during a pre-layout resize callback is insufficient.

Coordinate conversions must use the actual canvas bounds and Chart.js coordinate space, including container padding, document scroll, device-pixel scaling, and horizontal offsets.

Do not call functions that clamp dates, save configuration, or run the vault merely to reposition a marker. Size changes, orientation changes, text wrapping, and opening a section must not alter the selected scenario.

If layout changes during a drag, finish at the last valid selection and clear gesture state safely before refreshing geometry.

## Overlay, help, and onboarding decisions

### Help and editor presentation

On phone/tablet, result explanations open directly into a contained sheet using the existing dialog primitives. Activation must populate and open the requested explanation in one action. Provide a visible Close button; outside tap and Escape dismiss it and restore focus.

On desktop, restore the original anchored insights. Use the existing Popper library with fixed positioning, original arrows and dimensions, and viewport overflow handling. Reposition on relevant size changes and dismiss passive insights on scroll. Clicked explanations support outside-click and Escape dismissal. Numeric/date editors retain shared drafts and calendar navigation when their presentation changes at the breakpoint.

Update InsightUtils and TooltipUtils together with their consumers. Bound content width and height to the usable viewport. Switching to another statistic replaces the explanation; switching layout while an explanation is open reflows the same content.

Keep ordinary tooltip labels supplementary to accessible button names. Hover must never be a prerequisite for opening an explanation.

Use fluid dialog widths, safe margins, wrapping titles, and contained images. Keep the close control and focused field reachable with the software keyboard visible. Give each dialog one primary scrolling region where possible. Preserve focus trapping and avoid multiple competing modal layers.

### Activity

Use expandable activity rows below 1,224px and retain the table above that boundary. A collapsed row shows date, action, and cash change; expanding it exposes BTC price, fees, accrued cash, and accrued value with explicit labels.

Keep the whole activity section collapsed initially. Load/render rows in batches of 25 with a Show more control, preserve access to every action, and reset the batch when the completed scenario changes. Export always includes the complete result.

Remove dependence on the global event object and on space above an anchor for the mobile activity layout. Desktop table positioning must use an explicit element reference or passed event.

Keep chart highlighting as an optional enhancement. Essential activity details must be readable without returning to the chart or hovering a row.

### Onboarding

Keep the desktop spotlight tour, but make its instructions accurate for touch and keyboard users as well as mouse users.

Phone/tablet has no guided tour, tour entry points, or instructional steps. Keep optional help, FAQs, the video, and whitepapers. Its welcome screen offers “Explore the simulator” and marks welcome completed when dismissed.

Preserve the desktop tour's four steps and completion state. Desktop Previous, Next, Cancel, and Finish continue to work. Reference the actual supported date range and minimum duration, and describe the controls present in the desktop layout.

If help opens during the desktop tour, temporarily hide the tour while retaining its step. Switching to mobile unmounts the tour presentation without clearing progress; returning to desktop resumes the same step. No tour markup or positioning timer runs on mobile.

## Implementation sequence and checkpoints

### Phase 0: Baseline and layout confirmation

Before editing application code:

- Run the current accounting tests and production build.
- Record existing type-check failures from the optional type-checking build.
- Capture representative desktop screenshots and numerical outputs using the scenarios listed under Validation.
- Record the confirmed readiness, saved-zero, Enter-key, and listener-lifecycle issues so expected corrections are distinguished from regressions.
- Confirm the proposed arrangement at 320px, 390px, 768px, and 1,224px, including large values, long dates, and short landscape height.
- Verify the Start/End selection behavior and result-summary placement before investing in gesture polish.
- Finalize the component boundaries and affected-file list within this scope.

Checkpoint: a reproducible desktop baseline and a concrete phone layout with no unresolved primary interaction choices.

### Phase 1: Shared state, validation, and lifecycle

- Introduce the shared scenario validation/commit path.
- Fix zero-threshold restoration and numeric Enter/Save behavior.
- Add request identity and explicit calculation readiness.
- Make result breakdowns, activity, and exports consume consistent completed data.
- Stabilize chart/dialog ownership and clean up response listeners.
- Separate geometry synchronization from scenario changes.
- Add focused unit/integration checks for these contracts.

Checkpoint: numerical behavior is preserved, stale exports are prevented, and resize cannot change inputs.

### Phase 2: Responsive shell, results, and scenario controls

- Add the shared desktop breakpoint and audit existing responsive classes.
- Reflow Header and Main, extracting shared results and scenario controls where useful.
- Add the compact result summary and View full results action.
- Put date controls and bought/exited details adjacent to the chart.
- Replace nonwrapping scenario sentences with labeled fields on phone/tablet.
- Make price-drop rows, actions, loading content, and informational text fit narrow screens.
- Replace fixed-height/minimum-width shell assumptions with natural flow and minimum dynamic-viewport height, with an appropriate fallback.
- Add safe-area spacing where needed and verify the viewport metadata if edge-to-edge rendering is used.
- Remove the narrow-screen fallback in the implementation branch once the replacement shell and primary controls work.

Fix overflow at its source; do not hide inaccessible content with blanket horizontal overflow clipping.

Checkpoint: the simulator can be configured and its results read down to 320px without chart dragging.

### Phase 3: Chart interaction and geometry

- Implement deterministic Start/End ownership for overlapping hit areas.
- Enlarge activation targets and add selected endpoint state.
- Support horizontal dragging while preserving vertical page scrolling and browser zoom.
- Track one active pointer; ignore unrelated pointers.
- Handle pointerup, pointercancel, lost capture, unmount, and layout changes through one idempotent finalization path.
- Preserve the last valid selection on cancellation; do not derive a new date from missing cancellation coordinates.
- Batch pointer-driven UI work and persistence at most once per animation frame where useful; retain worker queue coalescing.
- Flush the final valid scenario and cancel older scheduled callbacks on release/cancellation so an earlier frame cannot overwrite it.
- Refresh geometry after chart layout and reduce axis-label density by actual chart width.
- Keep tick placement aligned to the chart's time scale and plot padding rather than evenly redistributing a shortened year list.
- Keep price inspection on the range endpoints; do not add hover/tap price callouts to the chart.
- Keep desktop endpoint labels collision-aware and preserve keyboard/modifier behavior.
- Scope keyboard shortcuts to chart interaction so typing or using a calendar/dialog cannot move the selected dates.

Measure input responsiveness and time to the final result against the baseline. Do not assume frame throttling alone addresses worker latency or long activity lists.

Checkpoint: gestures, scrolling, resizing, and precise date selection work together without changing calculation semantics.

### Phase 4: Help, dialogs, and activity

- Implement mobile explanation/editor sheets and desktop anchored positioning.
- Update the positioning utilities and explicit activation handlers together.
- Adapt all dialogs, nested calendars, confirmation actions, and video/formula sizing.
- Implement expandable activity rows and batched rendering.
- Preserve working download/video/help entry points.
- Verify that removal of the fallback's Wistia injection does not remove video initialization; retain one working initialization path.

Checkpoint: secondary workflows work by touch and keyboard on a scrolling page, including cancel/reopen cycles.

### Phase 5: Onboarding and accessibility

- Keep the tour desktop-only and remove mobile tour entry points from welcome, menu, and FAQ copy.
- Preserve resume/cancel/completion behavior across reloads and breakpoint changes.
- Convert clickable nonsemantic elements to buttons or links as appropriate.
- Add accessible names, visible focus, logical DOM/tab order, and selected-state semantics.
- Keep primary touch targets at least 44×44 CSS pixels and preserve browser zoom.
- Ensure results have textual meaning beyond color and use a restrained completion announcement, avoiding duplicate live announcements from the two result summaries.
- Respect reduced motion for chart pulses, result transitions, and scrolling.

Checkpoint: essential workflows have no hover-only or pointer-only requirement.

### Phase 6: Regression and release verification

Complete the automated, browser, and physical-device checks below. Record outcomes and known limitations.

The implementation agent owns local builds, automated checks, browser verification, and the handoff report. Caleb or a designated tester owns physical iOS and Android verification unless those devices are available to the implementation agent.

Report local implementation verification and physical-device verification separately. If physical devices are unavailable, mark those checks pending; do not claim the full release criteria are complete.

Publish the mobile experience only after its required workflows are complete. Do not deploy the blocker removal independently of the usable replacement. Deployment requires the normal publication authorization.

## Expected file inventory

The inventory is based on the current code. Paths marked proposed are new files; finalize extraction boundaries during Phase 0 rather than imposing an arbitrary file-count limit.

| Files | Intended responsibility |
| --- | --- |
| `src/App.vue`, `src/index.css` | Responsive shell, stable overlays, fallback removal, viewport/overflow behavior |
| `tailwind.config.js`; `index.html` if required | Shared layout breakpoint; viewport configuration only if needed for safe-area treatment |
| `src/components/Header.vue`, `src/components/MoreInfoMenu.vue` | Responsive navigation/results, semantic activation, explicit help opening |
| `src/panels/Main.vue` | Stable chart and range controller; switches scenario presentation at the shared breakpoint |
| `src/components/Chart.vue`, `src/components/NibSlider.vue`, `src/components/XAxis.vue`, `src/lib/ChartOptions.ts` | Chart layout synchronization, coordinate conversion, endpoint selection, ticks; prices remain attached to range endpoints |
| `src/components/ChartBg.vue`, `src/components/ChartOpaque.vue` as needed | Background and selection shading within the new chart container |
| `src/overlays/ChartMarker.vue`, `src/overlays/Charttip.vue` | Responsive endpoint/detail presentation |
| `src/components/EditorButton.vue`, `src/components/ScenarioEditorDialog.vue`, `src/lib/ScenarioEditor.ts`, `src/overlays/AddShort.vue` | Shared editor triggers/session, draft/commit behavior, validation, contained numeric/date entry |
| `src/overlays/ActionsList.vue`, `src/layouts/DesktopActivity.vue` | Mobile batched activity cards; original desktop scrolling table above its trigger |
| `src/components/DesktopPopover.vue`, `src/components/DesktopDialog.vue`, `src/components/ScenarioEditorFields.vue`, `src/layouts/DesktopMoreInfo.vue` | Desktop overlay presentation, shared editor fields, original header help menu |
| `src/lib/InsightUtils.ts`, `src/lib/TooltipUtils.ts`, `src/overlays/InsightOverlay.vue`, `src/overlays/TooltipOverlay.vue` | Help activation, scroll-safe positioning, responsive presentation |
| `src/overlays/WelcomeOverlay.vue`, `src/overlays/VideoOverlay.vue`, `src/overlays/FaqOverlay.vue`, `src/overlays/DetailsOfLiquidLocking.vue`, `src/overlays/WhitepapersOverlay.vue` | Fluid educational content, navigation, focus, and video behavior |
| `src/overlays/ConfirmShortRemoval.vue`, `src/overlays/ConfirmConfigReset.vue` | Accessible confirmation layout and cancellation |
| `src/panels/Tour.vue`, `src/overlays/TourStepOne.vue` through `src/overlays/TourStepFour.vue` | Desktop tour integration and accurate instructions |
| `src/store.ts`, `src/lib/VaultQueue.ts`, `src/lib/VaultSnapshot.ts`, `src/workers/worker.ts` | Restoration fix, request identity, readiness, consistent result metadata |
| `src/lib/Download.ts` only if required | Export from a captured completed snapshot; preserve the CSV schema and full dataset |
| Proposed `src/lib/ScenarioConfig.ts` | Shared input normalization, supported date domain, and scenario validation |
| Proposed `src/lib/ResponsiveLayout.ts` | Shared layout definitions/helpers where CSS and JavaScript both need them |
| `src/layouts/DesktopLayout.vue`, `DesktopHeader.vue`, `DesktopResults.vue` | Original desktop presentation and tour anchors |
| `src/layouts/MobileLayout.vue`, `MobileHeader.vue`, `MobileResults.vue` | Scrolling mobile presentation without a tour |
| `src/lib/SimulationResults.ts`, `src/components/ResultStatus.vue`, `src/components/ChartDateControls.vue` | Shared result model/status and mobile date controls; no duplicated calculation state |
| Proposed `src/components/MobileSheet.vue`, if shared presentation warrants extraction | Consistent contained editor/help presentation using existing dialog primitives |
| `tests/accounting.test.ts` as an unchanged baseline; proposed `tests/scenario-config.test.ts` and `tests/vault-queue.test.ts` | Existing numerical regression checks plus targeted validation/readiness tests |
| `README.md`, test configuration only if necessary | Document agreed verification commands and any new focused harness |

The financial formulas in `src/lib/Vault.ts`, price/fee/target datasets, routing, and saved configuration schema are outside the intended change scope. The separately approved full-history follow-up expands the displayed range to include every existing Bitcoin price record without modifying the datasets.

## Validation

### Baseline scenarios

Use actual supported dates and record the precise inputs, final snapshots, displayed values, and export values before implementation. Include:

- Default configuration.
- Six-month minimum range near both ends of the supported history.
- A long range with substantial price variation and many actions.
- One BTC and a larger whole-BTC quantity.
- Ratcheting disabled at 0%, the default threshold, and the upper threshold.
- A valid ordinary price drop, multiple drops, and an existing EXIT drop.
- A saved drop becoming inactive after changing dates and active again when restoring the range.
- Negative returns and zero-valued outputs through existing deterministic accounting fixtures.
- The current fixed Argon target, with existing regression coverage for a non-dollar target.

Record known baseline failures rather than treating incorrect existing behavior as the desired result.

### Automated checks

- Run `yarn test` and `yarn build` before and after implementation.
- Run `yarn exec vue-tsc -b` to check TypeScript. The originally proposed `yarn run -build` invocation is rejected by Yarn 4; the direct command is the verified equivalent. Require no new type errors in affected code; do not require unrelated application-wide cleanup.
- Verify input normalization, six calendar months, UTC dates, date-domain boundaries, price-drop validation, and 0% restoration with focused tests.
- Verify worker request coalescing and response identity using controlled delayed responses. Earlier completions must not become the current scenario result.
- Verify export guards during initial loading, pending work, errors, and scheduled-but-not-yet-submitted edits.
- Verify that a completed snapshot and export remain internally consistent if the user edits again.
- Exercise cancel/reopen and component cleanup paths where an existing test harness can meaningfully cover them.
- Use available browser automation for end-to-end input, resize, and export checks. If a reproducible browser harness needs a new dependency, identify it before installation. Document manual coverage for checks that cannot be automated in the available environment.

Keep the existing accounting fixtures and expected results intact. New tests should cover behavior at the boundaries between controls, store, queue, and results rather than merely mirror CSS or implementation details.

### Viewport, input, and browser matrix

| Dimension | Required coverage |
| --- | --- |
| Small phones | 320×568, 375×667, 390×844 |
| Short landscape | 568×320 and a larger phone in landscape |
| Tablets | 768×1024 and 1024×768 |
| Layout boundaries | 767/768px and 1,223/1,224px at the same height |
| Existing Tailwind boundary | 1,279/1,280px |
| Desktop | Baseline desktop widths, including a wide screen and reduced-height window |
| Mixed input | Touch at desktop width; mouse and keyboard at phone width; keyboard on tablet where available |
| Text and zoom | Increased text size and 200% browser zoom, preserving access and focus |
| Time zones | At least one time zone west of UTC and one east of UTC |
| Browsers | Available desktop browsers, plus physical iOS Safari and Android Chrome |

Record the exact browser and OS versions tested. Use the current stable versions available at implementation time as the initial target; do not claim support for untested older versions.

### End-to-end acceptance checks

- All essential content is reachable without accidental page-level horizontal scrolling or hidden overflow.
- The chart, labels, dialogs, and controls fit portrait and landscape layouts.
- Quantity, dates, ratchet threshold, and price drops can be edited with valid results.
- Read-only purchase value stays derived from committed quantity and historical price.
- The selected endpoint remains unambiguous at the minimum duration, and either handle can be operated.
- Vertical scrolling, browser zoom, tap inspection, and horizontal dragging do not conflict.
- Pointer cancellation, leaving the handle, a second touch, and rotation do not leave the interface stuck.
- Scrolling or resizing after selecting a date does not change the date or move a handle to an unrelated point.
- Open dialogs, drafts, selected dates, and tour state survive layout changes appropriately.
- Clicking or pressing Enter opens a result explanation without prior hover.
- Numeric Enter/Save works once; Escape/Cancel leaves the prior committed value.
- Canceling and reopening a price-drop or confirmation dialog does not duplicate a later action.
- Reload in the same session preserves valid configuration, including a 0% threshold.
- Results, date labels, quantity, breakdowns, activity, and export all refer to the same completed request.
- Export is unavailable while the current scenario is incomplete and includes all rows once ready.
- Activity remains usable for long simulations and exposes every field through expansion.
- View full results moves to the full comparison without losing the selected scenario.
- Welcome, help, video, formulas, reset, and download flows work with touch and keyboard. The tour works on desktop and is absent from mobile.
- Software-keyboard opening does not hide the focused input or make Save, Cancel, or Close unreachable.
- Dialog focus returns to a meaningful trigger; chart keyboard shortcuts do not intercept form/calendar editing.
- Desktop appearance and interactions match the baseline except for the documented corrections.

## Risks, tradeoffs, and alternatives

### Desktop regression and component extraction

The shell, Header, and Main are tightly coupled today. Moving their content can change geometry and focus order even with shared state. Keep one mounted controller/chart, compare against the baseline after each phase, and isolate calculation-affecting corrections from visual reflow.

Component extraction may require more files than the earlier estimate. Prefer a small number of shared components with clear responsibilities over duplicated desktop/mobile applications or an arbitrary one-new-file limit.

### Chart precision and overlap

A fifteen-year chart cannot provide day-level precision by finger position. Date entry is the precise control, and explicit endpoint selection resolves overlapping handles. This avoids making pinch zoom or a custom chart-navigation system a prerequisite for mobile support.

### Calculation timing

The existing worker and queue already reduce main-thread work and obsolete pending requests. Frame batching can reduce UI and persistence overhead, but correctness comes from tracking the latest requested scenario and matching completed results. Measure performance rather than treating frame throttling as a complete solution.

### Long content and software keyboards

Full transaction cards, nested scroll containers, and fixed bottom UI can consume scarce screen space. Use concise expandable activity rows, a result summary in normal flow, and bounded dialogs with reachable controls. Physical-device checks remain necessary.

### Guided-tour complexity

The tour is desktop-only. Keep its lifecycle separate from modal help, preserve progress while the desktop layout is absent, and register tour anchors only for the mounted desktop presentation.

### Reduced-scope alternative

If delivery scope must be reduced, defer mobile chart dragging while retaining precise date inputs and a help panel. The responsive configuration/results loop, current-result guarantees, accessible dialogs, activity, and export verification remain required. Mobile has no guided tour by design. Deferring dragging requires an explicit scope decision; it is not the default implementation.

## Completion and release criteria

Local implementation is verified when the supported layouts and interactions work, results match the accounting baseline, targeted validation/readiness checks pass, the production build passes, and affected code adds no new type-check failures.

The mobile release is ready when physical iOS Safari and Android Chrome checks also pass, known limitations are documented, and all required end-to-end workflows are complete. The handoff report must name the devices/browser versions tested and identify any checks still pending.

Caleb subsequently authorized implementation with “Please implement.” That approval covers the application changes described here. Publish the complete mobile experience only after the remaining release checks and the required publication authorization.
