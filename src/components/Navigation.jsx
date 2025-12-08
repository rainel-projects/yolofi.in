import React, { useState, useEffect } from 'react';
import './Navigation.css';
import logo from '../assets/logo.jpg';

const Navigation = () => {
    const [scrolled, setScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState('home');

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);

            // Update active section based on scroll position
            const sections = ['home', 'how-it-works', 'diagnose', 'about'];
            const current = sections.find(section => {
                const element = document.getElementById(section);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    return rect.top <= 100 && rect.bottom >= 100;
                }
                return false;
            });

            if (current) setActiveSection(current);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <nav className={`navigation ${scrolled ? 'scrolled' : ''}`}>
            <div className="nav-container">
                <div className="nav-logo" onClick={() => scrollToSection('home')}>
                    <img src={logo} alt="Yolofi" />
                    <span>yolofi</span>
                </div>

                <ul className="nav-links">
                    <li>
                        <a
                            href="#home"
                            className={activeSection === 'home' ? 'active' : ''}
                            onClick={(e) => { e.preventDefault(); scrollToSection('home'); }}
                        >
                            Home
                        </a>
                    </li>
                    <li>
                        <a
                            href="#how-it-works"
                            className={activeSection === 'how-it-works' ? 'active' : ''}
                            onClick={(e) => { e.preventDefault(); scrollToSection('how-it-works'); }}
                        >
                            How It Works
                        </a>
                    </li>
                    <li>
                        <a
                            href="#diagnose"
                            className={activeSection === 'diagnose' ? 'active' : ''}
                            onClick={(e) => { e.preventDefault(); scrollToSection('diagnose'); }}
                        >
                            Diagnose
                        </a>
                    </li>
                    <li>
                        <a
                            href="#about"
                            className={activeSection === 'about' ? 'active' : ''}
                            onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}
                        >
                            About
                        </a>
                    </li>
                </ul>

                <button
                    className="nav-cta"
                    onClick={() => scrollToSection('diagnose')}
                >
                    Get Started
                </button>
            </div>
        </nav>
    );
};

export default Navigation;
