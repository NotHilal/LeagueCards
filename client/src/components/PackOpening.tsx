import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from './Card';

interface PackOpeningProps {
  cards: any[];
  pack: {
    name: string;
    packId: string;
  };
  onClose: () => void;
}

export default function PackOpening({ cards, pack, onClose }: PackOpeningProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(-1);
  const [isRevealing, setIsRevealing] = useState(false);

  const handleStartOpening = () => {
    setIsRevealing(true);
    setCurrentCardIndex(0);
  };

  const handleNextCard = () => {
    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    }
  };

  const handleSkipAll = () => {
    setCurrentCardIndex(cards.length - 1);
  };

  const getRarityColor = (rarity: string) => {
    const colors: Record<string, string> = {
      COMMON: 'from-gray-500 via-gray-400 to-gray-500',
      RARE: 'from-blue-500 via-blue-300 to-blue-500',
      EPIC: 'from-purple-500 via-purple-300 to-purple-500',
      LEGENDARY: 'from-yellow-500 via-yellow-200 to-yellow-500',
    };
    return colors[rarity] || 'from-gray-500 via-gray-400 to-gray-500';
  };

  const getRarityGlow = (rarity: string) => {
    const glows: Record<string, string> = {
      COMMON: 'shadow-gray-400/50',
      RARE: 'shadow-blue-400/80',
      EPIC: 'shadow-purple-400/80',
      LEGENDARY: 'shadow-yellow-400/100',
    };
    return glows[rarity] || 'shadow-gray-400/50';
  };

  // Initial pack display (before opening)
  if (!isRevealing) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, type: 'spring' }}
          className="text-center"
        >
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
            className="text-9xl mb-8"
          >
            📦
          </motion.div>

          <h2 className="text-4xl font-bold text-lol-gold mb-4">{pack.name}</h2>
          <p className="text-xl text-gray-400 mb-8">
            {cards.length} cards waiting to be revealed!
          </p>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStartOpening}
            className="btn-primary text-2xl px-12 py-4"
          >
            Open Pack! ✨
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const currentCard = cards[currentCardIndex];
  const isLastCard = currentCardIndex === cards.length - 1;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 p-8">
      <div className="relative w-full h-full flex flex-col items-center justify-center">
        {/* Progress bar */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-64">
          <div className="text-center text-white mb-2">
            Card {currentCardIndex + 1} of {cards.length}
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <motion.div
              className="bg-lol-gold h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentCardIndex + 1) / cards.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Card reveal animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCardIndex}
            initial={{ rotateY: 90, scale: 0.5, opacity: 0 }}
            animate={{ rotateY: 0, scale: 1, opacity: 1 }}
            exit={{ rotateY: -90, scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            {/* Rarity glow effect */}
            <motion.div
              className={`absolute inset-0 rounded-2xl blur-2xl ${getRarityGlow(currentCard.rarity)}`}
              animate={{
                opacity: [0.5, 1, 0.5],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{
                background: `radial-gradient(circle, ${
                  currentCard.rarity === 'LEGENDARY'
                    ? '#fbbf24'
                    : currentCard.rarity === 'EPIC'
                    ? '#a855f7'
                    : currentCard.rarity === 'RARE'
                    ? '#3b82f6'
                    : '#6b7280'
                } 0%, transparent 70%)`,
              }}
            />

            {/* Card */}
            <div className="relative transform scale-150">
              <Card card={currentCard} size="large" />
            </div>

            {/* Rarity banner */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className={`mt-8 text-center`}
            >
              <div
                className={`inline-block px-8 py-3 rounded-full bg-gradient-to-r ${getRarityColor(
                  currentCard.rarity
                )} text-2xl font-bold text-white shadow-2xl`}
              >
                {currentCard.rarity}
              </div>
            </motion.div>

            {/* Card name */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-4 text-center"
            >
              <div className="text-3xl font-bold text-white">{currentCard.name}</div>
              <div className="text-lg text-gray-400 mt-2">{currentCard.description}</div>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Controls */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4">
          {!isLastCard && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSkipAll}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold"
            >
              Skip All
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={isLastCard ? onClose : handleNextCard}
            className="btn-primary px-8 py-3 text-xl"
          >
            {isLastCard ? 'Collect Cards' : 'Next Card →'}
          </motion.button>
        </div>

        {/* All cards summary (bottom) */}
        <div className="absolute bottom-24 left-0 right-0 flex justify-center gap-2 px-8">
          {cards.map((card, index) => (
            <motion.div
              key={`pack-card-${index}-${card?.id || card?.cardId}`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: index <= currentCardIndex ? 1 : 0.5,
                opacity: index <= currentCardIndex ? 1 : 0.3,
              }}
              className={`w-12 h-16 bg-gradient-to-b ${getRarityColor(
                card.rarity
              )} rounded border-2 ${
                index === currentCardIndex ? 'border-white' : 'border-gray-600'
              } flex items-center justify-center text-2xl`}
            >
              {index <= currentCardIndex ? (
                <span>{card.type === 'MONSTER' ? '⭐' : card.type === 'SPELL' ? '📜' : '⚡'}</span>
              ) : (
                '?'
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
