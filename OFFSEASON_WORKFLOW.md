# NBDL Annual Offseason Workflow

The configured final roster size is 15. For each franchise:

```text
required Yahoo keepers = 15 - intended rookie selections
```

Owned picks and intended selections are separate facts. When a manager uses
fewer picks than owned, the latest round and then latest overall selection is
skipped first.

1. Import final Yahoo rosters and rebuild the existing history reports.
2. Update rookie-pick ownership, including original and current owners.
3. Set `ownership_confirmed=true` for reviewed picks.
4. Enter each manager's intended selections in the decisions CSV.
5. Build the portal and review `reports/nbdl_validation.csv`.
6. Send the generated reminders from the commissioner page.
7. Managers declare the calculated keeper count in Yahoo.
8. Enter `keepers_declared`; resolve every mismatch.
9. Run the strict build and publish the draft board.
10. After the draft, mark used/skipped picks and import final draft results.
11. Rebuild team pages, league history, records, matchups, and rivalries.

An explicit decision must satisfy both constraints:

```text
keepers_declared + intended_rookie_selections = 15
intended_rookie_selections <= usable_owned_picks
```
