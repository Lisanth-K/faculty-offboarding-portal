import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import FacultyNavbar from '../../components/FacultyNavbar';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import '../../styles/FacultyCertificates.css';
import '../../styles/RelievingRequest.css'; 

const FacultyCertificates = () => {
  const [request, setRequest] = useState(null);
  const [faculty, setFaculty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase.from('faculties').select('*').eq('user_id', user.id).single();
      setFaculty(profile);
      const { data: req } = await supabase.from('relieving_requests').select('*').eq('faculty_id', profile.id).maybeSingle(); 
      setRequest(req);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = (docType, action = 'download') => {
    const doc = new jsPDF();
    const today = new Date().toLocaleDateString('en-GB');
    
    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(37, 99, 235); // Blue color
    doc.text("UNIVERSITY OF EXCELLENCE", 105, 20, { align: "center" });
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("Official Administrative Portal - Documents Division", 105, 27, { align: "center" });
    doc.line(20, 32, 190, 32);
    
    // Title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59); // Fixed: Removed the 'slate: 800' error here
    doc.text(docType.toUpperCase(), 105, 45, { align: "center" });
    
    // Details
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Date: ${today}`, 20, 60);
    doc.text(`Ref: UNIV/${faculty.employee_id}/${new Date().getFullYear()}`, 20, 67);
    
    // Body Text
    doc.setFontSize(12);
    let body = docType === 'Experience Certificate' 
      ? `This is to certify that ${faculty.full_name} (ID: ${faculty.employee_id}) served in the ${faculty.department} department until ${request?.proposed_last_working_day}. During their tenure, they demonstrated excellence in their field.`
      : `With reference to the resignation request, ${faculty.full_name} is hereby relieved of duties effective ${request?.proposed_last_working_day}. All dues have been cleared.`;
    
    doc.text(doc.splitTextToSize(body, 170), 20, 85);
    
    doc.text("Authorized Signatory", 140, 150);
    doc.text("Registrar Office", 140, 157);

    if (action === 'view') {
      window.open(doc.output('bloburl'), '_blank');
    } else {
      doc.save(`${docType.replace(/\s+/g, '_')}.pdf`);
    }
  };

  if (loading) return <div className="loading-screen">Loading Documents...</div>;

  const docs = [
    { id: 'relieving', title: 'Relieving Letter', isReady: request?.relieving_letter_ready },
    { id: 'experience', title: 'Experience Certificate', isReady: request?.experience_cert_ready },
    { id: 'service', title: 'Service Certificate', isReady: request?.service_cert_ready },
    { id: 'settlement', title: 'Settlement Statement', isReady: request?.settlement_ready }
  ];

  return (
    <div className="admin-page-wrapper">
      <FacultyNavbar facultyName={faculty?.full_name} employeeId={faculty?.employee_id} />
      
      <main className="dashboard-container">
        <header className="dashboard-header">
          <div className="welcome-text">
            <h1>Official Documents</h1>
            <p>Access and download your verified institutional certificates</p>
          </div>
        </header>
        
        <div className="certificate-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {docs.map(doc => (
            <div key={doc.id} className={`card ${!doc.isReady ? 'locked-card' : ''}`} style={{ padding: '24px' }}>
              <div className="status-badge" style={{ 
                background: doc.isReady ? '#dcfce7' : '#f1f5f9', 
                color: doc.isReady ? '#166534' : '#64748b',
                padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', width: 'fit-content'
              }}>
                {doc.isReady ? 'READY' : 'PENDING'}
              </div>
              
              <h3 style={{ marginTop: '16px', fontSize: '1.25rem', fontWeight: '700', color: '#1e293b' }}>{doc.title}</h3>
              <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '8px 0 24px 0' }}>
                {doc.isReady ? 'Verified and signed by Registrar' : 'Under process by administration'}
              </p>
              
              {doc.isReady ? (
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => generatePDF(doc.title, 'view')}>View</button>
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => generatePDF(doc.title, 'download')}>Download</button>
                </div>
              ) : (
                <div style={{ padding: '12px', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '800', border: '1px dashed #e2e8f0' }}>
                  LOCKED
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default FacultyCertificates;