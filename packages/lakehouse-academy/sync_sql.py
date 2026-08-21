#!/usr/bin/env python3
"""Copy the authored lab SQL into the package, and report drift.

The SQL is authored in content/courses/<id>/assets/lab/ so the LMS and the
package read the same files. The package needs its own copy to be installable
standalone, so this syncs it. `--check` fails instead of writing, for CI.
"""

from __future__ import annotations

import filecmp
import shutil
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
COURSES = {"genie-agents": "genie_agents"}


def pairs(course_id: str, pkg_dir: str):
    src = REPO / "content" / "courses" / course_id / "assets" / "lab"
    dst = REPO / "packages" / "lakehouse-academy" / "lakehouse_academy" / "courses" / pkg_dir
    for sql in sorted(src.glob("*.sql")):
        yield sql, dst / sql.name


def main() -> int:
    check = "--check" in sys.argv
    drift, synced = [], []

    for course_id, pkg_dir in COURSES.items():
        for src, dst in pairs(course_id, pkg_dir):
            same = dst.exists() and filecmp.cmp(src, dst, shallow=False)
            if same:
                continue
            if check:
                drift.append(f"{src.name} ({'differs' if dst.exists() else 'missing'})")
            else:
                dst.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(src, dst)
                synced.append(src.name)

    if check:
        if drift:
            print("SQL drift between content/ and the package:")
            for d in drift:
                print(f"  {d}")
            print("\nRun: python packages/lakehouse-academy/sync_sql.py")
            return 1
        print("package SQL is in sync with content/")
        return 0

    print(f"synced {len(synced)} file(s)" + (f": {', '.join(synced)}" if synced else " (already current)"))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
