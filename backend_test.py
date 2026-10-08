#!/usr/bin/env python3
"""
Backend API tests for Financial Readiness Check - Resend Email Integration
Tests the /api/submit-assessment endpoint with email graceful skip when RESEND_API_KEY is missing.
"""

import requests
import json
import os
import sys

# Get base URL from environment
BASE_URL = os.getenv('NEXT_PUBLIC_BASE_URL', 'https://financial-check-mail.preview.emergentagent.com')
API_BASE = f"{BASE_URL}/api"

print(f"Testing against: {API_BASE}")
print("=" * 80)

# Track test results
test_results = {
    "passed": 0,
    "failed": 0,
    "tests": []
}

def log_test(name, passed, message=""):
    """Log test result"""
    status = "✅ PASS" if passed else "❌ FAIL"
    print(f"{status}: {name}")
    if message:
        print(f"   {message}")
    
    test_results["tests"].append({
        "name": name,
        "passed": passed,
        "message": message
    })
    
    if passed:
        test_results["passed"] += 1
    else:
        test_results["failed"] += 1

def print_summary():
    """Print test summary"""
    print("\n" + "=" * 80)
    print("TEST SUMMARY")
    print("=" * 80)
    print(f"Total: {test_results['passed'] + test_results['failed']}")
    print(f"Passed: {test_results['passed']}")
    print(f"Failed: {test_results['failed']}")
    print("=" * 80)
    
    if test_results["failed"] > 0:
        print("\nFailed tests:")
        for test in test_results["tests"]:
            if not test["passed"]:
                print(f"  ❌ {test['name']}")
                if test["message"]:
                    print(f"     {test['message']}")

# ============================================================================
# TEST 1: POST /api/submit-assessment with realistic payload
# ============================================================================
print("\n[TEST 1] POST /api/submit-assessment with realistic payload")
print("-" * 80)

payload_1 = {
    "leadInfo": {
        "first_name": "Juan",
        "last_name": "Dela Cruz",
        "email": "juan.delacruz@example.com",
        "mobile": "09171234567",
        "preferred_contact": "email",
        "consent": True
    },
    "assessmentData": {
        "age": "35",
        "num_children": "2",
        "dependents": "3",
        "monthly_income": "60000",
        "additional_income": "5000",
        "monthly_expenses": "35000",
        "housing_cost": "12000",
        "emergency_fund": "150000",
        "savings": "200000",
        "has_life_insurance": True,
        "life_insurance_coverage": "2000000",
        "has_health_insurance": True,
        "has_critical_illness": False,
        "has_hmo": True,
        "has_accident_insurance": False,
        "home_loan": "0",
        "car_loan": "300000",
        "personal_loan": "0",
        "credit_card_debt": "20000",
        "other_debt": "0",
        "existing_investments": True,
        "goals": ["retirement", "education", "protection"]
    }
}

try:
    response = requests.post(f"{API_BASE}/submit-assessment", json=payload_1, timeout=30)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text[:500]}")
    
    # Check status code
    if response.status_code == 200:
        log_test("Test 1: HTTP 200 status", True)
        
        # Parse JSON
        try:
            data = response.json()
            print(f"Full Response JSON: {json.dumps(data, indent=2)}")
            
            # Check for leadId (UUID)
            if "leadId" in data and data["leadId"]:
                lead_id_1 = data["leadId"]
                log_test("Test 1: leadId present", True, f"leadId: {lead_id_1}")
            else:
                log_test("Test 1: leadId present", False, "leadId missing in response")
                lead_id_1 = None
            
            # Check for readinessScore (number 0-100)
            if "readinessScore" in data:
                score = data["readinessScore"]
                if isinstance(score, (int, float)) and 0 <= score <= 100:
                    log_test("Test 1: readinessScore valid", True, f"Score: {score}")
                else:
                    log_test("Test 1: readinessScore valid", False, f"Invalid score: {score}")
            else:
                log_test("Test 1: readinessScore present", False, "readinessScore missing")
            
            # Check for emailSent === false
            if "emailSent" in data:
                email_sent = data["emailSent"]
                if email_sent == False:
                    log_test("Test 1: emailSent === false", True, "Email gracefully skipped (no RESEND_API_KEY)")
                else:
                    log_test("Test 1: emailSent === false", False, f"emailSent is {email_sent}, expected false")
            else:
                log_test("Test 1: emailSent field present", False, "emailSent missing")
            
            # Check it's NOT "Failed to create lead"
            if "error" in data and "Failed to create lead" in data.get("error", ""):
                log_test("Test 1: No 'Failed to create lead' error", False, "Got 'Failed to create lead' error")
            else:
                log_test("Test 1: No 'Failed to create lead' error", True)
                
        except json.JSONDecodeError as e:
            log_test("Test 1: Valid JSON response", False, f"JSON decode error: {e}")
            lead_id_1 = None
    else:
        log_test("Test 1: HTTP 200 status", False, f"Got {response.status_code}")
        lead_id_1 = None
        
