from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response
from fastapi.security import HTTPBearer
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
from jose import jwt, JWTError
import httpx
import razorpay

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Settings
JWT_SECRET = os.environ.get('JWT_SECRET', 'carvio-cabs-secret-key-2024')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 168

# Razorpay Settings
RAZORPAY_KEY_ID = os.environ.get('RAZORPAY_KEY_ID', '')
RAZORPAY_KEY_SECRET = os.environ.get('RAZORPAY_KEY_SECRET', '')

razorpay_client = None
if RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET:
    razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

app = FastAPI(title="Carvio Cabs API")
api_router = APIRouter(prefix="/api")
security = HTTPBearer(auto_error=False)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ============== MODELS ==============

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    user_id: str
    email: str
    name: str
    phone: Optional[str] = None
    picture: Optional[str] = None
    role: str = "user"
    created_at: datetime

class CarBase(BaseModel):
    name: str
    image: str
    images: List[str] = []
    passengers: int
    luggage: int
    description: str
    fuel_type: str = "Petrol"
    transmission: str = "Manual"
    ac: bool = True
    base_price: float
    price_per_km: float
    rental_4hr: float
    rental_8hr: float
    extra_hour: float
    extra_km: float
    outstation_per_km: float
    night_allowance: float = 300
    driver_allowance: float = 500
    is_featured: bool = False
    is_active: bool = True

class BookingCreate(BaseModel):
    trip_type: str
    car_id: str
    pickup_location: str
    drop_location: Optional[str] = None
    pickup_date: str
    pickup_time: str
    return_date: Optional[str] = None
    distance_km: float
    duration_hours: Optional[float] = None
    payment_type: str

class DriverBase(BaseModel):
    name: str
    phone: str
    email: str
    license_number: str
    vehicle_id: Optional[str] = None
    is_available: bool = True
    is_active: bool = True

class TestimonialBase(BaseModel):
    name: str
    role: str
    content: str
    rating: int
    image: Optional[str] = None
    location: Optional[str] = None

# New CMS Models
class HeroSlide(BaseModel):
    title: str
    subtitle: str
    image: str
    cta_text: str = "Book Now"
    cta_link: str = "/book"
    is_active: bool = True

class ServiceBase(BaseModel):
    title: str
    short_description: str
    description: str
    icon: str
    image: str
    features: List[str] = []
    related_cars: List[str] = []
    is_active: bool = True

class BlogBase(BaseModel):
    title: str
    slug: str
    category: str
    short_description: str
    content: str
    image: str
    tags: List[str] = []
    is_published: bool = True

class GalleryImage(BaseModel):
    title: str
    image: str
    category: str
    is_active: bool = True

class VideoBase(BaseModel):
    title: str
    description: str
    thumbnail: str
    video_url: str
    is_youtube: bool = True
    is_active: bool = True

class ContactMessage(BaseModel):
    name: str
    phone: str
    email: EmailStr
    message: str

class AboutContent(BaseModel):
    company_story: str
    mission: str
    vision: str
    why_choose_us: List[str] = []
    stats: dict = {}
    team_members: List[dict] = []

class SiteSettings(BaseModel):
    company_name: str = "Carvio Cabs"
    phone: str = "+91 99999 99999"
    email: str = "support@carviocabs.com"
    address: str = ""
    whatsapp: str = ""
    facebook: str = ""
    instagram: str = ""
    twitter: str = ""
    map_embed: str = ""

# ============== AUTH HELPERS ==============

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

def create_jwt_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request) -> Optional[User]:
    token = request.cookies.get("session_token")
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
    
    if not token:
        return None
    
    session = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if session:
        expires_at = session.get("expires_at")
        if isinstance(expires_at, str):
            expires_at = datetime.fromisoformat(expires_at)
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at < datetime.now(timezone.utc):
            return None
        
        user_doc = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
        if user_doc:
            if isinstance(user_doc.get("created_at"), str):
                user_doc["created_at"] = datetime.fromisoformat(user_doc["created_at"])
            return User(**user_doc)
        return None
    
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_doc = await db.users.find_one({"user_id": payload["user_id"]}, {"_id": 0})
        if user_doc:
            if isinstance(user_doc.get("created_at"), str):
                user_doc["created_at"] = datetime.fromisoformat(user_doc["created_at"])
            return User(**user_doc)
    except JWTError:
        pass
    
    return None

async def require_auth(request: Request) -> User:
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user

async def require_admin(request: Request) -> User:
    user = await require_auth(request)
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

# ============== AUTH ROUTES ==============

@api_router.post("/auth/register")
async def register(data: UserCreate):
    existing = await db.users.find_one({"email": data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    user_doc = {
        "user_id": user_id,
        "email": data.email,
        "name": data.name,
        "phone": data.phone,
        "password_hash": hash_password(data.password),
        "picture": None,
        "role": "user",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_doc)
    token = create_jwt_token(user_id, data.email, "user")
    return {"token": token, "user": {"user_id": user_id, "email": data.email, "name": data.name, "phone": data.phone, "role": "user"}}

@api_router.post("/auth/login")
async def login(data: UserLogin, response: Response):
    user_doc = await db.users.find_one({"email": data.email}, {"_id": 0})
    if not user_doc or not verify_password(data.password, user_doc.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_jwt_token(user_doc["user_id"], user_doc["email"], user_doc.get("role", "user"))
    response.set_cookie(key="session_token", value=token, httponly=True, secure=True, samesite="none", path="/", max_age=JWT_EXPIRATION_HOURS * 3600)
    return {"token": token, "user": {"user_id": user_doc["user_id"], "email": user_doc["email"], "name": user_doc["name"], "phone": user_doc.get("phone"), "role": user_doc.get("role", "user")}}

@api_router.post("/auth/session")
async def process_session(request: Request, response: Response):
    body = await request.json()
    session_id = body.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")
    
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get("https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data", headers={"X-Session-ID": session_id})
            if resp.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid session")
            auth_data = resp.json()
        except Exception as e:
            logger.error(f"Auth error: {e}")
            raise HTTPException(status_code=401, detail="Authentication failed")
    
    user_doc = await db.users.find_one({"email": auth_data["email"]}, {"_id": 0})
    if user_doc:
        user_id = user_doc["user_id"]
        await db.users.update_one({"user_id": user_id}, {"$set": {"name": auth_data["name"], "picture": auth_data.get("picture")}})
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        user_doc = {"user_id": user_id, "email": auth_data["email"], "name": auth_data["name"], "phone": None, "password_hash": None, "picture": auth_data.get("picture"), "role": "user", "created_at": datetime.now(timezone.utc).isoformat()}
        await db.users.insert_one(user_doc)
    
    session_token = auth_data.get("session_token", f"sess_{uuid.uuid4().hex}")
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    await db.user_sessions.delete_many({"user_id": user_id})
    await db.user_sessions.insert_one({"user_id": user_id, "session_token": session_token, "expires_at": expires_at.isoformat(), "created_at": datetime.now(timezone.utc).isoformat()})
    response.set_cookie(key="session_token", value=session_token, httponly=True, secure=True, samesite="none", path="/", max_age=7 * 24 * 3600)
    return {"user_id": user_id, "email": auth_data["email"], "name": auth_data["name"], "picture": auth_data.get("picture"), "role": user_doc.get("role", "user") if isinstance(user_doc, dict) else "user"}

@api_router.get("/auth/me")
async def get_me(request: Request):
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return {"user_id": user.user_id, "email": user.email, "name": user.name, "phone": user.phone, "picture": user.picture, "role": user.role}

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    token = request.cookies.get("session_token")
    if token:
        await db.user_sessions.delete_many({"session_token": token})
    response.delete_cookie(key="session_token", path="/")
    return {"message": "Logged out"}

# ============== FLEET ROUTES ==============

@api_router.get("/fleet")
async def get_fleet():
    cars = await db.cars.find({"is_active": True}, {"_id": 0}).to_list(100)
    return cars

@api_router.get("/fleet/featured")
async def get_featured_fleet():
    cars = await db.cars.find({"is_active": True, "is_featured": True}, {"_id": 0}).to_list(10)
    return cars

@api_router.get("/fleet/{car_id}")
async def get_car(car_id: str):
    car = await db.cars.find_one({"car_id": car_id}, {"_id": 0})
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")
    return car

@api_router.post("/admin/fleet")
async def create_car(car: CarBase, request: Request):
    await require_admin(request)
    car_id = f"car_{uuid.uuid4().hex[:8]}"
    car_doc = car.model_dump()
    car_doc["car_id"] = car_id
    car_doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.cars.insert_one(car_doc)
    return {"car_id": car_id, **car_doc}

@api_router.put("/admin/fleet/{car_id}")
async def update_car(car_id: str, car: CarBase, request: Request):
    await require_admin(request)
    result = await db.cars.update_one({"car_id": car_id}, {"$set": car.model_dump()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Car not found")
    return {"message": "Car updated"}

@api_router.delete("/admin/fleet/{car_id}")
async def delete_car(car_id: str, request: Request):
    await require_admin(request)
    await db.cars.update_one({"car_id": car_id}, {"$set": {"is_active": False}})
    return {"message": "Car deleted"}

# ============== FARE CALCULATION ==============

def calculate_fare(trip_type: str, car: dict, distance_km: float, duration_hours: float = None, pickup_time: str = None, return_date: str = None, pickup_date: str = None) -> dict:
    base_fare = extra_charges = night_charge = driver_allowance = 0
    
    if trip_type == "rental":
        if duration_hours and duration_hours <= 4:
            base_fare = car["rental_4hr"]
            if distance_km > 40:
                extra_charges = (distance_km - 40) * car["extra_km"]
        elif duration_hours and duration_hours <= 8:
            base_fare = car["rental_8hr"]
            if distance_km > 80:
                extra_charges = (distance_km - 80) * car["extra_km"]
        else:
            base_fare = car["rental_8hr"]
            extra_hours = max(0, (duration_hours or 8) - 8)
            extra_charges = extra_hours * car["extra_hour"]
    elif trip_type == "one_way":
        base_fare = car["base_price"] + (distance_km * car["price_per_km"])
    elif trip_type == "round_trip":
        base_fare = car["base_price"] + (distance_km * 2 * car["outstation_per_km"])
        if pickup_date and return_date:
            try:
                start = datetime.strptime(pickup_date, "%Y-%m-%d")
                end = datetime.strptime(return_date, "%Y-%m-%d")
                days = (end - start).days + 1
                min_km = days * 300
                if distance_km * 2 < min_km:
                    base_fare = car["base_price"] + (min_km * car["outstation_per_km"])
                driver_allowance = days * car["driver_allowance"]
            except:
                pass
    
    if pickup_time:
        try:
            hour = int(pickup_time.split(":")[0])
            if hour >= 22 or hour < 6:
                night_charge = car["night_allowance"]
        except:
            pass
    
    total = base_fare + extra_charges + night_charge + driver_allowance
    return {"base_fare": round(base_fare, 2), "extra_charges": round(extra_charges, 2), "night_charge": round(night_charge, 2), "driver_allowance": round(driver_allowance, 2), "total": round(total, 2)}

@api_router.post("/fare/calculate")
async def calculate_trip_fare(data: dict):
    car = await db.cars.find_one({"car_id": data.get("car_id")}, {"_id": 0})
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")
    return calculate_fare(trip_type=data.get("trip_type", "one_way"), car=car, distance_km=data.get("distance_km", 0), duration_hours=data.get("duration_hours"), pickup_time=data.get("pickup_time"), return_date=data.get("return_date"), pickup_date=data.get("pickup_date"))

# ============== BOOKING ROUTES ==============

@api_router.post("/bookings")
async def create_booking(data: BookingCreate, request: Request):
    user = await require_auth(request)
    car = await db.cars.find_one({"car_id": data.car_id}, {"_id": 0})
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")
    
    fare = calculate_fare(trip_type=data.trip_type, car=car, distance_km=data.distance_km, duration_hours=data.duration_hours, pickup_time=data.pickup_time, return_date=data.return_date, pickup_date=data.pickup_date)
    total_fare = fare["total"]
    
    if data.payment_type == "full":
        paid_amount, pending_amount, payment_status, booking_status = total_fare, 0, "pending", "pending"
    elif data.payment_type == "partial":
        paid_amount, pending_amount, payment_status, booking_status = total_fare * 0.5, total_fare * 0.5, "partial", "pending"
    else:
        paid_amount, pending_amount, payment_status, booking_status = 0, total_fare, "pending", "pending"
    
    booking_id = f"BK{datetime.now().strftime('%Y%m%d')}{uuid.uuid4().hex[:6].upper()}"
    booking_doc = {"booking_id": booking_id, "user_id": user.user_id, "trip_type": data.trip_type, "car_id": data.car_id, "car_name": car["name"], "pickup_location": data.pickup_location, "drop_location": data.drop_location, "pickup_date": data.pickup_date, "pickup_time": data.pickup_time, "return_date": data.return_date, "distance_km": data.distance_km, "duration_hours": data.duration_hours, "total_fare": total_fare, "paid_amount": 0, "pending_amount": total_fare, "payment_type": data.payment_type, "payment_status": payment_status, "booking_status": booking_status, "driver_id": None, "driver_name": None, "driver_phone": None, "razorpay_order_id": None, "created_at": datetime.now(timezone.utc).isoformat()}
    
    if data.payment_type != "corporate" and razorpay_client:
        amount_to_pay = paid_amount if data.payment_type == "full" else total_fare * 0.5
        try:
            razorpay_order = razorpay_client.order.create({"amount": int(amount_to_pay * 100), "currency": "INR", "receipt": booking_id, "payment_capture": 1})
            booking_doc["razorpay_order_id"] = razorpay_order["id"]
        except Exception as e:
            logger.error(f"Razorpay error: {e}")
    
    await db.bookings.insert_one(booking_doc)
    return {"booking_id": booking_id, "total_fare": total_fare, "amount_to_pay": paid_amount if data.payment_type == "full" else total_fare * 0.5, "razorpay_order_id": booking_doc.get("razorpay_order_id"), "razorpay_key_id": RAZORPAY_KEY_ID}

@api_router.post("/bookings/{booking_id}/verify-payment")
async def verify_payment(booking_id: str, data: dict, request: Request):
    user = await require_auth(request)
    booking = await db.bookings.find_one({"booking_id": booking_id, "user_id": user.user_id}, {"_id": 0})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if razorpay_client:
        try:
            razorpay_client.utility.verify_payment_signature({"razorpay_order_id": data.get("razorpay_order_id"), "razorpay_payment_id": data.get("razorpay_payment_id"), "razorpay_signature": data.get("razorpay_signature")})
        except Exception as e:
            raise HTTPException(status_code=400, detail="Payment verification failed")
    
    if booking["payment_type"] == "full":
        paid_amount, pending_amount, payment_status, booking_status = booking["total_fare"], 0, "paid", "confirmed"
    else:
        paid_amount, pending_amount, payment_status, booking_status = booking["total_fare"] * 0.5, booking["total_fare"] * 0.5, "partial", "confirmed"
    
    await db.bookings.update_one({"booking_id": booking_id}, {"$set": {"paid_amount": paid_amount, "pending_amount": pending_amount, "payment_status": payment_status, "booking_status": booking_status, "razorpay_payment_id": data.get("razorpay_payment_id")}})
    return {"message": "Payment verified", "booking_status": booking_status}

@api_router.get("/bookings")
async def get_user_bookings(request: Request):
    user = await require_auth(request)
    bookings = await db.bookings.find({"user_id": user.user_id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return bookings

@api_router.get("/bookings/{booking_id}")
async def get_booking(booking_id: str, request: Request):
    user = await require_auth(request)
    booking = await db.bookings.find_one({"booking_id": booking_id, "user_id": user.user_id}, {"_id": 0})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking

@api_router.post("/bookings/{booking_id}/cancel")
async def cancel_booking(booking_id: str, request: Request):
    user = await require_auth(request)
    booking = await db.bookings.find_one({"booking_id": booking_id, "user_id": user.user_id}, {"_id": 0})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking["booking_status"] in ["completed", "cancelled"]:
        raise HTTPException(status_code=400, detail="Cannot cancel this booking")
    await db.bookings.update_one({"booking_id": booking_id}, {"$set": {"booking_status": "cancelled"}})
    return {"message": "Booking cancelled"}

# ============== ADMIN BOOKING ROUTES ==============

@api_router.get("/admin/bookings")
async def get_all_bookings(request: Request, status: str = None):
    await require_admin(request)
    query = {"booking_status": status} if status else {}
    bookings = await db.bookings.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return bookings

@api_router.put("/admin/bookings/{booking_id}/assign-driver")
async def assign_driver(booking_id: str, data: dict, request: Request):
    await require_admin(request)
    driver = await db.drivers.find_one({"driver_id": data.get("driver_id")}, {"_id": 0})
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    await db.bookings.update_one({"booking_id": booking_id}, {"$set": {"driver_id": driver["driver_id"], "driver_name": driver["name"], "driver_phone": driver["phone"], "booking_status": "assigned"}})
    return {"message": "Driver assigned"}

@api_router.put("/admin/bookings/{booking_id}/status")
async def update_booking_status(booking_id: str, data: dict, request: Request):
    await require_admin(request)
    await db.bookings.update_one({"booking_id": booking_id}, {"$set": {"booking_status": data.get("status")}})
    return {"message": "Status updated"}

@api_router.put("/admin/bookings/{booking_id}/mark-paid")
async def mark_booking_paid(booking_id: str, request: Request):
    await require_admin(request)
    booking = await db.bookings.find_one({"booking_id": booking_id}, {"_id": 0})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    await db.bookings.update_one({"booking_id": booking_id}, {"$set": {"paid_amount": booking["total_fare"], "pending_amount": 0, "payment_status": "paid"}})
    return {"message": "Payment marked as complete"}

# ============== DRIVER ROUTES ==============

@api_router.get("/admin/drivers")
async def get_drivers(request: Request):
    await require_admin(request)
    drivers = await db.drivers.find({"is_active": True}, {"_id": 0}).to_list(100)
    return drivers

@api_router.post("/admin/drivers")
async def create_driver(driver: DriverBase, request: Request):
    await require_admin(request)
    driver_id = f"drv_{uuid.uuid4().hex[:8]}"
    driver_doc = driver.model_dump()
    driver_doc["driver_id"] = driver_id
    driver_doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.drivers.insert_one(driver_doc)
    return {"driver_id": driver_id, **driver_doc}

@api_router.put("/admin/drivers/{driver_id}")
async def update_driver(driver_id: str, driver: DriverBase, request: Request):
    await require_admin(request)
    result = await db.drivers.update_one({"driver_id": driver_id}, {"$set": driver.model_dump()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Driver not found")
    return {"message": "Driver updated"}

@api_router.delete("/admin/drivers/{driver_id}")
async def delete_driver(driver_id: str, request: Request):
    await require_admin(request)
    await db.drivers.update_one({"driver_id": driver_id}, {"$set": {"is_active": False}})
    return {"message": "Driver deleted"}

# ============== TESTIMONIALS ==============

@api_router.get("/testimonials")
async def get_testimonials():
    return await db.testimonials.find({"is_active": True}, {"_id": 0}).to_list(50)

@api_router.post("/admin/testimonials")
async def create_testimonial(testimonial: TestimonialBase, request: Request):
    await require_admin(request)
    testimonial_id = f"test_{uuid.uuid4().hex[:8]}"
    doc = testimonial.model_dump()
    doc["testimonial_id"] = testimonial_id
    doc["is_active"] = True
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.testimonials.insert_one(doc)
    return {"testimonial_id": testimonial_id, **doc}

@api_router.put("/admin/testimonials/{testimonial_id}")
async def update_testimonial(testimonial_id: str, testimonial: TestimonialBase, request: Request):
    await require_admin(request)
    await db.testimonials.update_one({"testimonial_id": testimonial_id}, {"$set": testimonial.model_dump()})
    return {"message": "Testimonial updated"}

@api_router.delete("/admin/testimonials/{testimonial_id}")
async def delete_testimonial(testimonial_id: str, request: Request):
    await require_admin(request)
    await db.testimonials.update_one({"testimonial_id": testimonial_id}, {"$set": {"is_active": False}})
    return {"message": "Testimonial deleted"}

# ============== HERO SLIDES ==============

@api_router.get("/hero-slides")
async def get_hero_slides():
    return await db.hero_slides.find({"is_active": True}, {"_id": 0}).to_list(10)

@api_router.post("/admin/hero-slides")
async def create_hero_slide(slide: HeroSlide, request: Request):
    await require_admin(request)
    slide_id = f"slide_{uuid.uuid4().hex[:8]}"
    doc = slide.model_dump()
    doc["slide_id"] = slide_id
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.hero_slides.insert_one(doc)
    return {"slide_id": slide_id, **doc}

@api_router.put("/admin/hero-slides/{slide_id}")
async def update_hero_slide(slide_id: str, slide: HeroSlide, request: Request):
    await require_admin(request)
    await db.hero_slides.update_one({"slide_id": slide_id}, {"$set": slide.model_dump()})
    return {"message": "Slide updated"}

@api_router.delete("/admin/hero-slides/{slide_id}")
async def delete_hero_slide(slide_id: str, request: Request):
    await require_admin(request)
    await db.hero_slides.delete_one({"slide_id": slide_id})
    return {"message": "Slide deleted"}

# ============== SERVICES ==============

@api_router.get("/services")
async def get_services():
    return await db.services.find({"is_active": True}, {"_id": 0}).to_list(50)

@api_router.get("/services/{service_id}")
async def get_service(service_id: str):
    service = await db.services.find_one({"service_id": service_id}, {"_id": 0})
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    return service

@api_router.post("/admin/services")
async def create_service(service: ServiceBase, request: Request):
    await require_admin(request)
    service_id = f"svc_{uuid.uuid4().hex[:8]}"
    doc = service.model_dump()
    doc["service_id"] = service_id
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.services.insert_one(doc)
    return {"service_id": service_id, **doc}

@api_router.put("/admin/services/{service_id}")
async def update_service(service_id: str, service: ServiceBase, request: Request):
    await require_admin(request)
    await db.services.update_one({"service_id": service_id}, {"$set": service.model_dump()})
    return {"message": "Service updated"}

@api_router.delete("/admin/services/{service_id}")
async def delete_service(service_id: str, request: Request):
    await require_admin(request)
    await db.services.update_one({"service_id": service_id}, {"$set": {"is_active": False}})
    return {"message": "Service deleted"}

# ============== BLOGS ==============

@api_router.get("/blogs")
async def get_blogs(category: str = None, limit: int = 20):
    query = {"is_published": True}
    if category:
        query["category"] = category
    return await db.blogs.find(query, {"_id": 0}).sort("created_at", -1).to_list(limit)

@api_router.get("/blogs/{slug}")
async def get_blog(slug: str):
    blog = await db.blogs.find_one({"slug": slug, "is_published": True}, {"_id": 0})
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    return blog

@api_router.post("/admin/blogs")
async def create_blog(blog: BlogBase, request: Request):
    await require_admin(request)
    blog_id = f"blog_{uuid.uuid4().hex[:8]}"
    doc = blog.model_dump()
    doc["blog_id"] = blog_id
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.blogs.insert_one(doc)
    return {"blog_id": blog_id, **doc}

@api_router.put("/admin/blogs/{blog_id}")
async def update_blog(blog_id: str, blog: BlogBase, request: Request):
    await require_admin(request)
    await db.blogs.update_one({"blog_id": blog_id}, {"$set": blog.model_dump()})
    return {"message": "Blog updated"}

@api_router.delete("/admin/blogs/{blog_id}")
async def delete_blog(blog_id: str, request: Request):
    await require_admin(request)
    await db.blogs.delete_one({"blog_id": blog_id})
    return {"message": "Blog deleted"}

# ============== GALLERY ==============

@api_router.get("/gallery")
async def get_gallery(category: str = None):
    query = {"is_active": True}
    if category:
        query["category"] = category
    return await db.gallery.find(query, {"_id": 0}).to_list(100)

@api_router.post("/admin/gallery")
async def create_gallery_image(image: GalleryImage, request: Request):
    await require_admin(request)
    image_id = f"img_{uuid.uuid4().hex[:8]}"
    doc = image.model_dump()
    doc["image_id"] = image_id
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.gallery.insert_one(doc)
    return {"image_id": image_id, **doc}

@api_router.delete("/admin/gallery/{image_id}")
async def delete_gallery_image(image_id: str, request: Request):
    await require_admin(request)
    await db.gallery.delete_one({"image_id": image_id})
    return {"message": "Image deleted"}

# ============== VIDEOS ==============

@api_router.get("/videos")
async def get_videos():
    return await db.videos.find({"is_active": True}, {"_id": 0}).to_list(50)

@api_router.post("/admin/videos")
async def create_video(video: VideoBase, request: Request):
    await require_admin(request)
    video_id = f"vid_{uuid.uuid4().hex[:8]}"
    doc = video.model_dump()
    doc["video_id"] = video_id
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.videos.insert_one(doc)
    return {"video_id": video_id, **doc}

@api_router.put("/admin/videos/{video_id}")
async def update_video(video_id: str, video: VideoBase, request: Request):
    await require_admin(request)
    await db.videos.update_one({"video_id": video_id}, {"$set": video.model_dump()})
    return {"message": "Video updated"}

@api_router.delete("/admin/videos/{video_id}")
async def delete_video(video_id: str, request: Request):
    await require_admin(request)
    await db.videos.delete_one({"video_id": video_id})
    return {"message": "Video deleted"}

# ============== CONTACT MESSAGES ==============

@api_router.post("/contact")
async def submit_contact(message: ContactMessage):
    message_id = f"msg_{uuid.uuid4().hex[:8]}"
    doc = message.model_dump()
    doc["message_id"] = message_id
    doc["is_read"] = False
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.contact_messages.insert_one(doc)
    return {"message": "Message sent successfully", "message_id": message_id}

@api_router.get("/admin/messages")
async def get_messages(request: Request):
    await require_admin(request)
    return await db.contact_messages.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)

@api_router.put("/admin/messages/{message_id}/read")
async def mark_message_read(message_id: str, request: Request):
    await require_admin(request)
    await db.contact_messages.update_one({"message_id": message_id}, {"$set": {"is_read": True}})
    return {"message": "Marked as read"}

@api_router.delete("/admin/messages/{message_id}")
async def delete_message(message_id: str, request: Request):
    await require_admin(request)
    await db.contact_messages.delete_one({"message_id": message_id})
    return {"message": "Message deleted"}

# ============== ABOUT CONTENT ==============

@api_router.get("/about")
async def get_about():
    about = await db.site_content.find_one({"type": "about"}, {"_id": 0})
    return about or {}

@api_router.put("/admin/about")
async def update_about(content: AboutContent, request: Request):
    await require_admin(request)
    doc = content.model_dump()
    doc["type"] = "about"
    doc["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.site_content.update_one({"type": "about"}, {"$set": doc}, upsert=True)
    return {"message": "About content updated"}

# ============== SITE SETTINGS ==============

@api_router.get("/settings")
async def get_settings():
    settings = await db.site_content.find_one({"type": "settings"}, {"_id": 0})
    return settings or SiteSettings().model_dump()

@api_router.put("/admin/settings")
async def update_settings(settings: SiteSettings, request: Request):
    await require_admin(request)
    doc = settings.model_dump()
    doc["type"] = "settings"
    doc["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.site_content.update_one({"type": "settings"}, {"$set": doc}, upsert=True)
    return {"message": "Settings updated"}

# ============== DASHBOARD STATS ==============

@api_router.get("/admin/stats")
async def get_admin_stats(request: Request):
    await require_admin(request)
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    today_bookings = await db.bookings.count_documents({"pickup_date": today})
    revenue_result = await db.bookings.aggregate([{"$match": {"pickup_date": today, "payment_status": {"$in": ["paid", "partial"]}}}, {"$group": {"_id": None, "total": {"$sum": "$paid_amount"}}}]).to_list(1)
    today_revenue = revenue_result[0]["total"] if revenue_result else 0
    pending_payments = await db.bookings.count_documents({"payment_status": {"$in": ["pending", "partial"]}})
    active_trips = await db.bookings.count_documents({"booking_status": {"$in": ["assigned", "in_progress"]}})
    available_drivers = await db.drivers.count_documents({"is_available": True, "is_active": True})
    total_bookings = await db.bookings.count_documents({})
    total_cars = await db.cars.count_documents({"is_active": True})
    total_messages = await db.contact_messages.count_documents({"is_read": False})
    total_blogs = await db.blogs.count_documents({"is_published": True})
    
    return {"today_bookings": today_bookings, "today_revenue": today_revenue, "pending_payments": pending_payments, "active_trips": active_trips, "available_drivers": available_drivers, "total_bookings": total_bookings, "total_cars": total_cars, "total_messages": total_messages, "total_blogs": total_blogs}

# ============== SEED DATA ==============

@api_router.post("/seed")
async def seed_data():
    existing_cars = await db.cars.count_documents({})
    if existing_cars > 0:
        return {"message": "Data already seeded"}
    
    # Seed cars with real images
    cars = [
        {"car_id": "car_innova", "name": "Toyota Innova Crysta", "image": "https://customer-assets.emergentagent.com/job_ride-carvio/artifacts/6j2wugsb_innova-crysta-exterior-right-front-three-quarter-3.avif", "images": [], "passengers": 7, "luggage": 3, "description": "Premium MPV with spacious interiors, perfect for family trips and airport transfers.", "fuel_type": "Diesel", "transmission": "Manual", "ac": True, "base_price": 500, "price_per_km": 18, "rental_4hr": 2000, "rental_8hr": 3500, "extra_hour": 350, "extra_km": 18, "outstation_per_km": 15, "night_allowance": 300, "driver_allowance": 500, "is_featured": True, "is_active": True, "created_at": datetime.now(timezone.utc).isoformat()},
        {"car_id": "car_carens", "name": "Kia Carens", "image": "https://customer-assets.emergentagent.com/job_ride-carvio/artifacts/ybhm08im_carens-exterior-right-front-three-quarter-5.avif", "images": [], "passengers": 6, "luggage": 2, "description": "Modern MPV with sleek design and advanced features.", "fuel_type": "Petrol", "transmission": "Automatic", "ac": True, "base_price": 400, "price_per_km": 15, "rental_4hr": 1800, "rental_8hr": 3000, "extra_hour": 300, "extra_km": 15, "outstation_per_km": 13, "night_allowance": 300, "driver_allowance": 500, "is_featured": True, "is_active": True, "created_at": datetime.now(timezone.utc).isoformat()},
        {"car_id": "car_ertiga", "name": "Maruti Ertiga", "image": "https://customer-assets.emergentagent.com/job_ride-carvio/artifacts/7wyvekvp_front-left-side-47.avif", "images": [], "passengers": 6, "luggage": 2, "description": "Reliable and fuel-efficient MPV for everyday travel.", "fuel_type": "Petrol", "transmission": "Manual", "ac": True, "base_price": 350, "price_per_km": 14, "rental_4hr": 1500, "rental_8hr": 2500, "extra_hour": 250, "extra_km": 14, "outstation_per_km": 12, "night_allowance": 250, "driver_allowance": 400, "is_featured": True, "is_active": True, "created_at": datetime.now(timezone.utc).isoformat()},
        {"car_id": "car_dzire", "name": "Maruti Dzire", "image": "https://customer-assets.emergentagent.com/job_ride-carvio/artifacts/w196ss1j_Car_color_image_new.webp", "images": [], "passengers": 4, "luggage": 2, "description": "Compact sedan with excellent fuel efficiency.", "fuel_type": "Petrol", "transmission": "Manual", "ac": True, "base_price": 300, "price_per_km": 12, "rental_4hr": 1200, "rental_8hr": 2000, "extra_hour": 200, "extra_km": 12, "outstation_per_km": 10, "night_allowance": 200, "driver_allowance": 350, "is_featured": True, "is_active": True, "created_at": datetime.now(timezone.utc).isoformat()}
    ]
    await db.cars.insert_many(cars)
    
    # Seed services
    services = [
        {"service_id": "svc_airport", "title": "Airport Transfer", "short_description": "Reliable airport pickup and drop services", "description": "Experience hassle-free airport transfers with our punctual and professional chauffeurs. We monitor flight schedules and ensure you reach on time.", "icon": "Plane", "image": "https://images.unsplash.com/photo-1632861098327-108639f71ce6?w=800", "features": ["Flight tracking", "Meet & greet", "24/7 availability", "Fixed pricing"], "related_cars": ["car_innova", "car_dzire"], "is_active": True, "created_at": datetime.now(timezone.utc).isoformat()},
        {"service_id": "svc_local", "title": "Local Rental", "short_description": "Hourly packages for city travel", "description": "Choose from our flexible hourly rental packages for shopping, meetings, or city exploration. 4-hour and 8-hour packages available.", "icon": "Clock", "image": "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800", "features": ["Flexible hours", "Multiple stops", "AC vehicles", "Professional drivers"], "related_cars": ["car_ertiga", "car_dzire"], "is_active": True, "created_at": datetime.now(timezone.utc).isoformat()},
        {"service_id": "svc_outstation", "title": "Outstation Trip", "short_description": "Comfortable long-distance journeys", "description": "Plan your outstation trips with us. One-way or round trip options available with experienced drivers who know the routes well.", "icon": "Map", "image": "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800", "features": ["One-way & round trip", "300km/day minimum", "Driver allowance included", "Night halt available"], "related_cars": ["car_innova", "car_carens"], "is_active": True, "created_at": datetime.now(timezone.utc).isoformat()},
        {"service_id": "svc_corporate", "title": "Corporate Travel", "short_description": "Dedicated solutions for businesses", "description": "Streamline your corporate travel with monthly billing, dedicated account manager, and priority booking for your employees.", "icon": "Building2", "image": "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800", "features": ["Monthly billing", "Dedicated account", "Priority booking", "Travel reports"], "related_cars": ["car_innova", "car_carens"], "is_active": True, "created_at": datetime.now(timezone.utc).isoformat()},
        {"service_id": "svc_wedding", "title": "Wedding & Events", "short_description": "Special occasions deserve special rides", "description": "Make your special day memorable with our decorated wedding cars and professional chauffeurs. Multiple car options available.", "icon": "PartyPopper", "image": "https://images.unsplash.com/photo-1519741497674-611481863552?w=800", "features": ["Decorated cars", "Multiple vehicles", "Flexible packages", "Red carpet service"], "related_cars": ["car_innova"], "is_active": True, "created_at": datetime.now(timezone.utc).isoformat()},
    ]
    await db.services.insert_many(services)
    
    # Seed testimonials
    testimonials = [
        {"testimonial_id": "test_001", "name": "Rajesh Kumar", "role": "Business Executive", "content": "Excellent service! The driver was punctual and professional. Highly recommended for corporate travel.", "rating": 5, "image": None, "location": "Mumbai", "is_active": True, "created_at": datetime.now(timezone.utc).isoformat()},
        {"testimonial_id": "test_002", "name": "Priya Sharma", "role": "Frequent Traveler", "content": "Best cab service for airport transfers. Always on time and clean vehicles.", "rating": 5, "image": None, "location": "Delhi", "is_active": True, "created_at": datetime.now(timezone.utc).isoformat()},
        {"testimonial_id": "test_003", "name": "Amit Patel", "role": "Corporate Client", "content": "We've been using Carvio Cabs for company travel. Their billing system is convenient.", "rating": 5, "image": None, "location": "Bangalore", "is_active": True, "created_at": datetime.now(timezone.utc).isoformat()},
    ]
    await db.testimonials.insert_many(testimonials)
    
    # Seed blogs
    blogs = [
        {"blog_id": "blog_001", "title": "Top 5 Tips for Comfortable Long Distance Travel", "slug": "tips-comfortable-long-distance-travel", "category": "Travel Tips", "short_description": "Make your outstation trips more enjoyable with these expert tips.", "content": "Long distance travel can be tiring, but with proper planning, you can make it comfortable...", "image": "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800", "tags": ["travel", "tips", "outstation"], "is_published": True, "created_at": datetime.now(timezone.utc).isoformat()},
        {"blog_id": "blog_002", "title": "Why Choose Professional Cab Services Over Self-Drive", "slug": "professional-cab-vs-self-drive", "category": "Industry", "short_description": "Discover the benefits of hiring professional chauffeur services.", "content": "While self-drive options are popular, professional cab services offer unique advantages...", "image": "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800", "tags": ["cab service", "chauffeur", "benefits"], "is_published": True, "created_at": datetime.now(timezone.utc).isoformat()},
        {"blog_id": "blog_003", "title": "Planning Your Perfect Weekend Getaway", "slug": "perfect-weekend-getaway", "category": "Travel Tips", "short_description": "Ideas and tips for planning a stress-free weekend trip.", "content": "Weekend getaways are the perfect way to recharge. Here's how to plan one...", "image": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800", "tags": ["weekend", "getaway", "planning"], "is_published": True, "created_at": datetime.now(timezone.utc).isoformat()},
    ]
    await db.blogs.insert_many(blogs)
    
    # Seed about content
    about_content = {"type": "about", "company_story": "Founded in 2020, Carvio Cabs has grown to become one of the most trusted cab services in the region. Our commitment to punctuality, safety, and customer satisfaction sets us apart.", "mission": "To provide safe, reliable, and comfortable transportation solutions while maintaining the highest standards of professionalism.", "vision": "To become the preferred choice for premium transportation services across India.", "why_choose_us": ["On-time guarantee", "Professional drivers", "Clean vehicles", "Transparent pricing", "24/7 support"], "stats": {"years": 5, "trips": 50000, "customers": 25000, "cities": 50}, "team_members": [{"name": "Rahul Verma", "role": "Founder & CEO", "image": None}, {"name": "Sneha Gupta", "role": "Operations Head", "image": None}], "updated_at": datetime.now(timezone.utc).isoformat()}
    await db.site_content.insert_one(about_content)
    
    # Seed settings
    settings = {"type": "settings", "company_name": "Carvio Cabs", "phone": "+91 99999 99999", "email": "support@carviocabs.com", "address": "123 Business Park, Mumbai, India", "whatsapp": "+919999999999", "facebook": "", "instagram": "", "twitter": "", "map_embed": "", "updated_at": datetime.now(timezone.utc).isoformat()}
    await db.site_content.insert_one(settings)
    
    # Admin user
    admin_exists = await db.users.find_one({"email": "admin@carviocabs.com"})
    if not admin_exists:
        await db.users.insert_one({"user_id": f"user_{uuid.uuid4().hex[:12]}", "email": "admin@carviocabs.com", "name": "Admin", "phone": "9999999999", "password_hash": hash_password("admin123"), "picture": None, "role": "admin", "created_at": datetime.now(timezone.utc).isoformat()})
    
    # Seed drivers
    drivers = [
        {"driver_id": "drv_001", "name": "Ravi Kumar", "phone": "9876543210", "email": "ravi@carviocabs.com", "license_number": "DL-1234567890", "vehicle_id": "car_innova", "is_available": True, "is_active": True, "created_at": datetime.now(timezone.utc).isoformat()},
        {"driver_id": "drv_002", "name": "Suresh Verma", "phone": "9876543211", "email": "suresh@carviocabs.com", "license_number": "DL-0987654321", "vehicle_id": "car_dzire", "is_available": True, "is_active": True, "created_at": datetime.now(timezone.utc).isoformat()}
    ]
    await db.drivers.insert_many(drivers)
    
    return {"message": "Data seeded successfully"}

# ============== HEALTH CHECK ==============

@api_router.get("/")
async def root():
    return {"message": "Carvio Cabs API", "status": "running"}

@api_router.get("/health")
async def health():
    return {"status": "healthy"}

app.include_router(api_router)

app.add_middleware(CORSMiddleware, allow_credentials=True, allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','), allow_methods=["*"], allow_headers=["*"])

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
