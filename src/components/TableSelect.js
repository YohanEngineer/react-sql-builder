import React from 'react';

export const TableSelect = ({ tables, selectedTable, onChange }) => (
  <>
    {/* <label htmlFor="table-select" className="form-label">Sélectionnez une table:</label>
    <br />
    <br /> */}
    <select id="table-select" className="form-select" value={selectedTable} onChange={onChange}>
      <option value="">-- Choisissez une table --</option>
      {tables
        .slice()
        .sort()
        .map((table, index) => (
          <option key={index} value={table}>{table}</option>
        ))}
    </select>
  </>
);
