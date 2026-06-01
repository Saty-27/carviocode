import pymongo
import uuid

def seed_faqs():
    client = pymongo.MongoClient("mongodb://localhost:27017/")
    db = client["carviodb"]
    
    # Delete old services FAQs
    db.faqs.delete_many({"page": "services"})
    
    faqs = [
        {
            "faq_id": f"faq_{uuid.uuid4().hex[:8]}",
            "page": "services",
            "question": "What services does Carvio Cabs provide?",
            "answer": "Carvio Cabs provides airport transfers, corporate cab service, outstation trips, local rentals, car rental with driver, wedding and event transport, Mumbai airport cab service, one-way cab service and round-trip cab booking across Mumbai.",
            "is_active": True
        },
        {
            "faq_id": f"faq_{uuid.uuid4().hex[:8]}",
            "page": "services",
            "question": "Do you provide cab service in Mumbai?",
            "answer": "Yes, Carvio Cabs provides cab service across Mumbai including Santacruz, Andheri, Vile Parle, Bandra, Mahim, Dadar, Matunga, Kurla, Goregaon, Churchgate, Mumbai Airport, Western Line, South Mumbai and Central Mumbai.",
            "is_active": True
        },
        {
            "faq_id": f"faq_{uuid.uuid4().hex[:8]}",
            "page": "services",
            "question": "Do you provide airport pickup and drop in Mumbai?",
            "answer": "Yes, Carvio Cabs provides Mumbai Airport pickup and drop service for domestic and international airport travel. Customers can pre-book cabs for early morning flights, late-night arrivals, business trips and family airport transfers.",
            "is_active": True
        },
        {
            "faq_id": f"faq_{uuid.uuid4().hex[:8]}",
            "page": "services",
            "question": "Can I book car rental with driver in Mumbai?",
            "answer": "Yes, Carvio Cabs provides chauffeur-driven car rental in Mumbai for local travel, business meetings, airport transfers, family trips, weddings, events and outstation journeys.",
            "is_active": True
        },
        {
            "faq_id": f"faq_{uuid.uuid4().hex[:8]}",
            "page": "services",
            "question": "Do you provide corporate cab service?",
            "answer": "Yes, Carvio Cabs provides corporate cab service in Mumbai for executive travel, employee movement, business meetings, client pickup/drop and airport transfers.",
            "is_active": True
        },
        {
            "faq_id": f"faq_{uuid.uuid4().hex[:8]}",
            "page": "services",
            "question": "Can I book an outstation cab from Mumbai?",
            "answer": "Yes, Carvio Cabs provides outstation cab service from Mumbai for one-way and round-trip travel based on customer requirements and route availability.",
            "is_active": True
        },
        {
            "faq_id": f"faq_{uuid.uuid4().hex[:8]}",
            "page": "services",
            "question": "Can I book a cab through WhatsApp?",
            "answer": "Yes, customers can book a cab through WhatsApp by sharing pickup location, drop location, date, time, trip type and preferred car type.",
            "is_active": True
        },
        {
            "faq_id": f"faq_{uuid.uuid4().hex[:8]}",
            "page": "services",
            "question": "Which areas do you serve in Mumbai?",
            "answer": "Carvio Cabs serves Santacruz, Andheri, Vile Parle, Bandra, Mahim, Dadar, Matunga, Kurla, Goregaon, Churchgate, Mumbai Airport, Western Line, South Mumbai, Central Mumbai and nearby areas.",
            "is_active": True
        }
    ]
    
    db.faqs.insert_many(faqs)
    print("Successfully seeded 8 services FAQs in MongoDB!")

if __name__ == "__main__":
    seed_faqs()
