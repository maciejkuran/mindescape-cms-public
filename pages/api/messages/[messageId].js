import connectDb from '@/utils/dbConnect';
import checkIfAuthenticated from '@/utils/checkIfAuthenticated';
import { ObjectId } from 'mongodb';
import checkIfAdminRole from '@/utils/checkIfAdminRole';
import rateLimiterMiddleware from '@/rateLimitedMiddleware';

const rateLimiter = {};

const handler = async (req, res) => {
  //Check rate limit
  const rateLimitOk = rateLimiterMiddleware(req, res, rateLimiter);

  if (!rateLimitOk) return;

  if (req.method !== 'DELETE') {
    res.status(400).json({ message: 'Invalid request method. Accepted method: DELETE' });
    return;
  }

  const isAuthenticated = await checkIfAuthenticated(req, res);
  if (!isAuthenticated) return;

  //Only admin can delete the message
  const isAdmin = await checkIfAdminRole(req, res);
  if (!isAdmin) return;

  let client;

  try {
    client = await connectDb();
  } catch (err) {
    res.status(500).json({ message: 'Connecting to the database failed.' });
    return;
  }

  const database = client.db('mindescape');
  const collection = database.collection('messages');
  const { messageId } = req.query;

  try {
    await collection.deleteOne({ _id: new ObjectId(messageId) });
    res.status(200).json({ message: 'Message has been removed successfully' });
    client.close();
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete the message.' });
    client.close();
  }
};

export default handler;
