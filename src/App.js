// src/App.js
import React from "react";
import SignIn from "./components/signIn";
import LogIn from "./components/logIn";
import AdminDashboard from "./components/admin";

function App() {
  return (
    <div style={{ textAlign: "center" }}>
      <h1>Firebase Authentication</h1>
      <SignIn />
      <LogIn />
      <AdminDashboard/>
    </div>
  );
}

export default App;
