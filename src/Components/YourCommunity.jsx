import React, { useEffect, useState } from 'react'
import { auth, db } from '../firebaseConfig';
import './styles/yourcomm.css';
import { getDoc, doc, onSnapshot, collection, query, where } from 'firebase/firestore';
import { Plus, Earth, Users } from 'lucide-react';
import MyCommunity from './MyCommunity';

function YourCommunity() {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userCommunities, setUserCommunities] = useState([]);
    const [moderatedCommunities, setModeratedCommunities] = useState([]);
    const [isFounderModerator, setIsFounderModerator] = useState(false);
    const [founderCommunity, setFounderCommunity] = useState(null);
    const [selectedCommunity, setSelectedCommunity] = useState(null);
    const [showCommunityList, setShowCommunityList] = useState(true);

    const fetchUserDetail = () => {
        try {
            return auth.onAuthStateChanged(async (user) => {
                if (!user) {
                    console.log("User not logged in!");
                    setLoading(false);
                    return;
                }
                try {
                    const docRef = doc(db, "Users", user.uid);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        const userData = docSnap.data();
                        setUserData(userData);

                        // Optional: Real-time listener for user document updates
                        const unsubscribe = onSnapshot(docRef, (doc) => {
                            if (doc.exists()) {
                                setUserData(doc.data());
                            }
                        });

                        // Fetch the communities the user is part of
                        fetchCommunities(user.uid);

                        return unsubscribe;
                    } else {
                        console.log("No user data found!");
                        setError("No user data found");
                        setLoading(false);
                    }
                } catch (error) {
                    console.error("Error fetching user details:", error);
                    setError(error.message);
                    setLoading(false);
                }
            });
        } catch (error) {
            console.error("Authentication error:", error);
            setError(error.message);
            setLoading(false);
        }
    }

    const fetchCommunities = (userId) => {
        try {
            // Query to find communities where user is a member
            const memberQuery = query(
                collection(db, "Communities"),
                where("members", "array-contains", userId)
            );

            // Listen for communities where user is a member
            const memberUnsubscribe = onSnapshot(memberQuery, (querySnapshot) => {
                const communities = [];
                querySnapshot.forEach((doc) => {
                    communities.push({ id: doc.id, ...doc.data() });
                });
                setUserCommunities(communities);

                // Find communities where user is the first member (founder)
                const foundingCommunity = communities.find(community =>
                    community.members &&
                    community.members[0] === userId &&
                    community.moderators &&
                    community.moderators.includes(userId)
                );

                if (foundingCommunity) {
                    setIsFounderModerator(true);
                    setFounderCommunity(foundingCommunity);
                }

                setLoading(false);
            }, (error) => {
                console.error("Error fetching communities:", error);
                setError(error.message);
                setLoading(false);
            });

            // Query to find communities where user is a moderator
            const modQuery = query(
                collection(db, "Communities"),
                where("moderators", "array-contains", userId)
            );

            // Listen for communities where user is a moderator
            const modUnsubscribe = onSnapshot(modQuery, (querySnapshot) => {
                const communities = [];
                querySnapshot.forEach((doc) => {
                    communities.push({ id: doc.id, ...doc.data() });
                });
                setModeratedCommunities(communities);
            });

            return () => {
                memberUnsubscribe();
                modUnsubscribe();
            };
        } catch (error) {
            console.error("Error setting up community listeners:", error);
            setError(error.message);
            setLoading(false);
        }
    }

    useEffect(() => {
        const unsubscribe = fetchUserDetail();
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, []);

    const onCreateComm = () => {
        window.location.href = '/create-community';
    }

    const onJoinComm = () => {
        window.location.href = '/browse-communities';
    }

    const handleCommunityClick = (community) => {
        setSelectedCommunity(community);
        setShowCommunityList(false);
    }

    const handleBackToList = () => {
        setSelectedCommunity(null);
        setShowCommunityList(true);
    }

    const renderCommunityList = () => {
        const allCommunities = [...userCommunities];

        if (allCommunities.length === 0) {
            return (
                <div className="empty-state">
                    <p>You haven't joined any communities yet.</p>
                </div>
            );
        }

        

        return (
            <div className="community-list">
                {allCommunities.map(community => { 
                    return (
                    <div
                        key={community.id}
                        className="community-item"
                        onClick={() => handleCommunityClick(community)}
                    >
                        <h2>{community.name}</h2>
                        <p>{community.description}</p>
                        {moderatedCommunities.some(c => c.id === community.id) && (
                            <span className="moderator-badge">Moderator</span>
                        )}
                    </div>
                )})}
            </div>
        );
    }

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className='your-comm-cont'>
            {userData ? (
                showCommunityList ? (
                    // Show the list of communities
                    <div className='comm-list-cont'>
                        {renderCommunityList()}
                        <div className='btn-grp1'>
                            {moderatedCommunities.length === 0 && (
                                <button className='create-comm-btn' onClick={onCreateComm}>
                                    <Plus />Create your own community
                                </button>
                            )}

                            <button className='create-comm-btn' onClick={onJoinComm}>
                                <Earth />Join communities
                            </button>

                        </div>
                    </div>
                ) : (
                    // Show the selected community
                    <div>
                        <button
                            className="back-button"
                            onClick={handleBackToList}
                        >
                            ←
                        </button>
                        <MyCommunity data={selectedCommunity} />
                    </div>
                )
            ) : (
                <p>Loading...</p>
            )}
        </div>
    )
}

export default YourCommunity