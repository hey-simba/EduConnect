import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      // Send login data to your backend API
      const response = await axios.post('http://localhost:5000/api/auth/signin', {
        email,
        password
      });
      
      alert('Login successful!');
      
      // If your backend sends a JWT token, you would save it like this:
      // localStorage.setItem('token', response.data.token);
      
      // Navigate to a dashboard or homepage after successful login
      // navigate('/dashboard'); 
      
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Invalid credentials. Please try again.');
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Sign In to EduConnect</h1>
      
      <form onSubmit={handleLogin}>
        <div>
          <input 
            type="email" 
            placeholder="Email Address" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            style={{ padding: '8px', margin: '10px' }}
          />
        </div>
        <div>
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            style={{ padding: '8px', margin: '10px' }}
          />
        </div>
        <button type="submit" style={{ padding: '10px 20px', cursor: 'pointer' }}>
          Sign In
        </button>
      </form>

      <p style={{ marginTop: '20px' }}>
        Don't have an account?{' '}
        <Link to="/signup" style={{ color: '#646cff', textDecoration: 'none' }}>
          Sign Up
        </Link>
      </p>
    </div>
  );
}