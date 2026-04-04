import React, { useState, useEffect } from 'react';
import { Building2, Clock, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DashboardHeader = ({ onEditClick }) => {
  const [currentTime, setCurrentTime] = useState('');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format to IST
      const options = { 
        timeZone: 'Asia/Kolkata',
        day: '2-digit', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      };
      setCurrentTime(now.toLocaleString('en-IN', options) + ' IST');
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-card" style={{ padding: '1.5rem 2rem', borderBottom: '4px solid var(--primary-teal)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        
        <div>
          <h1 style={{ 
            fontSize: '1.75rem', 
            fontWeight: '700', 
            margin: '0 0 0.25rem 0',
            color: 'var(--text-main)'
          }}>
            Hospital Bed & Oxygen Monitoring System
          </h1>
          <h2 style={{ 
            fontSize: '1.125rem', 
            fontWeight: '500', 
            color: 'var(--primary-teal)',
            margin: '0 0 1.5rem 0'
          }}>
            Real-Time Resource Dashboard
          </h2>
          
          <div style={{ display: 'flex', gap: '2rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building2 size={16} />
              <span style={{ fontWeight: 500 }}>Hospital:</span> City Hospital
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={16} />
              <span style={{ fontWeight: 500 }}>Last Updated:</span> {currentTime}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-secondary" onClick={onEditClick}>
            <Settings size={18} />
            Edit Resources
          </button>
          <button className="btn btn-secondary" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderColor: '#ef4444' }} onClick={handleLogout}>
            <LogOut size={18} />
            Logout
          </button>
        </div>

      </div>
    </div>
  );
};

export default DashboardHeader;
