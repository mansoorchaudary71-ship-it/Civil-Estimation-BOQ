import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import DynamicToolPage from './DynamicToolPage';

// import Dashboard from '../components/Dashboard'; 
// import Layout from '../components/Layout'; 

/**
 * Boilerplate for migrating your App.tsx state-based routing 
 * to React Router for programmatic SEO.
 */
export default function AppRouterSetup() {
  return (
    <HelmetProvider>
      <HashRouter>
        {/* Your Layout component would go here (Navbar, Sidebar, etc.) */}
        <Routes>
          {/* Home Route */}
          {/* <Route path="/" element={<Dashboard />} /> */}
          
          {/* Dynamic SEO Route for all calculators */}
          <Route path="/calculator/:slug" element={<DynamicToolPage />} />
          
          {/* 404 Route */}
          <Route path="/404" element={<div className="p-12 text-center text-2xl font-bold">Page Not Found</div>} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </HashRouter>
    </HelmetProvider>
  );
}
