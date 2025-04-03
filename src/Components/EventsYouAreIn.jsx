import React, { useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { format } from "date-fns";
import "./styles/eventsYRI.css"

function EventsYouAreIn() {
  const [userDetails, setUserDetails] = useState(null);
  const [expandedEvents, setExpandedEvents] = useState({});
  const [events, setEvents] = useState([]);

  const fetchUserEvents = async () => {
          if (!userDetails || !userDetails.events || userDetails.events.length === 0) {
              return;
          }
          
          try {
              
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
          } catch (error) {
              console.error("Error fetching events:", error);
          } finally {
          }
      }

  const fetchUserDetail = async () => {
    try {
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
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const toggleReadMore = (eventId) => {
    setExpandedEvents((prev) => ({
      ...prev,
      [eventId]: !prev[eventId],
    }));
  };

  const renderEventDescription = (event, index) => {
    if (event.desc && event.desc.length > 200) {
      const isExpanded = expandedEvents[index] || false;
      const displayText = isExpanded
        ? event.desc
        : `${event.desc.substring(0, 200)}...`;

      return (
        <>
          <p className="event-desc">{displayText}</p>
          <button
            className="read-more-btn"
            onClick={() => toggleReadMore(index)}
          >
            {isExpanded ? "Read Less" : "Read More"}
          </button>
        </>
      );
    }
    return <p className="event-desc">{event.desc}</p>;
  };

  useEffect(() => {
          fetchUserDetail();
      }, []);
  
      useEffect(() => {
          if (userDetails) {
              fetchUserEvents();
          }
      }, [userDetails]);

  return (
    <div className="main-sec1">
      <h1 className="main-head">Events you are in:</h1>
      <div className="main-event-section">
        {userDetails && userDetails.events && userDetails.events.length > 0 ? (
          events.map((event, index) => (
            <div className="main-event-card" key={event.id || index}>
              <img
                src={event.img[0]}
                alt={`${event.name} image`}
                className="event-image"
              />
              <div className="event-head-info">
                <span className="event-title">{event.name}</span>
                <br />
                <strong>{format(event.date.toDate(), "MMMM dd, yyyy")}</strong>
              </div>
              <div className="role-txt"><strong>Role: </strong>{event.role}</div>
            </div>
          ))
        ) : (
          <p>No events to show.</p>
        )}
      </div>
    </div>
  );
}

export default EventsYouAreIn;
