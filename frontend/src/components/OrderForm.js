// src/components/OrderForm.js
import React, { useState, useEffect } from 'react';
import { createOrder, updateOrder, fetchLeads } from '../api'; // Assuming api.js is in src/
import './OrderForm.css'; // You'll need to create this CSS file for styling

const OrderStatusOptions = [
    'Received',
    'In Development',
    'Ready to Dispatch',
    'Dispatched'
];

function OrderForm({ currentOrder, onSave, onCancel }) {
    const [formData, setFormData] = useState({
        lead_id: '',
        product_name: '',
        quantity: 1,
        order_date: new Date().toISOString().split('T')[0], // Default to today
        status: 'Received',
        delivery_date: '',
        tracking_number: '',
        notes: ''
    });
    const [leads, setLeads] = useState([]);
    const [message, setMessage] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);

    useEffect(() => {
        // Fetch leads for the dropdown
        const getLeads = async () => {
            try {
                const fetchedLeads = await fetchLeads();
                setLeads(fetchedLeads);
                // If in create mode, set a default lead_id if available
                if (!currentOrder && fetchedLeads.length > 0) {
                    setFormData(prev => ({ ...prev, lead_id: fetchedLeads[0].id }));
                }
            } catch (error) {
                setMessage('Failed to fetch leads for selection.');
            }
        };
        getLeads();

        // Populate form if editing an existing order
        if (currentOrder) {
            setIsEditMode(true);
            setFormData({
                lead_id: currentOrder.lead_id || '',
                product_name: currentOrder.product_name || '',
                quantity: currentOrder.quantity || 1,
                order_date: currentOrder.order_date ? new Date(currentOrder.order_date).toISOString().split('T')[0] : '',
                status: currentOrder.status || 'Received',
                delivery_date: currentOrder.delivery_date ? new Date(currentOrder.delivery_date).toISOString().split('T')[0] : '',
                tracking_number: currentOrder.tracking_number || '',
                notes: currentOrder.notes || ''
            });
        } else {
            setIsEditMode(false);
            setFormData({
                lead_id: leads.length > 0 ? leads[0].id : '', // Set default lead_id if leads are fetched
                product_name: '',
                quantity: 1,
                order_date: new Date().toISOString().split('T')[0],
                status: 'Received',
                delivery_date: '',
                tracking_number: '',
                notes: ''
            });
        }
    }, [currentOrder, leads.length]); // Depend on currentOrder and leads.length to re-run effect

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(''); // Clear previous messages
        try {
            let response;
            const dataToSave = { ...formData };
            // Ensure lead_id is an integer
            dataToSave.lead_id = parseInt(dataToSave.lead_id, 10);
            // Ensure quantity is an integer
            dataToSave.quantity = parseInt(dataToSave.quantity, 10);
            // Convert empty strings to null for optional date fields if backend expects null
            if (dataToSave.delivery_date === '') dataToSave.delivery_date = null;


            if (isEditMode) {
                response = await updateOrder(currentOrder.id, dataToSave);
                setMessage('Order updated successfully!');
            } else {
                response = await createOrder(dataToSave);
                setMessage('Order added successfully!');
                // Clear form after successful creation
                setFormData({
                    lead_id: leads.length > 0 ? leads[0].id : '',
                    product_name: '',
                    quantity: 1,
                    order_date: new Date().toISOString().split('T')[0],
                    status: 'Received',
                    delivery_date: '',
                    tracking_number: '',
                    notes: ''
                });
            }
            onSave(response); // Callback to parent to refresh list
        } catch (error) {
            console.error('Error saving order:', error);
            setMessage(`Failed to save order: ${error.response?.data?.detail || error.message}`);
        }
    };

    return (
        <div className="order-form-container">
            <h3>{isEditMode ? 'Edit Order' : 'Add New Order'}</h3>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Lead:</label>
                    <select
                        name="lead_id"
                        value={formData.lead_id}
                        onChange={handleChange}
                        required
                        disabled={isEditMode} // Usually you don't change lead for existing order
                    >
                        <option value="">Select a Lead</option>
                        {leads.map(lead => (
                            <option key={lead.id} value={lead.id}>
                                {lead.name} ({lead.contact})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Product Name:</label>
                    <input
                        type="text"
                        name="product_name"
                        value={formData.product_name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Quantity:</label>
                    <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        required
                        min="1"
                    />
                </div>

                <div className="form-group">
                    <label>Order Date:</label>
                    <input
                        type="date"
                        name="order_date"
                        value={formData.order_date}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Status:</label>
                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        required
                    >
                        {OrderStatusOptions.map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Delivery Date (Optional):</label>
                    <input
                        type="date"
                        name="delivery_date"
                        value={formData.delivery_date}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-group">
                    <label>Tracking Number (Optional):</label>
                    <input
                        type="text"
                        name="tracking_number"
                        value={formData.tracking_number}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-group">
                    <label>Notes (Optional):</label>
                    <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                    ></textarea>
                </div>

                <div className="form-actions">
                    <button type="submit">{isEditMode ? 'Update Order' : 'Add Order'}</button>
                    {onCancel && <button type="button" onClick={onCancel} className="cancel-button">Cancel</button>}
                </div>
            </form>
            {message && <p className="form-message">{message}</p>}
        </div>
    );
}

export default OrderForm;