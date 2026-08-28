// authService.js

export const loginUser = async (email, password) => {
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.toLowerCase(), password })
    });
    const data = await response.json();

    // Save user object (with role!) to localStorage on successful login
    if (response.ok && data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
    }

    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    console.error('Database connection error:', error);
    throw new Error('NetworkError');
  }
};

export const registerUser = async (name, email, password, role, cvLink = '') => {
  try {
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email: email.toLowerCase(), password, role, cvLink })
    });
    const data = await response.json();
    
    return { ok: response.ok, data };
  } catch (error) {
    console.error('Database connection error:', error);
    throw new Error('NetworkError');
  }
};