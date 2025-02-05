// src/components/LogIn.js
import React, { useState, useEffect } from "react";
import { auth } from "../firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig"; // Your Firestore instance

const LogIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [announcement, setAnnouncement] = useState(null); // State to store announcement data

  // Fetch the announcement from Firestore
  const fetchAnnouncement = async () => {
    try {
      const docRef = doc(db, "announcements", "peso123"); // Reference to the "peso123" document in the "announcements" collection
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        // Convert Firestore Timestamp to Date
        const formattedDate = data.date ? data.date.toDate().toLocaleString() : "No date available";
        
        // Update state with formatted data
        setAnnouncement({
          title: data.title,
          description: data.description,
          date: formattedDate,
        });
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error getting document:", error);
    }
  };

  // Fetch the announcement when the component is mounted
  useEffect(() => {
    fetchAnnouncement();
  }, []);

  const handleLogIn = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Logged in successfully!");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2>Log In</h2>
      <form onSubmit={handleLogIn}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br />
        <button type="submit">Log In</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Display the fetched announcement below */}
      {announcement ? (
        <div style={{ marginTop: "20px", border: "1px solid #ccc", padding: "10px", backgroundColor: "lightyellow" }}>
          <h3>{announcement.title}</h3>
          <p>{announcement.description}</p>
          <p><strong>Date:</strong> {announcement.date}</p>
        </div>
      ) : (
        <p>Loading announcement...</p>
      )}
    </div>
  );
};

export default LogIn;
