// File: src/components/FacultyNavbar.jsx
import React from 'react';
import { supabase } from '../config/supabase'; 
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/FacultyNavbar.css'; 

const FacultyNavbar = ({ facultyName, employeeId }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <nav className="faculty-navbar">
      <div className="navbar-content">
        <div className="navbar-brand">
          <h1 className="navbar-title">Faculty Portal</h1>
          <div className="nav-links">
             {/* Updated to match path in AppRoutes.jsx */}
             <span 
               className={`nav-item ${location.pathname === '/faculty/dashboard' ? 'active' : ''}`}
               onClick={() => navigate('/faculty/dashboard')}
             >
               Dashboard
             </span>

             {/* Updated to match path in AppRoutes.jsx */}
             <span 
               className={`nav-item ${location.pathname === '/faculty/certificates' ? 'active' : ''}`}
               onClick={() => navigate('/faculty/certificates')}
             >
               Certificates
             </span>
          </div>
        </div>
        
        <div className="navbar-user-section">
          <div className="user-info">
            <span className="user-name">{facultyName || 'Faculty Member'}</span>
            <span className="user-id">{employeeId}</span>
          </div>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default FacultyNavbar;