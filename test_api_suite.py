import requests
import json
import sys

BASE_URL = "http://127.0.0.1:8000"

test_results = []

def run_test(name, method, endpoint, payload=None, expected_status=200):
    url = f"{BASE_URL}{endpoint}"
    try:
        if method == "GET":
            res = requests.get(url, timeout=15)
        elif method == "POST":
            res = requests.post(url, json=payload or {}, timeout=15)
        else:
            res = requests.request(method, url, timeout=15)
        
        status_ok = res.status_code == expected_status or (expected_status == 200 and res.status_code in [200, 201])
        data_preview = ""
        try:
            js = res.json()
            data_preview = str(js)[:120]
        except:
            data_preview = res.text[:120]
            
        test_results.append({
            "name": name,
            "endpoint": endpoint,
            "method": method,
            "status_code": res.status_code,
            "passed": status_ok,
            "preview": data_preview
        })
        print(f"[{'PASS' if status_ok else 'FAIL'}] {name} ({method} {endpoint}) -> Status: {res.status_code}")
    except Exception as e:
        test_results.append({
            "name": name,
            "endpoint": endpoint,
            "method": method,
            "status_code": "ERROR",
            "passed": False,
            "preview": str(e)
        })
        print(f"[FAIL] {name} ({method} {endpoint}) -> Exception: {e}")

print("=== STARTING BACKEND API VERIFICATION ===")

# 1. System & Root
run_test("Root Status", "GET", "/")
run_test("System Status", "GET", "/api/system/status")

# 2. Engineering Dataset & Fine-Tuning Accuracy
run_test("Engineering Accuracy Report", "GET", "/api/engineering/accuracy-report")
run_test("Engineering Dataset Stats", "GET", "/api/engineering/dataset-stats")
run_test("Engineering Training Report", "GET", "/api/engineering/training-report")
run_test("Engineering Concept Query", "POST", "/api/engineering/query", {"query": "What is the Nyquist criterion in Control Systems?"})

# 3. Voice & Bhashini APIs
run_test("Bhashini Status", "GET", "/api/bhashini/status")
run_test("Bhashini ASR Mock/Live", "POST", "/api/bhashini/asr", {"audio_base64": "UklGRi4AAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=", "language": "en"})
run_test("Bhashini TTS Generation", "POST", "/api/bhashini/tts", {"text": "Welcome to MindMesh Nexus real time voice verification.", "language": "en"})
run_test("Bhashini Translation", "POST", "/api/bhashini/translate", {"text": "Welcome students to your learning portal", "source_language": "en", "target_language": "hi"})

# 4. Groq Voice & Fast LPU
run_test("Groq Status", "GET", "/api/groq/status")
run_test("Groq Voice Parse Intent", "POST", "/api/groq/parse-intent", {"text": "Explain Nyquist plot stability for Module 3"})

# 5. Gemini & Agnes Models
run_test("Gemini Status", "GET", "/api/gemini/status")
run_test("Agnes Metrics", "GET", "/api/agnes/metrics")

# 6. GNN & Learner Endpoints
run_test("GNN Graph Topology", "GET", "/gnn/graph-topology")
run_test("Class Risk Report", "GET", "/class/class-101/risk-report")
run_test("Learner Profile", "GET", "/learners/student-001/profile")
run_test("ML Model Metrics", "GET", "/ml/model-metrics")

# 7. Quizzes & Plans
run_test("Quizzes List", "GET", "/quizzes/")

print("\n=== SUMMARY ===")
total = len(test_results)
passed = sum(1 for t in test_results if t["passed"])
print(f"Total Tests: {total}, Passed: {passed}, Failed: {total - passed}")
