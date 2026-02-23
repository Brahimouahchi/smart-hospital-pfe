import React, { useState, useEffect } from 'react';
import MainLayout from './components/MainLayout';
import Login from './components/Login';
import AddPatientForm from './components/AddPatientForm';
import PatientList from './components/PatientList';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import DoctorConsultations from './components/DoctorConsultations';
import UserManagement from './components/UserManagement';
import AppointmentScheduler from './components/AppointmentScheduler';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [view, setView] = useState('dashboard');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <MainLayout setView={setView} onLogout={handleLogout}> 
       {view === 'dashboard' && <Dashboard />}
       {view === 'patients' && <PatientList />}
       {view === 'register' && <AddPatientForm />}
       {view === 'appointments' && <AppointmentScheduler />}
       {view === 'inventory' && <Inventory />} 
       {view === 'dr_consultations' && <DoctorConsultations />}
       {view === 'users' && <UserManagement />}
    </MainLayout>
  );
}

export default App;