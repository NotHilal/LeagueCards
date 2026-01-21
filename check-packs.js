const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/league-cards')
  .then(async () => {
    console.log('Connected to MongoDB');

    const Pack = mongoose.model('Pack', new mongoose.Schema({}, { strict: false }));
    const packs = await Pack.find({}, { name: 1, packId: 1, image: 1 });

    console.log('\nPacks in database:');
    packs.forEach(pack => {
      console.log(`\nPack ID: ${pack.packId}`);
      console.log(`Name: ${pack.name}`);
      console.log(`Image URL: ${pack.image || '(not set)'}`);
    });

    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
