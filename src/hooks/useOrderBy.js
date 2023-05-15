import { useState } from 'react';

const useOrderBy = (columns) => {
  const [selectedOrderBy, setSelectedOrderBy] = useState([]);

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

  return {
    selectedOrderBy,
    handleOrderByChange,
    handleOrderDirectionChange,
  };
};

export default useOrderBy;
