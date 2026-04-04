import React from 'react';
import { BedDouble, Wind, CheckCircle2, AlertCircle } from 'lucide-react';

const ResourceCards = ({ resources, onAllocateBed, onAllocateOxygen }) => {
  const { beds, oxygen } = resources;

  // Determine status color based on availability
  const bedStatusColor = (beds.available / beds.total) < 0.1 ? 'var(--accent-red)' : 'var(--accent-green)';
  const oxygenStatusColor = (oxygen.remaining / oxygen.total) < 0.2 ? 'var(--accent-red)' : 'var(--accent-green)';

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
      
      {/* Beds Card */}
      <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'var(--primary-blue-light)', padding: '0.75rem', borderRadius: '0.5rem', color: 'var(--primary-blue)' }}>
              <BedDouble size={28} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>Hospital Beds</h3>
          </div>
          <span className="badge" style={{ backgroundColor: bedStatusColor === 'var(--accent-red)' ? 'var(--accent-red-light)' : 'var(--accent-green-light)', color: bedStatusColor }}>
            {beds.available} Available
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', textAlign: 'center', background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-main)', lineHeight: 1 }}>{beds.total}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.25rem' }}>Total Beds</div>
          </div>
          <div style={{ width: '1px', background: 'var(--border-light)' }}></div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--accent-orange)', lineHeight: 1 }}>{beds.occupied}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.25rem' }}>Occupied Beds</div>
          </div>
          <div style={{ width: '1px', background: 'var(--border-light)' }}></div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: bedStatusColor, lineHeight: 1 }}>{beds.available}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.25rem' }}>Available Beds</div>
          </div>
        </div>

        <button 
          className="btn btn-primary" 
          onClick={onAllocateBed}
          disabled={beds.available === 0}
          style={{ width: '100%', opacity: beds.available === 0 ? 0.5 : 1, cursor: beds.available === 0 ? 'not-allowed' : 'pointer' }}
        >
          {beds.available > 0 ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {beds.available > 0 ? 'Allocate Bed' : 'No Beds Available'}
        </button>
      </div>

      {/* Oxygen Card */}
      <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'var(--primary-teal-light)', padding: '0.75rem', borderRadius: '0.5rem', color: 'var(--primary-teal)' }}>
              <Wind size={28} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>Oxygen Cylinders</h3>
          </div>
          <span className="badge" style={{ backgroundColor: oxygenStatusColor === 'var(--accent-red)' ? 'var(--accent-red-light)' : 'var(--accent-green-light)', color: oxygenStatusColor }}>
            {oxygen.remaining} Remaining
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', textAlign: 'center', background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-main)', lineHeight: 1 }}>{oxygen.total}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.25rem' }}>Total Cylinders</div>
          </div>
          <div style={{ width: '1px', background: 'var(--border-light)' }}></div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: oxygenStatusColor, lineHeight: 1 }}>{oxygen.remaining}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.25rem' }}>Remaining</div>
          </div>
          <div style={{ width: '1px', background: 'var(--border-light)' }}></div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary-blue)', lineHeight: 1 }}>{oxygen.dailyUsage}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.25rem' }}>Daily Usage</div>
          </div>
        </div>

        <button 
          className="btn btn-primary" 
          onClick={onAllocateOxygen}
          disabled={oxygen.remaining === 0}
          style={{ width: '100%', background: 'linear-gradient(135deg, var(--primary-teal), #059669)', opacity: oxygen.remaining === 0 ? 0.5 : 1, cursor: oxygen.remaining === 0 ? 'not-allowed' : 'pointer' }}
        >
          {oxygen.remaining > 0 ? <Wind size={18} /> : <AlertCircle size={18} />}
          {oxygen.remaining > 0 ? 'Allocate Cylinder' : 'No Cylinders Available'}
        </button>
      </div>

    </div>
  );
};

export default ResourceCards;
