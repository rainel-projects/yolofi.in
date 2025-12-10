import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase/config';
import { collection, addDoc, onSnapshot, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';

const ChatSystem = ({ sessionId, role }) => {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const [identity, setIdentity] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // 1. Initialize Scalable Identity (Client-Side)
    useEffect(() => {
        const storedId = sessionStorage.getItem("yolofi_chat_id");
        const storedName = sessionStorage.getItem("yolofi_chat_name");

        if (storedId && storedName) {
            setIdentity({ id: storedId, name: storedName });
        } else {
            // Generate unique ID for "Trillions" scalability (statistically improbable collision)
            const newId = role + "-" + Math.random().toString(36).substr(2, 9);
            const newName = role === "HOST" ? "Host (You)" : `Guest-${Math.floor(Math.random() * 1000)}`;

            sessionStorage.setItem("yolofi_chat_id", newId);
            sessionStorage.setItem("yolofi_chat_name", newName);
            setIdentity({ id: newId, name: newName });
        }
    }, [role]);

    // 2. Real-Time Scalable Listener
    useEffect(() => {
        if (!sessionId) return;

        // Listen to subcollection: sessions/{id}/messages
        const q = query(
            collection(db, "sessions", sessionId, "messages"),
            orderBy("timestamp", "asc"),
            limit(50) // Performance limit
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setMessages(msgs);
            scrollToBottom();
        });

        return () => unsubscribe();
    }, [sessionId]);



    const sendMessage = async (e) => {
        e.preventDefault();
        if (!inputText.trim() || !identity) return;

        try {
            await addDoc(collection(db, "sessions", sessionId, "messages"), {
                text: inputText,
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
            display: "flex", flexDirection: "column", height: "100%", maxHeight: "500px",
            background: "rgba(255,255,255,0.9)", backdropFilter: "blur(10px)",
            borderRadius: "16px", border: "1px solid rgba(255,255,255,0.5)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)", overflow: "hidden"
        }}>
            {/* Header */}
            <div style={{
                padding: "16px", borderBottom: "1px solid rgba(0,0,0,0.05)",
                background: "rgba(255,255,255,0.5)", display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
                <span style={{ fontWeight: "700", color: "#374151" }}>Live Support Chat</span>
                <span style={{ fontSize: "12px", color: "#6b7280" }}>{messages.length} msgs</span>
            </div>

            {/* Messages Area */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                {messages.length === 0 && (
                    <div style={{ textAlign: "center", color: "#9ca3af", fontSize: "14px", marginTop: "20px" }}>
                        Start the conversation...
                    </div>
                )}

                {messages.map((msg) => {
                    const isMe = msg.senderId === identity?.id;
                    const isSystem = msg.role === "SYSTEM";

                    if (isSystem) {
                        return (
                            <div key={msg.id} style={{ textAlign: "center", fontSize: "12px", color: "#6b7280", margin: "8px 0" }}>
                                — {msg.text} —
                            </div>
                        );
                    }

                    return (
                        <div key={msg.id} style={{
                            alignSelf: isMe ? "flex-end" : "flex-start",
                            maxWidth: "80%",
                        }}>
                            <div style={{ fontSize: "11px", color: "#6b7280", marginBottom: "2px", textAlign: isMe ? "right" : "left" }}>
                                {isMe ? "You" : msg.senderName}
                            </div>
                            <div style={{
                                padding: "10px 14px",
                                borderRadius: isMe ? "12px 12px 0 12px" : "12px 12px 12px 0",
                                background: isMe ? "#4f46e5" : "#f3f4f6",
                                color: isMe ? "white" : "#1f2937",
                                fontSize: "14px",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                            }}>
                                {msg.text}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={sendMessage} style={{ padding: "12px", borderTop: "1px solid rgba(0,0,0,0.05)", display: "flex", gap: "8px" }}>
                <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type a message..."
                    style={{
                        flex: 1, padding: "10px 16px", borderRadius: "24px", border: "1px solid #e5e7eb",
                        fontSize: "14px", outline: "none", background: "rgba(255,255,255,0.8)"
                    }}
                />
                <button type="submit" style={{
                    width: "40px", height: "40px", borderRadius: "50%", border: "none",
                    background: "#4f46e5", color: "white", display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", boxShadow: "0 2px 8px rgba(79, 70, 229, 0.4)"
                }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                </button>
            </form>
        </div>
    );
};

export default ChatSystem;
