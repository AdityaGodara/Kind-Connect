import React, { useState, useEffect, useRef } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import './styles/CommunityChat.css';
import ChatMsg from './ChatMsg'

function CommunityChat({ commId }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);
    const [userCache, setUserCache] = useState({});

    // Scroll to bottom of messages
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Fetch user data
    const fetchUserData = async (userId) => {
        // Return from cache if available
        if (userCache[userId]) {
            return userCache[userId];
        }

        try {
            const userRef = doc(db, "Users", userId);
            const userSnap = await getDoc(userRef);
            
            if (userSnap.exists()) {
                const userData = userSnap.data();
                // Update cache
                setUserCache(prevCache => ({
                    ...prevCache,
                    [userId]: {
                        name: userData.name || userData.displayName || "Anonymous",
                    }
                }));
            }
            return { name: "Anonymous" };
        } catch (error) {
            console.error("Error fetching user data:", error);
            return { name: "Anonymous" };
        }
    };

    // Process messages to include user data
    const enrichMessagesWithUserData = async (messages) => {
        const enrichedMessages = await Promise.all(
            messages.map(async (message) => {
                // If message already has user data, return as is
                if (message.userName) return message;
                
                const userData = await fetchUserData(message.userId);
                return {
                    ...message,
                    userName: userData.name,
                    userPhoto: userData.photo
                };
            })
        );
        return enrichedMessages;
    };

    // Fetch messages for this community
    useEffect(() => {
        if (!commId) return;
        setLoading(true);
        try {
            const messagesRef = collection(db, "Communities", commId, "chats");
            const q = query(
                messagesRef,
                orderBy("timestamp", "asc")
            );

            const unsubscribe = onSnapshot(q, async (querySnapshot) => {
                const fetchedMessages = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                
                // Enrich messages with user data
                const enrichedMessages = await enrichMessagesWithUserData(fetchedMessages);
                setMessages(enrichedMessages);
                setLoading(false);
            });

            return () => unsubscribe();
        } catch (err) {
            console.error("Error fetching messages:", err);
            setError("Failed to load messages. Please try again later.");
            setLoading(false);
        }
    }, [commId]);

    // Send new message
    const handleSendMessage = async (e) => {
        e.preventDefault();
        
        if (!newMessage.trim() || !auth.currentUser) return;

        try {
            const messagesRef = collection(db, "Communities", commId, "chats");
            await addDoc(messagesRef, {
                text: newMessage,
                timestamp: serverTimestamp(),
                uid: auth.currentUser.uid,
            });
            
            setNewMessage('');
        } catch (err) { 
            console.error("Error sending message:", err);
            setError("Failed to send message. Please try again.");
        }
    };

    if (loading) return <div className="chat-loading">Loading messages...</div>;
    if (error) return <div className="chat-error">{error}</div>;

    return (
        <div className="community-chat">
            <div className="chat-messages">
                {messages.length === 0 ? (
                    <div className="no-messages">
                        No messages yet. Be the first to say hello!
                    </div>
                ) : (
                    messages.map((message) => (
                        <ChatMsg key={message.id} message={message}/>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>
            
            <form className="message-form" onSubmit={handleSendMessage}>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="message-input"
                    autoFocus
                />
                <button type="submit" className="send-button">
                    Send
                </button>
            </form>
        </div>
    );
}

export default CommunityChat;