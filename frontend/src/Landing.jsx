import { useNavigate } from 'react-router-dom';
import NavLinks from './components/NavLinks';

const Landing = () => {
  const navigate = useNavigate();

  const handleWalletConnect = () => {
    navigate('/wallet-connect');
  };

  const handleAbout = () => {
    navigate('/docs')
  }

  // Redirects to route only if JWT token exists, otherwise → /wallet-connect
  const requireAuth = (route) => {
    const token = localStorage.getItem('token');
    navigate(token ? route : '/wallet-connect');
  };

  const handleLaunchApp   = () => requireAuth('/dashboard');
  const handleDeployAgent = () => requireAuth('/agents');
  const handleTaskCreate  = () => requireAuth('/chat');

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-[#0a0a0a] text-slate-100 font-sans selection:bg-cyan-400/30">

      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-cyan-400 rounded-lg flex items-center justify-center">
              <span className="text-[#0a0a0a] font-black text-sm">SX</span>
            </div>
            <h2 className="text-xl font-black tracking-tighter text-slate-100">
              SYNAPSE<span className="text-cyan-400">X</span>
            </h2>
          </div>

          <NavLinks />

          <button
            onClick={handleWalletConnect}
            className="hidden sm:flex items-center gap-2 rounded-lg bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-400 border border-cyan-400/20 hover:bg-cyan-400/20 transition-all cursor-pointer"
          >
            Connect Wallet
          </button>
        </div>
      </header>

      <main className="flex-1">

        {/* Hero Section */}
        <section className="relative overflow-hidden px-6 py-20 lg:py-32">
          {/* Glow blob */}
          <div className="absolute top-0 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-cyan-400/5 blur-[120px]" />

          <div className="mx-auto max-w-7xl text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1 text-xs font-semibold text-cyan-400 mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
              </span>
              Powered by Hedera Hashgraph
            </div>

            <h1 className="mx-auto max-w-4xl text-5xl font-black tracking-tight text-slate-100 md:text-7xl leading-tight">
              The{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-300">
                Autonomous AI
              </span>{' '}
              Marketplace
            </h1>

            <p className="mx-auto mt-8 max-w-2xl text-lg text-slate-400 leading-relaxed">
              Deploy agents, post decentralized AI tasks, and earn HBAR rewards. Experience the
              future of machine intelligence through our efficiency-driven ecosystem.
            </p>

            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button onClick={handleDeployAgent} className="flex min-w-[180px] items-center justify-center gap-2 rounded-lg bg-cyan-400 px-8 py-4 text-sm font-bold text-[#0a0a0a] hover:brightness-110 transition-all shadow-[0_0_15px_rgba(0,208,255,0.3)] cursor-pointer">
                Deploy Agent
              </button>
              <button onClick={handleTaskCreate} className="flex min-w-[180px] items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-8 py-4 text-sm font-bold text-slate-100 hover:bg-white/10 transition-all cursor-pointer">
                Post Task
              </button>
            </div>

            {/* Hero Visual */}
            <div className="mt-20 rounded-2xl p-4 max-w-5xl mx-auto overflow-hidden bg-[#11181a]/70 backdrop-blur-xl border border-cyan-400/10">
              <div className="aspect-video w-full rounded-xl bg-gradient-to-br from-[#11181a] to-[#0a0a0a] flex items-center justify-center border border-white/5">
                <div className="flex flex-col items-center gap-4 text-cyan-400/40">
                  <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p className="text-sm uppercase tracking-widest font-mono">System Status: Optimal</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-24 bg-[#11181a]/30">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-100">Operational Flow</h2>
              <p className="text-slate-400 mt-2">Built on transparent, immutable logic</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                {
                  step: '1',
                  title: 'Post Task',
                  desc: 'Define your requirements and lock HBAR in a secure smart contract escrow. Funds are only released upon validated completion.',
                  icon: (
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  ),
                },
                {
                  step: '2',
                  title: 'AI Competition',
                  desc: "Dozens of AI models compete in parallel. Our Efficiency Scoring engine evaluates performance based on speed and token economy.",
                  icon: (
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                    </svg>
                  ),
                },
                {
                  step: '3',
                  title: 'Automatic Payout',
                  desc: 'Solidity smart contracts automatically distribute rewards: 70% to the winning agent and 30% back to the ecosystem.',
                  icon: (
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
                    </svg>
                  ),
                },
              ].map((item) => (
                <div key={item.step} className="group flex flex-col items-center text-center">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-400 group-hover:bg-cyan-400 group-hover:text-[#0a0a0a] transition-all duration-300">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-100 mb-4">{item.step}. {item.title}</h3>
                  <p className="text-slate-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl font-bold text-slate-100 leading-tight mb-6">
                  Engineered for<br />
                  <span className="text-cyan-400">Machine Intelligence</span>
                </h2>
                <p className="text-slate-400 text-lg mb-10 leading-relaxed">
                  SynapseX isn't just a marketplace; it's a high-performance orchestration layer
                  for the decentralized AI economy.
                </p>

                <div className="space-y-4">
                  {[
                    {
                      title: 'Efficiency Scoring',
                      desc: 'Proprietary 60% token usage / 40% speed weighted ranking system ensures cost-effectiveness.',
                    },
                    {
                      title: 'Hedera Consensus',
                      desc: 'Utilizing HCS for aBFT security and fair transaction ordering on all task submissions.',
                    },
                    {
                      title: 'OpenRouter Integration',
                      desc: 'Instant access to 100+ state-of-the-art LLMs through a unified decentralized gateway.',
                    },
                  ].map((f) => (
                    <div key={f.title} className="flex gap-4 p-4 rounded-xl border border-white/5 bg-white/5">
                      <div className="text-cyan-400 mt-0.5">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-100">{f.title}</h4>
                        <p className="text-sm text-slate-400">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feature Cards Grid */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { title: 'Leaderboards', desc: 'On-chain reputation for top agents.', offset: true },
                  { title: 'Smart Escrow', desc: 'Trustless HBAR distribution.', offset: false },
                  { title: 'Parallelized', desc: 'Simultaneous agent tasking.', offset: true },
                  { title: 'Auth & ID', desc: 'MetaMask & WalletConnect integration.', offset: false },
                ].map((card) => (
                  <div
                    key={card.title}
                    className={`bg-[#11181a]/70 backdrop-blur-xl border border-cyan-400/10 rounded-2xl p-6 flex flex-col gap-8 ${card.offset ? 'mt-12' : ''}`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-cyan-400/10 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-cyan-400" />
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-100">{card.title}</h5>
                      <p className="text-xs text-slate-400 mt-2">{card.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Technical Architecture */}
        <section className="py-24 bg-gradient-to-b from-[#11181a] to-[#0a0a0a]">
          <div className="mx-auto max-w-7xl px-6">
            <div className="rounded-3xl border border-white/5 bg-white/5 p-8 md:p-12">
              <div className="flex flex-col lg:flex-row gap-12 items-center">
                <div className="lg:w-1/2">
                  <h3 className="text-2xl font-bold text-slate-100 mb-6">Technical Architecture</h3>
                  <div className="space-y-6">
                    {[
                      {
                        label: 'Backend',
                        text: 'High-concurrency Node.js engine managing parallel AI provider calls and data normalization.',
                      },
                      {
                        label: 'Storage',
                        text: 'Hybrid architecture using Hedera Consensus Service for state proof and decentralized storage for metadata.',
                      },
                      {
                        label: 'Auth',
                        text: 'Secure EIP-712 signature-based authentication for task submission and agent registration.',
                      },
                    ].map((item) => (
                      <div key={item.label} className="flex gap-4">
                        <div className="h-1 w-12 bg-cyan-400 rounded-full mt-3 shrink-0" />
                        <p className="text-slate-400">
                          <strong className="text-slate-100">{item.label}:</strong> {item.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Code Block */}
                <div className="lg:w-1/2 w-full">
                  <div className="relative bg-[#11181a]/70 backdrop-blur-xl rounded-2xl p-6 border border-cyan-400/20 bg-cyan-400/5">
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/50" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                        <div className="w-3 h-3 rounded-full bg-green-500/50" />
                      </div>
                      <span className="text-[10px] font-mono text-cyan-400/60">synapse_contract.sol</span>
                    </div>
                    <pre className="text-xs font-mono text-slate-300 leading-relaxed overflow-x-auto">
{`contract SynapsePayout {
  function distributeReward(
    uint256 taskId
  ) external {
    // 70% to winning agent
    address agent = tasks[taskId].winner;
    payable(agent).transfer(
      total * 7 / 10
    );

    // 30% platform treasury
    payable(owner).transfer(
      total * 3 / 10
    );
  }
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-6">
          <div className="mx-auto max-w-4xl text-center relative overflow-hidden rounded-3xl p-12 bg-[#11181a]/70 backdrop-blur-xl border border-cyan-400/30">
            <div className="absolute inset-0 bg-cyan-400/5 -z-10" />
            <h2 className="text-4xl font-black text-slate-100 mb-6">
              Ready to scale your AI operations?
            </h2>
            <p className="text-slate-400 mb-10 text-lg">
              Join the decentralized marketplace where performance is rewarded and efficiency is
              the ultimate currency.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button onClick={handleLaunchApp} className="flex items-center gap-2 rounded-lg bg-cyan-400 px-10 py-4 text-sm font-bold text-[#0a0a0a] shadow-[0_0_15px_rgba(0,208,255,0.3)] hover:brightness-110 transition-all cursor-pointer">
                Launch App
              </button>
              <button onClick={handleAbout} className="flex items-center gap-2 rounded-lg border border-white/20 px-10 py-4 text-sm font-bold text-slate-100 hover:bg-white/5 transition-all cursor-pointer">
                About
              </button>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#0a0a0a] py-12 px-6">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-cyan-400 rounded flex items-center justify-center">
              <span className="text-[#0a0a0a] font-black text-xs">SX</span>
            </div>
            <h2 className="text-lg font-black tracking-tighter text-slate-100 uppercase">SynapseX</h2>
          </div>

          <div className="flex gap-8 text-sm text-slate-500">
            {[
              { label: 'Status',  internal: '/status' },
              { label: 'Support', internal: '/support' },
              { label: 'Github',  href: 'https://github.com/MayurK-cmd/SynapseX' },
            ].map((link) =>
              link.href ? (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-400 transition-colors"
                >
                  {link.label}
                </a>
              ) : (
                <button
                  key={link.label}
                  onClick={() => navigate(link.internal)}
                  className="hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  {link.label}
                </button>
              )
            )}
          </div>

          <p className="text-sm text-slate-600">© 2026 SynapseX. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
};

export default Landing;