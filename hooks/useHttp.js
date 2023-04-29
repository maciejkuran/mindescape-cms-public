import { useState, useCallback } from 'react';

const useHttp = () => {
  const [isLoading, setIsLoading] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [data, setData] = useState(null);

  const errorAccept = () => {
    setError(null);
  };

  const successAccept = () => {
    setSuccess(null);
  };

  const sendFetchReq = useCallback(async (url, config = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      setData(null);
      const res = await fetch(url, config);

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message);
      }
      const data = await res.json();
      setData(data);
      setSuccess(true);
    } catch (error) {
      setError(error.message);
    }
    setIsLoading(null);
  }, []);

  return { sendFetchReq, isLoading, data, error, success, errorAccept, successAccept };
};

export default useHttp;
