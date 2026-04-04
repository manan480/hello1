import React, { useState, useEffect } from 'react';
import DashboardHeader from '../components/DashboardHeader';
import AiPredictionSidebar from '../components/AiPredictionSidebar';
import ResourceCards from '../components/ResourceCards';
import EditResourcesModal from '../components/EditResourcesModal';
import AllocateBedModal from '../components/AllocateBedModal';
import AllocateOxygenModal from '../components/AllocateOxygenModal';
import AllocationsTable from '../components/AllocationsTable';
import { LayoutDashboard, Users } from 'lucide-react';
import api from '../api';

const Dashboard = () => {
  const [resources, setResources] = useState({
    beds: { total: 0, occupied: 0, available: 0 },
    oxygen: { total: 0, remaining: 0, dailyUsage: 0 }
  });

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'allocations'
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBedModalOpen, setIsBedModalOpen] = useState(false);
  const [isOxygenModalOpen, setIsOxygenModalOpen] = useState(false);
  
  // To trigger re-fetches without refreshing the page
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchResources = async () => {
    try {
      const response = await api.get('/resources');
      const data = response.data;
      setResources({
        beds: { 
          total: data.total_beds, 
          occupied: data.occupied_beds, 
          available: data.available_beds 
        },
        oxygen: { 
          total: data.total_oxygen, 
          remaining: data.available_oxygen, 
          dailyUsage: data.allocated_oxygen // Using allocated as pseudo-daily usage for UI
        }
      });
    } catch (error) {
      console.error("Failed to fetch resources:", error);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [refreshTrigger]);

  const handleEditTotals = async (newTotals) => {
    try {
      await api.post('/updateResources', {
        total_beds: newTotals.totalBeds,
        total_oxygen: newTotals.totalOxygen
      });
      setIsEditModalOpen(false);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error("Failed to update resources:", error);
    }
  };

  const handleAllocateBed = async (patientData) => {
    try {
      await api.post('/bedallocate', patientData);
      setRefreshTrigger(prev => prev + 1);
      setIsBedModalOpen(false);
    } catch (error) {
      console.error("Failed to allocate bed:", error);
      alert(error.response?.data?.detail || "Failed to allocate bed. Please check capacity.");
    }
  };

  const handleAllocateOxygen = async (patientId) => {
    try {
      await api.post(`/oxygenallocate/${patientId}`);
      setRefreshTrigger(prev => prev + 1);
      setIsOxygenModalOpen(false);
    } catch (error) {
      console.error("Failed to allocate oxygen:", error);
      alert(error.response?.data?.detail || "Failed to allocate oxygen. Please check capacity.");
    }
  };

  return (
    <div className="dashboard-layout animate-fade-in">
      <AiPredictionSidebar refreshTrigger={refreshTrigger} />
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '100%', overflow: 'hidden' }}>
        <DashboardHeader onEditClick={() => setIsEditModalOpen(true)} />
        
        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
          <button 
            onClick={() => setActiveTab('overview')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', 
              color: activeTab === 'overview' ? 'var(--primary-teal)' : 'var(--text-muted)',
              borderBottom: activeTab === 'overview' ? '2px solid var(--primary-teal)' : '2px solid transparent',
              fontWeight: activeTab === 'overview' ? '600' : '500',
              transition: 'all 0.2s ease'
            }}
          >
            <LayoutDashboard size={18} /> Overview
          </button>
          <button 
            onClick={() => setActiveTab('allocations')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', 
              color: activeTab === 'allocations' ? 'var(--primary-blue)' : 'var(--text-muted)',
              borderBottom: activeTab === 'allocations' ? '2px solid var(--primary-blue)' : '2px solid transparent',
              fontWeight: activeTab === 'allocations' ? '600' : '500',
              transition: 'all 0.2s ease'
            }}
          >
            <Users size={18} /> Patient Allocations
          </button>
        </div>

        {activeTab === 'overview' ? (
          <ResourceCards 
            resources={resources} 
            onAllocateBed={() => setIsBedModalOpen(true)}
            onAllocateOxygen={() => setIsOxygenModalOpen(true)}
          />
        ) : (
          <AllocationsTable 
            refreshTrigger={refreshTrigger}
            onDeallocate={() => setRefreshTrigger(prev => prev + 1)}
          />
        )}
      </div>

      {isEditModalOpen && (
        <EditResourcesModal 
          isOpen={isEditModalOpen}
          initialData={{ totalBeds: resources.beds.total, totalOxygen: resources.oxygen.total }}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleEditTotals}
        />
      )}

      {isBedModalOpen && (
        <AllocateBedModal 
          isOpen={isBedModalOpen}
          onClose={() => setIsBedModalOpen(false)}
          onSave={handleAllocateBed}
        />
      )}

      {isOxygenModalOpen && (
        <AllocateOxygenModal 
          isOpen={isOxygenModalOpen}
          onClose={() => setIsOxygenModalOpen(false)}
          onSave={handleAllocateOxygen}
        />
      )}
    </div>
  );
};

export default Dashboard;
