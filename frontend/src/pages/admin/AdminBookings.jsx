import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { API } from "@/App";
import { AdminSidebar, AdminHeader } from "./AdminDashboard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Car, Calendar, MapPin, CreditCard, User, CheckCircle2 } from "lucide-react";

export default function AdminBookings() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [assignDriverOpen, setAssignDriverOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsRes, driversRes] = await Promise.all([
          axios.get(`${API}/admin/bookings`, { withCredentials: true }),
          axios.get(`${API}/admin/drivers`, { withCredentials: true })
        ]);
        setBookings(bookingsRes.data);
        setDrivers(driversRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredBookings = statusFilter === "all" 
    ? bookings 
    : bookings.filter(b => b.booking_status === statusFilter);

  const assignDriver = async () => {
    if (!selectedBooking || !selectedDriver) return;

    try {
      await axios.put(
        `${API}/admin/bookings/${selectedBooking.booking_id}/assign-driver`,
        { driver_id: selectedDriver },
        { withCredentials: true }
      );
      
      const driver = drivers.find(d => d.driver_id === selectedDriver);
      setBookings(prev => prev.map(b => 
        b.booking_id === selectedBooking.booking_id 
          ? { ...b, driver_id: selectedDriver, driver_name: driver?.name, booking_status: "assigned" }
          : b
      ));
      
      setAssignDriverOpen(false);
      setSelectedDriver("");
      toast.success("Driver assigned successfully");
    } catch (error) {
      toast.error("Failed to assign driver");
    }
  };

  const updateStatus = async (bookingId, status) => {
    try {
      await axios.put(
        `${API}/admin/bookings/${bookingId}/status`,
        { status },
        { withCredentials: true }
      );
      
      setBookings(prev => prev.map(b => 
        b.booking_id === bookingId ? { ...b, booking_status: status } : b
      ));
      
      toast.success("Status updated");
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const markPaid = async (bookingId) => {
    try {
      await axios.put(
        `${API}/admin/bookings/${bookingId}/mark-paid`,
        {},
        { withCredentials: true }
      );
      
      setBookings(prev => prev.map(b => 
        b.booking_id === bookingId 
          ? { ...b, paid_amount: b.total_fare, pending_amount: 0, payment_status: "paid" }
          : b
      ));
      
      toast.success("Payment marked as complete");
    } catch (error) {
      toast.error("Failed to update payment");
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

  const getPaymentBadge = (status) => {
    const badges = {
      pending: "badge-pending",
      partial: "badge-pending",
      paid: "badge-completed",
      refunded: "badge-cancelled"
    };
    return badges[status] || "badge-pending";
  };

  return (
    <div className="min-h-screen bg-[#050505]">
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <main className="lg:ml-64">
        <AdminHeader title="Bookings" setIsOpen={setSidebarOpen} />
        
        <div className="p-6" data-testid="admin-bookings">
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48 bg-[#121212] border-zinc-800">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-[#121212] border-zinc-800">
                <SelectItem value="all">All Bookings</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="loader" />
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking, index) => (
                <motion.div
                  key={booking.booking_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="card-dark p-6"
                  data-testid={`admin-booking-${booking.booking_id}`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-[#FFD700]/10 flex items-center justify-center">
                        <Car className="text-[#FFD700]" size={24} />
                      </div>
                      <div>
                        <p className="text-white font-semibold">{booking.booking_id}</p>
                        <p className="text-zinc-500 text-sm">{booking.car_name}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(booking.booking_status)}`}>
                        {booking.booking_status.replace("_", " ")}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getPaymentBadge(booking.payment_status)}`}>
                        {booking.payment_status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-start gap-2">
                      <MapPin className="text-[#FFD700] mt-1 flex-shrink-0" size={16} />
                      <div>
                        <p className="text-zinc-500 text-xs">Pickup</p>
                        <p className="text-white text-sm">{booking.pickup_location}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <Calendar className="text-[#FFD700] mt-1 flex-shrink-0" size={16} />
                      <div>
                        <p className="text-zinc-500 text-xs">Date & Time</p>
                        <p className="text-white text-sm">{booking.pickup_date} at {booking.pickup_time}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <CreditCard className="text-[#FFD700] mt-1 flex-shrink-0" size={16} />
                      <div>
                        <p className="text-zinc-500 text-xs">Total / Paid / Pending</p>
                        <p className="text-white text-sm">
                          ₹{booking.total_fare} / ₹{booking.paid_amount} / ₹{booking.pending_amount}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <User className="text-[#FFD700] mt-1 flex-shrink-0" size={16} />
                      <div>
                        <p className="text-zinc-500 text-xs">Driver</p>
                        <p className="text-white text-sm">{booking.driver_name || "Not Assigned"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-zinc-800">
                    {!booking.driver_id && booking.booking_status !== "cancelled" && (
                      <Dialog open={assignDriverOpen && selectedBooking?.booking_id === booking.booking_id} onOpenChange={(open) => {
                        setAssignDriverOpen(open);
                        if (open) setSelectedBooking(booking);
                      }}>
                        <DialogTrigger asChild>
                          <Button size="sm" className="bg-[#FFD700] text-black hover:bg-[#E5C100]">
                            Assign Driver
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-[#121212] border-zinc-800">
                          <DialogHeader>
                            <DialogTitle className="text-white">Assign Driver</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                              <SelectTrigger className="bg-[#0A0A0A] border-zinc-800">
                                <SelectValue placeholder="Select a driver" />
                              </SelectTrigger>
                              <SelectContent className="bg-[#121212] border-zinc-800">
                                {drivers.filter(d => d.is_available).map((driver) => (
                                  <SelectItem key={driver.driver_id} value={driver.driver_id}>
                                    {driver.name} - {driver.phone}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button 
                              onClick={assignDriver}
                              disabled={!selectedDriver}
                              className="w-full bg-[#FFD700] text-black hover:bg-[#E5C100]"
                            >
                              Assign
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}

                    {booking.booking_status === "assigned" && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-zinc-700 text-white hover:bg-zinc-800"
                        onClick={() => updateStatus(booking.booking_id, "in_progress")}
                      >
                        Start Trip
                      </Button>
                    )}

                    {booking.booking_status === "in_progress" && (
                      <Button 
                        size="sm" 
                        className="bg-[#10B981] text-white hover:bg-[#059669]"
                        onClick={() => updateStatus(booking.booking_id, "completed")}
                      >
                        <CheckCircle2 size={16} className="mr-1" /> Complete Trip
                      </Button>
                    )}

                    {booking.pending_amount > 0 && booking.payment_status !== "paid" && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-zinc-700 text-white hover:bg-zinc-800"
                        onClick={() => markPaid(booking.booking_id)}
                      >
                        Mark as Paid
                      </Button>
                    )}

                    {["pending", "confirmed"].includes(booking.booking_status) && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-red-500/50 text-red-500 hover:bg-red-500/10"
                        onClick={() => updateStatus(booking.booking_id, "cancelled")}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}

              {filteredBookings.length === 0 && (
                <div className="card-dark p-12 text-center">
                  <p className="text-zinc-500">No bookings found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
