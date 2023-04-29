import bcrypt from 'bcrypt';

const hashPassword = async password => {
  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  return hash;
};

export default hashPassword;
