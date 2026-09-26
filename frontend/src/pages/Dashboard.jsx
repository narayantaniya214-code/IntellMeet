function Dashboard({ onLogout, onNewMeeting }) {
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>IntellMeet</h1>

        <button onClick={onLogout}>
          Logout
        </button>
      </header>

      <main className="dashboard-content">
        <h2>Welcome to IntellMeet 👋</h2>

        <p>
          Manage your meetings, teams and collaboration
          from one place.
        </p>

        <div className="dashboard-cards">
          <div className="dashboard-card">
           <h3>➕ New Meeting</h3>
           <p>Create a new meeting.</p>

           <button onClick={onNewMeeting}>
             Start Meeting
           </button>
          </div>

          <div className="dashboard-card">
            <h3>📅 Upcoming Meetings</h3>
            <p>View your scheduled meetings.</p>
          </div>

          <div className="dashboard-card">
            <h3>📝 Meeting History</h3>
            <p>View previous meetings and summaries.</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;