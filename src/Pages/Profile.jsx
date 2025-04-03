import React, { useEffect, useState } from 'react'
import { auth, db } from "../firebaseConfig"
import { doc, getDoc } from "firebase/firestore"
import axios from 'axios' // Added missing axios import
import { Mail, UserRound, Phone, MapPin, PenTool } from 'lucide-react';
import "./styles/profile.css";
import { Link } from 'react-router-dom';

function Profile() {
    const [userDetails, setUserDetails] = useState(null);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [addresses, setAddresses] = useState({});  // Changed to object with event IDs as keys

    const fetchAddresses = async (eventsData) => {
        if (!eventsData || eventsData.length === 0) return;

        const addressPromises = eventsData.map(async (event) => {
            if (!event.location || !event.location.latitude || !event.location.longitude) {
                return { id: event.id, address: "Location data unavailable" };
            }

            const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${event.location.latitude}&lon=${event.location.longitude}`;
            
            try {
                const response = await axios.get(url);
                return {
                    id: event.id,
                    address: response.data && response.data.display_name 
                        ? response.data.display_name 
                        : "Unable to fetch address"
                };
            } catch (error) {
                console.error(`Error fetching address for event ${event.id}:`, error);
                return { id: event.id, address: "Error fetching address" };
            }
        });

        try {
            const addressResults = await Promise.all(addressPromises);
            
            // Convert array of results to an object with event IDs as keys
            const addressMap = addressResults.reduce((acc, result) => {
                acc[result.id] = result.address;
                return acc;
            }, {});
            
            setAddresses(addressMap);
        } catch (error) {
            console.error("Error processing addresses:", error);
        }
    };

    const fetchUserDetail = async () => {
        auth.onAuthStateChanged(async (user) => {
            if (!user) {
                console.log("User not logged in!");
                return;
            }

            const docRef = doc(db, "Users", user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setUserDetails({
                    id: user.uid,
                    ...docSnap.data()
                });
            } else {
                console.log("No user data found!");
            }
        })
    }

    const fetchUserEvents = async () => {
        if (!userDetails || !userDetails.events || userDetails.events.length === 0) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            // Create an array of promises for each document fetch
            const eventPromises = userDetails.events.map(id => {
                const eventRef = doc(db, "Events", id);
                return getDoc(eventRef);
            });

            // Execute all promises in parallel
            const eventSnapshots = await Promise.all(eventPromises);

            // Process the results
            const fetchedEvents = eventSnapshots.map(doc => {
                if (doc.exists()) {
                    return { id: doc.id, ...doc.data() };
                }
                return null;
            }).filter(event => event !== null);

            setEvents(fetchedEvents);
            
            // Now fetch addresses for these events
            await fetchAddresses(fetchedEvents);
        } catch (error) {
            console.error("Error fetching events:", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleLogout() {
        try {
            await auth.signOut();
            window.localStorage.removeItem("token");
            window.location.href = "/login";
            console.log("Logged out successfully!");
        } catch (error) {
            console.log(error.message);
        }
    }

    // Function to handle edit profile (currently just a placeholder)
    async function handleEditProfile() {
        // Navigate to edit profile page or open modal
        window.location.href = "/edit-profile";
    }

    useEffect(() => {
        fetchUserDetail();
    }, []);

    useEffect(() => {
        if (userDetails) {
            fetchUserEvents();
        }
    }, [userDetails]);

    return (
        <div className='main-container'>
            <div className='main-sec1'>
                {userDetails ? (
                    <div className='profile-sec'>
                        <div className='prof-info-sec'>
                            <h1 className='main-head'>{userDetails.name}</h1>
                            <div className="prof-details">
                                <div><Mail size={20} />{userDetails.email}</div>
                                <div><UserRound size={20} />{userDetails.gender}</div>
                                <div><Phone size={20} />{userDetails.phone}</div>
                                <div><MapPin size={20} />{userDetails.location}</div>
                            </div>
                            <div className='skill-list'>
                                <div className="skill-head"><PenTool size={20} /><span>Skills:</span></div>
                                <div className="skills">
                                    <ul>
                                        {userDetails.skills && userDetails.skills.map((item, count) => (
                                            <li key={count}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="edit-log-btns">
                                <button onClick={handleEditProfile}>Edit Profile</button>
                                <button onClick={handleLogout}>Logout</button>
                            </div>
                        </div>

                        <div className='profile-events'>
                            {loading ? (
                                <h2 className='loading-event-txt'>Loading events...</h2>
                            ) : !userDetails.events || userDetails.events.length === 0 ? (
                                <h2 className='loading-event-txt'>No events <br />to show</h2>
                            ) : events.length === 0 ? (
                                <h2 className='loading-event-txt'>Could not load events</h2>
                            ) : (
                                <div>
                                    {events.map((item) => (
                                        <Link to={`/event/${item.id}`} key={item.id} className='profile-events-card'>
                                            <div className="event-card">
                                                <img src={item.img && item.img.length > 0 ? item.img[0] : ''} alt={item.name} />
                                                <div className='event-head-info'>
                                                    <span className='event-title'>{item.name}</span><br />
                                                    <strong>{item.date && typeof item.date.toDate === 'function' ?
                                                        item.date.toDate().toLocaleDateString() : 'Date unavailable'}</strong>
                                                </div>
                                                <div>
                                                    <p className='event-desc'><strong>{item.role}</strong> at {addresses[item.id] || "Loading address..."}</p>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <h1 className='main-head'>Loading...</h1>
                )}
            </div>
        </div>
    )
}

export default Profile