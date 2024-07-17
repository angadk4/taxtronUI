import React, { useEffect } from 'react';
import axios from 'axios';

const APIController = ({ url, params, setData, setLoading, setError }) => {
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        console.log('Fetching URL:', url, 'with params:', params);
        const response = await axios({
          method: 'get',
          url: url,
          params: params,
        });
        console.log('Fetched Data:', response.data);
        setData(response.data);
        setError(null);
      } catch (error) {
        setError(error.message);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    if (url) {
      fetchData();
    }
  }, [url, params, setData, setLoading, setError]);

  return null;
};

export default APIController;
