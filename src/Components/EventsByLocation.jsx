import React, { useState, useEffect } from 'react'
import { auth, db } from "../firebaseConfig"
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore"
import { format } from "date-fns"
import { useNavigate } from "react-router-dom"  // Import useNavigate
import "../Pages/styles/events.css"

function EventsByLocation() {

    const [userDetails, setUserDetails] = useState(null)
    const [locEvents, setLocEvents] = useState([])
    const navigate = useNavigate()  // Initialize useNavigate

    useEffect(() => {
        fetchUserDetail()
    }, [])

    useEffect(() => {
        // Only fetch events when userDetails is available
        if (userDetails) {
            fetchEvents()
        }
    }, [userDetails])

    const fetchUserDetail = async () => {
        auth.onAuthStateChanged(async (user) => {
            if (!user) {
                console.log("User not logged in!")
                return
            }

            const docRef = doc(db, "Users", user.uid)
            const docSnap = await getDoc(docRef)
            if (docSnap.exists()) {
                setUserDetails(docSnap.data())
            } else {
                console.log("No user data found!")
            }
        })
    }

    const fetchEvents = async () => {
        try {
            // Reference to the Events collection
            const eventsCollectionRef = collection(db, "Events")

            //GET EVENTS FILTERED BY USER LOCATION
            const q = query(eventsCollectionRef, where("city", "==", `${userDetails.location}`))
            const locqSnap = await getDocs(q)

            const LoceventData = locqSnap.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            setLocEvents(LoceventData)
        } catch (err) {
            console.error("Error fetching events:", err)
        }
    }

    // Function to handle Apply button click
    const handleApplyClick = (eventId) => {
        navigate(`/event/${eventId}`)  // Navigate to EventInfo page with eventId parameter
    }


    return (
        <div>
            {userDetails ? (
                <div>
                    <div className='main-sec1'>
                        <h1 className='main-head'>Events in {userDetails.location}</h1>
                        <div className="eventPage-events">
                            {locEvents.length > 0 ?
                                locEvents.map((item, count) => (
                                    <div className="main-event-card" key={count}>
                                        <img src={item.img[0]} alt={`${item.name} image`} />
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
                                        </div>
                                        <button
                                            className='eventPage-applyBtn'
                                            onClick={() => handleApplyClick(item.id)}
                                        >
                                            Apply
                                        </button>
                                    </div>
                                ))
                                :
                                <p className='no-event-found'>No events available in your location.</p>
                            }
                        </div>
                    </div>
                </div>
            ) : (
                <div className='main-sec1'>
                    <h1 className='main-head'>Loading...</h1>
                </div>
            )}
        </div>
    )
}

export default EventsByLocation
