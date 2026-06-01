import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { API } from "@/apiConfig";
import { AdminSidebar, AdminHeader } from "./AdminDashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Users, Search, Trash2, Mail, Phone, Calendar, Briefcase, Chrome } from "lucide-react";

export default function AdminUsers() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterMethod, setFilterMethod] = useState("all");

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API}/admin/users`, { withCredentials: true });
      setUsers(res.data);
    } catch (e) {
      console.error("[AdminUsers] fetch error:", e);
      toast.error("Failed to load users");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (userId, name) => {
    if (!window.confirm(`Delete user "${name}"? This doesn't delete their bookings.`)) return;
    try {
      await axios.delete(`${API}/admin/users/${userId}`, { withCredentials: true });
      toast.success("User deleted");
      setUsers(p => p.filter(u => u.user_id !== userId));
    } catch (e) { toast.error(e?.response?.data?.detail || "Failed to delete"); }
  };

  const filtered = users.filter(u => {
    const matchSearch = !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    const matchMethod = filterMethod === "all" || u.login_method === filterMethod;
    return matchSearch && matchMethod;
  });

  const googleCount = users.filter(u => u.login_method === "google").length;
  const emailCount = users.filter(u => u.login_method === "email").length;

  return (
    <div className="min-h-screen bg-primary">
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="lg:ml-64">
        <AdminHeader title="Users" setIsOpen={setSidebarOpen} />
        <div className="p-6">

          {/* Stats row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[
              { label: "Total Users", value: users.length, color: "#FFD700" },
              { label: "Google Login", value: googleCount, color: "#4285F4", icon: "G" },
              { label: "Email/Password", value: "#10B981", icon: "✉" },
            ].map(s => (
              <div key={s.label} className="bg-secondary border border-border rounded-xl p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold" style={{ backgroundColor: `${s.color}20`, color: s.color }}>
                  {s.icon || users.length}
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">{s.label}</p>
                  <p className="text-foreground text-2xl font-bold">{s.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-5">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)}
                className="pl-9 bg-secondary border-border text-foreground" />
            </div>
            <div className="flex gap-2">
              {[["all","All"], ["google","Google"], ["email","Email"]].map(([val, label]) => (
                <button key={val} onClick={() => setFilterMethod(val)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterMethod === val ? "bg-[#FFD700] text-black" : "bg-background text-muted-foreground hover:text-foreground"}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><div className="loader" /></div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border bg-secondary">
              <table className="w-full">
                <thead className="bg-secondary border-b border-border">
                  <tr>
                    <th className="text-left p-4 text-muted-foreground text-sm font-medium">User</th>
                    <th className="text-left p-4 text-muted-foreground text-sm font-medium">Login Method</th>
                    <th className="text-left p-4 text-muted-foreground text-sm font-medium">Phone</th>
                    <th className="text-left p-4 text-muted-foreground text-sm font-medium">Bookings</th>
                    <th className="text-left p-4 text-muted-foreground text-sm font-medium">Joined</th>
                    <th className="text-left p-4 text-muted-foreground text-sm font-medium">Role</th>
                    <th className="text-right p-4 text-muted-foreground text-sm font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u, i) => (
                    <motion.tr key={u.user_id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                      className="border-b border-border/50 hover:bg-background/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {u.picture ? (
                            <img src={u.picture} alt={u.name} className="w-9 h-9 rounded-full object-cover" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-[#FFD700]/10 flex items-center justify-center text-[#FFD700] font-bold text-sm">
                              {u.name?.[0]?.toUpperCase() || "?"}
                            </div>
                          )}
                          <div>
                            <p className="text-foreground font-medium text-sm">{u.name}</p>
                            <p className="text-muted-foreground text-xs flex items-center gap-1"><Mail size={10} /> {u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        {u.login_method === "google" ? (
                          <span className="flex items-center gap-1.5 bg-blue-500/10 text-blue-400 text-xs font-medium px-2.5 py-1 rounded-full w-fit">
                            <Chrome size={11} /> Google
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 bg-green-500/10 text-green-400 text-xs font-medium px-2.5 py-1 rounded-full w-fit">
                            <Mail size={11} /> Email
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-muted-foreground text-sm">{u.phone || "—"}</td>
                      <td className="p-4">
                        <span className="flex items-center gap-1 text-[#FFD700] text-sm font-semibold">
                          <Briefcase size={12} /> {u.booking_count || 0}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground text-xs">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                      </td>
                      <td className="p-4">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${u.role === "admin" ? "bg-[#FFD700]/10 text-[#FFD700]" : "bg-background text-muted-foreground"}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {u.role !== "admin" && (
                          <Button size="sm" variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10 h-7 text-xs"
                            onClick={() => handleDelete(u.user_id, u.name)}>
                            <Trash2 size={12} />
                          </Button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="text-center py-16 text-muted-foreground">
                  <Users size={40} className="mx-auto mb-3 text-muted-foreground/30" />
                  <p>No users found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
