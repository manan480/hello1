import React, { useState, useEffect } from 'react';
import { BedDouble, Wind, Trash2, Loader2, Search } from 'lucide-react';
import api from '../api';

const AllocationsTable = ({ refreshTrigger, onDeallocate }) => {
  const [bedAllocations, setBedAllocations] = useState([]);
  const [oxygenAllocations, setOxygenAllocations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAllocations = async () => {
    setLoading(true);
    try {
      const [bedsRes, oxygenRes] = await Promise.all([
        api.get('/allocated-beds'),
        api.get('/allocated-oxygen')
      ]);
      setBedAllocations(bedsRes.data || []);
      setOxygenAllocations(oxygenRes.data || []);
    } catch (error) {
      console.error("Failed to fetch allocations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllocations();
  }, [refreshTrigger]);

  const handleDeallocateBed = async (patientId) => {
    if (window.confirm("Are you sure you want to discharge this patient? This will release their bed and oxygen.")) {
      try {
        await api.post(`/beddeallocate/${patientId}`);
        fetchAllocations();
        if (onDeallocate) onDeallocate();
      } catch (error) {
        console.error("Failed to deallocate bed:", error);
      }
    }
  };

  const handleDeallocateOxygen = async (patientId) => {
    if (window.confirm("Are you sure you want to stop oxygen allocation for this patient?")) {
      try {
        await api.post(`/oxygendeallocate/${patientId}`);
        fetchAllocations();
        if (onDeallocate) onDeallocate();
      } catch (error) {
        console.error("Failed to deallocate oxygen:", error);
      }
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)' }}>
        <Loader2 className="animate-spin" style={{ color: 'var(--primary-blue)' }} size={32} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Bed Allocations */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#f8fafc' }}>
          <div style={{ background: 'var(--primary-blue-light)', padding: '0.5rem', borderRadius: '0.5rem', color: 'var(--primary-blue)' }}>
            <BedDouble size={20} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>Active Bed Allocations ({bedAllocations.length})</h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          {bedAllocations.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No beds are currently allocated.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#fefefe', borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>ID</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>Patient Name</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>Bed Type</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: '600', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bedAllocations.map((alloc) => (
                  <tr key={alloc.patient_id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '1rem 1.5rem', fontWeight: '500' }}>#{alloc.patient_id}</td>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--text-main)', fontWeight: '500' }}>{alloc.patient_name}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span className="badge" style={{ backgroundColor: '#f1f5f9', color: 'var(--text-muted)' }}>
                        {alloc.bed_type}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                      <button 
                        onClick={() => handleDeallocateBed(alloc.patient_id)}
                        className="btn btn-secondary" 
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', color: 'var(--accent-red)', borderColor: 'var(--accent-red-light)' }}
                      >
                        <Trash2 size={14} /> Discharge
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Oxygen Allocations */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#f8fafc' }}>
          <div style={{ background: 'var(--primary-teal-light)', padding: '0.5rem', borderRadius: '0.5rem', color: 'var(--primary-teal)' }}>
            <Wind size={20} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>Active Oxygen Tents ({oxygenAllocations.length})</h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          {oxygenAllocations.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No oxygen cylinders are currently allocated.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#fefefe', borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>Patient ID</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>Patient Name</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: '600', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {oxygenAllocations.map((alloc) => (
                  <tr key={alloc.patient_id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '1rem 1.5rem', fontWeight: '500' }}>#{alloc.patient_id}</td>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--text-main)', fontWeight: '500' }}>{alloc.patient_name}</td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                      <button 
                        onClick={() => handleDeallocateOxygen(alloc.patient_id)}
                        className="btn btn-secondary" 
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', color: 'var(--accent-orange)' }}
                      >
                        <Trash2 size={14} /> Stop Oxygen
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
};

export default AllocationsTable;
