import connectDb from '@/utils/dbConnect';
import { ObjectId } from 'mongodb';
import rateLimiterMiddleware from '@/rateLimitedMiddleware';

const rateLimiter = {};

const handler = async (req, res) => {
  //Check rate limit
  const rateLimitOk = rateLimiterMiddleware(req, res, rateLimiter);

  if (!rateLimitOk) return;

  if (req.method !== 'POST') {
    res.status(400).json({ message: 'Invalid request method. Accepted method: POST' });
    return;
  }

  //Object that we should receive
  //{commentContent: '', email: '', name: '', date: ''};

  if (!req.body.content && !req.body.email && !req.body.name && !req.body.date) {
    res.status(400).json({
      message:
        'Invalid object body. It must contain the properties: commentContent, email, name, date.',
    });
    return;
  }

  let client;

  try {
    client = await connectDb();
  } catch (error) {
    res.status(500).json({ message: 'Failed to connect with the database.' });
  }

  const database = client.db('mindescape');
  const collection = database.collection('articles');
  const commentData = req.body;
  const { articleId } = req.query;

  //Mongodb update function
  try {
    collection.updateOne(
      { _id: new ObjectId(articleId) },
      { $push: { comments: { ...commentData, _id: new ObjectId() } } }
    );
    res.status(200).json({ message: 'Comment successfully has been added!' });
    client.close();
  } catch (error) {
    res.status(500).json({ message: 'Some problem occured while inserting the comment.' });
    client.close();
  }
};

export default handler;
