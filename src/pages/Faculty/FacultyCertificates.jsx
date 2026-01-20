// File: src/pages/Faculty/FacultyCertificates.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import FacultyNavbar from '../../components/FacultyNavbar';
import '../../styles/FacultyCertificates.css';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const FacultyCertificates = () => {
  const [request, setRequest] = useState(null);
  const [faculty, setFaculty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data: profile } = await supabase
        .from('faculties')
        .select('*')
        .eq('user_id', user.id)
        .single();
      setFaculty(profile);

      const { data: req } = await supabase
        .from('relieving_requests')
        .select('*')
        .eq('faculty_id', profile.id)
        .maybeSingle(); 
      setRequest(req);
    } catch (err) {
      console.error("Error fetching certificates:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- PDF GENERATION LOGIC ---
  const generatePDF = (docType, action = 'download') => {
    const doc = new jsPDF();
    const today = new Date().toLocaleDateString('en-GB');

    // 1. Header Styles
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(44, 62, 80); // Dark Blue/Grey
    doc.text("UNIVERSITY OF EXCELLENCE", 105, 20, { align: "center" });
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Main Campus, Education Hub, State - 123456", 105, 27, { align: "center" });
    doc.line(20, 32, 190, 32); // Header separator line

    // 2. Document Title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(docType.toUpperCase(), 105, 45, { align: "center" });

    // 3. Document Details
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Date: ${today}`, 20, 60);
    doc.text(`Ref No: UNIV/OFF/${faculty.employee_id}/${new Date().getFullYear()}`, 20, 67);

    // 4. Content Body
    doc.setFontSize(12);
    let bodyText = "";

    if (docType === 'Experience Certificate') {
      bodyText = `This is to certify that Mr./Ms. ${faculty.full_name}, Employee ID: ${faculty.employee_id}, was employed with our university in the Department of ${faculty.department || 'Academics'}. They served from ${new Date(faculty.joining_date).toLocaleDateString('en-GB')} until ${request?.proposed_last_working_day}. During their tenure, we found them to be diligent, hardworking, and a valuable asset to the institution.`;
    } else if (docType === 'Relieving Letter') {
      bodyText = `With reference to your resignation letter, we hereby inform you that you are relieved from your duties as a Faculty member at University of Excellence. Your final day of work is confirmed as ${request?.proposed_last_working_day}. We confirm that all university property has been returned and dues are cleared.`;
    } else {
      bodyText = `This document serves as the official ${docType} for ${faculty.full_name}. This is a system-generated document based on the approved relieving request processed on ${new Date(request?.updated_at).toLocaleDateString('en-GB')}.`;
    }

    const splitText = doc.splitTextToSize(bodyText, 170);
    doc.text(splitText, 20, 85);

    // 5. Closing
    doc.text("We wish you the very best in your future endeavors.", 20, 130);

    // 6. Signatures
    doc.setFont("helvetica", "bold");
    doc.text("Authorized Signatory", 140, 160);
    doc.setFont("helvetica", "normal");
    doc.text("Registrar Office", 140, 167);
    doc.text("University of Excellence", 140, 174);

    // 7. Action: View or Download
    if (action === 'view') {
      window.open(doc.output('bloburl'), '_blank');
    } else {
      doc.save(`${docType.replace(/\s+/g, '_')}_${faculty.employee_id}.pdf`);
    }
  };

  if (loading) return <div className="p-10">Loading Certificates...</div>;

  const certificates = [
    { id: 'relieving', title: 'Relieving Letter', isReady: request?.relieving_letter_ready },
    { id: 'experience', title: 'Experience Certificate', isReady: request?.experience_cert_ready },
    { id: 'service', title: 'Service Certificate', isReady: request?.service_cert_ready },
    { id: 'settlement', title: 'Settlement Statement', isReady: request?.settlement_ready }
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <FacultyNavbar facultyName={faculty?.full_name} employeeId={faculty?.employee_id} />
      
      <div className="max-w-5xl mx-auto p-8">
        <h2 className="text-2xl font-bold mb-2">Official Documents</h2>
        <p className="text-gray-600 mb-8">Download your documents once they are approved and issued by the Admin.</p>
        
        <div className="certificate-grid">
          {certificates.map(cert => (
            <div key={cert.id} className={`cert-card ${!cert.isReady ? 'locked' : 'available'}`}>
              <div className="cert-info">
                <span className="cert-icon">{cert.isReady ? '📄' : '🔒'}</span>
                <h3>{cert.title}</h3>
                <p className="text-sm text-gray-500">
                    {cert.isReady ? 'Ready for download' : 'Under process by admin'}
                </p>
              </div>
              
              {cert.isReady ? (
                <div className="cert-actions">
                  <button 
                    className="btn-view" 
                    onClick={() => generatePDF(cert.title, 'view')}
                  >
                    View
                  </button>
                  <button 
                    className="btn-download" 
                    onClick={() => generatePDF(cert.title, 'download')}
                  >
                    Download PDF
                  </button>
                </div>
              ) : (
                <div className="mt-4 py-2 px-3 bg-gray-100 rounded text-xs text-gray-400 font-medium">
                  PENDING ISSUANCE
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FacultyCertificates;