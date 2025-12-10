import { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import './LiveActivity.css';

export default function LiveActivity() {
    const [activities, setActivities] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    const getTimeAgo = (timestamp) => {
        if (!timestamp) return 'Just now';

        const now = new Date();
        const then = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const seconds = Math.floor((now - then) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`;
        return `${Math.floor(seconds / 86400)} days ago`;
    };

    useEffect(() => {
        // Real-time listener for testimonials
        const q = query(
            collection(db, 'testimonials'),
            orderBy('timestamp', 'desc'),
            limit(10)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const testimonials = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                time: getTimeAgo(doc.data().timestamp)
            }));

            setActivities(testimonials);
            setLoading(false);
        }, (error) => {
            console.error('Error fetching testimonials:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (activities.length === 0) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % activities.length);
        }, 3000);

        return () => clearInterval(interval);
    }, [activities.length]);



    if (loading) {
        return (
            <section className="live-activity-section">
                <div className="activity-container">
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading live activity...</p>
                    </div>
                </div>
            </section>
        );
    }

    if (activities.length === 0) {
        return (
            <section className="live-activity-section">
                <div className="activity-container">
                    <div className="empty-state">
                        <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                            <circle cx="30" cy="30" r="28" stroke="#e5e7eb" strokeWidth="2" />
                            <path d="M30 20V32M30 38V40" stroke="#9ca3af" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                        <h3>No activity yet</h3>
                        <p>Be the first to share your PC fix!</p>
                    </div>
                </div>
            </section>
        );
    }

    const currentActivity = activities[currentIndex];
    const nextActivity = activities[(currentIndex + 1) % activities.length];

    return (
        <section className="live-activity-section">
            <div className="activity-container">
                <div className="activity-header">
                    <div className="live-indicator">
                        <span className="pulse-dot"></span>
                        <span className="live-text">Live Activity</span>
                    </div>
                    <p className="activity-subtitle">Real fixes happening now</p>
                </div>

                <div className="activity-feed">
                    <div className="activity-card active">
                        <div className="card-header">
                            <div className="user-info">
                                <div className="user-avatar">
                                    {currentActivity.userName?.charAt(0) || '?'}
                                </div>
                                <div className="user-details">
                                    <span className="user-name">{currentActivity.userName}</span>
                                    <span className="user-location">{currentActivity.location}</span>
                                </div>
                            </div>
                            <span className="activity-time">{currentActivity.time}</span>
                        </div>
                        <div className="card-body">
                            <div className="fix-badge">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M13.3333 4L6 11.3333L2.66666 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span>Fixed</span>
                            </div>
                            <p className="issue-text">{currentActivity.issue}</p>
                        </div>
                    </div>

                    {activities.length > 1 && (
                        <div className="activity-card next">
                            <div className="card-header">
                                <div className="user-info">
                                    <div className="user-avatar small">
                                        {nextActivity.userName?.charAt(0) || '?'}
                                    </div>
                                    <div className="user-details">
                                        <span className="user-name">{nextActivity.userName}</span>
                                        <span className="user-location">{nextActivity.location}</span>
                                    </div>
                                </div>
                                <span className="activity-time">{nextActivity.time}</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="activity-stats">
                    <div className="stat-badge">
                        <span className="stat-number">{activities.length}</span>
                        <span className="stat-label">recent fixes</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
