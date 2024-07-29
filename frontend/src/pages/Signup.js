import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import {ToastContainer} from 'react-toastify';
import { handleError, handleSuccess } from '../utils';
function Signup() {
  const [signupInfo,setSignupInfo] = useState({
    name : '',
    email : '',
    password : ''
  });
  const navigate = useNavigate();
  const handlechange = (e) => {
    const {name,value} = e.target;
    // console.log(name,value);
    const copySignupInfo = {...signupInfo};
    copySignupInfo[name] = value;
    setSignupInfo(copySignupInfo);

    console.log('SignupInfo',signupInfo);
  }

  const handleSignup = async (e) => {
    e.preventDefault();
    const {name,email,password} = signupInfo;
    if(!name || !email || !password){
      return handleError('All fields are required');
    }

    try{
      const url = "http://localhost:8000/auth/signup";
      const response = await fetch(url,{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body:JSON.stringify(signupInfo)
      });

      const result = await response.json();
      const {success,message,error} = result;
      if(success){
        handleSuccess(message);
        setTimeout(()=>{
          navigate('/login');
        },1000)
      }else if(!success){
        handleError(message);
      }
      else if(error){
        const details = error?.details[0].message;
        handleError(details);
      }
      console.log(result);
    }
    catch(error){
      handleError(error);
    }
  }
  return (
    <div className='container'>
      <h1>signup</h1>
      <form onSubmit={handleSignup}>
        <div>
          <label htmlFor="name">Name</label>
          <input
            onChange={handlechange}
            type="text"
            name='name'
            autoFocus
            placeholder='Enter your name...'
            value={signupInfo.name}
          />
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input
            onChange={handlechange}
            type="email"
            name='email'
            autoFocus
            placeholder='Enter your email...'
            value = {signupInfo.email}
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            onChange={handlechange}
            type="password"
            name='password'
            autoFocus
            placeholder='Enter your app password...'
            value={signupInfo.password}
          />
          <small style={{ color: 'gray' }}>Password lenght must be greater than 4</small>
        </div>
        <button>Signup</button>
        <span>Already have an account ?
          <Link to={'/login'}>Login</Link>
        </span>
      </form>
      <ToastContainer/>
    </div>
  )
}

export default Signup;