"""Import published year-end CAISO observations from unmodified Queued Up workbooks."""
import argparse
import hashlib
import json
from pathlib import Path
import shutil

import openpyxl

ROOT = Path(__file__).resolve().parent.parent
ARCHIVE = ROOT / "assets/data/queue-annual"
EDITIONS = {
  2020: "queues_2020_clean_data.xlsx",
  2021: "queues_2021_clean_data.xlsx",
  2022: "queues_2022_clean_data_0.xlsx",
  2023: "queues_2023_clean_data_r1.xlsx",
  2024: "2025-08/lbnl_ix_queue_data_file_thru2024_v2.xlsx",
  2025: "2026-05/lbnl_ix_queue_data_file_thru2025.xlsx",
}
STATUS = {"active": "ACTIVE", "completed": "COMPLETED", "operational": "COMPLETED",
  "withdrawn": "WITHDRAWN", "suspended": "SUSPENDED"}
STATUSES = ("ACTIVE", "COMPLETED", "WITHDRAWN", "SUSPENDED")


def text(value):
  return "" if value is None else str(value).strip()


def normalize_rows(rows, sheet_name, header_row):
  rows = iter(rows)
  for _ in range(header_row):
    headers = [text(value) for value in next(rows)]
  required = {"q_id", "q_status", "entity", "type_clean", "project_name", "state"}
  if not required.issubset(headers):
    raise ValueError(f"Unexpected columns in {sheet_name}")
  projects = []
  for row_number, values in enumerate(rows, header_row + 1):
    row = dict(zip(headers, values))
    # CAISO is a transmission provider, not a state. Include its out-of-state requests.
    if text(row.get("entity")) != "CAISO":
      continue
    project_id = text(row.get("q_id"))
    raw_status = text(row.get("q_status"))
    if not project_id or project_id.lower() in ("na", "not assigned") or raw_status not in STATUS:
      raise ValueError(f"Invalid CAISO identity/status at {sheet_name}:{row_number}")
    projects.append({"id": project_id, "status": STATUS[raw_status], "rawStatus": raw_status,
      "name": text(row.get("project_name")), "technology": text(row.get("type_clean")),
      "state": text(row.get("state")), "sourceSheet": sheet_name, "sourceRow": row_number})
  return projects


def summarize(projects):
  if not projects or len({p["id"] for p in projects}) != len(projects):
    raise ValueError("Empty CAISO edition or duplicate queue IDs across sheets")
  counts = dict.fromkeys(STATUSES, 0)
  for project in projects:
    counts[project["status"]] += 1
  return counts


def read_edition(path, year):
  workbook = openpyxl.load_workbook(path, read_only=True, data_only=True)
  sheets = [("active", 1), ("withdrawn", 1), ("completed", 1)] if year == 2020 else [
    ("data", 1) if year < 2024 else ("03. Complete Queue Data", 2)]
  try:
    projects = [project for sheet, header in sheets
      for project in normalize_rows(workbook[sheet].values, sheet, header)]
    summarize(projects)
    return sorted(projects, key=lambda project: project["id"])
  finally:
    workbook.close()


def write_json(path, value):
  path.parent.mkdir(parents=True, exist_ok=True)
  path.write_text(json.dumps(value, ensure_ascii=False, separators=(",", ":")) + "\n")


def import_editions(inputs, destination=ARCHIVE):
  # Validate all editions before publishing any new counts or changing the index.
  editions = []
  for year, relative_url in EDITIONS.items():
    filename = Path(relative_url).name
    path = inputs / filename
    digest = hashlib.sha256(path.read_bytes()).hexdigest()
    target = destination / "sources" / filename
    if target.exists() and hashlib.sha256(target.read_bytes()).hexdigest() != digest:
      raise ValueError(f"Refusing to replace a different retained edition: {filename}")
    projects = read_edition(path, year)
    edition = {"year": year, "asOf": f"{year}-12-31", "counts": summarize(projects),
      "total": len(projects), "recordsFile": f"records/{year}.json",
      "source": {"file": f"sources/{filename}", "sha256": digest,
        "url": f"https://eta-publications.lbl.gov/sites/default/files/{relative_url}",
        "sheets": sorted({p["sourceSheet"] for p in projects})}}
    editions.append((edition, projects, path, target))
  for edition, projects, path, target in editions:
    target.parent.mkdir(parents=True, exist_ok=True)
    if path.resolve() != target.resolve():
      shutil.copyfile(path, target)
    write_json(destination / edition["recordsFile"], {"year": edition["year"], "projects": projects})
    print(edition["year"], edition["counts"], flush=True)
  write_json(destination / "index.json", {"schemaVersion": 1, "entity": "CAISO",
    "attribution": "Lawrence Berkeley National Laboratory and GridTracker, Queued Up annual editions",
    "sourceUrl": "https://emp.lbl.gov/queues", "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
    "editions": [edition for edition, _, _, _ in editions]})


if __name__ == "__main__":
  parser = argparse.ArgumentParser(description=__doc__)
  parser.add_argument("--inputs", type=Path, default=ARCHIVE / "sources")
  args = parser.parse_args()
  import_editions(args.inputs)
