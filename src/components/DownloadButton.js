import React from 'react';
import Swal from 'sweetalert2';


export const DownloadButton = ({ sqlQuery }) => {
  const downloadQuery = () => {
    Swal.fire({
      title: 'Nom du fichier',
      input: 'text',
      inputLabel: 'Saisissez le nom du fichier',
      showCancelButton: true,
      confirmButtonText: 'Télécharger',
      cancelButtonText: 'Annuler',
      inputValidator: (value) => {
        if (!value) {
          return 'Le nom du fichier est requis';
        }
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const filename = result.value;
        const blob = new Blob([sqlQuery], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.sql`;
        link.click();
      }
    });
  };
  

  return (
    <button className="btn btn-primary" onClick={downloadQuery}>
      Télécharger la requête
    </button>
  );
};
