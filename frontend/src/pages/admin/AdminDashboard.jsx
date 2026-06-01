import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { API } from "@/apiConfig";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";
import { 
  Car, Calendar, Users, CreditCard, TrendingUp, Clock,
  ChevronRight, Menu, X, Home, MapPin, User, LogOut, Settings, FileText, Image, Package, HelpCircle
} from "lucide-react";

const LOGO_URL = "https://customer-assets.emergentagent.com/job_1a245343-e48a-4d95-b813-d4323c66be82/artifacts/ceogvz6u_WhatsApp%20Image%202026-02-01%20at%2014.34.50.jpeg";

// Admin Sidebar Component
export const AdminSidebar = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { icon: Home, label: "Dashboard", path: "/admin" },
    { icon: Calendar, label: "Bookings", path: "/admin/bookings" },
    { icon: Users, label: "Users", path: "/admin/users" },
    { icon: Car, label: "Drivers", path: "/admin/drivers" },
    { icon: Car, label: "Fleet", path: "/admin/fleet" },
    { icon: FileText, label: "Blog", path: "/admin/blog" },
    { icon: Image, label: "Media", path: "/admin/media" },
    { icon: Package, label: "Packages", path: "/admin/packages" },
    { icon: HelpCircle, label: "FAQ", path: "/admin/faq" },
    { icon: FileText, label: "Pages", path: "/admin/pages" },
    { icon: Settings, label: "Settings", path: "/admin/settings" },
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
        fixed top-0 left-0 h-full w-64 bg-secondary border-r border-border z-50
        transform transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `} style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-border" style={{ borderColor: 'var(--border-color)' }}>
            <Link to="/" className="flex items-center gap-3">
              <img src={LOGO_URL} alt="Carvio Cabs" className="h-10 w-10 rounded-full" />
              <span className="text-lg font-bold text-foreground">Carvio Admin</span>
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
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-card hover:text-foreground transition-colors"
                    style={{ backgroundColor: 'transparent' /* will be overridden by hover */ }}
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
          <div className="p-4 border-t border-border" style={{ borderColor: 'var(--border-color)' }}>
            <div className="flex items-center gap-3 px-4 py-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-[#FFD700]/10 flex items-center justify-center">
                <User className="text-[#FFD700]" size={18} />
              </div>
              <div>
                <p className="text-foreground text-sm font-medium">{user?.name}</p>
                <p className="text-muted-foreground text-xs">Admin</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-card"
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
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <button 
            className="lg:hidden text-foreground p-2"
            onClick={() => setIsOpen(true)}
            data-testid="admin-menu-btn"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-xl font-bold text-foreground">{title}</h1>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link to="/">
            <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-muted">
              View Site
            </Button>
          </Link>
        </div>
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
    { icon: TrendingUp, label: "Today's Revenue", value: `₹${stats.today_revenue?.toLocaleString("en-IN")}`, color: "#10B981" },
    { icon: CreditCard, label: "Total Revenue", value: `₹${stats.total_revenue?.toLocaleString("en-IN")}`, color: "#22D3EE", note: "All paid bookings" },
    { icon: Clock, label: "Pending Revenue", value: `₹${stats.pending_revenue?.toLocaleString("en-IN")}`, color: "#F59E0B", note: `${stats.cash_pending} cash rides awaiting` },
    { icon: Car, label: "Active Trips", value: stats.active_trips, color: "#3B82F6" },
    { icon: Users, label: "Available Drivers", value: stats.available_drivers, color: "#8B5CF6" },
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
    <div className="min-h-screen bg-primary">
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
                    className="bg-secondary border border-border rounded-xl p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${stat.color}20` }}
                      >
                        <stat.icon style={{ color: stat.color }} size={24} />
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm mb-1">{stat.label}</p>
                    <p className="text-foreground text-2xl font-bold">{stat.value}</p>
                    {stat.note && <p className="text-muted-foreground text-xs mt-1">{stat.note}</p>}
                  </motion.div>
                ))}
              </div>


              {/* Recent Bookings */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-secondary border border-border rounded-xl overflow-hidden"
              >
                <div className="flex items-center justify-between p-6 border-b border-border">
                  <h2 className="text-lg font-semibold text-foreground">Recent Bookings</h2>
                  <Link to="/admin/bookings">
                    <Button variant="ghost" size="sm" className="text-[#FFD700] hover:text-[#E5C100]">
                      View All <ChevronRight size={16} />
                    </Button>
                  </Link>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/50 border-b border-border">
                        <th className="text-left p-4 text-muted-foreground text-sm font-medium">Booking ID</th>
                        <th className="text-left p-4 text-muted-foreground text-sm font-medium">Customer</th>
                        <th className="text-left p-4 text-muted-foreground text-sm font-medium">Vehicle</th>
                        <th className="text-left p-4 text-muted-foreground text-sm font-medium">Date</th>
                        <th className="text-left p-4 text-muted-foreground text-sm font-medium">Amount</th>
                        <th className="text-left p-4 text-muted-foreground text-sm font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentBookings.map((booking) => (
                        <tr key={booking.booking_id} className="border-b border-border/50 hover:bg-background/50 transition-colors">
                          <td className="p-4 text-foreground font-medium">{booking.booking_id}</td>
                          <td className="p-4 text-muted-foreground">{booking.user_id}</td>
                          <td className="p-4 text-muted-foreground">{booking.car_name}</td>
                          <td className="p-4 text-muted-foreground">{booking.pickup_date}</td>
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
