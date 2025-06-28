import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import QuotesAdminPage from '@/pages/admin/QuotesAdminPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin/quotes" element={<QuotesAdminPage />} />
      </Routes>
    </Router>
  );
}

export default App;
