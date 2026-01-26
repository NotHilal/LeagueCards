import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import DeckBuilder from './DeckBuilder';

interface Deck {
  _id: string;
  name: string;
  cards: string[];
  runes?: string[];
  createdAt: string;
}

export default function DeckList() {
  const { token } = useAuth();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deckBuilderOpen, setDeckBuilderOpen] = useState(false);
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Fetch decks
  const fetchDecks = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3001/api/user/decks', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch decks');
      const data = await res.json();
      setDecks(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch decks:', err);
      setError('Failed to load decks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDecks();
  }, [token]);

  // Delete deck
  const handleDelete = async (deckId: string) => {
    try {
      const res = await fetch(`http://localhost:3001/api/user/decks/${deckId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete deck');
      setDecks(decks.filter(d => d._id !== deckId));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Failed to delete deck:', err);
    }
  };

  // Open deck builder for new deck
  const handleCreateNew = () => {
    setEditingDeck(null);
    setDeckBuilderOpen(true);
  };

  // Open deck builder for editing
  const handleEdit = (deck: Deck) => {
    setEditingDeck(deck);
    setDeckBuilderOpen(true);
  };

  // Handle deck builder save
  const handleDeckSaved = () => {
    setDeckBuilderOpen(false);
    setEditingDeck(null);
    fetchDecks();
  };

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get deck status based on card and rune count
  const getDeckStatus = (cardCount: number, runeCount: number) => {
    const cardsComplete = cardCount === 30;
    const runesComplete = runeCount === 5;

    if (cardsComplete && runesComplete) {
      return { color: 'text-green-400', bg: 'bg-green-500/20', label: 'Ready' };
    }
    if (cardsComplete || runesComplete) {
      return { color: 'text-yellow-400', bg: 'bg-yellow-500/20', label: 'Almost Ready' };
    }
    if (cardCount >= 20) {
      return { color: 'text-yellow-400', bg: 'bg-yellow-500/20', label: 'In Progress' };
    }
    return { color: 'text-red-400', bg: 'bg-red-500/20', label: 'Incomplete' };
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">My Decks</h2>
          <p className="text-slate-400 text-sm">{decks.length} deck{decks.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={handleCreateNew}
          className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900 font-bold rounded-lg transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2"
        >
          <span className="text-lg">+</span> Create New Deck
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">!</div>
          <h3 className="text-xl font-bold text-red-400 mb-2">{error}</h3>
          <button
            onClick={fetchDecks}
            className="px-6 py-3 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-600 transition-all"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && decks.length === 0 && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🃏</div>
          <h3 className="text-xl font-bold text-white mb-2">No Decks Yet</h3>
          <p className="text-slate-400 mb-6">Create your first deck to start battling!</p>
          <button
            onClick={handleCreateNew}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 rounded-lg font-bold hover:from-amber-400 hover:to-amber-500 transition-all"
          >
            Create Your First Deck
          </button>
        </div>
      )}

      {/* Deck Grid */}
      {!loading && !error && decks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {decks.map((deck, index) => {
              const runeCount = deck.runes?.length || 0;
              const status = getDeckStatus(deck.cards.length, runeCount);
              return (
                <motion.div
                  key={deck._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden hover:border-slate-600/50 transition-all group"
                >
                  {/* Deck Header */}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-bold text-white truncate flex-1 mr-2">{deck.name}</h3>
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${status.bg} ${status.color}`}>
                        {status.label}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-sm">Cards:</span>
                        <span className={`font-bold ${deck.cards.length === 30 ? 'text-green-400' : deck.cards.length >= 20 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {deck.cards.length}/30
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-purple-400 text-sm">Runes:</span>
                        <span className={`font-bold ${runeCount === 5 ? 'text-purple-400' : 'text-slate-400'}`}>
                          {runeCount}/5
                        </span>
                      </div>
                    </div>

                    {/* Progress Bars */}
                    <div className="space-y-2 mb-4">
                      {/* Cards Progress */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 w-12">Cards</span>
                        <div className="flex-1 bg-slate-700 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-all ${
                              deck.cards.length === 30 ? 'bg-green-500' : deck.cards.length >= 20 ? 'bg-yellow-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${Math.min((deck.cards.length / 30) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                      {/* Runes Progress */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 w-12">Runes</span>
                        <div className="flex-1 bg-slate-700 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-all bg-purple-500`}
                            style={{ width: `${(runeCount / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Created Date */}
                    <p className="text-slate-500 text-xs">
                      Created {formatDate(deck.createdAt)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex border-t border-slate-700/50">
                    <button
                      onClick={() => handleEdit(deck)}
                      className="flex-1 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all font-medium text-sm"
                    >
                      Edit
                    </button>
                    <div className="w-px bg-slate-700/50" />
                    {deleteConfirm === deck._id ? (
                      <>
                        <button
                          onClick={() => handleDelete(deck._id)}
                          className="flex-1 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all font-medium text-sm"
                        >
                          Confirm
                        </button>
                        <div className="w-px bg-slate-700/50" />
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="flex-1 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all font-medium text-sm"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(deck._id)}
                        className="flex-1 px-4 py-3 text-slate-300 hover:text-red-400 hover:bg-red-500/10 transition-all font-medium text-sm"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Deck Builder Modal */}
      <AnimatePresence>
        {deckBuilderOpen && (
          <DeckBuilder
            deck={editingDeck}
            onClose={() => {
              setDeckBuilderOpen(false);
              setEditingDeck(null);
            }}
            onSave={handleDeckSaved}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
