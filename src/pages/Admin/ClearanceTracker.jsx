import React from 'react';

const ClearanceTracker = ({ request = {}, loading = false, onAction }) => {

    // Data structure configuration
    const modules = [
        { id: 'academic', label: 'Academic', data: request?.academic_clearance },
        { id: 'library', label: 'Library', data: request?.library_clearance },
        { id: 'financial', label: 'Financial', data: request?.financial_clearance },
        { id: 'asset', label: 'IT / Assets', data: request?.asset_clearance }
    ];

    const normalizedModules = modules.map(m => {
        // Supabase returns an array or object based on join type, handling both
        const item = (Array.isArray(m.data) && m.data.length > 0) ? m.data[0] : (m.data || null); 
        let isApproved = false;

        // Debugging logs
        console.log(`Checking ${m.id} data:`, item);

        if (!item) {
            isApproved = false; 
        } else {
            switch (m.id) {
                case 'academic':
                    // Direct status check logic
                    isApproved = item.status === 'APPROVED' || item.status === true; 
                    break;
                case 'library':
                    isApproved = String(item.books_returned) === 'true' && String(item.fines_paid) === 'true';
                    break;
                case 'financial':
                    isApproved = String(item.advance_settled) === 'true' && String(item.salary_processed) === 'true';
                    break;
                case 'asset':
                    // Asset table specific logic
                    isApproved = String(item.laptop_returned) === 'true' && String(item.id_card_returned) === 'true';
                    break;
                default:
                    isApproved = false;
            }
        }

        return {
            ...m,
            status: isApproved ? 'APPROVED' : 'PENDING'
        };
    });

    const isFullyCleared = normalizedModules.every(m => m.status === 'APPROVED');

    const getStatusUI = (status) => {
        if (status === 'APPROVED') {
            return { icon: '✅', color: '#166534', bg: '#f0fdf4', border: '#bbf7d0' };
        }
        return { icon: '❌', color: '#991b1b', bg: '#fef2f2', border: '#fecaca' };
    };

    return (
        <div style={{ marginTop: '24px', padding: '20px', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '16px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                🛡️ Departmental Clearances
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {normalizedModules.map(m => {
                    const ui = getStatusUI(m.status);
                    return (
                        <div key={m.id} style={{
                            padding: '12px', borderRadius: '8px', border: '1px solid',
                            backgroundColor: ui.bg, borderColor: ui.border, color: ui.color,
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            transition: 'all 0.3s ease'
                        }}>
                            <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{m.label}</span>
                            <span style={{ fontSize: '1.1rem' }}>{ui.icon}</span>
                        </div>
                    );
                })}
            </div>

            {request.status === 'SUBMITTED' && (
                <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                    <button 
                        onClick={() => onAction('REJECTED')} 
                        style={{ 
                            flex: 1, padding: '12px', borderRadius: '8px', cursor: 'pointer',
                            border: '1px solid #ef4444', color: '#ef4444', backgroundColor: 'transparent',
                            fontWeight: '600'
                        }}
                    >
                        Reject
                    </button>
                    <button 
                        disabled={!isFullyCleared || loading} 
                        onClick={() => onAction('APPROVED')} 
                        style={{ 
                            flex: 2, 
                            cursor: isFullyCleared ? 'pointer' : 'not-allowed',
                            backgroundColor: isFullyCleared ? '#2563eb' : '#cbd5e1',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            transition: 'all 0.2s'
                        }} 
                    >
                        {loading ? 'Processing...' : 'Approve & Release'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default ClearanceTracker;