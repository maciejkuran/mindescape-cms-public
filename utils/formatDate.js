const formatDate = date => {
  const fullDate = new Date(date);

  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    timeZone: 'Europe/Warsaw',
    timeZoneName: 'short',
  };

  return new Intl.DateTimeFormat('en-GB', options).format(fullDate);
};

export default formatDate;
