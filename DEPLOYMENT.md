# NBDL Deployment

The portal contains only static HTML, CSS, JavaScript, and JSON. No database,
authentication, React build, or live API is required.

From the repository root:

```bash
python3 -m pytest tests/test_nbdl_portal.py tests/test_nbdl_setup.py
python3 -m killanomics_engine.nbdl_portal --strict
```

Publish `docs/nbdl/` through the repository's GitHub Pages workflow. If the
repository is hosted with `docs/` as the Pages source, the route is `/nbdl/`.
All links are relative so staging under a different base URL also works.

Before publishing, confirm that the validation report has no blocking errors.
Warnings remain visible for unconfirmed pick ownership or missing manager
decisions and should be resolved before calling the offseason board final.

Do not hand-edit generated HTML or JSON. Update Yahoo exports, identity maps,
the rookie-pick ledger, decisions CSV, or portal configuration, then rebuild.
