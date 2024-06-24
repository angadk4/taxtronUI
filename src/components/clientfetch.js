import React, { useState, useEffect } from 'react';
import axios from 'axios';

const APIController = ({ url, setData, setLoading, setError }) => {
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(url);
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
  }, [url, setData, setLoading, setError]);

  return null;
};

export default APIController;
