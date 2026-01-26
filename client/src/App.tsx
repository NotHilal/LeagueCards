import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Auth from './components/Auth';
import MainMenu from './components/MainMenu';
import GameBoard from './components/GameBoard';
import Shop from './components/Shop';
import Multiplayer from './components/Multiplayer';
import CollectionWrapper from './components/CollectionWrapper';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-lol-dark flex items-center justify-center">
        <div className="text-lol-gold text-2xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-lol-dark">
      <Routes>
        <Route path="/" element={<MainMenu />} />
        <Route path="/solo" element={<GameBoard mode="solo" />} />
        <Route path="/multiplayer" element={<Multiplayer />} />
        <Route path="/game/:roomId" element={<GameBoard mode="multiplayer" />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/collection" element={<CollectionWrapper />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
