import { useState, useEffect } from 'react';
import axios from 'axios';

export const useTables = () => {
  const [tables, setTables] = useState([]);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await axios.get('http://172.31.249.233:9999/information-schema/tables');
        setTables(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des tables:', error);
      }
    };

    fetchTables();
  }, []);

  return tables;
};
