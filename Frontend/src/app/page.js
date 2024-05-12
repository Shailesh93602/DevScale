"use client";

import { useState } from "react";

export default function Home() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username) return document.getElementById('username').focus();
    if (!email) return document.getElementById('email').focus();
    if (!password) return document.getElementById('password').focus();
    if (repeatPassword !== password) return document.getElementById('repeatPassword').focus();

    await fetch("http://localhost:4000/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username,
        email,
        password
      })
    })
  }
  return (
    <div>
      <div>
        <h1>Registration</h1>
      </div>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Type a username" value={username} onChange={(e) => setUsername(e.target.value)} id="username" required />
        <input type="email" placeholder="Type you email" value={email} onChange={(e) => setEmail(e.target.value)} id="email" required />
        <input type="password" placeholder="* * * * * *" value={password} onChange={(e) => setPassword(e.target.value)} id="password" required />
        <input type="password" placeholder="* * * * * *" value={repeatPassword} onChange={(e) => setRepeatPassword(e.target.value)} id="repeatPassword" required />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
