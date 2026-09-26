import { useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Meeting from "./pages/Meeting";



const testBackend = async () => {
  try {
    const response = await fetch("/api/hello");
    const data = await response.json();

    alert(data.message);
  } catch (error) {
    alert("Backend connection failed: " + error.message);
    console.log(error);
  }
};

function App() {
  const [page, setPage] = useState("home");

  if (page === "login") {
  return (
    <Login
      onBack={() => setPage("home")}
      onLogin={() => setPage("dashboard")}
    />
  );
}
  if (page === "register") {
  return <Register onBack={() => setPage("home")} />;
}
  if (page === "meeting") {
  return (
    <Meeting
      onBack={() => setPage("dashboard")}
    />
  );
}
  if (page === "dashboard") {
  return (
    <Dashboard
      onLogout={() => setPage("home")}
      onNewMeeting={() => setPage("meeting")}
    />
  );
}

  return (
    <div className="app">
      <div className="card">
        <h1>IntellMeet</h1>

        <p>AI-Powered Meeting & Collaboration Platform</p>

        <div className="buttons">
          <button onClick={() => setPage("login")}>
            Login
          </button>

          <button onClick={() => setPage("register")}>
           Register
          </button>

          <button onClick={testBackend}>Test Backend</button>
        </div>
      </div>
    </div>
  );
}

export default App;