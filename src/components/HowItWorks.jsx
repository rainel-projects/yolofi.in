import React from 'react';
import './HowItWorks.css';
import { SearchIcon, BrainIcon, BoltIcon } from './Icons';

const HowItWorks = () => {
    const steps = [
        {
            title: 'System Scan',
            description: 'Our heuristic engine scans storage, memory, and network latency.',
            IconComponent: SearchIcon
        },
        {
            title: 'Performance Analysis',
            description: 'Identifies junk files, heavy scripts, and connection bottlenecks.',
            IconComponent: BrainIcon
        },
        {
            title: 'Smart Optimization',
            description: 'Automatically cleans cache, frees RAM, and boosts connection speed.',
            IconComponent: BoltIcon
        }
    ];

    return (
        <section className="path-section section-right how-it-works-path" id="how-it-works">
            <div className="section-visual">
                <div className="steps-visual-grid">
                    {steps.map((step, index) => (
                        <div key={index} className="step-icon-card">
                            <step.IconComponent size={48} color="#a8b5d1" />
                        </div>
                    ))}
                </div>
            </div>

            <div className="section-content">
                <div className="section-number">02</div>
                <h2 className="section-title">How It Works</h2>
                <div className="steps-list">
                    {steps.map((step, index) => (
                        <div key={index} className="step-item">
                            <div className="step-marker">{index + 1}</div>
                            <div className="step-info">
                                <h3>{step.title}</h3>
                                <p>{step.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <a href="#diagnose" className="section-cta">Try It Now →</a>
            </div>
        </section>
    );
};

export default HowItWorks;
