import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import FacultyNavbar from '../../components/FacultyNavbar';
import '../../styles/AcademicClearance.css';

const AcademicClearance = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [faculty, setFaculty] = useState(null);
  const [requestId, setRequestId] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    syllabus_completed: false,
    internal_marks_uploaded: false,
    lab_records_submitted: false,
    remarks: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase.from('faculties').select('*').eq('user_id', user.id).single();
      setFaculty(profile);

      const { data: req } = await supabase.from('relieving_requests').select('id').eq('faculty_id', profile.id).maybeSingle();
      setRequestId(req?.id);

      const { data: existing } = await supabase.from('academic_clearance').select('*').eq('faculty_id', profile.id).maybeSingle();
      if (existing) {
        setFormData(existing);
        setSubmitted(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!requestId) return alert("Please submit a Relieving Request first!");
    
    // Safety check: Ensure they actually checked the boxes
    if(!formData.syllabus_completed || !formData.internal_marks_uploaded || !formData.lab_records_submitted) {
        return alert("Please acknowledge all requirements before submitting.");
    }

    setSubmitting(true);
    const { error } = await supabase.from('academic_clearance').insert([{
      faculty_id: faculty.id,
      request_id: requestId,
      status: 'APPROVED', // THIS IS THE KEY FIX
      ...formData
    }]);

    if (!error) {
      setSubmitted(true);
      alert("Academic clearance submitted and approved!");
    } else {
      alert(error.message);
    }
    setSubmitting(false);
  };

  if (loading) return <div className="loading-screen">Loading...</div>;

  return (
    <div className="admin-page-wrapper">
      <FacultyNavbar facultyName={faculty?.full_name} employeeId={faculty?.employee_id} />
      <main className="dashboard-container">
        <div className="request-card">
          <div className="applicant-title">📚 Academic Clearance Declaration</div>
          
          {submitted ? (
            <div className="verification-glass-card" style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '3rem' }}>✅</div>
              <h2 style={{ color: '#1e293b', marginTop: '10px' }}>Clearance Completed</h2>
              <p style={{ color: '#64748b' }}>Your academic records have been submitted and verified.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="request-form">
              <div className="clearance-checkbox-group">
                <label className="checkbox-item">
                  <input type="checkbox" checked={formData.syllabus_completed} 
                    onChange={e => setFormData({...formData, syllabus_completed: e.target.checked})} />
                  <span>I have completed 100% of the assigned syllabus for the current semester.</span>
                </label>
                <label className="checkbox-item">
                  <input type="checkbox" checked={formData.internal_marks_uploaded} 
                    onChange={e => setFormData({...formData, internal_marks_uploaded: e.target.checked})} />
                  <span>All internal assessment marks have been uploaded.</span>
                </label>
                <label className="checkbox-item">
                  <input type="checkbox" checked={formData.lab_records_submitted} 
                    onChange={e => setFormData({...formData, lab_records_submitted: e.target.checked})} />
                  <span>Handed over all lab records and department keys.</span>
                </label>
              </div>
              <div className="form-group" style={{ marginTop: '20px' }}>
                <label className="form-label">Additional Handover Remarks</label>
                <textarea 
                  className="form-input" 
                  style={{ height: '100px' }}
                  value={formData.remarks}
                  onChange={e => setFormData({...formData, remarks: e.target.value})}
                />
              </div>
              <button type="submit" disabled={submitting} className="btn btn-primary w-full mt-6">
                {submitting ? 'Submitting...' : 'Submit Academic Details'}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

export default AcademicClearance;