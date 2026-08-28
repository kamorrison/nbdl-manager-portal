# NBDL Data Inputs

## Existing authoritative inputs

- `data/raw/yahoo/nbdl/season_registry.csv` maps NBDL seasons to Yahoo IDs.
- Each season manifest identifies its Team, Roster, Matchup, Draft, Players,
  and Transaction exports.
- `data/raw/yahoo/nbdl/manager_franchise_map.csv` connects changing Yahoo team
  identities to canonical franchises and managers.
- Existing history and rivalry JSON under `data/exports/nbdl/` supplies the
  long-term analytics.

## Commissioner-maintained inputs

`data/manual/nbdl/rookie_picks_2026.csv` is the canonical current pick ledger.
Each pick keeps both `original_franchise_id` and `current_franchise_id`.
Represent a trade by changing only the current owner and recording the source
and notes. Set `ownership_confirmed=true` only after commissioner review.

`data/manual/nbdl/offseason_decisions_2026.csv` records manager intent. Copy the
column structure from `templates/nbdl_offseason_decisions_template.csv` for a
new year. An empty intended-selection value means no manager decision exists;
the portal will display a clearly labeled inferred default.

Supported pick statuses are `owned`, `traded`, `used`, `skipped`, `forfeited`,
`pending`, and `unknown`. Do not mark a pick skipped until the choice is
explicit. Missing data remains missing; the build does not turn it into zero.

The first build generated a standard two-round 2026 ledger from the validated
post-lottery order and playoff finish. Its ownership is deliberately
unconfirmed until traded picks are entered.
