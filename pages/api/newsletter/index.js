import connectDb from '@/utils/dbConnect';
import checkIfAuthenticated from '@/utils/checkIfAuthenticated';
import checkIfAdminRole from '@/utils/checkIfAdminRole';
import rateLimiterMiddleware from '@/rateLimitedMiddleware';

const rateLimiter = {};

const handler = async (req, res) => {
  //Check rate limit
  const rateLimitOk = rateLimiterMiddleware(req, res, rateLimiter);

  if (!rateLimitOk) return;

  if (req.method === 'OPTIONS') {
    return res.status(200).json({
      body: 'OK',
    });
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    res.status(400).json({ message: 'Invalid request method. Accepted methods: GET, POST' });
    return;
  }

  if (req.method === 'GET') {
    const isAuthenticated = await checkIfAuthenticated(req, res);

    if (!isAuthenticated) return;

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
    const collection = database.collection('newsletter');

    try {
      const newsletterList = await collection.find({}).sort({ date: -1 }).toArray();
      res.status(200).json({ list: newsletterList, quantity: newsletterList.length });
      client.close();
    } catch (error) {
      res.status(500).json({ message: 'Failed to retreive a newsletter list from the database.' });
      client.close();
    }
  }

  if (req.method === 'POST') {
    //Expected req.body object = {email: 'user@email.com'};
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: 'Email input cannot be empty.' });
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
    const collection = database.collection('newsletter');

    //Validate if email already exists
    try {
      const existingEmail = await collection.find({ email: email.trim() }).toArray();

      if (existingEmail.length !== 0) {
        res.status(400).json({ message: 'This email is already signed up for a newsletter.' });
        client.close();
        return;
      }
    } catch (error) {
      res.status(500).json({ message: 'Newsletter sign up failed.' });
      client.close();
      return;
    }

    //Save email to database
    const objToInsert = { email: email.trim(), date: new Date() };

    try {
      const result = await collection.insertOne(objToInsert);
      res.status(200).json({ ...result });
      client.close();
    } catch (error) {
      res.status(500).json({ message: 'Newsletter sign up failed.' });
      client.close();
    }
  }
};

export default handler;
