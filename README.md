# Liquid Locking for Bitcoin

This repo provides a dynamic modeling of Argon's vaulting and liquid locking mechanisms. It allows bitcoin holders to lock their assets into yield bearing vaults. The more bitcoins locked in vaults the larger the wall of shorts stabilizing the argon.

## Run locally and test

Use Node.js 22 or newer and the Yarn 4 version pinned in `package.json`.
Dependencies use a standard `node_modules` install. If using nvm, run `nvm install` and `nvm use`.
Enable Yarn through Corepack with `corepack enable` if needed.

```sh
yarn install
yarn dev
yarn test
yarn exec vue-tsc -b
yarn build
```

Run the accounting regression tests with `yarn test tests/accounting.test.ts`.
Use `yarn install --immutable` to verify installation against the committed lockfile.

`yarn build` bundles the application without type-checking. Run
`yarn exec vue-tsc -b` separately; both checks pass for the responsive implementation.
Yarn 4 interprets the old `yarn run -build` invocation as an unsupported option.

The simulator supports phone and tablet layouts with precise date controls,
touch-sized chart handles, editor sheets, and expandable activity. Desktop layout
starts at 1,224px, defined in `src/lib/ResponsiveLayout.json`. Results and exports
use the latest completed calculation. Configuration remains in session storage.

`src/layouts/` contains separate desktop and mobile headers, scenario views, and
results views. `Main.vue` keeps one chart and range controller mounted; both layouts
share the simulator store, worker, validation, results model, and editor session.
The editor dialog is mounted once in `App.vue`, so resizing preserves open drafts
and calendar navigation. Desktop uses the original compact anchored editors,
calendar popovers, result explanations, help menu, and activity table above its
button. Mobile retains editor sheets and expandable activity rows. Both use the
same editor fields, validation, and completed simulation results.
The guided tour is available only in the desktop layout;
mobile keeps optional help, FAQs, video, and whitepapers.

See [the mobile implementation report](MOBILE_IMPLEMENTATION_NOTES.md) for
verification results and the physical-device checks still required before release.

`yarn deploy` builds the application and then publishes it to GitHub Pages.

## Update Bitcoin data

```sh
yarn update:bitcoin
yarn test
yarn build
```

The update command fetches daily Bitcoin prices and average transaction fees from
[Blockchain.com's Charts API](https://www.blockchain.com/explorer/api/charts_api),
replacing `src/data/bitcoinPrices.json` and `src/data/bitcoinFees.json`.
Dates use UTC, and the current unfinished day is excluded. Fee totals and
transaction counts are matched by timestamp.

Missing fee dates remain absent rather than being invented. The simulator's
existing fee lookup uses the previous available nonzero fee for missing or zero fees.

Each generator validates its response before writing and reports its date range.
Both require records through yesterday (UTC). Prices must have consecutive,
unique dates; fees must have unique dates but may retain historical gaps.
If either fails, the command exits with an error; rerun it to refresh both files
before committing or deploying. Prices may already have refreshed if fees fail.
Review and commit both JSON files together. Rebuild and deploy to publish the new data.

The chart and date controls use the first and last available Bitcoin price
records. Year labels and the tour's date-range description follow that same
range. Updating the datasets and rebuilding extends the chart automatically;
existing selected dates are preserved. The six-calendar-month minimum still
applies. The current snapshot spans August 18, 2010 through September 11, 2026.

### Automatic daily refresh

`.github/workflows/daily-bitcoin-refresh.yml` runs at 00:17 UTC daily and supports
manual runs from the Actions tab. It refreshes both datasets, runs tests and type
checks, builds the site, commits changed JSON files together to the default branch,
and deploys the build using GitHub's Pages artifact actions. The build uses the
Pages base path for the repository's configured URL. It deploys even when data is
unchanged, allowing a manual rerun to recover from a previous deployment failure.

To activate it, merge the workflow into the default branch and set **Settings →
Pages → Build and deployment → Source** to **GitHub Actions**. Allow the workflow's
`GITHUB_TOKEN` to push data commits to the default branch; branch protection or
organization policy may require an explicit allowance. The `github-pages`
environment must allow deployments from that branch. No personal access token
is required. Manual production runs are restricted to the default branch.

The automated workflow publishes directly with `actions/deploy-pages`; the old
local `yarn deploy` command only pushes to `gh-pages` and does not publish when
Pages is configured for GitHub Actions. Use the workflow's manual trigger instead.

GitHub may delay scheduled jobs, and Blockchain.com may not have published the
previous day's data by 00:17 UTC. In that case the run fails before committing or
deploying, leaving the current site intact. Rerun it manually after the data is
available (or adjust the schedule later if publication regularly lags). A failed
test, type check, build, or data push also prevents deployment. Concurrent refresh
runs are serialized, and a competing source commit causes a normal push failure
rather than a forced overwrite. Existing missing fee dates retain the simulator's
previous-fee fallback; missing prices are rejected, never interpolated.

## Update the mainnet Argon target

```sh
yarn update:argon
yarn test
yarn build
```

The update command downloads `usdTargetForArgon` and `lastUpdatedAt` from
`https://argon.network/data/argonBasics.mainnet.json` into
`src/data/argonTarget.json`. It validates both fields before writing; download or
validation failures leave the previous snapshot intact. Commit the snapshot and
rebuild/redeploy to publish it. No RPC dependency or live subscription is used.

Each simulation freezes this target and its source timestamp. Reload after an
update to use the new snapshot; saved dates and price drops remain configured,
and results are recalculated. Short prices remain absolute USD per ARGN.
The input accepts prices greater than zero and below the target.

Bitcoin prices, cash, fees, and returns retain their USD basis. Minted and burned
ARGN quantities divide the Bitcoin USD value by the target. The unlock formula
receives the short's USD price divided by the target; burn cost is the resulting
ARGN quantity multiplied by the short's USD price. CSV exports include
`usdTargetForArgon` and `argonTargetUpdatedAt` alongside these values.

This uses the mainnet **target**, not the current market price, and applies it
throughout the selected historical Bitcoin period. It does not reconstruct past
Argon targets or change the existing unlock formula or modeled fees. At the same
percentage drop below target, token quantities change with the target while USD
returns remain the same. An unchanged absolute USD short price represents a
different percentage drop when the target changes.
