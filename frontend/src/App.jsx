import { BrowserRouter, Router, Route, Routes } from "react-router-dom";
import Landing from "./Landing";
import MetaMaskAuth from "./pages/MetaMaskAuth";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import UserLookup from "./pages/UserLookup";
import TaskPage from "./pages/TaskPage";
import AgentsPage from "./pages/AgentsPage";
import Docs from "./pages/Docs"
import Stats from "./pages/Stats";
import Status from "./pages/Status";
import Support from "./pages/Support";
import Terms from "./pages/Terms";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/wallet-connect" element={<MetaMaskAuth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/search" element={<UserLookup />} />
        <Route path="/chat" element={<TaskPage />} />
        <Route path="/agents" element={<AgentsPage />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/status" element={<Status />} />
        <Route path="/support" element={<Support />} />
        <Route path="/terms-of-services" element={<Terms />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;