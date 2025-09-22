import requests
import datetime
import matplotlib.pyplot as plt
import sys


if len(sys.argv) < 5:
    print("Uso: python burndownchart.py <TOKEN> <OWNER> <REPO> <MILESTONE_NUMBER>")
    sys.exit(1)

TOKEN = sys.argv[1]
OWNER = sys.argv[2]
REPO = sys.argv[3]
MILESTONE_NUMBER = sys.argv[4]


headers = {"Authorization": f"token {TOKEN}"}


url_milestone = f"https://api.github.com/repos/{OWNER}/{REPO}/milestones/{MILESTONE_NUMBER}"
milestone = requests.get(url_milestone, headers=headers).json()

title = milestone.get("title", "Milestone")
due_date = milestone.get("due_on")
if due_date:
    due_date = datetime.datetime.strptime(due_date, "%Y-%m-%dT%H:%M:%SZ").date()
else:
    due_date = datetime.date.today() + datetime.timedelta(days=10)  # fallback si no hay fecha

url_issues = f"https://api.github.com/repos/{OWNER}/{REPO}/issues"
params = {"milestone": MILESTONE_NUMBER, "state": "all"}
issues = requests.get(url_issues, headers=headers, params=params).json()

total_issues = len(issues)
closed_issues = [i for i in issues if i.get("state") == "closed"]


start_date = datetime.date.today()
days = (due_date - start_date).days
if days <= 0: days = 1

ideal_line = [total_issues - (total_issues * (d / days)) for d in range(days + 1)]
actual_line = [total_issues - int((len(closed_issues) / days) * d) for d in range(days + 1)]

plt.figure(figsize=(10, 6))
plt.plot(range(days + 1), ideal_line, label="Ideal", linestyle="--")
plt.plot(range(days + 1), actual_line, label="Actual", marker="o")
plt.title(f"Burndown Chart - {title}")
plt.xlabel("Días")
plt.ylabel("Issues restantes")
plt.legend()
plt.grid(True)


output_file = "burndown.png"
plt.savefig(output_file)
print(f" Burndown Chart guardado en {output_file}")


plt.show()
