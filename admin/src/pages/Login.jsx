import React, { useState } from 'react'
import ReactLoading from "react-loading"

import { userRequest } from '../utils/requestMethods';
import './style.css'

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleClick = async (e) => {
    e.preventDefault();
    setLoading(true)

    try {
      const res = await userRequest.post("/auth/login", { username, password })

      localStorage.setItem("currentUser", JSON.stringify(res.data));

      setLoading(false)
      window.location.reload();
    } catch (err) {
      setLoading(false)
      setError(err?.response?.data.message)
    }
  }

  if (loading) return (
    <div className='text-purple-500 h-screen w-full grid place-items-center'>
      <ReactLoading type="spinningBubbles" color="rgb(168 85 247)" />
    </div>
  );

  return (
    <div className='login'>
      <div className="lContainer">
        <input
          type="text"
          placeholder="username"
          id="username"
          onChange={(e) => setUsername(e.target.value)}
          className="lInput border-2 py-5 px-4 text-lg rounded-lg outline-none"
        />
        <input
          type="password"
          placeholder="password"
          id="password"
          onChange={(e) => setPassword(e.target.value)}
          className="lInput border-2 py-5 px-4 text-lg rounded-lg outline-none"
        />
        <button onClick={handleClick} className="lButton">
          Login
        </button>
        {error && <div className='text-center font-medium text-[#f00] text-lg'>
          {error}
        </div>}
      </div>
    </div>
  )
}

export default Login