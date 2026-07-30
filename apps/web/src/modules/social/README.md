# Social

## Purpose

Social manages user discovery and directed follow relationships.

## Business invariants

- A follow affects only future Timeline deliveries and never backfills earlier activity.
- Following immediately makes a person's existing current ratings eligible for Trusted Rating Context.
- Unfollowing immediately removes that person's ratings from Trusted Rating Context while keeping existing Timeline entries.
- Users cannot follow themselves.
- A follow relationship is unique.
