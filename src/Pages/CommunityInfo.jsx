import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { auth, db } from '../firebaseConfig'; // Adjust the import path as needed
import { collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp, getDoc, doc, updateDoc } from 'firebase/firestore';
import './styles/communityInfo.css'

function CommunityInfo() {
  const [commData, setCommData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alreadyMember, setAlreadyMember] = useState(false);
  const [userData, setUserData] = useState(null);
  const { commId } = useParams();

  const fetchCommunityDetails = async () => {
    try {
      setLoading(true);
      const docRef = doc(db, 'Communities', commId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = {
          id: docSnap.id,
          ...docSnap.data()
        };
        setCommData(data);
      } else {
        console.log("Community does not exist");
      }

      const user = auth.currentUser;

      if (!user) {
        console.log("User not logged in");
        setLoading(false);
        return;
      }

      // Get the current user document
      const userDocRef = doc(db, 'Users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        console.log("User document not found");
        setLoading(false);
        return;
      }

      const userDataFromFirestore = userDocSnap.data();
      setUserData(userDataFromFirestore);

      // Check if user is already a member of this community
      const userCommunities = userDataFromFirestore.communities || [];
      if (userCommunities.includes(commId)) {
        setAlreadyMember(true);
      }

      setLoading(false);
    } catch (error) {
      console.log(error.message);
      setLoading(false);
    }
  };

  const handleJoinComm = async () => {
    try {
      const user = auth.currentUser;

      if (!user) {
        console.log("User not logged in");
        return;
      }

      if (!userData) {
        console.log("User data not loaded yet");
        return;
      }

      // Get user communities from state
      const userCommunities = userData.communities || [];

      // Double-check that user isn't already a member
      if (userCommunities.includes(commId)) {
        setAlreadyMember(true);
        console.log("Already a member of this community");
        return;
      }

      // Update user document to include the new community
      const userDocRef = doc(db, 'Users', user.uid);
      await updateDoc(userDocRef, {
        communities: [...userCommunities, commId]
      });

      // Update community document to include the new member
      const communityDocRef = doc(db, 'Communities', commId);

      // Get the current members array
      const members = commData.members || [];
      const memberCount = (commData.memberCount || 0) + 1;

      // Add the user to the members array
      await updateDoc(communityDocRef, {
        members: [...members, user.uid],
        memberCount: memberCount
      });

      console.log("Successfully joined community");
      setAlreadyMember(true);

      // Refresh the community data to update UI
      fetchCommunityDetails();

    } catch (error) {
      console.log("Error joining community:", error.message);
    }
  };

  useEffect(() => {
    fetchCommunityDetails();
  }, [commId]); // Add commId as a dependency to refetch if it changes

  return (
    <div>
      {loading ? (
        <div className="main-container">
          <div className="main-sec1">
            <h1>Loading...</h1>
          </div>
        </div>
      ) : commData ? (
        <div className="main-container">
          <div className="main-sec1">
            {commData.coverImage && (
              <img
                src={commData.coverImage}
                alt={`${commData.name} cover-image`}
                className='comm-cover-image'
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/default-community.png'; // Fallback image
                }}
              />
            )}
            <h1>{commData.name}</h1>
            <p>{commData.description}</p>
            <strong>{commData.category} {commData.location && `| ${commData.location}`}</strong>
            <p>Members: {commData.memberCount || 0}</p>

            {commData.rules && commData.rules.length > 0 && (
              <div className="comm-rules">
                <h2>Rules & Regulations:</h2>
                <ol>
                  {commData.rules.map((rule, index) => (
                    <li key={index}>{rule}</li>
                  ))}
                </ol>
              </div>
            )}

            {commData.tags && commData.tags.length > 0 && (
              <div className="comm-tags">
                <h2>Tags:</h2>
                <ul>
                  {commData.tags.map((tag, index) => (
                    <li key={index}>{tag}</li>
                  ))}
                </ul>
              </div>
            )}

            {!alreadyMember ? (
              <button className="join-btn" onClick={handleJoinComm}>Join Now</button>
            ) : (
              <button className="already-member-btn" disabled>You're a Member</button>
            )}
          </div>
        </div>
      ) : (
        <div className="main-container">
          <div className="main-sec1">
            <h1>Community not found</h1>
          </div>
        </div>
      )}
    </div>
  );
}

export default CommunityInfo;