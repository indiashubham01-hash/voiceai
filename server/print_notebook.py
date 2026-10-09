import json

with open("data/student-performance-project.ipynb", "r", encoding="utf-8") as f:
    nb = json.load(f)

print(f"Total cells: {len(nb.get('cells', []))}")
for i, cell in enumerate(nb.get("cells", [])):
    print(f"\n================ CELL {i} ({cell.get('cell_type')}) ================")
    print("".join(cell.get("source", [])))
