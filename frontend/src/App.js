// frontend/src/App.js
import React, { useState, useEffect } from 'react';
import './App.css';
import LeadForm from './components/LeadForm';
import LeadList from './components/LeadList';
import OrderList from './components/OrderList';
import Dashboard from './components/Dashboard';
// Only import specific API functions needed by App.js (like fetchLeads)
import { fetchLeads } from './api';

// REMOVED: const API_BASE_URL = 'http://127.0.0.1:8000'; // No longer needed here

function App() {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [leadViewMode, setLeadViewMode] = useState('list');
    const [activeSection, setActiveSection] = useState('dashboard'); // Changed default to 'dashboard'

    const fetchAllLeads = async () => {
        setLoading(true);
        setError(null);
        try {
            // apiFetchLeads (now just fetchLeads) internally uses the API_BASE_URL from api.js
            const fetchedLeads = await fetchLeads();
            setLeads(fetchedLeads);
        } catch (err) {
            console.error("Error fetching leads:", err);
            setError("Failed to fetch leads. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Fetch leads only when 'leads' section is active
        if (activeSection === 'leads') {
            fetchAllLeads();
        }
        // If Dashboard needs initial data, you'd fetch it when activeSection is 'dashboard'
    }, [activeSection]); // Depend on activeSection to refetch/load data

    const handleLeadAdded = (newLead) => {
        fetchAllLeads(); // Re-fetch all leads to update the list
    };

    const handleLeadUpdated = () => {
        fetchAllLeads(); // Re-fetch all leads to update the list after an edit/delete
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>TrackFlow CRM</h1>
            </header>
            <main className="container">
                <nav className="main-nav">
                    <button
                        className={activeSection === 'dashboard' ? 'active' : ''}
                        onClick={() => setActiveSection('dashboard')}
                    >
                        Dashboard
                    </button>
                    <button
                        className={activeSection === 'leads' ? 'active' : ''}
                        onClick={() => setActiveSection('leads')}
                    >
                        Manage Leads
                    </button>
                    <button
                        className={activeSection === 'orders' ? 'active' : ''}
                        onClick={() => setActiveSection('orders')}
                    >
                        Manage Orders
                    </button>
                </nav>

                {/* Conditional Rendering for Dashboard Section */}
                {activeSection === 'dashboard' && (
                    <section className="dashboard-section">
                        {/* Dashboard component does not need apiBaseUrl prop */}
                        <Dashboard />
                    </section>
                )}

                {/* Conditional Rendering for Lead Management Section */}
                {activeSection === 'leads' && (
                    <>
                        <section className="add-lead-section card">
                            <h2>Add New Lead</h2>
                            {/* REMOVED: apiBaseUrl={API_BASE_URL} */}
                            <LeadForm onLeadAdded={handleLeadAdded} />
                        </section>

                        <section className="lead-list-section">
                            <h2>Lead List</h2>
                            <div className="view-toggle">
                                <button
                                    className={leadViewMode === 'list' ? 'active' : ''}
                                    onClick={() => setLeadViewMode('list')}
                                >
                                    List View
                                </button>
                                <button
                                    className={leadViewMode === 'kanban' ? 'active' : ''}
                                    onClick={() => setLeadViewMode('kanban')}
                                >
                                    Kanban View
                                </button>
                            </div>

                            {loading && <p>Loading leads...</p>}
                            {error && <p className="error">{error}</p>}
                            {!loading && !error && leads.length === 0 && (
                                <p>No leads found. Add a new one!</p>
                            )}
                            {!loading && !error && leads.length > 0 && (
                                <LeadList
                                    leads={leads}
                                    viewMode={leadViewMode}
                                    onLeadUpdated={handleLeadUpdated}
                                // REMOVED: apiBaseUrl={API_BASE_URL}
                                />
                            )}
                        </section>
                    </>
                )}

                {/* Conditional Rendering for Order Management Section */}
                {activeSection === 'orders' && (
                    <section className="order-management-section">
                        {/* OrderList component also does not need apiBaseUrl prop if its functions use api.js */}
                        <OrderList />
                    </section>
                )}
            </main>
        </div>
    );
}

export default App;