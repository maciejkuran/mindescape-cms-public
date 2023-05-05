import connectDb from '@/utils/dbConnect';
import checkIfAuthenticated from '@/utils/checkIfAuthenticated';
import checkIfAdminRole from '@/utils/checkIfAdminRole';
import rateLimiterMiddleware from '@/rateLimitedMiddleware';
import { ObjectId } from 'mongodb';

const rateLimiter = {};

const handler = async (req, res) => {
  //Check rate limit
  const rateLimitOk = rateLimiterMiddleware(req, res, rateLimiter);

  if (!rateLimitOk) return;

  if (req.method !== 'GET' && req.method !== 'POST' && req.method !== 'PATCH') {
    res.status(400).json({ message: 'Invalid request method. Accepted methods: GET, POST, PATCH' });
    return;
  }

  if (req.method === 'GET') {
    const isAuthenticated = await checkIfAuthenticated(req, res);
    if (!isAuthenticated) return;

    //Only admin can see the messages
    const isAdmin = await checkIfAdminRole(req, res);
    if (!isAdmin) return;

    let client;
    try {
      client = await connectDb();
    } catch (err) {
      res.status(500).json({ message: 'Connecting to the database failed.' });
      return;
    }

    const database = client.db('mindescape');
    const collection = database.collection('messages');

    try {
      const messages = await collection.find({}).sort({ date: -1 }).toArray();
      res.status(200).json({ messages: messages, quantity: messages.length });
      client.close();
    } catch (error) {
      res.status(500).json({ message: 'Failed to retreive messages from the database.' });
      client.close();
    }
  }

  if (req.method === 'POST') {
    //expected obj to receive = {content, email, name};
    const { content, email, name } = req.body;

    //Validate user input
    if (!content && !email && !name) {
      res.status(400).json({ message: 'All input fields are required.' });
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
    const collection = database.collection('messages');

    //Insert message to db
    try {
      const result = await collection.insertOne({ ...req.body, replied: false, date: new Date() });
      res.status(200).json({ ...result });
      client.close();
    } catch (error) {
      res.status(500).json({ message: 'Failed to send the message.' });
      client.close();
    }
  }

  if (req.method === 'PATCH') {
    const { msgId, replied, repliedBy, userId } = req.body;

    const isAuthenticated = await checkIfAuthenticated(req, res);
    if (!isAuthenticated) return;

    //Only admin can modify a document
    const isAdmin = await checkIfAdminRole(req, res);
    if (!isAdmin) return;

    let client;
    try {
      client = await connectDb();
    } catch (err) {
      res.status(500).json({ message: 'Connecting to the database failed.' });
      return;
    }

    const database = client.db('mindescape');
    const collection = database.collection('messages');

    //Get the message item by id and check if replied property hasn't been marked as true. If yes, reject request.

    try {
      const message = await collection.findOne({ _id: new ObjectId(msgId) });

      if (message.replied) {
        res
          .status(400)
          .json({ message: 'Failed request. This message is already marked as replied.' });
        client.close();
        return;
      }
    } catch (error) {
      res.status(500).json({
        message: 'Failed request. Could not verify the message replied status in the database.',
      });
      client.close();
      return;
    }

    //Modify the document
    try {
      await collection.updateOne(
        { _id: new ObjectId(msgId) },
        {
          $set: { replied, repliedBy, repliedByUserId: userId },
          $currentDate: { lastModified: true },
        }
      );
      res.status(200).json({ message: 'Messaged status has changed to replied.' });
      client.close();
      return;
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Request failed. Unable to update the document in the database.' });
      client.close();
      return;
    }
  }
};

export default handler;
