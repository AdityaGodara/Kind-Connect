import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebaseConfig';
import './styles/allchat.css';
import { getDoc, doc } from 'firebase/firestore';

function ChatMsg(props) {
  const [userData, setUserData] = useState(null);
  const { text, uid } = props.message;
  const msgClass = uid === auth.currentUser.uid ? 'sent' : 'recieved';

  const fetchUserDetails = async () => {
    try {
      const docRef = doc(db, 'Users', uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserData(data);
      } else {
        setUserData({ name: "Unknown User" });
      }
    } catch (error) {
      console.log(error.message);
      setUserData({ name: "Unknown User" });
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, [uid]);

  // Function to convert plain text to HTML with hyperlinks
  const createMarkup = (text) => {
    if (!text) return { __html: '' };
    
    // URL regex pattern - matches URLs starting with http:// or https://
    const urlRegex = /(https?:\/\/[^\s]+)/gi;
    
    // Replace URLs with anchor tags
    const htmlContent = text.replace(
      urlRegex, 
      '<a href="$&" target="_blank" rel="noopener noreferrer" class="message-link"> $&</a>'
    );
    
    return { __html: htmlContent };
  };

  return (
    <div className={`message-${msgClass}`}>
      {userData ? (
        <>
          <span className={`sendername-${msgClass}`}>{userData.name}: </span>
          <span dangerouslySetInnerHTML={createMarkup(text)} />
        </>
      ) : (
        <span dangerouslySetInnerHTML={createMarkup(text)} />
      )}
    </div>
  );
}

export default ChatMsg;