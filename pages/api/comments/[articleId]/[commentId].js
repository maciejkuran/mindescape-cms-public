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

  const isAuthenticated = await checkIfAuthenticated(req, res);

  if (!isAuthenticated) return;

  const isAdmin = await checkIfAdminRole(req, res);

  //Only admin can send the request
  if (!isAdmin) return;

  if (req.method !== 'DELETE') {
    res.status(400).json({ message: 'Invalid request method. Accepted method: DELETE' });
    return;
  }

  const { articleId, commentId } = req.query;

  let client;

  try {
    client = await connectDb();
  } catch (error) {
    res.status(500).json({ message: 'Failed to connect with the database.' });
  }

  const database = client.db('mindescape');
  const collection = database.collection('articles');

  //Remove comment from sub-document
  try {
    await collection.updateOne(
      { _id: new ObjectId(articleId) },
      {
        $pull: { comments: { _id: new ObjectId(commentId) } },
      }
    );
    res.status(200).json({ message: 'Comment has been deleted successfully.' });
    client.close();
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete the comment.' });
    client.close();
  }
};

export default handler;
