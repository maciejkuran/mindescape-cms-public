const formatShortDate = date => {
  const fullDate = new Date(date);

  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  return new Intl.DateTimeFormat('en-GB', options).format(fullDate);
};

export default formatShortDate;
