import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Card from './src/models/Card.js';
import Pack from './src/models/Pack.js';
import { cards, packs } from './src/cards.js';

dotenv.config();

async function migrateCards() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Clear existing cards and packs
    await Card.deleteMany({});
    await Pack.deleteMany({});
    console.log('🗑️  Cleared existing cards and packs\n');

    // Migrate cards
    console.log('📦 Migrating cards...');
    const cardDocs = cards.map(card => ({
      cardId: card.id,
      name: card.name,
      type: card.type,
      monsterType: card.monsterType,
      attribute: card.attribute,
      level: card.level,
      attack: card.attack,
      defense: card.defense,
      spellEffect: card.spellEffect,
      trapEffect: card.trapEffect,
      rarity: card.rarity,
      effect: card.effect,
      description: card.description,
      image: card.image,
      enabled: true
    }));

    await Card.insertMany(cardDocs);
    console.log(`✅ Migrated ${cardDocs.length} cards\n`);

    // Migrate packs
    console.log('📦 Migrating packs...');
    const packDocs = packs.map(pack => ({
      packId: pack.id,
      name: pack.name,
      description: pack.description,
      price: pack.price,
      cardCount: pack.cardCount,
      image: pack.image,
      rarityOdds: pack.rarityOdds,
      guaranteedRarity: pack.guaranteedRarity || null,
      enabled: true
    }));

    await Pack.insertMany(packDocs);
    console.log(`✅ Migrated ${packDocs.length} packs\n`);

    // Display summary
    console.log('📊 Migration Summary:');
    const cardsByRarity = await Card.aggregate([
      { $group: { _id: '$rarity', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    console.log('\nCards by Rarity:');
    cardsByRarity.forEach(r => console.log(`  ${r._id}: ${r.count}`));

    console.log('\nPacks:');
    const allPacks = await Pack.find({});
    allPacks.forEach(p => console.log(`  ${p.name}: ${p.price} gold, ${p.cardCount} cards`));

    await mongoose.connection.close();
    console.log('\n✅ Migration complete!');
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

migrateCards();
