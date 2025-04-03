import React, { useState, useEffect } from 'react'
import AllChat from '../Components/AllChat';
import './styles/community.css'
import YourCommunity from '../Components/YourCommunity';

function Community() {

  const [allChat, setAllChat] = useState(false);

  const selectedStyle = {
    backgroundColor: '#152a3d47'
  }

  const handleCommChat = () => {
    setAllChat(false)
  }
  const handleAllChat = () => {
    setAllChat(true)
  }


  return (
    <div className='main-container'>
      <div className="main-sec1">
        <div className='comm-header'>
          <h1 className="main-head">Community</h1>
          <div>
            <button onClick={handleCommChat} className='your-comm-but' style={allChat ? null : selectedStyle}>Your Community</button>
            <button onClick={handleAllChat} className='all-chat-but' style={allChat ? selectedStyle : null}>All Chat</button>
          </div>

        </div>
        <div>
          {allChat ? (
            <>
              <AllChat />
            </>
          ) : (
            <YourCommunity/>
          )}
        </div>

      </div>
    </div>
  )
}

export default Community
