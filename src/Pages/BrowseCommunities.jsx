import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, limit, where, orderBy, startAt, endAt } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './styles/browseCommunities.css'; // You'll need to create this CSS file

function BrowseCommunities() {
    const [communities, setCommunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredCommunities, setFilteredCommunities] = useState([]);
    const navigate = useNavigate();

    const fetchCommunities = async () => {
        try {
            setLoading(true);
            
            // Create a query to get 20 random communities
            // Using orderBy with a random field would be ideal, but for simplicity we'll use timestamp or name
            const communitiesRef = collection(db, "Communities");
            const q = query(
                communitiesRef, 
                where("isPrivate", "!=", true), // Exclude private communities
                orderBy("isPrivate"), // Required for inequality filters
                orderBy("createdAt", "desc"), 
                limit(20)
            );
            
            const querySnapshot = await getDocs(q);
            const communitiesList = [];
            
            querySnapshot.forEach((doc) => {
                communitiesList.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            setCommunities(communitiesList);
            setFilteredCommunities(communitiesList);
            setLoading(false);
        } catch (error) {
            console.log(error.message);
            setError(error.message);
            setLoading(false);
        }
    };

    // Handle search input change
    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        
        if (query.trim() === '') {
            setFilteredCommunities(communities);
        } else {
            const filtered = communities.filter(community => 
                community.name.toLowerCase().includes(query.toLowerCase()) ||
                (community.description && community.description.toLowerCase().includes(query.toLowerCase())) ||
                (community.tags && community.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())))
            );
            setFilteredCommunities(filtered);
        }
    };

    // Search communities in Firestore directly
    const handleFirestoreSearch = async () => {
        if (!searchQuery.trim()) {
            // If search is empty, revert to showing all communities
            setFilteredCommunities(communities);
            return;
        }

        try {
            setLoading(true);
            
            // Create a query for name search
            // Note: This is a simple implementation. For better search, consider using Firebase extensions like Algolia
            const communitiesRef = collection(db, "Communities");
            const q = query(
                communitiesRef,
                orderBy("name"),
                startAt(searchQuery.toLowerCase()),
                endAt(searchQuery.toLowerCase() + '\uf8ff'),
                limit(20)
            );
            
            const querySnapshot = await getDocs(q);
            const searchResults = [];
            
            querySnapshot.forEach((doc) => {
                searchResults.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            setFilteredCommunities(searchResults);
            setLoading(false);
        } catch (error) {
            console.log(error.message);
            setError(error.message);
            setLoading(false);
        }
    };

    // Navigate to community details
    const navigateToCommunity = (communityId) => {
        navigate(`/community/${communityId}`);
    };

    useEffect(() => {
        fetchCommunities();
    }, []);

    return (
        <div className='main-container'>
            <div className="main-sec1">
                <h1>Browse Communities</h1>
                
                {/* Search bar */}
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Search communities..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="search-input"
                    />
                    <button onClick={handleFirestoreSearch} className="search-button">
                        <Search size={20} />
                    </button>
                </div>
                
                {loading ? (
                    <div className="loading">Loading communities...</div>
                ) : error ? (
                    <div className="error">Error: {error}</div>
                ) : (
                    <div className="communities-grid">
                        {filteredCommunities.length === 0 ? (
                            <div className="no-results">No communities found</div>
                        ) : (
                            filteredCommunities.map(community => (
                                <div 
                                    key={community.id} 
                                    className="community-card"
                                    onClick={() => navigateToCommunity(community.id)}
                                >
                                    {community.coverImage && (
                                        <div className="community-image">
                                            <img 
                                                src={community.coverImage} 
                                                alt={community.name} 
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = '/default-community.png'; // Fallback image
                                                }}
                                            />
                                        </div>
                                    )}
                                    <div className="community-info">
                                        <h2>{community.name}</h2>
                                        <p className="community-description">
                                            {community.description && community.description.length > 100 
                                                ? `${community.description.substring(0, 100)}...` 
                                                : community.description}
                                        </p>
                                        <div className="community-meta">
                                            <span>{community.memberCount || 0} members</span>
                                            {community.category && <span>{community.category}</span>}
                                        </div>
                                        {community.tags && community.tags.length > 0 && (
                                            <div className="community-tags">
                                                {community.tags.slice(0, 3).map((tag, index) => (
                                                    <span key={index} className="tag">{tag}</span>
                                                ))}
                                                {community.tags.length > 3 && <span className="more-tags">+{community.tags.length - 3}</span>}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default BrowseCommunities;