import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { API, useAuth } from "@/App";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { 
  Car, Clock, Shield, Phone, CreditCard, Star, MapPin, 
  Calendar as CalendarIcon, Users, Briefcase, ChevronRight,
  Menu, X, Plane, Building2, Clock4, Map, PartyPopper, Bus
} from "lucide-react";

const LOGO_URL = "https://customer-assets.emergentagent.com/job_1a245343-e48a-4d95-b813-d4323c66be82/artifacts/ceogvz6u_WhatsApp%20Image%202026-02-01%20at%2014.34.50.jpeg";
const HERO_BG = "https://images.unsplash.com/photo-1564181064972-432b6f96c0ef?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MTN8MHwxfHNlYXJjaHwyfHxsdXh1cnklMjBibGFjayUyMG1lcmNlZGVzJTIwcyUyMGNsYXNzJTIwY2hhdWZmZXVyJTIwY2l0eSUyMG5pZ2h0fGVufDB8fHx8MTc3MTkyOTQzNHww&ixlib=rb-4.1.0&q=85";

// Navbar Component
export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-zinc-800/50">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-3">
            <img src={LOGO_URL} alt="Carvio Cabs" className="h-12 w-12 rounded-full" />
            <span className="text-xl font-bold text-white hidden sm:block">Carvio Cabs</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/fleet" className="text-zinc-400 hover:text-white transition-colors">Fleet</Link>
            <Link to="/book" className="text-zinc-400 hover:text-white transition-colors">Book Now</Link>
            {user ? (
              <>
                <Link to="/dashboard" className="text-zinc-400 hover:text-white transition-colors">My Trips</Link>
                {user.role === "admin" && (
                  <Link to="/admin" className="text-zinc-400 hover:text-white transition-colors">Admin</Link>
                )}
                <Button 
                  variant="ghost" 
                  onClick={logout}
                  className="text-zinc-400 hover:text-white"
                  data-testid="logout-btn"
                >
                  Logout
                </Button>
              </>
            ) : (
              <Link to="/login">
                <Button className="bg-[#FFD700] text-black hover:bg-[#E5C100] font-medium" data-testid="login-btn">
                  Login
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white p-2"
            onClick={() => setIsOpen(!isOpen)}
            data-testid="mobile-menu-btn"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden py-4 border-t border-zinc-800"
          >
            <div className="flex flex-col gap-4">
              <Link to="/fleet" className="text-zinc-400 hover:text-white py-2" onClick={() => setIsOpen(false)}>Fleet</Link>
              <Link to="/book" className="text-zinc-400 hover:text-white py-2" onClick={() => setIsOpen(false)}>Book Now</Link>
              {user ? (
                <>
                  <Link to="/dashboard" className="text-zinc-400 hover:text-white py-2" onClick={() => setIsOpen(false)}>My Trips</Link>
                  {user.role === "admin" && (
                    <Link to="/admin" className="text-zinc-400 hover:text-white py-2" onClick={() => setIsOpen(false)}>Admin</Link>
                  )}
                  <Button 
                    variant="ghost" 
                    onClick={() => { logout(); setIsOpen(false); }}
                    className="text-zinc-400 hover:text-white justify-start px-0"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <Link to="/login" onClick={() => setIsOpen(false)}>
                  <Button className="bg-[#FFD700] text-black hover:bg-[#E5C100] font-medium w-full">
                    Login
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
};

// Footer Component
export const Footer = () => {
  return (
    <footer className="bg-[#0A0A0A] border-t border-zinc-800 py-16">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <img src={LOGO_URL} alt="Carvio Cabs" className="h-12 w-12 rounded-full" />
              <span className="text-xl font-bold text-white">Carvio Cabs</span>
            </div>
            <p className="text-zinc-500 text-sm leading-relaxed">
              Premium transportation services for business travelers and corporate clients.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <div className="flex flex-col gap-2">
              <Link to="/fleet" className="text-zinc-500 hover:text-white text-sm transition-colors">Our Fleet</Link>
              <Link to="/book" className="text-zinc-500 hover:text-white text-sm transition-colors">Book a Ride</Link>
              <Link to="/dashboard" className="text-zinc-500 hover:text-white text-sm transition-colors">My Bookings</Link>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Services</h4>
            <div className="flex flex-col gap-2">
              <span className="text-zinc-500 text-sm">Airport Transfers</span>
              <span className="text-zinc-500 text-sm">Corporate Travel</span>
              <span className="text-zinc-500 text-sm">Outstation Trips</span>
              <span className="text-zinc-500 text-sm">Local Rentals</span>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <div className="flex flex-col gap-2">
              <a href="tel:+919999999999" className="text-zinc-500 hover:text-[#FFD700] text-sm transition-colors flex items-center gap-2">
                <Phone size={14} /> +91 99999 99999
              </a>
              <span className="text-zinc-500 text-sm">support@carviocabs.com</span>
            </div>
          </div>
        </div>
        
        <div className="border-t border-zinc-800 mt-12 pt-8 text-center">
          <p className="text-zinc-600 text-sm">© 2026 Carvio Cabs. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

// Trust Cards Data
const trustCards = [
  { icon: Clock, title: "On-time Pickup", desc: "Guaranteed punctuality for all your rides" },
  { icon: Shield, title: "Professional Drivers", desc: "Verified, uniformed, and trained drivers" },
  { icon: Car, title: "Sanitized Vehicles", desc: "Clean and sanitized after every trip" },
  { icon: CreditCard, title: "Transparent Billing", desc: "No hidden charges, what you see is what you pay" },
  { icon: Phone, title: "24×7 Support", desc: "Round the clock customer assistance" },
  { icon: Building2, title: "Corporate Billing", desc: "Monthly billing for corporate clients" },
];

// Services Data
const services = [
  { icon: Plane, title: "Airport Transfer", desc: "Hassle-free airport pickups and drops", color: "#FFD700" },
  { icon: Building2, title: "Corporate Travel", desc: "Dedicated solutions for businesses", color: "#FFD700" },
  { icon: Clock4, title: "Local Rental", desc: "Hourly packages for city travel", color: "#FFD700" },
  { icon: Map, title: "Outstation Trip", desc: "Comfortable long-distance journeys", color: "#FFD700" },
  { icon: PartyPopper, title: "Wedding/Event", desc: "Special occasions deserve special rides", color: "#FFD700" },
  { icon: Bus, title: "Employee Transport", desc: "Daily office commute solutions", color: "#FFD700" },
];

export default function HomePage() {
  const [fleet, setFleet] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Booking widget state
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropLocation, setDropLocation] = useState("");
  const [pickupDate, setPickupDate] = useState(null);
  const [pickupTime, setPickupTime] = useState("");
  const [tripType, setTripType] = useState("one_way");
  const [selectedCar, setSelectedCar] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fleetRes, testimonialRes] = await Promise.all([
          axios.get(`${API}/fleet`),
          axios.get(`${API}/testimonials`)
        ]);
        setFleet(fleetRes.data);
        setTestimonials(testimonialRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearchFare = () => {
    if (!pickupLocation) {
      return;
    }
    
    const params = new URLSearchParams({
      pickup: pickupLocation,
      drop: dropLocation || "",
      date: pickupDate ? format(pickupDate, "yyyy-MM-dd") : "",
      time: pickupTime,
      type: tripType,
      car: selectedCar
    });
    
    navigate(`/book?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#050505]">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20">
        <div className="absolute inset-0">
          <img 
            src={HERO_BG} 
            alt="Luxury car" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 hero-overlay" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-20 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Hero Text */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="gold-line mb-6" />
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-tight mb-6">
                Premium<br />
                <span className="text-[#FFD700]">Corporate</span><br />
                Transportation
              </h1>
              <p className="text-zinc-400 text-lg md:text-xl max-w-lg mb-8">
                Experience luxury travel with professional chauffeurs, 
                sanitized vehicles, and transparent pricing.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/book">
                  <Button 
                    className="bg-[#FFD700] text-black hover:bg-[#E5C100] font-medium px-8 py-6 text-lg"
                    data-testid="hero-book-btn"
                  >
                    Book Now <ChevronRight className="ml-2" />
                  </Button>
                </Link>
                <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer">
                  <Button 
                    variant="outline" 
                    className="border-zinc-700 text-white hover:bg-zinc-800 px-8 py-6 text-lg"
                    data-testid="whatsapp-btn"
                  >
                    WhatsApp Booking
                  </Button>
                </a>
              </div>
            </motion.div>

            {/* Booking Widget */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="glass rounded-xl p-6 md:p-8"
            >
              <h3 className="text-xl font-semibold text-white mb-6">Quick Booking</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-zinc-400 text-sm mb-2 block">Pickup Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-[#FFD700]" size={18} />
                    <Input 
                      placeholder="Enter pickup location"
                      value={pickupLocation}
                      onChange={(e) => setPickupLocation(e.target.value)}
                      className="pl-10 bg-[#0A0A0A] border-zinc-800 focus:border-[#FFD700] h-12 text-white"
                      data-testid="pickup-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-zinc-400 text-sm mb-2 block">Drop Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <Input 
                      placeholder="Enter drop location"
                      value={dropLocation}
                      onChange={(e) => setDropLocation(e.target.value)}
                      className="pl-10 bg-[#0A0A0A] border-zinc-800 focus:border-[#FFD700] h-12 text-white"
                      data-testid="drop-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-zinc-400 text-sm mb-2 block">Pickup Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button 
                          variant="outline" 
                          className="w-full justify-start bg-[#0A0A0A] border-zinc-800 hover:bg-zinc-900 text-left h-12"
                          data-testid="date-picker-btn"
                        >
                          <CalendarIcon className="mr-2 text-[#FFD700]" size={18} />
                          <span className={pickupDate ? "text-white" : "text-zinc-500"}>
                            {pickupDate ? format(pickupDate, "MMM dd") : "Select"}
                          </span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-[#121212] border-zinc-800" align="start">
                        <Calendar
                          mode="single"
                          selected={pickupDate}
                          onSelect={setPickupDate}
                          disabled={(date) => date < new Date()}
                          className="bg-[#121212] text-white"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <label className="text-zinc-400 text-sm mb-2 block">Pickup Time</label>
                    <Select value={pickupTime} onValueChange={setPickupTime}>
                      <SelectTrigger className="bg-[#0A0A0A] border-zinc-800 h-12" data-testid="time-select">
                        <SelectValue placeholder="Time" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#121212] border-zinc-800">
                        {Array.from({ length: 24 }, (_, i) => (
                          <SelectItem key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                            {`${i.toString().padStart(2, '0')}:00`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-zinc-400 text-sm mb-2 block">Trip Type</label>
                  <Select value={tripType} onValueChange={setTripType}>
                    <SelectTrigger className="bg-[#0A0A0A] border-zinc-800 h-12" data-testid="trip-type-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#121212] border-zinc-800">
                      <SelectItem value="one_way">One Way</SelectItem>
                      <SelectItem value="round_trip">Round Trip</SelectItem>
                      <SelectItem value="rental">Rental</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleSearchFare}
                  className="w-full bg-[#FFD700] text-black hover:bg-[#E5C100] font-semibold h-12 text-lg"
                  data-testid="search-fare-btn"
                >
                  Search Fare
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 md:py-32 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-[#FFD700] text-sm font-medium tracking-widest uppercase">Why Choose Us</span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mt-4">
              Trusted by Thousands
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trustCards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="card-dark p-6 group"
              >
                <div className="w-12 h-12 rounded-lg bg-[#FFD700]/10 flex items-center justify-center mb-4 group-hover:bg-[#FFD700]/20 transition-colors">
                  <card.icon className="text-[#FFD700]" size={24} />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{card.title}</h3>
                <p className="text-zinc-500 text-sm">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Fleet Section */}
      <section className="py-20 md:py-32 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row md:items-end md:justify-between mb-12"
          >
            <div>
              <span className="text-[#FFD700] text-sm font-medium tracking-widest uppercase">Our Fleet</span>
              <h2 className="text-3xl md:text-5xl font-bold text-white mt-4">
                Premium Vehicles
              </h2>
            </div>
            <Link to="/fleet">
              <Button variant="outline" className="border-zinc-700 text-white hover:bg-zinc-800 mt-4 md:mt-0" data-testid="view-all-fleet-btn">
                View All <ChevronRight className="ml-2" size={18} />
              </Button>
            </Link>
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="loader" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {fleet.map((car, index) => (
                <motion.div
                  key={car.car_id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to={`/fleet/${car.car_id}`}>
                    <div className="card-dark fleet-card cursor-pointer" data-testid={`fleet-card-${car.car_id}`}>
                      <div className="aspect-video bg-zinc-900 overflow-hidden">
                        <img 
                          src={car.image} 
                          alt={car.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-5">
                        <h3 className="text-white font-semibold text-lg mb-2">{car.name}</h3>
                        <div className="flex items-center gap-4 text-zinc-500 text-sm mb-4">
                          <span className="flex items-center gap-1">
                            <Users size={14} /> {car.passengers}
                          </span>
                          <span className="flex items-center gap-1">
                            <Briefcase size={14} /> {car.luggage}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#FFD700] font-semibold">₹{car.price_per_km}/km</span>
                          <ChevronRight className="text-zinc-500" size={18} />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 md:py-32 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-[#FFD700] text-sm font-medium tracking-widest uppercase">Services</span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mt-4">
              What We Offer
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="card-dark service-card p-6"
              >
                <div className="w-14 h-14 rounded-xl bg-[#FFD700]/10 flex items-center justify-center mb-4">
                  <service.icon className="text-[#FFD700]" size={28} />
                </div>
                <h3 className="text-white font-semibold text-xl mb-2">{service.title}</h3>
                <p className="text-zinc-500">{service.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Payment Options Section */}
      <section className="py-20 md:py-32 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-[#FFD700] text-sm font-medium tracking-widest uppercase">Payment</span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mt-4">
              Flexible Payment Options
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="card-dark p-8 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-[#10B981]/10 flex items-center justify-center mx-auto mb-6">
                <CreditCard className="text-[#10B981]" size={32} />
              </div>
              <h3 className="text-white font-semibold text-xl mb-2">Full Advance</h3>
              <p className="text-zinc-500 mb-4">Pay 100% upfront and get instant booking confirmation.</p>
              <span className="text-[#10B981] text-sm font-medium">Recommended</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="card-dark p-8 text-center border-[#FFD700]/30"
            >
              <div className="w-16 h-16 rounded-full bg-[#FFD700]/10 flex items-center justify-center mx-auto mb-6">
                <CreditCard className="text-[#FFD700]" size={32} />
              </div>
              <h3 className="text-white font-semibold text-xl mb-2">50% Advance</h3>
              <p className="text-zinc-500 mb-4">Pay half now, remaining after trip completion.</p>
              <span className="text-[#FFD700] text-sm font-medium">Popular Choice</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="card-dark p-8 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-6">
                <Building2 className="text-blue-500" size={32} />
              </div>
              <h3 className="text-white font-semibold text-xl mb-2">Corporate Billing</h3>
              <p className="text-zinc-500 mb-4">Monthly invoicing for approved corporate accounts.</p>
              <span className="text-blue-500 text-sm font-medium">For Businesses</span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      {testimonials.length > 0 && (
        <section className="py-20 md:py-32 bg-[#050505]">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="text-[#FFD700] text-sm font-medium tracking-widest uppercase">Testimonials</span>
              <h2 className="text-3xl md:text-5xl font-bold text-white mt-4">
                What Our Clients Say
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.testimonial_id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="card-dark p-6"
                >
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }, (_, i) => (
                      <Star key={i} className="text-[#FFD700] fill-[#FFD700]" size={16} />
                    ))}
                  </div>
                  <p className="text-zinc-400 mb-6 italic">"{testimonial.content}"</p>
                  <div>
                    <p className="text-white font-semibold">{testimonial.name}</p>
                    <p className="text-zinc-500 text-sm">{testimonial.role}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-[#0A0A0A] relative overflow-hidden">
        <div className="absolute inset-0 bg-[#FFD700] opacity-5" />
        <div className="max-w-4xl mx-auto px-6 md:px-12 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Ready to Experience Premium Travel?
            </h2>
            <p className="text-zinc-400 text-lg mb-8 max-w-2xl mx-auto">
              Book your ride now and enjoy the comfort, safety, and reliability of Carvio Cabs.
            </p>
            <Link to="/book">
              <Button 
                className="bg-[#FFD700] text-black hover:bg-[#E5C100] font-semibold px-10 py-6 text-lg"
                data-testid="cta-book-btn"
              >
                Book Your Ride Now
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
