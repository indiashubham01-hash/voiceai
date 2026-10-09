import zipfile
import os

zip_path = "C:/Users/india/Downloads/riiid-test-answer-prediction.zip"
if os.path.exists(zip_path):
    with zipfile.ZipFile(zip_path, 'r') as z:
        print("Files in riiid-test-answer-prediction.zip:")
        for info in z.infolist():
            print(f"  - {info.filename}: {info.file_size / (1024*1024):.2f} MB (Compressed: {info.compress_size / (1024*1024):.2f} MB)")
else:
    print("Zip file not found at:", zip_path)
