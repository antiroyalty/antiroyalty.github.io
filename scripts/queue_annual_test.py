import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location("queue_annual", Path(__file__).with_name("import-queue-annual.py"))
annual = importlib.util.module_from_spec(spec)
spec.loader.exec_module(annual)


class AnnualQueueTests(unittest.TestCase):
  headers = ["q_id", "q_status", "entity", "type_clean", "project_name", "state"]

  def test_provider_scope_status_mapping_and_row_provenance(self):
    rows = [self.headers,
      ["1A", "active", "CAISO", "Solar+Battery", "A", "NV"],
      ["2", "operational", "CAISO", "Gas", "B", "CA"],
      ["3", "completed", "CAISO", "Wind", "C", "CA"],
      ["4", "suspended", "CAISO", "Battery", "D", "CA"],
      ["5", "withdrawn", "CAISO", "Solar", "E", "CA"],
      ["6", "active", "LADWP", "Solar", "F", "CA"]]
    projects = annual.normalize_rows(rows, "data", 1)
    self.assertEqual(annual.summarize(projects), {"ACTIVE": 1, "COMPLETED": 2, "WITHDRAWN": 1, "SUSPENDED": 1})
    self.assertEqual(projects[0]["id"], "1A")
    self.assertEqual(projects[0]["state"], "NV")
    self.assertEqual(projects[1]["rawStatus"], "operational")
    self.assertEqual(projects[1]["sourceRow"], 3)
    self.assertEqual(projects[1]["sourceSheet"], "data")

  def test_newer_workbook_header_offset(self):
    rows = [["RETURN TO CONTENTS"], self.headers, [100, "active", "CAISO", "Battery", "A", "CA"]]
    project = annual.normalize_rows(rows, "03. Complete Queue Data", 2)[0]
    self.assertEqual(project["id"], "100")
    self.assertEqual(project["sourceRow"], 3)

  def test_unknown_status_missing_identity_and_duplicates_fail(self):
    for identity, status in [("1", "unknown"), (None, "active"), ("NA", "active")]:
      with self.assertRaises(ValueError):
        annual.normalize_rows([self.headers, [identity, status, "CAISO", "Solar", "A", "CA"]], "data", 1)
    for projects in [[], [{"id": "1", "status": "ACTIVE"}, {"id": "1", "status": "WITHDRAWN"}]]:
      with self.assertRaises(ValueError):
        annual.summarize(projects)
    with self.assertRaises(ValueError):
      annual.normalize_rows([["wrong", "columns"]], "data", 1)


if __name__ == "__main__":
  unittest.main()
