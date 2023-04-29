import connectDb from '@/utils/dbConnect';
import rateLimiterMiddleware from '@/rateLimitedMiddleware';

//Retreiving all articles based on authorId - API

const rateLimiter = {};

const handler = async (req, res) => {
  //Check rate limit
  const rateLimitOk = rateLimiterMiddleware(req, res, rateLimiter);

  if (!rateLimitOk) return;

  if (req.method !== 'GET') {
    res.status(400).json({ message: 'Invalid request method. Only GET method is accepted.' });
    return;
  }

  const { authorId } = req.query;
  let client;
  try {
    client = await connectDb();
  } catch (error) {
    res.status(500).json({ message: 'Connecting to the database failed.' });
    return;
  }

  const db = client.db('mindescape');
  const collection = db.collection('articles');

  try {
    const filteredArticles = await collection.find({ authorId: authorId }).toArray();
    res.status(200).json({ quantity: filteredArticles.length, articles: filteredArticles });
    client.close();
  } catch (error) {
    res.status(500).json({ message: 'Problems with retreiving data from the database.' });
    client.close();
  }
};

export default handler;
