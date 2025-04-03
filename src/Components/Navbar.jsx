import React from 'react'
import './styles/navbar.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faBell, faBars } from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router-dom'

function Navbar({ toggleSidenav }) {
    return (
        <div className='container'>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1em' }}>
                <FontAwesomeIcon
                    icon={faBars}
                    className='menu-icon'
                    onClick={toggleSidenav}
                />
                <a href="/" className='title'><h1 >KindConnect</h1></a>
            </div>
            <div className='util_sec'>
                <span className='foot-cont'>
                    <Link to="/about" className='foot-link'>About</Link>
                </span>
                <span className='foot-cont'>
                    <Link to="/contact" className='foot-link'>Contact Us</Link>
                </span>
                <Link to="/profile">
                    <FontAwesomeIcon icon={faUser} className='user-ic' />
                </Link>
                
            </div>
        </div>
    )
}

export default Navbar