import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Card from './src/models/Card.js';

dotenv.config();

async function fixCardImages() {
  try {
    const dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/league-cards';
    console.log('Connecting to:', dbUri);
    await mongoose.connect(dbUri);
    console.log('Connected to MongoDB');
    console.log('Database name:', mongoose.connection.name);
    console.log('Collection:', Card.collection.name);

    // Find all cards with image field
    const cards = await Card.find({ image: { $exists: true, $ne: null, $ne: '' } });

    console.log(`Found ${cards.length} cards with images\n`);

    let updated = 0;
    for (const card of cards) {
      console.log(`Checking ${card.name}: current image = "${card.image}"`);
      // Check if image already has the /images/cards/ prefix
      if (!card.image.startsWith('/images/cards/')) {
        const oldImage = card.image;
        // Add the prefix
        card.image = `/images/cards/${card.image}`;
        const result = await card.save();
        console.log(`✓ Updated ${card.name}: ${oldImage} -> ${result.image}`);
        updated++;
      } else {
        console.log(`○ Skipping ${card.name}: already has correct prefix`);
      }
    }

    console.log(`\n✓ Fixed ${updated} card images`);

    // Verify the changes
    console.log('\nVerifying changes...');
    const garenCard = await Card.findOne({ name: 'Garen' });
    console.log('Garen card image after fix:', garenCard.image);

    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixCardImages();
