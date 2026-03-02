import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function AgentsPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const API = api.defaults.baseURL;

  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [name, setName] = useState("");
  const [modelIdentifier, setModelIdentifier] = useState("");
  const [apiKey, setApiKey] = useState("");

  const loadAgents = async () => {
    try {
      const res = await fetch(`${API}/agents/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAgents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load agents:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!name.trim() || !modelIdentifier.trim() || !apiKey.trim()) {
      setError("All fields are required.");
      return;
    }
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`${API}/agents/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, modelIdentifier, apiKey }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");
      setSuccess(`Agent "${data.name}" registered successfully!`);
      setName(""); setModelIdentifier(""); setApiKey("");
      setShowForm(false);
      loadAgents();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => { loadAgents(); }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      
      {/* Header */}
      <div className="border-b border-slate-100 px-10 py-5 flex items-center justify-between bg-white sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="text-[10px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest">← Back</button>
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-[.3em]">SynapseX / Agents</span>
        </div>
        <button
          onClick={() => { setShowForm(true); setError(""); setSuccess(""); }}
          className="bg-blue-600 text-white px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-blue-700 transition-all"
        >
          + Register Model
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-10 py-12">

        {/* Success Banner */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 text-xs font-bold px-5 py-3 rounded-2xl">
            {success}
          </div>
        )}

        {/* Register Form */}
        {showForm && (
          <div className="mb-10 bg-slate-50 border border-slate-200 rounded-[2rem] p-8 space-y-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Register New Model</p>
              <button onClick={() => setShowForm(false)} className="text-[10px] font-black text-slate-400 hover:text-slate-700 uppercase tracking-widest">✕ Cancel</button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-bold px-4 py-2 rounded-xl">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Agent Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. MyGPT Agent"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-300 transition-colors"
                />
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Model Identifier</label>
                <input
                  value={modelIdentifier}
                  onChange={(e) => setModelIdentifier(e.target.value)}
                  placeholder="e.g. openai/gpt-4o"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-300 transition-colors font-mono"
                />
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-300 transition-colors font-mono"
                />
                <p className="text-[9px] text-slate-400 mt-1 ml-1">Your key is encrypted and never stored in plain text.</p>
              </div>
            </div>

            <button
              onClick={handleRegister}
              disabled={submitting}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 disabled:opacity-40 transition-all"
            >
              {submitting ? "Registering..." : "Register Agent"}
            </button>
          </div>
        )}

        {/* Agents List */}
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[.2em] mb-6">Your Registered Models</p>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : agents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-slate-100 rounded-[2rem]">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-xl mb-4">🤖</div>
              <p className="text-sm font-bold text-slate-700 mb-1">No agents registered yet</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">Register a model to compete in USER pool tasks</p>
            </div>
          ) : (
            <div className="space-y-4">
              {agents.map((agent) => (
                <div key={agent.id} className="bg-white border border-slate-100 rounded-[2rem] p-6 flex items-center justify-between hover:border-blue-200 hover:shadow-sm transition-all">
                  <div className="space-y-1">
                    <p className="text-sm font-black text-slate-800">{agent.name}</p>
                    <p className="text-[10px] font-mono text-slate-400">{agent.model_identifier}</p>
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Wallet: {agent.wallet_address}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${agent.competition_enabled ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                      {agent.competition_enabled ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-[9px] font-mono text-slate-300">#{agent.id.slice(0, 8)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}