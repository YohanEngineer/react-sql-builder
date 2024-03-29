import React from 'react';

const OrderBySelect = ({ columns, selectedOrderBy, onChange, onDirectionChange }) => {
  return (
    <div className="orderby-select">
      <label htmlFor="orderby">Sélectionnez l'ordre:</label>
      <br />
      <br />
      <select multiple name="orderby" value={selectedOrderBy.map((item) => item.column)} onChange={onChange}>
            {columns.map((column, index) => (
              <option key={`${column.column_name}${column.table}${index}`} value={column.table + '.' + column.column_name}>
                {column.column_name} ({column.table})
              </option>
            ))}
      </select>

      {selectedOrderBy.map((item, index) => (
        <div key={`${item.column}${index}`}>
          <label htmlFor={`orderDirection-${index}`}>{item.column}:</label>
          <select
            name={`orderDirection-${index}`}
            value={item.direction}
            onChange={(event) => onDirectionChange(index, event.target.value)}
          >
            <option value="ASC">ASC</option>
            <option value="DESC">DESC</option>
          </select>
        </div>
      ))}
    </div>
  );
};

export default OrderBySelect;
