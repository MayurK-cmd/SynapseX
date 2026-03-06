import { useState, useEffect } from "react";
import api from "../../api/axios";

const CHECK_INTERVAL = 30000; // re-check every 30s

const checks = [
  {
    id: "api",
    label: "Backend API",
    sub: "Core server health",
    run: async () => {
      const start = Date.now();
      await api.get("/");
      return Date.now() - start;
    },
  },
  {
    id: "auth",
    label: "Auth Service",
    sub: "JWT middleware",
    run: async () => {
      const start = Date.now();
      // 401 = server is up, middleware is working, just no token
      await api.get("/tasks/my", { headers: { Authorization: "" } }).catch((e) => {
        if (e.response?.status === 401) return;
        throw e;
      });
      return Date.now() - start;
    },
  },
  {
    id: "hedera",
    label: "Hedera RPC",
    sub: "testnet.hashio.io/api",
    run: async () => {
      const start = Date.now();
      const res = await fetch("https://testnet.hashio.io/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", method: "eth_chainId", params: [], id: 1 }),
      });
      const data = await res.json();
      if (data.result !== "0x128") throw new Error("Wrong chain");
      return Date.now() - start;
    },
  },
  {
    id: "openrouter",
    label: "OpenRouter API",
    sub: "AI model gateway",
    run: async () => {
      const start = Date.now();
      const res = await fetch("https://openrouter.ai/api/v1/models");
      if (!res.ok) throw new Error("Unreachable");
      return Date.now() - start;
    },
  },
];

function dot(status) {
  if (status === "ok")      return "bg-green-500";
  if (status === "error")   return "bg-red-400";
  return "bg-amber-400 animate-pulse";
}

function badge(status) {
  if (status === "ok")      return "bg-green-50 text-green-600 border-green-100";
  if (status === "error")   return "bg-red-50 text-red-500 border-red-100";
  return "bg-amber-50 text-amber-500 border-amber-100";
}

function label(status) {
  if (status === "ok")      return "Operational";
  if (status === "error")   return "Degraded";
  return "Checking...";
}

export default function Status() {
  const [results, setResults] = useState(
    checks.reduce((acc, c) => ({ ...acc, [c.id]: { status: "loading", ms: null, error: null } }), {})
  );
  const [lastChecked, setLastChecked] = useState(null);

  const runChecks = async () => {
    setResults(checks.reduce((acc, c) => ({ ...acc, [c.id]: { status: "loading", ms: null, error: null } }), {}));
    await Promise.all(
      checks.map(async (check) => {
        try {
          const ms = await check.run();
          setResults((prev) => ({ ...prev, [check.id]: { status: "ok", ms, error: null } }));
        } catch (e) {
          setResults((prev) => ({ ...prev, [check.id]: { status: "error", ms: null, error: e.message } }));
        }
      })
    );
    setLastChecked(new Date());
  };

  useEffect(() => {
    runChecks();
    const t = setInterval(runChecks, CHECK_INTERVAL);
    return () => clearInterval(t);
  }, []);

  const allOk    = Object.values(results).every((r) => r.status === "ok");
  const anyError = Object.values(results).some((r) => r.status === "error");
  const loading  = Object.values(results).some((r) => r.status === "loading");

  const overallStatus = loading ? "loading" : anyError ? "error" : "ok";
  const overallMsg = {
    ok:      "All systems operational",
    error:   "One or more services degraded",
    loading: "Running checks...",
  }[overallStatus];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">

      {/* Header */}
      <div className="max-w-xl mx-auto px-6 pt-16 pb-10">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-base italic leading-none">S</span>
          </div>
          <span className="font-black text-base tracking-tight">SynapseX</span>
          <span className="text-slate-300 mx-1">/</span>
          <span className="text-sm font-bold text-slate-400">Status</span>
        </div>

        {/* Overall banner */}
        <div className={`flex items-center gap-3 p-5 rounded-2xl border ${
          overallStatus === "ok"
            ? "bg-green-50 border-green-100"
            : overallStatus === "error"
            ? "bg-red-50 border-red-100"
            : "bg-amber-50 border-amber-100"
        }`}>
          <span className={`w-3 h-3 rounded-full flex-shrink-0 ${dot(overallStatus)}`} />
          <div>
            <p className={`font-black text-sm ${
              overallStatus === "ok" ? "text-green-700"
              : overallStatus === "error" ? "text-red-600"
              : "text-amber-600"
            }`}>{overallMsg}</p>
            {lastChecked && (
              <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-widest font-bold">
                Last checked {lastChecked.toLocaleTimeString()}
              </p>
            )}
          </div>
          <button
            onClick={runChecks}
            disabled={loading}
            className="ml-auto text-[10px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest transition disabled:opacity-30 cursor-pointer"
          >
            {loading ? "Checking..." : "↻ Refresh"}
          </button>
        </div>
      </div>

      {/* Checks */}
      <div className="max-w-xl mx-auto px-6 space-y-3 pb-16">
        <p className="text-[9px] font-black text-slate-300 uppercase tracking-[.2em] mb-4">Services</p>

        {checks.map((check) => {
          const r = results[check.id];
          return (
            <div key={check.id} className="flex items-center justify-between p-5 border border-slate-100 rounded-2xl hover:border-slate-200 transition-all">
              <div className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot(r.status)}`} />
                <div>
                  <p className="text-sm font-bold text-slate-800">{check.label}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{check.sub}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {r.ms && (
                  <span className="text-[10px] font-mono text-slate-400">{r.ms}ms</span>
                )}
                {r.error && (
                  <span className="text-[10px] font-mono text-red-400 max-w-[120px] truncate" title={r.error}>
                    {r.error}
                  </span>
                )}
                <span className={`text-[9px] font-black px-3 py-1 rounded-full border uppercase tracking-widest ${badge(r.status)}`}>
                  {label(r.status)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}