# Frequently Asked Questions

## What Does This Simulator Show?

It compares Liquid Locking with simply holding bitcoin, using historical Bitcoin prices and the scenarios you choose. You can explore how changes in Bitcoin and Argon prices affect the results.

## How Do I Get Started?

Choose when to lock and unlock your bitcoin, then compare the results. Add an Argon price drop to explore what happens if Argon falls below its $1 target, or choose **Take Our Guided Tour** from the More Info menu for a walkthrough.

## Where Do the Returns Come From?

The model combines Bitcoin price changes with Liquid Locking’s hedging mechanism and opportunities to buy back Argon below its $1 target. Results depend on your selected dates and settings; they are simulated outcomes, not promised returns.

## Who Is the Loser?

For gains from an Argon price drop, the other side of the trade is whoever sells Argon below its $1 target. Buying it back at that lower price reduces the cost of unlocking your bitcoin.

## How Does Liquid Locking Compare With Babylon’s Bitcoin Staking?

Babylon lets you lock bitcoin to help secure proof-of-stake networks and earn rewards. Your bitcoin remains exposed to Bitcoin price declines, and security violations can trigger slashing—a loss of staked bitcoin. Argon’s Liquid Locking is designed to hedge Bitcoin price declines and create opportunities to profit when Argon falls below its $1 target, without staking-related slashing.

The locking mechanisms also differ: Babylon combines timelocks and slashing conditions in Bitcoin scripts, while Argon uses a Dual-Signature Time Lock (DSTL), a multisignature locking mechanism. Babylon’s additional complexity can create more potential paths for exploits; a simpler design can be easier to review, but simplicity alone does not establish security.

## How Do I Unlock My Bitcoin?

There is no minimum lock time. You can unlock your bitcoin at any time by returning the amount of Argon required by the vault’s unlocking formula. Open [The Details of Liquid Locking](#liquid-locking-details) to see the formula and learn more.

<!-- Implementation note: This draft link should close the FAQ and emit openDetailsOfLiquidLocking in the app. The Markdown preview cannot open the app overlay. -->

## Is Liquid Locking In Production?

Yes. Liquid Locking is live on Argon’s mainnet. Download the [Argon Desktop App](https://argon.network/) to get started.

## Why a Simulator If Production Is Running?

A live network cannot show you years of outcomes without years of waiting; this simulator lets you explore long-term scenarios and sudden market drops immediately.

For example, drag the date sliders to include February 14–March 13, 2020, when Bitcoin fell roughly 53% in under a month. To test a 99.9% Argon plunge, add a price drop to $0.001 in your configuration.