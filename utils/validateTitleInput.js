const validateTitleInput = (title, res) => {
  //Check if no title
  if (title.length === 0) {
    res.status(400).json({ message: 'Title input is required.' });
    return false;
  }

  //Checking if title contains forbidden hash '#' symbol
  if (title.includes('#')) {
    res.status(400).json({ message: 'Remove # from an article title.' });
    return false;
  }

  return true;
};

export default validateTitleInput;
