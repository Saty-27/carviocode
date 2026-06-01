import pymongo
from datetime import datetime, timezone

def seed_services():
    client = pymongo.MongoClient("mongodb://localhost:27017/")
    db = client["carviodb"]
    
    # Clean up existing services
    db.services.delete_many({})
    
    services = [
        {
            "service_id": "svc_airport",
            "title": "Mumbai Airport Pickup & Drop Service",
            "icon": "Plane",
            "short_description": "Book reliable airport taxi service in Mumbai for domestic and international airport pickup and drop.",
            "description": "Carvio Cabs provides safe and on-time Mumbai Airport pickup and drop service for business travellers, families, tourists and corporate guests. Pre-book your cab for early morning flights, late-night arrivals, domestic airport transfers and international airport travel. We provide airport taxi service from Santacruz, Andheri, Vile Parle, Bandra, Dadar, Mahim, Kurla, Goregaon, Churchgate, Matunga and nearby Mumbai locations.",
            "image": "/uploads/airport-transfer-mumbai-cab.png",
            "features": [
                "Flight schedule tracking",
                "Meet & greet at terminal gate",
                "24/7 client booking desk",
                "Fixed flat-rate pricing"
            ],
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "service_id": "svc_corporate",
            "title": "Corporate Cab Service in Mumbai",
            "icon": "Building2",
            "short_description": "Professional cab service for companies, executives, employees, meetings and airport transfers.",
            "description": "Carvio Cabs offers corporate cab service in Mumbai for business meetings, executive travel, employee transport, client pickup/drop and monthly company travel requirements. Our chauffeur-driven cars are suitable for office travel, airport transfers, guest movement and business events. We focus on punctuality, professional drivers, clean vehicles, transparent billing and reliable support for corporate clients.",
            "image": "/uploads/corporate-cab-booking-mumbai.png",
            "features": [
                "Monthly consolidated billing",
                "Dedicated travel desk portal",
                "Priority booking dispatch",
                "Professional uniformed chauffeurs"
            ],
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "service_id": "svc_outstation",
            "title": "Outstation Cab Service From Mumbai",
            "icon": "Map",
            "short_description": "Book one-way and round-trip outstation cabs from Mumbai for business, family and weekend travel.",
            "description": "Carvio Cabs provides outstation cab service from Mumbai for one-way and round-trip journeys. Whether you are planning a family trip, business visit, weekend getaway or long-distance travel, we offer comfortable cars with experienced drivers. Customers can book outstation taxis from Mumbai to nearby destinations such as Pune, Lonavala, Nashik, Shirdi, Alibaug, Mahabaleshwar and other routes based on availability.",
            "image": "/uploads/outstation-taxi-from-mumbai.png",
            "features": [
                "One-way & round trip taxi",
                "Experienced highway drivers",
                "Driver allowance included",
                "All-India tourist permit vehicles"
            ],
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "service_id": "svc_local",
            "title": "Local Car Rental in Mumbai",
            "icon": "Clock4",
            "short_description": "Hourly cab rental with driver for city travel, meetings, shopping, family visits and local work.",
            "description": "Carvio Cabs provides local car rental service in Mumbai for customers who need a cab for a few hours or a full day. Our local rental service is useful for office meetings, shopping, hospital visits, family functions, sightseeing, personal work and city travel. Book a chauffeur-driven car in Mumbai with flexible hourly packages and professional drivers.",
            "image": "/uploads/local-rental-mumbai-chauffeur.png",
            "features": [
                "Flexible hourly packages (4h/40km, 8h/80km)",
                "Multiple stops within the city",
                "AC sedans and premium SUVs",
                "Experienced local route drivers"
            ],
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "service_id": "svc_car_driver",
            "title": "Car Rental With Driver in Mumbai",
            "icon": "ShieldCheck",
            "short_description": "Book chauffeur-driven cars in Mumbai with clean vehicles, trained drivers and easy booking.",
            "description": "Carvio Cabs offers car rental with driver in Mumbai for airport transfers, local travel, corporate meetings, family trips, events and outstation journeys. Customers can choose from available sedans, SUVs and premium vehicles depending on travel needs. Our chauffeur-driven car rental service is designed for comfort, safety and professional travel experience.",
            "image": "/uploads/car-rental-with-driver-mumbai-carvio-cabs.png",
            "features": [
                "Verified background-checked drivers",
                "Premium clean vehicles",
                "Real-time GPS tracking",
                "24/7 customer helpline support"
            ],
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "service_id": "svc_wedding",
            "title": "Wedding & Event Transportation in Mumbai",
            "icon": "PartyPopper",
            "short_description": "Cab and car rental service for weddings, guest pickup/drop, corporate events and private functions.",
            "description": "Carvio Cabs provides wedding and event transportation service in Mumbai for guest pickup/drop, family travel, corporate events, parties, conferences and special occasions. Our cab service helps manage smooth travel for guests across multiple pickup and drop locations. We offer clean cars, professional drivers and organized transport support for events.",
            "image": "/uploads/wedding-car-rental-mumbai.png",
            "features": [
                "Decorated luxury wedding cars",
                "Multi-point guest logistics",
                "Dedicated coordinators on-site",
                "Flexible hourly event packages"
            ],
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "service_id": "svc_airport_cab",
            "title": "Cab Service Near Mumbai Airport",
            "icon": "Plane",
            "short_description": "Reliable airport cab service from Santacruz, Andheri, Vile Parle, Bandra, Dadar and nearby areas.",
            "description": "Looking for a cab service near Mumbai Airport? Carvio Cabs provides quick airport taxi booking for domestic and international airport travel. Our service is suitable for business travellers, families, tourists and corporate guests who need timely airport pickup or drop. We cover Santacruz, Vile Parle, Andheri, Bandra, Mahim, Dadar, Kurla, Goregaon, Matunga, Churchgate and nearby Mumbai areas.",
            "image": "/uploads/mumbai-airport-cab-service-carvio-cabs.png",
            "features": [
                "Instant pickup near Mumbai Airport",
                "Flight delay auto-tracking",
                "Professional airport luggage assistance",
                "Clean AC vehicles ready on arrival"
            ],
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "service_id": "svc_one_way",
            "title": "One Way Cab Service From Mumbai",
            "icon": "Milestone",
            "short_description": "Book one-way taxi service from Mumbai for business trips, personal travel and outstation routes.",
            "description": "Carvio Cabs offers one-way cab service from Mumbai for customers who only need drop service to another city or destination. Our one-way taxi booking is useful for business travel, airport drop, family visits and outstation travel. Customers can book clean cars with professional drivers and transparent fare details.",
            "image": "/uploads/taxi-service-in-andheri-carvio-cabs.png",
            "features": [
                "Pay only for one-way distance",
                "All-inclusive dynamic pricing",
                "Safe door-to-door drops",
                "Experienced long-haul chauffeurs"
            ],
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "service_id": "svc_round_trip",
            "title": "Round Trip Cab Booking in Mumbai",
            "icon": "RefreshCw",
            "short_description": "Book round-trip cab service for outstation travel, business visits and family tours.",
            "description": "Carvio Cabs provides round-trip cab booking from Mumbai for customers who need travel to a destination and return with the same vehicle. This service is ideal for business visits, family tours, weekend trips and planned outstation journeys. Our drivers are experienced and our cars are comfortable for long-distance travel.",
            "image": "/uploads/outstation-taxi-from-mumbai.png",
            "features": [
                "Same chauffeur for entire trip",
                "Flexible stopover points",
                "Best long-distance roundtrip rates",
                "24/7 highway roadside assistance"
            ],
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "service_id": "svc_railway",
            "title": "Railway Station Pickup & Drop in Mumbai",
            "icon": "Train",
            "short_description": "Book cab service for railway station pickup and drop across Mumbai.",
            "description": "Carvio Cabs provides railway station pickup and drop service in Mumbai for local and outstation passengers. Customers can book cabs for pickup or drop from major Mumbai railway stations including Bandra, Dadar, Andheri, Kurla, Churchgate, Mumbai Central and nearby locations. Our service is useful for families, business travellers and passengers with luggage.",
            "image": "/uploads/mumbai-airport-pickup-drop-guide.png",
            "features": [
                "Major station pickups (Dadar, Bandra, Kurla, CSMT)",
                "Luggage handling assistance",
                "On-time train-match dispatch",
                "Affordable local transit rates"
            ],
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    db.services.insert_many(services)
    print("Successfully seeded 10 detailed services in MongoDB!")

if __name__ == "__main__":
    seed_services()
