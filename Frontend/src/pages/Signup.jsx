import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { Activity } from 'lucide-react';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    hospital_name: '',
    total_beds: '',
    total_oxygen: '',
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ 
      ...formData, 
      [name]: ['total_beds', 'total_oxygen'].includes(name) ? (value ? Number(value) : '') : value 
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/signup', formData);
      const loginRes = await api.post('/login', { email: formData.email, password: formData.password });
      localStorage.setItem('token', loginRes.data.access_token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred during signup.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.blobs}>
        <div style={styles.blob1}></div>
        <div style={styles.blob2}></div>
      </div>
      <div style={styles.card}>
        <div style={styles.header}>
          <Activity size={48} color="#4f46e5" style={styles.icon} />
          <h2 style={styles.title}>Partner With Us</h2>
          <p style={styles.subtitle}>Register your hospital to manage resources in real-time.</p>
        </div>
        
        {error && <div style={styles.error}>{error}</div>}
        
        <form onSubmit={handleSignup} style={styles.form}>
          <div style={styles.inputGroup}>
            <input name="hospital_name" type="text" placeholder="Hospital Name" required onChange={handleChange} style={styles.input} />
          </div>
          
          <div style={styles.row}>
            <div style={styles.inputGroupHalf}>
              <input name="total_beds" type="number" min="0" placeholder="Total Beds" required onChange={handleChange} style={styles.input} />
            </div>
            <div style={styles.inputGroupHalf}>
              <input name="total_oxygen" type="number" min="0" placeholder="Total Oxygen" required onChange={handleChange} style={styles.input} />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <input name="name" type="text" placeholder="Admin Full Name" required onChange={handleChange} style={styles.input} />
          </div>
          
          <div style={styles.inputGroup}>
            <input name="email" type="email" placeholder="Email Address" required onChange={handleChange} style={styles.input} />
          </div>
          
          <div style={styles.inputGroup}>
            <input name="password" type="password" placeholder="Create Password" required onChange={handleChange} style={styles.input} />
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Setting up...' : 'Create Account'}
          </button>
        </form>
        
        <p style={styles.footerText}>
          Already have an account? <Link to="/login" style={styles.link}>Sign in instead</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: '"Inter", sans-serif',
  },
  blobs: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    zIndex: 0,
  },
  blob1: {
    position: 'absolute',
    top: '-10%',
    left: '-10%',
    width: '50vw',
    height: '50vw',
    background: 'radial-gradient(circle, rgba(79,70,229,0.4) 0%, rgba(0,0,0,0) 70%)',
    borderRadius: '50%',
    filter: 'blur(60px)',
  },
  blob2: {
    position: 'absolute',
    bottom: '-10%',
    right: '-10%',
    width: '40vw',
    height: '40vw',
    background: 'radial-gradient(circle, rgba(236,72,153,0.3) 0%, rgba(0,0,0,0) 70%)',
    borderRadius: '50%',
    filter: 'blur(60px)',
  },
  card: {
    position: 'relative',
    zIndex: 1,
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '24px',
    padding: '40px',
    width: '100%',
    maxWidth: '480px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  icon: {
    marginBottom: '16px',
    filter: 'drop-shadow(0 0 10px rgba(79,70,229,0.5))',
  },
  title: {
    margin: 0,
    color: '#ffffff',
    fontSize: '28px',
    fontWeight: '700',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    margin: '8px 0 0 0',
    color: '#94a3b8',
    fontSize: '15px',
  },
  error: {
    background: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    padding: '12px',
    borderRadius: '12px',
    marginBottom: '20px',
    fontSize: '14px',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  row: {
    display: 'flex',
    gap: '16px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  inputGroupHalf: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  input: {
    width: '100%',
    background: 'rgba(15, 23, 42, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#ffffff',
    padding: '14px 16px',
    borderRadius: '12px',
    fontSize: '15px',
    outline: 'none',
    transition: 'all 0.2s',
    boxSizing: 'border-box',
  },
  button: {
    marginTop: '8px',
    background: 'linear-gradient(135deg, #4f46e5 0%, #ec4899 100%)',
    color: '#ffffff',
    border: 'none',
    padding: '16px',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: '0 4px 15px rgba(79, 70, 229, 0.4)',
  },
  footerText: {
    marginTop: '24px',
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: '14px',
  },
  link: {
    color: '#ec4899',
    textDecoration: 'none',
    fontWeight: '600',
  }
};

export default Signup;
