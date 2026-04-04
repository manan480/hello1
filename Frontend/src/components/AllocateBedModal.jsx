import React, { useState } from 'react';
import { X, BedDouble } from 'lucide-react';

const AllocateBedModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    contact_number: '',
    bed_type: 'General Bed',
    requires_oxygen: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSave({
      ...formData,
      age: parseInt(formData.age, 10) || 0
    });
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
        maxWidth: '500px',
        padding: '2rem',
        background: 'rgba(255, 255, 255, 0.95)'
      }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'var(--primary-blue-light)', padding: '0.5rem', borderRadius: '0.5rem', color: 'var(--primary-blue)' }}>
               <BedDouble size={20} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-main)', margin: 0 }}>Allocate Hospital Bed</h2>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)', padding: '0.25rem' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="input-group">
            <label className="input-label">Patient Name</label>
            <input 
              type="text" 
              name="name"
              className="input-field" 
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g. John Doe"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group">
              <label className="input-label">Age</label>
              <input 
                type="number" 
                name="age"
                className="input-field" 
                value={formData.age}
                onChange={handleChange}
                required
                min="0"
              />
            </div>
            <div className="input-group">
              <label className="input-label">Gender</label>
              <select 
                name="gender"
                className="input-field" 
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Contact Number</label>
            <input 
              type="tel" 
              name="contact_number"
              className="input-field" 
              value={formData.contact_number}
              onChange={handleChange}
              required
              placeholder="+1 234 567 8900"
            />
          </div>

          <div className="input-group">
            <label className="input-label">Bed Type Required</label>
            <select 
              name="bed_type"
              className="input-field" 
              value={formData.bed_type}
              onChange={handleChange}
            >
              <option value="General Bed">General Bed</option>
              <option value="ICU Bed">ICU Bed</option>
              <option value="Ventilator Bed">Ventilator Bed</option>
            </select>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginTop: '0.5rem' }}>
            <input 
              type="checkbox" 
              name="requires_oxygen"
              checked={formData.requires_oxygen}
              onChange={handleChange}
              style={{ width: '1rem', height: '1rem', accentColor: 'var(--primary-teal)' }}
            />
            <span style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>Auto-allocate Oxygen Cylinder</span>
          </label>

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
              style={{ flex: 1 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Allocating...' : 'Confirm Allocation'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default AllocateBedModal;
