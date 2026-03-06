import { useNavigate, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  //{ label: 'Marketplace', path: '/dashboard' },
  //{ label: 'Governance', path: '/agents' },
  { label: 'Docs', path: '/docs' },
  { label: 'Stats', path: '/stats' },
];

export default function NavLinks() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="hidden md:flex items-center gap-8">
      {NAV_ITEMS.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className={`text-sm font-medium transition-colors cursor-pointer ${
              isActive
                ? 'text-cyan-400 border-b-2 border-cyan-400 pb-0.5'
                : 'text-slate-400 hover:text-cyan-400'
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}