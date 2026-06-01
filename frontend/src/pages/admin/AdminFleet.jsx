import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { API } from "@/apiConfig";
import { resolveImageUrl } from "@/utils/imageUrl";
import { AdminSidebar, AdminHeader } from "./AdminDashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Car, Users, Briefcase, Plus, Edit2, Trash2, Upload, Link2, X, Loader2 } from "lucide-react";

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

  const [imageMode, setImageMode] = useState("upload"); // "upload" | "url"
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
    if (!allowed.includes(file.type)) {
      toast.error("Only JPEG, PNG, WebP, GIF, AVIF files are allowed.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large. Max 10MB.");
      return;
    }
    setUploadFile(file);
    setUploadPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      toast.error("Please enter a vehicle name");
      return;
    }

    let finalImageUrl = formData.image;

    if (imageMode === "upload") {
      if (uploadFile) {
        setUploading(true);
        try {
          const uploadData = new FormData();
          uploadData.append("file", uploadFile);
          console.log("[AdminFleet] Uploading local file to:", `${API}/admin/upload-image`);
          const uploadRes = await axios.post(`${API}/admin/upload-image`, uploadData, {
            withCredentials: true,
            headers: { "Content-Type": "multipart/form-data" }
          });
          finalImageUrl = uploadRes.data.url;
          console.log("[AdminFleet] Upload success:", finalImageUrl);
        } catch (error) {
          console.error("Error uploading image:", error);
          toast.error("Failed to upload image");
          setUploading(false);
          return;
        } finally {
          setUploading(false);
        }
      } else if (!finalImageUrl) {
        toast.error("Please select an image file to upload");
        return;
      }
    } else {
      if (!formData.image) {
        toast.error("Please enter an image URL");
        return;
      }
      finalImageUrl = formData.image;
    }

    const payload = {
      ...formData,
      image: finalImageUrl
    };

    try {
      if (editingCar) {
        await axios.put(`${API}/admin/fleet/${editingCar.car_id}`, payload, { withCredentials: true });
        toast.success("Vehicle updated successfully");
      } else {
        await axios.post(`${API}/admin/fleet`, payload, { withCredentials: true });
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
    
    const isUpload = car.image && !car.image.startsWith("http");
    setImageMode(isUpload ? "upload" : "url");
    if (isUpload) {
      setUploadPreview(resolveImageUrl(car.image));
    } else {
      setUploadPreview("");
    }
    setUploadFile(null);
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "", image: "", passengers: 4, luggage: 2, description: "",
      base_price: 0, price_per_km: 0, rental_4hr: 0, rental_8hr: 0,
      extra_hour: 0, extra_km: 0, outstation_per_km: 0, night_allowance: 300, driver_allowance: 500
    });
    setUploadFile(null);
    setUploadPreview("");
    setImageMode("upload");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-primary">
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
              <DialogContent className="bg-secondary border-border max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-foreground">{editingCar ? "Edit Vehicle" : "Add New Vehicle"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Name *</Label>
                      <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="bg-background border-border text-foreground mt-1" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label className="text-muted-foreground">Vehicle Image *</Label>
                      
                      {/* Image Input Mode Toggle */}
                      <div className="flex rounded-lg overflow-hidden border border-border h-9">
                        <button
                          type="button"
                          onClick={() => setImageMode("upload")}
                          className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-medium transition-all ${imageMode === "upload" ? "bg-[#FFD700] text-black" : "text-muted-foreground hover:text-foreground bg-background/50"}`}
                        >
                          <Upload size={14} /> Upload from PC
                        </button>
                        <button
                          type="button"
                          onClick={() => setImageMode("url")}
                          className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-medium transition-all ${imageMode === "url" ? "bg-[#FFD700] text-black" : "text-muted-foreground hover:text-foreground bg-background/50"}`}
                        >
                          <Link2 size={14} /> Paste URL
                        </button>
                      </div>

                      {imageMode === "upload" ? (
                        <div className="mt-1">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                            className="hidden"
                            onChange={handleFileChange}
                          />
                          {uploadPreview ? (
                            <div className="relative rounded-lg overflow-hidden border border-border bg-background/50 h-28 flex items-center justify-center">
                              <img src={uploadPreview} alt="Preview" className="w-full h-full object-contain" />
                              <button
                                type="button"
                                onClick={() => { setUploadFile(null); setUploadPreview(""); if (fileInputRef.current) fileInputRef.current.value = ""; setFormData({ ...formData, image: "" }); }}
                                className="absolute top-1 right-1 w-6 h-6 bg-black/70 rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors"
                              >
                                <X size={12} />
                              </button>
                              {uploadFile && (
                                <div className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded truncate max-w-[80%]">
                                  {uploadFile.name}
                                </div>
                              )}
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="w-full h-28 rounded-lg border-2 border-dashed border-border hover:border-[#FFD700] transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground bg-background/30"
                            >
                              <Upload size={24} />
                              <div className="text-center">
                                <p className="text-xs font-medium">Click to select image</p>
                                <p className="text-[10px] text-muted-foreground/60 mt-0.5">JPEG, PNG, WebP, GIF</p>
                              </div>
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="mt-1">
                          <Input
                            placeholder="https://example.com/vehicle.jpg"
                            value={formData.image}
                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                            className="bg-background border-border text-foreground"
                          />
                          {formData.image && (
                            <div className="mt-2 h-20 rounded-md overflow-hidden border border-border bg-background/50">
                              <img 
                                src={resolveImageUrl(formData.image)} 
                                alt="URL preview" 
                                className="w-full h-full object-contain"
                                onError={(e) => { e.target.style.display = "none"; }}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Passengers</Label>
                      <Input type="number" value={formData.passengers} onChange={(e) => setFormData({ ...formData, passengers: parseInt(e.target.value) })} className="bg-background border-border text-foreground mt-1" />
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Luggage</Label>
                      <Input type="number" value={formData.luggage} onChange={(e) => setFormData({ ...formData, luggage: parseInt(e.target.value) })} className="bg-background border-border text-foreground mt-1" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Description</Label>
                    <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="bg-background border-border text-foreground mt-1" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Base Price</Label>
                      <Input type="number" value={formData.base_price} onChange={(e) => setFormData({ ...formData, base_price: parseFloat(e.target.value) })} className="bg-background border-border text-foreground mt-1" />
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Price/km</Label>
                      <Input type="number" value={formData.price_per_km} onChange={(e) => setFormData({ ...formData, price_per_km: parseFloat(e.target.value) })} className="bg-background border-border text-foreground mt-1" />
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Outstation/km</Label>
                      <Input type="number" value={formData.outstation_per_km} onChange={(e) => setFormData({ ...formData, outstation_per_km: parseFloat(e.target.value) })} className="bg-background border-border text-foreground mt-1" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">4hr Rental</Label>
                      <Input type="number" value={formData.rental_4hr} onChange={(e) => setFormData({ ...formData, rental_4hr: parseFloat(e.target.value) })} className="bg-background border-border text-foreground mt-1" />
                    </div>
                    <div>
                      <Label className="text-muted-foreground">8hr Rental</Label>
                      <Input type="number" value={formData.rental_8hr} onChange={(e) => setFormData({ ...formData, rental_8hr: parseFloat(e.target.value) })} className="bg-background border-border text-foreground mt-1" />
                    </div>
                  </div>
                   <Button onClick={handleSubmit} disabled={uploading} className="w-full bg-[#FFD700] text-black hover:bg-[#E5C100]">
                    {uploading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 size={16} className="animate-spin" /> Uploading image...
                      </span>
                    ) : (
                      editingCar ? "Update Vehicle" : "Add Vehicle"
                    )}
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
                  className="card-dark overflow-hidden bg-secondary"
                >
                  <div className="aspect-video bg-background">
                    <img src={resolveImageUrl(car.image)} alt={car.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4">
                    <h3 className="text-foreground font-semibold mb-2">{car.name}</h3>
                    <div className="flex items-center gap-4 text-muted-foreground text-sm mb-3">
                      <span className="flex items-center gap-1"><Users size={14} /> {car.passengers}</span>
                      <span className="flex items-center gap-1"><Briefcase size={14} /> {car.luggage}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mb-4">
                      <span className="text-muted-foreground">Per km</span>
                      <span className="text-[#FFD700] font-semibold">₹{car.price_per_km}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEditDialog(car)} className="flex-1 border-border text-foreground hover:bg-background">
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
