import React, { useState, useEffect } from 'react'
import './styles/myCommunity.css'
import Posts from './Posts';
import CommunityChat from './CommunityChat';

function MyCommunity({ data }) {
    // Generate a unique key for this specific community
    const viewPreferenceKey = `community_${data.id}_view`;
    
    // Initialize state from localStorage if available, otherwise default to false (posts view)
    const [chatEnabled, setChat] = useState(() => {
        const savedPreference = localStorage.getItem(viewPreferenceKey);
        return savedPreference ? JSON.parse(savedPreference) : false;
    });

    const selectedOptionStyle = {
        color: 'white',
        backgroundColor: '#152a3d'
    }
    const notSelectedStyle = {
        backgroundColor: 'white'
    }

    // Save preference to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem(viewPreferenceKey, JSON.stringify(chatEnabled));
    }, [chatEnabled, viewPreferenceKey]);

    const handleCommunityClick = () => {
        window.location.href = `/community/${data.id}`
    }

    // Toggle handlers with localStorage persistence
    const showPosts = () => {
        setChat(false);
    }

    const showChat = () => {
        setChat(true);
    }

    return (
        <div>
            <div className="myCommunity-list">
                <div className="chat-options">
                    <button 
                        onClick={showPosts} 
                        style={chatEnabled ? notSelectedStyle : selectedOptionStyle}
                    >
                        Posts
                    </button>
                    <button 
                        onClick={showChat} 
                        style={chatEnabled ? selectedOptionStyle : notSelectedStyle}
                    >
                        Chat
                    </button>
                </div>

                <div className="comm-main-page">
                    {!chatEnabled ? (
                        <>
                            <div className="post-section">
                                <Posts communityId={data.id}/>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="chat-section">
                                <CommunityChat commId={data.id}/>
                            </div>
                        </>
                    )}
                    <div className="community-item" onClick={handleCommunityClick}>
                        <img src={data.coverImage} alt="" className='myComm-img' />
                        <div className="comm-info">
                            <span className="moderator-badge">Founder & Moderator</span>
                            <h1>{data.name}</h1>
                            <small>Members: {data.memberCount}</small>
                            <p>{data.description}</p>
                            <div className="comm-rules">
                                <h3>Rules & Regulations:</h3>
                                <ol>
                                    {data.rules.map((rule, index) => (
                                        <li key={index}>{rule}</li>
                                    ))}
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MyCommunity