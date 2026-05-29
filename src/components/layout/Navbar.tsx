import { Link, NavLink } from 'react-router-dom';
import ChipDeck from './ChipDeck';
import ThemeToggle from './ThemeToggle';

const LOGO_URL = 'https://images.ygoprodeck.com/images/cards_cropped/89631139.jpg';

const navLinks = [
  { to: '/cards', label: 'Carta-Dex' },
  { to: '/decks', label: 'Mazos' },
];

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 px-4 flex items-center justify-between bg-bg/90 backdrop-blur-sm border-b border-primary/10">
      <Link to="/" className="flex items-center gap-3">
        <img
          src={LOGO_URL}
          alt="Blue-Eyes White Dragon"
          className="w-8 h-11 object-cover rounded-sm glow-primary"
          loading="eager"
        />
        <div className="flex flex-col leading-none">
          <span className="font-display text-xl tracking-widest brand-gradient">YGODEX</span>
          <span className="text-[10px] font-body text-muted tracking-widest">CARD DATABASE</span>
        </div>
      </Link>

      <div className="hidden sm:flex items-center gap-6">
        {navLinks.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `font-body text-sm transition-colors duration-200 ${
                isActive ? 'text-primary' : 'text-text-secondary hover:text-text-main'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <ChipDeck />
        <ThemeToggle />
      </div>
    </nav>
  );
}
