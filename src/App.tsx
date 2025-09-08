import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { AdminAuthProvider } from "./hooks/useAdminAuth";
import Layout from "./components/Layout";
import AdminLayout from "./components/AdminLayout";
import Index from "./pages/Index";
import Modules from "./pages/Modules";
import Pathways from "./pages/Pathways";
import Certifications from "./pages/Certifications";
import Internships from "./pages/Internships";
import SummerInternships from "./pages/SummerInternships";
import FullTime from "./pages/FullTime";
import UCPartners from "./pages/UCPartners";
import Calendar from "./pages/Calendar";
import ResumeDropPage from "./pages/ResumeDropPage";
import Mentorship from "./pages/Mentorship";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import AdminAuth from "./pages/AdminAuth";
import AdminDashboard from "./pages/AdminDashboard";
import AdminApplications from "./pages/AdminApplications";
import AdminCertifications from "./pages/AdminCertifications";
import AdminCalendarEvents from "./pages/AdminCalendarEvents";
import AdminProfile from "./pages/AdminProfile";
import AdminUserManagement from "./pages/AdminUserManagement";
import AdminManagement from "./pages/AdminManagement";
import CreateLearnerProfile from "./pages/CreateLearnerProfile";
import SetPassword from "./pages/SetPassword";
import ChangePassword from "./pages/ChangePassword";
import NotFound from "./pages/NotFound";
import LandingPage from "./pages/LandingPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AdminAuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/landing" element={<LandingPage />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/set-password" element={<SetPassword />} />
              <Route path="/change-password" element={<ChangePassword />} />
              <Route path="/admin/auth" element={<AdminAuth />} />
          <Route path="/admin/*" element={<AdminLayout />}>
            <Route path="" element={<AdminDashboard />} />
            <Route path="applications" element={<AdminApplications />} />
            <Route path="user-management" element={<AdminUserManagement />} />
            <Route path="admin-management" element={<AdminManagement />} />
            <Route path="create-learner" element={<CreateLearnerProfile />} />
            <Route path="pathways" element={<div>Admin Pathways - Coming Soon</div>} />
            <Route path="certifications" element={<AdminCertifications />} />
            <Route path="internships" element={<div>Admin Internships - Coming Soon</div>} />
            <Route path="calendar" element={<AdminCalendarEvents />} />
            <Route path="resumes" element={<div>Admin Resume Review - Coming Soon</div>} />
            <Route path="chat" element={<div>Admin Chat - Coming Soon</div>} />
            <Route path="profile" element={<AdminProfile />} />
          </Route>
              <Route path="/*" element={<Layout />}>
                <Route path="" element={<Index />} />
                <Route path="modules" element={<Modules />} />
                <Route path="pathways" element={<Pathways />} />
                <Route path="certifications" element={<Certifications />} />
                <Route path="internships" element={<Internships />} />
                <Route path="internships/summer" element={<SummerInternships />} />
                <Route path="internships/full-time" element={<FullTime />} />
                <Route path="internships/uc-partners" element={<UCPartners />} />
                <Route path="calendar" element={<Calendar />} />
                <Route path="resume-drop" element={<ResumeDropPage />} />
                <Route path="mentorship" element={<Mentorship />} />
                <Route path="chat" element={<Chat />} />
                <Route path="profile" element={<Profile />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AdminAuthProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
