import { useState, useEffect } from "react";
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
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100]">
      <div className={`px-6 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 backdrop-blur-md ${
        type === 'success'
          ? 'bg-[#080c0d]/90 border-cyan-400/20 text-cyan-400'
          : 'bg-[#080c0d]/90 border-red-500/20 text-red-400'
      }`}>
        <div className={`w-2 h-2 rounded-full animate-pulse ${type === 'success' ? 'bg-cyan-400' : 'bg-red-500'}`} />
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
    if (window.ethereum.isPhantom) throw new Error("Please use MetaMask, not Phantom.");
    if (!window.ethereum.isMetaMask) throw new Error("MetaMask not found. Please install MetaMask.");
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
      const { data } = await api.post("/auth/nonce", { walletAddress: account });
      const nonce = data.nonce;
      const signature = await signer.signMessage(nonce);
      const res = await api.post("/auth/verify", { walletAddress: account, signature, nonce });
      localStorage.setItem("token", res.data.token);
      showToast("Identity Verified. Welcome back.");
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (err) {
      showToast(err.message || "Login failed", "error");
    }
  };

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
    <div className="relative min-h-screen bg-[#080c0d] text-slate-100 font-sans overflow-hidden flex flex-col items-center justify-between p-6">

      {/* Grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0,208,255,0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,208,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />
      {/* Radial glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none"
        style={{ background: 'radial-gradient(circle at 50% 50%, rgba(0,208,255,0.15) 0%, transparent 70%)' }}
      />
      {/* Bottom gradient */}
      <div className="fixed bottom-0 left-0 w-full h-32 pointer-events-none opacity-30"
        style={{ background: 'linear-gradient(to top, rgba(0,208,255,0.1), transparent)' }}
      />

      <Toast
        isVisible={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />

      {/* Top status bar */}
      <div className="relative z-10 w-full max-w-md">
        <div className="flex items-center justify-between gap-4 rounded-xl border border-cyan-400/20 bg-[#080c0d]/80 backdrop-blur-md p-4 shadow-2xl">
          <div className="flex flex-col gap-0.5">
            <p className="text-cyan-400 text-xs font-bold uppercase tracking-widest">Network Status</p>
            <p className="text-slate-300 text-sm font-medium">
              {account ? 'Secure Gateway Connected' : 'Connecting to Secure Gateway...'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(0,208,255,0.8)]" />
            <button className="flex items-center justify-center rounded-lg h-8 px-3 bg-cyan-400/10 hover:bg-cyan-400/20 text-cyan-400 text-xs font-bold transition-all border border-cyan-400/30 uppercase cursor-pointer">
              Details
            </button>
          </div>
        </div>
      </div>

      {/* Main card */}
      <main className="relative z-10 w-full max-w-[440px] flex flex-col items-center gap-8 py-8">

        {/* Logo + heading */}
        <div className="flex flex-col items-center gap-6">
          <div className="w-20 h-20 bg-cyan-400 rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(0,208,255,0.3)]">
            <span className="text-[#080c0d] text-4xl font-black">S</span>
          </div>
          <div className="text-center">
            <h1 className="text-slate-100 tracking-tight text-3xl font-bold leading-tight mb-2">
              Sign in to SynapseX
            </h1>
            <p className="text-slate-400 text-base leading-relaxed max-w-[320px] mx-auto">
              The decentralized layer for autonomous intelligence.
            </p>
          </div>
        </div>

        {/* Auth card */}
        <div className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 flex flex-col gap-6 shadow-2xl">

          {!account ? (
            /* Connect state */
            <div className="flex flex-col gap-3">
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="w-full py-4 px-6 bg-cyan-400 hover:brightness-110 text-[#080c0d] font-bold rounded-xl transition-all flex items-center justify-center gap-3 shadow-[0_4px_20px_rgba(0,208,255,0.4)] disabled:opacity-70 cursor-pointer disabled:cursor-not-allowed"
              >
                {isConnecting ? (
                  <div className="w-5 h-5 border-2 border-[#080c0d]/20 border-t-[#080c0d] rounded-full animate-spin" />
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
                    </svg>
                    Connect MetaMask
                  </>
                )}
              </button>

              <button className="w-full py-4 px-6 bg-white/5 hover:bg-white/10 text-slate-100 font-bold rounded-xl border border-white/10 transition-all flex items-center justify-center gap-3 cursor-pointer">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
                Verify Identity
              </button>
            </div>
          ) : (
            /* Connected state */
            <div className="flex flex-col gap-4">
              {/* Active account */}
              <div className="flex flex-col gap-2">
                <label className="text-slate-400 text-xs font-bold uppercase tracking-wider ml-1">Active Account</label>
                <div className="flex items-center justify-between bg-black/40 border border-white/5 rounded-xl p-4 group hover:border-cyan-400/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full shrink-0"
                      style={{ background: 'linear-gradient(135deg, #00d0ff, #2563eb)' }}
                    />
                    <span className="font-mono text-cyan-400 text-sm tracking-tight truncate max-w-[200px]">
                      {account}
                    </span>
                  </div>
                  <button
                    onClick={() => navigator.clipboard?.writeText(account)}
                    className="text-slate-500 hover:text-cyan-400 transition-colors cursor-pointer shrink-0"
                    title="Copy address"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                    </svg>
                  </button>
                </div>
              </div>

              <button
                onClick={login}
                className="w-full py-4 px-6 bg-cyan-400 hover:brightness-110 text-[#080c0d] font-bold rounded-xl transition-all flex items-center justify-center gap-3 shadow-[0_4px_20px_rgba(0,208,255,0.4)] cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
                Verify Identity
              </button>

              <button
                onClick={() => { setAccount(""); localStorage.removeItem("token"); }}
                className="text-xs font-bold text-slate-500 hover:text-slate-300 tracking-wide transition uppercase cursor-pointer text-center"
              >
                Switch Wallet
              </button>
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center justify-center gap-4 py-1">
            <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.1))' }} />
            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Secure Handshake</span>
            <div className="h-px flex-1" style={{ background: 'linear-gradient(to left, transparent, rgba(255,255,255,0.1))' }} />
          </div>

          <p className="text-slate-500 text-xs text-center leading-relaxed">
            By connecting your wallet, you agree to the SynapseX{' '}
            <a href="/terms-of-services" className="text-cyan-400 hover:underline">Terms of Service</a>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-md flex flex-col items-center gap-4 pb-4">
        <div className="flex items-center gap-2 bg-black/40 border border-white/5 px-4 py-2 rounded-full backdrop-blur-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
          <span className="text-slate-400 text-xs font-bold uppercase tracking-tighter">Hedera Testnet</span>
        </div>
        <div className="flex gap-6 text-slate-500">
          {[
            <path key="globe" strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />,
            <path key="help" strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />,
            <path key="settings" strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />,
          ].map((pathEl, i) => (
            <button key={i} className="hover:text-cyan-400 transition-colors cursor-pointer">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                {pathEl}
              </svg>
            </button>
          ))}
        </div>
      </footer>
    </div>
  );
}