import connectDb from '@/utils/dbConnect';
import rateLimiterMiddleware from '@/rateLimitedMiddleware';
import { getToken } from 'next-auth/jwt';

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

  let articles;
  try {
    articles = await collection
      .find({
        title: { $regex: new RegExp(formattedArticleTitle, 'i') },
      })
      .toArray();
    //articles = array can contain multiple article objects as I find using Regex. We can 'find()' among this array the exact article we're searching for on the front-end.

    // res.status(200).json({ articles: articles });
    // client.close();
  } catch (error) {
    res.status(500).json({ message: 'Failed to retreive the articles.' });
    client.close();
  }

  const token = await getToken({ req }); //get token

  //If !authenticated, I wanna return the data without user email in comments (without sensitive data) since this endpoint is available for public requests.
  if (!token) {
    const articlesWithoutSensitiveData = articles.map(article => {
      const comments =
        article.comments &&
        article.comments.map(item => {
          delete item.email;
          return { ...item };
        });
      return { ...article, comments };
    });
    res.status(200).json({
      quantity: articlesWithoutSensitiveData.length,
      articles: articlesWithoutSensitiveData,
    });
    client.close();
    return;
  }

  //If authenticated user, return full data
  res.status(200).json({
    quantity: articles.length,
    articles,
  });
  client.close();
  return;
};

export default handler;
