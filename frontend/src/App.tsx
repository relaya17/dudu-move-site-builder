import { lazy, Suspense } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { AccessibilityButton } from "@/components/ui/accessibility-button";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { muiTheme } from "@/lib/muiTheme";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { ThankYou } from "./pages/ThankYou";
import { Tracking } from "./pages/Tracking";

// טעינה עצלה (code-splitting) לדפי הניהול: רוב המבקרים באתר הם לקוחות רגילים
// שלעולם לא מגיעים ל-/admin, ואין סיבה שהם יורידו את הקוד של הדשבורד (כולל
// ספריית הגרפים recharts, שכבדה יחסית) כחלק מהטעינה הראשונית של דף הבית.
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const MovingEstimatesAdminPage = lazy(() => import("./pages/admin/MovingEstimatesAdminPage"));

// דף שיווקי למובילים פוטנציאליים (לא ללקוחות של דוד הובלות) - טעינה עצלה מאותה סיבה.
const ForMovers = lazy(() => import("./pages/ForMovers"));

const queryClient = new QueryClient();

const LandingShortcut = () => {
  const location = useLocation();
  if (location.pathname === "/") return null;

  return (
    <Link
      to="/"
      className="fixed bottom-4 right-4 z-50 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-lg hover:bg-blue-700 transition-colors"
      aria-label="חזרה לדף הנחיתה"
    >
      לדף הנחיתה
    </Link>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider theme={muiTheme}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <LandingShortcut />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/thank-you" element={<ThankYou />} />
          <Route path="/tracking/:token" element={<Tracking />} />
          <Route
            path="/for-movers"
            element={
              <Suspense fallback={<div className="p-8 text-center">...</div>}>
                <ForMovers />
              </Suspense>
            }
          />
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
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;