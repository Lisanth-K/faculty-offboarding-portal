import React from 'react';
import { supabase } from '../config/supabase'; 
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/FacultyNavbar.css'; 
import '../styles/AdminDashboard.css'; 

const FacultyNavbar = ({ facultyName, employeeId }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const navItemStyle = (path) => ({
    cursor: 'pointer',
    fontWeight: '600',
    color: location.pathname === path ? '#2563eb' : '#64748b',
    borderBottom: location.pathname === path ? '2px solid #2563eb' : 'none',
    paddingBottom: '4px'
  });

  return (
    <nav className="admin-navbar">
      <div className="nav-container">
        <div className="nav-brand">
          <div className="brand-logo" style={{ fontSize: '1.5rem' }}>🎓</div>
          <span className="brand-text" style={{ fontWeight: '800', fontSize: '1.2rem', color: '#1e293b' }}>Faculty Portal</span>
          
          <div className="nav-links" style={{ marginLeft: '40px', display: 'flex', gap: '24px' }}>
             <span style={navItemStyle('/faculty/dashboard')} onClick={() => navigate('/faculty/dashboard')}>
               Dashboard
             </span>
             <span style={navItemStyle('/faculty/academic-clearance')} onClick={() => navigate('/faculty/academic-clearance')}>
               Academic Clearance
             </span>
             <span style={navItemStyle('/faculty/certificates')} onClick={() => navigate('/faculty/certificates')}>
               Certificates
             </span>
          </div>
        </div>
        
        <div className="user-profile-section" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div className="user-details" style={{ textAlign: 'right' }}>
            <div className="user-name" style={{ fontWeight: '700', color: '#1e293b' }}>{facultyName || 'Faculty Member'}</div>
            <div className="user-role" style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>{employeeId}</div>
          </div>
          <button onClick={handleLogout} className="btn btn-danger">Logout</button>
        </div>
      </div>
    </nav>
  );
};

export default FacultyNavbar;