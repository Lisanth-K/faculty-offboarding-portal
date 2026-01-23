import React, { useState } from 'react';
import ClearanceModal from './ClearanceModal';

const ClearanceTracker = ({ request = {}, loading = false, onAction, onRefresh }) => {
    const [activeModal, setActiveModal] = useState(null);

    const modules = [
        { id: 'academic', label: 'Academic', data: request?.academic_clearance },
        { id: 'library', label: 'Library', data: request?.library_clearance },
        { id: 'financial', label: 'Financial', data: request?.financial_clearance },
        { id: 'asset', label: 'IT / Assets', data: request?.asset_clearance }
    ];

    const normalizedModules = modules.map(m => {
        // Supabase data array-ah irundhalum handle pannum
        const item = Array.isArray(m.data) ? m.data[0] : m.data; 
        const isApproved = item?.status === 'APPROVED';

        return { ...m, status: isApproved ? 'APPROVED' : 'PENDING' };
    });

    const isFullyCleared = normalizedModules.every(m => m.status === 'APPROVED');

    const getStatusUI = (status) => {
        if (status === 'APPROVED') {
            return { icon: '✅', color: '#166534', bg: '#f0fdf4', border: '#bbf7d0' };
        }
        return { icon: '⏳', color: '#991b1b', bg: '#fef2f2', border: '#fecaca' };
    };

    return (
        <div style={{ marginTop: '24px', padding: '20px', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '16px', color: '#475569', textTransform: 'uppercase' }}>
                🛡️ Departmental Clearances
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {normalizedModules.map(m => {
                    const ui = getStatusUI(m.status);
                    return (
                        <div key={m.id} style={{
                            padding: '12px', borderRadius: '8px', border: '1px solid',
                            backgroundColor: ui.bg, borderColor: ui.border, color: ui.color,
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                            <div>
                                <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{m.label}</div>
                                {m.id !== 'academic' && m.status === 'PENDING' && (
                                    <button 
                                        onClick={() => setActiveModal(m.id)}
                                        style={{
                                            marginTop: '8px', padding: '4px 10px', fontSize: '0.7rem',
                                            backgroundColor: '#2563eb', color: 'white', border: 'none',
                                            borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
                                        }}
                                    >
                                        CLEAR NOW
                                    </button>
                                )}
                            </div>
                            <span style={{ fontSize: '1.2rem' }}>{ui.icon}</span>
                        </div>
                    );
                })}
            </div>

            <ClearanceModal 
                isOpen={!!activeModal}
                type={activeModal}
                request={request}
                onClose={() => setActiveModal(null)}
                onRefresh={onRefresh}
            />

            {request.status === 'SUBMITTED' && (
                <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                    <button onClick={() => onAction('REJECTED')} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ef4444', color: '#ef4444', fontWeight: '600', cursor: 'pointer', background: 'none' }}>
                        Reject Request
                    </button>
                    <button 
                        disabled={!isFullyCleared || loading} 
                        onClick={() => onAction('APPROVED')} 
                        style={{ 
                            flex: 2, borderRadius: '8px', border: 'none', fontWeight: '600',
                            backgroundColor: isFullyCleared ? '#2563eb' : '#cbd5e1',
                            color: 'white', cursor: isFullyCleared ? 'pointer' : 'not-allowed'
                        }} 
                    >
                        {loading ? 'Processing...' : 'Approve & Release Faculty'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default ClearanceTracker;