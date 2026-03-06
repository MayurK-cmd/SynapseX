import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const StatCard = ({ label, value, sub, accent = false, color = 'cyan' }) => {
  const colors = {
    cyan: 'text-cyan-400',
    green: 'text-green-400',
    amber: 'text-amber-400',
    red: 'text-red-400',
    violet: 'text-violet-400',
    slate: 'text-slate-300',
  };
  return (
    <div
      className={`p-6 rounded-xl flex flex-col gap-2 border transition-all ${
        accent
          ? 'bg-cyan-400/5 border-cyan-400/20'
          : 'bg-white/[0.02] border-white/5'
      }`}
    >
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
      <p className={`text-4xl font-black ${colors[color]}`}>{value}</p>
      {sub && <p className="text-[10px] text-slate-600 font-mono uppercase">{sub}</p>}
    </div>
  );
};

const BarStat = ({ label, value, max, color = 'bg-cyan-400', glow = false }) => {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs mb-2">
        <span className="text-slate-400 font-medium">{label}</span>
        <span className="text-slate-200 font-bold">{value} <span className="text-slate-600 font-normal">/ {max}</span></span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-700`}
          style={{
            width: `${pct}%`,
            ...(glow ? { boxShadow: '0 0 8px rgba(0,208,255,0.6)' } : {}),
          }}
        />
      </div>
    </div>
  );
};

export default function Stats() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/stats', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(data);
      } catch (err) {
        console.error('Stats fetch error:', err);
        setError('Failed to load network statistics.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  const successRate = stats?.total_tasks > 0
    ? ((stats.completed_tasks / stats.total_tasks) * 100).toFixed(1)
    : 0;

  const platformPct = stats?.total_models > 0
    ? ((stats.platform_agents / stats.total_models) * 100).toFixed(1)
    : 0;

  const userPct = stats?.total_models > 0
    ? ((stats.user_agents / stats.total_models) * 100).toFixed(1)
    : 0;

  return (
    <div className="relative min-h-screen bg-[#050a0b] text-slate-100 font-sans">

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-400/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-400/3 rounded-full blur-[100px]" />
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(to right, rgba(0,208,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,208,255,0.03) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#050a0b]/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="group flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest hover:text-cyan-400 transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back
            </button>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-cyan-400 rounded-lg flex items-center justify-center">
                <span className="text-[#050a0b] font-black text-xs">SX</span>
              </div>
              <span className="text-slate-100 font-black tracking-tighter text-lg italic uppercase">
                Synapse<span className="text-cyan-400">X</span>
                <span className="text-slate-600 font-normal not-italic text-sm ml-2 tracking-normal">/ Stats</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">Live</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 space-y-12">

        {/* Page title */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px w-10 bg-cyan-400" />
            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.4em]">Network Analytics</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter italic uppercase text-white leading-none">
            Protocol <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-300">Stats</span>
          </h1>
          <p className="text-slate-400 mt-3 text-sm max-w-lg">
            Live metrics from the SynapseX decentralized intelligence network.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] animate-pulse">
              Consulting Ledger...
            </p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold px-6 py-4 rounded-xl">
            {error}
          </div>
        )}

        {stats && !loading && (
          <>
            {/* Primary stats grid */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Total Models" value={stats.total_models} sub="Registered agents" color="cyan" accent />
              <StatCard label="Total Users" value={stats.total_users} sub="Active participants" color="violet" />
              <StatCard label="Total Tasks" value={stats.total_tasks} sub="All time" color="green" />
              <StatCard
                label="Avg Latency"
                value={stats.avg_latency_ms > 0 ? `${(stats.avg_latency_ms / 1000).toFixed(2)}s` : '—'}
                sub="Per execution"
                color="amber"
              />
            </section>

            {/* Task outcomes + model pool */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Task breakdown */}
              <div className="p-8 rounded-2xl border border-white/5 bg-white/[0.02]">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Task Outcomes</p>

                <div className="flex items-end gap-4 mb-6">
                  <span
                    className="text-6xl font-black text-white"
                    style={{ textShadow: '0 0 20px rgba(0,208,255,0.4)' }}
                  >
                    {successRate}
                    <span className="text-2xl text-cyan-400">%</span>
                  </span>
                  <span className="text-sm text-slate-500 mb-2">Success Rate</span>
                </div>

                <div className="space-y-4">
                  <BarStat
                    label="Completed"
                    value={stats.completed_tasks}
                    max={stats.total_tasks}
                    color="bg-green-500"
                  />
                  <BarStat
                    label="Failed"
                    value={stats.failed_tasks}
                    max={stats.total_tasks}
                    color="bg-red-500"
                  />
                  <BarStat
                    label="Total Tasks"
                    value={stats.total_tasks}
                    max={stats.total_tasks}
                    color="bg-cyan-400"
                    glow
                  />
                </div>

                <div className="flex justify-between mt-6 pt-4 border-t border-white/5">
                  <div>
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Completed</p>
                    <p className="text-lg font-black text-green-400">{stats.completed_tasks}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Failed</p>
                    <p className="text-lg font-black text-red-400">{stats.failed_tasks}</p>
                  </div>
                </div>
              </div>

              {/* Model pool breakdown */}
              <div className="p-8 rounded-2xl border border-white/5 bg-white/[0.02]">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Model Pool Breakdown</p>

                <div className="space-y-5 mb-8">
                  <div>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-slate-400 font-medium">Platform Models</span>
                      <span className="text-cyan-400 font-bold">{stats.platform_agents} <span className="text-slate-600">({platformPct}%)</span></span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-400 rounded-full transition-all duration-700"
                        style={{ width: `${platformPct}%`, boxShadow: '0 0 8px rgba(0,208,255,0.5)' }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-slate-400 font-medium">User Models</span>
                      <span className="text-violet-400 font-bold">{stats.user_agents} <span className="text-slate-600">({userPct}%)</span></span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-violet-400 rounded-full transition-all duration-700"
                        style={{ width: `${userPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Total Models</p>
                    <p className="text-2xl font-black text-slate-200">{stats.total_models}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Total Rewards</p>
                    <p className="text-2xl font-black text-amber-400">{stats.total_rewards} <span className="text-sm text-slate-500">ℏ</span></p>
                  </div>
                </div>
              </div>
            </section>

            {/* Bottom wide stat strip */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Completed Tasks" value={stats.completed_tasks} color="green" />
              <StatCard label="Failed Tasks" value={stats.failed_tasks} color="red" />
              <StatCard label="Total Rewards" value={`${stats.total_rewards} ℏ`} sub="HBAR distributed" color="amber" />
              <StatCard
                label="Platform Agents"
                value={stats.platform_agents}
                sub={`${stats.user_agents} user-contributed`}
                color="cyan"
                accent
              />
            </section>

            {/* HCS/HTS badges */}
            <section className="flex flex-wrap gap-3 pt-4 border-t border-white/5">
              {[
                { label: 'HCS Logs Active', color: 'text-cyan-400 border-cyan-400/20 bg-cyan-400/5' },
                { label: 'HTS Escrow Ready', color: 'text-green-400 border-green-500/20 bg-green-500/5' },
                { label: 'Hedera Testnet', color: 'text-amber-400 border-amber-500/20 bg-amber-500/5' },
              ].map((b) => (
                <div key={b.label} className={`px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest ${b.color}`}>
                  {b.label}
                </div>
              ))}
              <div className="ml-auto text-[10px] text-slate-600 font-mono self-center">
                © 2026 SynapseX Protocol
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}