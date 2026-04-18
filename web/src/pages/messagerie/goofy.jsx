import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "@clerk/clerk-react";

export default function TestChat() {
    const [conversation, setRoom] = useState("conversation1");
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);

    const { getToken } = useAuth();
    const socketRef = useRef(null); // 🔥 IMPORTANT

    useEffect(() => {
        const init = async () => {
            const token = await getToken();

            // 🔥 créer socket UNE fois
            /*socketRef.current = io("http://localhost:3000", {
                extraHeaders: {
                    Authorization: `Bearer ${token}`
                }
            });*/
            socketRef.current = io("http://localhost:3000", {
                auth: {
                    token
                }
            });

            const socket = socketRef.current;

            setMessages([]);
            socket.emit("join_conversation", conversation);

            const handler = (data) => {
                console.log("📩 FRONT RECOIT:", data);

                setMessages((prev) => {
                    const exists = prev.some((m) => {
                        if (m.conversationId !== data.conversationId) return false;

                        if (data.id != null || m.id != null) {
                            return m.id === data.id;
                        }

                        if (data.timestamp != null || m.timestamp != null) {
                            return m.timestamp === data.timestamp;
                        }

                        return m.message === data.message && m.sender === data.sender;
                    });

                    if (exists) return prev;
                    return [...prev, data];
                });
            };

            socket.on("new_message", handler);

            return () => {
                socket.off("new_message", handler);
                socket.disconnect();
            };
        };

        init();
    }, [conversation]);

    const sendMessage = () => {
        if (!message || !socketRef.current) return;

        if (!socketRef.current.connected) {
            console.log("❌ Socket not connected");
            return;
        }

        socketRef.current.emit("send_message", {
            conversationId: conversation,
            message
        });

        console.log("📤 sending message");

        setMessage("");

        console.log("SOCKET STATE:", socketRef.current?.connected);
    };

    return (
        <div style={{ padding: 20 }}>
            <h2>💬 Chat test</h2>

            <input
                value={conversation}
                onChange={(e) => {
                    setRoom(e.target.value);
                    setMessages([]);
                }}
            />
            <br /><br />

            <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
            />
            <button onClick={sendMessage}>Send</button>

            <ul>
                {messages.map((msg, i) => (
                    <li key={i}>
                        {msg.sender}: {msg.message}
                    </li>
                ))}
            </ul>
        </div>
    );
}