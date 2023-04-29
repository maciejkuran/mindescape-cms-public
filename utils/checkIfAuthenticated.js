import { getToken } from 'next-auth/jwt';

const checkIfAuthenticated = async (req, res) => {
  const token = await getToken({ req });

  if (!token) {
    res.status(401).json({ message: 'Protected resource, no access granted.' });
    return false;
  }

  return true;
};

export default checkIfAuthenticated;
