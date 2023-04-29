import connectDb from '@/utils/dbConnect';
import { getToken } from 'next-auth/jwt';
import checkIfAuthenticated from '@/utils/checkIfAuthenticated';
import rateLimiterMiddleware from '@/rateLimitedMiddleware';

const rateLimiter = {};

const handler = async (req, res) => {
  //Check rate limit
  const rateLimitOk = rateLimiterMiddleware(req, res, rateLimiter);

  if (!rateLimitOk) return;

  const isAuthenticated = await checkIfAuthenticated(req, res);

  if (!isAuthenticated) return;

  if (req.method !== 'GET') {
    res.status(400).json({ message: 'Invalid request method. Accepted method: GET' });
    return;
  }

  let client;
  const token = await getToken({ req });
  const { articleTitle } = req.query;

  try {
    client = await connectDb();
  } catch (error) {
    res.status(500).json({ message: 'Failed to connect with the database.' });
  }

  const database = client.db('mindescape');
  const collection = database.collection('drafts');

  const formattedArticleTitle = articleTitle.replaceAll('-', ' ');

  let articleToReturn;

  try {
    const articles = await collection
      .find({
        title: { $regex: new RegExp(formattedArticleTitle, 'i') },
      })
      .toArray();

    articleToReturn = articles.find(
      article => article.title.toLowerCase() === formattedArticleTitle.toLowerCase()
    );
  } catch (error) {
    res.status(500).json({ message: 'Failed to retreive the draft data.' });
    client.close();
    return;
  }

  //Validate if user has permission to read the draft

  if (articleToReturn && token.role === 'editor' && articleToReturn.authorId !== token._id) {
    res.status(401).json({ message: 'No permission to read the document.' });
    client.close();
    return;
  }

  res.status(200).json({ article: articleToReturn });
  client.close();
  return;
};

export default handler;
