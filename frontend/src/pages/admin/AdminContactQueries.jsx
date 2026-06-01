import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { API } from "@/apiConfig";
import { AdminSidebar, AdminHeader } from "./AdminDashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Trash2, Search, Mail, Phone, MessageSquare, CheckCircle, Clock } from "lucide-react";
import { format } from "date-fns";

export default function AdminContactQueries() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`${API}/admin/contact`, { withCredentials: true });
      setMessages(res.data);
    } catch (e) {
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const markAsRead = async (id) => {
    try {
      await axios.put(`${API}/admin/contact/${id}/read`, {}, { withCredentials: true });
      toast.success("Marked as read");
      fetchMessages();
    } catch (e) {
      toast.error("Failed to update status");
    }
  };

  const deleteMessage = async (id) => {
    if (!window.confirm("Delete this message?")) return;
    try {
      await axios.delete(`${API}/admin/contact/${id}`, { withCredentials: true });
      toast.success("Message deleted");
      fetchMessages();
    } catch (e) {
      toast.error("Failed to delete");
    }
  };

  const filteredMessages = messages.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.subject && m.subject.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-primary">
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="lg:ml-64">
        <AdminHeader title="Contact Queries" setIsOpen={setSidebarOpen} />
        <div className="p-6">
          
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input 
                placeholder="Search name, email, subject..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary border-border"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><div className="loader" /></div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredMessages.map((msg) => (
                <motion.div 
                  key={msg.message_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`card-dark p-6 border-l-4 ${msg.is_read ? 'border-l-zinc-700' : 'border-l-[#FFD700]'}`}
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-foreground text-lg">{msg.name}</h3>
                        {!msg.is_read && <span className="bg-[#FFD700] text-black text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">New</span>}
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                        <a href={`mailto:${msg.email}`} className="flex items-center gap-1.5 hover:text-[#FFD700]">
                          <Mail size={14} /> {msg.email}
                        </a>
                        {msg.phone && (
                          <a href={`tel:${msg.phone}`} className="flex items-center gap-1.5 hover:text-[#FFD700]">
                            <Phone size={14} /> {msg.phone}
                          </a>
                        )}
                        <span className="flex items-center gap-1.5">
                          <Clock size={14} /> {format(new Date(msg.created_at), "MMM dd, hh:mm a")}
                        </span>
                      </div>
                      <div className="bg-background/40 rounded-lg p-4 border border-border/50">
                        <div className="text-[#FFD700] text-xs font-bold uppercase tracking-widest mb-1.5">Subject: {msg.subject || "No Subject"}</div>
                        <div className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
                          {msg.message}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex md:flex-col gap-2 shrink-0">
                      {!msg.is_read && (
                        <Button 
                          onClick={() => markAsRead(msg.message_id)}
                          className="bg-[#FFD700] text-black hover:bg-[#E5C100] h-9"
                        >
                          <CheckCircle size={16} className="mr-2" /> Mark Read
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        onClick={() => deleteMessage(msg.message_id)}
                        className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 h-9"
                      >
                        <Trash2 size={16} className="mr-2" /> Delete
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
              {filteredMessages.length === 0 && (
                <div className="bg-secondary border border-border rounded-xl p-16 text-center">
                  <MessageSquare size={48} className="text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">No queries found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
