"""Rebuilds src/data/activity.json: commits per day across project repos.

The home page draws one dot per commit, so run this whenever there is new work:

    python3 scripts/activity.py src/data/activity.json /path/to/repo [/path/to/another ...]

Only commits whose author name starts with "Rourke" are counted, and only dates
and counts are written. No code, messages, repo names or paths leave the repos.
"""
import collections, datetime, json, subprocess, sys

out_path, repos = sys.argv[1], sys.argv[2:]
per_day = collections.Counter()
per_repo = {}
for repo in repos:
    log = subprocess.run(
        ["git", "-C", repo, "log", "--format=%an|%ad", "--date=short"],
        capture_output=True, text=True, check=True,
    ).stdout.splitlines()
    mine = [line.split("|")[1] for line in log if line.split("|")[0].startswith("Rourke")]
    others = collections.Counter(line.split("|")[0] for line in log if not line.split("|")[0].startswith("Rourke"))
    per_repo[repo.rstrip("/").split("/")[-1]] = (len(mine), dict(others))
    per_day.update(mine)

first = datetime.date.fromisoformat(min(per_day))
last = datetime.date.fromisoformat(max(per_day))
days = [(first + datetime.timedelta(d)).isoformat() for d in range((last - first).days + 1)]
counts = [per_day.get(d, 0) for d in days]
data = {"from": first.isoformat(), "to": last.isoformat(), "counts": counts}
with open(out_path, "w") as f:
    json.dump(data, f, separators=(",", ":"))
    f.write("\n")

months = collections.Counter()
for d, c in zip(days, counts):
    months[d[:7]] += c
print("per repo (mine, others):", per_repo)
print("range:", first, "to", last, "=", len(days), "days")
print("total commits:", sum(counts), "| active days:", sum(1 for c in counts if c), "| busiest day:", max(counts), "on", days[counts.index(max(counts))])
print("per month:", dict(sorted(months.items())))
print("weekday totals Mon..Sun:", [sum(c for d, c in zip(days, counts) if datetime.date.fromisoformat(d).weekday() == w) for w in range(7)])
