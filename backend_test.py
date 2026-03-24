import requests
import sys
import json
from datetime import datetime

class CarvioAPITester:
    def __init__(self, base_url="https://ride-carvio.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.admin_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.session = requests.Session()

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None, use_admin=False):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if headers:
            test_headers.update(headers)
            
        if use_admin and self.admin_token:
            test_headers['Authorization'] = f'Bearer {self.admin_token}'
        elif self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = self.session.get(url, headers=test_headers)
            elif method == 'POST':
                response = self.session.post(url, json=data, headers=test_headers)
            elif method == 'PUT':
                response = self.session.put(url, json=data, headers=test_headers)
            elif method == 'DELETE':
                response = self.session.delete(url, headers=test_headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if isinstance(response_data, list):
                        print(f"   Response: List with {len(response_data)} items")
                    elif isinstance(response_data, dict):
                        print(f"   Response keys: {list(response_data.keys())}")
                except:
                    print(f"   Response: {response.text[:100]}...")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")

            return success, response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test basic health endpoints"""
        print("\n" + "="*50)
        print("TESTING HEALTH ENDPOINTS")
        print("="*50)
        
        self.run_test("API Root", "GET", "", 200)
        self.run_test("Health Check", "GET", "health", 200)

    def test_public_endpoints(self):
        """Test public endpoints that don't require authentication"""
        print("\n" + "="*50)
        print("TESTING PUBLIC ENDPOINTS")
        print("="*50)
        
        # Test fleet endpoint
        success, fleet_data = self.run_test("Get Fleet", "GET", "fleet", 200)
        if success and isinstance(fleet_data, list):
            print(f"   Fleet has {len(fleet_data)} vehicles")
            if fleet_data:
                print(f"   Sample car: {fleet_data[0].get('name', 'Unknown')}")
        
        # Test testimonials endpoint
        success, testimonials_data = self.run_test("Get Testimonials", "GET", "testimonials", 200)
        if success and isinstance(testimonials_data, list):
            print(f"   Found {len(testimonials_data)} testimonials")
        
        # Test seed endpoint (should already be seeded)
        self.run_test("Seed Data", "POST", "seed", 200)

    def test_user_auth(self):
        """Test user authentication"""
        print("\n" + "="*50)
        print("TESTING USER AUTHENTICATION")
        print("="*50)
        
        # Test user registration
        test_user_data = {
            "email": f"test_user_{datetime.now().strftime('%H%M%S')}@test.com",
            "password": "TestPass123!",
            "name": "Test User",
            "phone": "9876543210"
        }
        
        success, register_response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data=test_user_data
        )
        
        if success and 'token' in register_response:
            self.token = register_response['token']
            print(f"   User registered with ID: {register_response.get('user', {}).get('user_id')}")
        
        # Test user login with registered user
        login_data = {
            "email": test_user_data["email"],
            "password": test_user_data["password"]
        }
        
        success, login_response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        
        if success and 'token' in login_response:
            self.token = login_response['token']
            print(f"   User logged in: {login_response.get('user', {}).get('name')}")

    def test_admin_auth(self):
        """Test admin authentication"""
        print("\n" + "="*50)
        print("TESTING ADMIN AUTHENTICATION")
        print("="*50)
        
        # Test admin login
        admin_data = {
            "email": "admin@carviocabs.com",
            "password": "admin123"
        }
        
        success, admin_response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data=admin_data
        )
        
        if success and 'token' in admin_response:
            self.admin_token = admin_response['token']
            print(f"   Admin logged in: {admin_response.get('user', {}).get('name')}")
            print(f"   Admin role: {admin_response.get('user', {}).get('role')}")
            return True
        return False

    def test_admin_endpoints(self):
        """Test admin-only endpoints"""
        print("\n" + "="*50)
        print("TESTING ADMIN ENDPOINTS")
        print("="*50)
        
        if not self.admin_token:
            print("❌ No admin token available, skipping admin tests")
            return
        
        # Test admin stats
        success, stats_data = self.run_test(
            "Admin Stats",
            "GET",
            "admin/stats",
            200,
            use_admin=True
        )
        
        if success:
            print(f"   Today's bookings: {stats_data.get('today_bookings', 0)}")
            print(f"   Today's revenue: ₹{stats_data.get('today_revenue', 0)}")
            print(f"   Total bookings: {stats_data.get('total_bookings', 0)}")
        
        # Test admin bookings
        self.run_test("Admin Bookings", "GET", "admin/bookings", 200, use_admin=True)
        
        # Test admin drivers
        success, drivers_data = self.run_test("Admin Drivers", "GET", "admin/drivers", 200, use_admin=True)
        if success and isinstance(drivers_data, list):
            print(f"   Found {len(drivers_data)} drivers")

    def test_user_endpoints(self):
        """Test user-authenticated endpoints"""
        print("\n" + "="*50)
        print("TESTING USER ENDPOINTS")
        print("="*50)
        
        if not self.token:
            print("❌ No user token available, skipping user tests")
            return
        
        # Test get current user
        self.run_test("Get Current User", "GET", "auth/me", 200)
        
        # Test user bookings
        self.run_test("User Bookings", "GET", "bookings", 200)

    def test_fare_calculation(self):
        """Test fare calculation endpoint"""
        print("\n" + "="*50)
        print("TESTING FARE CALCULATION")
        print("="*50)
        
        # First get a car ID from fleet
        success, fleet_data = self.run_test("Get Fleet for Fare Test", "GET", "fleet", 200)
        
        if success and fleet_data:
            car_id = fleet_data[0]['car_id']
            
            fare_data = {
                "car_id": car_id,
                "trip_type": "one_way",
                "distance_km": 25.5,
                "pickup_time": "14:30"
            }
            
            success, fare_response = self.run_test(
                "Calculate Fare",
                "POST",
                "fare/calculate",
                200,
                data=fare_data
            )
            
            if success:
                print(f"   Base fare: ₹{fare_response.get('base_fare', 0)}")
                print(f"   Total fare: ₹{fare_response.get('total', 0)}")

    def test_fleet_details(self):
        """Test individual fleet car details"""
        print("\n" + "="*50)
        print("TESTING FLEET DETAILS")
        print("="*50)
        
        # Get fleet first
        success, fleet_data = self.run_test("Get Fleet", "GET", "fleet", 200)
        
        if success and fleet_data:
            car_id = fleet_data[0]['car_id']
            success, car_details = self.run_test(
                f"Get Car Details ({car_id})",
                "GET",
                f"fleet/{car_id}",
                200
            )
            
            if success:
                print(f"   Car name: {car_details.get('name')}")
                print(f"   Passengers: {car_details.get('passengers')}")
                print(f"   Price per km: ₹{car_details.get('price_per_km')}")

def main():
    print("🚗 Starting Carvio Cabs API Testing...")
    print(f"⏰ Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    tester = CarvioAPITester()
    
    # Run all tests
    tester.test_health_check()
    tester.test_public_endpoints()
    tester.test_user_auth()
    
    # Admin tests
    admin_login_success = tester.test_admin_auth()
    if admin_login_success:
        tester.test_admin_endpoints()
    
    tester.test_user_endpoints()
    tester.test_fare_calculation()
    tester.test_fleet_details()
    
    # Print final results
    print("\n" + "="*60)
    print("FINAL TEST RESULTS")
    print("="*60)
    print(f"📊 Tests passed: {tester.tests_passed}/{tester.tests_run}")
    print(f"✅ Success rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print("❌ Some tests failed!")
        return 1

if __name__ == "__main__":
    sys.exit(main())