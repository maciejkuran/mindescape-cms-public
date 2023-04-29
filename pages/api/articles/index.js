import connectDb from '@/utils/dbConnect';
import checkIfAuthenticated from '@/utils/checkIfAuthenticated';
import { ObjectId } from 'mongodb';
import getArticlesWithCurrentUserData from '@/utils/getArticlesWithCurrentUserData';
import validateTitleInput from '@/utils/validateTitleInput';
import { getToken } from 'next-auth/jwt';
import rateLimiterMiddleware from '@/rateLimitedMiddleware';

const rateLimiter = {};

const handler = async (req, res) => {
  //Check rate limit
  const rateLimitOk = rateLimiterMiddleware(req, res, rateLimiter);

  if (!rateLimitOk) return;

  if (req.method !== 'GET' && req.method !== 'POST' && req.method !== 'PATCH') {
    res.status(400).json({ message: 'Invalid request method. Accepted: GET, POST, PATCH.' });
    return;
  }

  if (req.method === 'GET') {
    let client;
    try {
      client = await connectDb();
    } catch (error) {
      res.status(500).json({ message: 'Connecting to the database failed.' });
      return;
    }

    const database = client.db('mindescape');
    const collection = database.collection('articles');

    let articles;
    try {
      articles = await collection.find({}).sort({ creationDate: -1 }).toArray();
    } catch (error) {
      res.status(500).json({ message: 'Connecting to the database failed.' });
      client.close();
      return;
    }

    //Get articles data with current user data (e.g. user could change profile img in the meantime so to keep data always up to date Im retreiving current user data)

    const collection2 = database.collection('users');
    try {
      //Getting all users
      const users = await collection2.find({}).toArray();
      const actualDataToReturn = getArticlesWithCurrentUserData(articles, users);

      const token = await getToken({ req });

      //Remove from each article item => comments => user email if !authenticated (I don't want to expose user emails to nonauthorized users)
      if (!token) {
        const articlesWithoutSensitiveData = actualDataToReturn.map(article => {
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
          message: 'The list of published articles.',
        });
        client.close();
        return;
      }
      //If authenticated user, return full data
      res.status(200).json({
        quantity: actualDataToReturn.length,
        articles: actualDataToReturn,
        message: 'The list of published articles.',
      });
      client.close();
      return;
    } catch (error) {
      res.status(500).json({ message: 'Retreiving published articles failed.' });
      client.close();
      return;
    }
  }

  if (req.method === 'POST') {
    const { title, excerpt, body, mainImage } = req.body;

    //If user is not authenticated, request will fail
    const isAuthenticated = await checkIfAuthenticated(req, res);

    if (!isAuthenticated) return;

    //Checking if inputs are NOT EMPTY
    if (!title || !excerpt || !body || !mainImage) {
      res.status(400).json({ message: 'Submission failed. Input fields cannot be empty.' });
      return;
    }

    //Checking if title contains forbidden hash '#' symbol
    if (title.includes('#')) {
      res.status(400).json({ message: 'Remove # from an article title.' });
      return;
    }

    let client;

    try {
      client = await connectDb();
    } catch (err) {
      res.status(500).json({ message: 'Connecting to the database failed.' });
      return;
    }

    const database = client.db('mindescape');
    const articles = database.collection('articles');

    //Checking if article with the same title already exists
    try {
      const articleWithSameTitle = await articles
        .find({
          title: { $regex: new RegExp(title, 'i') },
        })
        .toArray();

      if (articleWithSameTitle.length >= 1) {
        res.status(400).json({ message: 'Article with the same title already exists.' });
        client.close();
        return;
      }
    } catch (err) {
      res.status(500).json({ message: 'Inserting data failed.' });
      client.close();
      return;
    }

    //Inserting article to database
    let result;
    try {
      result = await articles.insertOne({
        ...req.body,
        ...(req.body._id && { _id: new ObjectId(req.body._id) }),
        creationDate: new Date(),
      });

      res.status(200).json({
        message: 'Article successfully added and is now published.',
        data: { ...result },
      });
    } catch (err) {
      res.status(500).json({ message: 'Inserting data failed.' });
      client.close();
      return;
    }

    //Check if article exists in => drafts - if it does -> remove it from drafts to avoid having the same article in 'published' and 'drafts
    const drafts = database.collection('drafts');
    const publishedArticleId = result.insertedId; //new ObjectId(id);

    const foundItem = await drafts.find({ _id: publishedArticleId }).toArray();

    if (foundItem[0]) {
      await drafts.deleteOne({ _id: publishedArticleId });
      client.close();
      return;
    }

    client.close();
  }

  if (req.method === 'PATCH') {
    const { title } = req.body;

    //Check if no title && if title contains forbidden hash '#' symbol
    const correctTitle = validateTitleInput(title, res);
    if (!correctTitle) return;

    let client;

    try {
      client = await connectDb();
    } catch (error) {
      res.status(500).json({ message: 'Connecting to the database failed.' });
      return;
    }

    const database = client.db('mindescape');
    const articles = database.collection('articles');

    if (!req.body._id) {
      res.status(400).json({ message: 'You cannot update non existing article.' });
      client.close();
      return;
    }

    const dataToSend = { ...req.body };
    delete dataToSend._id;

    //Get article that's supposed to be corrected
    const token = await getToken({ req });
    let article;

    try {
      article = await articles.find({ _id: new ObjectId(req.body._id) }).toArray();
    } catch (error) {
      res.status(500).json({ message: 'Failed to validate user permission.' });
      client.close();
      return;
    }

    //Validate user permission
    if (token.role === 'editor' && token._id !== article[0].authorId) {
      res.status(401).json({ message: 'No permission to modify this document.' });
      client.close();
      return;
    }

    //Update article
    try {
      const item = await articles.updateOne(
        { _id: new ObjectId(req.body._id) },
        {
          $set: { ...dataToSend },
          $currentDate: { lastModified: true },
        }
      );
      res.status(200).json({
        data: { ...item },
        message: 'Article has been successfully updated.',
      });
      client.close();
      return;
    } catch (error) {
      res.status(500).json({ message: 'Submitting data failed.' });
      client.close();
      return;
    }
  }
};

export default handler;

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '20mb',
    },
  },
};
