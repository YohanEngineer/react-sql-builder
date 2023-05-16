import { useState } from 'react';

const useOrderBy = (columns) => {
  const [selectedOrderBy, setSelectedOrderBy] = useState([]);
  const [orderDirection, setOrderDirection] = useState('');

  const handleOrderByChange = (event) => {
    const selectedOptions = Array.from(event.target.selectedOptions).map((option) => ({
      column: option.value,
      direction: 'ASC',
    }));
    setSelectedOrderBy(selectedOptions);
  };

  const handleOrderDirectionChange = (index, direction) => {
    setSelectedOrderBy((prevSelectedOrderBy) => {
      const newSelectedOrderBy = [...prevSelectedOrderBy];
      newSelectedOrderBy[index] = { ...newSelectedOrderBy[index], direction };
      return newSelectedOrderBy;
    });
  };

  const clearOrderBy = () => {
    setSelectedOrderBy([]);
    setOrderDirection('');
  };

  return { selectedOrderBy, orderDirection, handleOrderByChange, handleOrderDirectionChange, clearOrderBy };

};

export default useOrderBy;
