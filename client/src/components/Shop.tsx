import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PackOpening from './PackOpening';
import { useAuth } from '../context/AuthContext';

interface Pack {
  packId: string;
  name: string;
  description: string;
  price: number;
  cardCount: number;
  image: string;
  rarityOdds: {
    COMMON: number;
    RARE: number;
    EPIC: number;
    LEGENDARY: number;
  };
  guaranteedRarity?: string;
}

export default function Shop() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [packs, setPacks] = useState<Pack[]>([]);
  const [selectedPack, setSelectedPack] = useState<Pack | null>(null);
  const [isOpening, setIsOpening] = useState(false);
  const [pulledCards, setPulledCards] = useState<any[]>([]);
  const [gold, setGold] = useState(0);

  useEffect(() => {
    fetch('http://localhost:3001/api/packs')
      .then((res) => res.json())
      .then((data) => setPacks(data))
      .catch((err) => console.error('Failed to fetch packs:', err));

    // Fetch user's gold
    fetch('http://localhost:3001/api/user/gold', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then((res) => res.json())
      .then((data) => setGold(data.gold))
      .catch((err) => console.error('Failed to fetch gold:', err));
  }, [token]);

  const handleBuyPack = async (pack: Pack) => {
    if (gold < pack.price) {
      alert('Not enough gold!');
      return;
    }

    setSelectedPack(pack);
    setGold(gold - pack.price);

    // Call API to open pack
    try {
      const response = await fetch('http://localhost:3001/api/open-pack', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ packId: pack.packId }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Failed to open pack');
        setGold(gold + pack.price); // Refund the gold
        return;
      }

      const result = await response.json();
      setPulledCards(result.cards);
      setIsOpening(true);
    } catch (err) {
      console.error('Failed to open pack:', err);
      alert('Failed to open pack');
      setGold(gold + pack.price); // Refund the gold
    }
  };

  const handleCloseOpening = () => {
    setIsOpening(false);
    setPulledCards([]);
    setSelectedPack(null);
  };

  const handleAddGold = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/add-gold', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount: 10000 })
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Failed to add gold');
        return;
      }

      const result = await response.json();
      setGold(result.newGold);
      alert(`Successfully added ${result.added} gold!`);
    } catch (err) {
      console.error('Failed to add gold:', err);
      alert('Failed to add gold');
    }
  };

  const getRarityColor = (rarity: string) => {
    const colors: Record<string, string> = {
      COMMON: 'from-gray-400 to-gray-600',
      RARE: 'from-blue-400 to-blue-600',
      EPIC: 'from-purple-400 to-purple-600',
      LEGENDARY: 'from-yellow-400 to-yellow-600',
    };
    return colors[rarity] || 'from-gray-400 to-gray-600';
  };

  const getPackGradient = (packId: string) => {
    const gradients: Record<string, string> = {
      starter_pack: 'from-gray-600 to-gray-800',
      champion_pack: 'from-blue-600 to-purple-800',
      legendary_pack: 'from-yellow-600 to-orange-800',
    };
    return gradients[packId] || 'from-gray-600 to-gray-800';
  };

  if (isOpening && pulledCards.length > 0) {
    return (
      <PackOpening
        cards={pulledCards}
        pack={selectedPack!}
        onClose={handleCloseOpening}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-lol-dark to-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-lol-gold mb-2">Card Packs Shop</h1>
            <p className="text-gray-400">Open packs to collect powerful cards!</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-sm text-gray-400">Your Gold</div>
              <div className="text-3xl font-bold text-lol-gold">{gold} 💰</div>
              <button
                onClick={handleAddGold}
                className="mt-2 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-semibold"
              >
                + Add 10,000 Gold
              </button>
            </div>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg"
            >
              Back to Menu
            </button>
          </div>
        </div>

        {/* Pack Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packs.map((pack, index) => (
            <motion.div
              key={pack.packId}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
              className="relative"
            >
              <div className={`bg-gradient-to-b ${getPackGradient(pack.packId)} rounded-xl p-6 border-2 border-lol-gold shadow-2xl hover:shadow-lol-gold/50 transition-all duration-300 hover:scale-105`}>
                {/* Pack Image/Icon */}
                <div className="mb-4 h-48 flex items-center justify-center bg-black bg-opacity-30 rounded-lg relative overflow-hidden">
                  {pack.image ? (
                    <img
                      src={`http://localhost:3001${pack.image}`}
                      alt={pack.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        if (e.currentTarget.nextSibling) {
                          (e.currentTarget.nextSibling as HTMLElement).style.display = 'flex';
                        }
                      }}
                    />
                  ) : null}
                  <div
                    className="w-full h-full flex items-center justify-center text-8xl"
                    style={{ display: pack.image ? 'none' : 'flex' }}
                  >
                    📦
                  </div>
                </div>

                {/* Pack Info */}
                <h2 className="text-2xl font-bold text-white mb-2">{pack.name}</h2>
                <p className="text-gray-300 text-sm mb-4 h-12">{pack.description}</p>

                {/* Pack Stats */}
                <div className="mb-4 space-y-2 bg-black bg-opacity-30 p-3 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Cards:</span>
                    <span className="text-white font-bold">{pack.cardCount}</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    Drop Rates:
                    <div className="grid grid-cols-2 gap-1 mt-1">
                      {Object.entries(pack.rarityOdds).map(([rarity, odds]) => (
                        odds > 0 && (
                          <div key={rarity} className="flex justify-between">
                            <span className={`bg-gradient-to-r ${getRarityColor(rarity)} bg-clip-text text-transparent font-bold`}>
                              {rarity}
                            </span>
                            <span>{(odds * 100).toFixed(0)}%</span>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                  {pack.guaranteedRarity && (
                    <div className="text-xs text-green-400 font-bold">
                      ✨ Guaranteed {pack.guaranteedRarity}+
                    </div>
                  )}
                </div>

                {/* Buy Button */}
                <button
                  onClick={() => handleBuyPack(pack)}
                  disabled={gold < pack.price}
                  className={`w-full py-3 rounded-lg font-bold text-lg transition-all ${
                    gold < pack.price
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-lol-gold text-lol-dark hover:bg-yellow-500 hover:scale-105'
                  }`}
                >
                  {gold < pack.price ? 'Not Enough Gold' : `Buy - ${pack.price} 💰`}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-lol-gray p-6 rounded-xl border-2 border-gray-700">
          <h3 className="text-2xl font-bold text-lol-gold mb-4">About Rarities</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { rarity: 'COMMON', icon: '⚪', desc: 'Basic cards' },
              { rarity: 'RARE', icon: '🔵', desc: 'Strong cards' },
              { rarity: 'EPIC', icon: '🟣', desc: 'Powerful cards' },
              { rarity: 'LEGENDARY', icon: '🟡', desc: 'Ultimate cards' },
            ].map(({ rarity, icon, desc }) => (
              <div key={rarity} className="bg-lol-dark p-4 rounded-lg text-center">
                <div className="text-3xl mb-2">{icon}</div>
                <div className={`text-lg font-bold bg-gradient-to-r ${getRarityColor(rarity)} bg-clip-text text-transparent`}>
                  {rarity}
                </div>
                <div className="text-sm text-gray-400">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
