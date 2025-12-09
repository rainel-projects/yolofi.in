import { db } from "../firebase/config";
import { doc, updateDoc, increment, setDoc, getDoc } from "firebase/firestore";

// ... existing imports

const Optimizer = ({ onComplete }) => {
    // ... existing state

    useEffect(() => {
        let isMounted = true;

        const optimizationPromise = runRealOptimization();

        const processTask = async (index) => {
            if (index >= tasks.length) {
                try {
                    const result = await optimizationPromise;

                    // Increment Global Stats Atomicially
                    const statsRef = doc(db, "marketing", "stats");
                    try {
                        await updateDoc(statsRef, {
                            optimizations: increment(1)
                        });
                    } catch (err) {
                        // If doc doesn't exist, create it (fallback)
                        await setDoc(statsRef, { optimizations: 12846 }, { merge: true });
                    }

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
