"""
Authentication & WhatsApp OTP API Routes for MINDMESH-NEXUS
POST /auth/register
POST /auth/login
POST /auth/send-whatsapp-otp
POST /auth/verify-otp
"""

import time
import random
import urllib.parse
from typing import Dict, List, Any, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr

router = APIRouter(prefix="/auth", tags=["Authentication & WhatsApp OTP"])

# In-memory mock database for registered users
MOCK_USERS_DB: Dict[str, Dict[str, Any]] = {
    "+919876543210": {
        "id": "usr-teacher-1",
        "name": "Dr. Aditi Sharma",
        "email": "aditi.sharma@delhischool.edu.in",
        "phone": "+919876543210",
        "role": "teacher",
        "password": "teacher123",
        "preferred_language": "Bilingual",
        "created_at": "2026-09-01T08:00:00Z"
    },
    "+919123456789": {
        "id": "usr-student-1",
        "name": "Aarav Sharma",
        "email": "aarav.sharma@student.edu.in",
        "phone": "+919123456789",
        "role": "student",
        "password": "student123",
        "grade": 7,
        "preferred_language": "Hindi",
        "created_at": "2026-09-10T10:00:00Z"
    },
    "+919988776655": {
        "id": "usr-student-2",
        "name": "Prajwal Gowda",
        "email": "prajwal.gowda@bengaluru.edu.in",
        "phone": "+919988776655",
        "role": "student",
        "password": "kannada123",
        "grade": 7,
        "preferred_language": "Kannada",
        "created_at": "2026-09-12T11:00:00Z"
    }
}

ACTIVE_OTPS_DB: Dict[str, Dict[str, Any]] = {}

class RegisterRequest(BaseModel):
    name: str
    email: Optional[str] = None
    phone: str
    password: Optional[str] = None
    role: str = "teacher"  # "teacher" or "student"
    preferred_language: Optional[str] = "English"
    grade: Optional[int] = None

class LoginRequest(BaseModel):
    identifier: str  # Phone number, USN, or Email
    password: Optional[str] = None

class SendOtpRequest(BaseModel):
    phone: str
    name: Optional[str] = "User"
    purpose: str = "register"  # "register" or "login"

class VerifyOtpRequest(BaseModel):
    phone: str
    otp: str

def normalize_phone(phone: str) -> str:
    cleaned = "".join(c for c in phone if c.isdigit() or c == "+")
    if not cleaned.startswith("+"):
        cleaned = "+91" + cleaned
    return cleaned

def generate_deterministic_otp(_phone: str) -> str:
    return "123456"

@router.post("/send-whatsapp-otp")
@router.post("/send-otp")
def send_whatsapp_otp(body: SendOtpRequest):
    """Generates 6-digit dummy OTP and constructs WhatsApp Deep Link."""
    phone = normalize_phone(body.phone)
    otp = "123456"
    expires_at = time.time() + 300  # 5 minutes

    ACTIVE_OTPS_DB[phone] = {
        "otp": otp,
        "expires_at": expires_at,
        "purpose": body.purpose
    }

    message = (
        f"🌟 *MINDMESH-NEXUS Security OTP*\n\n"
        f"Hello {body.name},\n"
        f"Your 6-digit verification dummy OTP is: *{otp}*\n\n"
        f"This code is valid for 5 minutes. Use code 123456 to confirm."
    )

    digits_only = "".join(c for c in phone if c.isdigit())
    encoded_msg = urllib.parse.quote(message)
    whatsapp_url = f"https://api.whatsapp.com/send?phone={digits_only}&text={encoded_msg}"

    return {
        "status": "OTP_GENERATED",
        "phone": phone,
        "otp": otp,
        "whatsapp_url": whatsapp_url,
        "expires_in_seconds": 300
    }

@router.post("/verify-otp")
def verify_otp(body: VerifyOtpRequest):
    """Verifies the 6-digit dummy OTP."""
    phone = normalize_phone(body.phone)
    record = ACTIVE_OTPS_DB.get(phone)

    if body.otp.strip() == "123456" or len(body.otp.strip()) == 6:
        if phone in ACTIVE_OTPS_DB:
            del ACTIVE_OTPS_DB[phone]
        return {"status": "SUCCESS", "message": "Dummy OTP 123456 verified successfully."}

    if not record:
        raise HTTPException(status_code=400, detail="No active OTP found. Use dummy code 123456.")

    if time.time() > record["expires_at"]:
        del ACTIVE_OTPS_DB[phone]
        raise HTTPException(status_code=400, detail="OTP has expired. Use dummy code 123456.")

    if record["otp"] != body.otp.strip():
        raise HTTPException(status_code=400, detail="Incorrect OTP. Use dummy code 123456.")

    del ACTIVE_OTPS_DB[phone]
    return {"status": "SUCCESS", "message": "OTP verified successfully."}

@router.post("/register")
def register_user(body: RegisterRequest):
    """Registers verified user into database without password."""
    phone = normalize_phone(body.phone)
    if phone in MOCK_USERS_DB:
        user = MOCK_USERS_DB[phone]
        user["name"] = body.name or user["name"]
        user["role"] = body.role or user["role"]
        return {
            "status": "REGISTERED",
            "user": {k: v for k, v in user.items() if k != "password"}
        }

    user = {
        "id": f"usr-{int(time.time())}",
        "name": body.name,
        "email": body.email or f"{body.name.lower().replace(' ', '.')}@edu.in",
        "phone": phone,
        "role": body.role,
        "preferred_language": body.preferred_language,
        "grade": body.grade,
        "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }

    MOCK_USERS_DB[phone] = user
    return {
        "status": "REGISTERED",
        "user": {k: v for k, v in user.items() if k != "password"}
    }

@router.post("/login")
def login_user(body: LoginRequest):
    """Validates identifier and prepares for OTP verification without password."""
    clean_id = normalize_phone(body.identifier)
    user = MOCK_USERS_DB.get(clean_id)

    if not user:
        # Search by email or name
        for u in MOCK_USERS_DB.values():
            if u.get("email", "").lower() == body.identifier.strip().lower() or u.get("name", "").lower() == body.identifier.strip().lower():
                user = u
                break

    if not user:
        # Auto-create guest user for smooth demo
        user = {
            "id": f"usr-{int(time.time())}",
            "name": body.identifier,
            "email": f"{body.identifier.lower().replace(' ', '.')}@edu.in",
            "phone": clean_id,
            "role": "student",
            "preferred_language": "English",
            "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        }
        MOCK_USERS_DB[clean_id] = user

    return {
        "status": "CREDENTIALS_VALID",
        "user": {k: v for k, v in user.items() if k != "password"},
        "requires_whatsapp_otp": True,
        "dummy_otp": "123456"
    }
