# Maintaining the grid data

The site displays verified CAISO measurements and retains five-minute interval history. Jekyll serves static JSON files. Browsers do not query CAISO directly.

## Data sources and units

| Dataset | Source | Stored values |
| --- | --- | --- |
| Electricity | CAISO Today's Outlook dated demand and fuel CSVs | Demand and generation in MW, battery power in signed MW, forecasts, positive supply shares |
| Market | OASIS `PRC_INTVL_LMP`, RTM, version 3, CSV ZIP | NP15, SP15, and ZP26 generation-hub prices and energy, congestion, loss, and greenhouse-gas components in USD/MWh |

The hub node IDs are `TH_NP15_GEN-APND`, `TH_SP15_GEN-APND`, and `TH_ZP26_GEN-APND`. Hub map positions are representative anchors, not physical substations.

Infrastructure remains static reference geometry in `assets/data/california-transmission.geojson` and `assets/data/california-substations.geojson`. It contains no operational loading measurements.

The optional CAISO area layer uses `assets/data/caiso-area-reference.geojson`. It contains the `CALISO` features from the [CEC balancing authority dataset](https://www.arcgis.com/home/item.html?id=147c83114a3f4ff8a82225e3d6c24857), credited to CEC, CAISO, and BANC. The source is marked retired. Its geometry was last edited on August 3, 2021. The page labels it as historical reference geography, not a current operational boundary or a price zone. The export uses WGS84, a 0.001-degree simplification tolerance, and five decimal places. Source details are also stored in the GeoJSON metadata. Boundary loading fails independently of infrastructure and market data.

The grid page uses the control-room photograph hosted on [CAISO’s market operations page](https://www.caiso.com/market-operations). It includes visible California ISO copyright credit and a source link. The image loads lazily from CAISO; the caption and text remain readable if the remote image is unavailable.

## Linked history explorer

The grid page reads `assets/data/history/index.json` and fetches only the selected Pacific date. Previous and next controls move between available dates. Both datasets are validated before use. They join by exact UTC interval keys. Missing measurements remain unavailable, and chart paths stop at each gap. Future slots are distinguished from elapsed missing slots. Pacific days retain their actual 276, 288, or 300 five-minute intervals across daylight-saving changes.

The shared sliders support keyboard input. Chart hover previews an interval; leaving restores the selection. Clicking or tapping a chart pins an interval. Map hub labels, price components, summary values, chart cursors, and readouts share that selection. Selecting history pauses automatic movement to the newest interval. The Latest available button resumes it. Background requests use a generation counter so a slower response cannot replace a newer date selection. Archive failures are isolated by dataset and reported beside the charts.

Event presets are calculated from observed records on the selected date, with the earliest interval winning ties:

- Negative prices selects the lowest negative price across the three hubs.
- Largest north–south spread selects the largest absolute SP15 minus NP15 price difference.
- Evening ramp selects the largest positive one-hour rise in demand minus solar and wind, ending between 16:00 and 21:00 Pacific. All 13 five-minute observations must be present.

Presets remain disabled when no qualifying observations exist. These are events within the loaded archive, not a catalogue of historic emergencies. Partial days can miss larger events. No historical backfill is performed by the browser.

CAISO covers most of California, not the whole state. Today's Outlook demand excludes charging batteries and dispatchable pump loads. Solar plus wind can therefore exceed 100% of reported demand. These data are informational, not billing or settlement records.

## Snapshot and history files

- `assets/data/electricity-desk.json`: latest electricity snapshot.
- `assets/data/grid-market.json`: latest complete three-hub comparison.
- `assets/data/history/electricity/YYYY-MM-DD.json`: electricity intervals for one Pacific date.
- `assets/data/history/market/YYYY-MM-DD.json`: market intervals for one Pacific date.
- `assets/data/history/index.json`: available dates, counts, missing elapsed intervals, and counts of future intervals.

New snapshots use schema version 2. Version 1 snapshots remain readable during migration but cannot enter interval history because they lack explicit measurement timestamps. Each daily archive uses its own version 1 envelope and contains version 2 snapshots.

History files are sorted by UTC timestamp. Repeated downloads deduplicate intervals and replace source revisions. Unchanged measurements keep their original collection timestamp. An older revision or a partial response cannot erase a previously observed value for the same interval. Missing intervals remain gaps; the collector does not interpolate or fabricate measurements. Current-day history is naturally incomplete. Files accumulate by date; there is no automatic history deletion.

The initial repository history contains the dates downloaded during this change. It does not claim coverage of earlier dates.

## Time and missing-data rules

- `intervalTimeUtc` is the measurement timestamp. `sourceUpdatedAt` has the same value for version 2, so freshness cannot be reset by republishing an old file.
- `generatedAt` records collection time. It is not measurement time.
- Electricity timestamps preserve the dated CSV's clock labels. They do not infer dates from the HTTP `Last-Modified` header or the current browser date.
- OASIS timestamps use `INTERVALSTARTTIME_GMT` and `INTERVALENDTIME_GMT` directly. The end must be five minutes after the start.
- Electricity and market clock labels are retained with their source semantics. Do not infer causal lead or lag between the feeds from coincident labels alone.
- A Pacific day contains 276, 288, or 300 five-minute slots. Repeated autumn clock labels map to separate UTC instants. Ambiguous labels are rejected if the source omits the information needed to distinguish them.
- The trailing midnight forecast after 23:55 in an Outlook demand file belongs to the following day and is excluded.
- Demand and fuel values are joined only at the same UTC timestamp. Missing fuel values remain `null`; a missing battery value has state `unavailable`.
- Measured zero remains zero. Missing forecasts remain `null`. Invalid numeric strings fail validation.
- Signed source generation and battery values are preserved. The positive-supply ribbon excludes negative power, including exports and charging. If any supply component is missing, all percentage shares remain unavailable.
- Hourly demand changes use the record exactly 60 minutes earlier, not a row offset. They remain unavailable where that interval is absent, including the start of each daily file.
- A market interval is accepted only when all three hubs have all five price fields. The four price components must reconcile to LMP within USD 0.0001/MWh. Partially published intervals are retried later.

## Collection and retention

The deploy workflow runs every 15 minutes. Each collector downloads yesterday and today in full. This recovers the intervening five-minute intervals, catches midnight rollover, and revisits recent source revisions. It does not merely append one point per deployment.

OASIS requests are spaced apart. HTTP 429 and server errors have bounded retries. Each validated daily file and snapshot is written atomically. Failed downloads leave existing files intact. The latest snapshot never moves backward when an older date is backfilled.

A dedicated `grid-data` Git branch holds the latest snapshots and accumulated history. The workflow restores it before any deployment, including ordinary source pushes. Scheduled and manual runs save the verified data back to this branch before building the site. Thus data survives a failed site build and an unrelated source deployment.

The workflow creates the data branch on its first scheduled or manual run after this code is deployed. It needs repository contents-write permission for that job. No credentials are added to the repository. Data-branch commits do not trigger GitHub Pages builds. Pages deployments remain serialized by the existing concurrency group.

Both Vercel projects connected to this repository (`antiroyalty` and `antiroyalty-github-io`) must skip the data-only branch. Set their **Ignored Build Step** to `test "$VERCEL_GIT_COMMIT_REF" = "grid-data"`. Vercel skips a build when this command exits with 0; other branches continue to build. Keep this setting in Vercel because the orphan `grid-data` branch contains neither the site's `vercel.json` nor its Jekyll dependencies. Without the exclusion, data updates trigger preview builds that fail with `jekyll: command not found`.

If the branch cannot be read or updated, the workflow stops rather than silently substituting older committed data. A CAISO refresh failure produces a warning; independently successful dates and feeds are still retained, and validated fallback data can be deployed. Check warning steps even when a deployment succeeds.

An outage lasting more than the two-day refresh window requires explicit backfill. The history index makes elapsed gaps visible. The history is designed for the next chart phase; downloading years of history is a separate operation.

## Local commands

Prerequisites: Node.js 20 or later, `unzip`, Ruby, Bundler, and the repository gems. GitHub's Ubuntu runner includes `unzip`.

```bash
npm run update:electricity
npm run update:grid-market
npm run validate:data
npm test
bundle exec jekyll build --trace
bundle exec jekyll serve --watch
```

Supply explicit Pacific dates to recover older days:

```bash
node scripts/update-electricity-data.mjs 2026-09-16 2026-09-17
node scripts/update-grid-market-data.mjs 2026-09-16 2026-09-17
```

These commands update local files only. Scheduled production persistence occurs in GitHub Actions. Do not push local history over the data branch without merging its existing records.

## Browser freshness

Both pages fetch their deployed snapshots every five minutes and update age labels every minute. The map preserves the selected hub and layer settings when prices refresh. Electricity and price timestamps are displayed independently on the map.

- Current: up to 45 minutes old.
- Delayed: more than 45 minutes, up to three hours.
- Stale: more than three hours.
- Refresh delayed: a fetch failed while a previously verified snapshot remains within three hours.
- Unavailable: no valid snapshot, or an implausible future timestamp.

A browser rejects a snapshot older than the one it already displays. Missing measurements are shown as unavailable, not as zero or balanced storage. A supply ribbon with incomplete source data is cleared instead of showing invented shares.

## Checks and implementation

Tests cover missing versus zero, misaligned feeds, exact hourly comparisons, midnight rollover, daylight-saving boundaries, price reconciliation, revisions, failed refreshes, gaps, state restoration, and freshness boundaries. `npm run validate:data` also validates every generated daily archive.

- Collectors: `scripts/update-electricity-data.mjs`, `scripts/update-grid-market-data.mjs`.
- Shared CSV, time, and storage helpers: `scripts/lib/`.
- Durable state restoration: `scripts/sync-grid-state.mjs`.
- Browser schemas and freshness: `assets/js/*-schema.js`, `assets/js/data-freshness.js`.
- Production lifecycle: `.github/workflows/deploy-pages.yml`.

The OASIS fixture contains two public intervals downloaded on September 18, 2026. Unit tests do not contact live services.

## Interconnection queue explorer

`/queue/` combines two CAISO workbooks: [Cluster 14 and earlier](https://www.caiso.com/documents/publicqueuereport.xlsx) and [Cluster 15](https://www.caiso.com/documents/cluster-15-interconnection-requests.xlsx). The initial editions have a September 18, 2026 run date and a July 16, 2026 publication date, respectively. They contain 2,448 records, including 349 active projects. Report dates are displayed separately. They are not live market data.

The default view shows active projects. Filters, rankings, summaries, charts, and project records share the same selection. Completed and withdrawn records are available through the status filter. Each project links to a retained source workbook and identifies its worksheet and row.

Domain rules:

- Project identity is the queue identifier, including suffixes. Duplicate identifiers across reports stop the import for review.
- Net capacity uses `Net MWs to Grid` or `NET MW POI`. Component capacities remain separate; solar and battery MW are never added to infer the shared connection limit.
- Active queue age ends at that project's source report date. Completed age ends at its actual online date; withdrawn age ends at the reported withdrawal date. Missing, invalid, or inverted dates yield unavailable duration. Age is not a construction delay or an estimate of remaining wait.
- County filters normalize capitalization and the County suffix. Source fields retain their original values. Compound and inconsistent place names are not silently reassigned.
- Map positions use exact normalized station-name, owner, and county matches to the existing CEC reference. Proposed facilities, line connections, ambiguous matches, and projects outside California remain unmapped. Unmapped records stay in totals and the table. The initial active subset has 85 mapped records.
- Changes compare recorded fields by queue ID. Newly present and absent records are labeled as observations, not inferred applications or withdrawals. Status, technology, capacity, dates, location, and agreement changes retain both values. Row reordering alone does not generate a field-change event.

`assets/data/queue/index.json` lists immutable observations under `snapshots/`. Content-hashed workbooks are retained under `sources/`. Each snapshot records collection time, source edition dates, source URLs, workbook checksums, and row provenance. The first observation is a baseline, so no change claims are made until another observation exists. Identical project records do not create a new observation; the index still records the successful source check and latest downloaded editions.

The existing deployment workflow checks these sources at most once per seven days, after restoring the `grid-data` branch. Both workbooks must parse and validate before the index changes. A failed fetch or schema change retains the prior index; a source edition that moves backward fails. Queue snapshots and workbooks are merged into the persistent data branch before the site builds. Ordinary source pushes restore the archive too. This schedule becomes active when the code is deployed.

Local collection requires Python 3 and `python3 -m pip install -r scripts/queue-requirements.txt`:

```bash
npm run update:queue
python3 scripts/update-queue-data.py --force
python3 -m unittest discover -s scripts -p '*_test.py'
npm test
npm run validate:data
```

`--force` bypasses the seven-day check interval. `--inputs DIRECTORY` supports offline verification with `caiso-queue.xlsx`, `caiso-cluster15.xlsx`, and the CAISO listing saved as `caiso-interconnection.html`. An independent browser validator rejects invalid records. Archive validation also verifies retained workbook checksums. No external services are called by the test suite.
