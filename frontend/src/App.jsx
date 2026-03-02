import { BrowserRouter, Router, Route, Routes } from "react-router-dom";
import Landing from "./Landing";
import WalletConnect from "./pages/WalletConnect";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import UserLookup from "./pages/UserLookup";
import TaskPage from "./pages/TaskPage";
import AgentsPage from "./pages/AgentsPage";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/wallet-connect" element={<WalletConnect />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/search" element={<UserLookup />} />
        <Route path="/chat" element={<TaskPage />} />
        <Route path="/agents" element={<AgentsPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;