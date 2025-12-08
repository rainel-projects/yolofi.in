import React, { useEffect, useState } from "react";
import "./Optimizer.css";
import { CheckCircleIcon } from "./Icons";

const Optimizer = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);
    const [currentTask, setCurrentTask] = useState("Initializing Optimizer...");
    const [completedTasks, setCompletedTasks] = useState([]);

    const tasks = [
        { label: "Analyzing background processes...", duration: 800 },
        { label: "Identifying memory leaks...", duration: 1000 },
        { label: "Optimizing network packets...", duration: 1200 },
        { label: "Clearing digital waste & cache...", duration: 1500 },
        { label: "Re-calibrating system resources...", duration: 1000 },
        { label: "Finalizing improvements...", duration: 1000 },
    ];

    useEffect(() => {
        let currentStep = 0;
        let cumulativeTime = 0;

        const processTask = (index) => {
            if (index >= tasks.length) {
                setTimeout(() => {
                    onComplete();
                }, 800);
                return;
            }

            const task = tasks[index];
            setCurrentTask(task.label);

            const interval = setInterval(() => {
                setProgress((prev) => {
                    const stepProgress = 100 / tasks.length;
                    const increment = stepProgress / (task.duration / 50);
                    return Math.min(prev + increment, ((index + 1) / tasks.length) * 100);
                });
            }, 50);

            setTimeout(() => {
                clearInterval(interval);
                setCompletedTasks((prev) => [...prev, task.label]);
                processTask(index + 1);
            }, task.duration);
        };

        processTask(0);

        return () => { }; // Cleanup not strictly needed for this simple flow but good practice
    }, []);

    return (
        <div className="optimizer-container">
            <div className="optimizer-header">
                <h2>Intelligent Optimizer</h2>
                <p>AI is optimizing your system performance...</p>
            </div>

            <div className="progress-section">
                <div className="progress-ring-container">
                    <svg className="progress-ring" width="120" height="120">
                        <circle
                            className="progress-ring-circle-bg"
                            stroke="#e5e7eb"
                            strokeWidth="8"
                            fill="transparent"
                            r="52"
                            cx="60"
                            cy="60"
                        />
                        <circle
                            className="progress-ring-circle"
                            stroke="#3b82f6"
                            strokeWidth="8"
                            fill="transparent"
                            r="52"
                            cx="60"
                            cy="60"
                            style={{
                                strokeDasharray: 327,
                                strokeDashoffset: 327 - (327 * progress) / 100,
                            }}
                        />
                    </svg>
                    <div className="progress-text">
                        {Math.round(progress)}%
                    </div>
                </div>
            </div>

            <div className="tasks-list">
                {completedTasks.slice(-3).map((task, index) => (
                    <div key={index} className="task-item completed">
                        <CheckCircleIcon size={16} color="#10b981" />
                        <span>{task}</span>
                    </div>
                ))}
                <div className="task-item active">
                    <div className="spinner-small"></div>
                    <span>{currentTask}</span>
                </div>
            </div>
        </div>
    );
};

export default Optimizer;
