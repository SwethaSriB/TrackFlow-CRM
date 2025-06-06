// frontend/src/components/LeadList.js
import React, { useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'; // Ensure CSS is imported

const LeadList = ({ leads, viewMode, onLeadUpdated, apiBaseUrl }) => {
    const stages = ["New", "Contacted", "Qualified", "Proposal Sent", "Negotiation", "Won", "Lost"];
    const [editingLeadId, setEditingLeadId] = useState(null);
    const [editStage, setEditStage] = useState('');
    const [editFollowUpDate, setEditFollowUpDate] = useState(null);

    const handleStageChange = async (leadId, newStage) => {
        try {
            await axios.patch(`${apiBaseUrl}/leads/${leadId}`, { stage: newStage });
            onLeadUpdated(); // Re-fetch leads
        } catch (error) {
            console.error('Error updating lead stage:', error);
            alert('Failed to update lead stage.');
        }
    };

    const startEditing = (lead) => {
        setEditingLeadId(lead.id);
        setEditStage(lead.stage);
        setEditFollowUpDate(lead.follow_up_date ? new Date(lead.follow_up_date) : null);
    };

    const handleEditSubmit = async (leadId) => {
        try {
            const dataToUpdate = {
                stage: editStage,
                follow_up_date: editFollowUpDate ? editFollowUpDate.toISOString().split('T')[0] : null,
            };
            await axios.patch(`${apiBaseUrl}/leads/${leadId}`, dataToUpdate);
            setEditingLeadId(null); // Exit editing mode
            onLeadUpdated(); // Re-fetch leads
        } catch (error) {
            console.error('Error updating lead:', error);
            alert('Failed to update lead.');
        }
    };

    const renderListView = () => (
        <table className="lead-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Contact</th>
                    <th>Company</th>
                    <th>Product Interest</th>
                    <th>Stage</th>
                    <th>Follow-up Date</th>
                    <th>Notes</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {leads.map((lead) => (
                    <tr key={lead.id}>
                        <td>{lead.id}</td>
                        <td>{lead.name}</td>
                        <td>{lead.contact}</td>
                        <td>{lead.company}</td>
                        <td>{lead.product_interest}</td>
                        <td>
                            {editingLeadId === lead.id ? (
                                <select value={editStage} onChange={(e) => setEditStage(e.target.value)}>
                                    {stages.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            ) : (
                                lead.stage
                            )}
                        </td>
                        <td>
                            {editingLeadId === lead.id ? (
                                <DatePicker
                                    selected={editFollowUpDate}
                                    onChange={(date) => setEditFollowUpDate(date)}
                                    dateFormat="yyyy-MM-dd"
                                    isClearable
                                />
                            ) : (
                                lead.follow_up_date
                            )}
                        </td>
                        <td>{lead.notes}</td>
                        <td>
                            {editingLeadId === lead.id ? (
                                <>
                                    <button onClick={() => handleEditSubmit(lead.id)}>Save</button>
                                    <button onClick={() => setEditingLeadId(null)}>Cancel</button>
                                </>
                            ) : (
                                <button onClick={() => startEditing(lead)}>Edit</button>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    const renderKanbanView = () => (
        <div className="kanban-board">
            {stages.map((stage) => (
                <div key={stage} className="kanban-column">
                    <h3>{stage}</h3>
                    <div className="kanban-cards">
                        {leads
                            .filter((lead) => lead.stage === stage)
                            .map((lead) => (
                                <div key={lead.id} className="kanban-card">
                                    <h4>{lead.name}</h4>
                                    <p>Contact: {lead.contact}</p>
                                    <p>Company: {lead.company}</p>
                                    <p>Product: {lead.product_interest}</p>
                                    <p>Follow-up: {lead.follow_up_date || 'N/A'}</p>
                                    {editingLeadId === lead.id ? (
                                        <>
                                            <label>Stage:</label>
                                            <select value={editStage} onChange={(e) => setEditStage(e.target.value)}>
                                                {stages.map((s) => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </select>
                                            <label>Follow-up:</label>
                                            <DatePicker
                                                selected={editFollowUpDate}
                                                onChange={(date) => setEditFollowUpDate(date)}
                                                dateFormat="yyyy-MM-dd"
                                                isClearable
                                            />
                                            <button onClick={() => handleEditSubmit(lead.id)}>Save</button>
                                            <button onClick={() => setEditingLeadId(null)}>Cancel</button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => startEditing(lead)}>Edit</button>
                                            <select
                                                value={lead.stage}
                                                onChange={(e) => handleStageChange(lead.id, e.target.value)}
                                                className="stage-select"
                                            >
                                                {stages.map((s) => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </select>
                                        </>
                                    )}
                                </div>
                            ))}
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="lead-list">
            {viewMode === 'list' ? renderListView() : renderKanbanView()}
        </div>
    );
};

export default LeadList;