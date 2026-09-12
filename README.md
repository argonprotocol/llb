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
yarn build
```

Run the accounting regression tests with `yarn test tests/accounting.test.ts`.
Use `yarn install --immutable` to verify installation against the committed lockfile.

`yarn build` bundles the application without type-checking. The optional
`yarn run -build` command runs type-checking first; existing application type
errors currently prevent that command from passing.

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
If either fails, the command exits with an error; rerun it to refresh both files
before committing or deploying. Prices may already have refreshed if fees fail.
Review and commit both JSON files together. Rebuild and deploy to publish the new data.

The chart currently has a fixed 2024 upper date limit and year labels. Updating
the datasets does not extend those UI limits; that requires a separate chart change.

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
