import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase/config';
import { collection, addDoc, onSnapshot, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import BrowserEngine from "../utils/BrowserEngine"; // Import Engine to execute commands

const ChatSystem = ({ sessionId, role }) => {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const [identity, setIdentity] = useState(null);
    const messagesEndRef = useRef(null);

    // Predefined Actions / Commands
    const QUICK_ACTIONS = [
        { label: "👋 Hello", text: "Hello! Ready to troubleshoot." },
        { label: "🚀 Start Scan", text: "/cmd START_SCAN", type: "COMMAND" },
        { label: "🧹 Clean RAM", text: "/cmd MEMORY_CLEANUP", type: "COMMAND" },
        { label: "🔥 Stress Test", text: "/cmd STRESS_TEST", type: "COMMAND" },
        { label: "✅ All Good", text: "Everything looks good now." }
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // 1. Initialize Scalable Identity
    useEffect(() => {
        const storedId = sessionStorage.getItem("yolofi_chat_id");
        const storedName = sessionStorage.getItem("yolofi_chat_name");

        if (storedId && storedName) {
            setIdentity({ id: storedId, name: storedName });
        } else {
            const newId = role + "-" + Math.random().toString(36).substr(2, 9);
            const newName = role === "HOST" ? "Host" : `Guest-${Math.floor(Math.random() * 1000)}`;
            sessionStorage.setItem("yolofi_chat_id", newId);
            sessionStorage.setItem("yolofi_chat_name", newName);
            setIdentity({ id: newId, name: newName });
        }
    }, [role]);

    // 2. Real-Time Listener
    useEffect(() => {
        if (!sessionId) return;
        const q = query(
            collection(db, "sessions", sessionId, "messages"),
            orderBy("timestamp", "asc"),
            limit(50)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMessages(msgs);

            // Check for Commands (if Host)
            if (role === "HOST") {
                const lastMsg = msgs[msgs.length - 1];
                // Prevent duplicate execution: check if generated recently 
                // (In pro app, verify unique timestamp > lastExecuted)
                if (lastMsg && lastMsg.text.startsWith("/cmd") && lastMsg.role === "GUEST") {
                    // Logic to avoid double-execution would go here (e.g., maintain local "lastExecutedIds" set)
                    executeCommand(lastMsg.text, lastMsg.id);
                }
            }

            scrollToBottom();
        });

        return () => unsubscribe();
    }, [sessionId, role]);

    const executeCommand = async (cmdString, msgId) => {
        console.log("Executing Command:", cmdString);

        // Simple deduplication hack for MVP (don't re-run same message ID immediately)
        if (window.lastExecCmd === msgId) return;
        window.lastExecCmd = msgId;

        const cmd = cmdString.split(" ")[1];

        const postReply = async (text) => {
            await addDoc(collection(db, "sessions", sessionId, "messages"), {
                text, senderId: "SYSTEM", senderName: "System", role: "SYSTEM", timestamp: serverTimestamp()
            });
        };

        try {
            switch (cmd) {
                case "START_SCAN":
                    const report = await BrowserEngine.runFullDiagnostics();
                    await postReply(`🚀 SCAN COMPLETE:\nScore: ${report.score}/100\nMemory: ${report.memory.usedJSHeap}\nLeaks: ${report.memory.leakDetected ? "YES" : "NO"}`);
                    break;
                case "MEMORY_CLEANUP":
                    const memResult = await BrowserEngine.performMemoryCleanup();
                    await postReply(`🧹 MEMORY: ${memResult}`);
                    break;
                case "STORAGE_FIX":
                    const storageResult = await BrowserEngine.cleanupClientCaches();
                    await postReply(`💾 STORAGE: ${storageResult}`);
                    break;
                case "STRESS_TEST":
                    const stressResult = await BrowserEngine.runStressTest();
                    await postReply(`🔥 STRESS TEST:\nBlocked: ${stressResult.blockingTime}\nOptimized: ${stressResult.optimizedTime}\nVerdict: ${stressResult.improvement}`);
                    break;
                default:
                    break;
            }
        } catch (e) {
            console.error("Command failed", e);
            await postReply(`⚠️ Error executing ${cmd}: ${e.message}`);
        }
    };

    const sendMessage = async (textOverride = null) => {
        const textToSend = textOverride || inputText;
        if (!textToSend.trim() || !identity) return;

        try {
            await addDoc(collection(db, "sessions", sessionId, "messages"), {
                text: textToSend,
                senderId: identity.id,
                senderName: identity.name,
                role: role,
                timestamp: serverTimestamp()
            });
            setInputText("");
        } catch (err) {
            console.error("Chat Error:", err);
        }
    };

    return (
        <div className="chat-system" style={{
            display: "flex", flexDirection: "column", height: "100%",
            background: "rgba(255,255,255,0.9)", backdropFilter: "blur(10px)",
            borderRadius: "16px", border: "1px solid rgba(255,255,255,0.5)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)", overflow: "hidden"
        }}>
            {/* Header */}
            <div style={{ padding: "16px", borderBottom: "1px solid rgba(0,0,0,0.05)", background: "#f9fafb" }}>
                <span style={{ fontWeight: "700", color: "#374151" }}>Live Command Center</span>
            </div>

            {/* Messages Area */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                {messages.map((msg) => {
                    const isMe = msg.senderId === identity?.id;
                    const isCommand = msg.text.startsWith("/cmd");
                    const isSystem = msg.role === "SYSTEM";

                    if (isSystem) {
                        return (
                            <div key={msg.id} style={{
                                padding: "10px", margin: "8px 0", borderRadius: "8px",
                                background: "#fffbeb", color: "#b45309", border: "1px solid #fcd34d",
                                fontSize: "13px", whiteSpace: "pre-wrap", fontFamily: "monospace"
                            }}>
                                {msg.text}
                            </div>
                        );
                    }

                    return (
                        <div key={msg.id} style={{
                            alignSelf: isMe ? "flex-end" : "flex-start",
                            maxWidth: "85%",
                        }}>
                            <div style={{ fontSize: "11px", color: "#6b7280", marginBottom: "2px", textAlign: isMe ? "right" : "left" }}>
                                {isMe ? "You" : msg.senderName}
                            </div>
                            <div style={{
                                padding: "10px 14px",
                                borderRadius: isMe ? "12px 12px 0 12px" : "12px 12px 12px 0",
                                background: isCommand ? "#3b82f6" : (isMe ? "#4f46e5" : "#f3f4f6"),
                                color: (isMe || isCommand) ? "white" : "#1f2937",
                                fontSize: "14px",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                                fontFamily: isCommand ? "monospace" : "inherit"
                            }}>
                                {isCommand ? `⚡ Executing: ${msg.text.split(" ")[1]}` : msg.text}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Smart Actions Grid */}
            <div style={{ padding: "12px", background: "#f3f4f6", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                {QUICK_ACTIONS.map((action, idx) => (
                    <button
                        key={idx}
                        onClick={() => sendMessage(action.text)}
                        style={{
                            padding: "8px", border: "1px solid #d1d5db", borderRadius: "8px",
                            background: "white", fontSize: "12px", cursor: "pointer",
                            fontWeight: "600", color: "#4b5563", transition: "all 0.1s"
                        }}
                    >
                        {action.label}
                    </button>
                ))}
            </div>

            {/* Manual Input */}
            <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} style={{ padding: "12px", borderTop: "1px solid rgba(0,0,0,0.05)", display: "flex", gap: "8px" }}>
                <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type message..."
                    style={{
                        flex: 1, padding: "8px 16px", borderRadius: "20px", border: "1px solid #e5e7eb",
                        fontSize: "14px", outline: "none"
                    }}
                />
                <button type="submit" style={{
                    background: "#4f46e5", color: "white", border: "none", borderRadius: "50%",
                    width: "36px", height: "36px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                    ➤
                </button>
            </form>
        </div>
    );
};

export default ChatSystem;