except Exception as e:
    log_test("Test 1: Request successful", False, f"Exception: {e}")
    lead_id_1 = None

# ============================================================================
# TEST 2: GET /api/results?leadId=<leadId from test 1>
# ============================================================================
print("\n[TEST 2] GET /api/results?leadId=<leadId from test 1>")
print("-" * 80)

if lead_id_1:
    try:
        response = requests.get(f"{API_BASE}/results?leadId={lead_id_1}", timeout=30)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text[:500]}")
        
        if response.status_code == 200:
            log_test("Test 2: HTTP 200 status", True)
            
            try:
                data = response.json()
                print(f"Full Response JSON: {json.dumps(data, indent=2)[:1000]}")
                
                # Check for lead object
                if "lead" in data and data["lead"]:
                    lead = data["lead"]
                    # Verify lead info matches
                    if lead.get("first_name") == "Juan" and lead.get("last_name") == "Dela Cruz":
                        log_test("Test 2: Lead data matches", True, f"Name: {lead.get('first_name')} {lead.get('last_name')}")
                    else:
                        log_test("Test 2: Lead data matches", False, f"Name mismatch: {lead.get('first_name')} {lead.get('last_name')}")
                else:
                    log_test("Test 2: Lead object present", False, "lead missing in response")
                
                # Check for assessment object
                if "assessment" in data and data["assessment"]:
                    assessment = data["assessment"]
                    # Verify numeric fields are parsed
                    if isinstance(assessment.get("monthly_income"), (int, float)):
                        log_test("Test 2: Assessment numeric fields parsed", True, f"monthly_income: {assessment.get('monthly_income')}")
                    else:
                        log_test("Test 2: Assessment numeric fields parsed", False, f"monthly_income not numeric: {assessment.get('monthly_income')}")
                else:
                    log_test("Test 2: Assessment object present", False, "assessment missing in response")
                
                # Check for recommendations object
                if "recommendations" in data and data["recommendations"]:
                    recs = data["recommendations"]
                    has_strengths = "strengths" in recs and isinstance(recs["strengths"], list)
                    has_improvements = "improvements" in recs and isinstance(recs["improvements"], list)
                    has_priorities = "priorities" in recs and isinstance(recs["priorities"], list)
                    
                    if has_strengths and has_improvements and has_priorities:
                        log_test("Test 2: Recommendations structure valid", True, 
                                f"strengths: {len(recs['strengths'])}, improvements: {len(recs['improvements'])}, priorities: {len(recs['priorities'])}")
                    else:
                        log_test("Test 2: Recommendations structure valid", False, "Missing strengths/improvements/priorities arrays")
                else:
                    log_test("Test 2: Recommendations object present", False, "recommendations missing in response")
                    
            except json.JSONDecodeError as e:
                log_test("Test 2: Valid JSON response", False, f"JSON decode error: {e}")
        else:
            log_test("Test 2: HTTP 200 status", False, f"Got {response.status_code}")
            
    except Exception as e:
        log_test("Test 2: Request successful", False, f"Exception: {e}")
else:
    log_test("Test 2: Skipped", False, "No leadId from Test 1")

