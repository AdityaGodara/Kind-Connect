import React, { useState, useEffect } from 'react';
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Mail, UserRound, Phone, MapPin, PenTool, Save, ArrowLeft } from 'lucide-react';
import "./styles/editProfile.css";
import { Link, useNavigate } from 'react-router-dom';

function EditProfile() {
    const [userDetails, setUserDetails] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        gender: '',
        phone: '',
        location: '',
        skills: []
    });
    const [newSkill, setNewSkill] = useState('');
    const [loading, setLoading] = useState(true);
    const [saveStatus, setSaveStatus] = useState('');
    const navigate = useNavigate();

    // Fetch user details when component mounts
    useEffect(() => {
        fetchUserDetail();
    }, []);

    const fetchUserDetail = async () => {
        auth.onAuthStateChanged(async (user) => {
            if (!user) {
                console.log("User not logged in!");
                navigate('/login');
                return;
            }

            const docRef = doc(db, "Users", user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const userData = {
                    id: user.uid,
                    ...docSnap.data()
                };
                setUserDetails(userData);
                setFormData({
                    name: userData.name || '',
                    email: userData.email || '',
                    gender: userData.gender || '',
                    phone: userData.phone || '',
                    location: userData.location || '',
                    skills: userData.skills || []
                });
                setLoading(false);
            } else {
                console.log("No user data found!");
                setLoading(false);
            }
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddSkill = () => {
        if (newSkill.trim() !== '') {
            setFormData(prev => ({
                ...prev,
                skills: [...prev.skills, newSkill.trim()]
            }));
            setNewSkill('');
        }
    };

    const handleRemoveSkill = (indexToRemove) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.filter((_, index) => index !== indexToRemove)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!userDetails || !userDetails.id) {
            setSaveStatus('Error: User not logged in');
            return;
        }

        try {
            setSaveStatus('Saving...');
            const userRef = doc(db, "Users", userDetails.id);
            
            // Update only the fields that can be edited
            await updateDoc(userRef, {
                name: formData.name,
                gender: formData.gender,
                phone: formData.phone,
                location: formData.location,
                skills: formData.skills
            });
            
            setSaveStatus('Profile updated successfully!');
            
            // Navigate back to profile page after successful update
            setTimeout(() => {
                navigate('/profile');
            }, 1500);
        } catch (error) {
            console.error("Error updating profile:", error);
            setSaveStatus(`Error: ${error.message}`);
        }
    };

    if (loading) {
        return <div className='main-container'><h1 className='main-head'>Loading...</h1></div>;
    }

    return (
        <div className='main-container'>
            <div className='main-sec1'>
            <div className='edit-profile-header'>
                        <Link to="/profile" className="back-button">
                            <ArrowLeft size={20} />
                        </Link>
                        <h1 className='main-head'>Edit Profile</h1>
                    </div>
                <div className='profile-sec edit-profile-container'>
                    
                    
                    <form onSubmit={handleSubmit} className='edit-profile-form'>
                        <div className='form-group'>
                            <label>
                                <UserRound size={20} /> Name:
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        
                        <div className='form-group'>
                            <label>
                                <Mail size={20} /> Email:
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                disabled
                                title="Email cannot be changed"
                            />
                            <small>Email cannot be changed</small>
                        </div>
                        
                        <div className='form-group'>
                            <label>
                                <UserRound size={20} /> Gender:
                            </label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleInputChange}
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                                <option value="Prefer not to say">Prefer not to say</option>
                            </select>
                        </div>
                        
                        <div className='form-group'>
                            <label>
                                <Phone size={20} /> Phone:
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                            />
                        </div>
                        
                        <div className='form-group'>
                            <label>
                                <MapPin size={20} /> Location:
                            </label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleInputChange}
                                placeholder="City, Country"
                            />
                        </div>
                        
                        <div className='form-group skills-section'>
                            <label>
                                <PenTool size={20} /> Skills:
                            </label>
                            <div className="skills-input-container">
                                <input
                                    type="text"
                                    value={newSkill}
                                    onChange={(e) => setNewSkill(e.target.value)}
                                    placeholder="Add a new skill"
                                />
                                <button 
                                    type="button" 
                                    onClick={handleAddSkill}
                                    className="add-skill-btn"
                                >
                                    Add
                                </button>
                            </div>
                            
                            <div className="skills-list">
                                {formData.skills.map((skill, index) => (
                                    <div key={index} className="skill-item">
                                        <span>{skill}</span>
                                        <button 
                                            type="button" 
                                            onClick={() => handleRemoveSkill(index)}
                                            className="remove-skill-btn"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        {saveStatus && (
                            <div className={`save-status ${saveStatus.includes('Error') ? 'error' : 'success'}`}>
                                {saveStatus}
                            </div>
                        )}
                        
                        <div className="form-actions">
                            <Link to="/profile" className="cancel-btn">Cancel</Link>
                            <button type="submit" className="save-btn">
                                <Save size={16} /> Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default EditProfile;