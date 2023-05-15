import React from 'react';

export const LimitSelect = ({ limit, onChange }) => (
    <>
        <label htmlFor="limit-input" className="form-label">Sélectionnez une limite:</label>
        <input
            id="limit-input"
            className="form-control"
            type="number"
            min="1"
            value={limit === null ? '' : limit}
            placeholder="1"
            onChange={onChange}
        />
    </>
);
