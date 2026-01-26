import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from './Card';
import { useAuth } from '../context/AuthContext';

interface GameCard {
  id: string;
  cardId?: string;
  name: string;
  type: 'MONSTER' | 'ITEM' | 'RUNE' | 'SUMMONER_SPELL';
  attack?: number;
  defense?: number;
  level?: number;
  description: string;
  region?: string;
  effect?: string;
  itemEffect?: string;
  runeEffect?: string;
  summonerEffect?: string;
  category?: string;
  runePath?: string;
  rarity?: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  count?: number;
}

interface Deck {
  _id: string;
  name: string;
  cards: string[];
  runes?: string[];
  createdAt: string;
}

interface DeckBuilderProps {
  deck: Deck | null;
  onClose: () => void;
  onSave: () => void;
}

const DECK_SIZE = 30;
const RUNE_DECK_SIZE = 5;

const CARD_COPY_LIMITS: Record<string, number> = {
  MONSTER: 3,      // Champions: max 3 copies
  ITEM: 3,         // Items: max 3 copies
  SUMMONER_SPELL: 2 // Summoner Spells: max 2 copies
};

type BuilderTab = 'cards' | 'runes';

const RUNE_PATH_INFO: Record<string, { color: string; icon: string; gradient: string }> = {
  PRECISION: { color: '#C8AA6E', icon: '⚔', gradient: 'from-yellow-500/20 to-yellow-600/10' },
  DOMINATION: { color: '#DC3545', icon: '💀', gradient: 'from-red-500/20 to-red-600/10' },
  SORCERY: { color: '#6366F1', icon: '✨', gradient: 'from-blue-500/20 to-blue-600/10' },
  RESOLVE: { color: '#22C55E', icon: '🛡', gradient: 'from-green-500/20 to-green-600/10' },
  INSPIRATION: { color: '#A855F7', icon: '💡', gradient: 'from-purple-500/20 to-purple-600/10' },
};

const RARITY_STYLES: Record<string, { border: string; glow: string; bg: string }> = {
  COMMON: { border: 'border-slate-500/30', glow: '', bg: 'bg-slate-500/5' },
  RARE: { border: 'border-blue-500/50', glow: 'shadow-blue-500/20', bg: 'bg-blue-500/5' },
  EPIC: { border: 'border-purple-500/50', glow: 'shadow-purple-500/20', bg: 'bg-purple-500/5' },
  LEGENDARY: { border: 'border-amber-400/50', glow: 'shadow-amber-400/30', bg: 'bg-amber-500/5' },
};

