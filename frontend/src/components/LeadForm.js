// frontend/src/components/LeadForm.js
import React, { useState } from 'react';
// REMOVED: import axios from 'axios'; // No longer directly used here
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'; // Don't forget to import CSS

// Import the createLead function from your api.js file
import { createLead } from '../api';

// REMOVED apiBaseUrl from the props list
const LeadForm = ({ onLeadAdded }) => {
    const [formData, setFormData] = useState({
        name: '',
        contact: '',
        company: '',
        product_interest: '',
        follow_up_date: null, // Date object for DatePicker
        notes: '',
    });
    const [formErrors, setFormErrors] = useState({});
    const [submitMessage, setSubmitMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateForm = () => {
        const errors = {};
        if (!formData.name) errors.name = 'Name is required.';
        if (!formData.contact) errors.contact = 'Contact is required.';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact) && !/^\d{10}$/.test(formData.contact)) {
            errors.contact = 'Must be a valid email or 10-digit phone number.';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleDateChange = (date) => {
        setFormData({ ...formData, follow_up_date: date });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitMessage('');
        setFormErrors({});
        if (!validateForm()) {
            setSubmitMessage('Please correct the form errors.');
            return;
        }

        setIsSubmitting(true);
        try {
            const dataToSend = {
                ...formData,
                follow_up_date: formData.follow_up_date ? formData.follow_up_date.toISOString().split('T')[0] : null,
                // Assuming backend sets default stage like "New Lead"
            };

            // *** CRITICAL CHANGE: Using the imported createLead function ***
            const response = await createLead(dataToSend);

            setSubmitMessage('Lead added successfully!');
            // Reset form data after successful submission
            setFormData({
                name: '',
                contact: '',
                company: '',
                product_interest: '',
                follow_up_date: null,
                notes: '',
            });
            onLeadAdded(response.data); // Notify App.js to re-fetch leads
        } catch (error) {
            console.error('Error adding lead:', error);
            const errorMessage = error.response?.data?.detail || 'Please try again.';
            setSubmitMessage('Failed to add lead. ' + errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="lead-form">
            <div className="form-group">
                <label htmlFor="name">Name:</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={formErrors.name ? 'input-error' : ''}
                />
                {formErrors.name && <span className="error-message">{formErrors.name}</span>}
            </div>
            <div className="form-group">
                <label htmlFor="contact">Contact (Email/Phone):</label>
                <input
                    type="text"
                    id="contact"
                    name="contact"
                    value={formData.contact}
                    onChange={handleChange}
                    className={formErrors.contact ? 'input-error' : ''}
                />
                {formErrors.contact && <span className="error-message">{formErrors.contact}</span>}
            </div>
            <div className="form-group">
                <label htmlFor="company">Company:</label>
                <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                />
            </div>
            <div className="form-group">
                <label htmlFor="product_interest">Product Interest:</label>
                <input
                    type="text"
                    id="product_interest"
                    name="product_interest"
                    value={formData.product_interest}
                    onChange={handleChange}
                />
            </div>
            <div className="form-group">
                <label htmlFor="follow_up_date">Follow-up Date:</label>
                <DatePicker
                    id="follow_up_date"
                    selected={formData.follow_up_date}
                    onChange={handleDateChange}
                    dateFormat="yyyy-MM-dd"
                    isClearable
                    placeholderText="Select a date"
                />
            </div>
            <div className="form-group">
                <label htmlFor="notes">Notes:</label>
                <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                ></textarea>
            </div>
            <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Adding Lead...' : 'Add Lead'}
            </button>
            {submitMessage && <p className={`submit-message ${submitMessage.includes('successfully') ? 'success' : 'error'}`}>{submitMessage}</p>}
        </form>
    );
};

export default LeadForm;