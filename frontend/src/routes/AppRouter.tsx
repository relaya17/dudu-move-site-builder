
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from '@/pages/Index';
import NotFound from '@/pages/NotFound';
import Dashboard from '@/pages/admin/Dashboard';
import MovingEstimatesAdminPage from '@/pages/admin/MovingEstimatesAdminPage';
import { ThankYou } from '@/pages/ThankYou';

export const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/admin/moving-estimates" element={<MovingEstimatesAdminPage />} />
        <Route path="/thank-you" element={<ThankYou />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};
