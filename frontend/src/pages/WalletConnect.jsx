import React, { useState, useEffect } from "react";
import {
  DAppConnector,
  HederaJsonRpcMethod,
  HederaSessionEvent,
  HederaChainId,
} from "@hashgraph/hedera-wallet-connect";
import { LedgerId } from "@hashgraph/sdk";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";

// Configuration
export const dappConnector = new DAppConnector(
  {
    name: "SynapseX",
    description: "Autonomous AI Agent Marketplace",
    url: window.location.origin,
    icons: [`${window.location.origin}/icon.png`],
  },
  LedgerId.TESTNET,
   import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
   
  
  Object.values(HederaJsonRpcMethod),
  [HederaSessionEvent.ChainChanged, HederaSessionEvent.AccountsChanged],
  [HederaChainId.Testnet]
);

await dappConnector.init({ logger: "error" });

// Simple Custom Toast Component
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

export default function WalletConnect() {
  const [accountId, setAccountId] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const navigate = useNavigate();

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  const handleLogin = () => {
    navigate('/dashboard');
  };

  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      await dappConnector.openModal();

      const session = dappConnector.signers[0];
      if (session) {
        const account = session.getAccountId().toString();
        setAccountId(account);
        showToast("Wallet Connected Successfully");
      }

      dappConnector.onSessionIframeUpdated = (session) => {
        const account = session.signers[0]?.getAccountId().toString();
        if (account) setAccountId(account);
      };
    } catch (err) {
      showToast(err.message || "Connection failed", "error");
    } finally {
      setIsConnecting(false);
    }
  };

  const login = async () => {
    try {
      const { data } = await api.post("/auth/nonce", { walletAddress: accountId });
      const nonce = data.nonce;

      const result = await dappConnector.walletConnectClient.request({
        topic: dappConnector.signers[0].topic,
        chainId: "hedera:testnet",
        request: {
          method: "hedera_signMessage",
          params: {
            signerAccountId: `hedera:testnet:${accountId}`,
            message: btoa(nonce),
          },
        },
      });

      const res = await api.post("/auth/verify", {
        walletAddress: accountId,
        signatureMap: result.signatureMap,
        nonce,
      });

      localStorage.setItem("token", res.data.token);
      showToast("Identity Verified. Welcome back.");
      
      // Short delay so they see the success toast before navigation
      setTimeout(handleLogin, 1000);
    } catch (err) {
      showToast(err.message || "Login failed", "error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white selection:bg-blue-100">
      <Toast 
        isVisible={toast.show} 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ ...toast, show: false })} 
      />

      <div className="w-full max-w-md p-12 border border-slate-100 rounded-[3rem] bg-white shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] text-center relative overflow-hidden">
        {/* Subtle background glow */}
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
            {!accountId ? (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="w-full bg-slate-950 text-white py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70 shadow-xl shadow-slate-200 cursor-pointer disabled:cursor-not-allowed"
              >
                {isConnecting ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  "Connect HashPack"
                )}
              </button>
            ) : (
              <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl group transition-all hover:border-blue-200">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Active Account</p>
                  <p className="text-slate-900 font-mono text-sm truncate">{accountId}</p>
                </div>
                
                <button
                  onClick={login}
                  className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all active:scale-[0.98] cursor-pointer"
                >
                  Verify Identity
                </button>
                
                <button 
                  onClick={() => setAccountId("")}
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