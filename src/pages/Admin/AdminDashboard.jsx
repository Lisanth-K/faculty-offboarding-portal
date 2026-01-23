import React, { useEffect, useState } from 'react';
import DocumentIssuer from './DocumentIssuer';
import ClearanceTracker from './ClearanceTracker';
import { supabase } from '../../config/supabase';
import { useNavigate } from 'react-router-dom';
import '../../styles/AdminDashboard.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [remarks, setRemarks] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        const { data, error } = await supabase
            .from('relieving_requests')
            .select(`
                *,
                faculties (*),
                academic_clearance:academic_clearance(*),
                library_clearance:library_clearance(*),
                financial_clearance:financial_clearance(*),
                asset_clearance:asset_clearance(*)
            `);
        
        if (error) {
            console.error('Error fetching data:', error);
            const { data: simpleData } = await supabase
                .from('relieving_requests')
                .select('*, faculties(*)');
            setRequests(simpleData || []);
        } else {
            setRequests(data || []);
            
            // Selected request-ai real-time-la update panna
            if (selectedRequest) {
                const updated = data.find(r => r.id === selectedRequest.id);
                if (updated) setSelectedRequest(updated);
            }
        }
    };

    const handleAction = async (newStatus) => {
        if (!selectedRequest) return;
        if (newStatus === 'REJECTED' && !remarks) {
            alert("Please provide remarks for rejection.");
            return;
        }

        setLoading(true);
        const { error } = await supabase
            .from('relieving_requests')
            .update({ 
                status: newStatus, 
                admin_remarks: remarks,
                updated_at: new Date().toISOString()
            })
            .eq('id', selectedRequest.id);

        if (error) {
            alert("Error: " + error.message);
        } else {
            alert(`Request ${newStatus.toLowerCase()} successfully!`);
            setRemarks('');
            setSelectedRequest(null);
            fetchRequests();
        }
        setLoading(false);
    };

    const checkNoticePeriod = (proposedDate) => {
        if(!proposedDate) return 0;
        const today = new Date();
        const lastDay = new Date(proposedDate);
        const diffTime = Math.abs(lastDay - today);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    return (
        <div className="admin-page-wrapper">
            <nav className="admin-navbar">
                <div className="nav-container">
                    <div className="nav-brand">
                        <div className="brand-logo">A</div>
                        <span className="brand-text">Admin<span>Portal</span></span>
                    </div>
                    <div className="nav-menu">
                        <span className="nav-link active">Relieving Requests</span>
                        <span className="nav-link">Faculty Directory</span>
                        <span className="nav-link">Settings</span>
                    </div>
                    <button onClick={() => { supabase.auth.signOut(); navigate('/login'); }} className="nav-logout">
                        Sign Out
                    </button>
                </div>
            </nav>

            <main className="admin-main-content">
                <div className="admin-content-grid">
                    <aside className="list-panel">
                        <div className="panel-header">
                            <h3>Requests <span>{requests.length}</span></h3>
                        </div>
                        <div className="request-scroll-area">
                            {requests.map((req) => (
                                <div 
                                    key={req.id} 
                                    className={`modern-request-card ${selectedRequest?.id === req.id ? 'active' : ''}`}
                                    onClick={() => { 
                                        setSelectedRequest(req); 
                                        setRemarks(req.admin_remarks || ''); 
                                    }}
                                >
                                    <div className="card-top">
                                        <span className="faculty-uid">
                                            {req.faculties?.full_name || 'Unknown'}
                                        </span>
                                        <span className={`status-badge-pill ${req.status}`}>{req.status}</span>
                                    </div>
                                    <div className="card-bottom">
                                        <div className="card-date">
                                            <label>Emp ID: {req.faculties?.employee_id || 'N/A'}</label>
                                            <span>{req.proposed_last_working_day}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </aside>

                    <section className="action-panel">
                        {selectedRequest ? (
                            <div className="verification-glass-card">
                                <div className="review-header">
                                    <h2>Verification Review</h2>
                                    <p>Reviewing resignation for <strong>{selectedRequest.faculties?.full_name}</strong></p>
                                </div>

                                <div className="info-grid">
                                    <div className={`notice-box ${checkNoticePeriod(selectedRequest.proposed_last_working_day) < 90 ? 'danger' : 'success'}`}>
                                        <label>Notice Period</label>
                                        <div className="notice-val">
                                            {checkNoticePeriod(selectedRequest.proposed_last_working_day)} Days
                                        </div>
                                        <span>{checkNoticePeriod(selectedRequest.proposed_last_working_day) < 90 ? '⚠️ Short Notice' : '✅ Compliant'}</span>
                                    </div>
                                    
                                    <div className="detail-field">
                                        <label>Faculty Identity</label>
                                        <p>{selectedRequest.faculties?.full_name}</p>
                                        <p className="text-sm text-gray-500">ID: {selectedRequest.faculties?.employee_id}</p>
                                    </div>
                                </div>

                                <div className="reason-container">
                                    <label>Reason for Resignation</label>
                                    <div className="reason-text">{selectedRequest.reason}</div>
                                </div>

                                <div className="remarks-container">
                                    <label>Admin Remarks</label>
                                    <textarea 
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                        placeholder="Add notes for faculty..."
                                    />
                                </div>

                                <div className="decision-footer">
                                    {selectedRequest.status !== 'SUBMITTED' ? (
                                        <div className="status-locked-message">
                                            {selectedRequest.status === 'APPROVED' ? (
                                                <p className="status-locked-text success">✅ This request has been Approved.</p>
                                            ) : (
                                                <p className="status-locked-text error">❌ This request was Rejected.</p>
                                            )}
                                        </div>
                                    ) : (
                                        /* Mukkiyamaana maatram: 
                                           onRefresh prop ippo fetchRequests function-ai connect pannuthu.
                                        */
                                        <ClearanceTracker 
                                            request={selectedRequest} 
                                            loading={loading} 
                                            onAction={handleAction} 
                                            onRefresh={fetchRequests} 
                                        />
                                    )}
                                </div>

                                {selectedRequest.status === 'APPROVED' && (
                                    <DocumentIssuer 
                                        selectedRequest={selectedRequest} 
                                        onUpdate={fetchRequests} 
                                    />
                                )}
                            </div>
                        ) : (
                            <div className="empty-panel-view">
                                <div className="empty-icon">📁</div>
                                <h4>Select a Request</h4>
                                <p>Pick a faculty member to see full details</p>
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;