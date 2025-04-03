import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import "./styles/sidenav.css"
import navItems from '../assets/navElements';
import { Link } from 'react-router-dom';


<Link to="/dashboard">Dashboard</Link>

function SideNav({ isOpen }) {

  return (
    <div className={`side-container ${isOpen ? 'open' : ''}`}>
      <div>
        <ul className='side-list'>
          {navItems.map((item, index) => (
            <li key={index} onClick={() => window.location.href = item.path}>
              <Link to={item.path}><FontAwesomeIcon icon={item.icon} className='side-ic' /></Link>
              <span>{item.title}</span>
            </li>
          ))}
        </ul>
        <img src="Images/kindconnect.png" className='kc-img' />
      </div>
    </div>
  );
}

export default SideNav;