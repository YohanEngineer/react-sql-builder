import React from 'react';

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

    const foreignKeyOptions = foreignKeys.filter(
        (fk) => fk.foreignTableName === joins.foreignTableName
    );

    return (
        <div className="joins-select-container">
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
