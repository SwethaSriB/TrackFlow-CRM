// frontend/src/App.js
import React, { useState, useEffect } from 'react';
import './App.css';
import LeadForm from './components/LeadForm';
import LeadList from './components/LeadList';
import OrderList from './components/OrderList';
import Dashboard from './components/Dashboard'; // NEW: Import Dashboard
import { fetchLeads as apiFetchLeads } from './api';

const API_BASE_URL = 'http://127.0.0.1:8000';

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
            const fetchedLeads = await apiFetchLeads();
            setLeads(fetchedLeads);
        } catch (err) {
            console.error("Error fetching leads:", err);
            setError("Failed to fetch leads. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeSection === 'leads') {
            fetchAllLeads();
        }
    }, [activeSection]);

    const handleLeadAdded = (newLead) => {
        fetchAllLeads();
    };

    const handleLeadUpdated = () => {
        fetchAllLeads();
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
                        Dashboard {/* NEW: Dashboard Button */}
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
                        <Dashboard />
                    </section>
                )}

                {/* Conditional Rendering for Lead Management Section */}
                {activeSection === 'leads' && (
                    <>
                        <section className="add-lead-section card">
                            <h2>Add New Lead</h2>
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
                                />
                            )}
                        </section>
                    </>
                )}

                {/* Conditional Rendering for Order Management Section */}
                {activeSection === 'orders' && (
                    <section className="order-management-section">
                        <OrderList />
                    </section>
                )}
            </main>
        </div>
    );
}

export default App;