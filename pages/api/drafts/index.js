import connectDb from '@/utils/dbConnect';
import checkIfAuthenticated from '@/utils/checkIfAuthenticated';
import getArticlesWithCurrentUserData from '@/utils/getArticlesWithCurrentUserData';
import { ObjectId } from 'mongodb';
import validateTitleInput from '@/utils/validateTitleInput';
import { getToken } from 'next-auth/jwt';
import rateLimiterMiddleware from '@/rateLimitedMiddleware';

const rateLimiter = {};

const handler = async (req, res) => {
  //Check rate limit
  const rateLimitOk = rateLimiterMiddleware(req, res, rateLimiter);

  if (!rateLimitOk) return;

  const isAuthenticated = await checkIfAuthenticated(req, res);

  if (!isAuthenticated) return;

  const token = await getToken({ req });

  if (req.method !== 'POST' && req.method !== 'GET' && req.method !== 'PATCH') {
    res.status(400).json({ message: 'Invalid request method. Accepted methods: GET, POST, PATCH' });
    return;
  }

  if (req.method === 'GET') {
    let client;
    try {
      client = await connectDb();
    } catch (err) {
      res.status(500).json({ message: 'Connecting to the database failed.' });
      return;
    }

    const database = client.db('mindescape');
    const collection = database.collection('drafts');

    let drafts;

    try {
      drafts = await collection.find({}).sort({ creationDate: -1 }).toArray();
    } catch (error) {
      res.status(500).json({ message: 'Retreiving drafts failed.' });
      client.close();
      return;
    }

    //Get articles data with current user data (e.g. user could change profile img in the meantime so to keep data always up to date Im retreiving current user data)

    const collection2 = database.collection('users');
    try {
      //Getting all users
      const users = await collection2.find({}).toArray();
      const draftsWithCurrentUserData = getArticlesWithCurrentUserData(drafts, users);

      // If !admin return only drafts that belong to the editor
      if (token.role === 'editor') {
        const editorDrafts = draftsWithCurrentUserData.filter(
          draft => draft.authorId === token._id
        );
        res.status(200).json({
          quantity: editorDrafts.length,
          articles: editorDrafts,
          message: `The list of drafts - ${token.name} ${token.lastName}`,
        });
        client.close();
        return;
      }

      res.status(200).json({
        quantity: draftsWithCurrentUserData.length,
        articles: draftsWithCurrentUserData,
        message: 'The list of drafts.',
      });
      client.close();
    } catch (error) {
      res.status(500).json({ message: 'Retreiving drafts failed.' });
      client.close();
    }
  }

  if (req.method === 'POST') {
    const { title } = req.body;
    const token = await getToken({ req });

    //Validate if article belongs to the author (e.g. article from publishedPage can be edited and saved as draft. To avoid unauthorized people to edit our posts, I want to validate if token_id === req.body.authorId. Only admins can edit all posts.

    if (token.role !== 'admin' && token._id !== req.body.authorId) {
      res.status(401).json({
        message:
          'No permission to save this article as draft. You can only unpublish the article that you own.',
      });
      return;
    }

    //Check if no title && if title contains forbidden hash '#' symbol
    const correctTitle = validateTitleInput(title, res);
    if (!correctTitle) return;

    let client;

    try {
      client = await connectDb();
    } catch (err) {
      res.status(500).json({ message: 'Connecting to the database failed.' });
      return;
    }

    const database = client.db('mindescape');
    const drafts = database.collection('drafts');

    //Checking if article with the same title already exists
    try {
      const draftsWithSameTitle = await drafts
        .find({
          title: { $regex: new RegExp(title, 'i') },
        })
        .toArray();

      if (draftsWithSameTitle.length >= 1) {
        res.status(400).json({ message: 'Draft with the same title already exists.' });
        client.close();
        return;
      }
    } catch (err) {
      res.status(500).json({ message: 'Inserting draft failed.' });
      client.close();
      return;
    }

    //Inserting article to database
    let result;

    try {
      result = await drafts.insertOne({
        ...req.body,
        ...(req.body._id && { _id: new ObjectId(req.body._id) }),
        creationDate: new Date(),
      });

      res.status(200).json({
        message: 'Article successfully added to drafts.',
        data: { ...result },
      });
    } catch (err) {
      res.status(500).json({ message: 'Inserting data failed.' });
      client.close();
      return;
    }

    // Check if article exists in => published - if it does -> remove it from published to avoid having the same article in 'drafts' and 'published' collections

    const published = database.collection('articles');
    const draftArticleId = result.insertedId; //new ObjectId(id);

    const foundItem = await published.find({ _id: draftArticleId }).toArray();

    if (foundItem[0]) {
      await published.deleteOne({ _id: draftArticleId });
      client.close();
      return;
    }

    client.close();
    return;
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
    }

    const database = client.db('mindescape');
    const drafts = database.collection('drafts');

    if (!req.body._id) {
      res.status(400).json({ message: 'You cannot update non existing draft.' });
      client.close();
      return;
    }

    const dataToSend = { ...req.body };
    delete dataToSend._id;

    // => Getting draft data
    let draft;

    try {
      draft = await drafts.find({ _id: new ObjectId(req.body._id) }).toArray();
    } catch (error) {
      res.status(500).json({ message: 'Validating user permission failed.' });
      client.close();
      return;
    }

    //Validate if user has permission to modify this document
    if (token.role === 'editor' && draft[0].authorId !== token._id) {
      res.status(401).json({ message: 'No permission to modify the content of this document.' });
      client.close();
      return;
    }

    //Updating draft
    try {
      const item = await drafts.updateOne(
        { _id: new ObjectId(req.body._id) },
        {
          $set: { ...dataToSend },
          $currentDate: { lastModified: true },
        }
      );
      res.status(200).json({
        data: { ...item },
        message: 'Draft has been successfully updated.',
      });
      client.close();
    } catch (error) {
      res.status(500).json({ message: 'Submitting draft data  failed.' });
      client.close();
    }
  }
};

export default handler;
