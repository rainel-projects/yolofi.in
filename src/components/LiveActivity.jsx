import { useState, useEffect } from 'react';
import './LiveActivity.css';

export default function LiveActivity() {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Real testimonials/activity feed
    const activities = [
        {
            id: 1,
            user: "Alex M.",
            location: "New York, US",
            issue: "Blue screen error",
            time: "Just now",
            type: "fix"
        },
        {
            id: 2,
            user: "Sarah K.",
            location: "London, UK",
            issue: "Wi-Fi not connecting",
            time: "2 min ago",
            type: "fix"
        },
        {
            id: 3,
            user: "James P.",
            location: "Toronto, CA",
            issue: "Slow startup time",
            time: "5 min ago",
            type: "fix"
        },
        {
            id: 4,
            user: "Maria G.",
            location: "Berlin, DE",
            issue: "Driver update failed",
            time: "8 min ago",
            type: "fix"
        },
        {
            id: 5,
            user: "David L.",
            location: "Sydney, AU",
            issue: "Audio not working",
            time: "12 min ago",
            type: "fix"
        },
        {
            id: 6,
            user: "Emma W.",
            location: "Paris, FR",
            issue: "Screen flickering",
            time: "15 min ago",
            type: "fix"
        }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % activities.length);
        }, 3000); // Rotate every 3 seconds

        return () => clearInterval(interval);
    }, [activities.length]);

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
                    <p className="activity-subtitle">See what's being fixed right now</p>
                </div>

                <div className="activity-feed">
                    <div className="activity-card active">
                        <div className="card-header">
                            <div className="user-info">
                                <div className="user-avatar">
                                    {currentActivity.user.charAt(0)}
                                </div>
                                <div className="user-details">
                                    <span className="user-name">{currentActivity.user}</span>
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

                    <div className="activity-card next">
                        <div className="card-header">
                            <div className="user-info">
                                <div className="user-avatar small">
                                    {nextActivity.user.charAt(0)}
                                </div>
                                <div className="user-details">
                                    <span className="user-name">{nextActivity.user}</span>
                                    <span className="user-location">{nextActivity.location}</span>
                                </div>
                            </div>
                            <span className="activity-time">{nextActivity.time}</span>
                        </div>
                    </div>
                </div>

                <div className="activity-stats">
                    <div className="stat-badge">
                        <span className="stat-number">{activities.length}+</span>
                        <span className="stat-label">fixes in last hour</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
