import { getDownloadURL, getStorage, ref, uploadString } from 'firebase/storage';
import app from '@/config/firebase';
import checkIfAuthenticated from '@/utils/checkIfAuthenticated';
import rateLimiterMiddleware from '@/rateLimitedMiddleware';

const rateLimiter = {};

const handler = async (req, res) => {
  //Check rate limit
  const rateLimitOk = rateLimiterMiddleware(req, res, rateLimiter);

  if (!rateLimitOk) return;

  //If user is not authenticated, request will fail
  const isAuthenticated = await checkIfAuthenticated(req, res);

  if (!isAuthenticated) return;

  if (req.method !== 'POST') {
    res.status(400).json({ message: 'Invalid request method. Accepted method: POST' });
    return;
  }

  if (req.method === 'POST') {
    const { image, imageName, imageType, imageSize } = req.body;

    if (imageSize > 1024 && imageType === 'image') {
      res.status(400).json({ message: `Submission failed. Image exceeds 1024Kb.` });
      return;
    }

    if (imageSize > 512 && imageType === 'thumbnail') {
      res.status(400).json({ message: `Submission failed. Image exceeds 512Kb.` });
      return;
    }

    const storage = getStorage(app);
    const storageRef = ref(storage, imageName);

    let url;
    try {
      const snapshot = await uploadString(storageRef, image, 'base64', {
        contentType: 'image/png',
      });

      url = await getDownloadURL(snapshot.ref);

      if (!new RegExp('jpg', 'i').test(url) && !new RegExp('png', 'i').test(url)) {
        res.status(400).json({ message: 'Submission failed. Accepted image formats: jpeg, png' });
        return;
      }
    } catch (err) {
      res.status(500).json({ message: 'Inserting image failed.' });
      return;
    }

    res.status(200).json({
      location: url,
    });
  }
};

export default handler;

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};
