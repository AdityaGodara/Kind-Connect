import React from 'react'
import "./styles/contact.css"
import { faInstagram, faXTwitter, faLinkedin } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
function Contact() {
    return (
        <>
            <div className='main-container'>
                <div className='main-sec1'>
                    <h1 className='abt-head'>Contact Us</h1>
                    <div className='cont-content'>
                        <p><strong>Email: </strong>support@kindconnect.com</p>
                        <p><strong>Phone: </strong>+91 XXXXXXXX01</p>
                        <div className='cont-social'>
                            <FontAwesomeIcon icon={faInstagram} className='cont-ic' />
                            <FontAwesomeIcon icon={faXTwitter} className='cont-ic' />
                            <FontAwesomeIcon icon={faLinkedin} className='cont-ic' />
                        </div>
                        
                    </div>

                </div>
            </div>
        </>
    )
}

export default Contact
