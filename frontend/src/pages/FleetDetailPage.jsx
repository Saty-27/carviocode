import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { API } from "@/App";
import { Navbar, Footer } from "@/pages/HomePage";
import { Button } from "@/components/ui/button";
import { 
  Users, Briefcase, ChevronLeft, Clock, MapPin, Sun, Moon, 
  CheckCircle2 
} from "lucide-react";

export default function FleetDetailPage() {
  const { carId } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const response = await axios.get(`${API}/fleet/${carId}`);
        setCar(response.data);
      } catch (error) {
        console.error("Error fetching car:", error);
        navigate("/fleet");
      } finally {
        setLoading(false);
      }
    };
    fetchCar();
  }, [carId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="loader" />
      </div>
    );
  }

  if (!car) {
    return null;
  }

  const features = [
    "Air Conditioning",
    "Comfortable Seating",
    "Music System",
    "USB Charging",
    "First Aid Kit",
    "GPS Navigation"
  ];

  return (
    <div className="min-h-screen bg-[#050505]">
      <Navbar />
      
      <main className="pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Link to="/fleet" className="inline-flex items-center text-zinc-400 hover:text-white mb-8 transition-colors">
              <ChevronLeft size={20} /> Back to Fleet
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Car Image */}
              <div className="card-dark overflow-hidden">
                <img 
                  src={car.image} 
                  alt={car.name}
                  className="w-full aspect-[4/3] object-cover"
                />
              </div>

              {/* Car Details */}
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4" data-testid="car-name">
                  {car.name}
                </h1>
                
                <div className="flex items-center gap-6 mb-6">
                  <span className="flex items-center gap-2 text-zinc-400">
                    <Users size={18} className="text-[#FFD700]" /> {car.passengers} Passengers
                  </span>
                  <span className="flex items-center gap-2 text-zinc-400">
                    <Briefcase size={18} className="text-[#FFD700]" /> {car.luggage} Luggage
                  </span>
                </div>

                <p className="text-zinc-400 text-lg mb-8">{car.description}</p>

                {/* Features */}
                <div className="mb-8">
                  <h3 className="text-white font-semibold mb-4">Features</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-zinc-400">
                        <CheckCircle2 size={16} className="text-[#10B981]" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Book Button */}
                <Link to={`/book?car=${car.car_id}`}>
                  <Button 
                    className="bg-[#FFD700] text-black hover:bg-[#E5C100] font-semibold px-8 py-6 text-lg w-full md:w-auto"
                    data-testid="book-this-car-btn"
                  >
                    Book This Car
                  </Button>
                </Link>
              </div>
            </div>

            {/* Pricing Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-16"
            >
              <h2 className="text-2xl font-bold text-white mb-8">Pricing Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* One Way / Local */}
                <div className="card-dark p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-[#FFD700]/10 flex items-center justify-center">
                      <MapPin className="text-[#FFD700]" size={20} />
                    </div>
                    <h3 className="text-white font-semibold">One Way / Local</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Base Fare</span>
                      <span className="text-white">₹{car.base_price}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Per Kilometer</span>
                      <span className="text-[#FFD700] font-semibold">₹{car.price_per_km}/km</span>
                    </div>
                  </div>
                </div>

                {/* Rental Packages */}
                <div className="card-dark p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-[#FFD700]/10 flex items-center justify-center">
                      <Clock className="text-[#FFD700]" size={20} />
                    </div>
                    <h3 className="text-white font-semibold">Rental Packages</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">4 Hrs / 40 Km</span>
                      <span className="text-white">₹{car.rental_4hr}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">8 Hrs / 80 Km</span>
                      <span className="text-white">₹{car.rental_8hr}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Extra Hour</span>
                      <span className="text-zinc-400">₹{car.extra_hour}/hr</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Extra Km</span>
                      <span className="text-zinc-400">₹{car.extra_km}/km</span>
                    </div>
                  </div>
                </div>

                {/* Outstation */}
                <div className="card-dark p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-[#FFD700]/10 flex items-center justify-center">
                      <Sun className="text-[#FFD700]" size={20} />
                    </div>
                    <h3 className="text-white font-semibold">Outstation</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Per Kilometer</span>
                      <span className="text-white">₹{car.outstation_per_km}/km</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Min. 300 km/day</span>
                      <span className="text-zinc-400">Applied</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Driver Allowance</span>
                      <span className="text-zinc-400">₹{car.driver_allowance}/day</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Charges */}
              <div className="mt-8 card-dark p-6">
                <h3 className="text-white font-semibold mb-4">Additional Charges</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center gap-3">
                    <Moon className="text-zinc-500" size={18} />
                    <div>
                      <span className="text-zinc-500 text-sm block">Night Allowance (10PM - 6AM)</span>
                      <span className="text-white">₹{car.night_allowance}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="text-zinc-500" size={18} />
                    <div>
                      <span className="text-zinc-500 text-sm block">Waiting Charges</span>
                      <span className="text-white">₹100/hr (after 30 min)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="text-zinc-500" size={18} />
                    <div>
                      <span className="text-zinc-500 text-sm block">Toll & Parking</span>
                      <span className="text-white">As per actuals</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
