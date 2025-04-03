import React, { useState, useEffect } from 'react'
import "./styles/events.css"
import EventsByLocation from '../Components/EventsByLocation'
import EventsBySkills from '../Components/EventsBySkills'
import { Search } from 'lucide-react'
import { auth, db } from "../firebaseConfig"
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore"
import { format } from "date-fns"
import { useNavigate } from "react-router-dom"

function Events() {
    const [searchTerm, setSearchTerm] = useState('');
    const [userDetails, setUserDetails] = useState(null);
    const [allEvents, setAllEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUserDetail();
    }, []);

    useEffect(() => {
        // Only fetch events when userDetails is available
        if (userDetails) {
            fetchAllEvents();
        }
    }, [userDetails]);

    useEffect(() => {
        // Filter events based on search term
        if (searchTerm.trim() === '') {
            setFilteredEvents([]);
            setIsSearching(false);
        } else {
            const lowercaseSearchTerm = searchTerm.toLowerCase();
            const results = allEvents.filter(event =>
                event.name.toLowerCase().includes(lowercaseSearchTerm) ||
                event.role.toLowerCase().includes(lowercaseSearchTerm) ||
                event.organizer.toLowerCase().includes(lowercaseSearchTerm) ||
                event.city.toLowerCase().includes(lowercaseSearchTerm)
            );
            setFilteredEvents(results);
            setIsSearching(true);
        }
    }, [searchTerm, allEvents]);

    const fetchUserDetail = async () => {
        auth.onAuthStateChanged(async (user) => {
            if (!user) {
                console.log("User not logged in!");
                return;
            }

            const docRef = doc(db, "Users", user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setUserDetails(docSnap.data());
            } else {
                console.log("No user data found!");
            }
        });
    };

    const fetchAllEvents = async () => {
        try {
            // Reference to the Events collection
            const eventsCollectionRef = collection(db, "Events");
            const eventsSnapshot = await getDocs(eventsCollectionRef);
            
            const eventsData = eventsSnapshot.docs.map(doc => {
                const eventData = doc.data();
                const eventId = doc.id;

                // Get the event skills and user skills for matching calculation
                const eventSkills = eventData.skillReq || [];
                const userSkills = userDetails.skills || [];

                // Calculate matching skills
                const matchingSkills = userSkills.filter(skill =>
                    eventSkills.includes(skill)
                );

                // Calculate match percentage
                const matchPercentage = eventSkills.length > 0
                    ? (matchingSkills.length / eventSkills.length) * 100
                    : 0;

                // Add match percentage to the event data
                return {
                    id: eventId,
                    ...eventData,
                    matchPercentage: matchPercentage
                };
            });

            setAllEvents(eventsData);
        } catch (err) {
            console.error("Error fetching events:", err);
        }
    };

    const handleApplyClick = (eventId) => {
        navigate(`/event/${eventId}`);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    return (
        <div className='main-container'>
            <div className="search-bar">
                <input 
                    type="search" 
                    placeholder='Search Events...' 
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
                <button><Search /></button>
            </div>
            
            {isSearching ? (
                <div className='main-sec1'>
                    <h1 className='main-head'>Search Results</h1>
                    <div className="eventPage-events">
                        {filteredEvents.length > 0 ? (
                            filteredEvents.map((item, count) => (
                                <div className="main-event-card" key={count}>
                                    <img src={item.img?.[0]} alt={`${item.name} image`} />
                                    <div className='eventPage-head-info'>
                                        <span className='eventPage-title'>{item.name}</span><br />
                                        <div className="eventPage-date-time">
                                            <strong>{format(item.date.toDate(), "MMMM dd, yyyy")}</strong>
                                            <span>{format(item.date.toDate(), 'h:mm a')}</span>
                                        </div>
                                    </div>
                                    <div className='eventPage-organizer'>
                                        <strong>Role: </strong>{item.role}<br />
                                        <strong>Organized by: </strong>{item.organizer} <br />
                                        <strong>Location: </strong>{item.city} <br />
                                        <strong>Skills Match: </strong>{Math.round(item.matchPercentage)}% <br />
                                    </div>
                                    <button
                                        className='eventPage-applyBtn'
                                        onClick={() => handleApplyClick(item.id)}
                                    >
                                        Apply
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className='no-event-found'>No events found matching your search.</p>
                        )}
                    </div>
                </div>
            ) : (
                <>
                    <EventsBySkills />
                    <EventsByLocation />
                </>
            )}
        </div>
    )
}

export default Events