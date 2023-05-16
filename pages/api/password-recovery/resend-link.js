import connectDb from '@/utils/dbConnect';
import { caseSensitive_numbs_PW } from 'super-strong-password-generator';
import hashPassword from '@/utils/hashPassword';
const nodemailer = require('nodemailer');
const inLineCss = require('nodemailer-juice');

const handler = async (req, res) => {
  //Preventing CORS issues.If you try to send a DELETE, PUT, etc.. request , the preflight will send it’s ‘first army’ to check the ‘battle field’. But this army is not the request itself, but an OPTION request. That’s why in our API we need to handle OPTION request.
  if (req.method === 'OPTIONS') {
    return res.status(200).json({
      body: 'OK',
    });
  }

  if (req.method !== 'POST') {
    res.status(400).json({ message: 'Invalid request method. Accepted method: POST' });
    return;
  }

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

  //Remove active recovery process from the database
  try {
    await passwordRecoveryCollection.deleteOne({ userEmail: email });
  } catch (error) {
    res.status(500).json({ message: 'Request failed. Could not reset active recovery process.' });
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
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.GMAIL_USERNAME,
      pass: process.env.GMAIL_PASSWORD, //it's not a client password but app password auto generated in Google settings
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
    message: `The NEW reset link was just sent to ${email}. Due security reasons the new link will expire in 15 min. Check SPAM folder in case you have troubles finding it. In case you find multiple emails, choose the most recent one.`,
  });
};

export default handler;
