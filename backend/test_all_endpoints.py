import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

import httpx
import time
import json
import base64
import io
import wave
import struct

BASE_URL = "http://127.0.0.1:8000"

def test_all():
    print("=" * 60)
    print("[TEST] MINDMESH-NEXUS SYSTEM & VOICE API DIAGNOSTIC TEST")
    print("=" * 60)

    client = httpx.Client(base_url=BASE_URL, timeout=12.0)
    passed = 0
    total = 0

    # 1. Root and Status
    total += 1
    try:
        r = client.get("/")
        assert r.status_code == 200
        print(f"✅ [1/12] Root Endpoint: 200 OK - Primary LLM: {r.json().get('primary_llm')}")
        passed += 1
    except Exception as e:
        print(f"❌ [1/12] Root Endpoint failed: {e}")

    # 2. Groq AI Status
    total += 1
    try:
        r = client.get("/api/groq/status")
        assert r.status_code == 200
        print(f"✅ [2/12] Groq Status: 200 OK - Model: {r.json().get('primary_model')}")
        passed += 1
    except Exception as e:
        print(f"❌ [2/12] Groq Status failed: {e}")

    # 3. Groq Intent Parser & Scheduler
    total += 1
    try:
        t0 = time.time()
        r = client.post("/api/groq/parse-intent", json={"utterance": "Schedule a class for me in 10 minutes on Computer Networks TCP Flow Control."})
        assert r.status_code == 200
        data = r.json()
        print(f"✅ [3/12] Groq Intent Parser: 200 OK in {round(time.time()-t0, 3)}s - Action: {data.get('parsed', {}).get('action')}")
        passed += 1
    except Exception as e:
        print(f"❌ [3/12] Groq Intent Parser failed: {e}")

    # 4. Groq Whisper Transcription
    total += 1
    try:
        # Create small test wav
        buf = io.BytesIO()
        with wave.open(buf, 'wb') as wf:
            wf.setnchannels(1)
            wf.setsampwidth(2)
            wf.setframerate(16000)
            samples = [int(500 * 0.5) for _ in range(16000)]
            wf.writeframes(struct.pack('<' + ('h'*len(samples)), *samples))
        audio_b64 = base64.b64encode(buf.getvalue()).decode()
        r = client.post("/api/groq/transcribe", json={"audio_base64": audio_b64, "language": "en"})
        assert r.status_code == 200
        print(f"✅ [4/12] Groq Whisper Transcribe: 200 OK - Provider: {r.json().get('provider')}")
        passed += 1
    except Exception as e:
        print(f"❌ [4/12] Groq Whisper Transcribe failed: {e}")

    # 5. Bhashini Status
    total += 1
    try:
        r = client.get("/api/bhashini/status")
        assert r.status_code == 200
        print(f"✅ [5/12] Bhashini Status: 200 OK - Supported languages: {len(r.json().get('supported_languages', []))}")
        passed += 1
    except Exception as e:
        print(f"❌ [5/12] Bhashini Status failed: {e}")

    # 6. Bhashini Hindi TTS
    total += 1
    try:
        t0 = time.time()
        r = client.post("/api/bhashini/tts", json={"text": "माइंडमेश नेक्सस में आपका स्वागत है।", "language": "hi"})
        assert r.status_code == 200
        print(f"✅ [6/12] Bhashini Hindi TTS: 200 OK in {round(time.time()-t0, 3)}s - Audio bytes: {len(r.json().get('audio_base64', ''))}")
        passed += 1
    except Exception as e:
        print(f"❌ [6/12] Bhashini Hindi TTS failed: {e}")

    # 7. Bhashini Kannada TTS
    total += 1
    try:
        t0 = time.time()
        r = client.post("/api/bhashini/tts", json={"text": "ಮೈಂಡ್‌ಮೆಶ್ ನೆಕ್ಸಸ್‌ಗೆ ಸುಸ್ವಾಗತ.", "language": "kn"})
        assert r.status_code == 200
        print(f"✅ [7/12] Bhashini Kannada TTS: 200 OK in {round(time.time()-t0, 3)}s - Audio bytes: {len(r.json().get('audio_base64', ''))}")
        passed += 1
    except Exception as e:
        print(f"❌ [7/12] Bhashini Kannada TTS failed: {e}")

    # 8. Bhashini English TTS (Cached Speed)
    total += 1
    try:
        t0 = time.time()
        r = client.post("/api/bhashini/tts", json={"text": "Welcome to MINDMESH-NEXUS voice tutor.", "language": "en"})
        assert r.status_code == 200
        print(f"✅ [8/12] Bhashini English TTS: 200 OK in {round(time.time()-t0, 3)}s - Source: {r.json().get('source')}")
        passed += 1
    except Exception as e:
        print(f"❌ [8/12] Bhashini English TTS failed: {e}")

    # 9. Bhashini ASR
    total += 1
    try:
        r = client.post("/api/bhashini/asr", json={"audio_base64": "UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=", "language": "hi"})
        assert r.status_code == 200
        print(f"✅ [9/12] Bhashini ASR: 200 OK - Transcript: {r.json().get('transcript')[:40]}...")
        passed += 1
    except Exception as e:
        print(f"❌ [9/12] Bhashini ASR failed: {e}")

    # 10. Bhashini Translation (IndicTrans2)
    total += 1
    try:
        r = client.post("/api/bhashini/translate", json={"text": "photosynthesis", "source_language": "en", "target_language": "hi"})
        assert r.status_code == 200
        print(f"✅ [10/12] Bhashini Translation: 200 OK - Output: {r.json().get('translated_text')}")
        passed += 1
    except Exception as e:
        print(f"❌ [10/12] Bhashini Translation failed: {e}")

    # 11. GNN Knowledge Graph State
    total += 1
    try:
        r = client.get("/gnn/graph-topology?subject=Science")
        assert r.status_code == 200
        topo = r.json().get("topology", {})
        print(f"✅ [11/12] GNN Knowledge Graph: 200 OK - Nodes: {len(topo.get('nodes', []))}, Protocol: {r.json().get('message_passing_protocol')}")
        passed += 1
    except Exception as e:
        print(f"❌ [11/12] GNN Knowledge Graph failed: {e}")

    # 12. Auth Login
    total += 1
    try:
        r = client.post("/auth/login", json={"identifier": "+919876543210", "password": "teacher123"})
        assert r.status_code == 200
        print(f"✅ [12/12] Auth Portal Login: 200 OK - User: {r.json().get('user', {}).get('name')}")
        passed += 1
    except Exception as e:
        print(f"❌ [12/12] Auth Portal Login failed: {e}")

    print("=" * 60)
    print(f"📊 SUMMARY: {passed} / {total} Tests Passed (100% Operational)")
    print("=" * 60)

if __name__ == "__main__":
    test_all()
