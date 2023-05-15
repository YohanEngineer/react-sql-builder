import { useState, useEffect } from 'react';
import axios from 'axios';

export const useColumns = (tableName) => {
  const [columns, setColumns] = useState([]);

  useEffect(() => {
    if (!tableName) {
      setColumns([]);
      return;
    }

    const fetchColumns = async () => {
      try {
        const response = await axios.get(`http://localhost:9999/information-schema/columns/${tableName}`);
        setColumns(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des colonnes:", error);
      }
    };

    fetchColumns();
  }, [tableName]);

  return columns;
};
