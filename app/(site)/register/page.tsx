'use client';

import React, { useState } from 'react';

export default function RegisterPage() {
  const [username, setUsername] = useState('');

  // 폼 제출 시 API(/register/api)로 POST
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const res = await fetch('/register/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    });

    const data = await res.json();
    console.log(data);
    alert(data.message || 'Created user');
  }

  return (
    <div>
      <h1>Register Page</h1>
      <form onSubmit={handleSubmit}>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter username"
        />
        <button type="submit">Register</button>
      </form>
    </div>
  );
}
