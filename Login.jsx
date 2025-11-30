import React, {useState} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login(){
  const [email,setEmail]=useState(''),[pw,setPw]=useState('');
  const nav = useNavigate();
  async function submit(e){ e.preventDefault();
    try {
      const { data } = await axios.post('http://localhost:4242/api/auth/login', { email, password: pw });
      localStorage.setItem('token', data.token);
      nav('/');
    } catch(e){ alert('Login failed'); }
  }
  return (
    <form onSubmit={submit} className="max-w-sm bg-white p-4 rounded-xl shadow">
      <input className="w-full p-2 mb-2 border" value={email} onChange={e=>setEmail(e.target.value)} placeholder="email" />
      <input type="password" className="w-full p-2 mb-2 border" value={pw} onChange={e=>setPw(e.target.value)} placeholder="password" />
      <button className="bg-primary text-white px-4 py-2 rounded">Login</button>
    </form>
  );
}
