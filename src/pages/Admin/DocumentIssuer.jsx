import React, { useState } from 'react';
import { supabase } from '../../config/supabase';
import '../../styles/DocumentManager.css';

const DocumentIssuer = ({ selectedRequest, onUpdate }) => {
    const [generating, setGenerating] = useState(null);

    // Calculate experience from joining date to last working day
    const calculateExperience = (joinDate, lastDate) => {
        if (!joinDate || !lastDate) return "Dates missing";
        
        const start = new Date(joinDate);
        const end = new Date(lastDate);
        
        let years = end.getFullYear() - start.getFullYear();
        let months = end.getMonth() - start.getMonth();
        let days = end.getDate() - start.getDate();

        if (days < 0) {
            months--;
            days += new Date(end.getFullYear(), end.getMonth(), 0).getDate();
        }
        if (months < 0) {
            years--;
            months += 12;
        }
        return `${years}Y, ${months}M, ${days}D`;
    };

    const handleGenerate = async (certType, fieldName) => {
        setGenerating(certType);
        
        const { error } = await supabase
            .from('relieving_requests')
            .update({ [fieldName]: true })
            .eq('id', selectedRequest.id);

        if (error) {
            alert(`Error updating ${certType}: ` + error.message);
        } else {
            alert(`${certType} has been issued to the faculty.`);
            onUpdate(); // Refreshes the list in the parent AdminDashboard
        }
        setGenerating(null);
    };

    const docTypes = [
        { label: 'Relieving Letter', field: 'relieving_letter_ready' },
        { label: 'Experience Certificate', field: 'experience_cert_ready' },
        { label: 'Service Certificate', field: 'service_cert_ready' },
        { label: 'Settlement Statement', field: 'settlement_ready' }
    ];

    return (
        <div className="certificate-manager-section">
            <div className="cert-header">
                <h3>📜 Document Management</h3>
                <span className="exp-calc">
                    Tenure: {calculateExperience(
                        selectedRequest.faculties?.joining_date, 
                        selectedRequest.approved_last_working_day || selectedRequest.proposed_last_working_day
                    )}
                </span>
            </div>
            
            <div className="cert-grid">
                {docTypes.map((doc) => (
                    <div className="cert-item" key={doc.field}>
                        <p>{doc.label}</p>
                        <button 
                            className={`btn-cert ${selectedRequest[doc.field] ? 'done' : ''}`}
                            onClick={() => handleGenerate(doc.label, doc.field)}
                            disabled={generating === doc.label}
                        >
                            {generating === doc.label ? '...' : (selectedRequest[doc.field] ? '✅ Ready' : 'Issue')}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DocumentIssuer;