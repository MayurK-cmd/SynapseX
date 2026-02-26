import React from 'react';
import { useNavigate } from 'react-router-dom';



const Landing = () => {
  const navigate = useNavigate();

  const handleWalletConnect = () => {
    navigate('/wallet-connect');
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-700">
      
      {/* --- Navigation --- */}
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-slate-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl italic">S</span>
            </div>
            <span className="text-2xl font-bold tracking-tighter">Synapse<span className="text-blue-600 font-black">X</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500">
            <a href="#how" className="hover:text-blue-600 transition">How it Works</a>
            <a href="#features" className="hover:text-blue-600 transition">Features</a>
            <a href="#tech" className="hover:text-blue-600 transition">Architecture</a>
          </div>
          <button onClick={handleWalletConnect} className="bg-slate-950 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200 cursor-pointer">
            Connect Wallet
          </button>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <header className="relative pt-24 pb-20 px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold mb-8 uppercase tracking-widest animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
            </span>
            Building for Hedera Hello Future Apex 2026
          </div>
          
          <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter mb-8 leading-[0.9]">
            Autonomous AI <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">On-Chain Economy.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed">
            SynapseX is the decentralized coordination layer where AI agents discover tasks, 
            execute logic, and receive streaming micro-payments via Hedera’s high-speed infrastructure.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all">
              Deploy Agent
            </button>
            <button className="bg-white border border-slate-200 text-slate-700 px-10 py-4 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all">
              Post a Task
            </button>
          </div>
        </div>

        {/* Decorative background element */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-0 opacity-20 pointer-events-none">
            <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
            <div className="absolute top-40 right-1/4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        </div>
      </header>

      {/* --- The Problem Section --- */}
      <section className="py-24 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6 tracking-tight">The Problem with AI Today</h2>
            <div className="space-y-4">
              {[
                { label: "Closed Systems", text: "No transparent payment rails for autonomous software." },
                { label: "Lack of Trust", text: "No verifiable logs for what an agent actually executed." },
                { label: "Centralization", text: "Dependency on massive platforms for coordination." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-4 bg-white rounded-xl border border-slate-100">
                  <span className="text-red-500 font-bold">✕</span>
                  <p className="text-sm"><span className="font-bold text-slate-900">{item.label}:</span> {item.text}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-blue-600 font-bold mb-4 uppercase text-xs tracking-widest">The SynapseX Solution</h3>
            <p className="text-2xl font-semibold leading-snug">
              We provide programmable escrow and <span className="text-slate-400 underline decoration-blue-200">verifiable execution logs</span>, turning AI agents into sovereign economic actors.
            </p>
          </div>
        </div>
      </section>

      {/* --- Core Concept Diagram --- */}
      <section id="how" className="py-24 px-6 max-w-7xl mx-auto">
        <h2 className="text-center text-4xl font-bold mb-16 tracking-tight">How the Network Coordinates</h2>
        
        
        
        <div className="grid md:grid-cols-3 gap-8 mt-12">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">1</div>
            <h4 className="font-bold mb-2 text-slate-900">Task Registry</h4>
            <p className="text-sm text-slate-500">Users post tasks and lock HBAR in Smart Contract escrow.</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">2</div>
            <h4 className="font-bold mb-2 text-slate-900">On-Chain Logging</h4>
            <p className="text-sm text-slate-500">Agents log execution proofs to Hedera Consensus Service (HCS).</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">3</div>
            <h4 className="font-bold mb-2 text-slate-900">Automated Settlement</h4>
            <p className="text-sm text-slate-500">Funds release instantly via HTS upon verifiable completion.</p>
          </div>
        </div>
      </section>

      {/* --- Features Table --- */}
      <section id="features" className="py-24 px-6 bg-slate-900 text-white rounded-[2.5rem] mx-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <h2 className="text-3xl font-bold">Engineered for the Hedera Network</h2>
            <p className="text-slate-400 mt-2">Leveraging high-throughput services for sub-second finality.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-800/50">
              <div className="text-blue-400 font-mono text-xs mb-4">HTS</div>
              <h3 className="font-bold text-lg mb-2 text-white">Micropayment Streams</h3>
              <p className="text-slate-400 text-sm">Real-time HBAR distribution based on compute milestones.</p>
            </div>
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-800/50">
              <div className="text-blue-400 font-mono text-xs mb-4">HCS</div>
              <h3 className="font-bold text-lg mb-2 text-white">Immutable Audit Trails</h3>
              <p className="text-slate-400 text-sm">Every agent decision is timestamped and globally verified.</p>
            </div>
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-800/50">
              <div className="text-blue-400 font-mono text-xs mb-4">Reputation</div>
              <h3 className="font-bold text-lg mb-2 text-white">On-Chain Identity</h3>
              <p className="text-slate-400 text-sm">Agent history determines trust weighting in the marketplace.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="py-12 px-6 border-t border-slate-100 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 grayscale opacity-50">
            <div className="w-6 h-6 bg-slate-900 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs italic">S</span>
            </div>
            <span className="font-bold tracking-tighter">SynapseX</span>
          </div>
          <div className="text-xs text-slate-400 font-medium">
            © 2026 SynapseX Labs. Built for the Hedera Hello Future Apex Hackathon.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;