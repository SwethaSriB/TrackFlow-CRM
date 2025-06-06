// src/components/OrderList.js
import React, { useState, useEffect } from 'react';
import { fetchOrders, deleteOrder } from '../api'; // Assuming api.js is in src/
import OrderForm from './OrderForm'; // Import OrderForm
import './OrderList.css'; // You'll need to create this CSS file for styling

const OrderStatusOptions = [
    'All', // For filtering
    'Received',
    'In Development',
    'Ready to Dispatch',
    'Dispatched'
];

function OrderList() {
    const [orders, setOrders] = useState([]);
    const [filterStatus, setFilterStatus] = useState('All');
    const [message, setMessage] = useState('');
    const [showOrderForm, setShowOrderForm] = useState(false);
    const [currentOrder, setCurrentOrder] = useState(null); // For editing

    const getOrders = async (statusFilter = 'All') => {
        setMessage('');
        try {
            const fetchedOrders = await fetchOrders(null, statusFilter === 'All' ? null : statusFilter);
            setOrders(fetchedOrders);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setMessage('Failed to fetch orders. Please try again.');
        }
    };

    useEffect(() => {
        getOrders(filterStatus);
    }, [filterStatus]);

    const handleFilterChange = (e) => {
        setFilterStatus(e.target.value);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this order?')) {
            try {
                await deleteOrder(id);
                setMessage('Order deleted successfully!');
                getOrders(filterStatus); // Refresh list
            } catch (error) {
                console.error('Error deleting order:', error);
                setMessage('Failed to delete order.');
            }
        }
    };

    const handleSaveOrder = (newOrUpdatedOrder) => {
        setMessage('Order saved successfully!');
        setShowOrderForm(false);
        setCurrentOrder(null);
        getOrders(filterStatus); // Refresh the list
    };

    const handleCancelOrderForm = () => {
        setShowOrderForm(false);
        setCurrentOrder(null);
    };

    const handleEditOrder = (order) => {
        setCurrentOrder(order);
        setShowOrderForm(true);
    };

    // Helper to format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div className="order-management-container">
            <h2>Order Management</h2>

            <button onClick={() => { setShowOrderForm(true); setCurrentOrder(null); }} className="add-new-order-button">
                Add New Order
            </button>

            {showOrderForm && (
                <OrderForm
                    currentOrder={currentOrder}
                    onSave={handleSaveOrder}
                    onCancel={handleCancelOrderForm}
                />
            )}

            <div className="filter-section">
                <label>Filter by Status:</label>
                <select value={filterStatus} onChange={handleFilterChange}>
                    {OrderStatusOptions.map(status => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </select>
            </div>

            {message && <p className="status-message">{message}</p>}

            <div className="order-list-grid">
                {orders.length === 0 && !message && <p>No orders found.</p>}
                {orders.map(order => (
                    <div key={order.id} className="order-card">
                        <h4>Order #{order.id} - {order.product_name}</h4>
                        <p><strong>Lead ID:</strong> {order.lead_id}</p>
                        <p><strong>Quantity:</strong> {order.quantity}</p>
                        <p><strong>Order Date:</strong> {formatDate(order.order_date)}</p>
                        <p><strong>Status:</strong> <span className={`order-status ${order.status.toLowerCase().replace(/\s/g, '-')}`}>{order.status}</span></p>
                        <p><strong>Delivery Date:</strong> {formatDate(order.delivery_date)}</p>
                        <p><strong>Tracking ID:</strong> {order.tracking_number || 'N/A'}</p>
                        {order.notes && <p><strong>Notes:</strong> {order.notes}</p>}
                        <p className="order-timestamps">
                            Created: {formatDate(order.created_at)} | Last Updated: {formatDate(order.updated_at)}
                        </p>
                        <div className="order-actions">
                            <button onClick={() => handleEditOrder(order)} className="edit-button">Edit</button>
                            <button onClick={() => handleDelete(order.id)} className="delete-button">Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default OrderList;