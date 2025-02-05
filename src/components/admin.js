import React, { useState, useEffect } from "react";
import { getAnalytics, logEvent } from "firebase/analytics";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { query, where } from "firebase/firestore"; 


ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [users, setUsers] = useState([]);
  const [userCount, setUserCount] = useState(0);
  const [activityLog, setActivityLog] = useState([]);
  const [signupData, setSignupData] = useState([]);

  useEffect(() => {
    logEvent(getAnalytics(), "admin_dashboard_visited");

    fetchAnalytics();
    fetchAnnouncements();
    fetchUsers();
    fetchActivityLog();
    fetchSignupData(); // Fetch sign-up data for the graph
  }, []);

  const fetchSignupData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "accounts"));
      const signups = {};

      querySnapshot.forEach((doc) => {
        const createdAt = doc.data().createdAt?.toDate();
        if (createdAt) {
          const dateKey = createdAt.toLocaleDateString(); // format the date as "MM/DD/YYYY"
          if (signups[dateKey]) {
            signups[dateKey]++;
          } else {
            signups[dateKey] = 1;
          }
        }
      });

      const signupCounts = Object.keys(signups).map((date) => ({
        date,
        count: signups[date],
      }));

      // Sort signups by date
      signupCounts.sort((a, b) => new Date(a.date) - new Date(b.date));

      setSignupData(signupCounts);
    } catch (error) {
      console.error("Error fetching sign-up data: ", error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      // Track total users
      const usersSnapshot = await getDocs(collection(db, "accounts"));
      const allUsers = usersSnapshot.docs.map((doc) => doc.data());
      setUserCount(allUsers.length);

      // Track active users today (Assuming `lastLogin` is stored in Firestore)
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));

      const activeUsersQuery = query(
        collection(db, "accounts"),
        where("lastLogin", ">=", startOfDay),
        where("lastLogin", "<=", endOfDay)
      );
      const activeUsersSnapshot = await getDocs(activeUsersQuery);
      const activeUsersToday = activeUsersSnapshot.docs.length;

      // Track new sign-ups in the last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const newSignUpsQuery = query(
        collection(db, "accounts"),
        where("createdAt", ">=", sevenDaysAgo)
      );
      const newSignUpsSnapshot = await getDocs(newSignUpsQuery);
      const newSignUps = newSignUpsSnapshot.docs.length;

      // Track recent activity (e.g., last event in activity_log)
      const activitySnapshot = await getDocs(collection(db, "activity_log"));
      const recentActivity = activitySnapshot.docs.length
        ? activitySnapshot.docs[activitySnapshot.docs.length - 1].data().event
        : "No recent activity";

      setAnalyticsData({
        activeUsersToday,
        newSignUps,
        recentActivity,
      });

      // Log events to Firebase Analytics
      logEvent(getAnalytics(), "total_users", { count: allUsers.length });
      logEvent(getAnalytics(), "active_users_today", { count: activeUsersToday });
      logEvent(getAnalytics(), "new_sign_ups", { count: newSignUps });
      logEvent(getAnalytics(), "recent_activity", { event: recentActivity });
    } catch (error) {
      console.error("Error fetching analytics: ", error);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "announcements"));
      const announcementsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAnnouncements(announcementsList);
    } catch (error) {
      console.error("Error fetching announcements: ", error);
    }
  };

  const fetchUsers = async () => {
    try {
      // Fetch from 'accounts' collection where email and createdAt are stored
      const querySnapshot = await getDocs(collection(db, "accounts"));
      const usersList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        email: doc.data().email,
        createdAt: doc.data().createdAt?.toDate().toLocaleString(),
      }));
      setUsers(usersList);
    } catch (error) {
      console.error("Error fetching users: ", error);
    }
  };

  const fetchActivityLog = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "activity_log"));
      const activityList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setActivityLog(activityList);
    } catch (error) {
      console.error("Error fetching activity log: ", error);
    }
  };

  // Prepare the data for the chart
  const chartData = {
    labels: signupData.map((data) => data.date),
    datasets: [
      {
        label: "Sign-Ups per Day",
        data: signupData.map((data) => data.count),
        fill: false,
        borderColor: "rgba(75,192,192,1)",
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="dashboard-container">
      <h1>Admin Dashboard</h1>

      <div className="section">
        <h2>Analytics</h2>
        {analyticsData ? (
          <div>
            <p><strong>Active Users as of Today:</strong> {analyticsData.activeUsersToday}</p>
            <p><strong>New Sign-Ups (Last 7 Days):</strong> {analyticsData.newSignUps}</p>
            <p><strong>Total number of Users:</strong> {userCount}</p>
            <p><strong>Recent Activities:</strong> {analyticsData.recentActivity}</p>
          </div>
        ) : (
          <p>Loading analytics data...</p>
        )}
      </div>

      <div className="section">
        <h2>Sign-ups per Day</h2>
        <Line data={chartData} />
      </div>

      <div className="section">
        <h2>Users ({userCount})</h2>
        {users.length > 0 ? (
          <ul>
            {users.map((user) => (
              <li key={user.id}>
                <p>Email: {user.email}</p>
                <p>Account Created: {user.createdAt}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No users available.</p>
        )}
      </div>

      <div className="section">
        <h2>Activity Log</h2>
        {activityLog.length > 0 ? (
          <ul>
            {activityLog.map((activity) => (
              <li key={activity.id}>
                {activity.event} -{" "}
                {activity.timestamp
                  ? new Date(activity.timestamp.seconds * 1000).toLocaleString()
                  : "No timestamp"}
              </li>
            ))}
          </ul>
        ) : (
          <p>No activity recorded.</p>
        )}
      </div>

      <div className="section">
        <h2>Announcements</h2>
        {announcements.length > 0 ? (
          <ul>
            {announcements.map((announcement) => (
              <li key={announcement.id}>
                <h3>{announcement.title}</h3>
                <p>{announcement.description}</p>
                <p>
                  <strong>Date:</strong>{" "}
                  {announcement.date
                    ? new Date(announcement.date.seconds * 1000).toLocaleString()
                    : "No date"}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No announcements available.</p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
