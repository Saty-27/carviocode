import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { API, useAuth } from "@/App";
import { Navbar, Footer } from "@/pages/HomePage";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  Car, Calendar, MapPin, Clock, CreditCard, User, Phone,
  ChevronRight, X, CheckCircle2, AlertCircle
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get(`${API}/bookings`, { withCredentials: true });
        setBookings(response.data);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        toast.error("Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const cancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    
    try {
      await axios.post(`${API}/bookings/${bookingId}/cancel`, {}, { withCredentials: true });
      setBookings(prev => prev.map(b => 
        b.booking_id === bookingId ? { ...b, booking_status: "cancelled" } : b
      ));
      toast.success("Booking cancelled successfully");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to cancel booking");
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: "badge-pending",
      confirmed: "badge-confirmed",
      assigned: "badge-confirmed",
      in_progress: "badge-confirmed",
      completed: "badge-completed",
      cancelled: "badge-cancelled"
    };
    return badges[status] || "badge-pending";
  };

  const upcomingBookings = bookings.filter(b => 
    ["pending", "confirmed", "assigned"].includes(b.booking_status)
  );
  const completedBookings = bookings.filter(b => b.booking_status === "completed");
  const cancelledBookings = bookings.filter(b => b.booking_status === "cancelled");

  const BookingCard = ({ booking }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-dark p-6"
      data-testid={`booking-card-${booking.booking_id}`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <span className="text-zinc-500 text-sm">Booking ID</span>
          <p className="text-white font-semibold">{booking.booking_id}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(booking.booking_status)}`}>
          {booking.booking_status.replace("_", " ")}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="flex items-start gap-3">
          <Car className="text-[#FFD700] mt-1" size={18} />
          <div>
            <span className="text-zinc-500 text-sm block">Vehicle</span>
            <span className="text-white">{booking.car_name}</span>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <Calendar className="text-[#FFD700] mt-1" size={18} />
          <div>
            <span className="text-zinc-500 text-sm block">Date & Time</span>
            <span className="text-white">{booking.pickup_date} at {booking.pickup_time}</span>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <MapPin className="text-[#FFD700] mt-1" size={18} />
          <div>
            <span className="text-zinc-500 text-sm block">Pickup</span>
            <span className="text-white">{booking.pickup_location}</span>
          </div>
        </div>

        {booking.drop_location && (
          <div className="flex items-start gap-3">
            <MapPin className="text-zinc-500 mt-1" size={18} />
            <div>
              <span className="text-zinc-500 text-sm block">Drop</span>
              <span className="text-white">{booking.drop_location}</span>
            </div>
          </div>
        )}
      </div>

      {/* Driver Info */}
      {booking.driver_name && (
        <div className="bg-[#0A0A0A] rounded-lg p-4 mb-4">
          <span className="text-zinc-500 text-sm block mb-2">Driver Assigned</span>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FFD700]/10 flex items-center justify-center">
              <User className="text-[#FFD700]" size={18} />
            </div>
            <div>
              <p className="text-white font-medium">{booking.driver_name}</p>
              <p className="text-zinc-500 text-sm flex items-center gap-1">
                <Phone size={12} /> {booking.driver_phone}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Payment Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t border-zinc-800">
        <div>
          <span className="text-zinc-500 text-sm">Total Fare</span>
          <p className="text-[#FFD700] font-bold text-xl">₹{booking.total_fare}</p>
          {booking.pending_amount > 0 && (
            <span className="text-zinc-500 text-sm">
              Pending: ₹{booking.pending_amount}
            </span>
          )}
        </div>

        <div className="flex gap-2">
          {["pending", "confirmed", "assigned"].includes(booking.booking_status) && (
            <Button
              onClick={() => cancelBooking(booking.booking_id)}
              variant="outline"
              size="sm"
              className="border-red-500/50 text-red-500 hover:bg-red-500/10"
              data-testid={`cancel-booking-${booking.booking_id}`}
            >
              <X size={16} className="mr-1" /> Cancel
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-[#050505]">
      <Navbar />
      
      <main className="pt-28 pb-20">
        <div className="max-w-5xl mx-auto px-6 md:px-12">
          {/* User Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-[#FFD700]/10 flex items-center justify-center">
                {user?.picture ? (
                  <img src={user.picture} alt={user.name} className="w-16 h-16 rounded-full object-cover" />
                ) : (
                  <User className="text-[#FFD700]" size={28} />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
                <p className="text-zinc-500">{user?.email}</p>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
          >
            <Link to="/book">
              <div className="card-dark p-4 text-center hover:border-[#FFD700] transition-colors cursor-pointer">
                <Car className="text-[#FFD700] mx-auto mb-2" size={24} />
                <span className="text-white text-sm font-medium">Book Ride</span>
              </div>
            </Link>
            <Link to="/fleet">
              <div className="card-dark p-4 text-center hover:border-[#FFD700] transition-colors cursor-pointer">
                <Clock className="text-[#FFD700] mx-auto mb-2" size={24} />
                <span className="text-white text-sm font-medium">View Fleet</span>
              </div>
            </Link>
            <div className="card-dark p-4 text-center">
              <CheckCircle2 className="text-[#10B981] mx-auto mb-2" size={24} />
              <span className="text-white text-sm font-medium">{completedBookings.length} Completed</span>
            </div>
            <div className="card-dark p-4 text-center">
              <CreditCard className="text-[#FFD700] mx-auto mb-2" size={24} />
              <span className="text-white text-sm font-medium">{upcomingBookings.length} Upcoming</span>
            </div>
          </motion.div>

          {/* Bookings Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-[#121212] border border-zinc-800 mb-6">
                <TabsTrigger value="upcoming" className="data-[state=active]:bg-[#FFD700] data-[state=active]:text-black">
                  Upcoming ({upcomingBookings.length})
                </TabsTrigger>
                <TabsTrigger value="completed" className="data-[state=active]:bg-[#FFD700] data-[state=active]:text-black">
                  Completed ({completedBookings.length})
                </TabsTrigger>
                <TabsTrigger value="cancelled" className="data-[state=active]:bg-[#FFD700] data-[state=active]:text-black">
                  Cancelled ({cancelledBookings.length})
                </TabsTrigger>
              </TabsList>

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="loader" />
                </div>
              ) : (
                <>
                  <TabsContent value="upcoming">
                    {upcomingBookings.length === 0 ? (
                      <div className="card-dark p-12 text-center">
                        <AlertCircle className="text-zinc-500 mx-auto mb-4" size={40} />
                        <p className="text-zinc-500 mb-4">No upcoming bookings</p>
                        <Link to="/book">
                          <Button className="bg-[#FFD700] text-black hover:bg-[#E5C100]">
                            Book a Ride <ChevronRight className="ml-2" size={18} />
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {upcomingBookings.map((booking) => (
                          <BookingCard key={booking.booking_id} booking={booking} />
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="completed">
                    {completedBookings.length === 0 ? (
                      <div className="card-dark p-12 text-center">
                        <CheckCircle2 className="text-zinc-500 mx-auto mb-4" size={40} />
                        <p className="text-zinc-500">No completed bookings yet</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {completedBookings.map((booking) => (
                          <BookingCard key={booking.booking_id} booking={booking} />
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="cancelled">
                    {cancelledBookings.length === 0 ? (
                      <div className="card-dark p-12 text-center">
                        <X className="text-zinc-500 mx-auto mb-4" size={40} />
                        <p className="text-zinc-500">No cancelled bookings</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {cancelledBookings.map((booking) => (
                          <BookingCard key={booking.booking_id} booking={booking} />
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </>
              )}
            </Tabs>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
