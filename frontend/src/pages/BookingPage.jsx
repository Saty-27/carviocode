import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { API, useAuth } from "@/App";
import { Navbar, Footer } from "@/pages/HomePage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { format } from "date-fns";
import { 
  MapPin, Calendar as CalendarIcon, Clock, Users, Briefcase,
  CreditCard, CheckCircle2, ChevronRight, ChevronLeft, ArrowRight
} from "lucide-react";

const RAZORPAY_KEY_ID = "rzp_test_YourTestKey"; // Will be replaced with actual key

export default function BookingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Step state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  // Fleet data
  const [fleet, setFleet] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [tripType, setTripType] = useState(searchParams.get("type") || "one_way");
  const [selectedCar, setSelectedCar] = useState(searchParams.get("car") || "");
  const [pickupLocation, setPickupLocation] = useState(searchParams.get("pickup") || "");
  const [dropLocation, setDropLocation] = useState(searchParams.get("drop") || "");
  const [pickupDate, setPickupDate] = useState(
    searchParams.get("date") ? new Date(searchParams.get("date")) : null
  );
  const [pickupTime, setPickupTime] = useState(searchParams.get("time") || "");
  const [returnDate, setReturnDate] = useState(null);
  const [distanceKm, setDistanceKm] = useState("");
  const [durationHours, setDurationHours] = useState("");
  const [paymentType, setPaymentType] = useState("full");

  // Fare state
  const [fare, setFare] = useState(null);
  const [calculating, setCalculating] = useState(false);

  // Booking state
  const [booking, setBooking] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);

  useEffect(() => {
    const fetchFleet = async () => {
      try {
        const response = await axios.get(`${API}/fleet`);
        setFleet(response.data);
      } catch (error) {
        console.error("Error fetching fleet:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFleet();
  }, []);

  const selectedCarData = fleet.find(c => c.car_id === selectedCar);

  const calculateFare = async () => {
    if (!selectedCar || !distanceKm) {
      toast.error("Please select a car and enter distance");
      return;
    }

    setCalculating(true);
    try {
      const response = await axios.post(`${API}/fare/calculate`, {
        trip_type: tripType,
        car_id: selectedCar,
        distance_km: parseFloat(distanceKm),
        duration_hours: durationHours ? parseFloat(durationHours) : null,
        pickup_time: pickupTime,
        pickup_date: pickupDate ? format(pickupDate, "yyyy-MM-dd") : null,
        return_date: returnDate ? format(returnDate, "yyyy-MM-dd") : null
      });
      setFare(response.data);
      setCurrentStep(4);
    } catch (error) {
      toast.error("Failed to calculate fare");
    } finally {
      setCalculating(false);
    }
  };

  const handleBooking = async () => {
    if (!pickupLocation || !pickupDate || !pickupTime) {
      toast.error("Please fill all required fields");
      return;
    }

    setBooking(true);
    try {
      const response = await axios.post(`${API}/bookings`, {
        trip_type: tripType,
        car_id: selectedCar,
        pickup_location: pickupLocation,
        drop_location: dropLocation || null,
        pickup_date: format(pickupDate, "yyyy-MM-dd"),
        pickup_time: pickupTime,
        return_date: returnDate ? format(returnDate, "yyyy-MM-dd") : null,
        distance_km: parseFloat(distanceKm),
        duration_hours: durationHours ? parseFloat(durationHours) : null,
        payment_type: paymentType
      }, { withCredentials: true });

      setBookingResult(response.data);

      // If payment required, initiate Razorpay
      if (paymentType !== "corporate" && response.data.razorpay_order_id) {
        initiatePayment(response.data);
      } else {
        setCurrentStep(5);
        toast.success("Booking created successfully!");
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || "Booking failed");
    } finally {
      setBooking(false);
    }
  };

  const initiatePayment = (bookingData) => {
    if (!window.Razorpay) {
      // Load Razorpay script dynamically
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => openRazorpay(bookingData);
      document.body.appendChild(script);
    } else {
      openRazorpay(bookingData);
    }
  };

  const openRazorpay = (bookingData) => {
    const options = {
      key: bookingData.razorpay_key_id || RAZORPAY_KEY_ID,
      amount: bookingData.amount_to_pay * 100,
      currency: "INR",
      name: "Carvio Cabs",
      description: `Booking: ${bookingData.booking_id}`,
      order_id: bookingData.razorpay_order_id,
      handler: async (response) => {
        try {
          await axios.post(`${API}/bookings/${bookingData.booking_id}/verify-payment`, {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          }, { withCredentials: true });
          
          setCurrentStep(5);
          toast.success("Payment successful! Booking confirmed.");
        } catch (error) {
          toast.error("Payment verification failed");
        }
      },
      prefill: {
        name: user?.name || "",
        email: user?.email || "",
        contact: user?.phone || ""
      },
      theme: {
        color: "#FFD700"
      }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  const nextStep = () => {
    if (currentStep === 3) {
      calculateFare();
    } else {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const steps = [
    { num: 1, title: "Trip Type" },
    { num: 2, title: "Select Car" },
    { num: 3, title: "Trip Details" },
    { num: 4, title: "Review" },
    { num: 5, title: "Confirmation" }
  ];

  return (
    <div className="min-h-screen bg-[#050505]">
      <Navbar />
      
      <main className="pt-28 pb-20">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          {/* Progress Steps */}
          <div className="mb-12">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.num} className="flex items-center">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                    ${currentStep > step.num ? 'step-completed' : 
                      currentStep === step.num ? 'step-active' : 'step-pending'}
                  `}>
                    {currentStep > step.num ? <CheckCircle2 size={20} /> : step.num}
                  </div>
                  <span className={`hidden md:block ml-3 text-sm ${
                    currentStep >= step.num ? 'text-white' : 'text-zinc-500'
                  }`}>
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`w-12 md:w-24 h-0.5 mx-2 md:mx-4 ${
                      currentStep > step.num ? 'bg-[#10B981]' : 'bg-zinc-800'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Step 1: Trip Type */}
            {currentStep === 1 && (
              <div className="card-dark p-6 md:p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Select Trip Type</h2>
                
                <RadioGroup value={tripType} onValueChange={setTripType} className="space-y-4">
                  <div className={`flex items-center space-x-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                    tripType === 'one_way' ? 'border-[#FFD700] bg-[#FFD700]/5' : 'border-zinc-800 hover:border-zinc-700'
                  }`} onClick={() => setTripType('one_way')}>
                    <RadioGroupItem value="one_way" id="one_way" />
                    <Label htmlFor="one_way" className="flex-1 cursor-pointer">
                      <span className="text-white font-medium block">One Way</span>
                      <span className="text-zinc-500 text-sm">Point to point transfer</span>
                    </Label>
                  </div>
                  
                  <div className={`flex items-center space-x-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                    tripType === 'round_trip' ? 'border-[#FFD700] bg-[#FFD700]/5' : 'border-zinc-800 hover:border-zinc-700'
                  }`} onClick={() => setTripType('round_trip')}>
                    <RadioGroupItem value="round_trip" id="round_trip" />
                    <Label htmlFor="round_trip" className="flex-1 cursor-pointer">
                      <span className="text-white font-medium block">Round Trip</span>
                      <span className="text-zinc-500 text-sm">Outstation with return journey</span>
                    </Label>
                  </div>
                  
                  <div className={`flex items-center space-x-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                    tripType === 'rental' ? 'border-[#FFD700] bg-[#FFD700]/5' : 'border-zinc-800 hover:border-zinc-700'
                  }`} onClick={() => setTripType('rental')}>
                    <RadioGroupItem value="rental" id="rental" />
                    <Label htmlFor="rental" className="flex-1 cursor-pointer">
                      <span className="text-white font-medium block">Rental</span>
                      <span className="text-zinc-500 text-sm">Hourly packages (4hr/8hr)</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {/* Step 2: Select Car */}
            {currentStep === 2 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Select Your Vehicle</h2>
                
                {loading ? (
                  <div className="flex justify-center py-12">
                    <div className="loader" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {fleet.map((car) => (
                      <div
                        key={car.car_id}
                        onClick={() => setSelectedCar(car.car_id)}
                        className={`card-dark p-4 cursor-pointer transition-all ${
                          selectedCar === car.car_id 
                            ? 'border-[#FFD700] ring-1 ring-[#FFD700]' 
                            : 'hover:border-zinc-700'
                        }`}
                        data-testid={`select-car-${car.car_id}`}
                      >
                        <div className="aspect-video bg-zinc-900 rounded-lg overflow-hidden mb-4">
                          <img src={car.image} alt={car.name} className="w-full h-full object-cover" />
                        </div>
                        <h3 className="text-white font-semibold mb-2">{car.name}</h3>
                        <div className="flex items-center gap-4 text-zinc-500 text-sm mb-3">
                          <span className="flex items-center gap-1">
                            <Users size={14} /> {car.passengers}
                          </span>
                          <span className="flex items-center gap-1">
                            <Briefcase size={14} /> {car.luggage}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#FFD700] font-semibold">₹{car.price_per_km}/km</span>
                          {selectedCar === car.car_id && (
                            <CheckCircle2 className="text-[#FFD700]" size={20} />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Trip Details */}
            {currentStep === 3 && (
              <div className="card-dark p-6 md:p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Enter Trip Details</h2>
                
                <div className="space-y-6">
                  <div>
                    <Label className="text-zinc-400">Pickup Location *</Label>
                    <div className="relative mt-2">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-[#FFD700]" size={18} />
                      <Input
                        value={pickupLocation}
                        onChange={(e) => setPickupLocation(e.target.value)}
                        placeholder="Enter pickup address"
                        className="pl-10 bg-[#0A0A0A] border-zinc-800 focus:border-[#FFD700] h-12 text-white"
                        data-testid="booking-pickup-input"
                      />
                    </div>
                  </div>

                  {tripType !== "rental" && (
                    <div>
                      <Label className="text-zinc-400">Drop Location</Label>
                      <div className="relative mt-2">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                        <Input
                          value={dropLocation}
                          onChange={(e) => setDropLocation(e.target.value)}
                          placeholder="Enter drop address"
                          className="pl-10 bg-[#0A0A0A] border-zinc-800 focus:border-[#FFD700] h-12 text-white"
                          data-testid="booking-drop-input"
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-zinc-400">Pickup Date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start bg-[#0A0A0A] border-zinc-800 hover:bg-zinc-900 h-12 mt-2"
                            data-testid="booking-date-btn"
                          >
                            <CalendarIcon className="mr-2 text-[#FFD700]" size={18} />
                            <span className={pickupDate ? "text-white" : "text-zinc-500"}>
                              {pickupDate ? format(pickupDate, "PPP") : "Select date"}
                            </span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-[#121212] border-zinc-800">
                          <Calendar
                            mode="single"
                            selected={pickupDate}
                            onSelect={setPickupDate}
                            disabled={(date) => date < new Date()}
                            className="bg-[#121212]"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div>
                      <Label className="text-zinc-400">Pickup Time *</Label>
                      <Select value={pickupTime} onValueChange={setPickupTime}>
                        <SelectTrigger className="bg-[#0A0A0A] border-zinc-800 h-12 mt-2" data-testid="booking-time-select">
                          <SelectValue placeholder="Select time" />
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

                  {tripType === "round_trip" && (
                    <div>
                      <Label className="text-zinc-400">Return Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start bg-[#0A0A0A] border-zinc-800 hover:bg-zinc-900 h-12 mt-2"
                          >
                            <CalendarIcon className="mr-2 text-[#FFD700]" size={18} />
                            <span className={returnDate ? "text-white" : "text-zinc-500"}>
                              {returnDate ? format(returnDate, "PPP") : "Select return date"}
                            </span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-[#121212] border-zinc-800">
                          <Calendar
                            mode="single"
                            selected={returnDate}
                            onSelect={setReturnDate}
                            disabled={(date) => date < (pickupDate || new Date())}
                            className="bg-[#121212]"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-zinc-400">Estimated Distance (km) *</Label>
                      <Input
                        type="number"
                        value={distanceKm}
                        onChange={(e) => setDistanceKm(e.target.value)}
                        placeholder="e.g., 50"
                        className="bg-[#0A0A0A] border-zinc-800 focus:border-[#FFD700] h-12 mt-2 text-white"
                        data-testid="booking-distance-input"
                      />
                    </div>

                    {tripType === "rental" && (
                      <div>
                        <Label className="text-zinc-400">Duration (hours)</Label>
                        <Select value={durationHours} onValueChange={setDurationHours}>
                          <SelectTrigger className="bg-[#0A0A0A] border-zinc-800 h-12 mt-2">
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#121212] border-zinc-800">
                            <SelectItem value="4">4 Hours</SelectItem>
                            <SelectItem value="8">8 Hours</SelectItem>
                            <SelectItem value="12">12 Hours</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review & Pay */}
            {currentStep === 4 && fare && (
              <div className="space-y-6">
                <div className="card-dark p-6 md:p-8">
                  <h2 className="text-2xl font-bold text-white mb-6">Booking Summary</h2>
                  
                  {/* Trip Details */}
                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between py-3 border-b border-zinc-800">
                      <span className="text-zinc-500">Vehicle</span>
                      <span className="text-white font-medium">{selectedCarData?.name}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-zinc-800">
                      <span className="text-zinc-500">Trip Type</span>
                      <span className="text-white capitalize">{tripType.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-zinc-800">
                      <span className="text-zinc-500">Pickup</span>
                      <span className="text-white">{pickupLocation}</span>
                    </div>
                    {dropLocation && (
                      <div className="flex justify-between py-3 border-b border-zinc-800">
                        <span className="text-zinc-500">Drop</span>
                        <span className="text-white">{dropLocation}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-3 border-b border-zinc-800">
                      <span className="text-zinc-500">Date & Time</span>
                      <span className="text-white">
                        {pickupDate && format(pickupDate, "PPP")} at {pickupTime}
                      </span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-zinc-800">
                      <span className="text-zinc-500">Distance</span>
                      <span className="text-white">{distanceKm} km</span>
                    </div>
                  </div>

                  {/* Fare Breakdown */}
                  <div className="bg-[#0A0A0A] rounded-lg p-6 mb-8">
                    <h3 className="text-white font-semibold mb-4">Fare Breakdown</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Base Fare</span>
                        <span className="text-white">₹{fare.base_fare}</span>
                      </div>
                      {fare.extra_charges > 0 && (
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Extra Charges</span>
                          <span className="text-white">₹{fare.extra_charges}</span>
                        </div>
                      )}
                      {fare.night_charge > 0 && (
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Night Allowance</span>
                          <span className="text-white">₹{fare.night_charge}</span>
                        </div>
                      )}
                      {fare.driver_allowance > 0 && (
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Driver Allowance</span>
                          <span className="text-white">₹{fare.driver_allowance}</span>
                        </div>
                      )}
                      <div className="flex justify-between pt-3 border-t border-zinc-800">
                        <span className="text-white font-semibold">Total Fare</span>
                        <span className="text-[#FFD700] font-bold text-xl">₹{fare.total}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Type Selection */}
                  <div>
                    <h3 className="text-white font-semibold mb-4">Payment Option</h3>
                    <RadioGroup value={paymentType} onValueChange={setPaymentType} className="space-y-3">
                      <div className={`flex items-center space-x-4 p-4 rounded-lg border cursor-pointer ${
                        paymentType === 'full' ? 'border-[#10B981] bg-[#10B981]/5' : 'border-zinc-800'
                      }`} onClick={() => setPaymentType('full')}>
                        <RadioGroupItem value="full" id="full" />
                        <Label htmlFor="full" className="flex-1 cursor-pointer">
                          <span className="text-white font-medium block">Pay Full Amount</span>
                          <span className="text-zinc-500 text-sm">₹{fare.total} - Instant confirmation</span>
                        </Label>
                      </div>
                      
                      <div className={`flex items-center space-x-4 p-4 rounded-lg border cursor-pointer ${
                        paymentType === 'partial' ? 'border-[#FFD700] bg-[#FFD700]/5' : 'border-zinc-800'
                      }`} onClick={() => setPaymentType('partial')}>
                        <RadioGroupItem value="partial" id="partial" />
                        <Label htmlFor="partial" className="flex-1 cursor-pointer">
                          <span className="text-white font-medium block">Pay 50% Advance</span>
                          <span className="text-zinc-500 text-sm">₹{(fare.total / 2).toFixed(2)} now, rest after trip</span>
                        </Label>
                      </div>
                      
                      <div className={`flex items-center space-x-4 p-4 rounded-lg border cursor-pointer ${
                        paymentType === 'corporate' ? 'border-blue-500 bg-blue-500/5' : 'border-zinc-800'
                      }`} onClick={() => setPaymentType('corporate')}>
                        <RadioGroupItem value="corporate" id="corporate" />
                        <Label htmlFor="corporate" className="flex-1 cursor-pointer">
                          <span className="text-white font-medium block">Corporate Billing</span>
                          <span className="text-zinc-500 text-sm">For approved corporate accounts</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                <Button
                  onClick={handleBooking}
                  disabled={booking}
                  className="w-full bg-[#FFD700] text-black hover:bg-[#E5C100] font-semibold h-14 text-lg"
                  data-testid="confirm-booking-btn"
                >
                  {booking ? "Processing..." : (
                    <>
                      <CreditCard className="mr-2" /> 
                      {paymentType === 'corporate' ? 'Submit Booking' : `Pay ₹${paymentType === 'full' ? fare.total : (fare.total / 2).toFixed(2)}`}
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Step 5: Confirmation */}
            {currentStep === 5 && (
              <div className="card-dark p-8 text-center">
                <div className="w-20 h-20 rounded-full bg-[#10B981]/10 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="text-[#10B981]" size={40} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Booking Confirmed!</h2>
                <p className="text-zinc-500 mb-6">
                  Your booking ID is <span className="text-[#FFD700] font-semibold">{bookingResult?.booking_id}</span>
                </p>
                <p className="text-zinc-400 mb-8">
                  You will receive a confirmation email with trip details. 
                  Our team will assign a driver and notify you before pickup.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={() => navigate("/dashboard")}
                    className="bg-[#FFD700] text-black hover:bg-[#E5C100] font-medium"
                    data-testid="view-bookings-btn"
                  >
                    View My Bookings
                  </Button>
                  <Button
                    onClick={() => navigate("/")}
                    variant="outline"
                    className="border-zinc-700 text-white hover:bg-zinc-800"
                  >
                    Back to Home
                  </Button>
                </div>
              </div>
            )}
          </motion.div>

          {/* Navigation Buttons */}
          {currentStep < 5 && (
            <div className="flex justify-between mt-8">
              <Button
                onClick={prevStep}
                disabled={currentStep === 1}
                variant="outline"
                className="border-zinc-700 text-white hover:bg-zinc-800"
              >
                <ChevronLeft className="mr-2" size={18} /> Previous
              </Button>
              
              {currentStep < 4 && (
                <Button
                  onClick={nextStep}
                  disabled={(currentStep === 2 && !selectedCar) || calculating}
                  className="bg-[#FFD700] text-black hover:bg-[#E5C100] font-medium"
                  data-testid="next-step-btn"
                >
                  {calculating ? "Calculating..." : (
                    <>
                      {currentStep === 3 ? "Calculate Fare" : "Next"}
                      <ChevronRight className="ml-2" size={18} />
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
