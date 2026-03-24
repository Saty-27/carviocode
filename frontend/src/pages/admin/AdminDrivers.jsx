import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { API } from "@/App";
import { AdminSidebar, AdminHeader } from "./AdminDashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { User, Phone, Mail, Plus, Edit2, Trash2 } from "lucide-react";

export default function AdminDrivers() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [formData, setFormData] = useState({
    name: "", phone: "", email: "", license_number: "", is_available: true
  });

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const response = await axios.get(`${API}/admin/drivers`, { withCredentials: true });
      setDrivers(response.data);
    } catch (error) {
      console.error("Error fetching drivers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.phone || !formData.email || !formData.license_number) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      if (editingDriver) {
        await axios.put(`${API}/admin/drivers/${editingDriver.driver_id}`, formData, { withCredentials: true });
        toast.success("Driver updated successfully");
      } else {
        await axios.post(`${API}/admin/drivers`, formData, { withCredentials: true });
        toast.success("Driver added successfully");
      }
      
      setDialogOpen(false);
      setEditingDriver(null);
      setFormData({ name: "", phone: "", email: "", license_number: "", is_available: true });
      fetchDrivers();
    } catch (error) {
      toast.error("Failed to save driver");
    }
  };

  const deleteDriver = async (driverId) => {
    if (!window.confirm("Are you sure you want to delete this driver?")) return;
    
    try {
      await axios.delete(`${API}/admin/drivers/${driverId}`, { withCredentials: true });
      setDrivers(prev => prev.filter(d => d.driver_id !== driverId));
      toast.success("Driver deleted");
    } catch (error) {
      toast.error("Failed to delete driver");
    }
  };

  const openEditDialog = (driver) => {
    setEditingDriver(driver);
    setFormData({
      name: driver.name,
      phone: driver.phone,
      email: driver.email,
      license_number: driver.license_number,
      is_available: driver.is_available
    });
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#050505]">
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <main className="lg:ml-64">
        <AdminHeader title="Drivers" setIsOpen={setSidebarOpen} />
        
        <div className="p-6" data-testid="admin-drivers">
          {/* Add Driver Button */}
          <div className="flex justify-end mb-6">
            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) {
                setEditingDriver(null);
                setFormData({ name: "", phone: "", email: "", license_number: "", is_available: true });
              }
            }}>
              <DialogTrigger asChild>
                <Button className="bg-[#FFD700] text-black hover:bg-[#E5C100]" data-testid="add-driver-btn">
                  <Plus size={18} className="mr-2" /> Add Driver
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#121212] border-zinc-800">
                <DialogHeader>
                  <DialogTitle className="text-white">{editingDriver ? "Edit Driver" : "Add New Driver"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label className="text-zinc-400">Name *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Driver name"
                      className="bg-[#0A0A0A] border-zinc-800 mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-zinc-400">Phone *</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Phone number"
                      className="bg-[#0A0A0A] border-zinc-800 mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-zinc-400">Email *</Label>
                    <Input
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Email address"
                      className="bg-[#0A0A0A] border-zinc-800 mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-zinc-400">License Number *</Label>
                    <Input
                      value={formData.license_number}
                      onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                      placeholder="License number"
                      className="bg-[#0A0A0A] border-zinc-800 mt-1"
                    />
                  </div>
                  <Button onClick={handleSubmit} className="w-full bg-[#FFD700] text-black hover:bg-[#E5C100]">
                    {editingDriver ? "Update Driver" : "Add Driver"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="loader" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {drivers.map((driver, index) => (
                <motion.div
                  key={driver.driver_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="card-dark p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[#FFD700]/10 flex items-center justify-center">
                        <User className="text-[#FFD700]" size={24} />
                      </div>
                      <div>
                        <p className="text-white font-semibold">{driver.name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          driver.is_available ? "bg-[#10B981]/10 text-[#10B981]" : "bg-zinc-800 text-zinc-500"
                        }`}>
                          {driver.is_available ? "Available" : "Busy"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-zinc-400 text-sm">
                      <Phone size={14} /> {driver.phone}
                    </div>
                    <div className="flex items-center gap-2 text-zinc-400 text-sm">
                      <Mail size={14} /> {driver.email}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-zinc-800">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(driver)}
                      className="flex-1 border-zinc-700 text-white hover:bg-zinc-800"
                    >
                      <Edit2 size={14} className="mr-1" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteDriver(driver.driver_id)}
                      className="border-red-500/50 text-red-500 hover:bg-red-500/10"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
