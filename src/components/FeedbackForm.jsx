import { useState } from 'react';
import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import './FeedbackForm.css';

export default function FeedbackForm({ onClose, issue }) {
    const [formData, setFormData] = useState({
        userName: '',
        location: '',
        customIssue: issue || ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            await addDoc(collection(db, 'testimonials'), {
                userName: formData.userName,
                location: formData.location,
                issue: formData.customIssue,
                timestamp: serverTimestamp(),
                verified: false
            });

            setSubmitted(true);
            setTimeout(() => {
                onClose && onClose();
            }, 2000);
        } catch (error) {
            console.error('Error submitting feedback:', error);
            alert('Failed to submit feedback. Please try again.');
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="feedback-success">
                <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                    <circle cx="30" cy="30" r="28" stroke="#10b981" strokeWidth="3" />
                    <path d="M18 30L26 38L42 22" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <h3>Thank you!</h3>
                <p>Your feedback has been submitted and will appear in the live feed.</p>
            </div>
        );
    }

    return (
        <div className="feedback-form-overlay">
            <div className="feedback-form-container">
                <div className="feedback-header">
                    <h3>Share Your Experience</h3>
                    <p>Help others know what you fixed!</p>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Your Name</label>
                        <input
                            type="text"
                            placeholder="e.g., Alex M."
                            value={formData.userName}
                            onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                            required
                            maxLength={50}
                        />
                    </div>

                    <div className="form-group">
                        <label>Location</label>
                        <input
                            type="text"
                            placeholder="e.g., New York, US"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            required
                            maxLength={50}
                        />
                    </div>

                    <div className="form-group">
                        <label>What issue was fixed?</label>
                        <input
                            type="text"
                            placeholder="e.g., Blue screen error"
                            value={formData.customIssue}
                            onChange={(e) => setFormData({ ...formData, customIssue: e.target.value })}
                            required
                            maxLength={100}
                        />
                    </div>

                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={submitting}
                    >
                        {submitting ? 'Submitting...' : 'Share My Fix'}
                    </button>
                </form>
            </div>
        </div>
    );
}
