import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import Modules from "./pages/Modules";
import Pathways from "./pages/Pathways";
import Certifications from "./pages/Certifications";
import Internships from "./pages/Internships";
import Calendar from "./pages/Calendar";
import ResumeDropPage from "./pages/ResumeDropPage";
import Mentorship from "./pages/Mentorship";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/modules" element={<Modules />} />
            <Route path="/pathways" element={<Pathways />} />
            <Route path="/certifications" element={<Certifications />} />
            <Route path="/internships" element={<Internships />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/resume-drop" element={<ResumeDropPage />} />
            <Route path="/mentorship" element={<Mentorship />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/profile" element={<Profile />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
