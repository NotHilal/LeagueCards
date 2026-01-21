# MongoDB Setup Guide

Your game now requires MongoDB to store user data persistently across platforms!

## 🗄️ What MongoDB Stores

- User accounts (username, email, password)
- Gold balance
- Card collections
- Game statistics
- Decks

## 📥 Installation Steps

### Windows

1. **Download MongoDB**
   - Go to: https://www.mongodb.com/try/download/community
   - Select "Windows" and download the MSI installer
   - Version: Latest Community Server

2. **Install MongoDB**
   - Run the downloaded `.msi` file
   - Choose "Complete" installation
   - **IMPORTANT**: Check "Install MongoDB as a Service"
   - Keep the default data directory: `C:\Program Files\MongoDB\Server\{version}\data`
   - Click "Install"

3. **Verify Installation**
   ```cmd
   mongod --version
   ```
   You should see the MongoDB version

4. **Start MongoDB Service** (if not auto-started)
   ```cmd
   net start MongoDB
   ```

### Alternative: MongoDB Atlas (Cloud - Free)

If you don't want to install locally:

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create a free account
3. Create a free cluster (M0 Sandbox)
4. Get your connection string
5. Update `server/.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/league-cards
   ```

## 🚀 Quick Start (Local MongoDB)

1. **Make sure MongoDB is running**
   ```cmd
   net start MongoDB
   ```

2. **Start your game servers**
   ```cmd
   start.bat
   ```

3. **The game will automatically**:
   - Connect to MongoDB on `mongodb://localhost:27017/league-cards`
   - Create the `league-cards` database
   - Start accepting registrations

## ✅ Verify MongoDB is Running

Open a new terminal and run:
```cmd
mongo
```

Or use MongoDB Compass (GUI tool):
- Download: https://www.mongodb.com/try/download/compass
- Connect to: `mongodb://localhost:27017`
- You should see the `league-cards` database after first user registration

## 🔧 Configuration

Edit `server/.env` to customize:

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/league-cards
JWT_SECRET=your-secret-key-change-this-in-production-12345
JWT_EXPIRE=7d
```

**IMPORTANT**: Change `JWT_SECRET` in production!

## 🐛 Troubleshooting

### "MongoDB connection failed"
- Make sure MongoDB service is running: `net start MongoDB`
- Check if port 27017 is not blocked
- Verify MongoDB is installed: `mongod --version`

### "ECONNREFUSED"
- MongoDB service is not running
- Start it with: `net start MongoDB`

### Can't connect to database
- Check firewall settings
- Ensure MongoDB is installed as a service
- Try restarting the MongoDB service

## 🎮 What's New

With MongoDB, you now have:
- ✅ Persistent user accounts
- ✅ Login/Register system
- ✅ Cloud-synced card collections
- ✅ Gold balance saved across sessions
- ✅ Multi-platform support
- ✅ User statistics tracking

Enjoy your upgraded League Cards experience! 🎉
