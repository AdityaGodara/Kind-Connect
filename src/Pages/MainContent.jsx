import React, { useEffect, useState } from 'react'
import { auth, db } from "../firebaseConfig"
import { doc, getDoc, onSnapshot } from "firebase/firestore"
import "./styles/main.css"
import EventsYouAreIn from '../Components/EventsYouAreIn';

function MainContent() {
    const [userDetails, setUserDetails] = useState(null);
    const [expandedEvents, setExpandedEvents] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const unsubscribe = fetchUserDetail();
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [])

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
                        setUserDetails(userData);
                        
                        // Optional: Real-time listener for user document updates
                        const unsubscribe = onSnapshot(docRef, (doc) => {
                            if (doc.exists()) {
                                
                                setUserDetails(doc.data());
                            }
                        });

                        setLoading(false);
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

    const getGreeting = () => {
        if (!userDetails || !userDetails.name) return "Hello!";

        const nameSplit = userDetails.name.split(" ");
        const Fname = nameSplit[0];
        const currdate = new Date().getHours();
        
        if (currdate >= 16 && currdate < 24) {
            return `Good Evening, ${Fname || "User"}!`;
        }
        else if (currdate >= 5 && currdate < 12) {
            return `Good Morning, ${Fname || "User"}!`;
        }
        else if (currdate >= 12 && currdate < 16) {
            return `Good Afternoon, ${Fname || "User"}!`;
        }
        else {
            return "You should go to sleep!";
        }
    }

    if (error) {
        return (
            <div className="main-container error">
                <h1>Error: {error}</h1>
                <p>Please check your authentication and Firestore permissions.</p>
            </div>
        );
    }

    return (
        <div className="main-container">
            {loading ? (
                <div className="main-sec1">
                    <h1 className="main-head">Loading...</h1>
                </div>
            ) : userDetails ? (
                <div>
                    <h1 className="main-head">{getGreeting()}</h1>
                    {userDetails.events && userDetails.events.length > 0 ? (
                        <EventsYouAreIn />
                    ) : (
                        <p>No events available.</p>
                    )}
                </div>
            ) : (
                <div className="main-sec1">
                    <h1 className="main-head">Please log in</h1>
                </div>
            )}
        </div>
    )
}

export default MainContent