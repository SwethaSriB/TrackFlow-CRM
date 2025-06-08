// frontend/src/components/LeadList.js
import React, { useState } from 'react';
// Import API functions for updating and deleting leads
import { updateLead, deleteLead } from '../api';

// REMOVED apiBaseUrl from the props list
const LeadList = ({ leads, viewMode, onLeadUpdated }) => {
    const [editingLeadId, setEditingLeadId] = useState(null);
    const [editedLeadData, setEditedLeadData] = useState({});

    const handleEditClick = (lead) => {
        setEditingLeadId(lead.id);
        setEditedLeadData({ ...lead });
    };

    const handleCancelEdit = () => {
        setEditingLeadId(null);
        setEditedLeadData({});
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedLeadData(prev => ({ ...prev, [name]: value }));
    };

    const handleEditSubmit = async (leadId) => {
        try {
            const dataToUpdate = { ...editedLeadData };

            // Ensure follow_up_date is formatted correctly if it's being updated
            if (dataToUpdate.follow_up_date) {
                // If it's a full datetime string from backend, convert to 'YYYY-MM-DD'
                if (dataToUpdate.follow_up_date.includes('T')) {
                    dataToUpdate.follow_up_date = dataToUpdate.follow_up_date.split('T')[0];
                }
                // If it's already a Date object (e.g., from DatePicker in edit mode), convert to string
                else if (dataToUpdate.follow_up_date instanceof Date) {
                    dataToUpdate.follow_up_date = dataToUpdate.follow_up_date.toISOString().split('T')[0];
                }
            } else {
                dataToUpdate.follow_up_date = null; // Ensure null if empty
            }

            // *** CRITICAL CHANGE: Using the imported updateLead function ***
            await updateLead(leadId, dataToUpdate);
            onLeadUpdated(); // Trigger re-fetch of leads in App.js
            setEditingLeadId(null);
            setEditedLeadData({});
        } catch (error) {
            console.error('Error updating lead:', error);
            alert('Failed to update lead. Check console for details.');
        }
    };

    const handleDeleteClick = async (leadId) => {
        if (window.confirm('Are you sure you want to delete this lead?')) {
            try {
                // *** CRITICAL CHANGE: Using the imported deleteLead function ***
                await deleteLead(leadId);
                onLeadUpdated(); // Trigger re-fetch of leads in App.js
            } catch (error) {
                console.error('Error deleting lead:', error);
                alert('Failed to delete lead. Check console for details.');
            }
        }
    };

    const handleStageChange = async (leadId, newStage) => {
        try {
            // *** CRITICAL CHANGE: Using the imported updateLead function ***
            await updateLead(leadId, { stage: newStage });
            onLeadUpdated(); // Trigger re-fetch
        } catch (error) {
            console.error('Error changing stage:', error);
            alert('Failed to change lead stage. Check console for details.');
        }
    };

    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        // If it's already 'YYYY-MM-DD', use it directly
        if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
            return dateString;
        }
        // Otherwise, assume it might be a full datetime and format it
        return new Date(dateString).toISOString().split('T')[0];
    };

    const renderLeadTable = () => (
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Contact</th>
                    <th>Company</th>
                    <th>Product Interest</th>
                    <th>Follow-up Date</th>
                    <th>Notes</th>
                    <th>Stage</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {leads.map((lead) => (
                    <tr key={lead.id}>
                        {editingLeadId === lead.id ? (
                            <>
                                <td><input type="text" name="name" value={editedLeadData.name || ''} onChange={handleChange} /></td>
                                <td><input type="text" name="contact" value={editedLeadData.contact || ''} onChange={handleChange} /></td>
                                <td><input type="text" name="company" value={editedLeadData.company || ''} onChange={handleChange} /></td>
                                <td><input type="text" name="product_interest" value={editedLeadData.product_interest || ''} onChange={handleChange} /></td>
                                <td><input type="date" name="follow_up_date" value={formatDateForInput(editedLeadData.follow_up_date)} onChange={handleChange} /></td>
                                <td><textarea name="notes" value={editedLeadData.notes || ''} onChange={handleChange}></textarea></td>
                                <td>
                                    <select name="stage" value={editedLeadData.stage || ''} onChange={handleChange}>
                                        <option value="New Lead">New Lead</option>
                                        <option value="Contacted">Contacted</option>
                                        <option value="Qualified">Qualified</option>
                                        <option value="Proposal Sent">Proposal Sent</option>
                                        <option value="Closed Won">Closed Won</option>
                                        <option value="Closed Lost">Closed Lost</option>
                                    </select>
                                </td>
                                <td>
                                    <button className="btn-save" onClick={() => handleEditSubmit(lead.id)}>Save</button>
                                    <button className="btn-cancel" onClick={handleCancelEdit}>Cancel</button>
                                </td>
                            </>
                        ) : (
                            <>
                                <td>{lead.name}</td>
                                <td>{lead.contact}</td>
                                <td>{lead.company || 'N/A'}</td>
                                <td>{lead.product_interest || 'N/A'}</td>
                                <td>{lead.follow_up_date || 'N/A'}</td>
                                <td>{lead.notes || 'N/A'}</td>
                                <td>
                                    <select
                                        value={lead.stage}
                                        onChange={(e) => handleStageChange(lead.id, e.target.value)}
                                    >
                                        <option value="New Lead">New Lead</option>
                                        <option value="Contacted">Contacted</option>
                                        <option value="Qualified">Qualified</option>
                                        <option value="Proposal Sent">Proposal Sent</option>
                                        <option value="Closed Won">Closed Won</option>
                                        <option value="Closed Lost">Closed Lost</option>
                                    </select>
                                </td>
                                <td>
                                    <button className="btn-edit" onClick={() => handleEditClick(lead)}>Edit</button>
                                    <button className="btn-delete" onClick={() => handleDeleteClick(lead.id)}>Delete</button>
                                </td>
                            </>
                        )}
                    </tr>
                ))}
            </tbody>
        </table>
    );

    const renderKanbanBoard = () => {
        const stages = ["New Lead", "Contacted", "Qualified", "Proposal Sent", "Closed Won", "Closed Lost"];
        const leadsByStage = stages.reduce((acc, stage) => {
            acc[stage] = leads.filter(lead => lead.stage === stage);
            return acc;
        }, {});

        return (
            <div className="kanban-board">
                {stages.map(stage => (
                    <div key={stage} className="kanban-column">
                        <h3>{stage} ({leadsByStage[stage].length})</h3>
                        <div className="kanban-cards">
                            {leadsByStage[stage].map(lead => (
                                <div key={lead.id} className="kanban-card">
                                    <h4>{lead.name}</h4>
                                    <p><strong>Contact:</strong> {lead.contact}</p>
                                    <p><strong>Company:</strong> {lead.company || 'N/A'}</p>
                                    <p><strong>Follow-up:</strong> {lead.follow_up_date || 'N/A'}</p>
                                    <div className="kanban-card-actions">
                                        <button className="btn-edit" onClick={() => handleEditClick(lead)}>Edit</button>
                                        <button className="btn-delete" onClick={() => handleDeleteClick(lead.id)}>Delete</button>
                                        <select
                                            value={lead.stage}
                                            onChange={(e) => handleStageChange(lead.id, e.target.value)}
                                        >
                                            {stages.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    {/* Simplified editing for Kanban for brevity, full editing handled via modal or separate page in complex apps */}
                                    {editingLeadId === lead.id && (
                                        <div className="kanban-edit-overlay">
                                            <h5>Edit {lead.name}</h5>
                                            <div className="form-group">
                                                <label>Name:</label>
                                                <input type="text" name="name" value={editedLeadData.name || ''} onChange={handleChange} />
                                            </div>
                                            <div className="form-group">
                                                <label>Follow-up Date:</label>
                                                <input type="date" name="follow_up_date" value={formatDateForInput(editedLeadData.follow_up_date)} onChange={handleChange} />
                                            </div>
                                            <button className="btn-save" onClick={() => handleEditSubmit(lead.id)}>Save</button>
                                            <button className="btn-cancel" onClick={handleCancelEdit}>Cancel</button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="lead-list-container">
            {viewMode === 'list' ? renderLeadTable() : renderKanbanBoard()}
        </div>
    );
};

export default LeadList;