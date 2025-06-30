import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import QuotesAdminPage from '@/pages/admin/QuotesAdminPage';
import NotFound from '@/pages/NotFound';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin/quotes" element={<QuotesAdminPage />} />
        <Route path="*" element={<NotFound />} />

      </Routes>
    </Router>
  );
}

export default App;
