import React, { useEffect, useState } from 'react';
import Navbar from './Components/Navbar';
import SideNav from './Components/SideNav';
import MainContent from './Pages/MainContent';
import Error from './Pages/Error404';
import About from './Pages/About';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './Pages/LoginPage';
import Register from './Pages/Register';
import Contact from './Pages/Contact';
import Profile from './Pages/Profile';
import Events from './Pages/Events';
import EventInfo from './Pages/EventInfo';
import ResetPassword from './Pages/ResetPassword';
import Community from './Pages/Community';
import CreateCommunity from './Pages/CreateCommunity';
import CommunityInfo from './Pages/CommunityInfo';
import BrowseCommunities from './Pages/BrowseCommunities';
import EditProfile from './Pages/EditProfile';

function App() {
    const [isSidenavOpen, setIsSidenavOpen] = useState(false);
    const isToken = localStorage.getItem("token");
    const toggleSidenav = () => {
        setIsSidenavOpen(!isSidenavOpen);
    };


    return (
        <>
            <Navbar toggleSidenav={toggleSidenav} />
            <div>
                <SideNav isOpen={isSidenavOpen} />
                <div>
                    <Routes>
                        <Route path="/" element={isToken?<MainContent />:<LoginPage/>} />
                        <Route path="/dashboard" element={isToken?<MainContent />:<LoginPage/>} />
                        <Route path="/about" element={<About />} />
                        <Route path="/login" element={isToken?<MainContent />:<LoginPage/>} />
                        <Route path="/register" element={isToken?<MainContent />:<Register/>} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/profile" element={isToken?<Profile />:<LoginPage />} />
                        <Route path="/events" element={isToken?<Events />:<LoginPage/>} />
                        <Route path="/event/:eventId" element={isToken?<EventInfo />:<LoginPage />} />
                        <Route path="/resetpassword" element={<ResetPassword />} />
                        <Route path="/community" element={isToken?<Community />:<LoginPage/>} />
                        <Route path="/create-community" element={isToken?<CreateCommunity />:<LoginPage />} />
                        <Route path="/community/:commId" element={isToken?<CommunityInfo />:<LoginPage />} />
                        <Route path="/browse-communities" element={isToken?<BrowseCommunities />:<LoginPage />} />
                        <Route path="/edit-profile" element={isToken?<EditProfile />:<LoginPage />} />
                        <Route path="*" element={<Error />} />
                    </Routes>

                </div>
            </div>
        </>
    );
}

export default App;