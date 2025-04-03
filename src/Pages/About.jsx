import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHeart } from '@fortawesome/free-solid-svg-icons'

function About() {
  return (
    <>
    <div className='main-container'>
            <div className='main-sec1'>
                <h1 className='abt-head'>About Us</h1>
                <div className='abt-para'>
                Welcome to <strong>KindConnect</strong> — where compassion meets opportunity. <br />

We believe in the power of volunteering to create meaningful change in the world. Our platform bridges the gap between passionate individuals and impactful NGOs, making it easier than ever to contribute to causes you care about.

With features like AI-driven recommendations, real-time NGO updates, and seamless application processes, we empower volunteers to find the perfect opportunities tailored to their skills, location, and interests. <br /> <br />

Our mission is simple: <br />

<strong>Enable Connections:</strong> Bringing NGOs and volunteers together to maximize community impact. <br />
<strong>Foster Growth:</strong> Helping individuals grow by connecting them to opportunities that build skills and networks. <br />
<strong>Promote Transparency:</strong> Ensuring every interaction on the platform is safe, open, and impactful. <br /><br />
Whether you’re looking to teach, code, advocate, or plant trees, we’re here to guide you toward opportunities that matter. Together, we can build a better tomorrow. <br />

Join us today and start making a difference. Because your time, talent, and passion can transform lives. <br />

<h2>Created with <FontAwesomeIcon icon={faHeart} color='red'/> by</h2>
<p><a href="https://www.linkedin.com/in/aditya-godara-b858751ab/" target='blank' className='creator-link'>Aditya Godara</a></p>
                </div>
            </div>
        </div>
        </>
  )
}

export default About
