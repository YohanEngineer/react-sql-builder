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


    // Définit les gestionnaires d'événements pour les changements dans les entrées de l'interface utilisateur

    // Gestionnaire pour le changement de table sélectionnée.
    const handleTableChange = (event) => {
        setSelectedTable(event.target.value);
        setSelectedColumns([]);
        setSelectedForeignTables([]); // Réinitialise les tables étrangères sélectionnées
        setForeignKeys([]); // Réinitialise les relations de clés étrangères
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

    const [selectedForeignTables, setSelectedForeignTables] = useState([]);

    // Initialise et gère l'état des relations de clés étrangères
    const [foreignKeys, setForeignKeys] = useState([]);

    useEffect(() => {
        const fetchForeignKeys = async () => {
            const response = await fetch(`http://localhost:9999/information-schema/foreign-keys/${selectedTable}`);
            const data = await response.json();

            // Prépare un tableau pour stocker les tables et les colonnes étrangères uniques
            const foreignTablesAndColumns = [];

            data.forEach(fk => {
                // Vérifie si la table étrangère est déjà dans le tableau
                const foreignTableIndex = foreignTablesAndColumns.findIndex(foreign => foreign.tableName === fk.foreignTableName);

                if (foreignTableIndex === -1) {
                    // Si la table étrangère n'est pas déjà dans le tableau, ajoutez-la avec la colonne correspondante
                    foreignTablesAndColumns.push({
                        tableName: fk.foreignTableName,
                        columnNames: [fk.foreignColumnName]
                    });
                } else {
                    // Si la table étrangère est déjà dans le tableau, ajoutez simplement la colonne à la liste des colonnes
                    foreignTablesAndColumns[foreignTableIndex].columnNames.push(fk.foreignColumnName);
                }
            });

            // Mettre à jour l'état avec les tables et les colonnes étrangères
            setForeignKeys(foreignTablesAndColumns);
        };

        if (selectedTable) {
            fetchForeignKeys();
        }
    }, [selectedTable]);



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
                        </div>
                        <div className="select-container">
                            {selectedTable && (
                                <ColumnSelect columns={columns} selectedColumns={selectedColumns} onChange={handleColumnChange} />
                            )}
                        </div>
                        <div className="select-container">
                            {selectedTable && foreignKeys.length > 0 && (
                                <div>
                                    <label>Tables étrangères :</label>
                                    <br />
                                    <br />
                                    <select multiple value={selectedForeignTables}>
                                        {foreignKeys.map((foreignKey, index) => (
                                            <option key={index} value={foreignKey.tableName}>{foreignKey.tableName}</option>
                                        ))}
                                    </select>
                                </div>
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
                            <textarea className="sql-query-input" value={editedSqlQuery} onChange={handleSqlQueryChange} rows="6" cols="80"></textarea>
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
                    <div style={{ maxHeight: "800px", overflow: "auto", width: "1000px" }}>
                        {queryResult && queryResult.length > 0 ? (
                            <table className="table">
                                <thead>
                                    <tr>
                                        {queryResultKeys.map((key, index) => (
                                            <th key={index}>{key}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {queryResult.map((row, rowIndex) => (
                                        <tr key={rowIndex}>
                                            {Object.values(row).map((value, valueIndex) => (
                                                <td key={valueIndex}>{value !== null ? value : "NULL"}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p>Pas de résultats</p>
                        )}
                    </div>
                    {queryResult && queryResult.length > 0 && (
                        <div>
                            <button className="btn btn-primary" onClick={exportToCsv}>Exporter en CSV</button>
                        </div>
                    )}
                    <div>
                        <button className="btn btn-secondary" onClick={() => setShowResults(false)}>Retour</button>
                    </div>
                </div>

            )}
        </div>
    );
}

export default App;