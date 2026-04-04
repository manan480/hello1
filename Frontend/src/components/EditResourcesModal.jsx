import React, { useState } from 'react';
import { X, Save } from 'lucide-react';

const EditResourcesModal = ({ isOpen, initialData, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    totalBeds: initialData.totalBeds,
    totalOxygen: initialData.totalOxygen
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseInt(value) || 0
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }} className="animate-fade-in">
      <div className="glass-card" style={{ width: '100%', maxWidth: '450px', padding: '0' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid var(--border-light)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>Edit Hospital Resources</h2>
          <button onClick={onClose} style={{ color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="input-group">
            <label className="input-label" htmlFor="totalBeds">Total Hospital Beds</label>
            <input 
              type="number" 
              id="totalBeds" 
              name="totalBeds" 
              className="input-field" 
              value={formData.totalBeds} 
              onChange={handleChange}
              min="0"
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="totalOxygen">Total Oxygen Cylinders</label>
            <input 
              type="number" 
              id="totalOxygen" 
              name="totalOxygen" 
              className="input-field" 
              value={formData.totalOxygen} 
              onChange={handleChange}
              min="0"
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', paddingTop: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              <Save size={18} />
              Save Changes
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default EditResourcesModal;
