import React, { useState } from 'react';
import { supabase } from '../../config/supabase';
import '../../styles/ClearanceModal.css';

const ClearanceModal = ({ isOpen, type, request, onClose, onRefresh }) => {
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    const tableConfig = {
        library: {
            tableName: 'library_clearance',
            fields: [
                { id: 'books_returned', label: 'Books Returned' },
                { id: 'fines_paid', label: 'Fines Paid' }
            ]
        },
        financial: {
            tableName: 'financial_clearance',
            fields: [
                { id: 'advance_settled', label: 'Advance Settled' },
                { id: 'salary_processed', label: 'Salary Processed' }
            ]
        },
        asset: {
            tableName: 'asset_clearance',
            fields: [
                { id: 'laptop_returned', label: 'Laptop Returned' },
                { id: 'id_card_returned', label: 'ID Card Returned' }
            ]
        }
    };

    const currentConfig = tableConfig[type];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const formData = new FormData(e.target);
        const updateData = {};
        
        currentConfig.fields.forEach(field => {
            updateData[field.id] = formData.get(field.id) === 'on';
        });

        try {
            // UPSERT Logic: request_id irundha update pannum, illana create pannum
            const { error } = await supabase
                .from(currentConfig.tableName)
                .upsert([{ 
                    request_id: request.id,
                    faculty_id: request.faculty_id,
                    ...updateData, 
                    status: 'APPROVED',
                    updated_at: new Date().toISOString()
                }], { onConflict: 'request_id' });

            if (error) throw error;

            alert(`${type.toUpperCase()} Clearance Approved!`);
            onRefresh(); 
            onClose();
        } catch (err) {
            console.error("UPSERT Error:", err);
            alert("Database Error: " + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-header">
                    <h3>{type.toUpperCase()} Clearance Form</h3>
                    <button className="close-x" onClick={onClose}>&times;</button>
                </div>
                
                <form onSubmit={handleSubmit} className="modal-body">
                    <div className="faculty-brief">
                        <p><strong>Faculty:</strong> {request.faculties?.full_name}</p>
                        <p><strong>ID:</strong> {request.faculties?.employee_id}</p>
                    </div>
                    
                    <div className="fields-group">
                        {currentConfig.fields.map(field => (
                            <label key={field.id} className="checkbox-row">
                                <input type="checkbox" name={field.id} required />
                                <span>{field.label}</span>
                            </label>
                        ))}
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-approve" disabled={submitting}>
                            {submitting ? 'Processing...' : 'Confirm Approval'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ClearanceModal;