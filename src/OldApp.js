import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';


function App() {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');

  const [columns, setColumns] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);

  const [whereConditions, setWhereConditions] = useState([]);

  const [limit, setLimit] = useState(null);
  const [offset, setOffset] = useState(null);


  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const response = await axios.get('http://localhost:9999/information-schema/tables');
      setTables(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des tables:', error);
    }
  };

  const fetchColumns = async (tableName) => {
    try {
      const response = await axios.get(`http://localhost:9999/information-schema/columns/${tableName}`);
      setColumns(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des colonnes:", error);
    }
  };

  const handleTableChange = (event) => {
    setSelectedTable(event.target.value);
    setSelectedColumns([]);
    if (event.target.value) {
      fetchColumns(event.target.value);
    } else {
      setColumns([]);
    }
  };
  
  
  const handleColumnChange = (event) => {
    const selectedOptions = Array.from(event.target.selectedOptions).map((option) => option.value);
    setSelectedColumns(selectedOptions);
  };

  const handleLimitChange = (event) => {
    const value = event.target.value;
    setLimit(value === '' ? null : parseInt(value));
  };
  
  const handleOffsetChange = (event) => {
    const value = event.target.value;
    setOffset(value === '' ? null : parseInt(value));
  };
  

  function getWhereOperatorsForColumnType(columnType) {
    switch (columnType) {
      case 'character varying':
        return ['=', '<>', '>', '<', '>=', '<=', 'LIKE', 'ILIKE', 'IN', 'NOT IN', 'IS NULL', 'IS NOT NULL',
                'REGEXP', '~', 'SUBSTRING', 'LEFT', 'RIGHT', 'TRIM', 'UPPER', 'LOWER'];
      case 'bigint':
        return ['=', '<>', '>', '<', '>=', '<=', 'BETWEEN', 'NOT BETWEEN', 'IN', 'NOT IN', 'IS NULL', 'IS NOT NULL'];
      case 'integer':
          return ['=', '<>', '>', '<', '>=', '<=', 'BETWEEN', 'NOT BETWEEN', 'IN', 'NOT IN', 'IS NULL', 'IS NOT NULL'];
      case 'date':
        return ['=', '<>', '>', '<', '>=', '<=', 'BETWEEN', 'NOT BETWEEN', 'IN', 'NOT IN', 'IS NULL', 'IS NOT NULL',
                'DATE', 'TIME', 'TIMESTAMP', 'INTERVAL', 'EXTRACT', 'DATE_ADD', 'DATE_SUB'];
      case 'boolean':
        return ['=', '<>', 'IS NULL', 'IS NOT NULL'];
      default:
        return [];
    }
  }
  

  const openFilterDialog = async () => {
    const columnsOptions = columns
      .map((column) => `<option value="${column.column_name}" data-type="${column.data_type}">${column.column_name} (${column.data_type})</option>`)
      .join('');
  
    const { value: formValues } = await Swal.fire({
      title: 'Ajouter une condition WHERE',
      html:
        '<label for="swal-column">Colonnes:</label>' +
        `<select id="swal-column" class="swal2-input">${columnsOptions}</select>` +
        '<label for="swal-operator">Opérateur:</label>' +
        '<select id="swal-operator" class="swal2-input"></select>' +
        '<label for="swal-value">Valeur:</label>' +
        '<input id="swal-value" class="swal2-input" placeholder="Valeur">',
      focusConfirm: false,
      didOpen: () => {
        const columnSelect = document.getElementById('swal-column');
        const operatorSelect = document.getElementById('swal-operator');
  
        const updateOperators = () => {
          const selectedColumnType = columnSelect.options[columnSelect.selectedIndex].dataset.type;
          const operators = getWhereOperatorsForColumnType(selectedColumnType);
          operatorSelect.innerHTML = operators
            .map((operator) => `<option value="${operator}">${operator}</option>`)
            .join('');
        };
  
        columnSelect.addEventListener('change', updateOperators);
        updateOperators();
      },
      preConfirm: () => {
        return {
          columnName: document.getElementById('swal-column').value,
          operator: document.getElementById('swal-operator').value,
          value: document.getElementById('swal-value').value,
        };
      },
    });
  
    if (formValues) {
      return {
        columnName: formValues.columnName,
        operator: formValues.operator,
        value: formValues.value,
      };
    } else {
      return null;
    }
  };
  
  const handleAddWhereClick = async () => {
    const filterCondition = await openFilterDialog();
  
    if (filterCondition) {
      setWhereConditions((prevConditions) => [...prevConditions, filterCondition]);
    }
  };
  
  

  const generateSqlQuery = () => {
    const columnsString = selectedColumns.length > 0 ? selectedColumns.join(', ') : '*';
    let queryString = `SELECT ${columnsString} FROM ${selectedTable}`;
  
    if (whereConditions.length > 0) {
      const whereString = whereConditions
        .map((condition) => `${condition.columnName} ${condition.operator} '${condition.value}'`)
        .join(' AND ');
      queryString += ` WHERE ${whereString}`;
    }
  
    if (limit !== null) {
      queryString += ` LIMIT ${limit}`;
    }
  
    if (offset !== null) {
      queryString += ` OFFSET ${offset}`;
    }
  
    queryString += ";";
    return queryString;
  };
  
  
  
  

  return (
    <div className="App">
      <h1>Générateur de requêtes SQL</h1>
      <label htmlFor="table-select">Sélectionnez une table:</label>
      <br></br>
      <br></br>
      <select id="table-select" value={selectedTable} onChange={handleTableChange}>
        <option value="">--Choisissez une table--</option>
        {tables
          .slice() // Créez une copie pour éviter de modifier l'état original
          .sort() // Triez les tables dans l'ordre croissant
          .map((table, index) => (
            <option key={index} value={table}>{table}</option>
          ))}
      </select>
      <br></br>
      <br></br>
      {selectedTable && (
        <>
          <label htmlFor="column-select">Sélectionnez les colonnes :</label>
          <br></br>
          <br></br>
          <select
            id="column-select"
            multiple
            value={selectedColumns}
            onChange={handleColumnChange}
          >
            {columns
              .slice() // Créez une copie pour éviter de modifier l'état original
              .sort() // Triez les colonnes dans l'ordre croissant
              .map((column, index) => (
                <option key={index} value={column.column_name}>{column.column_name}</option>
              ))}
          </select>
        </>
      )}
      <br></br>
      <br></br>
      <button onClick={handleAddWhereClick}>Ajouter une condition WHERE</button>
      <br></br>
      <br></br>
      {
        <>
        <label htmlFor="limit-input">LIMIT:</label>
        <input
          id="limit-input"
          type="number"
          min="1"
          value={limit === null ? '' : limit}
          onChange={handleLimitChange}
        />
        <br />
        <br />
        <label htmlFor="offset-input">OFFSET:</label>
        <input
          id="offset-input"
          type="number"
          min="0"
          value={offset === null ? '' : offset}
          onChange={handleOffsetChange}
        />
      </>
      
      }
       <pre>{generateSqlQuery()}</pre>
    </div>
  );
  
  
}

export default App;
