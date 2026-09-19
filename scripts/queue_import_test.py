import importlib.util
import json
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location("queue_import", Path(__file__).with_name("update-queue-data.py"))
queue = importlib.util.module_from_spec(spec)
spec.loader.exec_module(queue)


class QueueImportTests(unittest.TestCase):
  def test_missing_zero_and_bad_values(self):
    self.assertIsNone(queue.mw(None))
    self.assertIsNone(queue.mw("N/A"))
    self.assertEqual(queue.mw(0), 0)
    for value in ("garbage", float("nan"), -1):
      with self.assertRaises(ValueError):
        queue.mw(value)
    with self.assertRaises(ValueError):
      queue.date("02/30/2026")

  def test_retained_source_records_and_hybrid_capacities(self):
    directory = queue.ROOT / "assets/data/queue"
    index = json.loads((directory / "index.json").read_text())
    baseline = json.loads((directory / index["snapshots"][0]["file"]).read_text())
    rows = []
    for source in baseline["sources"]:
      records, report_date = queue.read_workbook((directory / source["file"]).read_bytes(), source["id"], source["reportDate"] if source["id"] == "cluster15" else None)
      self.assertEqual(report_date, source["reportDate"])
      rows.extend(records)
    self.assertEqual(sorted(rows, key=lambda p: p["id"]), baseline["projects"])
    alisa = next(p for p in rows if p["id"] == "2207")
    self.assertEqual(alisa["netMw"], 500)
    self.assertEqual(sum(c["capacityMw"] for c in alisa["components"]), 1000)
    self.assertEqual(alisa["queueDate"], "2025-02-12")
    self.assertEqual(alisa["state"], "AZ")
    self.assertTrue(any(p["status"] == "WITHDRAWN" for p in rows))
    self.assertTrue(any(p["status"] == "COMPLETED" for p in rows))


if __name__ == "__main__":
  unittest.main()
