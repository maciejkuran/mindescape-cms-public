import connectDb from '@/utils/dbConnect';
import hashPassword from '@/utils/hashPassword';
import validateUserDataInputs from '@/utils/validateUserDataInputs';
import checkIfAuthenticated from '@/utils/checkIfAuthenticated';
import checkIfAdminRole from '@/utils/checkIfAdminRole';
import rateLimiterMiddleware from '@/rateLimitedMiddleware';

const rateLimiter = {};

const handler = async (req, res) => {
  //Check rate limit
  const rateLimitOk = rateLimiterMiddleware(req, res, rateLimiter);

  if (!rateLimitOk) return;

  //If user is not authenticated, request will fail
  const isAuthenticated = await checkIfAuthenticated(req, res);

  if (!isAuthenticated) return;

  if (req.method !== 'POST' && req.method !== 'GET') {
    res.status(400).json({ message: 'Invalid request method. Accepted methods: POST, GET' });
    return;
  }

  if (req.method === 'POST') {
    //Validate if inputs aren't empty
    const { image, role, name, lastName, email, password, confirmPassword, bio } = req.body;

    //Only admins can create new users
    const isAdmin = await checkIfAdminRole(req, res);
    if (!isAdmin) return;

    const userInputsOk = validateUserDataInputs(req.body, res);

    if (!userInputsOk) return;

    let client;

    try {
      client = await connectDb();
    } catch (err) {
      res.status(500).json({ message: 'Connecting to the database failed.' });
      return;
    }

    const database = client.db('mindescape');
    const users = database.collection('users');

    // Checking if user already exists
    try {
      const foundUsers = await users.find({ email: email }).toArray();

      if (foundUsers.length === 1) {
        res.status(400).json({ message: 'User already exists.' });
        client.close();
        return;
      }
    } catch (err) {
      res.status(500).json({ message: 'Inserting data failed!' });
      client.close();
      return;
    }

    //hash user password
    const hashedPassword = await hashPassword(password);

    const dataToSubmit = {
      image,
      role,
      name,
      lastName,
      email,
      password: hashedPassword,
      bio,
      joinDate: new Date(),
    };

    //Store user in database
    try {
      const result = await users.insertOne({
        ...dataToSubmit,
      });
      res.status(200).json({
        message: 'User successfully added.',
        data: { ...result },
      });
      client.close();
    } catch (err) {
      res.status(500).json({ message: 'Adding user failed.' });
      client.close();
      return;
    }
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
    const collection = database.collection('users');

    let users;
    try {
      users = await collection.find({}).sort({ joinDate: -1 }).toArray();
    } catch (error) {
      res.status(500).json({ message: 'Problems with retreiving users from the database.' });
      client.close();
      return;
    }

    let articles;
    const collection2 = database.collection('articles');
    //Retreiving total published articles for each user
    try {
      articles = await collection2.find({}).toArray();
      const usersToReturn = users.map(user => {
        const allUserArticles = articles.filter(
          article => article.authorId === user._id.toString()
        );

        return {
          ...user,
          publishedArticlesQuantity: allUserArticles.length,
        };
      });

      res.status(200).json({ users: usersToReturn });
      client.close();
      return;
    } catch (error) {
      res.status(500).json({ message: 'Problems with retreiving users from the database.' });
      client.close();
      return;
    }
  }
};

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '8mb',
    },
  },
};

export default handler;
