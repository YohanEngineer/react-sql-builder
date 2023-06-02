import React from 'react';
import { useEffect } from 'react';

const JoinSelect = ({ joins, foreignKeys, onChange, onRemove }) => {
    const handleForeignTableChange = (event) => {
        onChange({
            ...joins,
            foreignTableName: event.target.value,
            foreignColumnName: ''
        });
    };

    const handleForeignColumnChange = (event) => {
        onChange({
            ...joins,
            foreignColumnName: event.target.value
        });
    };

    const handleJoinTypeChange = (event) => {
        onChange({
            ...joins,
            joinType: event.target.value
        });
    };

    const handleColumnNameChange = () => {
        const relevantForeignKey = foreignKeys.find(fk => fk.foreignTableName === joins.foreignTableName);
        if (relevantForeignKey) {
            onChange({
                ...joins,
                columnName: relevantForeignKey.columnName
            });
        }
    };

    useEffect(() => {
        handleColumnNameChange();
    }, [joins.foreignTableName]);

    const foreignKeyOptions = foreignKeys.filter(
        (fk) => fk.foreignTableName === joins.foreignTableName
    );

    return (
        <div className="joins-select-container">
            <select
                className="form-select"
                value={joins.joinType || ''}
                onChange={handleJoinTypeChange}
            >
                <option value="">Type de jointure</option>
                <option value="JOIN">JOIN</option>
                <option value="LEFT JOIN">LEFT JOIN</option>
            </select>
            <select
                className="form-select"
                value={joins.foreignTableName}
                onChange={handleForeignTableChange}
            >
                <option value="">Sélectionnez une table</option>
                {foreignKeys.map((fk, index) => (
                    <option key={index} value={fk.foreignTableName}>
                        {fk.foreignTableName}
                    </option>
                ))}
            </select>
            {joins.foreignTableName && (
                <select
                    className="form-select"
                    value={joins.foreignColumnName}
                    onChange={handleForeignColumnChange}
                >
                    <option value="">Sélectionnez une colonne</option>
                    {foreignKeyOptions.map((fk, index) => (
                        <option key={index} value={fk.foreignColumnName}>
                            {fk.foreignColumnName}
                        </option>
                    ))}
                </select>
            )}
            <button className="btn btn-sm btn-light" onClick={onRemove}>
                Retirer
            </button>
        </div>
    );
};

export default JoinSelect;
