import RedisClient from '../utils/redis';
import MongoClient from '../utils/db';

class AppController {
    static getStatus(req, res) {
        res.status(200).json({ redis: RedisClient.isAlive(), db: MongoClient.isAlive() });
    }

    static async getStats(req, res) {
        const users = await MongoClient.nbUsers();
        const files = await MongoClient.nbFiles();
        res.status(200).json({ users, files });
    }
}

export default AppController;
