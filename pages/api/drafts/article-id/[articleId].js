import connectDb from '@/utils/dbConnect';
import checkIfAuthenticated from '@/utils/checkIfAuthenticated';
import { ObjectId } from 'mongodb';
import { getToken } from 'next-auth/jwt';
import rateLimiterMiddleware from '@/rateLimitedMiddleware';

const rateLimiter = {};

const handler = async (req, res) => {
  //Check rate limit
  const rateLimitOk = rateLimiterMiddleware(req, res, rateLimiter);

  if (!rateLimitOk) return;

  const isAuthenticated = checkIfAuthenticated(req, res);
  if (!isAuthenticated) return;

  const token = await getToken({ req });

  if (req.method !== 'DELETE') {
    res.status(400).json({ message: 'Invalid request method. Accepted method: DELETE' });
    return;
  }

  if (req.method === 'DELETE') {
    const { articleId } = req.query;
    const articleObjId = new ObjectId(articleId);

    let client;

    try {
      client = await connectDb();
    } catch (error) {
      res.status(500).json({ message: 'Failed to connect with the database.' });
    }

    const database = client.db('mindescape');
    const collection = database.collection('drafts');

    //Get draft article data - for checking user permission
    let draft;

    try {
      draft = await collection.find({ _id: articleObjId }).toArray();
    } catch (err) {
      res.status(500).json({ message: 'Failed to validate user permission' });
      client.close();
      return;
    }

    //Check user permission;
    if (token.role === 'editor' && draft[0].authorId !== token._id) {
      res.status(401).json({ message: 'No permission to delete this document.' });
      client.close();
      return;
    }

    try {
      await collection.deleteOne({ _id: articleObjId });
      res.status(200).json({ message: 'Draft article is successfully deleted.' });
      client.close();
    } catch (error) {
      res.status(500).json({ message: 'Failed to remove the item.' });
      client.close();
    }
  }
};

export default handler;
