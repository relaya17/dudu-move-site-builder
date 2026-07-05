import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AccessibilityButton } from "@/components/ui/accessibility-button";
import { AdminGuard } from "@/components/admin/AdminGuard";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/admin/Dashboard";
import MovingEstimatesAdminPage from "./pages/admin/MovingEstimatesAdminPage";
import { ThankYou } from "./pages/ThankYou";
import { Tracking } from "./pages/Tracking";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/thank-you" element={<ThankYou />} />
          <Route path="/tracking/:token" element={<Tracking />} />
          <Route path="/admin" element={<AdminGuard><Dashboard /></AdminGuard>} />
          <Route path="/admin/moving-estimates" element={<AdminGuard><MovingEstimatesAdminPage /></AdminGuard>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <AccessibilityButton />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;