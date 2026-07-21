import React, { useState, useEffect } from 'react';

const LandingPage = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [role, setRole] = useState('student');
  
  // View States
  const [isLoginView, setIsLoginView] = useState(true); 
  const [isForgotPasswordView, setIsForgotPasswordView] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState(false);

  // Input States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Error States
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Simulated Database (Mock users for frontend testing)
  const mockUsers = {
    'test@example.com': 'Pass123!' // Key: email, Value: password
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Password Constraint Logic
  const passwordCriteria = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
  const allCriteriaMet = Object.values(passwordCriteria).every(Boolean);
  const passwordsMatch = password === confirmPassword;

  // Eye Icons
  const EyeOpen = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 15a3 3 0 100-6 3 3 0 000 6z" /><path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clipRule="evenodd" /></svg>;
  const EyeClosed = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M3.53 2.47a.75.75 0 00-1.06 1.06l18 18a.75.75 0 101.06-1.06l-18-18zM22.676 12.553a11.249 11.249 0 01-2.631 4.31l-3.099-3.099a5.25 5.25 0 00-6.71-6.71L7.759 4.577a11.217 11.217 0 014.242-.827c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113z" /><path d="M15.75 12c0 .18-.013.357-.037.53l-4.244-4.243A3.75 3.75 0 0115.75 12zM12.53 15.713l-4.243-4.244a3.75 3.75 0 004.243 4.243z" /><path d="M6.75 12c0-.619.107-1.213.304-1.764l-3.1-3.1a11.25 11.25 0 00-2.63 4.31c-.12.362-.12.752 0 1.114 1.489 4.467 5.704 7.69 10.675 7.69 1.5 0 2.933-.294 4.242-.827l-2.477-2.477A5.25 5.25 0 016.75 12z" /></svg>;

  // Compelete Form Reset Helper
  const resetAllFormStates = () => {
    // Reset Views
    setIsLoginView(true);
    setIsForgotPasswordView(false);
    setSuccessMessage('');
    setResetEmailSent(false);
    // Reset Inputs
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    // Reset UI/Errors
    setShowPassword(false);
    setShowConfirmPassword(false);
    setEmailError('');
    setPasswordError('');
  };

  // Form Submission Handler
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setEmailError('');
    setPasswordError('');

    // --- Handling Forgot Password Submission ---
    if (isForgotPasswordView) {
      if (!email.trim()) {
        setEmailError('Please enter your email.');
        return;
      }
      // Simulate sending reset email
      setResetEmailSent(true);
      return;
    }

    // --- Handling Login Submission ---
    if (isLoginView) {
      const dbPassword = mockUsers[email.toLowerCase()];

      // Email Duplicate Check (Google Style Best Practice: doesn't reveal if email exists, 
      // but you asked specifically for a check, so we do it here for testing).
      if (!dbPassword) {
        setEmailError('No account found with this email.');
        return;
      }

      // Wrong Password Check
      if (password !== dbPassword) {
        setPasswordError('Incorrect password.');
        return;
      }

      // Successful Login
      setSuccessMessage('Welcome back! Redirecting to your dashboard...');
      return;
    }

    // --- Handling Signup Submission ---
    if (!isLoginView) {
      if (mockUsers[email.toLowerCase()]) {
        setEmailError('You already have an account with this email.');
        return;
      }
      if (!allCriteriaMet || !passwordsMatch) return;
      
      if (role === 'instructor') {
        setSuccessMessage('Application received! Our admin team will review your credentials and let you know via email shortly.');
      } else {
        setSuccessMessage('Account successfully created! You can now log in.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-[#010816] dark:text-gray-100 font-sans transition-colors duration-500 flex flex-col w-full relative overflow-hidden">
      
      <div className="absolute inset-0 w-full h-full bg-[linear-gradient(to_right,#80808035_1px,transparent_1px),linear-gradient(to_bottom,#80808035_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,transparent_10%,black_100%)] pointer-events-none z-0"></div>

      <header className="w-full px-8 py-6 flex justify-between items-center border-b border-gray-100 dark:border-gray-800/60 relative z-10">
        <h1 className="text-2xl font-bold tracking-tighter text-blue-600 dark:text-blue-500">
          EduConnect
        </h1>
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="px-5 py-2 text-sm font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shadow-sm hover:scale-[1.03]"
        >
          {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </header>

      <main className="flex-grow flex flex-col lg:flex-row items-center justify-center w-full max-w-7xl mx-auto px-6 lg:px-12 py-16 gap-12 lg:gap-24 relative z-10">
        
        <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 relative">
          <div className="absolute -inset-10 opacity-30 blur-3xl pointer-events-none rounded-full bg-blue-100 dark:bg-blue-900/40"></div>
          <h2 className="text-6xl lg:text-8xl font-extrabold tracking-tighter leading-[1.05] drop-shadow-sm">
            Transform Your <br />
            <span className="relative text-blue-600 dark:text-blue-500 drop-shadow-[0_0_15px_rgba(37,99,235,0.4)]">
              Learning Journey
            </span>
          </h2>
          <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-400 max-w-xl leading-relaxed font-medium">
            The ultimate platform bridging the gap between expert instructors and passionate students. Level up your skills with dynamic, interactive courses.
          </p>
        </div>

        <div className="w-full lg:w-1/2 max-w-md relative z-10">
          <div className="bg-white dark:bg-[#111827] rounded-3xl shadow-2xl dark:shadow-none dark:border dark:border-gray-800 p-10 transform hover:-translate-y-1 transition-all duration-300 min-h-[500px] flex flex-col justify-center">
            
            {/* --- Success Messages View --- */}
            {successMessage || resetEmailSent ? (
              <div className="flex flex-col items-center text-center space-y-6 animate-fade-in">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-2 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-10 h-10">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold tracking-tight">
                  {resetEmailSent ? 'Check Your Inbox' : 'Success!'}
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-400 font-medium leading-relaxed px-2">
                  {resetEmailSent ? `We have simulated sending a reset link to ${email}. If that email is registered, you should receive instructions shortly.` : successMessage}
                </p>
                <button 
                  onClick={resetAllFormStates} // Always resets and takes you to clean login screen
                  className="mt-8 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-bold py-3 px-8 rounded-xl transition-all w-full"
                >
                  Continue to Log In
                </button>
              </div>
            ) : (
              /* --- The Normal Dynamic Form View --- */
              <>
                <h3 className="text-3xl font-semibold tracking-tight mb-8">
                  {isForgotPasswordView ? 'Reset Password' : (isLoginView ? 'Welcome Back' : 'Sign Up for Free')}
                </h3>

                {/* Conditional Description for Forgot Password */}
                {isForgotPasswordView && (
                    <p className="text-lg text-gray-600 dark:text-gray-400 font-medium leading-relaxed mb-8 -mt-4 px-1">
                        Enter your email address below and we will send you a link to reset your password.
                    </p>
                )}

                {/* Role Toggle - only visible during Sign Up */}
                {!isLoginView && !isForgotPasswordView && (
                  <div className="flex gap-8 mb-8">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="radio" name="role" value="student" checked={role === 'student'} onChange={() => setRole('student')}
                        className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600 transition-all cursor-pointer"
                      />
                      <span className="font-semibold text-lg text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-500 transition-colors">Student</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="radio" name="role" value="instructor" checked={role === 'instructor'} onChange={() => setRole('instructor')}
                        className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600 transition-all cursor-pointer"
                      />
                      <span className="font-semibold text-lg text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-500 transition-colors">Instructor</span>
                    </label>
                  </div>
                )}

                <form className="space-y-5" onSubmit={handleAuthSubmit}>
                  
                  {/* Full Name - only visible during Sign Up */}
                  {!isLoginView && !isForgotPasswordView && (
                    <input type="text" placeholder="Full Name" required className="w-full px-5 py-4 rounded-xl text-lg bg-gray-50 dark:bg-[#1F2937] border border-gray-200 dark:border-gray-700 focus:ring-4 focus:ring-blue-500/20 dark:focus:ring-blue-500/30 focus:border-blue-500 dark:focus:border-blue-500 outline-none transition-all dark:text-white" />
                  )}

                  {/* Email Input (Always visible, enhanced error handling) */}
                  <div>
                    <input 
                      type="email" placeholder="Email Address" required value={email}
                      onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                      className={`w-full px-5 py-4 rounded-xl text-lg bg-gray-50 dark:bg-[#1F2937] border focus:ring-4 outline-none transition-all dark:text-white ${emailError ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-200 dark:border-gray-700 focus:ring-blue-500/20 dark:focus:ring-blue-500/30 focus:border-blue-500 dark:focus:border-blue-500'}`}
                    />
                    {emailError && <p className="text-red-500 text-xs mt-1.5 font-medium px-1 animate-shake">{emailError}</p>}
                  </div>
                  
                  {/* Primary Password Field - hidden in Forgot Password */}
                  {!isForgotPasswordView && (
                  <div>
                    <div className="relative">
                      <input 
                        type={showPassword ? 'text' : 'password'} placeholder="Password" required value={password}
                        onChange={(e) => { setPassword(e.target.value); setPasswordError(''); }}
                        className={`w-full px-5 py-4 pr-12 rounded-xl text-lg bg-gray-50 dark:bg-[#1F2937] border focus:ring-4 outline-none transition-all dark:text-white ${passwordError ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-200 dark:border-gray-700 focus:ring-blue-500/20 dark:focus:ring-blue-500/30 focus:border-blue-500 dark:focus:border-blue-500'}`}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-4 flex items-center text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500 transition-colors">
                        {showPassword ? <EyeClosed /> : <EyeOpen />}
                      </button>
                    </div>
                    {passwordError && <p className="text-red-500 text-xs mt-1.5 font-medium px-1 animate-shake">{passwordError}</p>}
                    
                    {/* Password Constraints Tracker (Only visible during Sign Up) */}
                    {!isLoginView && (
                      <div className="mt-3 grid grid-cols-2 gap-y-1 text-xs font-medium">
                        {[ {met: passwordCriteria.length, text: 'At least 8 characters'}, {met: passwordCriteria.upper, text: 'One uppercase letter'}, {met: passwordCriteria.lower, text: 'One lowercase letter'}, {met: passwordCriteria.number, text: 'One number'}, {met: passwordCriteria.special, text: 'One special character'} ].map(c => <span key={c.text} className={c.met ? "text-green-500" : "text-gray-400"}>{c.met ? '✓' : '•'} {c.text}</span>)}
                      </div>
                    )}
                  </div>
                  )}

                  {/* Confirm Password Field (Only visible during Sign Up) */}
                  {!isLoginView && !isForgotPasswordView && (
                    <div>
                      <div className="relative">
                        <input type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirm Password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={`w-full px-5 py-4 pr-12 rounded-xl text-lg bg-gray-50 dark:bg-[#1F2937] border focus:ring-4 focus:outline-none transition-all dark:text-white ${confirmPassword.length > 0 && !passwordsMatch ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-200 dark:border-gray-700 focus:ring-blue-500/20 dark:focus:ring-blue-500/30 focus:border-blue-500 dark:focus:border-blue-500'}`} />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 px-4 flex items-center text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500 transition-colors">{showConfirmPassword ? <EyeClosed /> : <EyeOpen />}</button>
                      </div>
                      {confirmPassword.length > 0 && !passwordsMatch && ( <p className="text-red-500 text-xs mt-1 font-medium px-1">Passwords do not match.</p>)}
                    </div>
                  )}

                  {/* Conditional Role Dropdowns (Only during Sign Up) */}
                  {!isLoginView && !isForgotPasswordView && role === 'student' && (
                    <div className="relative">
                      <select defaultValue="" required className="w-full px-5 py-4 rounded-xl text-lg bg-gray-50 dark:bg-[#1F2937] border border-gray-200 dark:border-gray-700 focus:ring-4 focus:ring-blue-500/20 dark:focus:ring-blue-500/30 focus:border-blue-500 dark:focus:border-blue-500 outline-none transition-all dark:text-white appearance-none cursor-pointer"> <option value="" disabled>Select Education Level</option> <option value="high_school">High School</option> <option value="undergrad">Undergraduate (Bachelor's)</option> <option value="postgrad">Postgraduate (Master's / PhD)</option> <option value="other">Other</option> </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-gray-500 dark:text-gray-400"> <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg> </div>
                    </div>
                  )}
                  {!isLoginView && !isForgotPasswordView && role === 'instructor' && (
                    <><div className="relative"><select defaultValue="" required className="w-full px-5 py-4 rounded-xl text-lg bg-gray-50 dark:bg-[#1F2937] border border-gray-200 dark:border-gray-700 focus:ring-4 focus:ring-blue-500/20 dark:focus:ring-blue-500/30 focus:border-blue-500 dark:focus:border-blue-500 outline-none transition-all dark:text-white appearance-none cursor-pointer"><option value="" disabled>Select Area of Expertise</option><option value="computer_science">Computer Science & Tech</option><option value="business">Business & Marketing</option><option value="arts">Design & Arts</option><option value="sciences">Mathematics & Science</option><option value="languages">Languages</option><option value="other">Other</option></select><div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-gray-500 dark:text-gray-400"><svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg></div></div><input type="url" placeholder="LinkedIn or Portfolio URL" required className="w-full px-5 py-4 rounded-xl text-lg bg-gray-50 dark:bg-[#1F2937] border border-gray-200 dark:border-gray-700 focus:ring-4 focus:ring-blue-500/20 dark:focus:ring-blue-500/30 focus:border-blue-500 dark:focus:border-blue-500 outline-none transition-all dark:text-white" /></>
                  )}

                  {/* Forgot Password Link - Only during Login */}
                  {isLoginView && !isForgotPasswordView && (
                    <div className="flex justify-end">
                      <button type="button" onClick={() => setIsForgotPasswordView(true)} className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">Forgot Password?</button>
                    </div>
                  )}

                  {/* Submit Button with dynamic logic */}
                  <button type="submit" 
                    disabled={!isForgotPasswordView && !isLoginView && (!allCriteriaMet || !passwordsMatch)}
                    className={`w-full mt-4 font-bold py-4 rounded-xl text-xl transition-all shadow-lg transform ${(!isForgotPasswordView && !isLoginView && (!allCriteriaMet || !passwordsMatch)) ? 'bg-gray-400 cursor-not-allowed text-gray-200 shadow-none' : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-blue-500/40 hover:scale-[1.02]'}`}>
                    {isForgotPasswordView ? 'Send Reset Link' : (isLoginView ? 'Log In' : 'Create Account')}
                  </button>
                </form>

                {/* Bottom Toggle Module */}
                <div className="mt-8 text-center text-gray-600 dark:text-gray-400 font-medium">
                  {isForgotPasswordView ? "Remembered your password? " : (isLoginView ? "Don't have an account? " : "Already have an account? ")}
                  <button onClick={() => {
                      if (isForgotPasswordView) { setIsForgotPasswordView(false); setIsLoginView(true); } 
                      else { resetAllFormStates(); setIsLoginView(!isLoginView); } 
                    }} className="text-blue-600 dark:text-blue-400 font-bold hover:underline transition-all">
                    {isForgotPasswordView ? 'Back to Log In' : (isLoginView ? 'Sign up' : 'Log in')}
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;