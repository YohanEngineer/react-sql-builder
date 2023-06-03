import { useState } from 'react';
import Swal from 'sweetalert2';

const useWhereConditions = (columns) => {
  const [whereConditions, setWhereConditions] = useState([]);

  function getWhereOperatorsForColumnType(columnType) {
    switch (columnType) {
      case 'character varying':
        return ['=', '<>', '>', '<', '>=', '<=', 'IN', 'NOT IN', 'IS NULL', 'IS NOT NULL'];
      case 'bigint':
        return ['=', '<>', '>', '<', '>=', '<=', 'IN', 'NOT IN', 'IS NULL', 'IS NOT NULL'];
      case 'integer':
        return ['=', '<>', '>', '<', '>=', '<=', 'IN', 'NOT IN', 'IS NULL', 'IS NOT NULL'];
      case 'date':
        return ['=', '<>', '>', '<', '>=', '<=', 'IN', 'NOT IN', 'IS NULL', 'IS NOT NULL'];
      case 'boolean':
        return ['=', '<>', 'IS NULL', 'IS NOT NULL'];
      default:
        return [];
    }
  }


  const openFilterDialog = async () => {
    const columnsOptions = columns
      .slice()
      .sort()
      .map((column) => `<option value="${column.column_name}" data-type="${column.data_type}">${column.column_name} (${column.data_type})</option>`)
      .join('');

    const { value: formValues } = await Swal.fire({
      title: 'Ajouter une condition WHERE',
      width: 1000,
      html:
        '<label for="swal-column">Colonnes:</label>' +
        `<select id="swal-column" class="swal2-input">${columnsOptions}</select>` + '<br></br>' +
        '<label for="swal-operator">Opérateur:</label>' +
        '<select id="swal-operator" class="swal2-input"></select>' + '<br></br>' +
        '<label for="swal-value">Valeur:</label>' +
        '<input id="swal-value" class="swal2-input" placeholder="Valeur">',
      focusConfirm: false,
      didOpen: () => {
        const columnSelect = document.getElementById('swal-column');
        const operatorSelect = document.getElementById('swal-operator');

        const updateOperators = () => {
          const selectedColumnType = columnSelect.options[columnSelect.selectedIndex].dataset.type;
          const operators = getWhereOperatorsForColumnType(selectedColumnType);
          operatorSelect.innerHTML = operators
            .map((operator) => `<option value="${operator}">${operator}</option>`)
            .join('');
        };

        columnSelect.addEventListener('change', updateOperators);
        updateOperators();
      },
      preConfirm: () => {
        return {
          columnName: document.getElementById('swal-column').value,
          operator: document.getElementById('swal-operator').value,
          value: document.getElementById('swal-value').value,
        };
      },
    });

    if (formValues) {
      return {
        columnName: formValues.columnName,
        columnType: columns.find((column) => column.column_name === formValues.columnName).data_type,
        operator: formValues.operator,
        value: formValues.value,
      };
    } else {
      return null;
    }
  };


  const handleAddWhereClick = async () => {
    const filterCondition = await openFilterDialog();

    if (filterCondition) {
      setWhereConditions((prevConditions) => [...prevConditions, filterCondition]);
    }
  };

  const clearWhereConditions = () => {
    setWhereConditions([]);
  };

  return { whereConditions, handleAddWhereClick, clearWhereConditions };

};

export default useWhereConditions;
