// frontend/src/api.js
import axios from 'axios';

// Define your API base URL ONCE here.
// This is the source of truth for all API calls in your frontend.
const API_BASE_URL = 'http://127.0.0.1:8000';

// Axios instance (optional but good practice for setting base URL, headers, etc.)
// You can also directly use axios.get/post/etc. with the full URL.
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// --- LEAD API FUNCTIONS ---

export const fetchLeads = async (stage = null, follow_up_date = null) => {
    try {
        let url = '/leads/'; // Use relative path if using axios.create with baseURL
        // Or, if not using axios.create: let url = `${API_BASE_URL}/leads/`;

        const params = {};
        if (stage) {
            params.stage = stage;
        }
        if (follow_up_date) {
            params.follow_up_date = follow_up_date;
        }

        const response = await api.get(url, { params }); // Use the API instance
        return response.data;
    } catch (error) {
        console.error('Error fetching leads:', error);
        throw error; // Re-throw to allow component to catch and display error
    }
};

export const createLead = async (leadData) => {
    try {
        const response = await api.post('/leads/', leadData);
        return response.data;
    } catch (error) {
        console.error('Error creating lead:', error);
        throw error;
    }
};

export const updateLead = async (id, leadData) => {
    try {
        const response = await api.patch(`/leads/${id}`, leadData);
        return response.data;
    } catch (error) {
        console.error(`Error updating lead ${id}:`, error);
        throw error;
    }
};

export const deleteLead = async (id) => {
    try {
        const response = await api.delete(`/leads/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting lead ${id}:`, error);
        throw error;
    }
};

// --- ORDER API FUNCTIONS (Example - assuming you have these) ---

export const fetchOrders = async () => {
    try {
        const response = await api.get('/orders/');
        return response.data;
    } catch (error) {
        console.error('Error fetching orders:', error);
        throw error;
    }
};

export const createOrder = async (orderData) => {
    try {
        const response = await api.post('/orders/', orderData);
        return response.data;
    } catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
};

export const updateOrder = async (id, orderData) => {
    try {
        const response = await api.patch(`/orders/${id}`, orderData);
        return response.data;
    } catch (error) {
        console.error(`Error updating order ${id}:`, error);
        throw error;
    }
};

export const deleteOrder = async (id) => {
    try {
        const response = await api.delete(`/orders/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting order ${id}:`, error);
        throw error;
    }
};

// --- DASHBOARD API FUNCTIONS (Example) ---

export const fetchDashboardMetrics = async () => {
    try {
        const response = await api.get('/dashboard/metrics/');
        return response.data;
    } catch (error) {
        console.error('Error fetching dashboard metrics:', error);
        throw error;
    }
};

// You can add more specific dashboard endpoints as needed
export const fetchLeadsByStageCount = async () => {
    try {
        const response = await api.get('/dashboard/leads-by-stage/');
        return response.data;
    } catch (error) {
        console.error('Error fetching leads by stage count:', error);
        throw error;
    }
};

export const fetchRecentActivities = async () => {
    try {
        const response = await api.get('/dashboard/recent-activities/');
        return response.data;
    } catch (error) {
        console.error('Error fetching recent activities:', error);
        throw error;
    }
};