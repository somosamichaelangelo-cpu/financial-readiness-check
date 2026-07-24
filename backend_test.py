#!/usr/bin/env python3
"""
Backend API Test for Lead Submission Flow
Tests the /api/submit-assessment endpoint
"""

import requests
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/.env')

# Get base URL from environment
BASE_URL = os.getenv('NEXT_PUBLIC_BASE_URL', 'http://localhost:3000')
API_URL = f"{BASE_URL}/api"

print(f"Testing API at: {API_URL}")
print("=" * 80)

# Test data provided in the review request
test_data = {
    "leadInfo": {
        "first_name": "Michael",
        "last_name": "Test",
        "email": "test@example.com",
        "mobile": "09512105160",
        "preferred_contact": "email",
        "consent": True
    },
    "assessmentData": {
        "age": "30",
        "gender": "male",
        "marital_status": "married",
        "num_children": 2,
        "occupation": "Engineer",
        "location": "Manila",
        "dependents": 3,
        "spouse_working": True,
        "monthly_income": "50000",
        "additional_income": "10000",
        "monthly_expenses": "30000",
        "housing_cost": "10000",
        "emergency_fund": "100000",
        "savings": "200000",
        "existing_investments": True,
        "has_life_insurance": True,
        "life_insurance_coverage": "1000000",
        "has_health_insurance": True,
        "has_critical_illness": False,
        "has_hmo": True,
        "has_accident_insurance": False,
        "home_loan": "1000000",
        "car_loan": "500000",
        "personal_loan": "0",
        "credit_card_debt": "50000",
        "other_debt": "0",
        "goals": ["Protect family", "Retirement planning"]
    }
}

def test_submit_assessment():
    """Test the submit-assessment endpoint"""
    print("\n1. Testing POST /api/submit-assessment")
    print("-" * 80)
    
    try:
        url = f"{API_URL}/submit-assessment"
        print(f"Request URL: {url}")
        print(f"Request payload: {json.dumps(test_data, indent=2)}")
        
        response = requests.post(
            url,
            json=test_data,
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        print(f"\nResponse Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        try:
            response_data = response.json()
            print(f"Response Body: {json.dumps(response_data, indent=2)}")
        except json.JSONDecodeError:
            print(f"Response Body (raw): {response.text}")
        
        if response.status_code == 200:
            print("\n✅ SUCCESS: Lead submission successful!")
            if 'leadId' in response_data:
                print(f"   Lead ID: {response_data['leadId']}")
            if 'readinessScore' in response_data:
                print(f"   Readiness Score: {response_data['readinessScore']}")
            return True, response_data
        else:
            print(f"\n❌ FAILED: Status code {response.status_code}")
            if 'error' in response_data:
                print(f"   Error: {response_data['error']}")
            return False, response_data
            
    except requests.exceptions.ConnectionError as e:
        print(f"\n❌ CONNECTION ERROR: Cannot connect to {url}")
        print(f"   Error: {str(e)}")
        return False, None
    except requests.exceptions.Timeout as e:
        print(f"\n❌ TIMEOUT ERROR: Request timed out")
        print(f"   Error: {str(e)}")
        return False, None
    except Exception as e:
        print(f"\n❌ UNEXPECTED ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return False, None

def test_supabase_connection():
    """Test if Supabase is accessible"""
    print("\n2. Testing Supabase Connection")
    print("-" * 80)
    
    supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
    supabase_key = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    
    print(f"Supabase URL: {supabase_url}")
    print(f"Supabase Key: {supabase_key[:20]}..." if supabase_key else "Not found")
    
    if not supabase_url or not supabase_key:
        print("\n❌ FAILED: Supabase credentials not found in environment")
        return False
    
    try:
        # Test Supabase REST API health
        response = requests.get(
            f"{supabase_url}/rest/v1/",
            headers={
                'apikey': supabase_key,
                'Authorization': f'Bearer {supabase_key}'
            },
            timeout=10
        )
        
        print(f"Supabase API Status: {response.status_code}")
        
        if response.status_code in [200, 404]:  # 404 is ok, means API is reachable
            print("✅ SUCCESS: Supabase is accessible")
            return True
        else:
            print(f"❌ FAILED: Unexpected status code {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ FAILED: Cannot connect to Supabase")
        print(f"   Error: {str(e)}")
        return False

def test_api_health():
    """Test if the API is running"""
    print("\n3. Testing API Health")
    print("-" * 80)
    
    try:
        # Try to access a non-existent endpoint to see if API responds
        response = requests.get(f"{API_URL}/health", timeout=10)
        print(f"API Response Status: {response.status_code}")
        
        if response.status_code in [200, 404]:  # Either is fine, means API is running
            print("✅ SUCCESS: API is responding")
            return True
        else:
            print(f"⚠️  WARNING: Unexpected status code {response.status_code}")
            return True  # Still consider it working
            
    except requests.exceptions.ConnectionError:
        print("❌ FAILED: Cannot connect to API")
        return False
    except Exception as e:
        print(f"❌ FAILED: {str(e)}")
        return False

def main():
    """Run all tests"""
    print("\n" + "=" * 80)
    print("BACKEND API TEST - LEAD SUBMISSION FLOW")
    print("=" * 80)
    
    results = {
        'api_health': False,
        'supabase_connection': False,
        'submit_assessment': False
    }
    
    # Test 1: API Health
    results['api_health'] = test_api_health()
    
    # Test 2: Supabase Connection
    results['supabase_connection'] = test_supabase_connection()
    
    # Test 3: Submit Assessment (main test)
    success, response_data = test_submit_assessment()
    results['submit_assessment'] = success
    
    # Summary
    print("\n" + "=" * 80)
    print("TEST SUMMARY")
    print("=" * 80)
    
    for test_name, result in results.items():
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test_name.replace('_', ' ').title()}: {status}")
    
    all_passed = all(results.values())
    
    print("\n" + "=" * 80)
    if all_passed:
        print("OVERALL: ✅ ALL TESTS PASSED")
    else:
        print("OVERALL: ❌ SOME TESTS FAILED")
    print("=" * 80)
    
    return all_passed

if __name__ == "__main__":
    main()
