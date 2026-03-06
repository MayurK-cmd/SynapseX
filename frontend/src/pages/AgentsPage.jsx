import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Plus, X, Search, ExternalLink, Eye, EyeOff,
  AlertTriangle, CheckCircle, ClipboardList, Bot, Cpu,
  ImageIcon, Music, FileText, MessageSquare, Terminal,
  Loader2, PlusCircle, Code2
} from "lucide-react";
import api from "../../api/axios";

const OPENROUTER_MODELS_URL = "https://openrouter.ai/api/v1/models";

function formatPrice(perToken) {
  if (!perToken || perToken === "0") return "Free";
  const per1M = parseFloat(perToken) * 1_000_000;
  if (per1M < 0.01) return `$${per1M.toFixed(4)}/1M`;
  return `$${per1M.toFixed(2)}/1M`;
}

function ModalityIcon({ inputStr, className = "w-4 h-4" }) {
  if (!inputStr) return <Bot className={className} />;
  if (inputStr.includes("image")) return <ImageIcon className={className} />;
  if (inputStr.includes("audio")) return <Music className={className} />;
  if (inputStr.includes("file")) return <FileText className={className} />;
  return <MessageSquare className={className} />;
}

// ─── Model Browser Modal ──────────────────────────────────────────────────────
function ModelBrowserModal({ onSelect, onClose }) {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [search, setSearch] = useState("");
  const [filterModality, setFilterModality] = useState("all");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(OPENROUTER_MODELS_URL);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setModels(data.data || []);
      } catch {
        setFetchError("Could not reach OpenRouter. Enter the model ID manually instead.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const modalities = useMemo(() => {
    const set = new Set();
    models.forEach(m => {
      const raw = m.architecture?.input_modalities || m.architecture?.modality || "";
      const str = Array.isArray(raw) ? raw.join("+") : raw;
      str.split(/[+,]/).map(s => s.trim().split("->")[0].trim()).filter(Boolean).forEach(s => set.add(s));
    });
    return ["all", ...Array.from(set).sort()];
  }, [models]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return models.filter(m => {
      if (q && !m.id.toLowerCase().includes(q) && !(m.name || "").toLowerCase().includes(q)) return false;
      if (filterModality === "all") return true;
      const raw = m.architecture?.input_modalities || m.architecture?.modality || "";
      const str = Array.isArray(raw) ? raw.join("+") : raw;
      return str.toLowerCase().includes(filterModality.toLowerCase());
    });
  }, [models, search, filterModality]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl max-h-[85vh] flex flex-col rounded-2xl overflow-hidden"
        style={{ background: '#0f1f23', border: '1px solid rgba(0,208,255,0.25)' }}>

        {/* Modal Header */}
        <div className="px-6 pt-6 pb-4 border-b border-[#27373a] flex-shrink-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-cyan-400/20 flex items-center justify-center">
                <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <h3 className="text-lg font-black text-slate-100">OpenRouter Model Browser</h3>
            </div>
            <button onClick={onClose} className="text-slate-500 hover:text-slate-200 transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-slate-500 mb-4">Click any model to auto-fill the identifier. All modalities supported.</p>

          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or ID..."
                className="w-full bg-[#162a2f] border border-[#27373a] rounded-lg pl-9 pr-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-400 placeholder:text-slate-600 transition-colors" />
            </div>
            <select value={filterModality} onChange={e => setFilterModality(e.target.value)}
              className="bg-[#162a2f] border border-[#27373a] rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-400 cursor-pointer capitalize">
              {modalities.map(m => <option key={m} value={m}>{m === "all" ? "All Modalities" : m}</option>)}
            </select>
          </div>
        </div>

        {/* Model List */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
              <p className="text-xs text-slate-500 uppercase tracking-widest">Fetching from OpenRouter...</p>
            </div>
          ) : fetchError ? (
            <div className="text-center py-12">
              <p className="text-red-400 text-sm font-bold mb-1">Failed to load models</p>
              <p className="text-slate-500 text-xs">{fetchError}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400 text-sm">No models match your search.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filtered.map(model => {
                const raw = model.architecture?.input_modalities || model.architecture?.modality || "";
                const inputStr = Array.isArray(raw) ? raw.join(", ") : (raw || "text");
                const promptPrice = model.pricing?.prompt;
                const completionPrice = model.pricing?.completion;
                const isFree = (!promptPrice || promptPrice === "0") && (!completionPrice || completionPrice === "0");

                return (
                  <div key={model.id} onClick={() => onSelect(model.id)}
                    className="flex items-center gap-3 p-3 rounded-xl border border-transparent hover:border-cyan-400/20 hover:bg-[#162a2f] transition-all group cursor-pointer">

                    <div className="w-9 h-9 rounded-lg bg-[#162a2f] group-hover:bg-cyan-400/10 flex items-center justify-center flex-shrink-0 transition-colors text-slate-400 group-hover:text-cyan-400">
                      <ModalityIcon inputStr={inputStr} className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-slate-100 truncate">{model.name || model.id}</p>
                        {isFree && (
                          <span className="text-[9px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-full uppercase tracking-widest">Free</span>
                        )}
                      </div>
                      <p className="text-[10px] font-mono text-slate-500 truncate">{model.id}</p>
                      {inputStr && <p className="text-[9px] text-slate-600 mt-0.5 capitalize">{inputStr.replace(/[+]/g, " · ")}</p>}
                    </div>

                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0 ml-2">
                      {!isFree && (
                        <div className="text-right">
                          <p className="text-[8px] text-slate-600 uppercase tracking-widest">prompt</p>
                          <p className="text-[10px] font-mono text-amber-400">{formatPrice(promptPrice)}</p>
                          <p className="text-[8px] text-slate-600 uppercase tracking-widest mt-0.5">completion</p>
                          <p className="text-[10px] font-mono text-amber-400">{formatPrice(completionPrice)}</p>
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <button onClick={e => { e.stopPropagation(); window.open(`https://openrouter.ai/${model.id}`, '_blank'); }}
                          className="flex items-center gap-1 text-[9px] font-black text-slate-600 hover:text-cyan-400 uppercase tracking-widest transition-colors whitespace-nowrap">
                          View <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                        <Plus className="w-4 h-4 text-slate-700 group-hover:text-cyan-400 transition-colors" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer count */}
        {!loading && !fetchError && (
          <div className="px-6 py-3 border-t border-[#27373a] flex-shrink-0 flex justify-between items-center">
            <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">{filtered.length} of {models.length} models</p>
            <p className="text-[10px] text-slate-600">Click a model to select · View opens OpenRouter</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
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
  const [showApiKey, setShowApiKey] = useState(false);
  const [showBrowser, setShowBrowser] = useState(false);
  const [dismissedAlert, setDismissedAlert] = useState(false);

  const [name, setName] = useState("");
  const [modelIdentifier, setModelIdentifier] = useState("");
  const [apiKey, setApiKey] = useState("");

  const loadAgents = async () => {
    try {
      const res = await fetch(`${API}/agents/my`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setAgents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load agents:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!name.trim() || !modelIdentifier.trim() || !apiKey.trim()) { setError("All fields are required."); return; }
    setSubmitting(true); setError(""); setSuccess("");
    try {
      const res = await fetch(`${API}/agents/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
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

  const handleModelSelect = (modelId) => {
    setModelIdentifier(modelId);
    setShowBrowser(false);
    setShowForm(true);
  };

  useEffect(() => { loadAgents(); }, []);

  return (
    <div className="relative flex min-h-screen flex-col bg-[#0f1f23] text-slate-100 font-sans antialiased">

      {showBrowser && <ModelBrowserModal onSelect={handleModelSelect} onClose={() => setShowBrowser(false)} />}

      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-[#27373a] bg-[#0f1f23]/80 backdrop-blur-md px-4 md:px-10 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')}
              className="flex items-center justify-center rounded-lg h-10 w-10 bg-[#162a2f] text-slate-100 hover:bg-cyan-400/20 transition-colors border border-[#27373a] cursor-pointer">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-cyan-400 rounded-lg flex items-center justify-center">
                <span className="text-[#0f1f23] font-black text-sm">SX</span>
              </div>
              <h2 className="hidden md:block text-xl font-bold tracking-tight">
                SynapseX <span className="text-cyan-400/60 font-medium text-sm ml-1">v2.0.0</span>
              </h2>
            </div>
          </div>
          <nav className="hidden lg:flex items-center gap-8">
            <button onClick={() => navigate('/agents')} className="text-sm font-medium text-cyan-400 border-b-2 border-cyan-400 pb-1 cursor-pointer">
              Agents
            </button>
          </nav>
          <button onClick={() => { setShowForm(true); setError(""); setSuccess(""); }}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-400 text-[#0f1f23] rounded-lg text-sm font-bold hover:brightness-110 transition-all shadow-[0_0_20px_rgba(0,208,255,0.2)] cursor-pointer">
            <Plus className="w-4 h-4" />
            Register Model
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-10 py-8">

        <section className="mb-8">
          <h1 className="text-4xl font-black tracking-tight text-slate-100 mb-2">Agent Management</h1>
          <p className="text-slate-400 max-w-2xl text-lg">Deploy, manage, and monitor your AI agents on the decentralized SynapseX network.</p>
        </section>

        {/* ── OpenRouter Alert ── */}
        {!dismissedAlert && (
          <div className="mb-8 rounded-xl px-5 py-4 flex items-start gap-4"
            style={{ background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.2)' }}>
            <div className="w-9 h-9 rounded-lg bg-amber-400/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-amber-400 mb-1">Only OpenRouter Models Are Supported</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                SynapseX routes all completions through{" "}
                <a href="https://openrouter.ai" target="_blank" rel="noreferrer" className="text-amber-400 hover:underline font-bold">OpenRouter</a>.
                {" "}Your model identifier must be a valid OpenRouter model ID (e.g.{" "}
                <code className="font-mono text-cyan-400 bg-[#162a2f] px-1.5 py-0.5 rounded text-[10px]">openai/gpt-4o</code>,{" "}
                <code className="font-mono text-cyan-400 bg-[#162a2f] px-1.5 py-0.5 rounded text-[10px]">meta-llama/llama-3.3-70b-instruct</code>).
                {" "}Your OpenRouter API key is required.{" "}
                <strong className="text-slate-300">Only TEXT modalities are supported</strong> .
              </p>
              <button onClick={() => setShowBrowser(true)}
                className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-black text-amber-400 hover:text-amber-300 uppercase tracking-widest transition-colors cursor-pointer">
                Browse all OpenRouter models →
              </button>
            </div>
            <button onClick={() => setDismissedAlert(true)} className="text-slate-600 hover:text-slate-400 transition-colors flex-shrink-0 cursor-pointer mt-0.5">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Success Banner */}
        {success && (
          <div className="mb-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold px-5 py-3 rounded-xl flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            {success}
          </div>
        )}

        {/* Register Form */}
        <section className="mb-12">
          <div className="rounded-xl p-6" style={{ background: 'rgba(22,42,47,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0,208,255,0.1)' }}>
            <div className="flex items-center gap-2 mb-6">
              <ClipboardList className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-bold">Register New Agent</h2>
            </div>

            {showForm ? (
              <>
                {error && (
                  <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold px-4 py-2 rounded-xl">{error}</div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-300">Agent Name</label>
                    <input value={name} onChange={e => setName(e.target.value)} placeholder="Neural_Sentinel_01" type="text"
                      className="bg-[#0f1f23] border border-[#27373a] rounded-lg px-4 py-3 text-slate-100 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,208,255,0.15)] transition-all placeholder:text-slate-600" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-300">Model Identifier</label>
                    <div className="relative">
                      <input value={modelIdentifier} onChange={e => setModelIdentifier(e.target.value)} placeholder="openai/gpt-4o" type="text"
                        className="font-mono text-sm w-full bg-[#0f1f23] border border-[#27373a] rounded-lg px-4 py-3 pr-24 text-cyan-400 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,208,255,0.15)] transition-all placeholder:text-slate-600" />
                      <button type="button" onClick={() => setShowBrowser(true)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-black text-cyan-400 bg-cyan-400/10 border border-cyan-400/30 px-2 py-1 rounded-md hover:bg-cyan-400/20 transition-colors cursor-pointer uppercase tracking-widest whitespace-nowrap">
                        Browse
                      </button>
                    </div>
                    <p className="text-[9px] text-slate-500 ml-1">Must be a valid OpenRouter model ID.</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-300">OpenRouter API Key</label>
                    <div className="relative">
                      <input type={showApiKey ? "text" : "password"} value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="sk-or-..."
                        className="w-full bg-[#0f1f23] border border-[#27373a] rounded-lg px-4 py-3 text-slate-100 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,208,255,0.15)] transition-all pr-10 placeholder:text-slate-600" />
                      <button type="button" onClick={() => setShowApiKey(!showApiKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer">
                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[9px] text-slate-500 ml-1">Get your key at{" "}
                      <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">openrouter.ai/keys</a>. Encrypted at rest.
                    </p>
                  </div>
                </div>
                <div className="mt-8 flex justify-end gap-3">
                  <button onClick={() => { setShowForm(false); setError(""); }}
                    className="px-6 py-2.5 rounded-lg border border-[#27373a] text-slate-300 font-medium hover:bg-[#162a2f] transition-colors cursor-pointer">
                    Cancel
                  </button>
                  <button onClick={handleRegister} disabled={submitting}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-cyan-400/10 text-cyan-400 border border-cyan-400/30 font-bold hover:bg-cyan-400/20 transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed">
                    {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Registering...</> : "Confirm Registration"}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4 flex-wrap">
                <button onClick={() => { setShowForm(true); setError(""); setSuccess(""); }}
                  className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 text-sm font-medium transition-colors cursor-pointer">
                  <Plus className="w-4 h-4" />
                  Expand registration form
                </button>
                <span className="text-slate-700">·</span>
                <button onClick={() => setShowBrowser(true)}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-cyan-400 text-sm font-medium transition-colors cursor-pointer">
                  <Search className="w-4 h-4" />
                  Browse OpenRouter models
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Agents Grid */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold flex items-center gap-2">
              Registered Models
              <span className="text-sm font-normal text-slate-500 bg-[#162a2f] px-2 py-0.5 rounded-full border border-[#27373a]">
                {agents.length} Total
              </span>
            </h3>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 opacity-60">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-6" />
              <h4 className="text-xl font-bold mb-2">Syncing Network States</h4>
              <p className="text-slate-500 text-sm text-center">Fetching agent statuses from the SynapseX protocol...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {agents.map(agent => (
                <div key={agent.id}
                  className={`group rounded-xl p-5 transition-all duration-300 relative overflow-hidden ${agent.competition_enabled ? 'hover:border-cyan-400/40' : 'opacity-80 grayscale-[0.5]'}`}
                  style={{ background: 'rgba(22,42,47,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0,208,255,0.1)' }}>

                  {agent.competition_enabled && (
                    <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-400/5 blur-3xl rounded-full -mr-12 -mt-12 group-hover:bg-cyan-400/10 transition-colors" />
                  )}

                  <div className="flex justify-between items-start mb-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${agent.competition_enabled ? 'bg-cyan-400/20 text-cyan-400' : 'bg-slate-800 text-slate-500'}`}>
                      <Cpu className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-2">
                      <a href={`https://openrouter.ai/${agent.model_identifier}`} target="_blank" rel="noreferrer"
                        onClick={e => e.stopPropagation()} title="View on OpenRouter"
                        className="text-slate-600 hover:text-cyan-400 transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${agent.competition_enabled ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400 border border-[#27373a]'}`}>
                        {agent.competition_enabled && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                        {agent.competition_enabled ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  <h4 className={`text-lg font-bold mb-1 transition-colors ${agent.competition_enabled ? 'text-slate-100 group-hover:text-cyan-400' : 'text-slate-300'}`}>
                    {agent.name}
                  </h4>
                  <p className="font-mono text-xs text-slate-500 mb-4 truncate">{agent.model_identifier}</p>

                  <div className="space-y-3 pt-4 border-t border-[#27373a]">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Wallet</span>
                      <span className={`font-mono ${agent.competition_enabled ? 'text-slate-300' : 'text-slate-600'}`}>
                        {agent.wallet_address ? `${agent.wallet_address.slice(0, 4)}...${agent.wallet_address.slice(-4)}` : '—'}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Agent ID</span>
                      <span className={`font-mono ${agent.competition_enabled ? 'text-slate-300' : 'text-slate-600'}`}>
                        #{String(agent.id).slice(0, 8)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Add card */}
              <button onClick={() => { setShowForm(true); setError(""); setSuccess(""); }}
                className="border-2 border-dashed border-[#27373a] rounded-xl p-8 flex flex-col items-center justify-center gap-4 group cursor-pointer hover:border-cyan-400/50 transition-all">
                <div className="w-14 h-14 rounded-full bg-[#162a2f] flex items-center justify-center text-slate-500 group-hover:text-cyan-400 transition-colors">
                  <PlusCircle className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <p className="text-slate-100 font-bold">Add New Model</p>
                  <p className="text-xs text-slate-500">Scale your compute network</p>
                </div>
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#27373a] py-8 px-4 md:px-10 bg-[#0f1f23]/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-mono text-slate-500">Connected to Testnet</span>
          </div>
          <div className="flex gap-6">
            <button onClick={() => navigate('/support')} className="text-xs text-slate-500 hover:text-cyan-400 transition-colors cursor-pointer">Support</button>
            <button onClick={() => navigate('/terms')} className="text-xs text-slate-500 hover:text-cyan-400 transition-colors cursor-pointer">Terms of Service</button>
            <a href="https://openrouter.ai/models" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-slate-500 hover:text-cyan-400 transition-colors">
              OpenRouter Docs <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <p className="text-xs text-slate-600">© 2026 SynapseX Protocol. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}