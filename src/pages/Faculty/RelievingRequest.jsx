import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import '../../styles/RelievingRequest.css';

const RelievingRequest = ({ faculty, existingRequest, onRefresh }) => {
  const [isEditing, setIsEditing] = useState(!existingRequest);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    last_working_day: '',
    reason: '',
    file: null
  });

  // Load existing data if available
  useEffect(() => {
    if (existingRequest) {
      setFormData({
        last_working_day: existingRequest.proposed_last_working_day,
        reason: existingRequest.reason,
        file: null
      });
      setIsEditing(false); 
    }
  }, [existingRequest]);

  // File Validation: PDF, JPG, PNG only
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(selectedFile.type)) {
        alert("Invalid format! Please upload only PDF or JPG/PNG images.");
        e.target.value = ""; 
        setFormData({ ...formData, file: null });
        return;
      }
      setFormData({ ...formData, file: selectedFile });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mandatory field check: File is required for new requests
    if (!existingRequest && !formData.file) {
      alert("Please upload your resignation letter (Mandatory).");
      return;
    }

    setLoading(true);

    try {
      let fileUrl = existingRequest?.resignation_letter_url || null;

      // 1. Upload File to Storage
      if (formData.file) {
        const fileExt = formData.file.name.split('.').pop();
        const fileName = `${faculty.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('resignation-letters')
          .upload(fileName, formData.file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('resignation-letters')
          .getPublicUrl(fileName);
          
        fileUrl = data.publicUrl;
      }

      // 2. Prepare Payload based on your schema
      const payload = {
        faculty_id: faculty.id,
        proposed_last_working_day: formData.last_working_day,
        reason: formData.reason,
        resignation_letter_url: fileUrl,
        status: 'SUBMITTED',
        updated_at: new Date().toISOString()
      };

      // 3. Database Operation
      if (existingRequest) {
        await supabase.from('relieving_requests').update(payload).eq('id', existingRequest.id);
      } else {
        await supabase.from('relieving_requests').insert([payload]);
      }

      alert("Relieving request submitted successfully!");
      onRefresh(); // Refresh dashboard to show the status view
      setIsEditing(false);

    } catch (error) {
      alert("Submission Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

const ApplicantDetails = () => (
  <div className="applicant-details">
    <span className="applicant-title">Faculty Information</span>
    <div className="applicant-grid">
      <div className="detail-item">
        <span className="detail-label">Full Name</span>
        <span className="detail-value">{faculty?.full_name || 'Not Available'}</span>
      </div>
      <div className="detail-item">
        <span className="detail-label">Employee ID</span>
        <span className="detail-value">{faculty?.employee_id || 'Not Available'}</span>
      </div>
      <div className="detail-item">
        <span className="detail-label">Designation</span>
        <span className="detail-value">{faculty?.designation || 'N/A'}</span>
      </div>
      <div className="detail-item">
        <span className="detail-label">Department</span>
        <span className="detail-value">{faculty?.department_id || 'N/A'}</span>
      </div>
    </div>
  </div>
);

// --- VIEW 1: STATUS VIEW (Read Only) ---
if (!isEditing && existingRequest) {
  // Determine color theme based on status
  const statusTheme = {
    SUBMITTED: { text: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', dot: 'bg-blue-500' },
    APPROVED: { text: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', dot: 'bg-green-500' },
    REJECTED: { text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-500' }
  }[existingRequest.status] || { text: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200', dot: 'bg-gray-400' };

  return (
    <div className="request-card">
      <div className="card-header-flex">
        <h2 className="status-view-title">Request Status</h2>
        <span className={`status-badge status-${existingRequest.status}`}>
          {existingRequest.status}
        </span>
      </div>

      <ApplicantDetails />

      <div className="status-info-section">
        {/* Existing Data Rows (Last Working Day, Reason, Document) */}
        <div className="status-row">
          <div className="detail-item">
            <span className="detail-label">Proposed Last Working Day</span>
            <span className="detail-value">{existingRequest.proposed_last_working_day}</span>
          </div>
        </div>

        <div className="status-row">
          <div className="detail-item">
            <span className="detail-label">Reason for Leaving</span>
            <p className="detail-value-text">{existingRequest.reason}</p>
          </div>
        </div>

        {existingRequest.resignation_letter_url && (
          <div className="status-row">
            <div className="detail-item">
              <span className="detail-label">Attached Document</span>
              <div>
                <a href={existingRequest.resignation_letter_url} target="_blank" rel="noreferrer" className="document-view-link">
                  View Resignation Letter
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* TRACKING BOX AT THE END */}
      <div className={`status-action-split mt-8 ${statusTheme.bg} ${statusTheme.border}`}>
        <div className="status-phase-box">
          <span className="detail-label">Current Progress</span>
          <div className="phase-content">
            <div className="flex items-center gap-2">
              <span className={`status-dot ${statusTheme.dot}`}></span>
              <p className={`phase-main ${statusTheme.text}`}>
                {existingRequest.status === 'SUBMITTED' ? 'Submitted' : 
                 existingRequest.status === 'APPROVED' ? 'Accepted' : 'Rejected'}
              </p>
            </div>
            
            {existingRequest.status === 'SUBMITTED' && <p className="phase-sub">Pending for admin approval</p>}
            {existingRequest.status === 'APPROVED' && <p className="phase-sub">Your request has been successfully accepted.</p>}
            
{existingRequest.status === 'REJECTED' && (
  <div className="remarks-box">
    <span className="remarks-label">Admin Remarks:</span>
    {/* Change existingRequest.remarks to existingRequest.admin_remarks */}
    <p className="phase-sub italic">{existingRequest.admin_remarks || "No remarks provided."}</p>
  </div>
)}
          </div>
        </div>

        <div className="action-button-box">
          {existingRequest.status === 'REJECTED' ? (
            <button onClick={() => setIsEditing(true)} className="btn-primary w-full">
              Edit & Resubmit
            </button>
          ) : (
            <div className="locked-info">
              <p className="text-xs text-gray-500 font-medium">Editing disabled while {existingRequest.status.toLowerCase()}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
  // --- VIEW 2: FORM VIEW ---
  return (
    <div className="request-card">
      <h2 className="text-xl font-bold mb-6">Submit Relieving Request</h2>
      
      <ApplicantDetails />

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="form-group">
          <label className="form-label font-medium block mb-1">Proposed Last Working Day <span className="text-red-500">*</span></label>
          <input
            type="date"
            required
            className="form-input w-full border p-2 rounded"
            value={formData.last_working_day}
            onChange={(e) => setFormData({ ...formData, last_working_day: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label font-medium block mb-1">Reason for Leaving <span className="text-red-500">*</span></label>
          <textarea
            required
            rows="4"
            className="form-input w-full border p-2 rounded"
            placeholder="Detailed reason for resignation..."
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label font-medium block mb-1">Upload Resignation Letter (PDF/JPG) <span className="text-red-500">*</span></label>
          <div className="file-upload-box border-2 border-dashed p-4 rounded bg-gray-50 text-center">
             <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="w-full cursor-pointer"
              onChange={handleFileChange}
              required={!existingRequest}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          {existingRequest && (
            <button type="button" onClick={() => setIsEditing(false)} className="btn btn-secondary flex-1 py-3 border rounded">
              Cancel
            </button>
          )}
          <button type="submit" disabled={loading} className="btn btn-primary flex-1 py-3 bg-blue-600 text-white rounded font-bold">
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RelievingRequest;