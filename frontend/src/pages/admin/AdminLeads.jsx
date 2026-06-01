import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { API } from "@/apiConfig";
import { AdminSidebar, AdminHeader } from "./AdminDashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Trash2, Search, Mail, Phone, Calendar, MapPin, Car, MessageSquare, Download, Filter } from "lucide-react";
import { format } from "date-fns";

export default function AdminLeads() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const fetchLeads = async () => {
    try {
      const res = await axios.get(`${API}/admin/leads`, { withCredentials: true });
      setLeads(res.data);
    } catch (e) {
      toast.error("Failed to load leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const deleteLead = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) return;
    try {
      await axios.delete(`${API}/admin/leads/${id}`, { withCredentials: true });
      toast.success("Lead deleted");
      fetchLeads();
    } catch (e) {
      toast.error("Failed to delete lead");
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery);
    
    const matchesDate = !dateFilter || lead.pickup_date === dateFilter;
    
    return matchesSearch && matchesDate;
  });

  const exportToCSV = () => {
    const headers = ["Name", "Email", "Phone", "Pickup", "Drop", "Date", "Time", "Type", "Car", "Message", "Submitted At"];
    const rows = filteredLeads.map(l => [
      l.name, l.email, l.phone, l.pickup_location, l.drop_location, 
      l.pickup_date, l.pickup_time, l.trip_type, l.car_preference, 
      l.message || "", l.created_at
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(r => r.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `carvio_leads_${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-primary">
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="lg:ml-64">
        <AdminHeader title="Quick Booking Leads" setIsOpen={setSidebarOpen} />
        <div className="p-6">
          
          {/* Filters & Actions */}
          <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
            <div className="flex flex-1 gap-4 w-full">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input 
                  placeholder="Search name, email, phone..." 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-secondary border-border"
                />
              </div>
              <div className="relative w-48">
                <Input 
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="bg-secondary border-border"
                />
              </div>
            </div>
            <Button onClick={exportToCSV} variant="outline" className="border-border hover:bg-secondary">
              <Download size={16} className="mr-2" /> Export CSV
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><div className="loader" /></div>
          ) : (
            <div className="bg-secondary border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-background/50 border-b border-border">
                    <tr>
                      <th className="p-4 font-semibold text-sm">Customer</th>
                      <th className="p-4 font-semibold text-sm">Trip Details</th>
                      <th className="p-4 font-semibold text-sm">Schedule</th>
                      <th className="p-4 font-semibold text-sm">Message</th>
                      <th className="p-4 font-semibold text-sm text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredLeads.map((lead) => (
                      <tr key={lead.lead_id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4">
                          <div className="font-medium text-foreground">{lead.name}</div>
                          <div className="flex flex-col gap-1 mt-1">
                            <a href={`mailto:${lead.email}`} className="text-xs text-muted-foreground hover:text-[#FFD700] flex items-center gap-1">
                              <Mail size={12} /> {lead.email}
                            </a>
                            <a href={`tel:${lead.phone}`} className="text-xs text-muted-foreground hover:text-[#FFD700] flex items-center gap-1">
                              <Phone size={12} /> {lead.phone}
                            </a>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-start gap-2 text-sm text-foreground">
                            <MapPin size={14} className="text-[#FFD700] mt-1 shrink-0" />
                            <div>
                              <div className="line-clamp-1"><span className="text-muted-foreground text-xs uppercase font-bold mr-1">From:</span> {lead.pickup_location}</div>
                              <div className="line-clamp-1"><span className="text-muted-foreground text-xs uppercase font-bold mr-1">To:</span> {lead.drop_location}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded flex items-center gap-1">
                              <Car size={10} /> {lead.car_preference}
                            </span>
                            <span className="text-xs bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded">
                              {lead.trip_type === "one_way" ? "One Way" : "Round Trip"}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-foreground flex items-center gap-2">
                            <Calendar size={14} className="text-[#FFD700]" />
                            {lead.pickup_date}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">at {lead.pickup_time}</div>
                          <div className="text-[10px] text-muted-foreground/50 mt-2">
                            Submitted: {format(new Date(lead.created_at), "MMM dd, hh:mm a")}
                          </div>
                        </td>
                        <td className="p-4 max-w-xs">
                          {lead.message ? (
                            <div className="text-sm text-muted-foreground italic flex items-start gap-2">
                              <MessageSquare size={14} className="shrink-0 mt-1" />
                              <span className="line-clamp-2">"{lead.message}"</span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground/30 italic">No message</span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => deleteLead(lead.lead_id)}
                            className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredLeads.length === 0 && (
                <div className="p-12 text-center text-muted-foreground">
                  No leads found matching your criteria.
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
