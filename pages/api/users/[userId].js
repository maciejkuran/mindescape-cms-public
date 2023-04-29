import connectDb from '@/utils/dbConnect';
import { ObjectId } from 'mongodb';
import hashPassword from '@/utils/hashPassword';
import validateUserDataInputs from '@/utils/validateUserDataInputs';
import checkIfAuthenticated from '@/utils/checkIfAuthenticated';
import { getToken } from 'next-auth/jwt';
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

  if (req.method !== 'PATCH' && req.method !== 'DELETE') {
    res.status(400).json({ message: 'Invalid request method. Accepted methods: PATCH, DELETE' });
    return;
  }

  const { userId: userIdSlug } = req.query;
  const { password, email, userId } = req.body;

  if (req.method === 'PATCH') {
    const userInputsOk = validateUserDataInputs(req.body, res);
    const token = await getToken({ req });

    //Validate if user._id matches token._id (if the owner of the account requests the change)
    if (userIdSlug !== token._id) {
      res.status(401).json({
        message:
          'No permission to modify this document. Only the owner of this account has permission to take this action.',
      });
      return;
    }

    if (!userInputsOk) return;

    let client;

    try {
      client = await connectDb();
    } catch (error) {
      res.status(500).json({ message: 'Connecting to the database failed.' });
    }

    const database = client.db('mindescape');
    const users = database.collection('users');

    // Validate if email address (that is requested to be changed to) exists in DB and doesn't belong to other user
    try {
      const foundUser = await users.find({ email: email }).toArray();
      const foundUserId = foundUser[0] && foundUser[0]._id.toString();

      //checking if found user id matches with the actual user id that sent the request
      if (foundUserId && foundUserId !== userId) {
        res.status(400).json({
          message:
            'This email address already exists and is not available. Choose a different one.',
        });
        client.close();
        return;
      }
    } catch (error) {
      res.status(500).json({ message: 'Connecting to the database failed.' });
      client.close();
    }

    //hash user password
    const hashedPassword = await hashPassword(password);
    //Deleting unwanted properties
    delete req.body.confirmPassword;
    delete req.body.userId;

    try {
      await users.updateOne(
        { _id: new ObjectId(userIdSlug) },
        {
          $set: { ...req.body, password: hashedPassword },
          $currentDate: { lastModified: true },
        }
      );
      res.status(200).json({
        message:
          'User data is changed successfully. In order to see updated data 🚩sign out and 🟢sign in again with your current credentials.',
      });
      client.close();
    } catch (error) {
      res.status(500).json({ message: 'Submitting data failed.' });
      client.close();
    }
  }

  if (req.method === 'DELETE') {
    let client;

    //Only admin can delete an account
    const isAdmin = await checkIfAdminRole(req, res);
    if (!isAdmin) return;

    try {
      client = await connectDb();
    } catch (error) {
      res.status(500).json({ message: 'Connecting to the database failed.' });
    }

    const database = client.db('mindescape');
    const users = database.collection('users');
    const { userId } = req.query;

    try {
      await users.deleteOne({ _id: new ObjectId(userId) });
      res.status(200).json({ message: 'User has been successfully deleted.' });
      client.close();
      return;
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Some problem occured while deleting a user from the database.' });
      client.close();
    }
  }
};

export default handler;
