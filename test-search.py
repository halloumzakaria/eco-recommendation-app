#!/usr/bin/env python3
"""
Simple test script to verify AI search functionality
"""

import requests
import json
import time

def test_api_endpoint(url, description):
    """Test an API endpoint and return the result"""
    print(f"\n🔍 Testing {description}")
    print(f"URL: {url}")
    
    try:
        response = requests.get(url, timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ SUCCESS: {len(data.get('results', []))} results found")
            if data.get('results'):
                print("Sample result:")
                print(json.dumps(data['results'][0], indent=2))
            return True
        else:
            print(f"❌ ERROR: {response.status_code} - {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ CONNECTION ERROR: Service not available")
        return False
    except requests.exceptions.Timeout:
        print("❌ TIMEOUT: Request took too long")
        return False
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False

def main():
    print("🧪 AI Product Search Test Script")
    print("=" * 40)
    
    # Test queries
    test_queries = [
        "hair",
        "kitchen", 
        "bamboo",
        "soap",
        "bottle"
    ]
    
    # Test NLP API directly
    print("\n📡 Testing NLP API directly...")
    nlp_success = 0
    for query in test_queries:
        url = f"http://localhost:5003/ai-search?q={query}"
        if test_api_endpoint(url, f"NLP API - '{query}'"):
            nlp_success += 1
    
    # Test Backend API
    print("\n📡 Testing Backend API...")
    backend_success = 0
    for query in test_queries:
        url = f"http://localhost:5000/api/products/search?q={query}"
        if test_api_endpoint(url, f"Backend API - '{query}'"):
            backend_success += 1
    
    # Summary
    print("\n📊 Test Summary")
    print("=" * 20)
    print(f"NLP API: {nlp_success}/{len(test_queries)} tests passed")
    print(f"Backend API: {backend_success}/{len(test_queries)} tests passed")
    
    if nlp_success == len(test_queries) and backend_success == len(test_queries):
        print("\n🎉 ALL TESTS PASSED! AI search is working correctly.")
    elif nlp_success == len(test_queries):
        print("\n⚠️  NLP API works, but Backend API has issues.")
    elif backend_success == len(test_queries):
        print("\n⚠️  Backend API works, but NLP API has issues.")
    else:
        print("\n❌ Multiple issues detected. Check container logs.")

if __name__ == "__main__":
    main()
