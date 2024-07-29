import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Loader from 'react-js-loader';
import { useNavigate } from 'react-router-dom';
import { handleError, handleSuccess } from '../utils';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../Home.css'; // Import the CSS file

function Home() {
  const [loggedInUser, setLoggedInUser] = useState('');
  const [emails, setEmails] = useState([]);
  const [appPassword, setAppPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const fetchEmails = useCallback(async () => {
    setEmails('');
    const token = localStorage.getItem('token');
    if (!token) {
      handleError('No token found. Please login again.');
      navigate('/login');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/get-emails', {
        headers: {
          'Authorization': token,
          'app-password': appPassword
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch emails');
      }

      const result = await response.json();
      setEmails(result.emails);
      handleSuccess(result.message);
    } catch (error) {
      handleError(error.message);
    }
  }, [appPassword, navigate]);

  const memoizedFetchEmails = useMemo(() => fetchEmails, [fetchEmails]);

  useEffect(() => {
    const user = localStorage.getItem('loggedInUser');
    if (user) {
      setLoggedInUser(user);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('loggedInUser');
    handleSuccess('User logged out');
    setTimeout(() => {
      navigate('/login');
    }, 2000);
  };



  return (
    <div className='homepage'>
      <div className='navbar'>
        <div className='nav-left'>
          <h1>Daily Email Summary Generator</h1>
        </div>
        <div className="nav-right">
          <h1 className='username'>Hi, {loggedInUser.split(' ')[0]}</h1>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>
      <div className="email-list">
        {emails.length > 0 ? (
          emails.map((mail, index) => (
            <ul className="email-item" key={index}>
              <p><strong>Subject:</strong> {mail.subject}</p>
              <p><strong>From:</strong> {mail.from}</p>
              <p><strong>Date:</strong> {mail.date}</p>
              <br />
              <p><strong>Body:</strong> {mail.body}</p>
            </ul>
          ))
        ) : (
          <Loader type="bubble-loop" bgColor='blue' color='blue' title={"Please wait or click generate"} size={100} />
        )}
      </div>
      <div className='footer'>
        <div className="footer-left">
          <label htmlFor="app_password">App Password : </label>
          <input placeholder='App Password' type={showPassword ? "text" : "password"} onChange={(e) => setAppPassword(e.target.value)} />
          <button
            type="button"
            onClick={toggleShowPassword}
            className="toggle-password-button"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        <button onClick={memoizedFetchEmails}>Generate</button>
      </div>
      <ToastContainer />
    </div>
  );
}

export default Home;
