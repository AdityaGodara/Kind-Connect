// Register.jsx
import React, { useState } from 'react';
import { Eye, EyeOff, ArrowRight, X, Check } from 'lucide-react';
import './styles/register.css';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth,db } from '../firebaseConfig';
import { setDoc, doc } from 'firebase/firestore';
import axios from 'axios';
import { backend } from '../serverPointer';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    gender: '',
    phoneNumber: '',
    location: '',
    skills: [],
    events: []
  });

  var countryConfig = {
    method :'get',
    url: 'https://api.countrystatecity.in/v1/states',
    headers: {
      'X-CSCAPI-KEY': 'API_KEY'
    }
  }

  const [isSuccess, setSuccess] = useState(false);
  const notsuccessStyle = {
    backgroundColor: '#152a3d'
  }
  const successStyle = {
    backgroundColor: 'green'
  }
  const [msg, setMsg] = useState("Register")
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const availableSkills = [
    'JavaScript',
    'Python',
    'React',
    'Node.js',
    'HTML/CSS',
    'Java',
    'SQL',
    'Data Analysis',
    'UI/UX Design',
    'Project Management',
    'Event Management',
    'Cooking and Catering'
  ];

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) {
      newErrors.name = 'Name is required';
    }
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (!formData.gender) {
      newErrors.gender = 'Please select a gender';
    }
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\+?[\d\s-]{10,}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }
    if (!formData.location) {
      newErrors.location = 'Location is required';
    }
    if (formData.skills.length === 0) {
      newErrors.skills = 'Please select at least one skill';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("Wait...")
    if (validateForm()) {
      
      try {
        console.log(backend)
        // const response = await axios.post(`${backend}/user/register`, formData)
        await createUserWithEmailAndPassword(auth,formData.email,formData.password);
        const user = auth.currentUser;
        console.log(user)

        if(user){
            await setDoc(doc(db, "Users", user.uid),{
                name: formData.name,
                email: user.email,
                gender: formData.gender,
                phone: formData.phoneNumber,
                location: formData.location,
                skills: formData.skills
            })

            console.log("User registered successfully!")
        setMsg("Registeration successful!")
        setSuccess(true);
        setTimeout(() => {
          window.location.href = "/login";
        }, 1000);
        }
        
        
      } catch (error) {
        setMsg("Error!")
        console.log(error.message)
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSkillAdd = (e) => {
    const skill = e.target.value;
    if (skill && !formData.skills.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
      e.target.value = '';
      if (errors.skills) {
        setErrors(prev => ({
          ...prev,
          skills: ''
        }));
      }
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };


  return (
    <div className="register-container">
      <div className="register-card">
        <h2 className="register-title">Hola, new guy!</h2>
        <form onSubmit={handleSubmit} className="register-form">
          <div className="r-form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? 'error' : ''}
              placeholder="Enter your name"
            />
            {errors.name && <p className="error-message">{errors.name}</p>}
          </div>

          <div className="r-form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              placeholder="Enter your email"
            />
            {errors.email && <p className="error-message">{errors.email}</p>}
          </div>

          <div className="r-form-group">
            <label>Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? 'error' : ''}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && <p className="error-message">{errors.password}</p>}
          </div>

          <div className="r-form-group">
            <label>Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className={errors.gender ? 'error' : ''}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
            {errors.gender && <p className="error-message">{errors.gender}</p>}
          </div>

          <div className="r-form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className={errors.phoneNumber ? 'error' : ''}
              placeholder="Enter your phone number"
            />
            {errors.phoneNumber && <p className="error-message">{errors.phoneNumber}</p>}
          </div>

          <div className="r-form-group">
            <label>Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className={errors.location ? 'error' : ''}
              placeholder="Enter your city, country"
            />
            {errors.location && <p className="error-message">{errors.location}</p>}
          </div>

          <div className="r-form-group">
            <label>Skills</label>
            <select
              onChange={handleSkillAdd}
              className={errors.skills ? 'error' : ''}
              defaultValue=""
            >
              <option value="" disabled>Select a skill</option>
              {availableSkills.map(skill => (
                <option
                  key={skill}
                  value={skill}
                  disabled={formData.skills.includes(skill)}
                >
                  {skill}
                </option>
              ))}
            </select>
            <div className="skills-container">
              {formData.skills.map(skill => (
                <span key={skill} className="skill-tag">
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="remove-skill"
                  >
                    <X size={16} />
                  </button>
                </span>
              ))}
            </div>
            {errors.skills && <p className="error-message">{errors.skills}</p>}
          </div>

          <button type="submit" className="r-submit-button" style={isSuccess?successStyle:notsuccessStyle}>
            <span >{msg}</span>
            {isSuccess?<Check size={20}/>:<ArrowRight size={20} />}
          </button>
        </form>

        <p className="login-prompt">
          Already have an account?{' '}
          <a href="/login" className="login-link">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;