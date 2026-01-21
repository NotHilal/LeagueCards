import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { motion } from 'framer-motion';

interface Room {
  id: string;
  host: string;
  players: Array<{ id: string; name: string }>;
  maxPlayers: number;
  status: 'waiting' | 'playing' | 'finished';
}

export default function Multiplayer() {
  const navigate = useNavigate();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [username, setUsername] = useState('');
  const [joined, setJoined] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);

  useEffect(() => {
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server');
    });

    newSocket.on('joined', ({ playerId, username }) => {
      console.log('Joined as:', username);
      setJoined(true);
    });

    newSocket.on('rooms_list', (roomsList: Room[]) => {
      setRooms(roomsList);
    });

    newSocket.on('room_created', ({ room }) => {
      setCurrentRoom(room);
    });

    newSocket.on('player_joined', ({ room }) => {
      setCurrentRoom(room);
    });

    newSocket.on('game_start', (gameState) => {
      navigate(`/game/${currentRoom?.id}`);
    });

    newSocket.on('error', ({ message }) => {
      alert(message);
    });

    return () => {
      newSocket.close();
    };
  }, [navigate, currentRoom?.id]);

  const handleJoin = () => {
    if (username.trim() && socket) {
      socket.emit('join', username);
      socket.emit('get_rooms');
    }
  };

  const handleCreateRoom = () => {
    if (socket) {
      socket.emit('create_room');
    }
  };

  const handleJoinRoom = (roomId: string) => {
    if (socket) {
      socket.emit('join_room', roomId);
    }
  };

  const handleLeaveRoom = () => {
    setCurrentRoom(null);
    if (socket) {
      socket.emit('get_rooms');
    }
  };

  if (!joined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-lol-dark to-gray-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-lol-gray p-8 rounded-xl border-2 border-lol-gold shadow-2xl max-w-md w-full"
        >
          <h2 className="text-3xl font-bold text-lol-gold mb-6 text-center">
            Enter Your Summoner Name
          </h2>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
            placeholder="Summoner Name"
            className="w-full px-4 py-3 bg-lol-dark text-white border-2 border-lol-gold rounded-lg mb-4 focus:outline-none focus:border-yellow-400"
          />
          <button onClick={handleJoin} className="btn-primary w-full">
            Join Multiplayer
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
          >
            Back to Menu
          </button>
        </motion.div>
      </div>
    );
  }

  if (currentRoom) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-lol-dark to-gray-900 p-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-lol-gray p-8 rounded-xl border-2 border-lol-gold shadow-2xl max-w-2xl w-full"
        >
          <h2 className="text-3xl font-bold text-lol-gold mb-6">Game Lobby</h2>

          <div className="bg-lol-dark p-4 rounded-lg mb-6">
            <div className="text-sm text-gray-400 mb-2">Room ID: {currentRoom.id}</div>
            <div className="text-lg mb-4">
              Players: {currentRoom.players.length} / {currentRoom.maxPlayers}
            </div>

            <div className="space-y-2">
              {currentRoom.players.map((player, index) => (
                <div
                  key={player.id}
                  className="bg-gray-800 p-3 rounded-lg flex items-center justify-between"
                >
                  <span className="font-bold">{player.name}</span>
                  {index === 0 && (
                    <span className="text-lol-gold text-sm">👑 Host</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {currentRoom.players.length < currentRoom.maxPlayers ? (
            <div className="text-center text-gray-400 mb-6">
              Waiting for opponent to join...
            </div>
          ) : (
            <div className="text-center text-green-400 mb-6 font-bold">
              Starting game...
            </div>
          )}

          <button
            onClick={handleLeaveRoom}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg"
          >
            Leave Room
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-lol-dark to-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-lol-gold">Multiplayer Lobby</h1>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
          >
            Back to Menu
          </button>
        </div>

        <div className="mb-8">
          <button onClick={handleCreateRoom} className="btn-primary">
            Create New Room
          </button>
          <button
            onClick={() => socket?.emit('get_rooms')}
            className="ml-4 px-6 py-3 bg-lol-blue hover:bg-cyan-600 rounded-lg font-bold"
          >
            Refresh Rooms
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.length === 0 ? (
            <div className="col-span-full text-center text-gray-400 py-12">
              No rooms available. Create one to get started!
            </div>
          ) : (
            rooms.map((room) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-lol-gray p-6 rounded-xl border-2 border-gray-700 hover:border-lol-gold transition-colors"
              >
                <div className="mb-4">
                  <div className="text-sm text-gray-400 mb-2">
                    Room by {room.players[0]?.name}
                  </div>
                  <div className="text-lg font-bold">
                    {room.players.length} / {room.maxPlayers} Players
                  </div>
                </div>

                <button
                  onClick={() => handleJoinRoom(room.id)}
                  disabled={room.players.length >= room.maxPlayers}
                  className={`w-full py-2 rounded-lg font-bold ${
                    room.players.length >= room.maxPlayers
                      ? 'bg-gray-700 cursor-not-allowed'
                      : 'bg-lol-gold text-lol-dark hover:bg-yellow-500'
                  }`}
                >
                  {room.players.length >= room.maxPlayers ? 'Full' : 'Join Room'}
                </button>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
