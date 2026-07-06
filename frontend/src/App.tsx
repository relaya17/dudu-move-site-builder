import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AccessibilityButton } from "@/components/ui/accessibility-button";
import { AdminGuard } from "@/components/admin/AdminGuard";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { ThankYou } from "./pages/ThankYou";
import { Tracking } from "./pages/Tracking";

// טעינה עצלה (code-splitting) לדפי הניהול: רוב המבקרים באתר הם לקוחות רגילים
// שלעולם לא מגיעים ל-/admin, ואין סיבה שהם יורידו את הקוד של הדשבורד (כולל
// ספריית הגרפים recharts, שכבדה יחסית) כחלק מהטעינה הראשונית של דף הבית.
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const MovingEstimatesAdminPage = lazy(() => import("./pages/admin/MovingEstimatesAdminPage"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/thank-you" element={<ThankYou />} />
          <Route path="/tracking/:token" element={<Tracking />} />
          <Route
            path="/admin"
            element={
              <AdminGuard>
                <Suspense fallback={<div className="p-8 text-center" dir="rtl">טוען...</div>}>
                  <Dashboard />
                </Suspense>
              </AdminGuard>
            }
          />
          <Route
            path="/admin/moving-estimates"
            element={
              <AdminGuard>
                <Suspense fallback={<div className="p-8 text-center" dir="rtl">טוען...</div>}>
                  <MovingEstimatesAdminPage />
                </Suspense>
              </AdminGuard>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <AccessibilityButton />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;