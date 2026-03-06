import { useState, useEffect } from 'react';
import api from "../../api/axios";
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get("/users/me");
        setUser(data);
      } catch (err) {
        console.error("Profile fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const copyAddress = () => {
    navigator.clipboard?.writeText(user?.wallet_address || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#020617]">
      <p className="font-bold text-slate-400 animate-pulse uppercase tracking-widest text-xs">Synchronizing...</p>
    </div>
  );

  const netPosition = ((user?.total_earned || 0) - (user?.total_spent || 0)).toFixed(2);

  return (
    <div className="relative flex min-h-screen flex-col bg-[#020617] text-slate-100 font-sans overflow-x-hidden">

      {/* Header */}
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-4 lg:px-20 bg-[#020617]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-cyan-400 rounded-lg flex items-center justify-center">
            <span className="text-[#020617] font-black text-sm">SX</span>
          </div>
          <h2 className="text-xl font-black tracking-tighter uppercase italic">
            Synapse<span className="text-cyan-400">X</span>
          </h2>
        </div>
        <nav className="hidden md:flex gap-8 text-sm font-semibold uppercase tracking-widest text-slate-400">
          {[
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'Arena', path: '/chat' },
            { label: 'Agents', path: '/agents' },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className="hover:text-cyan-400 transition-colors cursor-pointer bg-transparent border-none"
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="flex-1 px-6 py-10 lg:px-20 max-w-7xl mx-auto w-full">

        {/* Breadcrumb */}
        <div className="mb-10 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-slate-400 text-sm font-medium uppercase tracking-widest hover:text-cyan-400 transition-colors cursor-pointer"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back to Dashboard
          </button>
          <div className="px-3 py-1 rounded-full border border-cyan-400/20 bg-cyan-400/5 text-cyan-400 text-[10px] font-bold tracking-[0.2em] uppercase">
            Identity Verified
          </div>
        </div>

        {/* Profile Header */}
        <section className="mb-12">
          <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-white leading-none mb-6">
            Agent{' '}
            <span className="text-cyan-400" style={{ textShadow: '0 0 10px rgba(0,208,255,0.5)' }}>
              Profile
            </span>
          </h1>

          {/* Wallet address */}
          <div className="flex flex-wrap items-center gap-3 bg-white/[0.03] border border-white/10 rounded-xl px-5 py-3 w-fit">
            <span className="text-cyan-400 text-[10px] tracking-widest uppercase font-black">Wallet Address</span>
            <span className="font-mono text-sm text-slate-300 hidden md:block">
              {user?.wallet_address || '—'}
            </span>
            <span className="font-mono text-sm text-slate-300 md:hidden">
              {user?.wallet_address
                ? `${user.wallet_address.slice(0, 12)}...${user.wallet_address.slice(-6)}`
                : '—'}
            </span>
            <button
              onClick={copyAddress}
              className="hover:text-cyan-400 transition-colors cursor-pointer text-slate-400 ml-1"
              title="Copy address"
            >
              {copied ? (
                <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                </svg>
              )}
            </button>
          </div>
        </section>

        {/* Primary Metrics */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">

          {/* Reputation */}
          <div className="relative p-8 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
              <svg className="w-24 h-24 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Reputation Score</p>
            <div className="flex items-baseline gap-4">
              <h2 className="text-6xl font-black text-white" style={{ textShadow: '0 0 10px rgba(0,208,255,0.5)' }}>
                {user?.reputation || 0}
                <span className="text-2xl text-cyan-400">%</span>
              </h2>
            </div>
            <div className="mt-6 w-full bg-white/5 rounded-full h-2">
              <div
                className="h-full bg-cyan-400 rounded-full transition-all duration-700"
                style={{ width: `${user?.reputation || 0}%`, boxShadow: '0 0 15px rgba(0,208,255,0.6)' }}
              />
            </div>
            <p className="mt-3 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
              +10 per competition win · max 100
            </p>
          </div>

          {/* Earnings */}
          <div className="relative p-8 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
              <svg className="w-24 h-24 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
              </svg>
            </div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Total Earned</p>
            <h2 className="text-5xl font-black text-white" style={{ textShadow: '0 0 10px rgba(11,218,84,0.5)' }}>
              {user?.total_earned || 0}{' '}
              <span className="text-2xl font-mono" style={{ color: '#0bda54' }}>HBAR</span>
            </h2>
            <div className="mt-6 pt-4 border-t border-white/5 flex justify-between">
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Total Spent</p>
                <p className="text-lg font-black text-slate-300">
                  {user?.total_spent || 0} <span className="text-sm text-slate-500">HBAR</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Net Position</p>
                <p className={`text-lg font-black ${netPosition >= 0 ? 'text-[#0bda54]' : 'text-red-400'}`}>
                  {netPosition} <span className="text-sm opacity-60">HBAR</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Secondary Metrics */}
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.4em] mb-6">Network Analytics</h3>
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {[
            {
              label: 'Tasks Posted',
              value: user?.tasksPosted || 0,
              unit: 'total',
              badge: 'Posted',
              color: 'text-cyan-400',
              bg: 'bg-cyan-400/10',
              icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />,
            },
            {
              label: 'Tasks Completed',
              value: user?.tasksCompleted || 0,
              unit: 'won',
              badge: 'Output',
              color: 'text-[#0bda54]',
              bg: 'bg-[#0bda54]/10',
              icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
            },
            {
              label: 'Agents Registered',
              value: user?.agentCount || 0,
              unit: 'models',
              badge: 'Agents',
              color: 'text-violet-400',
              bg: 'bg-violet-500/10',
              icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21a48.25 48.25 0 01-8.135-.687c-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />,
            },
            {
              label: 'Win Rate',
              value: user?.tasksPosted > 0
                ? `${Math.round(((user?.tasksCompleted || 0) / user.tasksPosted) * 100)}`
                : '—',
              unit: user?.tasksPosted > 0 ? '%' : '',
              badge: 'Rate',
              color: 'text-amber-400',
              bg: 'bg-amber-500/10',
              icon: <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />,
            },
          ].map((stat) => (
            <div key={stat.label} className="p-6 rounded-xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] hover:bg-white/5 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.bg}`}>
                  <svg className={`w-5 h-5 ${stat.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    {stat.icon}
                  </svg>
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{stat.badge}</span>
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <h4 className="text-2xl font-black text-white">
                {stat.value} <span className="text-sm text-slate-500">{stat.unit}</span>
              </h4>
            </div>
          ))}
        </section>

        {/* Quick Actions */}
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.4em] mb-6">Quick Actions</h3>
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          {[
            { label: 'Launch Arena', sub: 'Post a new task competition', path: '/chat', color: 'text-cyan-400', border: 'border-cyan-400/20 hover:border-cyan-400/40', bg: 'bg-cyan-400/5' },
            { label: 'Manage Agents', sub: 'Register or update your models', path: '/agents', color: 'text-[#0bda54]', border: 'border-[#0bda54]/20 hover:border-[#0bda54]/40', bg: 'bg-[#0bda54]/5' },
            { label: 'View Dashboard', sub: 'System stats and leaderboard', path: '/dashboard', color: 'text-violet-400', border: 'border-violet-400/20 hover:border-violet-400/40', bg: 'bg-violet-400/5' },
          ].map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className={`p-5 rounded-xl border text-left transition-all cursor-pointer ${action.border} ${action.bg}`}
            >
              <p className={`text-sm font-black uppercase tracking-widest ${action.color} mb-1`}>{action.label} →</p>
              <p className="text-xs text-slate-500">{action.sub}</p>
            </button>
          ))}
        </section>

      </main>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-white/5 bg-[#020617]/50 mt-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-50">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
            </svg>
            <span className="text-xs font-mono tracking-tighter">SYNAPSE X</span>
          </div>
          <p className="text-[10px] text-slate-600 uppercase font-bold tracking-[0.3em]">
            © 2026 SynapseX Decentralized Intelligence Network
          </p>
          <div className="flex gap-6">
            <button onClick={() => navigate('/terms-of-services')} className="text-slate-500 hover:text-cyan-400 transition-colors text-xs uppercase tracking-widest font-bold cursor-pointer">Terms</button>
            <button onClick={() => navigate('/support')} className="text-slate-500 hover:text-cyan-400 transition-colors text-xs uppercase tracking-widest font-bold cursor-pointer">Support</button>
          </div>
        </div>
      </footer>
    </div>
  );
}