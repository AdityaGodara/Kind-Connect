import React, { useState } from 'react';
import { Eye, EyeOff, ArrowRight, Check } from 'lucide-react';
import './styles/login.css';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';

const LoginForm = () => {

  const [isSuccess, setSuccess] = useState(false);
    const notsuccessStyle = {
      backgroundColor: '#152a3d'
    }
    const successStyle = {
      backgroundColor: 'green'
    }
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState("Sign In")

  const validateForm = () => {
    const newErrors = {};
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
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        setMsg("Wait...");
        await signInWithEmailAndPassword(auth, formData.email, formData.password)
        window.localStorage.setItem("token", "Bearerx001agdoidtayra")
        console.log("User logged in successfully!")
        setSuccess(true);
        setMsg("Logged in!")
        setTimeout(()=>{
          window.location.href = "/profile";
        }, 1000)
        
      } catch (error) {
        console.log(error.message)
        if(error.message=="Firebase: Error (auth/invalid-credential)."){
          setMsg("Invalid Credentials!");
          setTimeout(()=>{
            setMsg("Sign In");
          }, 1000)
        }
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Welcome Back</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="error-message">{errors.email}</p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
              >
                {showPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="error-message">{errors.password}</p>
            )}
          </div>

          <div className="form-footer">
            <div className="remember-me">
              <input type="checkbox" id="remember" />
              <label htmlFor="remember">Remember me</label>
            </div>
            <a href="/resetpassword" className="forgot-password">
              Forgot password?
            </a>
          </div>

          <button type="submit" className="submit-button" style={isSuccess?successStyle:notsuccessStyle}>
            <span>{msg}</span>
            {isSuccess?<Check size={20}/>:<ArrowRight size={20} />}
          </button>
        </form>

        <p className="signup-prompt">
          Don't have an account?{' '}
          <a href="/register" className="signup-link">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;