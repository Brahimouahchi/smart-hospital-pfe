import React, { useState, useEffect } from 'react';
import MainLayout from './components/MainLayout';
import Login from './components/Login'; // <--- New Import
import AddPatientForm from './components/AddPatientForm';
import PatientList from './components/PatientList';
import Dashboard from './components/Dashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [view, setView] = useState('dashboard');

  // Check if user is already logged in (Check LocalStorage)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  // IF NOT LOGGED IN -> SHOW LOGIN PAGE
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  // IF LOGGED IN -> SHOW MAIN APP
  return (
    <MainLayout setView={setView} onLogout={handleLogout}> 
       {view === 'dashboard' && <Dashboard />}
       {view === 'patients' && <PatientList />}
       {view === 'register' && <AddPatientForm />}
    </MainLayout>
  );
}

export default App;