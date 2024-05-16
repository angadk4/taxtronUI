import React, { useState, useEffect } from 'react';
import axios from 'axios';

const APIController = () => {

    const [data, setData] = useState(null);

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState(null);
  
    useEffect(() => {

      const fetchData = async () => {
        setLoading(true);
        try {
          const response = await axios.get('https://api');
          setData(response.data);
          setError(null); 
        } catch (error) {
          setError(error.message);
          setData(null); 
        } finally {
          setLoading(false);
        }
      };
  
      fetchData();
    }, []);
  
    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;
  
    return (
      <div>
        <h1>API Data</h1>
        {data ? <pre>{JSON.stringify(data, null, 2)}</pre> : <p>No data fetched</p>}
      </div>
    );
  };
  
  export default APIController;
  