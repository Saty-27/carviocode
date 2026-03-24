import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { API, useAuth } from "@/App";
import { Button } from "@/components/ui/button";
import { 
  Car, Calendar, Users, CreditCard, TrendingUp, Clock,
  ChevronRight, Menu, X, Home, MapPin, User, LogOut
} from "lucide-react";

const LOGO_URL = "https://customer-assets.emergentagent.com/job_1a245343-e48a-4d95-b813-d4323c66be82/artifacts/ceogvz6u_WhatsApp%20Image%202026-02-01%20at%2014.34.50.jpeg";

// Admin Sidebar Component
export const AdminSidebar = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { icon: Home, label: "Dashboard", path: "/admin" },
    { icon: Calendar, label: "Bookings", path: "/admin/bookings" },
    { icon: Users, label: "Drivers", path: "/admin/drivers" },
    { icon: Car, label: "Fleet", path: "/admin/fleet" },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-[#0A0A0A] border-r border-zinc-800 z-50
        transform transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-zinc-800">
            <Link to="/" className="flex items-center gap-3">
              <img src={LOGO_URL} alt="Carvio Cabs" className="h-10 w-10 rounded-full" />
              <span className="text-lg font-bold text-white">Carvio Admin</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link 
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                    data-testid={`nav-${item.label.toLowerCase()}`}
                  >
                    <item.icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* User */}
          <div className="p-4 border-t border-zinc-800">
            <div className="flex items-center gap-3 px-4 py-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-[#FFD700]/10 flex items-center justify-center">
                <User className="text-[#FFD700]" size={18} />
              </div>
              <div>
                <p className="text-white text-sm font-medium">{user?.name}</p>
                <p className="text-zinc-500 text-xs">Admin</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-zinc-400 hover:text-white hover:bg-zinc-800"
              onClick={logout}
              data-testid="admin-logout-btn"
            >
              <LogOut size={18} className="mr-2" /> Logout
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};

// Admin Header Component
export const AdminHeader = ({ title, setIsOpen }) => {
  return (
    <header className="sticky top-0 z-30 bg-[#050505]/80 backdrop-blur-xl border-b border-zinc-800">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <button 
            className="lg:hidden text-white p-2"
            onClick={() => setIsOpen(true)}
            data-testid="admin-menu-btn"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-xl font-bold text-white">{title}</h1>
        </div>
        <Link to="/">
          <Button variant="outline" size="sm" className="border-zinc-700 text-white hover:bg-zinc-800">
            View Site
          </Button>
        </Link>
      </div>
    </header>
  );
};

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, bookingsRes] = await Promise.all([
          axios.get(`${API}/admin/stats`, { withCredentials: true }),
          axios.get(`${API}/admin/bookings`, { withCredentials: true })
        ]);
        setStats(statsRes.data);
        setRecentBookings(bookingsRes.data.slice(0, 5));
      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = stats ? [
    { icon: Calendar, label: "Today's Bookings", value: stats.today_bookings, color: "#FFD700" },
    { icon: TrendingUp, label: "Today's Revenue", value: `₹${stats.today_revenue}`, color: "#10B981" },
    { icon: CreditCard, label: "Pending Payments", value: stats.pending_payments, color: "#EAB308" },
    { icon: Car, label: "Active Trips", value: stats.active_trips, color: "#3B82F6" },
    { icon: Users, label: "Available Drivers", value: stats.available_drivers, color: "#8B5CF6" },
    { icon: Clock, label: "Total Bookings", value: stats.total_bookings, color: "#EC4899" },
  ] : [];

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

  return (
    <div className="min-h-screen bg-[#050505]">
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <main className="lg:ml-64">
        <AdminHeader title="Dashboard" setIsOpen={setSidebarOpen} />
        
        <div className="p-6" data-testid="admin-dashboard">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="loader" />
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {statCards.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="card-dark p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${stat.color}20` }}
                      >
                        <stat.icon style={{ color: stat.color }} size={24} />
                      </div>
                    </div>
                    <p className="text-zinc-500 text-sm mb-1">{stat.label}</p>
                    <p className="text-white text-2xl font-bold">{stat.value}</p>
                  </motion.div>
                ))}
              </div>

              {/* Recent Bookings */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="card-dark"
              >
                <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                  <h2 className="text-lg font-semibold text-white">Recent Bookings</h2>
                  <Link to="/admin/bookings">
                    <Button variant="ghost" size="sm" className="text-[#FFD700] hover:text-[#E5C100]">
                      View All <ChevronRight size={16} />
                    </Button>
                  </Link>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full admin-table">
                    <thead>
                      <tr>
                        <th className="text-left p-4">Booking ID</th>
                        <th className="text-left p-4">Customer</th>
                        <th className="text-left p-4">Vehicle</th>
                        <th className="text-left p-4">Date</th>
                        <th className="text-left p-4">Amount</th>
                        <th className="text-left p-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentBookings.map((booking) => (
                        <tr key={booking.booking_id}>
                          <td className="p-4 text-white font-medium">{booking.booking_id}</td>
                          <td className="p-4 text-zinc-400">{booking.user_id}</td>
                          <td className="p-4 text-zinc-400">{booking.car_name}</td>
                          <td className="p-4 text-zinc-400">{booking.pickup_date}</td>
                          <td className="p-4 text-[#FFD700]">₹{booking.total_fare}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(booking.booking_status)}`}>
                              {booking.booking_status.replace("_", " ")}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
