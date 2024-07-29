import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../utils';

function Login() {
  const [loginInfo, setLoginInfo] = useState({
    email: '',
    password: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginInfo(prevState => ({
      ...prevState,
      [name]: value
    }));
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    const { email, password } = loginInfo;
    if (!email || !password) {
      return handleError('All fields are required');
    }

    try {
      const url = "http://localhost:8000/auth/login";
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginInfo)
      });

      const result = await response.json();
      const { success, message, jwtToken, name, error } = result;
      if (success) {
        localStorage.setItem('token', jwtToken);
        localStorage.setItem('loggedInUser', name);
        handleSuccess(message);
        setTimeout(() => {
          navigate('/home');
        }, 1000)
      } else if (error) {
        const details = error?.details[0]?.message;
        handleError(details);
      } else if (!success) {
        handleError(message);
      }
      console.log(result);
    } catch (error) {
      handleError(error.message);
    }
  }

  return (
    <div className='container'>
      <h1>Login</h1>
      <form onSubmit={handleLogin}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            onChange={handleChange}
            type="email"
            name='email'
            autoFocus
            placeholder='Enter your email...'
            value={loginInfo.email}
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            onChange={handleChange}
            type="password"
            name='password'
            placeholder='Enter your app password...'
            value={loginInfo.password}
          />
        </div>
        <button type="submit">Login</button>
        <span>Don't have an account?
          <Link to={'/signup'}> Signup</Link>
        </span>
      </form>
      <ToastContainer />
    </div>
  )
}

export default Login;
