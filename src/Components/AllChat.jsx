import React, { useState, useEffect, useRef } from 'react';
import { auth, db } from '../firebaseConfig'; // Adjust the import path as needed
import { collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { MoveDown } from 'lucide-react'
import ChatMsg from './ChatMsg';
import './styles/allchat.css';

function AllChat() {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);

    const dummy = useRef();

    useEffect(() => {
        // Create a query reference using modern Firebase syntax
        const msgRef = collection(db, 'AllChat');
        const q = query(msgRef, orderBy('createdAt', 'desc'), limit(100));

        // Set up real-time listener
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const fetchedMessages = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            // Reverse to display in chronological order (oldest first)
            setMessages(fetchedMessages.reverse());
            setLoading(false);
            
            // Scroll to bottom after messages load
            setTimeout(() => {
                dummy.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    

    // Handle sending a new message
    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        try {
            const { uid } = auth.currentUser;
            const msgRef = collection(db, 'AllChat');
            await addDoc(msgRef, {
                text: newMessage,
                createdAt: serverTimestamp(), // Using serverTimestamp() for consistency
                uid
            });

            // Clear input after sending
            setNewMessage('');

            // Scroll to bottom after sending
            dummy.current?.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    // Handle input change
    const handleInputChange = (e) => {
        setNewMessage(e.target.value);
    };

    // Handle send on Enter key
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    const scrollBottom = () => {
        dummy.current?.scrollIntoView({ behavior: 'smooth' });
    }

    return (
        <div>
            <div className="chatRoom">
                <div className='message-area'>
                    {loading ? (
                        <div className="loading-messages">Loading messages...</div>
                    ) : (
                        messages && messages.map(msg => (
                            <ChatMsg key={msg.id} message={msg} />
                        ))
                    )}
                    <div ref={dummy}></div>
                </div>
                <div className='txt-send-grp'>
                    <input
                        type="text"
                        placeholder='Type your message here...'
                        value={newMessage}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyPress}
                        autoFocus
                    />
                    <button onClick={handleSendMessage}>Send</button>
                </div>
            </div>
            <MoveDown className='scroll-bottom-btn' onClick={scrollBottom} />
        </div>
    );
}

export default AllChat;