#!/usr/bin/env python3
"""
Backend Regression Test for Financial Readiness Check
Tests the submit-assessment flow after email CTA booking URL change to Google Calendar
"""

import requests
import json
import sys
from datetime import datetime

# Base URL from .env
BASE_URL = "https://financial-check-mail.preview.emergentagent.com/api"

def print_test_header(test_num, description):
    """Print formatted test header"""
    print(f"\n{'='*80}")
    print(f"TEST {test_num}: {description}")
    print(f"{'='*80}")

def print_result(success, message):
    """Print test result"""
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status}: {message}")

def test_submit_assessment():
    """
    Test 1: POST /api/submit-assessment with realistic payload
    Expected: HTTP 200, leadId (UUID), readinessScore (0-100), emailSent=false
    """
    print_test_header(1, "POST /api/submit-assessment - Regression Test")
    
    payload = {
        "leadInfo": {
            "first_name": "Carlos",
            "last_name": "Reyes",
            "email": "carlos.reyes@example.com",
            "mobile": "09175559999",
            "preferred_contact": "email",
            "consent": True
        },
        "assessmentData": {
            "age": "45",
            "num_children": "3",
            "dependents": "4",
            "monthly_income": "80000",
            "additional_income": "10000",
            "monthly_expenses": "45000",
            "housing_cost": "15000",
            "emergency_fund": "200000",
            "savings": "300000",
            "has_life_insurance": True,
            "life_insurance_coverage": "3000000",
            "has_health_insurance": True,
            "has_critical_illness": True,
            "has_hmo": True,
            "has_accident_insurance": True,
            "home_loan": "500000",
            "car_loan": "0",
            "personal_loan": "0",
            "credit_card_debt": "0",
            "other_debt": "0",
            "existing_investments": True,
            "goals": ["retirement", "education", "protection"]
        }
    }
    
    try:
        print(f"Sending POST request to {BASE_URL}/submit-assessment")
        print(f"Payload: {json.dumps(payload, indent=2)}")
        
        response = requests.post(
            f"{BASE_URL}/submit-assessment",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        print(f"\nResponse Status: {response.status_code}")
        print(f"Response Body: {response.text}")
        
        # Check status code
        if response.status_code != 200:
            print_result(False, f"Expected status 200, got {response.status_code}")
            return None
        
        data = response.json()
        
        # Check for error messages
        if "error" in data:
            print_result(False, f"Response contains error: {data['error']}")
            if data.get("error") == "Failed to create lead":
                print("❌ CRITICAL: 'Failed to create lead' error detected!")
            return None
        
        # Validate response structure
        if "leadId" not in data:
            print_result(False, "Response missing 'leadId' field")
            return None
        
        if "readinessScore" not in data:
            print_result(False, "Response missing 'readinessScore' field")
            return None
        
        if "emailSent" not in data:
            print_result(False, "Response missing 'emailSent' field")
            return None
        
        # Validate leadId is UUID format
        lead_id = data["leadId"]
        if not isinstance(lead_id, str) or len(lead_id) < 32:
            print_result(False, f"leadId is not a valid UUID: {lead_id}")
            return None
        
        # Validate readinessScore is a number between 0-100
        score = data["readinessScore"]
        if not isinstance(score, (int, float)) or score < 0 or score > 100:
            print_result(False, f"readinessScore is not valid (0-100): {score}")
            return None
        
        # Validate emailSent is false (no RESEND_API_KEY locally)
        email_sent = data["emailSent"]
        if email_sent is not False:
            print_result(False, f"emailSent should be false (no RESEND_API_KEY), got: {email_sent}")
            return None
        
        print_result(True, f"Submit assessment successful - leadId: {lead_id}, score: {score}, emailSent: {email_sent}")
        return lead_id
        
    except requests.exceptions.RequestException as e:
        print_result(False, f"Request failed: {str(e)}")
        return None
    except json.JSONDecodeError as e:
        print_result(False, f"Invalid JSON response: {str(e)}")
        return None
    except Exception as e:
        print_result(False, f"Unexpected error: {str(e)}")
        return None

def test_get_results(lead_id):
    """
    Test 2: GET /api/results?leadId=<leadId>
    Expected: HTTP 200 with lead, assessment, recommendations
    """
    print_test_header(2, f"GET /api/results?leadId={lead_id}")
    
    try:
        print(f"Sending GET request to {BASE_URL}/results?leadId={lead_id}")
        
        response = requests.get(
            f"{BASE_URL}/results",
            params={"leadId": lead_id},
            timeout=30
        )
        
        print(f"\nResponse Status: {response.status_code}")
        print(f"Response Body: {response.text[:500]}...")  # First 500 chars
        
        if response.status_code != 200:
            print_result(False, f"Expected status 200, got {response.status_code}")
            return False
        
        data = response.json()
        
        # Validate response structure
        if "lead" not in data:
            print_result(False, "Response missing 'lead' field")
            return False
        
        if "assessment" not in data:
            print_result(False, "Response missing 'assessment' field")
            return False
        
        if "recommendations" not in data:
            print_result(False, "Response missing 'recommendations' field")
            return False
        
        # Validate lead data
        lead = data["lead"]
        if lead.get("first_name") != "Carlos" or lead.get("last_name") != "Reyes":
            print_result(False, f"Lead name mismatch: {lead.get('first_name')} {lead.get('last_name')}")
            return False
        
        # Validate assessment data (numeric fields should be parsed)
        assessment = data["assessment"]
        monthly_income = assessment.get("monthly_income")
        if not isinstance(monthly_income, (int, float)) or monthly_income != 80000:
            print_result(False, f"Assessment monthly_income should be 80000 (number), got: {monthly_income} ({type(monthly_income).__name__})")
            return False
        
        # Validate recommendations structure
        recommendations = data["recommendations"]
        if "strengths" not in recommendations or not isinstance(recommendations["strengths"], list):
            print_result(False, "Recommendations missing 'strengths' array")
            return False
        
        if "improvements" not in recommendations or not isinstance(recommendations["improvements"], list):
            print_result(False, "Recommendations missing 'improvements' array")
            return False
        
        if "priorities" not in recommendations or not isinstance(recommendations["priorities"], list):
            print_result(False, "Recommendations missing 'priorities' array")
            return False
        
        print(f"Lead: {lead.get('first_name')} {lead.get('last_name')} ({lead.get('email')})")
        print(f"Assessment: monthly_income={monthly_income}, emergency_fund={assessment.get('emergency_fund')}")
        print(f"Recommendations: {len(recommendations['strengths'])} strengths, {len(recommendations['improvements'])} improvements, {len(recommendations['priorities'])} priorities")
        
        print_result(True, "Results retrieved successfully with complete data")
        return True
        
    except requests.exceptions.RequestException as e:
        print_result(False, f"Request failed: {str(e)}")
        return False
    except json.JSONDecodeError as e:
        print_result(False, f"Invalid JSON response: {str(e)}")
        return False
    except Exception as e:
        print_result(False, f"Unexpected error: {str(e)}")
        return False

def test_book_appointment(lead_id):
    """
    Test 3: POST /api/book-appointment
    Expected: HTTP 200 with success=true and appointmentId
    """
    print_test_header(3, f"POST /api/book-appointment for leadId={lead_id}")
    
    payload = {
        "leadId": lead_id,
        "preferredDate": "2025-08-15",
        "preferredTime": "morning",
        "preferredContactMethod": "mobile"
    }
    
    try:
        print(f"Sending POST request to {BASE_URL}/book-appointment")
        print(f"Payload: {json.dumps(payload, indent=2)}")
        
        response = requests.post(
            f"{BASE_URL}/book-appointment",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        print(f"\nResponse Status: {response.status_code}")
        print(f"Response Body: {response.text}")
        
        if response.status_code != 200:
            print_result(False, f"Expected status 200, got {response.status_code}")
            return False
        
        data = response.json()
        
        # Validate response structure
        if "success" not in data or data["success"] is not True:
            print_result(False, f"Expected success=true, got: {data.get('success')}")
            return False
        
        if "appointmentId" not in data:
            print_result(False, "Response missing 'appointmentId' field")
            return False
        
        appointment_id = data["appointmentId"]
        print(f"Appointment created: {appointment_id}")
        
        print_result(True, f"Appointment booked successfully - appointmentId: {appointment_id}")
        return True
        
    except requests.exceptions.RequestException as e:
        print_result(False, f"Request failed: {str(e)}")
        return False
    except json.JSONDecodeError as e:
        print_result(False, f"Invalid JSON response: {str(e)}")
        return False
    except Exception as e:
        print_result(False, f"Unexpected error: {str(e)}")
        return False

def test_admin_endpoints_unauthorized():
    """
    Test 4: GET /api/admin/leads and /api/admin/stats without auth
    Expected: Both return HTTP 401 Unauthorized
    """
    print_test_header(4, "Admin endpoints without authentication")
    
    all_passed = True
    
    # Test /api/admin/leads
    try:
        print(f"\nTesting GET {BASE_URL}/admin/leads (no auth)")
        response = requests.get(f"{BASE_URL}/admin/leads", timeout=30)
        print(f"Response Status: {response.status_code}")
        print(f"Response Body: {response.text}")
        
        if response.status_code != 401:
            print_result(False, f"/api/admin/leads: Expected 401, got {response.status_code}")
            all_passed = False
        else:
            print_result(True, "/api/admin/leads returns 401 Unauthorized")
    except Exception as e:
        print_result(False, f"/api/admin/leads request failed: {str(e)}")
        all_passed = False
    
    # Test /api/admin/stats
    try:
        print(f"\nTesting GET {BASE_URL}/admin/stats (no auth)")
        response = requests.get(f"{BASE_URL}/admin/stats", timeout=30)
        print(f"Response Status: {response.status_code}")
        print(f"Response Body: {response.text}")
        
        if response.status_code != 401:
            print_result(False, f"/api/admin/stats: Expected 401, got {response.status_code}")
            all_passed = False
        else:
            print_result(True, "/api/admin/stats returns 401 Unauthorized")
    except Exception as e:
        print_result(False, f"/api/admin/stats request failed: {str(e)}")
        all_passed = False
    
    return all_passed

def main():
    """Run all backend tests"""
    print("\n" + "="*80)
    print("FINANCIAL READINESS CHECK - BACKEND REGRESSION TEST")
    print("Testing after email CTA booking URL change to Google Calendar")
    print(f"Base URL: {BASE_URL}")
    print(f"Test Time: {datetime.now().isoformat()}")
    print("="*80)
    
    results = {
        "test1_submit": False,
        "test2_results": False,
        "test3_appointment": False,
        "test4_admin_auth": False
    }
    
    # Test 1: Submit assessment
    lead_id = test_submit_assessment()
    if lead_id:
        results["test1_submit"] = True
        
        # Test 2: Get results (only if test 1 passed)
        if test_get_results(lead_id):
            results["test2_results"] = True
        
        # Test 3: Book appointment (only if test 1 passed)
        if test_book_appointment(lead_id):
            results["test3_appointment"] = True
    
    # Test 4: Admin endpoints (independent)
    if test_admin_endpoints_unauthorized():
        results["test4_admin_auth"] = True
    
    # Summary
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    
    total_tests = len(results)
    passed_tests = sum(1 for v in results.values() if v)
    
    for test_name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    print(f"\nTotal: {passed_tests}/{total_tests} tests passed")
    
    if passed_tests == total_tests:
        print("\n🎉 ALL TESTS PASSED - Regression test successful!")
        print("✅ Email CTA booking URL change did NOT break the submit-assessment flow")
        print("✅ emailSent=false (graceful skip without RESEND_API_KEY)")
        print("✅ Lead and assessment persistence working")
        print("✅ Results retrieval working")
        print("✅ Appointment booking working")
        print("✅ Admin endpoints auth working")
        return 0
    else:
        print("\n❌ SOME TESTS FAILED - Review errors above")
        return 1

if __name__ == "__main__":
    sys.exit(main())
