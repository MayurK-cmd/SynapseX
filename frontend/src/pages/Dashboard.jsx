import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function Dashboard() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await api.get("/users/me");
      setProfile(data);
    };

    fetchProfile();
  }, []);

  if (!profile) return <p>Loading...</p>;

  return (
    <div style={{ padding: 40 }}>
      <h2>Dashboard</h2>
      <p>Reputation: {profile.reputation}</p>
      <p>Tasks Posted: {profile.tasksPosted}</p>
      <p>Tasks Completed: {profile.tasksCompleted}</p>
      <p>Earnings: {profile.earnings}</p>
    </div>
  );
}