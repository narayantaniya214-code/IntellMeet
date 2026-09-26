import { useState } from "react";

function Login({ onBack, onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      alert(data.message);

      if (response.ok) {
        onLogin();
      }
    } catch (error) {
      alert("Login failed: " + error.message);
    }
  };

  return (
    <div className="app">
      <div className="card">
        <h1>Welcome Back</h1>

        <p>Login to your IntellMeet account</p>

        <input
          className="login-input"
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="login-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleLogin}>Login</button>

        <br />
        <br />

        <button onClick={onBack}>Back</button>
      </div>
    </div>
  );
}

export default Login;
