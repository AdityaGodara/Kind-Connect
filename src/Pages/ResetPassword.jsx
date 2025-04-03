import React, {useState} from 'react'
import './styles/resetpass.css'
import { sendPasswordResetEmail } from 'firebase/auth';
import { db, auth } from '../firebaseConfig';
import { ArrowRight, Check } from 'lucide-react';

function ResetPassword() {

    const [isSuccess, setSuccess] = useState(false);
    const [msg, setMsg] = useState("Confirm")
    const [errors, setErrors] = useState({});
    const [email, setEmail] = useState("");
        const notsuccessStyle = {
          backgroundColor: '#152a3d'
        }
        const successStyle = {
          backgroundColor: 'green'
        }

    const handleSubmit = (e)=>{
        e.preventDefault()
        setSuccess(false)
        const confirmation = confirm(`Are you sure ${email} is your email?`)
        if(confirmation){
            sendPasswordResetEmail(auth, email)
            setSuccess(true)
            setMsg("Verification mail sent!")
            setTimeout(()=>{
                window.location.href = "/login"
            },1000)
        }
    }
    const handleChange = (e) => {
        const value = e.target.value;
        setEmail(value);
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
        <h2 className="login-title">Reset Password</h2>
        <form onSubmit={(e)=>handleSubmit(e)}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={handleChange}
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="Enter your email"
              required
            />
            {errors.email && (
              <p className="error-message">{errors.email}</p>
            )}
          </div>


          <button type="submit" className="submit-button" style={isSuccess?successStyle:notsuccessStyle}>
            <span>{msg}</span>
            {isSuccess?<Check size={20}/>:<ArrowRight size={20} />}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ResetPassword