export default function DeckBuilder({ deck, onClose, onSave }: DeckBuilderProps) {
  const { token } = useAuth();
  const [deckName, setDeckName] = useState(deck?.name || '');
  const [deckCards, setDeckCards] = useState<string[]>(deck?.cards || []);
  const [deckRunes, setDeckRunes] = useState<string[]>(deck?.runes || []);
  const [collection, setCollection] = useState<GameCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<GameCard | null>(null);

  const [activeTab, setActiveTab] = useState<BuilderTab>('cards');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [runePathFilter, setRunePathFilter] = useState<string>('ALL');

  useEffect(() => {
    const fetchCollection = async () => {
      try {
        setLoading(true);
        const res = await fetch('http://localhost:3001/api/user/collection', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch collection');
        const data = await res.json();
        setCollection(data.map((card: any) => ({ ...card, id: card.cardId || card.id })));
      } catch (err) {
        setError('Failed to load collection');
      } finally {
        setLoading(false);
      }
    };
    fetchCollection();
  }, [token]);

  const cardCollection = useMemo(() => collection.filter(c => c.type !== 'RUNE'), [collection]);
  const runeCollection = useMemo(() => collection.filter(c => c.type === 'RUNE'), [collection]);
  const runePaths = useMemo(() => ['ALL', ...new Set(runeCollection.map(r => r.runePath).filter(Boolean))], [runeCollection]);

  const filteredCards = useMemo(() => {
    return cardCollection.filter(card => {
      const searchMatch = !searchQuery || card.name.toLowerCase().includes(searchQuery.toLowerCase());
      const typeMatch = typeFilter === 'ALL' || card.type === typeFilter;
      return searchMatch && typeMatch;
    });
  }, [cardCollection, searchQuery, typeFilter]);

  const filteredRunes = useMemo(() => {
    return runeCollection.filter(rune => {
      const searchMatch = !searchQuery || rune.name.toLowerCase().includes(searchQuery.toLowerCase());
      const pathMatch = runePathFilter === 'ALL' || rune.runePath === runePathFilter;
      return searchMatch && pathMatch;
    });
  }, [runeCollection, searchQuery, runePathFilter]);

  const getCardCountInDeck = (cardId: string) => deckCards.filter(id => id === cardId).length;
  const getMaxCopies = (card: GameCard) => CARD_COPY_LIMITS[card.type] ?? (card.count || 1);
  const getAvailableCount = (card: GameCard) => Math.min(card.count || 1, getMaxCopies(card)) - getCardCountInDeck(card.id);

  const addCard = (cardId: string) => {
    if (deckCards.length >= DECK_SIZE) return;
    const card = cardCollection.find(c => c.id === cardId);
    if (!card) return;
    const inDeck = getCardCountInDeck(cardId);
    const maxAllowed = getMaxCopies(card);
    if (inDeck >= maxAllowed || inDeck >= (card.count || 1)) return;
    setDeckCards([...deckCards, cardId]);
  };

  const removeCard = (cardId: string) => {
    const index = deckCards.lastIndexOf(cardId);
    if (index > -1) setDeckCards(deckCards.filter((_, i) => i !== index));
  };

  const toggleRune = (runeId: string) => {
    if (deckRunes.includes(runeId)) {
      setDeckRunes(deckRunes.filter(id => id !== runeId));
    } else if (deckRunes.length < RUNE_DECK_SIZE) {
      setDeckRunes([...deckRunes, runeId]);
    }
  };

  const deckCardsWithData = useMemo(() => {
    const counts = new Map<string, number>();
    deckCards.forEach(id => counts.set(id, (counts.get(id) || 0) + 1));
    return Array.from(counts.entries())
      .map(([id, count]) => ({ card: cardCollection.find(c => c.id === id)!, count }))
      .filter(d => d.card)
      .sort((a, b) => {
        const order = { MONSTER: 1, ITEM: 2, SUMMONER_SPELL: 3 };
        return (order[a.card.type as keyof typeof order] || 4) - (order[b.card.type as keyof typeof order] || 4);
      });
  }, [deckCards, cardCollection]);

  const deckRunesWithData = useMemo(() => {
    return deckRunes.map(id => runeCollection.find(r => r.id === id)).filter(Boolean) as GameCard[];
  }, [deckRunes, runeCollection]);

  const handleSave = async () => {
    if (!deckName.trim()) return setError('Please enter a deck name');
    try {
      setSaving(true);
      const res = await fetch(deck ? `http://localhost:3001/api/user/decks/${deck._id}` : 'http://localhost:3001/api/user/decks', {
        method: deck ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: deckName.trim(), cards: deckCards, runes: deckRunes })
      });
      if (!res.ok) throw new Error();
      onSave();
    } catch {
      setError('Failed to save deck');
    } finally {
      setSaving(false);
    }
  };

  const getRarityStyle = (rarity?: string) => RARITY_STYLES[rarity || 'COMMON'] || RARITY_STYLES.COMMON;
  const getPathInfo = (path?: string) => RUNE_PATH_INFO[path || ''] || { color: '#A855F7', icon: '◆', gradient: 'from-purple-500/20 to-purple-600/10' };

  const cardsProgress = (deckCards.length / DECK_SIZE) * 100;
  const runesProgress = (deckRunes.length / RUNE_DECK_SIZE) * 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-50 flex flex-col"
    >
      {/* Header */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-900/50 border-b border-slate-700/50">
        <div className="px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div>
              <input
                type="text"
                placeholder="Enter deck name..."
                value={deckName}
                onChange={(e) => setDeckName(e.target.value)}
                className="bg-transparent text-2xl font-bold text-white placeholder-slate-500 focus:outline-none border-b-2 border-transparent focus:border-amber-500 transition-colors w-64"
              />
              <p className="text-slate-500 text-sm mt-1">{deck ? 'Editing deck' : 'Creating new deck'}</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Progress Circles */}
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="relative w-14 h-14">
                  <svg className="w-14 h-14 -rotate-90">
                    <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="none" className="text-slate-700" />
                    <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="none"
                      className={deckCards.length === DECK_SIZE ? 'text-green-500' : 'text-amber-500'}
                      strokeDasharray={`${cardsProgress * 1.51} 151`} strokeLinecap="round" />
                  </svg>
                  <span className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${deckCards.length === DECK_SIZE ? 'text-green-400' : 'text-white'}`}>
                    {deckCards.length}
                  </span>
                </div>
                <span className="text-xs text-slate-400 mt-1">Cards</span>
              </div>
              <div className="text-center">
                <div className="relative w-14 h-14">
                  <svg className="w-14 h-14 -rotate-90">
                    <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="none" className="text-slate-700" />
                    <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="none"
                      className={deckRunes.length === RUNE_DECK_SIZE ? 'text-purple-500' : 'text-purple-500/50'}
                      strokeDasharray={`${runesProgress * 1.51} 151`} strokeLinecap="round" />
                  </svg>
                  <span className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${deckRunes.length === RUNE_DECK_SIZE ? 'text-purple-400' : 'text-white'}`}>
                    {deckRunes.length}
                  </span>
                </div>
                <span className="text-xs text-slate-400 mt-1">Runes</span>
              </div>
            </div>

            <div className="h-10 w-px bg-slate-700" />

            <button
              onClick={handleSave}
              disabled={saving || !deckName.trim()}
              className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:from-slate-700 disabled:to-slate-700 text-white disabled:text-slate-500 font-bold rounded-xl transition-all shadow-lg shadow-amber-500/25 disabled:shadow-none"
            >
              {saving ? 'Saving...' : 'Save Deck'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-8 flex gap-1">
          {[
            { id: 'cards' as const, label: 'Battle Cards', count: `${deckCards.length}/${DECK_SIZE}`, color: 'amber' },
            { id: 'runes' as const, label: 'Rune Deck', count: `${deckRunes.length}/${RUNE_DECK_SIZE}`, color: 'purple' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSearchQuery(''); }}
              className={`px-6 py-3 rounded-t-xl font-medium transition-all flex items-center gap-3 ${
                activeTab === tab.id
                  ? `bg-slate-800 text-white`
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === tab.id
                  ? tab.color === 'amber' ? 'bg-amber-500/20 text-amber-400' : 'bg-purple-500/20 text-purple-400'
                  : 'bg-slate-700 text-slate-400'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mx-8 mt-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3">
          <span className="text-red-400">Error:</span>
          <span className="text-red-300">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300">Dismiss</button>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {activeTab === 'cards' ? (
          <>
            {/* Card Pool */}
            <div className="w-3/5 flex flex-col bg-slate-900/50">
              <div className="p-6 border-b border-slate-800">
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Search cards..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 pl-11 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20"
                    />
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <div className="flex gap-2">
                    {['ALL', 'MONSTER', 'ITEM', 'SUMMONER_SPELL'].map(type => (
                      <button
                        key={type}
                        onClick={() => setTypeFilter(type)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                          typeFilter === type
                            ? 'bg-amber-500 text-slate-900'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {type === 'ALL' ? 'All' : type === 'SUMMONER_SPELL' ? 'Spell' : type.charAt(0) + type.slice(1).toLowerCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-auto p-6">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="grid grid-cols-5 2xl:grid-cols-6 gap-4">
                    {filteredCards.map(card => {
                      const available = getAvailableCount(card);
                      const inDeck = getCardCountInDeck(card.id);
                      const maxCopies = getMaxCopies(card);
                      const atLimit = inDeck >= maxCopies;
                      const style = getRarityStyle(card.rarity);
                      return (
                        <motion.div
                          key={card.id}
                          whileHover={{ scale: available > 0 ? 1.05 : 1, y: available > 0 ? -4 : 0 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => addCard(card.id)}
                          onMouseEnter={() => setHoveredCard(card)}
                          onMouseLeave={() => setHoveredCard(null)}
                          className={`relative cursor-pointer ${available <= 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
                        >
                          <div className={`rounded-xl overflow-hidden border-2 ${style.border} ${available > 0 ? `shadow-lg ${style.glow}` : ''} ${style.bg}`}>
                            <Card card={card} size="small" />
                          </div>
                          {(inDeck > 0 || atLimit) && (
                            <div className="absolute -top-2 -right-2 flex gap-1">
                              {inDeck > 0 && (
                                <span className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-lg ${atLimit ? 'bg-red-500 text-white' : 'bg-amber-500 text-slate-900'}`}>
                                  {inDeck}
                                </span>
                              )}
                            </div>
                          )}
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${atLimit ? 'bg-red-500/90 text-white' : 'bg-slate-900/90 text-slate-400'}`}>
                              {inDeck}/{maxCopies}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Deck Panel */}
            <div className="w-2/5 flex flex-col bg-slate-800/30 border-l border-slate-700/50">
              <div className="p-6 border-b border-slate-700/50">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Your Deck</h2>
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl font-bold ${deckCards.length === DECK_SIZE ? 'text-green-400' : 'text-white'}`}>
                      {deckCards.length}
                    </span>
                    <span className="text-slate-500">/ {DECK_SIZE}</span>
                  </div>
                </div>
                <div className="mt-3 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${deckCards.length === DECK_SIZE ? 'bg-green-500' : 'bg-gradient-to-r from-amber-500 to-orange-500'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${cardsProgress}%` }}
                  />
                </div>
              </div>

              <div className="flex-1 overflow-auto p-4">
                <AnimatePresence mode="popLayout">
                  {deckCardsWithData.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500">
                      <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <p className="text-lg">No cards added</p>
                      <p className="text-sm">Click cards to add them to your deck</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {deckCardsWithData.map(({ card, count }) => (
                        <motion.div
                          key={card.id}
                          layout
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          onClick={() => removeCard(card.id)}
                          className="flex items-center gap-3 p-2 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 cursor-pointer group border border-transparent hover:border-red-500/30 transition-all"
                        >
                          <div className={`w-10 h-14 rounded-lg overflow-hidden border ${getRarityStyle(card.rarity).border} flex-shrink-0`}>
                            <Card card={card} size="small" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium truncate">{card.name}</p>
                            <p className="text-slate-500 text-xs">{card.type}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-amber-400 font-bold">x{count}</span>
                            <span className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-xl">−</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </AnimatePresence>
              </div>

              {/* Stats */}
              <div className="p-4 border-t border-slate-700/50 bg-slate-900/50">
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Monsters', count: deckCardsWithData.filter(d => d.card.type === 'MONSTER').reduce((s, d) => s + d.count, 0), color: 'text-orange-400' },
                    { label: 'Items', count: deckCardsWithData.filter(d => d.card.type === 'ITEM').reduce((s, d) => s + d.count, 0), color: 'text-green-400' },
                    { label: 'Spells', count: deckCardsWithData.filter(d => d.card.type === 'SUMMONER_SPELL').reduce((s, d) => s + d.count, 0), color: 'text-blue-400' },
                  ].map(stat => (
                    <div key={stat.label} className="text-center">
                      <p className={`text-2xl font-bold ${stat.color}`}>{stat.count}</p>
                      <p className="text-xs text-slate-500">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Rune Pool */}
            <div className="w-3/5 flex flex-col bg-gradient-to-br from-purple-950/30 to-slate-900/50">
              <div className="p-6 border-b border-purple-500/20">
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Search runes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-800/50 border border-purple-500/30 rounded-xl px-4 py-3 pl-11 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
                    />
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <div className="flex gap-2">
                    {runePaths.map(path => {
                      const info = getPathInfo(path);
                      return (
                        <button
                          key={path}
                          onClick={() => setRunePathFilter(path)}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                            runePathFilter === path
                              ? 'bg-purple-500 text-white'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {path !== 'ALL' && <span>{info.icon}</span>}
                          {path === 'ALL' ? 'All' : path.charAt(0) + path.slice(1).toLowerCase()}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-auto p-6">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : filteredRunes.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500">
                    <span className="text-6xl mb-4">◆</span>
                    <p className="text-lg">No runes found</p>
                    <p className="text-sm">Open packs to collect runes</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 2xl:grid-cols-4 gap-6">
                    {filteredRunes.map(rune => {
                      const isSelected = deckRunes.includes(rune.id);
                      const canSelect = deckRunes.length < RUNE_DECK_SIZE || isSelected;
                      const pathInfo = getPathInfo(rune.runePath);
                      const style = getRarityStyle(rune.rarity);
                      return (
                        <motion.div
                          key={rune.id}
                          whileHover={{ scale: canSelect ? 1.03 : 1 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => canSelect && toggleRune(rune.id)}
                          className={`relative cursor-pointer ${!canSelect ? 'opacity-40 cursor-not-allowed' : ''}`}
                        >
                          <div className={`rounded-2xl p-4 border-2 transition-all ${
                            isSelected
                              ? 'border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/30'
                              : `${style.border} bg-gradient-to-br ${pathInfo.gradient} hover:border-purple-500/50`
                          }`}>
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-2xl" style={{ color: pathInfo.color }}>{pathInfo.icon}</span>
                              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{rune.runePath}</span>
                            </div>
                            <div className={`rounded-xl overflow-hidden border ${style.border} mb-3`}>
                              <Card card={rune} size="small" />
                            </div>
                            <h3 className="text-white font-bold truncate">{rune.name}</h3>
                            <p className="text-slate-400 text-xs mt-1 line-clamp-2">{rune.runeEffect}</p>

                            {isSelected && (
                              <div className="absolute -top-3 -right-3 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-purple-500/50">
                                {deckRunes.indexOf(rune.id) + 1}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Rune Deck Panel */}
            <div className="w-2/5 flex flex-col bg-gradient-to-b from-purple-900/20 to-slate-900/50 border-l border-purple-500/20">
              <div className="p-6 border-b border-purple-500/20">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Rune Deck</h2>
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl font-bold ${deckRunes.length === RUNE_DECK_SIZE ? 'text-purple-400' : 'text-white'}`}>
                      {deckRunes.length}
                    </span>
                    <span className="text-slate-500">/ {RUNE_DECK_SIZE}</span>
                  </div>
                </div>
                <div className="mt-3 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${runesProgress}%` }}
                  />
                </div>
              </div>

              <div className="flex-1 overflow-auto p-6">
                <div className="space-y-4">
                  {[0, 1, 2, 3, 4].map(index => {
                    const rune = deckRunesWithData[index];
                    const pathInfo = rune ? getPathInfo(rune.runePath) : null;
                    return (
                      <motion.div
                        key={index}
                        layout
                        className={`rounded-2xl border-2 border-dashed transition-all ${
                          rune
                            ? 'border-purple-500/50 bg-purple-500/10 border-solid'
                            : 'border-slate-700 bg-slate-800/30'
                        }`}
                      >
                        {rune ? (
                          <div
                            onClick={() => toggleRune(rune.id)}
                            className="p-4 flex items-center gap-4 cursor-pointer hover:bg-purple-500/20 transition-colors group"
                          >
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span style={{ color: pathInfo?.color }}>{pathInfo?.icon}</span>
                                <h3 className="text-white font-bold truncate">{rune.name}</h3>
                              </div>
                              <p className="text-purple-300/70 text-xs mt-0.5 truncate">{rune.runeEffect}</p>
                            </div>
                            <span className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-2xl">×</span>
                          </div>
                        ) : (
                          <div className="p-4 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-700/50 flex items-center justify-center text-slate-500 font-bold text-lg">
                              {index + 1}
                            </div>
                            <span className="text-slate-500">Empty rune slot</span>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Rune Info */}
              <div className="p-6 border-t border-purple-500/20 bg-slate-900/50">
                <div className="rounded-xl bg-purple-500/10 border border-purple-500/20 p-4">
                  <h3 className="text-purple-300 font-semibold flex items-center gap-2 mb-2">
                    <span>◆</span> How Runes Work
                  </h3>
                  <ul className="text-purple-200/60 text-sm space-y-1">
                    <li>• Activate once per duel during your turn</li>
                    <li>• Effects last for 3 turns</li>
                    <li>• Choose wisely based on your strategy</li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Card Preview Tooltip */}
      <AnimatePresence>
        {hoveredCard && activeTab === 'cards' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-8 left-8 bg-slate-900 border border-slate-700 rounded-2xl p-4 shadow-2xl max-w-xs z-50"
          >
            <h3 className="text-white font-bold text-lg">{hoveredCard.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-slate-400 text-xs uppercase">{hoveredCard.type} • {hoveredCard.rarity}</span>
              <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                hoveredCard.type === 'MONSTER' ? 'text-orange-400 bg-orange-500/20' :
                hoveredCard.type === 'SUMMONER_SPELL' ? 'text-blue-400 bg-blue-500/20' :
                'text-green-400 bg-green-500/20'
              }`}>
                Max {CARD_COPY_LIMITS[hoveredCard.type] ?? 1}/deck
              </span>
            </div>
            <p className="text-slate-300 text-sm mt-2">{hoveredCard.description}</p>
            {hoveredCard.effect && <p className="text-amber-400 text-sm mt-2 italic">{hoveredCard.effect}</p>}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
