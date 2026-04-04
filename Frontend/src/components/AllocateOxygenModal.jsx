import React, { useState, useEffect } from 'react';
import { X, Wind, Loader2 } from 'lucide-react';
import api from '../api';

const AllocateOxygenModal = ({ isOpen, onClose, onSave }) => {
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchPatients = async () => {
        setIsLoading(true);
        try {
          // Fetch patients currently in beds who might need oxygen
          const response = await api.get('/allocated-beds');
          setPatients(response.data || []);
          if (response.data && response.data.length > 0) {
            setSelectedPatientId(response.data[0].patient_id);
          }
        } catch (error) {
          console.error("Failed to fetch allocated beds:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchPatients();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatientId) return;
    
    setIsSubmitting(true);
    await onSave(selectedPatientId);
    setIsSubmitting(false);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      opacity: isOpen ? 1 : 0,
      transition: 'opacity 0.2s ease',
      padding: '1rem'
    }}>
      <div className="glass-card animate-fade-in" style={{
        width: '100%',
        maxWidth: '450px',
        padding: '2rem',
        background: 'rgba(255, 255, 255, 0.95)'
      }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'var(--primary-teal-light)', padding: '0.5rem', borderRadius: '0.5rem', color: 'var(--primary-teal)' }}>
               <Wind size={20} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-main)', margin: 0 }}>Allocate Oxygen</h2>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)', padding: '0.25rem' }}>
            <X size={20} />
          </button>
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            <Loader2 className="animate-spin" style={{ color: 'var(--primary-teal)' }} size={24} />
          </div>
        ) : patients.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
            <p>No patients currently admitted to beds.</p>
            <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>You must allocate a bed to a patient first before assigning oxygen.</p>
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ marginTop: '1.5rem', width: '100%' }}>
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="input-group">
              <label className="input-label">Select Patient</label>
              <select 
                className="input-field" 
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                required
              >
                {patients.map(p => (
                  <option key={p.patient_id} value={p.patient_id}>
                    {p.patient_name} (ID: {p.patient_id}) - {p.bed_type}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button 
                type="button" 
                onClick={onClose}
                className="btn btn-secondary" 
                style={{ flex: 1 }}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ flex: 1, background: 'linear-gradient(135deg, var(--primary-teal), #059669)' }}
                disabled={isSubmitting || !selectedPatientId}
              >
                {isSubmitting ? 'Allocating...' : 'Confirm Oxygen'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

export default AllocateOxygenModal;
