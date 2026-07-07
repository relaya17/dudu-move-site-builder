import { lazy, Suspense } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { AccessibilityButton } from "@/components/ui/accessibility-button";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AuthProvider } from "@/contexts/AuthContext";
import { muiTheme } from "@/lib/muiTheme";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { ThankYou } from "./pages/ThankYou";
import { Tracking } from "./pages/Tracking";
import Login from "./pages/Login";
import Register from "./pages/Register";

// טעינה עצלה (code-splitting) לדפי הניהול: רוב המבקרים באתר הם לקוחות רגילים
// שלעולם לא מגיעים ל-/admin, ואין סיבה שהם יורידו את הקוד של הדשבורד (כולל
// ספריית הגרפים recharts, שכבדה יחסית) כחלק מהטעינה הראשונית של דף הבית.
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const MovingEstimatesAdminPage = lazy(() => import("./pages/admin/MovingEstimatesAdminPage"));

// דף שיווקי למובילים פוטנציאליים — טעינה עצלה מאותה סיבה.
const ForMovers = lazy(() => import("./pages/ForMovers"));
// דשבורד הניהול החדש (JWT / multi-tenant)
const TenantDashboard = lazy(() => import("./pages/dashboard/TenantDashboard"));

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

const Spinner = () => <div className="min-h-screen flex items-center justify-center" dir="rtl"><span className="text-gray-400">טוען...</span></div>;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider theme={muiTheme}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <LandingShortcut />
          <Routes>
            {/* דפי לקוחות ציבוריים */}
            <Route path="/" element={<Index />} />
            <Route path="/thank-you" element={<ThankYou />} />
            <Route path="/tracking/:token" element={<Tracking />} />

            {/* דף שיווקי */}
            <Route
              path="/for-movers"
              element={
                <Suspense fallback={<Spinner />}>
                  <ForMovers />
                </Suspense>
              }
            />

            {/* Auth */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* דשבורד טנאנט — JWT מוגן */}
            <Route
              path="/dashboard/*"
              element={
                <AuthGuard>
                  <Suspense fallback={<Spinner />}>
                    <TenantDashboard />
                  </Suspense>
                </AuthGuard>
              }
            />

            {/* ניהול ישן — מפתח x-admin-key */}
            <Route
              path="/admin"
              element={
                <AdminGuard>
                  <Suspense fallback={<Spinner />}>
                    <Dashboard />
                  </Suspense>
                </AdminGuard>
              }
            />
            <Route
              path="/admin/moving-estimates"
              element={
                <AdminGuard>
                  <Suspense fallback={<Spinner />}>
                    <MovingEstimatesAdminPage />
                  </Suspense>
                </AdminGuard>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
      <AccessibilityButton />
    </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;