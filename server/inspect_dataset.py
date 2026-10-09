import json
import os
import glob
import zipfile

def inspect_notebook():
    nb_path = "data/student-performance-project.ipynb"
    if os.path.exists(nb_path):
        with open(nb_path, "r", encoding="utf-8") as f:
            nb = json.load(f)
        print(f"Total notebook cells: {len(nb.get('cells', []))}")
        for idx, cell in enumerate(nb.get("cells", [])):
            cell_type = cell.get("cell_type")
            source = "".join(cell.get("source", []))
            if "read_csv" in source or "pd." in source or "Dataset" in source or "import" in source or "train" in source:
                print(f"\n--- Cell {idx} ({cell_type}) ---")
                print(source[:500])

def inspect_zips():
    downloads_path = "C:/Users/india/Downloads"
    zips = glob.glob(os.path.join(downloads_path, "*.zip"))
    print(f"\nFound {len(zips)} zip files in Downloads:")
    for z in zips:
        try:
            with zipfile.ZipFile(z, 'r') as zip_ref:
                names = zip_ref.namelist()
                print(f"  {os.path.basename(z)}: {names}")
                for name in names:
                    if name.endswith('.csv') or name.endswith('.xlsx'):
                        zip_ref.extract(name, "data/")
                        print(f"    -> Extracted {name} to data/")
        except Exception as e:
            print(f"  Error reading {z}: {e}")

if __name__ == "__main__":
    inspect_notebook()
    inspect_zips()
    print("\nFiles in data/:", os.listdir("data"))
