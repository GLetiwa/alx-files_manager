// utils/db.js

const mongoose = require('mongoose');

const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = process.env.DB_PORT || 27017;
const dbName = process.env.DB_DATABASE || 'files_manager';

class DBClient {
  constructor() {
    const uri = `mongodb://${dbHost}:${dbPort}/${dbName}`;
    this.client = mongoose.createConnection(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    this.client.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
  }

  isAlive() {
    return this.client.readyState === 1;
  }

  async nbUsers() {
    try {
      const usersCollection = this.client.collection('users');
      return await usersCollection.countDocuments();
    } catch (err) {
      console.error('Error counting users:', err);
      return 0;
    }
  }

  async nbFiles() {
    try {
      const filesCollection = this.client.collection('files');
      return await filesCollection.countDocuments();
    } catch (err) {
      console.error('Error counting files:', err);
      return 0;
    }
  }
}

const dbClient = new DBClient();
module.exports = dbClient;
