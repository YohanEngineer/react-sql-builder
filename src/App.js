import React, { useState, useEffect, useMemo } from 'react';
// Importe la bibliothèque papaparse pour le traitement des CSV
import Papa from 'papaparse';
// Importe le CSS de Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';
// Importe des composants de l'interface utilisateur
import { TableSelect } from './components/TableSelect';
import { ColumnSelect } from './components/ColumnSelect';
import { LimitSelect } from './components/LimitSelect';
import { OffsetSelect } from './components/OffsetSelect';
import { DownloadButton } from './components/DownloadButton';
import { ImportButton } from './components/ImportButton';
import OrderBySelect from './components/OrderBySelect';
// Importe des hooks personnalisés pour la récupération de données
import { useTables } from './hooks/useTables';
import { useColumns } from './hooks/useColumns';
import useSqlQuery from './hooks/useSqlQuery';
import useWhereConditions from './hooks/useWhereConditions';
import useOrderBy from './hooks/useOrderBy';

// Importe le CSS de l'application
import './App.css';

// Défini le nombre de résultats par page
const RESULTS_PER_PAGE = 20;

// Définition du composant App
function App() {
    // Utilise le hook useTables pour récupérer les tables disponibles
    const tables = useTables();
    // Initialise et gère l'état de la table sélectionnée
    const [selectedTable, setSelectedTable] = useState('');

    // Utilise le hook useColumns pour récupérer les colonnes de la table sélectionnée
    const columns = useColumns(selectedTable);
    // Initialise et gère l'état des colonnes sélectionnées
    const [selectedColumns, setSelectedColumns] = useState([]);

    // Initialise et gère l'état de la limite et du décalage (offset) pour la requête SQL
    const [limit, setLimit] = useState(null);
    const [offset, setOffset] = useState(null);

    // Utilise les hooks personnalisés pour gérer les conditions WHERE et ORDER BY pour la requête SQL
    const { whereConditions, handleAddWhereClick, clearWhereConditions } = useWhereConditions(columns);
    const { selectedOrderBy, orderDirection, handleOrderByChange, handleOrderDirectionChange, clearOrderBy } = useOrderBy(columns);


    // Initialise et gère l'état de la requête SQL éditée
    const [editedSqlQuery, setEditedSqlQuery] = useState('');

    // Utilise le hook useSqlQuery pour construire la requête SQL en fonction des états actuels
    const sqlQuery = useSqlQuery(selectedTable, selectedColumns, whereConditions, limit, offset, selectedOrderBy, orderDirection);

    // Initialise et gère l'état du résultat de la requête
    const [queryResult, setQueryResult] = useState([]);
    // Initialise et gère l'état de l'affichage des résultats
    const [showResults, setShowResults] = useState(false);
    // Initialise et gère l'état de la page actuelle des résultats
    const [currentPage, setCurrentPage] = useState(1);

    // Définit les gestionnaires d'événements pour les changements dans les entrées de l'interface utilisateur

    // Gestionnaire pour le changement de table sélectionnée.
    const handleTableChange = (event) => {
        setSelectedTable(event.target.value);
        setSelectedColumns([]);
    };


    // Gestionnaire pour le changement de colonne sélectionnée.
    const handleColumnChange = (event) => {
        const selectedOptions = Array.from(event.target.selectedOptions).map((option) => option.value);
        setSelectedColumns(selectedOptions);
    };

    // Gestionnaire pour le changement de la limite de la requête SQL.
    const handleLimitChange = (event) => {
        const value = event.target.value;
        // Si la valeur est une chaîne vide, utilisez null, sinon convertissez la valeur en entier.
        setLimit(value === '' ? null : parseInt(value));
    };

    // Gestionnaire pour le changement du décalage (offset) de la requête SQL.
    const handleOffsetChange = (event) => {
        const value = event.target.value;
        // Si la valeur est une chaîne vide, utilisez null, sinon convertissez la valeur en entier.
        setOffset(value === '' ? null : parseInt(value));
    };

    // Effet pour mettre à jour la requête SQL éditée chaque fois que la requête SQL est mise à jour.
    useEffect(() => {
        setEditedSqlQuery(sqlQuery);
    }, [sqlQuery]);

    // Gestionnaire pour le changement de la requête SQL éditée.
    const handleSqlQueryChange = (event) => {
        setEditedSqlQuery(event.target.value);
    };

    // Gestionnaire pour l'importation d'une requête SQL.
    const handleImport = (query) => {
        setEditedSqlQuery(query);
    };


    // Réinitialise tous les états de la requête SQL.
    const resetQuery = () => {
        setSelectedTable('');
        setSelectedColumns([]);
        setLimit(null);
        setOffset(null);
        // Réinitialise les conditions WHERE et ORDER BY.
        clearWhereConditions();
        clearOrderBy();
        setEditedSqlQuery('');
    };

    // Calcule les indices de début et de fin pour la pagination des résultats.
    const endIndex = currentPage * RESULTS_PER_PAGE;
    const startIndex = endIndex - RESULTS_PER_PAGE;
    const currentResults = useMemo(() => queryResult.slice(startIndex, endIndex), [queryResult, startIndex, endIndex]);

    // Exécute la requête SQL.
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
            setQueryResult(result);
            setShowResults(true);
        } else {
            console.error('Erreur lors de l\'exécution de la requête SQL');
        }
    };

    // Exporte les résultats de la requête SQL au format CSV.
    const exportToCsv = () => {
        const csv = Papa.unparse({
            fields: Object.keys(queryResult[0]),
            data: queryResult
        }, {
            delimiter: ";"
        });

        const csvData = new Blob([csv], { type: 'text/csv; charset = utf - 8; ' });
        const csvURL = window.URL.createObjectURL(csvData);
        const tempLink = document.createElement('a');
        tempLink.href = csvURL;
        tempLink.setAttribute('download', 'export.csv');
        tempLink.click();
    };

    // Obtient les clés du résultat de la requête pour être utilisées comme en-têtes de tableau.
    const queryResultKeys = useMemo(() => queryResult.length > 0 ? Object.keys(queryResult[0]) : [], [queryResult]);


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
                                        {queryResultKeys.map((key, index) => (
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
                                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(queryResult.length / RESULTS_PER_PAGE)))}
                                    disabled={currentPage === Math.ceil(queryResult.length / RESULTS_PER_PAGE)}
                                >
                                    Page suivante
                                </button>
                            </div>
                            <p>  Page {currentPage} sur {Math.ceil(queryResult.length / RESULTS_PER_PAGE)}</p>
                            <button className="btn btn-primary" onClick={exportToCsv}>Exporter en CSV</button>
                        </>
                    ) : (
                        <p>Pas de résultats</p>
                    )}
                    <button className="btn btn-secondary" onClick={() => setShowResults(false)}>Retour</button>
                </div>
            )}
        </div>
    );
}

export default App;