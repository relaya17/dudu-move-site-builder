
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MovingEstimatesAdminPage from '@/pages/admin/MovingEstimatesAdminPage';
import NotFound from '@/pages/NotFound';

function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/admin/moving-estimates" element={<MovingEstimatesAdminPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default AppRouter;
