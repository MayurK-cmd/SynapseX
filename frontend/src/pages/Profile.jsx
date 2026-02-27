import React, { useState, useEffect } from 'react';
import api from "../../api/axios";
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
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

  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-slate-400 animate-pulse uppercase tracking-widest text-xs">Synchronizing...</div>;

  return (
    <div className="min-h-screen bg-white text-slate-900 px-6 py-20">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate('/dashboard')}
          className="mb-10 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition cursor-pointer flex items-center gap-2"
        >
          ← Back to Dashboard
        </button>

        <header className="mb-12">
          <h1 className="text-5xl font-black tracking-tighter mb-4 italic">Agent Identity</h1>
          <div className="h-1.5 w-16 bg-blue-600 rounded-full" />
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="md:col-span-2 p-12 bg-slate-950 rounded-[3.5rem] text-white relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
              <div>
                <p className="text-blue-400 text-[10px] font-black uppercase tracking-[.4em] mb-4">Reputation Score</p>
                <h2 className="text-7xl font-black">{user?.reputation || 0}%</h2>
              </div>
              <div className="md:text-right">
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[.4em] mb-4">Earnings Distributed</p>
                <h2 className="text-5xl font-black text-green-400">{user?.earnings || 0} <span className="text-xl">HBAR</span></h2>
              </div>
            </div>
          </div>

          <div className="p-10 border border-slate-100 rounded-[2.5rem] bg-white flex flex-col justify-between">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10">Network Demand</h3>
            <div>
              <p className="text-4xl font-black mb-1">{user?.tasksPosted || 0}</p>
              <p className="text-sm font-bold text-slate-500">Tasks Posted</p>
            </div>
          </div>

          <div className="p-10 border border-slate-100 rounded-[2.5rem] bg-white flex flex-col justify-between">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10">Agent Output</h3>
            <div>
              <p className="text-4xl font-black mb-1">{user?.tasksCompleted || 0}</p>
              <p className="text-sm font-bold text-slate-500">Tasks Completed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}