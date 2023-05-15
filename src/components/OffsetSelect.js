import React from 'react';

export const OffsetSelect = ({ offset, onChange }) => (
    <>
        <label htmlFor="offset-input" className="form-label">Sélectionnez un offset:</label>
        <input
            id="offset-input"
            className="form-control"
            type="number"
            min="0"
            value={offset === null ? '' : offset}
            placeholder="1"
            onChange={onChange}
        />
    </>
);
