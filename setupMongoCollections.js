// setupMongoCollections.js
const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://app618942:9aumT9IDOeoRUnet@cluster0.esqblo4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'; // Change this to your MongoDB URI
const dbName = 'app-1'; // Changed to your actual database name

const collections = [
  'admins',
  'users',
  'receipts',
  'roles',
  'settings',
  'logs',
  'notifications',
  'tasks',
  'files',
];

async function setup() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);

    // Drop all existing collections
    const existing = await db.listCollections().toArray();
    for (const col of existing) {
      await db.collection(col.name).drop();
      console.log(`Dropped collection: ${col.name}`);
    }

    // Create new collections
    for (const col of collections) {
      await db.createCollection(col);
      console.log(`Created collection: ${col}`);
    }

    console.log('Database setup complete!');
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

setup();
