// src/routes/AppRoutes.jsx
import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Import Pages
import Login from '../pages/Login';
import FacultyDashboard from '../pages/Faculty/FacultyDashboard';
import RelievingRequest from '../pages/Faculty/RelievingRequest';
import FacultyCertificates from '../pages/Faculty/FacultyCertificates';
import AdminDashboard from '../pages/Admin/AdminDashboard';
// 1. ADD THIS IMPORT
import AcademicClearance from '../pages/Faculty/AcademicClearance'; 

const PrivateRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-4">Loading...</div>;
  return user ? <Outlet /> : <Navigate to="/login" />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/login" />} />

      <Route element={<PrivateRoute />}>
        <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
        <Route path="/faculty/request-relieving" element={<RelievingRequest />} />
        <Route path="/faculty/certificates" element={<FacultyCertificates />} />
        
        {/* 2. ADD THIS ROUTE MATCHING YOUR NAVBAR PATH */}
        <Route path="/faculty/academic-clearance" element={<AcademicClearance />} />
        
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;