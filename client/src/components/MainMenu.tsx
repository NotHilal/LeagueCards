import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function MainMenu() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const menuItems = [
    {
      title: 'Solo',
      description: 'Battle against AI opponents',
      path: '/solo',
      icon: '⚔️',
    },
    {
      title: 'Multiplayer',
      description: 'Challenge other players',
      path: '/multiplayer',
      icon: '🎮',
    },
    {
      title: 'Collection',
      description: 'View your card collection',
      path: '/collection',
      icon: '📖',
    },
    {
      title: 'Shop',
      description: 'Open card packs',
      path: '/shop',
      icon: '🎁',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-lol-dark via-gray-900 to-lol-dark p-8">
      {/* User Info & Logout */}
      <div className="absolute top-8 right-8 flex items-center gap-4">
        <div className="text-right">
          <div className="text-lol-gold font-bold">{user?.username}</div>
          <div className="text-sm text-gray-400">{user?.gold} 💰</div>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-bold transition-colors"
        >
          Logout
        </button>
      </div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16"
      >
        <h1 className="text-7xl font-bold mb-4 bg-gradient-to-r from-lol-gold via-yellow-400 to-lol-gold bg-clip-text text-transparent">
          LEAGUE CARDS
        </h1>
        <p className="text-xl text-gray-400">
          A Yu-Gi-Oh! Style Card Game
        </p>
      </motion.div>

      {/* Menu Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl w-full">
        {menuItems.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
            whileHover={{ scale: 1.05, y: -10 }}
            onClick={() => navigate(item.path)}
            className="cursor-pointer"
          >
            <div className="bg-gradient-to-b from-lol-gray to-lol-dark border-2 border-lol-gold rounded-xl p-8 shadow-2xl hover:shadow-lol-gold/50 transition-all duration-300">
              <div className="text-6xl mb-4 text-center">{item.icon}</div>
              <h2 className="text-3xl font-bold text-lol-gold mb-2 text-center">
                {item.title}
              </h2>
              <p className="text-gray-400 text-center">{item.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="mt-16 text-gray-500 text-sm"
      >
        League of Legends themed card game - Not affiliated with Riot Games
      </motion.div>
    </div>
  );
}
