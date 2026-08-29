---
title: Vora Mobile
tagline: Estimating a tree's stored carbon from a phone video
format: case-study
order: 3
year: '2026'
role: Mobile developer
context: team
stack:
  - React Native
  - Expo SDK 54
  - TypeScript
  - pnpm monorepo
  - FastAPI
repo: https://github.com/valtzyy/vora-mobile
cover: ../../../assets/work/vora-logo-mark.png
coverAlt: The Vora logo mark
coverFit: contain
facts:
  - value: '4'
    label: workspace packages
  - value: '118'
    label: source files
---

## The problem

Measuring the carbon stored in a standing tree normally means going out with a
tape measure and a clinometer, recording diameter and height, and running an
allometric equation. It is slow, and it does not scale to the number of trees
anyone actually wants to survey.

## What it does

Vora Mobile turns a smartphone video of a tree into a carbon estimate. The video
feeds a 3D Gaussian Splatting reconstruction, dimensions are recovered from the
reconstruction using a two-point calibration the user performs in-app, and
allometric equations convert those dimensions into stored carbon.

I built the mobile client — camera capture and file picker, the calibration
flow, processing states, and the results view.

## Structure

The repository is a pnpm monorepo, split so the phone app is not the only thing
that can consume the backend:

- `apps/mobile` — the React Native and Expo application
- `packages/types` — TypeScript types mirroring the backend schema
- `packages/domain` — formatting and status-display logic, shared with a
  potential web client
- `packages/api-client` — a typed HTTP client against the FastAPI backend

Keeping types in their own package is what makes the split worth the overhead.
When the backend schema changes, the type error surfaces in the client at build
time rather than as a runtime surprise in someone's hands in a forest.

## Decisions worth naming

**Scanning works without an account.** Requiring registration before a user can
try the core feature would cost more users than the accounts are worth, so
authentication exists but anonymous scanning is a first-class path.

**Calibration is manual and explicit.** Automatic scale recovery from a single
camera is unreliable, and a silently wrong measurement is worse than one the
user knows they had to set. Two points, placed by hand, at a known distance.
