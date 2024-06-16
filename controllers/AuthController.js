// controllers/AuthController.js
import { v4 as uuidv4 } from 'uuid';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';
import crypto from 'crypto';

class AuthController {
  static async getConnect(req, res) {
    console.log('Starting getConnect');
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      console.log('Authorization header missing or invalid');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [email, password] = credentials.split(':');

    const hashedPassword = crypto.createHash('sha1').update(password).digest('hex');
    console.log(`Hashed password for ${email}: ${hashedPassword}`);
    
    try {
      const user = await dbClient.client.db().collection('users').findOne({ email, password: hashedPassword });
      if (!user) {
        console.log('User not found');
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const token = uuidv4();
      await redisClient.set(`auth_${token}`, user._id.toString(), 86400);
      console.log(`Token set for user ${user._id}`);
      return res.status(200).json({ token });
    } catch (error) {
      console.error('Error in getConnect:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getDisconnect(req, res) {
    console.log('Starting getDisconnect');
    const token = req.header('X-Token');
    if (!token) {
      console.log('X-Token header missing');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const userId = await redisClient.get(`auth_${token}`);
      if (!userId) {
        console.log('Token not found in Redis');
        return res.status(401).json({ error: 'Unauthorized' });
      }

      await redisClient.del(`auth_${token}`);
      console.log('Token deleted');
      return res.status(204).send();
    } catch (error) {
      console.error('Error in getDisconnect:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default AuthController;
