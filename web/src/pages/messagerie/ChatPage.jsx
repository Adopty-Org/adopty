// frontend/src/pages/ChatPage.jsx (ou App.jsx)

import { useState } from "react";
import { ConversationList } from "../../components/chat/ConversationList.jsx";
import { ChatRoom } from "../../components/chat/ChatRoom";
import { useUser } from "@clerk/clerk-react";

export const ChatPage = () => {
    const [selectedConversationId, setSelectedConversationId] = useState(null);
    const { user } = useUser();

    return (
        <div style={{ display: "flex", height: "100vh" }}>
            {/* Sidebar : liste des conversations */}
            <ConversationList 
                onSelectConversation={setSelectedConversationId}
                selectedConversationId={selectedConversationId}
            />
            
            {/* Zone de chat : affichée seulement si une conversation est sélectionnée */}
            <div style={{ flex: 1 }}>
                {selectedConversationId ? (
                    <ChatRoom 
                        conversationId={selectedConversationId}
                        currentUser={user}
                    />
                ) : (
                    <div style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center",
                        height: "100%",
                        color: "#666"
                    }}>
                        Select a conversation to start chatting
                    </div>
                )}
            </div>
        </div>
    );
};