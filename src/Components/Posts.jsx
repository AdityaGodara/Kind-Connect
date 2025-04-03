import React, { useState, useEffect } from 'react';
import './styles/posts.css';
import { Pencil, ChevronUp } from 'lucide-react';
import { collection, getDocs, addDoc, query, where, orderBy, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

function Posts({ communityId }) {
    const [addPostEnabled, setAddPost] = useState(false);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newPost, setNewPost] = useState({ title: '', content: '' });
    const [userData, setUserData] = useState(null);
    const [authorNames, setAuthorNames] = useState({});

    // Fetch posts when component mounts or communityId changes
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setUserData(user);
            }
        });

        fetchPosts();

        // Clean up authentication listener
        return () => unsubscribe();
    }, [communityId]);

    const fetchAuthorName = async (authorId) => {
        try {
            // Check if we already fetched this author's name
            if (authorNames[authorId]) {
                return authorNames[authorId];
            }

            // Get the user document from the Users collection
            const userRef = doc(db, "Users", authorId);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                const userName = userSnap.data().name || "Unknown User";
                
                // Save the author name to avoid refetching
                setAuthorNames(prev => ({
                    ...prev,
                    [authorId]: userName
                }));
                
                return userName;
            } else {
                return "Unknown User";
            }
        } catch (error) {
            console.error("Error fetching author data:", error);
            return "Unknown User";
        }
    };

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const postsRef = collection(db, "Posts");
            const q = query(
                postsRef, 
                where("communityId", "==", communityId),
                orderBy("createdAt", "desc")
            );
            
            const querySnapshot = await getDocs(q);
            const postsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            // Fetch author names for all posts
            const postsWithAuthors = await Promise.all(postsData.map(async (post) => {
                if (post.Author) {
                    const authorName = await fetchAuthorName(post.Author);
                    return {
                        ...post,
                        authorName
                    };
                }
                return post;
            }));
            
            setPosts(postsWithAuthors);
            setError(null);
        } catch (error) {
            console.error("Error fetching posts:", error);
            setError("Failed to load posts. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePostBtn = () => {
        setAddPost(!addPostEnabled);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewPost(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePostSubmit = async (e) => {
        e.preventDefault();
        
        if (!newPost.title.trim() || !newPost.content.trim()) {
            return;
        }
        
        if (!userData) {
            setError("You must be logged in to create a post.");
            return;
        }
        
        try {
            await addDoc(collection(db, "Posts"), {
                title: newPost.title,
                content: newPost.content,
                communityId: communityId,
                createdAt: serverTimestamp(),
                Author: userData.uid
            });
            
            // Reset form and fetch updated posts
            setNewPost({ title: '', content: '' });
            setAddPost(false);
            fetchPosts();
        } catch (error) {
            console.error("Error adding post:", error);
            setError("Failed to create post. Please try again.");
        }
    };

    // Function to convert plain text to HTML with hyperlinks
  const createMarkup = (text) => {
    if (!text) return { __html: '' };
    
    // URL regex pattern - matches URLs starting with http:// or https://
    const urlRegex = /(https?:\/\/[^\s]+)/gi;
    
    // Replace URLs with anchor tags
    const htmlContent = text.replace(
      urlRegex, 
      '<a href="$&" target="_blank" rel="noopener noreferrer" class="message-link"> $&</a>'
    );
    
    return { __html: htmlContent };
  };

    return (
        <div className='post-main-cont'>
            <button className='create-post-txt' onClick={handleCreatePostBtn}>
                {addPostEnabled ? <ChevronUp /> : <Pencil size={20} />} Create post
            </button>

            {addPostEnabled ? (
                <form onSubmit={handlePostSubmit} className='post-form-grp'>
                    <input 
                        type="text" 
                        name="title"
                        value={newPost.title}
                        onChange={handleInputChange}
                        placeholder='Title...' 
                        required 
                    />
                    <textarea 
                        name="content"
                        value={newPost.content}
                        onChange={handleInputChange}
                        placeholder='Write something to share...' 
                        rows={10} 
                        cols={65} 
                        required
                    ></textarea>
                    <button type="submit" className='submit-post'>Submit</button>
                </form>
            ) : (
                <div className='posts-container'>
                    {loading ? (
                        <p>Loading posts...</p>
                    ) : error ? (
                        <p className="error-message">{error}</p>
                    ) : posts.length === 0 ? (
                        <p>No posts yet in this community. Be the first to share something!</p>
                    ) : (
                        posts.map(post => (
                            <div key={post.id} className="post-card">
                                <h2>{post.title}</h2>
                                <small>{post.authorName || "Unknown user"}</small>
                                <p dangerouslySetInnerHTML={createMarkup(post.content)}></p>
                                <div className="post-metadata">
                                    <small>
                                    <span className="post-date">{post.createdAt ? new Date(post.createdAt.toDate()).toLocaleString() : "Date unknown"}</span>
                                    </small>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

export default Posts;