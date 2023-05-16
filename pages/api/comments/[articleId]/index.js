import connectDb from '@/utils/dbConnect';
import { ObjectId } from 'mongodb';
import rateLimiterMiddleware from '@/rateLimitedMiddleware';
import { getToken } from 'next-auth/jwt';

const rateLimiter = {};

const handler = async (req, res) => {
  //Check rate limit
  const rateLimitOk = rateLimiterMiddleware(req, res, rateLimiter);

  if (!rateLimitOk) return;

  //Preventing CORS issues.If you try to send a DELETE, PUT, etc.. request , the preflight will send it’s ‘first army’ to check the ‘battle field’. But this army is not the request itself, but an OPTION request. That’s why in our API we need to handle OPTION request.
  if (req.method === 'OPTIONS') {
    return res.status(200).json({
      body: 'OK',
    });
  }

  if (req.method !== 'POST' && req.method !== 'GET') {
    res.status(400).json({ message: 'Invalid request method. Accepted methodS: GET, POST' });
    return;
  }

  if (req.method === 'GET') {
    const { articleId } = req.query;

    let client;

    try {
      client = await connectDb();
    } catch (error) {
      res.status(500).json({ message: 'Failed to connect with the database.' });
      return;
    }

    const database = client.db('mindescape');
    const collection = database.collection('articles');

    let article;
    try {
      article = await collection.findOne({ _id: new ObjectId(articleId) });
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Failed to retreive the article comments from the database.' });
      client.close();
      return;
    }

    //If article doesnt exist
    if (!article) {
      res
        .status(400)
        .json({ message: 'Article with this ID does not exist. Failed to retreive the comments.' });
      client.close();
      return;
    }

    //If no comments property
    if (!article.comments) {
      res.status(200).json({ comments: [], quantity: 0 });
      client.close();
      return;
    }

    //Sort comments by date in a descending order
    const comments = article.comments.sort((a, b) => new Date(b.date) - new Date(a.date));

    //If !authenticated return comments without user email
    const token = await getToken({ req });

    if (!token) {
      const commentsWithNoUserEmail = comments.map(comment => {
        delete comment.email;
        return { ...comment };
      });

      res
        .status(200)
        .json({ comments: commentsWithNoUserEmail, quantity: commentsWithNoUserEmail.length });
      client.close();
      return;
    }

    //Finally if authenticated return full data
    res.status(200).json({ comments, quantity: comments.length });
    client.close();
    return;
  }

  if (req.method === 'POST') {
    //Object that we should receive
    //{content: '', email: '', name: ''};

    const { content, email, name } = req.body;

    if (!content || !email || !name) {
      res.status(400).json({
        message: 'Inputs cannot be empty.',
      });
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      res.status(400).json({
        message: 'Incorrect email address.',
      });
      return;
    }

    let client;

    try {
      client = await connectDb();
    } catch (error) {
      res.status(500).json({ message: 'Failed to connect with the database.' });
      return;
    }

    const database = client.db('mindescape');
    const collection = database.collection('articles');
    const commentData = {
      email: email.trim(),
      name: name.trim(),
      content: content.trim(),
    };
    const { articleId } = req.query;

    //Mongodb update function
    try {
      await collection.updateOne(
        { _id: new ObjectId(articleId) },
        { $push: { comments: { ...commentData, _id: new ObjectId(), date: new Date() } } }
      );
      res.status(200).json({ message: 'Comment successfully has been added!' });
      client.close();
      return;
    } catch (error) {
      res.status(500).json({ message: 'Some problem occured while inserting the comment.' });
      client.close();
      return;
    }
  }
};

export default handler;
