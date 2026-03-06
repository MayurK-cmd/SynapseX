import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from "../../api/axios";

const Dashboard = ({ accountId }) => {
  const navigate = useNavigate();
  const API = api.defaults.baseURL;
  const token = localStorage.getItem("token");
  const [walletAddress, setWalletAddress] = useState("");
  const [stats, setStats] = useState({
    total_models: 0, total_users: 0, total_tasks: 0,
    completed_tasks: 0, failed_tasks: 0,
    platform_agents: 0, user_agents: 0, total_rewards: 0, avg_latency_ms: 0
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [myAgents, setMyAgents] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [statsRes, tasksRes, agentsRes, lbRes] = await Promise.all([
          fetch(`${API}/stats`, { headers }),
          fetch(`${API}/tasks/my`, { headers }),
          fetch(`${API}/agents/my`, { headers }),
          fetch(`${API}/stats/leaderboard`, { headers }),
        ]);
        const [statsData, tasksData, agentsData, lbData] = await Promise.all([
          statsRes.json(), tasksRes.json(), agentsRes.json(), lbRes.json(),
        ]);
        setStats(statsData);
        setRecentTasks(Array.isArray(tasksData) ? tasksData.slice(0, 5) : []);
        setMyAgents(Array.isArray(agentsData) ? agentsData : []);
        setLeaderboard(Array.isArray(lbData) ? lbData : []);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      }
    };
    fetchAll();
  }, [API, token]);

  useEffect(() => {
    if (!window.ethereum) return;
    window.ethereum.request({ method: "eth_accounts" })
      .then(accounts => setWalletAddress(accounts[0] || ""));
    window.ethereum.on("accountsChanged", (accounts) => {
      setWalletAddress(accounts[0] || "");
    });
  }, []);

  const successRate = stats.total_tasks > 0
    ? Math.round((stats.completed_tasks / stats.total_tasks) * 100)
    : 0;

  const platformPct = stats.total_models > 0
    ? ((stats.platform_agents / stats.total_models) * 100).toFixed(1)
    : 0;
  const userPct = stats.total_models > 0
    ? ((stats.user_agents / stats.total_models) * 100).toFixed(1)
    : 0;

  const medals = ['🏆', '🥈', '🥉'];

  return (
    <div className="flex h-screen overflow-hidden bg-[#050a0b] text-slate-100 font-sans">

      {/* Sidebar */}
      <aside className="w-64 border-r border-[#1a2e33] bg-[#050a0b] hidden lg:flex flex-col shrink-0">
        <div
          className="p-6 flex items-center gap-3 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <div className="w-8 h-8 bg-cyan-400 rounded-lg flex items-center justify-center">
            <span className="text-[#050a0b] font-black text-sm">SX</span>
          </div>
          <h1 className="text-xl font-black tracking-tighter text-slate-100">SYNAPSEX</h1>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {[
            { label: 'Dashboard', active: true, action: null },
            { label: 'Search', active: false, action: () => navigate('/search') },
            { label: 'My Agents', active: false, action: () => navigate('/agents') },
            { label: 'Chat', active: false, action: () => navigate('/chat') },
            { label: 'Profile', active: false, action: () => navigate('/profile') },
          ].map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded text-sm font-semibold transition-colors cursor-pointer text-left
                ${item.active
                  ? 'bg-gradient-to-r from-cyan-400/15 to-transparent border-l-[3px] border-cyan-400 text-cyan-400'
                  : 'text-slate-400 hover:text-slate-100'
                }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Wallet Balance */}
        <div className="p-4 mt-auto border-t border-[#1a2e33]">
          <div
            className="rounded-lg p-3 flex items-center gap-3"
            style={{ background: 'linear-gradient(145deg, rgba(15,31,35,0.8), rgba(5,10,11,0.9))', border: '1px solid rgba(0,208,255,0.1)' }}
          >
            <div className="w-8 h-8 rounded-full bg-cyan-400/20 flex items-center justify-center text-cyan-400 shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
              </svg>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-[10px] text-slate-500 uppercase font-bold">Current Wallet</p>
              <p className="text-xs font-mono text-slate-200 truncate">
                {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : '— Not Connected'}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-y-auto bg-[#050a0b]">

        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-8 py-4 border-b border-[#1a2e33] bg-[#050a0b]/80 backdrop-blur-md">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-md">
              {/* <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg> */}
              {/* <input
                className="w-full bg-[#0f1f23] border border-[#1a2e33] rounded-lg pl-10 pr-4 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 transition-all placeholder:text-slate-600"
                placeholder="Search agents, models or hashes..."
                type="text"
              /> */}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-400 rounded-full border border-green-500/20 text-xs font-bold">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Hedera Testnet 
            </div>
            {/* <button
              onClick={() => navigate('/wallet-connect')}
              className="bg-cyan-400 text-[#050a0b] px-5 py-2 rounded-lg text-sm font-bold hover:brightness-110 transition-all flex items-center gap-2 cursor-pointer"
            >
              Connect Wallet
            </button> */}
          </div>
        </header>

        <div className="p-8 space-y-8 max-w-[1400px] mx-auto w-full">

          {/* Hero Banner */}
          <section className="relative rounded-2xl overflow-hidden p-10 min-h-[260px] flex flex-col justify-center border border-cyan-400/20"
            style={{ background: 'linear-gradient(90deg, #050a0b 0%, rgba(5,10,11,0.6) 60%, rgba(0,208,255,0.08) 100%)' }}
          >
            {/* Decorative blobs */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-400/5 rounded-full blur-3xl -z-0" />
            <div className="relative z-10 space-y-4 max-w-2xl">
              <span className="text-cyan-400 font-bold tracking-widest text-xs uppercase bg-cyan-400/10 px-3 py-1 rounded inline-block">
                Intelligence Layer
              </span>
              <h1 className="text-5xl font-black text-slate-100 tracking-tight leading-tight">
                Autonomous AI Coordination
              </h1>
              <p className="text-slate-400 text-base leading-relaxed">
                Real-time decentralized intelligence layering and model orchestration across the SynapseX network.
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => navigate('/agents')}
                  className="bg-cyan-400 text-[#050a0b] px-6 py-3 rounded-lg font-bold hover:brightness-110 transition-all cursor-pointer text-sm"
                >
                  Deploy Agent
                </button>
                <button
                  onClick={() => navigate('/chat')}
                  className="bg-white/10 text-white backdrop-blur px-6 py-3 rounded-lg font-bold border border-white/20 hover:bg-white/20 transition-all cursor-pointer text-sm"
                >
                  Launch Chat
                </button>
              </div>
            </div>
          </section>

          {/* Stats Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Active Models', value: stats.total_models, trend: `${stats.platform_agents}p · ${stats.user_agents}u`, up: true },
              { label: 'Total Users', value: stats.total_users.toLocaleString(), trend: 'Active participants', up: true },
              { label: 'Tasks Processed', value: stats.total_tasks.toLocaleString(), trend: `${stats.completed_tasks} done · ${stats.failed_tasks} failed`, up: true },
              { label: 'Avg Latency', value: `${(stats.avg_latency_ms / 1000).toFixed(1)}s`, trend: 'Per model execution', up: false },
            ].map((s) => (
              <div
                key={s.label}
                className="p-6 rounded-xl flex flex-col gap-2"
                style={{ background: 'linear-gradient(145deg, rgba(15,31,35,0.8), rgba(5,10,11,0.9))', border: '1px solid rgba(0,208,255,0.1)' }}
              >
                <div className="flex items-center justify-between">
                  <p className="text-slate-400 text-sm font-medium">{s.label}</p>
                  <div className={`w-2 h-2 rounded-full ${s.up ? 'bg-green-500' : 'bg-orange-500'}`} />
                </div>
                <p className="text-3xl font-black text-slate-100">{s.value}</p>
                <p className={`text-sm font-bold ${s.up ? 'text-green-400' : 'text-orange-400'}`}>
                  {s.trend}
                </p>
              </div>
            ))}
          </section>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

            {/* Left Column */}
            <div className="xl:col-span-8 space-y-8">

              {/* Success Rate */}
              <div
                className="rounded-2xl p-8"
                style={{ background: 'linear-gradient(145deg, rgba(15,31,35,0.8), rgba(5,10,11,0.9))', border: '1px solid rgba(0,208,255,0.1)' }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                    <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Task Success Rate
                  </h3>
                  <span className="text-slate-400 text-sm">All Time</span>
                </div>
                <div className="flex items-end gap-6">
                  <div className="flex-1">
                    <div className="flex justify-between items-end mb-2">
                      <p className="text-4xl font-black text-cyan-400">{successRate}%</p>
                      <p className="text-slate-400 text-sm font-medium">{stats.completed_tasks} of {stats.total_tasks} tasks</p>
                    </div>
                    <div className="h-3 w-full bg-[#0f1f23] rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-400 rounded-full transition-all duration-700" style={{ width: `${successRate}%` }} />
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">✓ {stats.completed_tasks} Completed</span>
                      <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">✗ {stats.failed_tasks} Failed</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Tasks Table */}
              <div
                className="rounded-2xl overflow-hidden"
                style={{ background: 'linear-gradient(145deg, rgba(15,31,35,0.8), rgba(5,10,11,0.9))', border: '1px solid rgba(0,208,255,0.1)' }}
              >
                <div className="p-6 border-b border-[#1a2e33] flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-100">Recent Tasks</h3>
                  <button
                    onClick={() => navigate('/chat')}
                    className="text-cyan-400 text-sm font-bold hover:underline cursor-pointer"
                  >
                    View All →
                  </button>
                </div>
                <div className="overflow-x-auto">
                  {recentTasks.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-12">No tasks yet</p>
                  ) : (
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-slate-500 text-[10px] uppercase tracking-wider border-b border-[#1a2e33]">
                          <th className="px-6 py-4 font-black">Hash ID</th>
                          <th className="px-6 py-4 font-black">Description</th>
                          <th className="px-6 py-4 font-black">Reward</th>
                          <th className="px-6 py-4 font-black text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1a2e33]">
                        {recentTasks.map((task) => (
                          <tr
                            key={task.id}
                            className="hover:bg-cyan-400/5 transition-colors cursor-pointer"
                            onClick={() => navigate('/chat')}
                          >
                            <td className="px-6 py-4 font-mono text-xs text-slate-400">
                              {task.id ? `0x${String(task.id).slice(0, 3)}...${String(task.id).slice(-3)}` : '—'}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-300 max-w-[200px] truncate">
                              {task.description?.substring(0, 35)}...
                            </td>
                            <td className="px-6 py-4 text-xs text-cyan-400 font-bold">{task.reward} ℏ</td>
                            <td className="px-6 py-4 text-right">
                              {task.status === 'COMPLETED' && (
                                <span className="inline-flex items-center gap-1.5 text-green-400 text-xs font-bold">
                                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Completed
                                </span>
                              )}
                              {task.status === 'FAILED' && (
                                <span className="inline-flex items-center gap-1.5 text-red-400 text-xs font-bold">
                                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full" /> Failed
                                </span>
                              )}
                              {task.status !== 'COMPLETED' && task.status !== 'FAILED' && (
                                <span className="inline-flex items-center gap-1.5 text-cyan-400 text-xs font-bold">
                                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" /> Processing
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* My Agents */}
              <div className="space-y-4">
                <div className="flex justify-between items-center px-2">
                  <h3 className="text-lg font-bold text-slate-100">My Active Agents</h3>
                  <button
                    onClick={() => navigate('/agents')}
                    className="text-cyan-400 text-sm font-bold hover:underline cursor-pointer"
                  >
                    Manage →
                  </button>
                </div>
                {myAgents.length === 0 ? (
                  <div
                    className="rounded-xl p-8 text-center"
                    style={{ background: 'linear-gradient(145deg, rgba(15,31,35,0.8), rgba(5,10,11,0.9))', border: '1px solid rgba(0,208,255,0.1)' }}
                  >
                    <p className="text-sm text-slate-500 mb-4">No agents registered yet</p>
                    <button
                      onClick={() => navigate('/agents')}
                      className="text-xs font-black text-cyan-400 border border-cyan-400/30 px-5 py-2 rounded-full hover:bg-cyan-400/10 transition cursor-pointer"
                    >
                      + Add Model
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {myAgents.slice(0, 4).map((agent) => (
                      <div
                        key={agent.id}
                        className="p-5 rounded-xl flex items-center justify-between"
                        style={{ background: 'linear-gradient(145deg, rgba(15,31,35,0.8), rgba(5,10,11,0.9))', border: '1px solid rgba(0,208,255,0.1)' }}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${agent.competition_enabled ? 'bg-cyan-400/10 text-cyan-400' : 'bg-[#0f1f23] text-slate-600'}`}>
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className={`font-bold text-sm ${agent.competition_enabled ? 'text-slate-100' : 'text-slate-400'}`}>{agent.name}</p>
                            <p className="text-slate-500 text-xs font-mono truncate max-w-[120px]">{agent.model_identifier}</p>
                          </div>
                        </div>
                        <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase shrink-0 ${agent.competition_enabled ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/20' : 'bg-[#0f1f23] text-slate-500 border border-[#1a2e33]'}`}>
                          {agent.competition_enabled ? 'Active' : 'Offline'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="xl:col-span-4 space-y-8">

              {/* Model Pool Breakdown */}
              <div
                className="rounded-2xl p-6"
                style={{ background: 'linear-gradient(145deg, rgba(15,31,35,0.8), rgba(5,10,11,0.9))', border: '1px solid rgba(0,208,255,0.1)' }}
              >
                <h3 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                  Model Pool Breakdown
                </h3>
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-400">Platform Models</span>
                      <span className="text-slate-100 font-bold">{platformPct}%</span>
                    </div>
                    <div className="h-2 bg-[#0f1f23] rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-400 transition-all duration-700" style={{ width: `${platformPct}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-400">User Contributed</span>
                      <span className="text-slate-100 font-bold">{userPct}%</span>
                    </div>
                    <div className="h-2 bg-[#0f1f23] rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-400/40 transition-all duration-700" style={{ width: `${userPct}%` }} />
                    </div>
                  </div>
                  <div className="pt-2 grid grid-cols-2 gap-4">
                    <div className="bg-[#0f1f23]/50 p-3 rounded-lg border border-[#1a2e33]">
                      <p className="text-[10px] text-slate-500 uppercase font-bold">Total Models</p>
                      <p className="text-lg font-black text-slate-200">{stats.total_models}</p>
                    </div>
                    <div className="bg-[#0f1f23]/50 p-3 rounded-lg border border-[#1a2e33]">
                      <p className="text-[10px] text-slate-500 uppercase font-bold">Rewards</p>
                      <p className="text-lg font-black text-slate-200">{stats.total_rewards} ℏ</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Leaderboard */}
              <div
                className="rounded-2xl p-6"
                style={{ background: 'linear-gradient(145deg, rgba(15,31,35,0.8), rgba(5,10,11,0.9))', border: '1px solid rgba(0,208,255,0.1)' }}
              >
                <h3 className="text-lg font-bold text-slate-100 mb-6">Top Performers</h3>
                {leaderboard.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-8">No data yet</p>
                ) : (
                  <div className="space-y-3">
                    {leaderboard.map((agent, i) => (
                      <div
                        key={agent.id}
                        className={`flex items-center gap-4 p-3 rounded-xl border ${i === 0 ? 'bg-cyan-400/5 border-cyan-400/20' : 'bg-[#0f1f23]/50 border-[#1a2e33]'}`}
                      >
                        <span className="text-xl w-6 text-center shrink-0">
                          {medals[i] || `#${i + 1}`}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className={`font-bold text-sm truncate ${i === 0 ? 'text-slate-100' : 'text-slate-300'}`}>{agent.name}</p>
                          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{agent.model_source}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className={`font-bold text-sm ${i === 0 ? 'text-cyan-400' : 'text-slate-500'}`}>#{i + 1}</p>
                          <p className="text-[9px] text-slate-500">{agent.reputation} rep</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <button className="w-full mt-6 py-3 border border-[#1a2e33] rounded-xl text-slate-400 text-sm font-bold hover:bg-[#0f1f23] hover:text-slate-100 transition-all cursor-pointer">
                  View Full Leaderboard
                </button>
              </div>

              {/* Network Alert */}
              <div className="rounded-2xl bg-orange-500/5 border border-orange-500/20 p-6">
                <div className="flex items-center gap-3 text-orange-400 mb-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  <p className="text-sm font-bold">Network Alert</p>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Model responses after competition take upto number of models * 10.0 sec to load the response
                  
                </p>
              </div>
            </div>
          </div>

          {/* HCS/HTS Status Banner */}
          <div className="bg-[#0f1f23] rounded-2xl p-8 border border-[#1a2e33] flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-xl font-bold text-slate-100 mb-1">Hedera Integration Active</h2>
              <p className="text-slate-400 text-sm">
                Leveraging HCS for verifiable execution logs and HTS for instant escrow settlement.
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-cyan-400 uppercase tracking-widest">HCS Logs Active</div>
              <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-green-400 uppercase tracking-widest">HTS Escrow Ready</div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <footer className="mt-auto border-t border-[#1a2e33] p-8 flex flex-col md:flex-row items-center justify-between gap-6 bg-[#050a0b]/50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-cyan-400/20 rounded-md flex items-center justify-center text-cyan-400">
              <span className="text-[10px] font-black">SX</span>
            </div>
            <p className="text-xs text-slate-500 font-bold tracking-tighter uppercase">SynapseX Labs © 2026</p>
          </div>
          <div className="flex gap-8">
            {[{ label: 'Status', href: '/status' },
    { label: 'Support', href: '/support' },
  ].map((link) => (
    <a
      key={link.label}
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:text-cyan-400 transition-colors"
    >
      {link.label}
    </a>
  ))}
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Dashboard;