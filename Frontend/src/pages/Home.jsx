import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ShieldPlus, HeartPulse } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="animate-fade-in" style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <div className="glass-card" style={{ 
        maxWidth: '800px', 
        width: '100%',
        padding: '4rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2rem'
      }}>
        <div style={{
          background: 'var(--primary-teal-light)',
          padding: '1rem',
          borderRadius: '50%',
          display: 'inline-flex',
          marginBottom: '1rem'
        }}>
          <Activity size={48} color="var(--primary-teal)" />
        </div>
        
        <div>
          <h1 style={{ 
            fontSize: '3rem', 
            fontWeight: '700', 
            marginBottom: '1rem',
            lineHeight: 1.2
          }}>
            Hospital Resource <br/>
            <span className="gradient-text">Management System</span>
          </h1>
          <p style={{
            fontSize: '1.125rem',
            color: 'var(--text-muted)',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Real-time monitoring and predictive framework for hospital beds and oxygen supply management. 
            Ensure critical resources are always available when needed most.
          </p>
        </div>

        <div style={{
          display: 'flex',
          gap: '2rem',
          marginTop: '2rem',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
            <ShieldPlus size={20} color="var(--primary-blue)" />
            <span>AI Predictive Analytics</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
            <HeartPulse size={20} color="var(--accent-red)" />
            <span>Real-time Tracking</span>
          </div>
        </div>

        <button 
          className="btn btn-primary" 
          style={{ padding: '0.875rem 2rem', fontSize: '1.125rem' }}
          onClick={() => navigate('/dashboard')}
        >
          Open Dashboard
        </button>
      </div>
    </div>
  );
};

export default Home;
