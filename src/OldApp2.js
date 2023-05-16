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
import OrderBySelect from './components/OrderBySelect';
import useSqlQuery from './hooks/useSqlQuery';
import useWhereConditions from './hooks/useWhereConditions';
import useColumnsConditions from './hooks/useColumnOperations';
import useOrderBy from './hooks/useOrderBy';
import Papa from 'papaparse';
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

  const sqlQuery = useSqlQuery(selectedTable, selectedColumns, whereConditions, limit, offset, selectedOrderBy, orderDirection);

  const [queryResult, setQueryResult] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

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


  const resultsPerPage = 50;
  const endIndex = currentPage * resultsPerPage;
  const startIndex = endIndex - resultsPerPage;
  const currentResults = queryResult.slice(startIndex, endIndex);


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
      setQueryResult(result);
      setShowResults(true);
    } else {
      console.error('Erreur lors de l\'exécution de la requête SQL');
    }
  };

  const exportToCsv = () => {
    const csv = Papa.unparse({
      fields: Object.keys(queryResult[0]),
      data: queryResult
    }, {
      delimiter: ";"
    });

    const csvData = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const csvURL = window.URL.createObjectURL(csvData);
    const tempLink = document.createElement('a');
    tempLink.href = csvURL;
    tempLink.setAttribute('download', 'export.csv');
    tempLink.click();
  }


  return (
    <div className="App">
      {!showResults ? (
        <div className="container">
          <div className="form-container">
            <div className="select-container">
              <TableSelect tables={tables} selectedTable={selectedTable} onChange={handleTableChange} />
              <br />
              <br />
              {selectedTable && (
                <ColumnSelect columns={columns} selectedColumns={selectedColumns} onChange={handleColumnChange} />
              )}
            </div>
            {/* <div className="condition-container">
              {selectedTable && <button className="btn btn-light" onClick={handleAddColumnClick}><b>Ajouter une colonne</b></button>}
            </div> */}
            <div className="condition-container">
              {selectedTable && <button className="btn btn-light" onClick={handleAddWhereClick}><b>Ajouter une condition</b></button>}
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
              <DownloadButton sqlQuery={editedSqlQuery} />
            </div>
            <div className="select-container">
              <ImportButton onImport={handleImport} />
            </div>
            <div className='submit-container'>
              <button className="submit-btn btn btn-success" onClick={executeQuery}>Exécuter la requête</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="result-container">
          {queryResult && queryResult.length > 0 ? (
            <>
              <table className="table">
                <thead>
                  <tr>
                    {Object.keys(queryResult[0]).map((key, index) => (
                      <th key={index}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentResults.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {Object.values(row).map((value, valueIndex) => (
                        <td key={valueIndex}>{value !== null ? value : "NULL"}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="pagination-buttons">
                <button
                  className="btn btn-light"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Page précédente
                </button>
                <button
                  className="btn btn-light"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(queryResult.length / resultsPerPage)))}
                  disabled={currentPage === Math.ceil(queryResult.length / resultsPerPage)}
                >
                  Page suivante
                </button>
                <p>Page {currentPage} sur {Math.ceil(queryResult.length / resultsPerPage)}</p>
                <button className="btn btn-dark" onClick={exportToCsv}>Exporter en CSV</button>
              </div>
            </>
          ) : (
            <p>Aucun résultat retourné par la requête.</p>
          )}
          <button className="btn btn-secondary" onClick={() => setShowResults(false)}>Retour</button>
        </div>

      )}
    </div>
  );

}

export default App;
