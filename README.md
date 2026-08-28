# NBDL Portal

The NBDL portal is a reproducible static publishing layer over the existing
Killanomics Yahoo, identity, history, playoff, and rivalry data. Yahoo remains
the source of truth for rosters and official keeper submissions. The portal
owns rookie-pick bookkeeping, advisory keeper counts, manager action tracking,
history, records, matchup exploration, and commissioner validation.

Build it from the repository root:

```bash
python3 -m killanomics_engine.nbdl_portal
```

Or use the convenience script:

```bash
python3 scripts/build_nbdl_portal.py
```

Run a production gate after commissioner inputs are resolved:

```bash
python3 -m killanomics_engine.nbdl_portal --strict
```

The generated home page is `docs/nbdl/index.html`. Generated JSON lives under
`docs/nbdl/assets/data/`; validation is written to
`reports/nbdl_validation.csv`.

## Reused engine layers

- Yahoo season registry, manifests, team, roster, and matchup exports
- Explicit manager/franchise identity mapping
- League history, playoff classification, championships, and records
- Killanomics rivalry aggregation and scoring
- 2026 post-lottery draft-order mapping

The new layer is implemented in `killanomics_engine/nbdl_portal.py`. Portal
rules and paths are configured in `config/nbdl/portal.json`.
