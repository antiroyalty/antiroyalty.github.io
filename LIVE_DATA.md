# Maintaining the live data

This guide covers the live elements on the Electricity Desk and California Grid Map. Both features use small, validated JSON snapshots generated from public California ISO data. No API keys or other secrets are required.

## What is live

| Feature | Source | Update script | Generated file |
| --- | --- | --- | --- |
| Electricity Desk demand, supply, and batteries | California ISO Today's Outlook CSV feeds | `scripts/update-electricity-data.mjs` | `assets/data/electricity-desk.json` |
| Grid Map NP15, ZP26, and SP15 prices | California ISO OASIS Hub LMP feed | `scripts/update-grid-market-data.mjs` | `assets/data/grid-market.json` |

The Grid Map's transmission lines and substations are public California Energy Commission datasets stored in:

- `assets/data/california-transmission.geojson`
- `assets/data/california-substations.geojson`

These infrastructure files are reference data rather than live operational telemetry. They do not need a 15-minute refresh. Review them annually or when the California Energy Commission publishes a meaningful revision.

## Run the site locally

From the repository root, install dependencies if needed:

```bash
bundle install
```

Start Jekyll:

```bash
bundle exec jekyll serve --watch
```

Open:

- Electricity Desk: <http://127.0.0.1:4000/>
- California Grid Map: <http://127.0.0.1:4000/grid/>

If `127.0.0.1` refuses to connect, the Jekyll process is not running or has stopped. Run the serve command again and leave that terminal open.

## Refresh local data

Leave Jekyll running and use a second terminal in the repository root.

Refresh the Electricity Desk:

```bash
node scripts/update-electricity-data.mjs
```

Refresh Grid Map market prices:

```bash
npm run update:grid-market
```

Then reload the page in the browser. Jekyll watch should copy the changed snapshot into the locally served site without restarting the server.

A successful refresh prints the source interval written to disk. Each updater validates the new snapshot and writes it atomically. If a download or validation fails, the existing verified snapshot remains unchanged and the command exits with an error.

## Test before pushing

Run all live-data tests:

```bash
npm test
```

Run a production-style site build:

```bash
JEKYLL_ENV=production bundle exec jekyll build --trace
```

The tests cover both JSON schemas, source parsing, Pacific-time interval handling, price-component reconciliation, and the committed infrastructure files.

## Production updates

The GitHub Actions workflow at `.github/workflows/deploy-pages.yml` maintains production automatically. It runs:

- After a push to `main`
- On a 15-minute schedule
- When started manually with **Run workflow** in the repository's Actions tab

Every run tests both pipelines, downloads fresh snapshots, builds the Jekyll site, and deploys the resulting Pages artifact. Scheduled starts can be a few minutes late.

To check production maintenance:

1. Open the repository on GitHub.
2. Select **Actions**.
3. Open **Deploy site with current electricity data**.
4. Confirm the latest `build` and `deploy` jobs are green.

If a refresh command fails in GitHub Actions, deployment stops and the previously deployed site remains in place. The next successful scheduled or manual run restores normal updates.

## Freshness labels

Freshness is calculated from the source timestamp, not from the browser clock or deployment time.

The Electricity Desk reports:

- **Current** through 45 minutes
- **Delayed** from 45 minutes through 3 hours
- **Stale** after 3 hours

The Grid Map reports:

- **Current** through 45 minutes
- **Delayed** after 45 minutes
- **Unavailable** when no verified market snapshot can be loaded

The Electricity Desk checks its deployed JSON every five minutes while the page remains open. The Grid Map checks its snapshot when the page loads. Browser requests cannot create new data, so GitHub Actions must successfully generate and deploy a new snapshot.

## Troubleshooting

### The page still shows old data locally

1. Check that the update command printed a successful interval.
2. Confirm the relevant JSON file changed in `assets/data/`.
3. Wait for Jekyll watch to finish regenerating the site.
4. Refresh the browser page.

### A refresh command fails

The California ISO feed may be temporarily unavailable or may have changed format. Preserve the last verified JSON file, then:

1. Retry the command once.
2. Open the source URL named in the error or generated snapshot.
3. Run `npm test`.
4. Compare the source response with its parser in `scripts/update-electricity-data.mjs` or `scripts/update-grid-market-data.mjs`.

Do not replace a live snapshot with hand-entered values. If a feed changes, update its parser, schema, and tests together.

### GitHub Actions has stopped updating production

Check the workflow's latest failed step first. Common causes are a temporary California ISO outage, a source-format change, or a Jekyll build failure. Use **Run workflow** after resolving the error to refresh production immediately.

## Maintenance map

- Electricity Desk browser code: `assets/js/electricity-desk.js`
- Electricity Desk schema: `assets/js/electricity-desk-schema.js`
- Electricity Desk updater: `scripts/update-electricity-data.mjs`
- Grid Map browser code: `assets/js/grid-map.js`
- Grid Map schema: `assets/js/grid-market-schema.js`
- Grid Map updater: `scripts/update-grid-market-data.mjs`
- Pipeline tests: `scripts/electricity-desk.test.mjs` and `scripts/grid-market.test.mjs`
- Production workflow: `.github/workflows/deploy-pages.yml`
