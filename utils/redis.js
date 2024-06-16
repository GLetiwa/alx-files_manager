import { createClient } from 'redis';
import { promisify } from 'util';

class RedisClient {
  constructor() {
    this.client = createClient();

    this.client.on('error', (err) => {
      console.error('Redis error:', err);
    });

    this.client.on('connect', () => {
      console.log('Redis client connected');
    });

    // Promisify Redis commands
    this.getAsync = promisify(this.client.get).bind(this.client);
    this.setAsync = promisify(this.client.set).bind(this.client);
    this.delAsync = promisify(this.client.del).bind(this.client);
  }

  async connect() {
    if (!this.client.isOpen) {
      await this.client.connect();
    }
  }

  async isAlive() {
    await this.connect();
    return this.client.isOpen;
  }

  async get(key) {
    await this.connect();
    return this.getAsync(key);
  }

  async set(key, value, duration) {
    await this.connect();
    await this.setAsync(key, value, 'EX', duration);
  }

  async del(key) {
    await this.connect();
    return this.delAsync(key);
  }
}

const redisClient = new RedisClient();
export default redisClient;
