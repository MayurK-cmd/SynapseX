import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";

const Toast = ({ message, type, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 duration-300">
      <div className={`px-6 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 backdrop-blur-md ${
        type === 'success' ? 'bg-white/90 border-green-100 text-green-700' : 'bg-white/90 border-red-100 text-red-700'
      }`}>
        <div className={`w-2 h-2 rounded-full ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
        <span className="text-sm font-bold tracking-tight">{message}</span>
      </div>
    </div>
  );
};

export default function MetaMaskAuth() {
  const [account, setAccount] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const navigate = useNavigate();

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  const getProvider = () => {
    if (!window.ethereum) throw new Error("MetaMask not installed");
     if (window.ethereum.providers) {
    const metamask = window.ethereum.providers.find(p => p.isMetaMask && !p.isPhantom);
    if (!metamask) throw new Error("MetaMask not found. Please install MetaMask.");
    return new ethers.BrowserProvider(metamask);
  }

  // Only one wallet — check it's MetaMask not Phantom
  if (window.ethereum.isPhantom) {
    throw new Error("Please use MetaMask, not Phantom.");
  }

  if (!window.ethereum.isMetaMask) {
    throw new Error("MetaMask not found. Please install MetaMask.");
  }
    return new ethers.BrowserProvider(window.ethereum);
  };

  const switchToHederaTestnet = async (provider) => {
    try {
      await provider.send("wallet_switchEthereumChain", [{ chainId: "0x128" }]);
    } catch (err) {
      if (err.code === 4902 || err?.error?.code === 4902) {
        await provider.send("wallet_addEthereumChain", [{
          chainId: "0x128",
          chainName: "Hedera Testnet",
          nativeCurrency: { name: "HBAR", symbol: "HBAR", decimals: 18 },
          rpcUrls: ["https://testnet.hashio.io/api"],
          blockExplorerUrls: ["https://hashscan.io/testnet"],
        }]);
      } else {
        throw err;
      }
    }
  };

  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      localStorage.removeItem("token");

      const provider = getProvider();
      await switchToHederaTestnet(provider);

      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
      showToast("Wallet Connected Successfully");
    } catch (err) {
      showToast(err.message || "Connection failed", "error");
    } finally {
      setIsConnecting(false);
    }
  };

  const login = async () => {
    try {
      const provider = getProvider();
      const signer = await provider.getSigner();

      // Get nonce from backend
      const { data } = await api.post("/auth/nonce", { walletAddress: account });
      const nonce = data.nonce;

      // Sign the nonce with MetaMask
      const signature = await signer.signMessage(nonce);

      // Verify with backend
      const res = await api.post("/auth/verify", {
        walletAddress: account,
        signature,
        nonce,
      });

      localStorage.setItem("token", res.data.token);
      showToast("Identity Verified. Welcome back.");
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (err) {
      showToast(err.message || "Login failed", "error");
    }
  };

  // Check if already connected on mount
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: "eth_accounts" }).then((accounts) => {
        if (accounts.length > 0) setAccount(accounts[0]);
      });

      window.ethereum.on("accountsChanged", (accounts) => {
        setAccount(accounts[0] || "");
        localStorage.removeItem("token");
      });
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white selection:bg-blue-100">
      <Toast
        isVisible={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />

      <div className="w-full max-w-md p-12 border border-slate-100 rounded-[3rem] bg-white shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] text-center relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-50 rounded-full blur-3xl opacity-50" />

        <div className="relative z-10">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-blue-100 ring-4 ring-blue-50">
            <span className="text-white font-bold text-3xl italic">S</span>
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-3">Sign in to SynapseX</h2>
          <p className="text-slate-500 text-sm mb-12 max-w-[240px] mx-auto leading-relaxed">
            The decentralized layer for autonomous intelligence.
          </p>

          <div className="space-y-4">
            {!account ? (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="w-full bg-slate-950 text-white py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70 shadow-xl shadow-slate-200 cursor-pointer disabled:cursor-not-allowed"
              >
                {isConnecting ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  "Connect MetaMask"
                )}
              </button>
            ) : (
              <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-blue-200 transition-all">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Active Account</p>
                  <p className="text-slate-900 font-mono text-sm truncate">{account}</p>
                </div>

                <button
                  onClick={login}
                  className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all active:scale-[0.98] cursor-pointer"
                >
                  Verify Identity
                </button>

                <button
                  onClick={() => {
                    setAccount("");
                    localStorage.removeItem("token");
                  }}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 tracking-wide transition uppercase cursor-pointer"
                >
                  Switch Wallet
                </button>
              </div>
            )}
          </div>

          <div className="mt-16 pt-8 border-t border-slate-50">
            <div className="flex justify-center items-center gap-2 grayscale opacity-40">
              <div className="w-2 h-2 rounded-full bg-slate-900" />
              <span className="text-[10px] font-bold tracking-[0.2em] text-slate-900 uppercase">Hedera Testnet</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}