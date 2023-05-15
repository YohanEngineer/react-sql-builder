import React from 'react';

export const ImportButton = ({ onImport }) => {
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        
        if (file && file instanceof Blob) {
          const reader = new FileReader();
      
          reader.onload = (e) => {
            const importedQuery = e.target.result;
            onImport(importedQuery);
          };
      
          reader.readAsText(file);
        }
      };
      

  return (
    <label htmlFor="import-input" className="btn btn-primary">
      <input id="import-input" type="file" accept=".sql" style={{ display: 'none' }} onChange={handleFileChange} />
      Importer une requête
    </label>
  );
};
