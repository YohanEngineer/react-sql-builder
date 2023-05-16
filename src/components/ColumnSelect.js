import React from 'react';

export const ColumnSelect = ({ columns, selectedColumns, onChange }) => (
  <>
    <label htmlFor="column-select" className="form-label">Sélectionnez les colonnes :</label>
    <br />
    <br />
    <select
      id="column-select"
      className="form-select form-select-md"
      multiple
      value={selectedColumns}
      onChange={onChange}
    >
      {columns
        .slice()
        .sort()
        .map((column, index) => (
          <option key={index} value={column.column_name}>{column.column_name}</option>
        ))}
    </select>
  </>
);
