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

  const isAuthenticated = await checkIfAuthenticated(req, res);
  const token = await getToken({ req }); //user data object

  if (!isAuthenticated) return;

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
    const collection = database.collection('articles');

    //Getting article data before deleting it
    let article;
    try {
      article = await collection.find({ _id: articleObjId }).toArray();
    } catch (error) {
      res.status(500).json({ message: 'Failed to validate user permission.' });
      client.close();
      return;
    }

    //Checking for permission to delete
    if (token.role === 'editor' && article[0].authorId !== token._id) {
      res
        .status(401)
        .json({ message: 'Protected resource. Only administrators can delete this item.' });
      client.close();
      return;
    }

    try {
      await collection.deleteOne({ _id: articleObjId });
      res.status(200).json({ message: 'Article has been successfully deleted.' });
      client.close();
    } catch (error) {
      res.status(500).json({ message: 'Failed to remove the item.' });
      client.close();
    }
  }
};

export default handler;
