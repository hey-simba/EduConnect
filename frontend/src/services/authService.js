// authService.js

// Dummy credentials for DNS/Server bypass
const DUMMY_ACCOUNTS = {
  student: { email: 'student@test.com', password: 'Password123!' },
  instructor: { email: 'instructor@test.com', password: 'Password123!' }
};

export const loginUser = async (email, password) => {
  // 1. MOCK CONTROLLER LOGIC (Bypass for DNS issues)
  if (email === DUMMY_ACCOUNTS.student.email && password === DUMMY_ACCOUNTS.student.password) {
    return { ok: true, data: { message: 'Success', role: 'student' } };
  }
  if (email === DUMMY_ACCOUNTS.instructor.email && password === DUMMY_ACCOUNTS.instructor.password) {
    return { ok: true, data: { message: 'Success', role: 'instructor' } };
  }

  // 2. REAL CONTROLLER LOGIC (Standard MVC fetch)
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.toLowerCase(), password })
    });
    const data = await response.json();
    
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    console.error('Database connection error:', error);
    throw new Error('NetworkError');
  }
};

export const registerUser = async (name, email, password, role) => {
  try {
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email: email.toLowerCase(), password, role })
    });
    const data = await response.json();
    
    return { ok: response.ok, data };
  } catch (error) {
    console.error('Database connection error:', error);
    throw new Error('NetworkError');
  }
};