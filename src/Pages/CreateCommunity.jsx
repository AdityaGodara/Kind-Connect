import React, { useState, useEffect } from 'react';
import { auth, db } from "../firebaseConfig";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./styles/createComm.css"; // You'll need to create this CSS file

function CreateCommunity() {
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '',
        tags: [],
        rules: [],
        isPrivate: false,
        location: '',
        coverImage: '' // This will be a URL string instead of a file
    });
    const [currentTag, setCurrentTag] = useState('');
    const [currentRule, setCurrentRule] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const navigate = useNavigate();

    const categories = [
        "Arts & Culture",
        "Business & Entrepreneurship",
        "Education & Learning",
        "Environment & Sustainability",
        "Fitness & Health",
        "Gaming & Entertainment",
        "Hobby & Interest",
        "Local Community",
        "Social Causes",
        "Sports & Recreation",
        "Technology & Innovation",
        "Travel & Adventure",
        "Other"
    ];

    useEffect(() => {
        // Check if user is logged in
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            if (currentUser) {
                setUser(currentUser);
            } else {
                // Redirect to login if not logged in
                navigate('/login');
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const addTag = () => {
        if (currentTag.trim() !== '' && !formData.tags.includes(currentTag.trim())) {
            setFormData({
                ...formData,
                tags: [...formData.tags, currentTag.trim()]
            });
            setCurrentTag('');
        }
    };

    const removeTag = (tagToRemove) => {
        setFormData({
            ...formData,
            tags: formData.tags.filter(tag => tag !== tagToRemove)
        });
    };

    const addRule = () => {
        if (currentRule.trim() !== '') {
            setFormData({
                ...formData,
                rules: [...formData.rules, currentRule.trim()]
            });
            setCurrentRule('');
        }
    };

    const removeRule = (ruleToRemove) => {
        setFormData({
            ...formData,
            rules: formData.rules.filter(rule => rule !== ruleToRemove)
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name || !formData.description || !formData.category) {
            setError("Please fill in all required fields.");
            return;
        }

        if (!formData.coverImage) {
            setError("Please provide a cover image URL.");
            return;
        }

        try {
            setLoading(true);
            setError('');

            // Generate a unique ID for the community
            const communityId = `com_${Date.now()}`
            // Create community document
            const communityData = {
                ...formData,
                id: communityId,
                createdBy: user.uid,
                members: [user.uid],  // Creator is the first member
                moderators: [user.uid],  // Creator is the first moderator
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                memberCount: 1
            };

            await setDoc(doc(db, "Communities", communityId), communityData);
            
            // Redirect to the newly created community page
            navigate(`/community/${communityId}`);
        } catch (error) {
            console.error("Error creating community:", error);
            setError("Failed to create community. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className='main-container'>
            <div className="main-sec1">
                <h1 className="main-head-create-comm">Create a New Community</h1>
                
                {error && <div className="error-message">{error}</div>}
                
                <form className="community-form" onSubmit={handleSubmit}>
                    <div className="form-section">
                        <h2>Basic Information</h2>
                        
                        <div className="form-group">
                            <label htmlFor="name">Community Name *</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter community name"
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="description">Description *</label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe what your community is about"
                                rows="4"
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="category">Category *</label>
                            <select
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select a category</option>
                                {categories.map((category, index) => (
                                    <option key={index} value={category}>{category}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="location">Location (Optional)</label>
                            <input
                                type="text"
                                id="location"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="City, Country"
                            />
                        </div>
                        
                        <div className="form-group checkbox-group">
                            <input
                                type="checkbox"
                                id="isPrivate"
                                name="isPrivate"
                                checked={formData.isPrivate}
                                onChange={handleChange}
                            />
                            <label htmlFor="isPrivate">Make this community private</label>
                            <p className="form-help">Private communities require member approval and aren't visible in search results.</p>
                        </div>
                    </div>
                    
                    <div className="form-section">
                        <h2>Community Image</h2>
                        
                        <div className="form-group">
                            <label htmlFor="coverImage">Cover Image URL *</label>
                            <input
                                type="text"
                                id="coverImage"
                                name="coverImage"
                                value={formData.coverImage}
                                onChange={handleChange}
                                placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                                required
                            />
                            <p className="form-help">Provide a URL to an image for your community banner.</p>
                            
                            {formData.coverImage && (
                                <div className="image-preview">
                                    <img 
                                        src={formData.coverImage} 
                                        alt="Cover preview" 
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://via.placeholder.com/800x200?text=Invalid+Image+URL';
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="form-section">
                        <h2>Tags</h2>
                        <div className="form-group">
                            <label htmlFor="currentTag">Add Tags</label>
                            <div className="tag-input-container">
                                <input
                                    type="text"
                                    id="currentTag"
                                    value={currentTag}
                                    onChange={(e) => setCurrentTag(e.target.value)}
                                    placeholder="Enter a tag"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            addTag();
                                        }
                                    }}
                                />
                                <button type="button" onClick={addTag}>Add</button>
                            </div>
                            <p className="form-help">Press Enter or click Add to add a tag</p>
                            
                            <div className="tags-container">
                                {formData.tags.map((tag, index) => (
                                    <span key={index} className="tag">
                                        {tag}
                                        <button 
                                            type="button" 
                                            className="remove-tag" 
                                            onClick={() => removeTag(tag)}
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    <div className="form-section">
                        <h2>Community Rules</h2>
                        <div className="form-group">
                            <label htmlFor="currentRule">Add Rules</label>
                            <div className="rule-input-container">
                                <input
                                    type="text"
                                    id="currentRule"
                                    value={currentRule}
                                    onChange={(e) => setCurrentRule(e.target.value)}
                                    placeholder="Enter a rule"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            addRule();
                                        }
                                    }}
                                />
                                <button type="button" onClick={addRule}>Add</button>
                            </div>
                            <p className="form-help">Press Enter or click Add to add a rule</p>
                            
                            <div className="rules-container">
                                {formData.rules.map((rule, index) => (
                                    <div key={index} className="rule">
                                        <span className="rule-number">{index + 1}.</span>
                                        <span className="rule-text">{rule}</span>
                                        <button 
                                            type="button" 
                                            className="remove-rule" 
                                            onClick={() => removeRule(rule)}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    <div className="form-actions">
                        <button 
                            type="button" 
                            className="cancel-btn"
                            onClick={() => navigate(-1)}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="submit-btn"
                            disabled={loading}
                        >
                            {loading ? 'Creating...' : 'Create Community'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateCommunity;