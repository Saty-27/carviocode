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
import { Car, Users, Briefcase, Plus, Edit2, Trash2 } from "lucide-react";

export default function AdminFleet() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [fleet, setFleet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [formData, setFormData] = useState({
    name: "", image: "", passengers: 4, luggage: 2, description: "",
    base_price: 0, price_per_km: 0, rental_4hr: 0, rental_8hr: 0,
    extra_hour: 0, extra_km: 0, outstation_per_km: 0, night_allowance: 300, driver_allowance: 500
  });

  useEffect(() => {
    fetchFleet();
  }, []);

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

  const handleSubmit = async () => {
    if (!formData.name || !formData.image) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      if (editingCar) {
        await axios.put(`${API}/admin/fleet/${editingCar.car_id}`, formData, { withCredentials: true });
        toast.success("Vehicle updated successfully");
      } else {
        await axios.post(`${API}/admin/fleet`, formData, { withCredentials: true });
        toast.success("Vehicle added successfully");
      }
      
      setDialogOpen(false);
      setEditingCar(null);
      resetForm();
      fetchFleet();
    } catch (error) {
      toast.error("Failed to save vehicle");
    }
  };

  const deleteCar = async (carId) => {
    if (!window.confirm("Are you sure you want to delete this vehicle?")) return;
    
    try {
      await axios.delete(`${API}/admin/fleet/${carId}`, { withCredentials: true });
      setFleet(prev => prev.filter(c => c.car_id !== carId));
      toast.success("Vehicle deleted");
    } catch (error) {
      toast.error("Failed to delete vehicle");
    }
  };

  const openEditDialog = (car) => {
    setEditingCar(car);
    setFormData({
      name: car.name, image: car.image, passengers: car.passengers, luggage: car.luggage,
      description: car.description, base_price: car.base_price, price_per_km: car.price_per_km,
      rental_4hr: car.rental_4hr, rental_8hr: car.rental_8hr, extra_hour: car.extra_hour,
      extra_km: car.extra_km, outstation_per_km: car.outstation_per_km,
      night_allowance: car.night_allowance, driver_allowance: car.driver_allowance
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "", image: "", passengers: 4, luggage: 2, description: "",
      base_price: 0, price_per_km: 0, rental_4hr: 0, rental_8hr: 0,
      extra_hour: 0, extra_km: 0, outstation_per_km: 0, night_allowance: 300, driver_allowance: 500
    });
  };

  return (
    <div className="min-h-screen bg-[#050505]">
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <main className="lg:ml-64">
        <AdminHeader title="Fleet Management" setIsOpen={setSidebarOpen} />
        
        <div className="p-6" data-testid="admin-fleet">
          {/* Add Vehicle Button */}
          <div className="flex justify-end mb-6">
            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) { setEditingCar(null); resetForm(); }
            }}>
              <DialogTrigger asChild>
                <Button className="bg-[#FFD700] text-black hover:bg-[#E5C100]" data-testid="add-vehicle-btn">
                  <Plus size={18} className="mr-2" /> Add Vehicle
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#121212] border-zinc-800 max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-white">{editingCar ? "Edit Vehicle" : "Add New Vehicle"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-zinc-400">Name *</Label>
                      <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="bg-[#0A0A0A] border-zinc-800 mt-1" />
                    </div>
                    <div>
                      <Label className="text-zinc-400">Image URL *</Label>
                      <Input value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} className="bg-[#0A0A0A] border-zinc-800 mt-1" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-zinc-400">Passengers</Label>
                      <Input type="number" value={formData.passengers} onChange={(e) => setFormData({ ...formData, passengers: parseInt(e.target.value) })} className="bg-[#0A0A0A] border-zinc-800 mt-1" />
                    </div>
                    <div>
                      <Label className="text-zinc-400">Luggage</Label>
                      <Input type="number" value={formData.luggage} onChange={(e) => setFormData({ ...formData, luggage: parseInt(e.target.value) })} className="bg-[#0A0A0A] border-zinc-800 mt-1" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-zinc-400">Description</Label>
                    <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="bg-[#0A0A0A] border-zinc-800 mt-1" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-zinc-400">Base Price</Label>
                      <Input type="number" value={formData.base_price} onChange={(e) => setFormData({ ...formData, base_price: parseFloat(e.target.value) })} className="bg-[#0A0A0A] border-zinc-800 mt-1" />
                    </div>
                    <div>
                      <Label className="text-zinc-400">Price/km</Label>
                      <Input type="number" value={formData.price_per_km} onChange={(e) => setFormData({ ...formData, price_per_km: parseFloat(e.target.value) })} className="bg-[#0A0A0A] border-zinc-800 mt-1" />
                    </div>
                    <div>
                      <Label className="text-zinc-400">Outstation/km</Label>
                      <Input type="number" value={formData.outstation_per_km} onChange={(e) => setFormData({ ...formData, outstation_per_km: parseFloat(e.target.value) })} className="bg-[#0A0A0A] border-zinc-800 mt-1" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-zinc-400">4hr Rental</Label>
                      <Input type="number" value={formData.rental_4hr} onChange={(e) => setFormData({ ...formData, rental_4hr: parseFloat(e.target.value) })} className="bg-[#0A0A0A] border-zinc-800 mt-1" />
                    </div>
                    <div>
                      <Label className="text-zinc-400">8hr Rental</Label>
                      <Input type="number" value={formData.rental_8hr} onChange={(e) => setFormData({ ...formData, rental_8hr: parseFloat(e.target.value) })} className="bg-[#0A0A0A] border-zinc-800 mt-1" />
                    </div>
                  </div>
                  <Button onClick={handleSubmit} className="w-full bg-[#FFD700] text-black hover:bg-[#E5C100]">
                    {editingCar ? "Update Vehicle" : "Add Vehicle"}
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
              {fleet.map((car, index) => (
                <motion.div
                  key={car.car_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="card-dark overflow-hidden"
                >
                  <div className="aspect-video bg-zinc-900">
                    <img src={car.image} alt={car.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4">
                    <h3 className="text-white font-semibold mb-2">{car.name}</h3>
                    <div className="flex items-center gap-4 text-zinc-500 text-sm mb-3">
                      <span className="flex items-center gap-1"><Users size={14} /> {car.passengers}</span>
                      <span className="flex items-center gap-1"><Briefcase size={14} /> {car.luggage}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mb-4">
                      <span className="text-zinc-500">Per km</span>
                      <span className="text-[#FFD700] font-semibold">₹{car.price_per_km}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEditDialog(car)} className="flex-1 border-zinc-700 text-white hover:bg-zinc-800">
                        <Edit2 size={14} className="mr-1" /> Edit
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => deleteCar(car.car_id)} className="border-red-500/50 text-red-500 hover:bg-red-500/10">
                        <Trash2 size={14} />
                      </Button>
                    </div>
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
