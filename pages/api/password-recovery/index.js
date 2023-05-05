import connectDb from '@/utils/dbConnect';
import { caseSensitive_numbs_PW } from 'super-strong-password-generator';
import hashPassword from '@/utils/hashPassword';
const nodemailer = require('nodemailer');
const inLineCss = require('nodemailer-juice');
import bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';

const handler = async (req, res) => {
  if (req.method !== 'POST' && req.method !== 'PATCH') {
    res.status(400).json({ message: 'Invalid request method. Accepted methods: POST, PATCH' });
    return;
  }

  if (req.method === 'POST') {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: 'Invalid request. Email input is empty.' });
      return;
    }

    let client;
    try {
      client = await connectDb();
    } catch (error) {
      res.status(500).json({ message: 'Connecting to the database failed.' });
      return;
    }

    const database = client.db('mindescape');
    const usersCollection = database.collection('users');

    //Validate if user exists
    let user;
    try {
      user = await usersCollection.findOne({ email: email });
    } catch (error) {
      res.status(500).json({ message: 'Request failed. Unable to verify the email address.' });
      client.close();
      return;
    }

    if (!user) {
      res.status(400).json({ message: 'Email not found. Provide correct email address.' });
      client.close();
      return;
    }

    const passwordRecoveryCollection = database.collection('password-recovery');
    const passwordToken = caseSensitive_numbs_PW(40);

    //Validate if account recovery process for specific email hasn't been opened
    try {
      const existingRecovery = await passwordRecoveryCollection.findOne({ userEmail: email });

      if (existingRecovery) {
        res.status(400).json({
          message: `Already requested password change. Check ${email} email address and click on the link in order to proceed password change.`,
        });
        client.close();
        return;
      }
    } catch (error) {
      res.status(500).json({ message: 'Request failed. Unable to verify your request.' });
      client.close();
      return;
    }

    //Insert user object document to collection

    //Implementing MongoDB TTL which means that this document will expire after a specified number of seconds - I want 15 min = 900s
    //doc https://www.mongodb.com/docs/manual/tutorial/expire-data/
    try {
      await passwordRecoveryCollection.createIndex({ createdAt: 1 }, { expireAfterSeconds: 900 });

      const hashedToken = await hashPassword(passwordToken);

      const result = await passwordRecoveryCollection.insertOne({
        createdAt: new Date(),
        userId: user._id.toString(),
        userEmail: email,
        passwordToken: hashedToken,
      });
    } catch (error) {
      res.status(500).json({ message: 'Request failed. Cannot connect with the database.' });
      client.close();
      return;
    }
    //Send email to user with nodemailer
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.GMAIL_USERNAME,
        pass: process.env.GMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    transporter.use('compile', inLineCss());

    try {
      let info = await transporter.sendMail({
        from: '"Mindescape" <mindescape.contact@gmail.com>', // sender address
        to: email, // list of receivers
        subject: `Mindescape: Password Recovery: ${email}`, // Subject line
        html: `<style>h1 {
        font-size: 35px;
        text-align: center;
        font-weight: 700;
      }
      
      h2 {
        font-size: 20px;
      }
      
      p {
        font-size: 16px;
      }
      
      button {
        font-size: 16px;
        font-weight: 700;
        cursor: pointer;
        outline: none;
        background: transparent;
        border: 2px solid black;
        border-radius: 25px;
        padding: 1.1rem 3.5rem;
      }</style>  <div>
      <h1>mindescape</h1>
      <h2>Did You Request a Password Change?</h2>
      <p>IMPORTANT! If you didn't request a password change, please ignore this email! </p>
      <p>To proceed the password change, please click on the button below. Please note, that the link below will expire in 15 min.</p>
      <div>
        <a target="_blank" href="${
          process.env.NEXTAUTH_URL
        }password-recovery/${user._id.toString()}/${passwordToken}"><button>Change password</button></a>
      </div>
    </div>`, // html body
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: `Request failed. Could not send an email message to: ${email}` });
      client.close();
      return;
    }

    res.status(200).json({
      message: `The reset link was just sent to ${email}. Due security reasons the link will expire in 15 min. Check SPAM folder in case you have troubles finding it.`,
    });
  }

  if (req.method === 'PATCH') {
    //Expected body object {userId, passwordToken, password, confirmPassword}
    const { userId, passwordToken, password, confirmPassword } = req.body;

    let client;
    try {
      client = await connectDb();
    } catch (error) {
      res.status(500).json({ message: 'Connecting to the database failed.' });
      return;
    }

    const database = client.db('mindescape');
    const passwordRecoveryCollection = database.collection('password-recovery');

    //Validate if requests exists/is still valid in password-recovery collection

    let recoveryRequest;
    try {
      recoveryRequest = await passwordRecoveryCollection.findOne({ userId: userId });

      if (!recoveryRequest) {
        res.status(401).json({
          message:
            'Request failed. The Link could expire or the request for a password change has not been made.',
        });
        client.close();
        return;
      }
    } catch (error) {
      res.status(500).json({ message: 'Request failed. Problem with the request validation.' });
      client.close();
      return;
    }

    //Validate if token matches (url token === db token)
    let match;

    try {
      match = await bcrypt.compare(passwordToken, recoveryRequest.passwordToken);
    } catch (error) {
      res.status(500).json({ message: 'Request failed. Problem occured with tokens comparison.' });
      client.close();
      return;
    }

    if (!match) {
      res.status(401).json({
        message: `Request failed. No permission to change the password for the account: ${recoveryRequest.userEmail}`,
      });
      client.close();
      return;
    }

    //Compare if passwords matches
    if (password !== confirmPassword) {
      res.status(400).json({ message: 'Request failed. Password does not match.' });
      client.close();
      return;
    }

    //Now insert changed password to the database
    const usersCollection = database.collection('users');
    const hashedPassword = await hashPassword(password);

    try {
      await usersCollection.updateOne(
        { _id: new ObjectId(userId) },
        { $set: { password: hashedPassword }, $currentDate: { lastModified: true } }
      );
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Request failed. Unable to insert new password to the database.' });
      client.close();
      return;
    }

    //Remove document with token from the database
    try {
      await passwordRecoveryCollection.deleteOne({ userId: userId });
    } catch (error) {
      res.status(500).json({
        message: 'Request failed. Could not remove the recovery object from the database.',
      });
      client.close();
      return;
    }

    res.status(200).json({
      message:
        'Password has been successfully changed. You can sign in now with your new credentials.',
    });
    client.close();
    return;
  }
};

export default handler;
