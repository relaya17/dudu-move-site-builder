import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { AccessibilityButton } from "@/components/ui/accessibility-button";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AuthProvider } from "@/contexts/AuthContext";
import ForMovers from "./pages/ForMovers";
import NotFound from "./pages/NotFound";
import { ThankYou } from "./pages/ThankYou";
import { Tracking } from "./pages/Tracking";
import Login from "./pages/Login";
import Register from "./pages/Register";

// טעינה עצלה (code-splitting) לדפי הניהול: רוב המבקרים בדף הבית של הפלטפורמה
// (מובילים פוטנציאליים) לעולם לא מגיעים ל-/admin, ואין סיבה שהם יורידו את הקוד
// של הדשבורד (כולל ספריית הגרפים recharts, שכבדה יחסית) כחלק מהטעינה הראשונית.
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const MovingEstimatesAdminPage = lazy(() => import("./pages/admin/MovingEstimatesAdminPage"));

// אתר הלקוחות של "דוד הובלות" - העסק לדוגמה שמריץ על גבי הפלטפורמה, עבר
// מ-"/" ל-"/demo" כשעמוד הבית הראשי הפך לדף השיווק של הפלטפורמה עצמה (Movalo).
const DemoBusinessSite = lazy(() => import("./pages/Index"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const VirtualStagingPage = lazy(() => import("./pages/VirtualStagingPage"));
const PrivacyCenterPage = lazy(() => import("./pages/PrivacyCenterPage"));
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
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <LandingShortcut />
          <Routes>
            {/* עמוד הבית הראשי - דף השיווק של הפלטפורמה (Movalo) למובילים פוטנציאליים,
                בעברית (ברירת המחדל). "/for-movers" נשאר עובד (לא שובר קישורים ישנים)
                ומצביע לאותו תוכן. "/for-movers/:lang" - כתובת אמיתית ונפרדת לכל שפה
                (en/fr/ar/ru), כדי שגוגל יוכל לסרוק ולאנדקס כל שפה בנפרד - ר' ForMovers.tsx. */}
            <Route path="/" element={<ForMovers />} />
            <Route path="/for-movers" element={<ForMovers />} />
            <Route path="/for-movers/:lang" element={<ForMovers />} />

            {/* אתר הלקוחות של דוד הובלות - דוגמה חיה לעסק שמריץ על הפלטפורמה */}
            <Route
              path="/demo"
              element={
                <Suspense fallback={<Spinner />}>
                  <DemoBusinessSite />
                </Suspense>
              }
            />
            <Route
              path="/demo/contact"
              element={
                <Suspense fallback={<Spinner />}>
                  <ContactPage />
                </Suspense>
              }
            />
            <Route
              path="/demo/staging"
              element={
                <Suspense fallback={<Spinner />}>
                  <VirtualStagingPage />
                </Suspense>
              }
            />
            <Route
              path="/demo/privacy"
              element={
                <Suspense fallback={<Spinner />}>
                  <PrivacyCenterPage />
                </Suspense>
              }
            />
            <Route path="/thank-you" element={<ThankYou />} />
            <Route path="/tracking/:token" element={<Tracking />} />

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
  </QueryClientProvider>
);

export default App;