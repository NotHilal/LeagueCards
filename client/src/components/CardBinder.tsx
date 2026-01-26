import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
  owned?: boolean;
}

type SortOption = 'name' | 'rarity' | 'type' | 'attack' | 'defense' | 'level' | 'count';
type SortDirection = 'asc' | 'desc';
type ViewTab = 'my-collection' | 'all-cards';

const RARITY_ORDER = { COMMON: 1, RARE: 2, EPIC: 3, LEGENDARY: 4 };
const TYPE_ORDER = { MONSTER: 1, ITEM: 2, RUNE: 3, SUMMONER_SPELL: 4 };

export default function CardBinder() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [myCards, setMyCards] = useState<GameCard[]>([]);
  const [allCards, setAllCards] = useState<GameCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<GameCard | null>(null);

  // View Tab
  const [viewTab, setViewTab] = useState<ViewTab>('my-collection');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'MONSTER' | 'ITEM' | 'RUNE' | 'SUMMONER_SPELL'>('ALL');
  const [rarityFilter, setRarityFilter] = useState<'ALL' | 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'>('ALL');
  const [regionFilter, setRegionFilter] = useState<string>('ALL');
  const [ownershipFilter, setOwnershipFilter] = useState<'ALL' | 'OWNED' | 'NOT_OWNED'>('ALL');

  // Sorting
  const [sortBy, setSortBy] = useState<SortOption>('rarity');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // View
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Fetch user's collection
  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:3001/api/user/collection', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        const mappedCards = data.map((card: any) => ({
          ...card,
          id: card.cardId || card.id,
          owned: true
        }));
        setMyCards(mappedCards);
      })
      .catch((err) => console.error('Failed to fetch collection:', err))
      .finally(() => setLoading(false));
  }, [token]);

  // Fetch all available cards
  useEffect(() => {
    fetch('http://localhost:3001/api/cards')
      .then((res) => res.json())
      .then((data) => {
        setAllCards(data.map((card: any) => ({
          ...card,
          id: card.id || card.cardId
        })));
      })
      .catch((err) => console.error('Failed to fetch all cards:', err));
  }, []);

  // Create a set of owned card IDs for quick lookup
  const ownedCardIds = useMemo(() => {
    return new Set(myCards.map(c => c.id));
  }, [myCards]);

  // Get card count from collection
  const getOwnedCount = (cardId: string) => {
    const owned = myCards.find(c => c.id === cardId);
    return owned?.count || 0;
  };

  // Get the cards to display based on view tab
  const displayCards = useMemo(() => {
    if (viewTab === 'my-collection') {
      return myCards;
    } else {
      // All cards with ownership info
      return allCards.map(card => ({
        ...card,
        owned: ownedCardIds.has(card.id),
        count: getOwnedCount(card.id)
      }));
    }
  }, [viewTab, myCards, allCards, ownedCardIds]);

  // Get unique regions from displayed cards
  const regions = useMemo(() => {
    const regs = new Set(displayCards.filter(c => c.type === 'MONSTER' && c.region).map(c => c.region));
    return ['ALL', ...Array.from(regs).sort()] as string[];
  }, [displayCards]);

  // Filter and sort cards
  const filteredAndSortedCards = useMemo(() => {
    let result = displayCards.filter((card) => {
      const searchMatch = searchQuery === '' ||
        card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.description.toLowerCase().includes(searchQuery.toLowerCase());
      const typeMatch = typeFilter === 'ALL' || card.type === typeFilter;
      const rarityMatch = rarityFilter === 'ALL' || card.rarity === rarityFilter;
      const regionMatch = regionFilter === 'ALL' || card.region === regionFilter;
      const ownershipMatch = viewTab === 'my-collection' || ownershipFilter === 'ALL' ||
        (ownershipFilter === 'OWNED' && card.owned) ||
        (ownershipFilter === 'NOT_OWNED' && !card.owned);
      return searchMatch && typeMatch && rarityMatch && regionMatch && ownershipMatch;
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
          comparison = (a.count || 0) - (b.count || 0);
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [displayCards, searchQuery, typeFilter, rarityFilter, regionFilter, ownershipFilter, sortBy, sortDirection, viewTab]);

  // Stats for my collection
  const myStats = useMemo(() => {
    const totalCards = myCards.reduce((sum, c) => sum + (c.count || 1), 0);
    const monsters = myCards.filter(c => c.type === 'MONSTER');
    const items = myCards.filter(c => c.type === 'ITEM');
    const runes = myCards.filter(c => c.type === 'RUNE');
    const summonerSpells = myCards.filter(c => c.type === 'SUMMONER_SPELL');
    return {
      unique: myCards.length,
      total: totalCards,
      monsters: monsters.reduce((sum, c) => sum + (c.count || 1), 0),
      items: items.reduce((sum, c) => sum + (c.count || 1), 0),
      runes: runes.reduce((sum, c) => sum + (c.count || 1), 0),
      summonerSpells: summonerSpells.reduce((sum, c) => sum + (c.count || 1), 0),
      legendaries: myCards.filter(c => c.rarity === 'LEGENDARY').length,
      epics: myCards.filter(c => c.rarity === 'EPIC').length,
    };
  }, [myCards]);

  // Stats for all cards
  const allStats = useMemo(() => {
    const owned = allCards.filter(c => ownedCardIds.has(c.id)).length;
    return {
      total: allCards.length,
      owned: owned,
      missing: allCards.length - owned,
      completion: allCards.length > 0 ? Math.round((owned / allCards.length) * 100) : 0
    };
  }, [allCards, ownedCardIds]);

  const getRarityColor = (rarity: string) => {
    const colors: Record<string, string> = {
      COMMON: 'from-gray-400 to-gray-600',
      RARE: 'from-blue-400 to-blue-600',
      EPIC: 'from-purple-400 to-purple-600',
      LEGENDARY: 'from-yellow-400 to-orange-500',
    };
    return colors[rarity] || 'from-gray-400 to-gray-600';
  };

  const getRarityBg = (rarity: string, owned?: boolean) => {
    if (viewTab === 'all-cards' && owned === false) {
      return 'bg-slate-800/50 border-slate-600/50 opacity-60';
    }
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
    setRegionFilter('ALL');
    setOwnershipFilter('ALL');
  };

  const hasActiveFilters = searchQuery || typeFilter !== 'ALL' || rarityFilter !== 'ALL' || regionFilter !== 'ALL' || ownershipFilter !== 'ALL';

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      {/* Sub-navigation: My Collection / All Cards */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setViewTab('my-collection')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              viewTab === 'my-collection'
                ? 'bg-slate-700 text-white'
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
            }`}
          >
            My Collection ({myStats.unique})
          </button>
          <button
            onClick={() => setViewTab('all-cards')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              viewTab === 'all-cards'
                ? 'bg-slate-700 text-white'
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
            }`}
          >
            All Cards ({allStats.total})
          </button>
        </div>
        <div className="text-slate-400 text-sm">
          {viewTab === 'my-collection'
            ? `${myStats.total} total cards`
            : `${allStats.completion}% complete (${allStats.owned}/${allStats.total})`
          }
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Filters */}
        <div className="w-72 flex-shrink-0">
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-5 sticky top-28">
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

              {/* Ownership Filter (only in All Cards view) */}
              {viewTab === 'all-cards' && (
                <div className="mb-6">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Ownership</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['ALL', 'OWNED', 'NOT_OWNED'] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => setOwnershipFilter(status)}
                        className={`px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                          ownershipFilter === status
                            ? 'bg-amber-500 text-slate-900'
                            : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {status === 'ALL' ? 'All' : status === 'OWNED' ? 'Owned' : 'Missing'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Type Filter */}
              <div className="mb-6">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Card Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['ALL', 'MONSTER', 'ITEM', 'RUNE', 'SUMMONER_SPELL'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setTypeFilter(type)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        typeFilter === type
                          ? 'bg-amber-500 text-slate-900'
                          : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {type === 'ALL' ? 'All' : type === 'SUMMONER_SPELL' ? 'Summoner' : type.charAt(0) + type.slice(1).toLowerCase()}
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

              {/* Region Filter (for monsters) */}
              {regions.length > 1 && (
                <div className="mb-6">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Region</label>
                  <select
                    value={regionFilter}
                    onChange={(e) => setRegionFilter(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 transition-all"
                  >
                    {regions.map((region) => (
                      <option key={region} value={region}>
                        {region === 'ALL' ? 'All Regions' : region?.replace('_', ' ')}
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
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 block">
                  {viewTab === 'my-collection' ? 'Collection Stats' : 'Completion Stats'}
                </label>
                {viewTab === 'my-collection' ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Monsters</span>
                      <span className="text-white font-medium">{myStats.monsters}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Items</span>
                      <span className="text-white font-medium">{myStats.items}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Runes</span>
                      <span className="text-white font-medium">{myStats.runes}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Summoner Spells</span>
                      <span className="text-white font-medium">{myStats.summonerSpells}</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-slate-700/50">
                      <span className="text-yellow-400">Legendaries</span>
                      <span className="text-yellow-400 font-medium">{myStats.legendaries}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-purple-400">Epics</span>
                      <span className="text-purple-400 font-medium">{myStats.epics}</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Total Cards</span>
                      <span className="text-white font-medium">{allStats.total}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-green-400">Owned</span>
                      <span className="text-green-400 font-medium">{allStats.owned}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-red-400">Missing</span>
                      <span className="text-red-400 font-medium">{allStats.missing}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-700/50">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-400">Completion</span>
                        <span className="text-amber-400 font-medium">{allStats.completion}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-amber-500 to-amber-400 h-2 rounded-full transition-all"
                          style={{ width: `${allStats.completion}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
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
                    {viewTab === 'my-collection' && <option value="count">Count</option>}
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
                  {hasActiveFilters ? 'No cards match your filters' : 'No cards found'}
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
                      <div className={`relative rounded-xl p-2 border transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl ${getRarityBg(card.rarity || 'COMMON', card.owned)}`}>
                        <Card card={card} size="small" />
                        {/* Ownership Badge */}
                        {viewTab === 'all-cards' && (
                          <div className={`absolute -top-2 -left-2 px-2 py-1 rounded-full text-xs font-bold shadow-lg ${
                            card.owned
                              ? 'bg-green-500 text-white'
                              : 'bg-slate-600 text-slate-300'
                          }`}>
                            {card.owned ? (card.count && card.count > 1 ? `x${card.count}` : '✓') : '✗'}
                          </div>
                        )}
                        {/* Count Badge (My Collection) */}
                        {viewTab === 'my-collection' && card.count && card.count > 1 && (
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
                      className={`cursor-pointer rounded-xl p-4 border transition-all hover:scale-[1.01] ${getRarityBg(card.rarity || 'COMMON', card.owned)}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-1 h-12 rounded-full bg-gradient-to-b ${getRarityColor(card.rarity || 'COMMON')}`}></div>
                        {/* Ownership indicator */}
                        {viewTab === 'all-cards' && (
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            card.owned
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-slate-600/20 text-slate-500'
                          }`}>
                            {card.owned ? '✓' : '✗'}
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{card.name}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${getRarityColor(card.rarity || 'COMMON')} text-white`}>
                              {card.rarity}
                            </span>
                          </div>
                          <div className="text-sm text-slate-400">
                            {card.type} {card.type === 'MONSTER' && `• ${card.region?.replace('_', ' ')} • Lv.${card.level}`}
                          </div>
                        </div>
                        {card.type === 'MONSTER' && (
                          <div className="text-sm">
                            <span className="text-orange-400 font-bold">{card.attack}</span>
                            <span className="text-slate-500"> / </span>
                            <span className="text-blue-400 font-bold">{card.defense}</span>
                          </div>
                        )}
                        {card.count && card.count > 0 && (
                          <div className={`font-bold text-sm px-3 py-1 rounded-full ${
                            viewTab === 'all-cards' && card.owned
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-amber-500 text-slate-900'
                          }`}>
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
                    <div className={`rounded-xl p-3 border ${getRarityBg(selectedCard.rarity || 'COMMON', selectedCard.owned)}`}>
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
                      {/* Ownership Status */}
                      {viewTab === 'all-cards' && (
                        <span className={`px-3 py-1 rounded-full font-bold text-sm ${
                          selectedCard.owned
                            ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                            : 'bg-red-500/20 text-red-400 border border-red-500/50'
                        }`}>
                          {selectedCard.owned ? 'Owned' : 'Not Owned'}
                        </span>
                      )}
                      {selectedCard.count && selectedCard.count > 0 && (
                        <span className="px-3 py-1 rounded-full bg-amber-500 text-slate-900 font-bold text-sm">
                          x{selectedCard.count}
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
                          <div className="text-xs text-slate-500 uppercase">Region</div>
                          <div className="text-white font-medium">{selectedCard.region?.replace('_', ' ')}</div>
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

                      {selectedCard.itemEffect && (
                        <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-4">
                          <div className="text-xs text-cyan-400 uppercase mb-1">Item Effect</div>
                          <div className="text-cyan-300">{selectedCard.itemEffect}</div>
                        </div>
                      )}

                      {selectedCard.runeEffect && (
                        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                          <div className="text-xs text-purple-400 uppercase mb-1">Rune Effect ({selectedCard.runePath})</div>
                          <div className="text-purple-300">{selectedCard.runeEffect}</div>
                        </div>
                      )}

                      {selectedCard.summonerEffect && (
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                          <div className="text-xs text-blue-400 uppercase mb-1">Summoner Spell Effect</div>
                          <div className="text-blue-300">{selectedCard.summonerEffect}</div>
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
