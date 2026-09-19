# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are Thai film-production teams, directors, and location scouts who need to turn a creative brief into viable filming locations.

## Product Purpose

ThaiScout AI helps a production team discover Thai locations from a mood- or production-led brief, assess them with grounded information, and prepare a practical recce shortlist. Success means moving from an abstract creative direction to a credible, mappable list of locations.

## Positioning

The product joins creative-brief search with grounded location intelligence, production feasibility information, and a live map in one scouting workspace.

## Operating Context

Users search during early pre-production and location recce. They compare locations, inspect map position, add promising sites to a scouting list, and ask follow-up questions about filming conditions or permits.

## Capabilities and Constraints

- AI-assisted search accepts Thai natural-language creative briefs and a province filter.
- The home screen is a functional split workspace: location results and agent context on the left, interactive map on the right.
- Users can select locations, save them to a Recce Board, and access grounded follow-up information.
- The implementation is an existing Next.js 15, React 19, TypeScript web application using Leaflet and OpenStreetMap.
- The Tourism Authority of Thailand dataset is the factual source for core location information; unavailable permit facts must not be invented.

## Brand Commitments

- Product name: ThaiScout AI.
- The visual redesign must be built around #CCD9E2, #285185, #D67940, and #6F4849.
- The interface should support real production work, not a generic travel-planning experience.

## Evidence on Hand

- Existing functional code includes search, a Leaflet map, a Recce Board, location metadata, and grounded AI question flows.
- `README.md` documents the product purpose and the TAT corpus of 8,628 attractions.
- Reference screenshots show destination browsing and map-oriented guide interfaces; they are visual inspiration, not product requirements.

## Product Principles

- Let a creative brief lead to an actionable location decision.
- Keep source-backed production facts distinct from unknowns.
- Make map, shortlist, and location context readable together.
- Prioritize fast scanning for teams working under production pressure.

## Accessibility & Inclusion

The web workspace should maintain clear keyboard focus, text contrast, semantic controls, and a responsive layout that preserves the search and map workflow on smaller screens.
