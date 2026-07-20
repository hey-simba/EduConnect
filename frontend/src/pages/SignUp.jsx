import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function SignUp() {
  // State to hold user input
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Hook to redirect the user after they register
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault(); // Prevents the page from refreshing when you click submit
    
    try {
      // Sending the input data to your backend API
      const response = await axios.post('http://localhost:5000/api/auth/signup', {
        name,
        email,
        password
      });
      
      alert(response.data.message); // Should say "User successfully created!"
      navigate('/signin'); // Automatically jump to the sign-in page
      
    } catch (error) {
      console.error(error);
      // Show the error message from your backend if the email already exists
      alert(error.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Sign Up for EduConnect</h1>
      
      <form onSubmit={handleRegister}>
        <div>
          <input 
            type="text" 
            placeholder="Full Name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
            style={{ padding: '8px', margin: '10px' }}
          />
        </div>
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
          Create Account
        </button>
      </form>
    </div>
  );
}