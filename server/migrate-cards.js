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

    // Get counts before migration
    const cardsBefore = await Card.countDocuments();
    const packsBefore = await Pack.countDocuments();

    // Migrate cards using upsert (add new, update existing, keep others)
    console.log('📦 Syncing cards...');
    const cardOps = cards.map(card => ({
      updateOne: {
        filter: { cardId: card.id },
        update: {
          $set: {
            cardId: card.id,
            name: card.name,
            type: card.type,
            monsterType: card.monsterType,
            region: card.region,
            level: card.level,
            attack: card.attack,
            defense: card.defense,
            itemEffect: card.itemEffect,
            category: card.category,
            runeEffect: card.runeEffect,
            runePath: card.runePath,
            summonerEffect: card.summonerEffect,
            rarity: card.rarity,
            effect: card.effect,
            description: card.description,
            image: card.image,
            enabled: true
          }
        },
        upsert: true
      }
    }));

    const cardResult = await Card.bulkWrite(cardOps);
    console.log(`✅ Cards: ${cardResult.upsertedCount} added, ${cardResult.modifiedCount} updated\n`);

    // Migrate packs using upsert
    console.log('📦 Syncing packs...');
    const packOps = packs.map(pack => ({
      updateOne: {
        filter: { packId: pack.id },
        update: {
          $set: {
            packId: pack.id,
            name: pack.name,
            description: pack.description,
            price: pack.price,
            cardCount: pack.cardCount,
            image: pack.image,
            rarityOdds: pack.rarityOdds,
            guaranteedRarity: pack.guaranteedRarity || null,
            enabled: true
          }
        },
        upsert: true
      }
    }));

    const packResult = await Pack.bulkWrite(packOps);
    console.log(`✅ Packs: ${packResult.upsertedCount} added, ${packResult.modifiedCount} updated\n`);

    // Display summary
    const cardsAfter = await Card.countDocuments();
    const packsAfter = await Pack.countDocuments();

    console.log('📊 Migration Summary:');
    console.log(`\nCards: ${cardsBefore} → ${cardsAfter} (${cardsAfter - cardsBefore >= 0 ? '+' : ''}${cardsAfter - cardsBefore})`);
    console.log(`Packs: ${packsBefore} → ${packsAfter} (${packsAfter - packsBefore >= 0 ? '+' : ''}${packsAfter - packsBefore})`);

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
