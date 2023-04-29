import connectDb from '@/utils/dbConnect';
import rateLimiterMiddleware from '@/rateLimitedMiddleware';

const rateLimiter = {};

const handler = async (req, res) => {
  //Check rate limit
  const rateLimitOk = rateLimiterMiddleware(req, res, rateLimiter);

  if (!rateLimitOk) return;

  if (req.method !== 'GET') {
    res.status(400).json({ message: 'Invalid request method. Accepted method: GET' });
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

  const { articleTitle } = req.query;
  const formattedArticleTitle = articleTitle.replaceAll('-', ' ');

  try {
    const articles = await collection
      .find({
        title: { $regex: new RegExp(formattedArticleTitle, 'i') },
      })
      .toArray();

    //articles = array can contain multiple article objects as I find using Regex. We can 'find()' among this array the exact article we're searching for on the front-end.

    res.status(200).json({ articles: articles });
    client.close();
  } catch (error) {
    res.status(500).json({ message: 'Failed to retreive the draft data.' });
    client.close();
  }
};

export default handler;
