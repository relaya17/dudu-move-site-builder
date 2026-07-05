import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4" dir="rtl">
      <main className="text-center">
        <p className="text-2xl font-semibold text-gray-500 mb-2" aria-hidden="true">404</p>
        <h1 className="text-3xl font-bold mb-4 text-gray-900">הדף המבוקש לא נמצא</h1>
        <p className="text-lg text-gray-600 mb-6">ייתכן שהקישור שגוי או שהדף הוסר.</p>
        <a href="/" className="text-blue-600 hover:text-blue-800 underline font-medium focus-visible:outline-2">
          חזרה לדף הבית
        </a>
      </main>
    </div>
  );
};

export default NotFound;
