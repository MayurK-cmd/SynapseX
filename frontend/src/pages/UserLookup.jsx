import { useState } from 'react';
import api from "../../api/axios";
import { useNavigate } from 'react-router-dom';

export default function UserLookup() {
  const [address, setAddress] = useState("");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!address) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/users/${address}`);
      setUserData(data);
    } catch (err) {
      alert("Address not found on-chain");
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0f1f23] text-slate-100 font-sans selection:bg-cyan-400/30">

      {/* Background glow blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-cyan-400/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-cyan-400/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 lg:py-20">

        {/* Nav */}
        <nav className="mb-16 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="group flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-cyan-400 transition-colors cursor-pointer"
          >
            <svg
              className="w-4 h-4 transition-transform group-hover:-translate-x-1"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Dashboard
          </button>
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(0,208,255,0.8)]" />
            <span className="text-[10px] font-bold tracking-[0.2em] text-cyan-400 uppercase">Network Online</span>
          </div>
        </nav>

        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-px w-12 bg-cyan-400" />
            <span className="text-cyan-400 text-[10px] font-black uppercase tracking-[0.4em]">Protocol Discovery</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter italic text-white uppercase">
            User{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-200">
              Discovery
            </span>
          </h1>
          <p className="mt-4 text-slate-400 max-w-lg leading-relaxed">
            Verify on-chain identities and performance metrics across the SynapseX network using global address lookups.
          </p>
        </header>

        {/* Search */}
        <div className="relative mb-12">
          <form
            onSubmit={handleSearch}
            className="flex flex-col md:flex-row gap-4 p-2 bg-slate-900/40 backdrop-blur-xl border border-cyan-400/20 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by User Wallet Address (e.g. 0x1e4r2..)"
                className="w-full pl-14 pr-6 py-5 bg-transparent border-none focus:ring-0 font-mono text-sm text-cyan-400 placeholder:text-slate-600 outline-none"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="bg-cyan-400 hover:brightness-110 text-[#0f1f23] px-10 py-4 md:py-0 rounded-xl font-black uppercase tracking-widest transition-all active:scale-95 shadow-[0_0_20px_rgba(0,208,255,0.3)] cursor-pointer"
            >
              Search user
            </button>
          </form>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block relative">
              <div className="w-16 h-16 border-2 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin" />
            </div>
            <p className="mt-6 font-black text-slate-500 text-[10px] tracking-[0.5em] uppercase">Consulting Ledger...</p>
          </div>
        )}

        {/* Results */}
        {userData && !loading && (
          <div className="space-y-8">

            {/* Profile Card */}
            <div className="relative overflow-hidden p-[1px] rounded-[2.5rem]"
              style={{ background: 'linear-gradient(135deg, rgba(0,208,255,0.5), transparent)' }}
            >
              <div className="bg-[#0f1f23]/95 backdrop-blur-3xl rounded-[2.4rem] p-8 md:p-12 relative overflow-hidden">

                {/* Card header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                  <div>
                    <p className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em] mb-3">Identity Verified</p>
                    <h3 className="text-3xl font-black text-white font-mono uppercase tracking-tight">{address}</h3>
                  </div>
                  <div className="flex gap-4 items-center">
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Rank</span>
                      <span className="text-lg font-black text-cyan-400">ELITE CLASS</span>
                    </div>
                    <div className="w-12 h-12 bg-cyan-400/20 rounded-xl flex items-center justify-center border border-cyan-400/40">
                      <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Metrics grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
                  <div className="group">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 group-hover:text-cyan-400 transition-colors">Reputation</p>
                    <div className="flex items-baseline gap-1">
                      <p className="text-4xl md:text-5xl font-black text-white">{userData.reputation}</p>
                      <span className="text-cyan-400 font-black text-xl">%</span>
                    </div>
                    <div className="w-full h-1 bg-slate-800 mt-4 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-400 rounded-full"
                        style={{ width: `${userData.reputation}%`, boxShadow: '0 0 8px rgba(0,208,255,0.6)' }}
                      />
                    </div>
                  </div>

                  <div className="group">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 group-hover:text-cyan-400 transition-colors">Earnings</p>
                    <div className="flex items-baseline gap-1">
                      <p className="text-4xl md:text-5xl font-black text-emerald-400">{userData.earnings}</p>
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono mt-2">HBAR EQUIVALENT</p>
                  </div>

                  <div className="group">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 group-hover:text-cyan-400 transition-colors">Tasks Posted</p>
                    <p className="text-4xl md:text-5xl font-black text-white">{userData.tasksPosted}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-2">NETWORK CONTRACTS</p>
                  </div>

                  <div className="group">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 group-hover:text-cyan-400 transition-colors">Completed</p>
                    <p className="text-4xl md:text-5xl font-black text-white">{userData.tasksCompleted?.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-2">VERIFIED ACTIONS</p>
                  </div>
                </div>

                {/* Tags */}
                <div className="mt-16 pt-8 border-t border-white/10 flex flex-wrap gap-4">
                  {['Node Validator', 'Early Adopter', 'Gov Council'].map((tag) => (
                    <span
                      key={tag}
                      className="px-4 py-2 bg-cyan-400/10 border border-cyan-400/20 rounded-full text-[10px] font-bold text-cyan-400 tracking-widest uppercase"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Decorative circles */}
                <div className="absolute bottom-0 right-0 opacity-10 pointer-events-none">
                  <svg width="200" height="200" viewBox="0 0 100 100">
                    <circle cx="100" cy="100" r="80" fill="none" stroke="#00d0ff" strokeWidth="0.5" />
                    <circle cx="100" cy="100" r="60" fill="none" stroke="#00d0ff" strokeWidth="0.5" />
                    <circle cx="100" cy="100" r="40" fill="none" stroke="#00d0ff" strokeWidth="0.5" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Activity cards row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Node Location */}
              <div className="bg-slate-900/40 backdrop-blur-xl border border-cyan-400/10 rounded-3xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Node Location</h4>
                  <span className="text-[10px] font-mono text-cyan-400">LAT: 40.7128 N</span>
                </div>
                <div className="h-48 rounded-2xl bg-slate-800 relative overflow-hidden flex items-center justify-center">
                  {/* Stylized map placeholder */}
                  <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 400 200" fill="none">
                    <path d="M0 100 Q100 60 200 100 T400 100" stroke="#00d0ff" strokeWidth="0.5" />
                    <path d="M0 80 Q100 40 200 80 T400 80" stroke="#00d0ff" strokeWidth="0.5" />
                    <path d="M0 120 Q100 80 200 120 T400 120" stroke="#00d0ff" strokeWidth="0.5" />
                    <line x1="0" y1="0" x2="400" y2="0" stroke="#00d0ff" strokeWidth="0.3" />
                    <line x1="0" y1="50" x2="400" y2="50" stroke="#00d0ff" strokeWidth="0.3" />
                    <line x1="0" y1="100" x2="400" y2="100" stroke="#00d0ff" strokeWidth="0.3" />
                    <line x1="0" y1="150" x2="400" y2="150" stroke="#00d0ff" strokeWidth="0.3" />
                    <line x1="0" y1="200" x2="400" y2="200" stroke="#00d0ff" strokeWidth="0.3" />
                    <line x1="100" y1="0" x2="100" y2="200" stroke="#00d0ff" strokeWidth="0.3" />
                    <line x1="200" y1="0" x2="200" y2="200" stroke="#00d0ff" strokeWidth="0.3" />
                    <line x1="300" y1="0" x2="300" y2="200" stroke="#00d0ff" strokeWidth="0.3" />
                  </svg>
                  <div
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(to top, #0f1f23, transparent)' }}
                  />
                  {/* Ping marker */}
                  <div className="relative">
                    <div className="w-4 h-4 bg-cyan-400 rounded-full animate-ping absolute -inset-0" />
                    <div className="w-4 h-4 bg-cyan-400 rounded-full relative border-4 border-[#0f1f23]" />
                  </div>
                </div>
              </div>

              {/* Asset Distribution */}
              <div className="bg-slate-900/40 backdrop-blur-xl border border-cyan-400/10 rounded-3xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Asset Distribution</h4>
                  <span className="text-[10px] font-mono text-cyan-400">TOTAL: $1.2M</span>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'Native Stake', pct: 75, opacity: 'bg-cyan-400' },
                    { label: 'Liquidity Pools', pct: 15, opacity: 'bg-cyan-400/40' },
                    { label: 'NFT Assets', pct: 10, opacity: 'bg-cyan-400/20' },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-[10px] font-bold mb-1 uppercase text-slate-500">
                        <span>{item.label}</span>
                        <span>{item.pct}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${item.opacity} rounded-full`}
                          style={{
                            width: `${item.pct}%`,
                            ...(item.pct === 75 ? { boxShadow: '0 0 10px rgba(0,208,255,0.4)' } : {}),
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-6 py-12 border-t border-white/5">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 opacity-40 hover:opacity-100 transition-opacity">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">SynapseX Testnet </p>
          <div className="flex gap-8">
            {[
               { label: 'Hedera explorer', href: '' },
               { label: 'Docs', href: '/docs' },
               { label: 'Support', href: '/support' },
            ].map((link) => (
              <a
                key={link.label}
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
                
                className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 hover:text-cyan-400 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}