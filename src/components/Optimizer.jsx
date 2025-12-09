import React, { useEffect, useState } from "react";
import "./Optimizer.css";
import { CheckCircleIcon, CpuIcon, NetworkIcon, TrashIcon, MemoryIcon, ShieldIcon } from "./Icons";
import { runRealOptimization } from "../utils/OptimizerBrain";
import { db } from "../firebase/config";
import { doc, updateDoc, increment, setDoc } from "firebase/firestore";

const Optimizer = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);
    const [currentTask, setCurrentTask] = useState("Initializing Optimizer...");
    const [completedTasks, setCompletedTasks] = useState([]);

    // Technical "Logs" instead of generic tasks
    const tasks = [
        { label: "Scanning LocalStorage keys...", duration: 800, icon: <ShieldIcon size={18} color="#6b7280" /> },
        { label: "Analyzing JS Heap memory usage...", duration: 1000, icon: <MemoryIcon size={18} color="#6b7280" /> },
        { label: "Pinging network gateway (latency check)...", duration: 1200, icon: <NetworkIcon size={18} color="#6b7280" /> },
        { label: "Classifying stale cache & tmp files...", duration: 1500, icon: <TrashIcon size={18} color="#6b7280" /> },
        { label: "Unregistering idle Service Workers...", duration: 1000, icon: <CpuIcon size={18} color="#6b7280" /> },
        { label: "Compiling optimization report...", duration: 800, icon: <CheckCircleIcon size={18} color="#6b7280" /> },
    ];

    useEffect(() => {
        let isMounted = true;

        const optimizationPromise = runRealOptimization();

        const processTask = async (index) => {
            if (index >= tasks.length) {
                try {
                    const result = await optimizationPromise;

                    // Calculate Total Issues Resolved in this run
                    // (Junk files + Service Workers + 1 for Network Boost)
                    const issuesCount = (result?.actions?.storage?.filesRemoved || 0) +
                        (result?.actions?.workers?.removed || 0) +
                        1; // Network boost always counts as 1 optimization

                    // Increment Global Stats (Non-blocking / Fire-and-forget)
                    const statsRef = doc(db, "marketing", "stats");
                    updateDoc(statsRef, {
                        optimizations: increment(issuesCount)
                    }).catch((err) => {
                        // If doc doesn't exist, try creating it (also background)
                        setDoc(statsRef, { optimizations: issuesCount }, { merge: true }).catch(e => console.warn("Stats background update failed", e));
                    });

                    if (isMounted) {
                        setTimeout(() => onComplete(result), 800);
                    }
                } catch (e) {
                    console.error("Optimization failed", e);
                    if (isMounted) onComplete(null);
                }
                return;
            }
            // ... rest of function

            const task = tasks[index];
            if (isMounted) setCurrentTask(task.label);

            const interval = setInterval(() => {
                setProgress((prev) => {
                    const stepProgress = 100 / tasks.length;
                    const increment = stepProgress / (task.duration / 50);
                    return Math.min(prev + increment, ((index + 1) / tasks.length) * 100);
                });
            }, 50);

            setTimeout(() => {
                clearInterval(interval);
                if (isMounted) {
                    setCompletedTasks((prev) => [...prev, task]);
                    processTask(index + 1);
                }
            }, task.duration);
        };

        processTask(0);

        return () => { isMounted = false; };
    }, []);

    return (
        <div className="optimizer-container">
            <div className="optimizer-header">
                <h2>System Optimization</h2>
                <p>Running background maintenance tasks...</p>
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
                        {task.icon || <CheckCircleIcon size={16} color="#10b981" />}
                        <span className="log-text">{task.label}</span>
                    </div>
                ))}
                <div className="task-item active">
                    <div className="spinner-small"></div>
                    <span className="log-text">{currentTask}</span>
                </div>
            </div>
        </div>
    );
};

export default Optimizer;
