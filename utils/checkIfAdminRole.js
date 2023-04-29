import { getToken } from 'next-auth/jwt';

const checkIfAdminRole = async (req, res) => {
  //This function should run after we checked that user is authenticated (after we ran checkIfAuthenticated() function) because we assume that user is authenticated but we wanna check the role.

  const token = await getToken({ req });

  if (token.role !== 'admin') {
    res.status(401).json({
      message: 'Protected resource, no access granted. Only administrators can take this action.',
    });
    return false;
  }

  return true;
};

export default checkIfAdminRole;
