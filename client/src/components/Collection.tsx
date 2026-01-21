import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Card from './Card';
import { useAuth } from '../context/AuthContext';

interface GameCard {
  id: string;
  cardId?: string;
  name: string;
  type: 'MONSTER' | 'SPELL' | 'TRAP';
  attack?: number;
  defense?: number;
  level?: number;
  description: string;
  attribute?: string;
  effect?: string;
  spellEffect?: string;
  trapEffect?: string;
  rarity?: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  count?: number;
}

type SortOption = 'name' | 'rarity' | 'type' | 'attack' | 'defense' | 'level' | 'count';
type SortDirection = 'asc' | 'desc';

const RARITY_ORDER = { COMMON: 1, RARE: 2, EPIC: 3, LEGENDARY: 4 };
const TYPE_ORDER = { MONSTER: 1, SPELL: 2, TRAP: 3 };

export default function Collection() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [cards, setCards] = useState<GameCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<GameCard | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'MONSTER' | 'SPELL' | 'TRAP'>('ALL');
  const [rarityFilter, setRarityFilter] = useState<'ALL' | 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'>('ALL');
  const [attributeFilter, setAttributeFilter] = useState<string>('ALL');

  // Sorting
  const [sortBy, setSortBy] = useState<SortOption>('rarity');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // View
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:3001/api/user/collection', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        const mappedCards = data.map((card: any) => ({
          ...card,
          id: card.cardId || card.id
        }));
        setCards(mappedCards);
      })
      .catch((err) => console.error('Failed to fetch collection:', err))
      .finally(() => setLoading(false));
  }, [token]);

  // Get unique attributes from monster cards
  const attributes = useMemo(() => {
    const attrs = new Set(cards.filter(c => c.type === 'MONSTER' && c.attribute).map(c => c.attribute));
    return ['ALL', ...Array.from(attrs)] as string[];
  }, [cards]);

  // Filter and sort cards
  const filteredAndSortedCards = useMemo(() => {
    let result = cards.filter((card) => {
      const searchMatch = searchQuery === '' ||
        card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.description.toLowerCase().includes(searchQuery.toLowerCase());
      const typeMatch = typeFilter === 'ALL' || card.type === typeFilter;
      const rarityMatch = rarityFilter === 'ALL' || card.rarity === rarityFilter;
      const attributeMatch = attributeFilter === 'ALL' || card.attribute === attributeFilter;
      return searchMatch && typeMatch && rarityMatch && attributeMatch;
    });

    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'rarity':
          comparison = (RARITY_ORDER[a.rarity || 'COMMON'] || 0) - (RARITY_ORDER[b.rarity || 'COMMON'] || 0);
          break;
        case 'type':
          comparison = (TYPE_ORDER[a.type] || 0) - (TYPE_ORDER[b.type] || 0);
          break;
        case 'attack':
          comparison = (a.attack || 0) - (b.attack || 0);
          break;
        case 'defense':
          comparison = (a.defense || 0) - (b.defense || 0);
          break;
        case 'level':
          comparison = (a.level || 0) - (b.level || 0);
          break;
        case 'count':
          comparison = (a.count || 1) - (b.count || 1);
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [cards, searchQuery, typeFilter, rarityFilter, attributeFilter, sortBy, sortDirection]);

  // Stats
  const stats = useMemo(() => {
    const totalCards = cards.reduce((sum, c) => sum + (c.count || 1), 0);
    const monsters = cards.filter(c => c.type === 'MONSTER');
    const spells = cards.filter(c => c.type === 'SPELL');
    const traps = cards.filter(c => c.type === 'TRAP');
    return {
      unique: cards.length,
      total: totalCards,
      monsters: monsters.reduce((sum, c) => sum + (c.count || 1), 0),
      spells: spells.reduce((sum, c) => sum + (c.count || 1), 0),
      traps: traps.reduce((sum, c) => sum + (c.count || 1), 0),
      legendaries: cards.filter(c => c.rarity === 'LEGENDARY').length,
      epics: cards.filter(c => c.rarity === 'EPIC').length,
    };
  }, [cards]);

  const getRarityColor = (rarity: string) => {
    const colors: Record<string, string> = {
      COMMON: 'from-gray-400 to-gray-600',
      RARE: 'from-blue-400 to-blue-600',
      EPIC: 'from-purple-400 to-purple-600',
      LEGENDARY: 'from-yellow-400 to-orange-500',
    };
    return colors[rarity] || 'from-gray-400 to-gray-600';
  };

  const getRarityBg = (rarity: string) => {
    const colors: Record<string, string> = {
      COMMON: 'bg-gray-500/20 border-gray-500/50',
      RARE: 'bg-blue-500/20 border-blue-500/50',
      EPIC: 'bg-purple-500/20 border-purple-500/50',
      LEGENDARY: 'bg-yellow-500/20 border-yellow-500/50',
    };
    return colors[rarity] || 'bg-gray-500/20 border-gray-500/50';
  };

  const clearFilters = () => {
    setSearchQuery('');
    setTypeFilter('ALL');
    setRarityFilter('ALL');
    setAttributeFilter('ALL');
  };

  const hasActiveFilters = searchQuery || typeFilter !== 'ALL' || rarityFilter !== 'ALL' || attributeFilter !== 'ALL';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 border-b border-slate-700/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <span className="text-2xl">📚</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">My Collection</h1>
                <p className="text-slate-400 text-sm">{stats.unique} unique cards ({stats.total} total)</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/')}
              className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-medium transition-all flex items-center gap-2"
            >
              <span>←</span> Back
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <div className="w-72 flex-shrink-0">
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-5 sticky top-24">
              {/* Search */}
              <div className="mb-6">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Search</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search cards..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Type Filter */}
              <div className="mb-6">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Card Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['ALL', 'MONSTER', 'SPELL', 'TRAP'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setTypeFilter(type)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        typeFilter === type
                          ? 'bg-amber-500 text-slate-900'
                          : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {type === 'ALL' ? 'All' : type.charAt(0) + type.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rarity Filter */}
              <div className="mb-6">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Rarity</label>
                <div className="space-y-2">
                  {(['ALL', 'LEGENDARY', 'EPIC', 'RARE', 'COMMON'] as const).map((rarity) => (
                    <button
                      key={rarity}
                      onClick={() => setRarityFilter(rarity)}
                      className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                        rarityFilter === rarity
                          ? 'bg-amber-500 text-slate-900'
                          : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {rarity !== 'ALL' && (
                        <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${getRarityColor(rarity)}`}></span>
                      )}
                      {rarity === 'ALL' ? 'All Rarities' : rarity.charAt(0) + rarity.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Attribute Filter (for monsters) */}
              {attributes.length > 1 && (
                <div className="mb-6">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Attribute</label>
                  <select
                    value={attributeFilter}
                    onChange={(e) => setAttributeFilter(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 transition-all"
                  >
                    {attributes.map((attr) => (
                      <option key={attr} value={attr}>
                        {attr === 'ALL' ? 'All Attributes' : attr}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Clear Filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-all"
                >
                  Clear All Filters
                </button>
              )}

              {/* Stats */}
              <div className="mt-6 pt-6 border-t border-slate-700/50">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 block">Collection Stats</label>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Monsters</span>
                    <span className="text-white font-medium">{stats.monsters}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Spells</span>
                    <span className="text-white font-medium">{stats.spells}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Traps</span>
                    <span className="text-white font-medium">{stats.traps}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-slate-700/50">
                    <span className="text-yellow-400">Legendaries</span>
                    <span className="text-yellow-400 font-medium">{stats.legendaries}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-purple-400">Epics</span>
                    <span className="text-purple-400 font-medium">{stats.epics}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-4 mb-6 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <span className="text-slate-400 text-sm">
                  {filteredAndSortedCards.length} {filteredAndSortedCards.length === 1 ? 'card' : 'cards'} found
                </span>
              </div>

              <div className="flex items-center gap-4">
                {/* Sort */}
                <div className="flex items-center gap-2">
                  <label className="text-slate-400 text-sm">Sort by:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="rarity">Rarity</option>
                    <option value="name">Name</option>
                    <option value="type">Type</option>
                    <option value="attack">Attack</option>
                    <option value="defense">Defense</option>
                    <option value="level">Level</option>
                    <option value="count">Count</option>
                  </select>
                  <button
                    onClick={() => setSortDirection(d => d === 'asc' ? 'desc' : 'asc')}
                    className="p-2 bg-slate-700/50 rounded-lg text-slate-300 hover:bg-slate-700 transition-all"
                    title={sortDirection === 'asc' ? 'Ascending' : 'Descending'}
                  >
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </button>
                </div>

                {/* View Toggle */}
                <div className="flex bg-slate-700/50 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      viewMode === 'grid' ? 'bg-amber-500 text-slate-900' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      viewMode === 'list' ? 'bg-amber-500 text-slate-900' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    List
                  </button>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
              </div>
            )}

            {/* Empty State */}
            {!loading && filteredAndSortedCards.length === 0 && (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {hasActiveFilters ? 'No cards match your filters' : 'Your collection is empty'}
                </h3>
                <p className="text-slate-400 mb-4">
                  {hasActiveFilters ? 'Try adjusting your filters' : 'Open some packs to get started!'}
                </p>
                {hasActiveFilters ? (
                  <button
                    onClick={clearFilters}
                    className="px-6 py-3 bg-amber-500 text-slate-900 rounded-lg font-medium hover:bg-amber-400 transition-all"
                  >
                    Clear Filters
                  </button>
                ) : (
                  <button
                    onClick={() => navigate('/shop')}
                    className="px-6 py-3 bg-amber-500 text-slate-900 rounded-lg font-medium hover:bg-amber-400 transition-all"
                  >
                    Go to Shop
                  </button>
                )}
              </div>
            )}

            {/* Grid View */}
            {!loading && viewMode === 'grid' && filteredAndSortedCards.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                <AnimatePresence mode="popLayout">
                  {filteredAndSortedCards.map((card, index) => (
                    <motion.div
                      key={card.id}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ delay: Math.min(index * 0.02, 0.3) }}
                      onClick={() => setSelectedCard(card)}
                      className="cursor-pointer group"
                    >
                      <div className={`relative rounded-xl p-2 border transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl ${getRarityBg(card.rarity || 'COMMON')}`}>
                        <Card card={card} size="small" />
                        {/* Count Badge */}
                        {card.count && card.count > 1 && (
                          <div className="absolute -top-2 -right-2 bg-amber-500 text-slate-900 font-bold text-xs px-2 py-1 rounded-full shadow-lg">
                            x{card.count}
                          </div>
                        )}
                        {/* Rarity Indicator */}
                        <div className={`absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-12 rounded-full bg-gradient-to-r ${getRarityColor(card.rarity || 'COMMON')}`}></div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* List View */}
            {!loading && viewMode === 'list' && filteredAndSortedCards.length > 0 && (
              <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                  {filteredAndSortedCards.map((card, index) => (
                    <motion.div
                      key={card.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: Math.min(index * 0.02, 0.3) }}
                      onClick={() => setSelectedCard(card)}
                      className={`cursor-pointer rounded-xl p-4 border transition-all hover:scale-[1.01] ${getRarityBg(card.rarity || 'COMMON')}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-1 h-12 rounded-full bg-gradient-to-b ${getRarityColor(card.rarity || 'COMMON')}`}></div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{card.name}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${getRarityColor(card.rarity || 'COMMON')} text-white`}>
                              {card.rarity}
                            </span>
                          </div>
                          <div className="text-sm text-slate-400">
                            {card.type} {card.type === 'MONSTER' && `• ${card.attribute} • Lv.${card.level}`}
                          </div>
                        </div>
                        {card.type === 'MONSTER' && (
                          <div className="text-sm">
                            <span className="text-orange-400 font-bold">{card.attack}</span>
                            <span className="text-slate-500"> / </span>
                            <span className="text-blue-400 font-bold">{card.defense}</span>
                          </div>
                        )}
                        {card.count && card.count > 1 && (
                          <div className="bg-amber-500 text-slate-900 font-bold text-sm px-3 py-1 rounded-full">
                            x{card.count}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card Detail Modal */}
      <AnimatePresence>
        {selectedCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedCard(null)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-800 rounded-2xl border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-auto"
            >
              <div className="p-6">
                <div className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className={`rounded-xl p-3 border ${getRarityBg(selectedCard.rarity || 'COMMON')}`}>
                      <Card card={selectedCard} size="large" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <h2 className="text-2xl font-bold text-white">{selectedCard.name}</h2>
                      <button
                        onClick={() => setSelectedCard(null)}
                        className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-all"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedCard.count && (
                        <span className="px-3 py-1 rounded-full bg-amber-500 text-slate-900 font-bold text-sm">
                          Owned: x{selectedCard.count}
                        </span>
                      )}
                      {selectedCard.rarity && (
                        <span className={`px-3 py-1 rounded-full bg-gradient-to-r ${getRarityColor(selectedCard.rarity)} text-white font-bold text-sm`}>
                          {selectedCard.rarity}
                        </span>
                      )}
                      <span className="px-3 py-1 rounded-full bg-slate-700 text-slate-300 text-sm">
                        {selectedCard.type}
                      </span>
                    </div>

                    {selectedCard.type === 'MONSTER' && (
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-slate-900/50 rounded-lg p-3">
                          <div className="text-xs text-slate-500 uppercase">Level</div>
                          <div className="text-amber-400">{'★'.repeat(selectedCard.level || 0)}</div>
                        </div>
                        <div className="bg-slate-900/50 rounded-lg p-3">
                          <div className="text-xs text-slate-500 uppercase">Attribute</div>
                          <div className="text-white font-medium">{selectedCard.attribute}</div>
                        </div>
                        <div className="bg-slate-900/50 rounded-lg p-3">
                          <div className="text-xs text-slate-500 uppercase">Attack</div>
                          <div className="text-orange-400 font-bold text-xl">{selectedCard.attack}</div>
                        </div>
                        <div className="bg-slate-900/50 rounded-lg p-3">
                          <div className="text-xs text-slate-500 uppercase">Defense</div>
                          <div className="text-blue-400 font-bold text-xl">{selectedCard.defense}</div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      <div className="bg-slate-900/50 rounded-lg p-4">
                        <div className="text-xs text-slate-500 uppercase mb-1">Description</div>
                        <div className="text-slate-300">{selectedCard.description}</div>
                      </div>

                      {selectedCard.effect && (
                        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                          <div className="text-xs text-green-400 uppercase mb-1">Effect</div>
                          <div className="text-green-300">{selectedCard.effect}</div>
                        </div>
                      )}

                      {selectedCard.spellEffect && (
                        <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-4">
                          <div className="text-xs text-cyan-400 uppercase mb-1">Spell Effect</div>
                          <div className="text-cyan-300">{selectedCard.spellEffect}</div>
                        </div>
                      )}

                      {selectedCard.trapEffect && (
                        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                          <div className="text-xs text-purple-400 uppercase mb-1">Trap Effect</div>
                          <div className="text-purple-300">{selectedCard.trapEffect}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
