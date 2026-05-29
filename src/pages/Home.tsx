import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const LOGO_URL = 'https://images.ygoprodeck.com/images/cards/89631139.jpg';

export default function Home() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) navigate(`/cards?fname=${encodeURIComponent(query.trim())}`);
  }

  return (
    <div className="relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #8060ff, transparent 70%)' }} />

      <section className="relative flex flex-col items-center justify-center min-h-[80vh] px-4 text-center gap-8">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center gap-4"
        >
          <img
            src={LOGO_URL}
            alt="Blue-Eyes White Dragon"
            className="w-24 h-32 object-cover rounded-lg glow-primary"
          />
          <h1 className="font-display text-5xl md:text-7xl tracking-widest brand-gradient">YGODEX</h1>
          <p className="font-body text-base text-text-secondary max-w-md">
            Base de datos completa de cartas Yu-Gi-Oh + Deck Builder integrado
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          onSubmit={handleSearch}
          className="w-full max-w-lg flex gap-2"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar carta... (ej: Blue-Eyes, Dark Magician)"
            className="flex-1 px-4 py-3 rounded-lg bg-surface border border-primary/20 text-text-main font-body text-sm placeholder-muted focus:outline-none focus:border-primary/60 transition-colors duration-200"
          />
          <button
            type="submit"
            className="px-6 py-3 rounded-lg bg-primary hover:bg-primary2 text-white font-display text-sm tracking-wider transition-colors duration-200 cursor-pointer"
          >
            Buscar
          </button>
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex gap-4"
        >
          <Link
            to="/cards"
            className="px-6 py-2.5 rounded-lg border border-primary/30 hover:border-primary/60 font-body text-sm text-text-secondary hover:text-text-main transition-colors duration-200"
          >
            Ver Carta-Dex
          </Link>
          <Link
            to="/decks"
            className="px-6 py-2.5 rounded-lg border border-primary2/30 hover:border-primary2/60 font-body text-sm text-text-secondary hover:text-text-main transition-colors duration-200"
          >
            Mis Mazos
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