# ============================================================================
# TEST 3: POST /api/submit-assessment with minimal/low-income payload
# ============================================================================
print("\n[TEST 3] POST /api/submit-assessment with minimal/low-income payload")
print("-" * 80)

payload_3 = {
    "leadInfo": {
        "first_name": "Test",
        "last_name": "LowScore",
        "email": "lowscore@example.com",
        "mobile": "09170000000",
        "preferred_contact": "phone",
        "consent": True
    },
    "assessmentData": {
        "age": "25",
        "num_children": "0",
        "dependents": "0",
        "monthly_income": "10000",
        "additional_income": "0",
        "monthly_expenses": "9000",
        "housing_cost": "5000",
        "emergency_fund": "0",
        "savings": "0",
        "has_life_insurance": False,
        "life_insurance_coverage": "0",
        "has_health_insurance": False,
        "has_critical_illness": False,
        "has_hmo": False,
        "has_accident_insurance": False,
        "home_loan": "0",
        "car_loan": "0",
        "personal_loan": "0",
        "credit_card_debt": "0",
        "other_debt": "0",
        "existing_investments": False,
        "goals": []
    }
}

try:
    response = requests.post(f"{API_BASE}/submit-assessment", json=payload_3, timeout=30)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text[:500]}")
    
    if response.status_code == 200:
        log_test("Test 3: HTTP 200 status", True)
        
        try:
            data = response.json()
            print(f"Full Response JSON: {json.dumps(data, indent=2)}")
            
            # Check for emailSent === false
            if "emailSent" in data and data["emailSent"] == False:
                log_test("Test 3: emailSent === false", True)
            else:
                log_test("Test 3: emailSent === false", False, f"emailSent: {data.get('emailSent')}")
            
            # Check for valid (low) readinessScore
            if "readinessScore" in data:
                score = data["readinessScore"]
                if isinstance(score, (int, float)) and 0 <= score <= 100:
                    log_test("Test 3: Valid low readinessScore", True, f"Score: {score}")
                else:
                    log_test("Test 3: Valid readinessScore", False, f"Invalid score: {score}")
            else:
                log_test("Test 3: readinessScore present", False, "readinessScore missing")
            
            # Check for leadId
            if "leadId" in data and data["leadId"]:
                log_test("Test 3: leadId present", True, f"leadId: {data['leadId']}")
            else:
                log_test("Test 3: leadId present", False, "leadId missing")
                
        except json.JSONDecodeError as e:
            log_test("Test 3: Valid JSON response", False, f"JSON decode error: {e}")
    else:
        log_test("Test 3: HTTP 200 status", False, f"Got {response.status_code}")
        
except Exception as e:
    log_test("Test 3: Request successful", False, f"Exception: {e}")

# ============================================================================
# TEST 4: Admin endpoints still work (return 401 without auth)
# ============================================================================
print("\n[TEST 4] Admin endpoints return 401 without auth")
print("-" * 80)

# Test GET /api/admin/leads
try:
    response = requests.get(f"{API_BASE}/admin/leads", timeout=30)
    print(f"GET /api/admin/leads - Status Code: {response.status_code}")
    
    if response.status_code == 401:
        log_test("Test 4: GET /api/admin/leads returns 401", True, "Unauthorized (expected)")
    else:
        log_test("Test 4: GET /api/admin/leads returns 401", False, f"Got {response.status_code}")
        
except Exception as e:
    log_test("Test 4: GET /api/admin/leads request", False, f"Exception: {e}")

# Test GET /api/admin/stats
try:
    response = requests.get(f"{API_BASE}/admin/stats", timeout=30)
    print(f"GET /api/admin/stats - Status Code: {response.status_code}")
    
    if response.status_code == 401:
        log_test("Test 4: GET /api/admin/stats returns 401", True, "Unauthorized (expected)")
    else:
        log_test("Test 4: GET /api/admin/stats returns 401", False, f"Got {response.status_code}")
        
except Exception as e:
    log_test("Test 4: GET /api/admin/stats request", False, f"Exception: {e}")

# ============================================================================
# Print Summary
# ============================================================================
print_summary()

# Exit with appropriate code
sys.exit(0 if test_results["failed"] == 0 else 1)
