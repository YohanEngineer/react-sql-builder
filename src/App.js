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
import JoinSelect from './components/JoinSelect';
// Importe des hooks personnalisés pour la récupération de données
import { useTables } from './hooks/useTables';
import { useColumns } from './hooks/useColumns';
import useSqlQuery from './hooks/useSqlQuery';
import useWhereConditions from './hooks/useWhereConditions';
import useOrderBy from './hooks/useOrderBy';
import useForeignTables from './hooks/useForeignTables';
// Importe le CSS de l'application
import './App.css';

// Définition du composant App
function App() {
    // Utilise le hook useTables pour récupérer les tables disponibles
    const tables = useTables();
    // Initialise et gère l'état de la table sélectionnée
    const [selectedTable, setSelectedTable] = useState('');

    // Utilise le hook useColumns pour récupérer les colonnes de la table sélectionnée
    const { columns, setColumns } = useColumns(selectedTable);
    // Initialise et gère l'état des colonnes sélectionnées
    const [selectedColumns, setSelectedColumns] = useState([]);

    // Initialise et gère l'état de la limite et du décalage (offset) pour la requête SQL
    const [limit, setLimit] = useState(null);
    const [offset, setOffset] = useState(null);

    // Utilise les hooks personnalisés pour gérer les conditions WHERE et ORDER BY pour la requête SQL
    const { whereConditions, handleAddWhereClick, clearWhereConditions } = useWhereConditions(columns);
    const { selectedOrderBy, handleOrderByChange, handleOrderDirectionChange, clearOrderBy } = useOrderBy(columns);


    // Initialise et gère l'état de la requête SQL éditée
    const [editedSqlQuery, setEditedSqlQuery] = useState('');

    const { foreignKeys, setForeignKeys } = useForeignTables(selectedTable);
    const [joins, setJoins] = useState([]);

    const handleAddJoinClick = () => {
        setJoins([...joins, { column: '', joinType: '', foreignTableName: '', foreignColumnName: '' }]);
    };

    const handleJoinChange = (index, updatedJoin) => {
        const newJoins = [...joins.slice(0, index), updatedJoin, ...joins.slice(index + 1)];
        setJoins(newJoins);
    };

    const handleRemoveJoinClick = (index) => {
        setJoins(joins.filter((join, joinIndex) => joinIndex !== index));
        const newColumns = columns.filter((column) => column.table !== joins[index].foreignTableName);
        setColumns(newColumns);
    };

    useEffect(() => {
        if (joins.length > 0) {
            const lastJoin = joins[joins.length - 1];
            if (lastJoin.foreignTableName && lastJoin.foreignColumnName) {
                fetch(`http://localhost:9999/information-schema/columns/${lastJoin.foreignTableName}`)
                    .then(response => response.json())
                    .then(data => {
                        data.forEach((column) => {
                            column.table = lastJoin.foreignTableName;
                        });
                        const newColumns = [...columns, ...data];
                        setColumns(newColumns);
                    }
                    );

                fetch(`http://localhost:9999/information-schema/foreign-keys/${lastJoin.foreignTableName}`)
                    .then(response => response.json())
                    .then(data => {
                        const newForeignKeys = [...foreignKeys, ...data];
                        const uniqueForeignKeys = newForeignKeys.filter((fk, index, self) =>
                            index === self.findIndex((t) => (
                                t.table === fk.table && t.columnName === fk.columnName
                            ))
                        );
                        setForeignKeys(uniqueForeignKeys);
                    }
                    );
            }
        }
    }, [joins]);


    // Utilise le hook useSqlQuery pour construire la requête SQL en fonction des états actuels
    const sqlQuery = useSqlQuery(selectedTable, selectedColumns, whereConditions, limit, offset, selectedOrderBy, joins);

    // Initialise et gère l'état du résultat de la requête
    const [queryResult, setQueryResult] = useState([]);
    // Initialise et gère l'état de l'affichage des résultats
    const [showResults, setShowResults] = useState(false);


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
        setJoins([]);
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
                            {selectedTable && joins.map((join, index) => (
                                <JoinSelect
                                    key={index}
                                    joins={join}
                                    foreignKeys={foreignKeys}
                                    onChange={(updatedJoin) => handleJoinChange(index, updatedJoin)}
                                    onRemove={() => handleRemoveJoinClick(index)}
                                />
                            ))}
                            {selectedTable && <button className="btn btn-light" onClick={handleAddJoinClick}><b>Ajouter une jointure</b></button>}
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