import { BrowserRouter, Router, Route, Routes } from "react-router-dom";
import Landing from "./Landing";
import WalletConnect from "./pages/WalletConnect";
import Dashboard from "./pages/Dashboard";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/wallet-connect" element={<WalletConnect />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;