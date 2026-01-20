// src/routes/AppRoutes.jsx
import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Import Pages
import Login from '../pages/Login';
import FacultyDashboard from '../pages/Faculty/FacultyDashboard';
import RelievingRequest from '../pages/Faculty/RelievingRequest';
import FacultyCertificates from '../pages/Faculty/FacultyCertificates'; // 1. ADD THIS IMPORT
import AdminDashboard from '../pages/Admin/AdminDashboard';

// Security Guard: Checks if user is logged in
const PrivateRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-4">Loading...</div>;
  return user ? <Outlet /> : <Navigate to="/login" />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/login" />} />

      {/* Protected Routes */}
      <Route element={<PrivateRoute />}>
        <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
        <Route path="/faculty/request-relieving" element={<RelievingRequest />} />
        {/* 2. ADD THIS ROUTE */}
        <Route path="/faculty/certificates" element={<FacultyCertificates />} /> 
        
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;