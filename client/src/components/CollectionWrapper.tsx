import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CardBinder from './CardBinder';
import DeckList from './DeckList';

type TabType = 'binder' | 'decks';

export default function CollectionWrapper() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('binder');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header with tabs */}
      <div className="bg-slate-800/50 border-b border-slate-700/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <span className="text-2xl">{activeTab === 'binder' ? '📚' : '🃏'}</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Collection</h1>
                <p className="text-slate-400 text-sm">
                  {activeTab === 'binder' ? 'Browse your card collection' : 'Manage your decks'}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/')}
              className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-medium transition-all flex items-center gap-2"
            >
              <span>←</span> Back
            </button>
          </div>

          {/* Tab Toggle */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setActiveTab('binder')}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
                activeTab === 'binder'
                  ? 'bg-amber-500 text-slate-900'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span>📚</span> Card Binder
            </button>
            <button
              onClick={() => setActiveTab('decks')}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
                activeTab === 'decks'
                  ? 'bg-amber-500 text-slate-900'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span>🃏</span> Decks
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'binder' ? <CardBinder /> : <DeckList />}
    </div>
  );
}
