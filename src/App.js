import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import { TableSelect } from './components/TableSelect';
import { ColumnSelect } from './components/ColumnSelect';
import { LimitSelect } from './components/LimitSelect';
import { OffsetSelect } from './components/OffsetSelect';
import { useTables } from './hooks/useTables';
import { useColumns } from './hooks/useColumns';
import { DownloadButton } from './components/DownloadButton';
import { ImportButton } from './components/ImportButton';
import OrderBySelect  from './components/OrderBySelect';
import useSqlQuery from './hooks/useSqlQuery';
import useWhereConditions from './hooks/useWhereConditions';
import useOrderBy from './hooks/useOrderBy';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  const tables = useTables();
  const [selectedTable, setSelectedTable] = useState('');
  
  const columns = useColumns(selectedTable);
  const [selectedColumns, setSelectedColumns] = useState([]);
  
  const [limit, setLimit] = useState(null);
  const [offset, setOffset] = useState(null);
  
  
  const { whereConditions, handleAddWhereClick } = useWhereConditions(columns);
  const { selectedOrderBy, orderDirection, handleOrderByChange, handleOrderDirectionChange } = useOrderBy(columns);
  
  
  const [editedSqlQuery, setEditedSqlQuery] = useState('');
  
  const handleTableChange = (event) => {
    setSelectedTable(event.target.value);
    setSelectedColumns([]);
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
  
  const [importedQuery] = useState('');
  
  const sqlQuery = useSqlQuery(selectedTable, selectedColumns, whereConditions, limit, offset, selectedOrderBy, orderDirection);
  
  useEffect(() => {
    setEditedSqlQuery(sqlQuery);
  }, [sqlQuery]);
  
  const handleSqlQueryChange = (event) => {
    setEditedSqlQuery(event.target.value);
  };
  
  const handleImport = (query) => {
    setEditedSqlQuery(query);   
  };
  
  
  const resetQuery = () => {
    setSelectedTable('');
    setSelectedColumns([]);
    setLimit(null);
    setOffset(null);
    setEditedSqlQuery('');
  };
  
  const executeQuery = async () => {
    const response = await fetch('http://localhost:9999/raw-sql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sql: editedSqlQuery }),
  });
  
  if (response.ok) {
    const result = await response.json();
    console.log(result);
  } else {
    console.error('Erreur lors de l\'exécution de la requête SQL');
  }
};




return (
  <div className="App">
  
  <div className="container">
  {/* <Header className="header"/> */}
  {/* <div className='space'> </div> */}
  <div className="form-container">
  <div className="select-container">
  <TableSelect tables={tables} selectedTable={selectedTable} onChange={handleTableChange} />
  <br />
  <br />
  {selectedTable && (
    <ColumnSelect columns={columns} selectedColumns={selectedColumns} onChange={handleColumnChange} />
    )}
    </div>
    <div className="condition-container">
    {selectedTable && <button className="btn btn-light" onClick={handleAddWhereClick}><b>Ajouter une condition WHERE</b></button>}
    </div>
    <div className="select-container">
    {selectedTable && (
      <OrderBySelect
      columns={columns}
      selectedOrderBy={selectedOrderBy}
      onChange={handleOrderByChange}
      onDirectionChange={handleOrderDirectionChange}
      />
      )}
      </div>
      <div className="select-container">
      {selectedTable && (
        <div className="input-group limit-offset-container">
        <LimitSelect limit={limit} onChange={handleLimitChange} />
        <OffsetSelect offset={offset} onChange={handleOffsetChange} />
        </div>
        )}
        </div>
        <div className="query-container">
        <textarea className="sql-query-input" value={editedSqlQuery} onChange={handleSqlQueryChange} rows="10" cols="80"></textarea>
        </div>
        <div className='select-container'>
        <button className="reset-btn btn btn-danger" onClick={resetQuery}>Réinitialiser la requête</button>
        </div>
        <div className="select-container">
        {<DownloadButton sqlQuery={editedSqlQuery} />}
        </div>
        <div className="select-container">
        <ImportButton onImport={handleImport} />
        </div>
        <div className='submit-container'>
        <button className="submit-btn btn btn-success" onClick={executeQuery}>Exécuter la requête</button>
        </div>
        </div>
        </div>
        </div>
        );
      }
      
      export default App;
      