// src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import { fetchDashboardMetrics } from '../api'; // Assuming api.js is in src/
import './Dashboard.css'; // You'll need to create this CSS file

function Dashboard() {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getMetrics = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await fetchDashboardMetrics();
                setMetrics(data);
            } catch (err) {
                console.error("Error fetching dashboard metrics:", err);
                setError("Failed to load dashboard metrics. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        getMetrics();
    }, []);

    // Helper to format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        // If dateString comes as 'YYYY-MM-DD' from Pydantic `date`
        return new Date(dateString + 'T00:00:00').toLocaleDateString(undefined, options);
    };


    if (loading) {
        return <div className="dashboard-container">Loading dashboard...</div>;
    }

    if (error) {
        return <div className="dashboard-container error-message">{error}</div>;
    }

    if (!metrics) {
        return <div className="dashboard-container">No metrics available.</div>;
    }

    return (
        <div className="dashboard-container">
            <h2>CRM Dashboard Overview</h2>

            <div className="metrics-grid">
                <div className="metric-card total-leads">
                    <h3>Total Leads</h3>
                    <p>{metrics.total_leads}</p>
                </div>

                <div className="metric-card total-orders">
                    <h3>Total Orders</h3>
                    <p>{metrics.total_orders}</p>
                </div>

                <div className="metric-card followups-due">
                    <h3>Follow-ups Due This Week</h3>
                    <p>{metrics.followups_due_this_week}</p>
                </div>
            </div>

            <div className="dashboard-sections">
                <div className="card leads-by-stage">
                    <h3>Leads by Stage</h3>
                    {Object.keys(metrics.leads_by_stage).length > 0 ? (
                        <ul>
                            {Object.entries(metrics.leads_by_stage).map(([stage, count]) => (
                                <li key={stage}>{stage}: {count}</li>
                            ))}
                        </ul>
                    ) : (
                        <p>No leads in any stage.</p>
                    )}
                </div>

                <div className="card orders-by-status">
                    <h3>Orders by Status</h3>
                    {Object.keys(metrics.orders_by_status).length > 0 ? (
                        <ul>
                            {Object.entries(metrics.orders_by_status).map(([status, count]) => (
                                <li key={status}>{status}: {count}</li>
                            ))}
                        </ul>
                    ) : (
                        <p>No orders in any status.</p>
                    )}
                </div>
            </div>

            <div className="card overdue-followups">
                <h3>Overdue Follow-ups</h3>
                {metrics.overdue_followups && metrics.overdue_followups.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>Lead Name</th>
                                <th>Contact</th>
                                <th>Current Stage</th>
                                <th>Overdue Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {metrics.overdue_followups.map(lead => (
                                <tr key={lead.id} className="overdue-row">
                                    <td>{lead.name}</td>
                                    <td>{lead.contact}</td>
                                    <td>{lead.stage}</td>
                                    <td>{formatDate(lead.follow_up_date)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No overdue follow-ups! Good job!</p>
                )}
            </div>
        </div>
    );
}

export default Dashboard;