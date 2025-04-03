import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { db, auth } from "../firebaseConfig"
import { arrayUnion, doc, getDoc, increment, updateDoc } from "firebase/firestore"
import { format } from "date-fns"
import { Phone, Mail, MapPin } from "lucide-react"
import Map from '../Components/Map'
import "./styles/eventinfo.css"
import axios from 'axios'

function EventInfo() {
    const [event, setEvent] = useState(null)
    const [userDetails, setUserDetails] = useState(null)
    const [loading, setLoading] = useState(true)
    const [activeImg, setActiveImg] = useState(null)
    const [hasApplied, setHasApplied] = useState(false)
    const { eventId } = useParams()
    const navigate = useNavigate()
    const [address, setAddress] = useState("");

    useEffect(() => {
        fetchUserDetail()
        fetchEventDetails()
    }, [eventId])

    // Check if user has already applied whenever userDetails is updated
    useEffect(() => {
        if (userDetails && userDetails.events && eventId) {
            // Check if this event ID is in the user's events array
            setHasApplied(userDetails.events.includes(eventId))
            getAddress();
        }
    }, [userDetails, eventId])

    const getAddress = async () => {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${event.location.latitude}&lon=${event.location.longitude}`

        try {
            const response = await axios.get(url);
            if (response.data && response.data.display_name) {
                setAddress(response.data.display_name);
            } else {
                setAddress("Unable to fetch address");
            }
        } catch (error) {
            console.error("Error fetching address:", error);
            setAddress("Error fetching address");
        }

    };

    const fetchUserDetail = async () => {
        auth.onAuthStateChanged(async (user) => {
            if (!user) {
                console.log("User not logged in!")
                return
            }

            const docRef = doc(db, "Users", user.uid)
            const docSnap = await getDoc(docRef)
            if (docSnap.exists()) {
                setUserDetails({
                    id: user.uid,
                    ...docSnap.data()
                })
            } else {
                console.log("No user data found!")
            }
        })
    }

    const fetchEventDetails = async () => {
        try {
            setLoading(true)
            const eventDocRef = doc(db, "Events", eventId)
            const eventDocSnap = await getDoc(eventDocRef)

            if (eventDocSnap.exists()) {
                const eventData = {
                    id: eventDocSnap.id,
                    ...eventDocSnap.data()
                }
                setEvent(eventData)

                // Set the first image as the active image initially
                if (eventData.img && eventData.img.length > 0) {
                    setActiveImg(eventData.img[0])
                }
            } else {
                console.error("Event not found!")
            }
        } catch (err) {
            console.error("Error fetching event details:", err)
        } finally {
            setLoading(false)
        }
    }

    const handleApply = async () => {
        let confirmPrompt = prompt("Type 'yes' to confirm registration of event!")
        if (confirmPrompt === 'yes') {
            const docRef = doc(db, "Users", userDetails.id)
            const eventDocRef = doc(db, "Events", eventId)

            try {
                await updateDoc(docRef, {
                    events: arrayUnion(eventId)
                })
                await updateDoc(eventDocRef, {
                    members: arrayUnion(userDetails.id),
                    currVol: increment(1)
                })

                // Update local state to reflect the change
                setHasApplied(true)
                window.location.href = "/profile"
            } catch (error) {
                console.log(error.message)
            }
        }
    }

    const handleGoBack = () => {
        navigate(-1)
    }

    // Function to handle thumbnail click
    const handleThumbnailClick = (imgUrl) => {
        setActiveImg(imgUrl)
    }

    if (loading) {
        return (
            <div className="event-info-container">
                <h2>Loading event information...</h2>
            </div>
        )
    }

    if (!event) {
        return (
            <div className="event-info-container">
                <h2>Event not found</h2>
                <button className="back-button" onClick={handleGoBack}>Go Back</button>
            </div>
        )
    }

    return (
        <div className='main-container'>
            <div className="main-sec1">
                <div className="event-info-container">
                    <button className="back-button" onClick={handleGoBack}>← </button>

                    <div className="event-header">
                        <h1>{event.name}</h1>
                        <div className="event-date-time">
                            <span className="event-date">{format(event.date.toDate(), "MMMM dd, yyyy")}</span>
                            <span className="event-time">{format(event.date.toDate(), 'h:mm a')}</span>
                        </div>
                    </div>

                    <div className="event-image-gallery">
                        {event.img && event.img.length > 0 ? (
                            <img
                                src={activeImg}
                                alt={`${event.name}`}
                                className="event-main-image"
                            />
                        ) : (
                            <div className="event-no-image">No image available</div>
                        )}

                        {event.img && event.img.length > 0 && (
                            <div className="event-thumbnails">
                                {event.img.map((imgUrl, index) => (
                                    <img
                                        key={index}
                                        src={imgUrl}
                                        alt={`${event.name} thumbnail ${index + 1}`}
                                        className={`event-thumbnail ${activeImg === imgUrl ? 'active' : ''}`}
                                        onClick={() => handleThumbnailClick(imgUrl)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="event-details-container">
                        <div className="event-main-details">
                            <div className="event-detail-section">
                                <h3>Event Description</h3>
                                <p>{event.desc || "No description available"}</p>
                                <h4>Role: {event.role}</h4>
                            </div>

                            <div className="event-detail-section">
                                <h3>Event Details</h3>
                                <div className="detail-item">
                                    <strong>Location:</strong> {event.city}, {event.venue || "Venue TBA"}
                                </div>
                                <div className="detail-item">
                                    <strong>Organized by:</strong> {event.organizer}
                                </div>
                                {event && (
                                    <div className="detail-item">
                                        <strong>Volunteers:</strong> {event.currVol}/{event.reqVol} people
                                    </div>
                                )}
                                {event.price !== undefined && (
                                    <div className="detail-item">
                                        <strong>Price:</strong> {event.price === 0 ? "Free" : `$${event.price}`}
                                    </div>
                                )}
                                {event.skillReq && (
                                    <div className="detail-item">
                                        <strong>Skills Required:</strong><br />
                                        <ul>
                                            {event.skillReq.map((skill, index) => (
                                                <li key={index}>{skill}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="event-action-section">
                            {!hasApplied ? (
                                <button className="apply-button" onClick={handleApply}>
                                    Apply Now
                                </button>
                            ) : (
                                <div className="already-applied">
                                    <p>You have already applied to this event</p>
                                </div>
                            )}
                            {event.contact && (
                                <div className="event-contact-info">
                                    <h4>Contact Information</h4>
                                    <p>
                                        {event.contact.includes("@") ? (
                                            <>
                                                <Mail size={20} /> {event.contact}
                                            </>
                                        ) : (
                                            <>
                                                <Phone size={20} /> +91 {event.contact}
                                            </>
                                        )}

                                    </p>
                                    <p>
                                        <strong><MapPin size={20} /></strong>&nbsp;{address}
                                    </p>
                                </div>
                            )}
                            <br />
                            <br />
                            <Map latitude={event.location.latitude} longitude={event.location.longitude} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EventInfo