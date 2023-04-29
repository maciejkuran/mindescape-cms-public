import connectDb from '@/utils/dbConnect';
import checkIfAuthenticated from '@/utils/checkIfAuthenticated';
import checkIfAdminRole from '@/utils/checkIfAdminRole';
import rateLimiterMiddleware from '@/rateLimitedMiddleware';

const rateLimiter = {};

const handler = async (req, res) => {
  //Check rate limit
  const rateLimitOk = rateLimiterMiddleware(req, res, rateLimiter);

  if (!rateLimitOk) return;

  if (req.method !== 'GET' && req.method !== 'POST') {
    res.status(400).json({ message: 'Invalid request method. Accepted methods: GET, POST' });
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
      const result = await collection.insertOne({ ...req.body, date: new Date() });
      res.status(200).json({ ...result });
      client.close();
    } catch (error) {
      res.status(500).json({ message: 'Failed to send the message.' });
      client.close();
    }
  }
};

export default handler;
