// src/api.js
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000'; // Make sure this matches your FastAPI URL

// --- Lead API functions (existing) ---
export const fetchLeads = async (stage = null, follow_up_date = null) => {
    try {
        let url = `${API_BASE_URL}/leads/`;
        const params = {};
        if (stage) params.stage = stage;
        if (follow_up_date) params.follow_up_date = follow_up_date;

        const response = await axios.get(url, { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching leads:', error);
        throw error;
    }
};

export const createLead = async (leadData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/leads/`, leadData);
        return response.data;
    } catch (error) {
        console.error('Error creating lead:', error);
        throw error;
    }
};

export const updateLead = async (id, leadData) => {
    try {
        const response = await axios.patch(`${API_BASE_URL}/leads/${id}`, leadData);
        return response.data;
    } catch (error) {
        console.error('Error updating lead:', error);
        throw error;
    }
};

export const deleteLead = async (id) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/leads/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting lead:', error);
        throw error;
    }
};

// --- Order API functions (existing) ---
export const fetchOrders = async (lead_id = null, status = null) => {
    try {
        let url = `${API_BASE_URL}/orders/`;
        const params = {};
        if (lead_id) params.lead_id = lead_id;
        if (status) params.status = status;

        const response = await axios.get(url, { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching orders:', error);
        throw error;
    }
};

export const createOrder = async (orderData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/orders/`, orderData);
        return response.data;
    } catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
};

export const updateOrder = async (id, orderData) => {
    try {
        const response = await axios.patch(`${API_BASE_URL}/orders/${id}`, orderData);
        return response.data;
    } catch (error) {
        console.error('Error updating order:', error);
        throw error;
    }
};

export const deleteOrder = async (id) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/orders/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting order:', error);
        throw error;
    }
};

// --- NEW: Dashboard API function ---
export const fetchDashboardMetrics = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/dashboard/metrics/`);
        return response.data;
    } catch (error) {
        console.error('Error fetching dashboard metrics:', error);
        throw error;
    }
};