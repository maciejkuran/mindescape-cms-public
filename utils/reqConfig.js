const reqConfig = (method, data) => {
  return {
    method: method,
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
  };
};

export default reqConfig;
