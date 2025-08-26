import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import Layout from "./components/Layout";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/*" element={
              <Layout>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/modules" element={<Modules />} />
                  <Route path="/pathways" element={<Pathways />} />
                  <Route path="/certifications" element={<Certifications />} />
                  <Route path="/internships" element={<Internships />} />
                  <Route path="/internships/summer" element={<SummerInternships />} />
                  <Route path="/internships/full-time" element={<FullTime />} />
                  <Route path="/internships/uc-partners" element={<UCPartners />} />
                  <Route path="/calendar" element={<Calendar />} />
                  <Route path="/resume-drop" element={<ResumeDropPage />} />
                  <Route path="/mentorship" element={<Mentorship />} />
                  <Route path="/chat" element={<Chat />} />
                  <Route path="/profile" element={<Profile />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
            } />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
