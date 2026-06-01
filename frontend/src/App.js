import { useEffect, useState, createContext, useContext, useCallback, lazy, Suspense } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/context/ThemeContext";

// Pages
import HomePage from "@/pages/HomePage";
import FleetPage from "@/pages/FleetPage";
import FleetDetailPage from "@/pages/FleetDetailPage";
import BookingPage from "@/pages/BookingPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import DashboardPage from "@/pages/DashboardPage";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminBookings from "@/pages/admin/AdminBookings";
import AdminDrivers from "@/pages/admin/AdminDrivers";

import { AuthProvider, useAuth } from "@/context/AuthContext";

// Lazy loaded admin components
const AdminLeads = lazy(() => import("@/pages/admin/AdminLeads"));
const AdminContactQueries = lazy(() => import("@/pages/admin/AdminContactQueries"));
const AdminSettings = lazy(() => import("@/pages/admin/AdminSettings"));
const AdminFleet = lazy(() => import("@/pages/admin/AdminFleet"));

import AdminBlog from "@/pages/admin/AdminBlog";
import AdminMedia from "@/pages/admin/AdminMedia";
import AdminPackages from "@/pages/admin/AdminPackages";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminFAQ from "@/pages/admin/AdminFAQ";
import BlogPage from "@/pages/BlogPage";
import BlogDetailPage from "@/pages/BlogDetailPage";
import PrivacyPage from "@/pages/PrivacyPage";
import TermsPage from "@/pages/TermsPage";
import SitemapPage from "@/pages/SitemapPage";
import AboutPage from "@/pages/AboutPage";
import ServicesPage from "@/pages/ServicesPage";
import ContactPage from "@/pages/ContactPage";
import LocationPage from "@/pages/LocationPage";
import AuthCallback from "@/pages/AuthCallback";
import DynamicPage from "@/pages/DynamicPage";
import AdminPages from "@/pages/admin/AdminPages";
import { API } from "./apiConfig";
import { resolveImageUrl } from "@/utils/imageUrl";
import FloatingContactButtons from "@/components/FloatingContactButtons";


// Protected Route
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FFD700]"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// App Router Component
const AppRouter = () => {
  const location = useLocation();

  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }

  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050505] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FFD700]"></div></div>}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/fleet" element={<FleetPage />} />
        <Route path="/fleet/:carId" element={<FleetDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route 
          path="/book" 
          element={
            <ProtectedRoute>
              <BookingPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/bookings" 
          element={
            <ProtectedRoute adminOnly>
              <AdminBookings />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/leads" 
          element={
            <ProtectedRoute adminOnly>
              <AdminLeads />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/contact-queries" 
          element={
            <ProtectedRoute adminOnly>
              <AdminContactQueries />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/drivers" 
          element={
            <ProtectedRoute adminOnly>
              <AdminDrivers />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/fleet" 
          element={
            <ProtectedRoute adminOnly>
              <AdminFleet />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/settings" 
          element={
            <ProtectedRoute adminOnly>
              <AdminSettings />
            </ProtectedRoute>
          } 
        />
        <Route path="/admin/blog" element={<ProtectedRoute adminOnly><AdminBlog /></ProtectedRoute>} />
        <Route path="/admin/media" element={<ProtectedRoute adminOnly><AdminMedia /></ProtectedRoute>} />
        <Route path="/admin/packages" element={<ProtectedRoute adminOnly><AdminPackages /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/faq" element={<ProtectedRoute adminOnly><AdminFAQ /></ProtectedRoute>} />
        <Route path="/admin/pages" element={<ProtectedRoute adminOnly><AdminPages /></ProtectedRoute>} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogDetailPage />} />
        <Route path="/pages/:slug" element={<DynamicPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/sitemap" element={<SitemapPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* Location Specific SEO Routes */}
        <Route path="/taxi-service-in-andheri" element={<LocationPage location="andheri" />} />
        <Route path="/cab-service-in-bandra" element={<LocationPage location="bandra" />} />
        <Route path="/airport-cab-service-santacruz" element={<LocationPage location="santacruz" />} />
        <Route path="/taxi-service-in-vile-parle" element={<LocationPage location="vile-parle" />} />
        <Route path="/cab-service-in-dadar" element={<LocationPage location="dadar" />} />
        <Route path="/taxi-service-in-mahim" element={<LocationPage location="mahim" />} />
        <Route path="/cab-service-in-kurla" element={<LocationPage location="kurla" />} />
        <Route path="/car-rental-in-goregaon" element={<LocationPage location="goregaon" />} />
        <Route path="/taxi-service-in-churchgate" element={<LocationPage location="churchgate" />} />
        <Route path="/cab-service-in-matunga" element={<LocationPage location="matunga" />} />
        <Route path="/airport-taxi-service-mumbai" element={<LocationPage location="mumbai-airport" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {!isAdmin && <FloatingContactButtons />}
    </Suspense>
  );
};

function App() {
  // Seed data and load SEO/Settings
  useEffect(() => {
    const initApp = async () => {
      try {
        await axios.post(`${API}/seed`);
      } catch (e) {}

      try {
        const { data: settings } = await axios.get(`${API}/settings`);
        
        if (settings.meta_title) document.title = settings.meta_title;
        
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
          metaDesc = document.createElement('meta');
          metaDesc.name = "description";
          document.head.appendChild(metaDesc);
        }
        if (settings.meta_description) metaDesc.content = settings.meta_description;

        let metaKey = document.querySelector('meta[name="keywords"]');
        if (!metaKey) {
          metaKey = document.createElement('meta');
          metaKey.name = "keywords";
          document.head.appendChild(metaKey);
        }
        if (settings.meta_keywords) metaKey.content = settings.meta_keywords;

        if (settings.favicon_url) {
          let link = document.querySelector("link[rel*='icon']");
          if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
          }
          link.href = resolveImageUrl(settings.favicon_url);
        }

        if (settings.custom_scripts) {
          const div = document.createElement('div');
          div.innerHTML = settings.custom_scripts;
          Array.from(div.querySelectorAll('script')).forEach(oldScript => {
            const newScript = document.createElement('script');
            Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
            newScript.appendChild(document.createTextNode(oldScript.innerHTML));
            document.head.appendChild(newScript);
          });
        }
      } catch (error) {
        console.error("App init error:", error);
      }
    };
    initApp();
  }, []);

  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster position="top-right" richColors />
          <AppRouter />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
