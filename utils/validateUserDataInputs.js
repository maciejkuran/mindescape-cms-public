const validateUserDataInputs = (reqBody, res) => {
  const { name, lastName, email, password, confirmPassword } = reqBody;

  if (name === '' || lastName === '' || email === '' || password === '' || confirmPassword === '') {
    res
      .status(400)
      .json({ message: 'Submission failed. Required inputs: name, last name, email, password.' });
    return false;
  }

  //Validate if email address is correct
  if (!email.includes('@') || !email.includes('.')) {
    res.status(400).json({ message: 'Incorrect email address.' });
    return false;
  }

  //Validate if password contains at least 7 characters
  if (password.length < 7) {
    res.status(400).json({ message: 'Password must contain at least 7 characters.' });
    return false;
  }

  //Validate if password matches
  if (password !== confirmPassword) {
    res.status(400).json({ message: 'Password does not match.' });
    return false;
  }

  return true;
};

export default validateUserDataInputs;
