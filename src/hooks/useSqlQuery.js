import { useMemo } from 'react';

const useSqlQuery = (selectedTable, selectedColumns, whereConditions, limit, offset, selectedOrderBy) => {


  const query = useMemo(() => {
    if (!selectedTable) {
      return '';
    }

    const generateConditionString = (condition) => {
      const { columnName, columnType, operator, value } = condition;
      const isNumericColumn = ['integer', 'bigint', 'numeric', 'float'].includes(columnType);

      // Construire la condition WHERE en fonction du type de colonne
      if (isNumericColumn) {
        return `${columnName} ${operator} ${value}`;
      } else {
        return `${columnName} ${operator} '${value}'`;
      }
    };

    const generateWhereString = () => {
      if (whereConditions.length > 0) {
        return whereConditions.map(generateConditionString).join('\nAND ');
      }
      return '';
    };

    const columnsString = selectedColumns.length > 0 ? selectedColumns.join(', ') : '*';
    let queryString = `SELECT ${columnsString} \nFROM ${selectedTable}`;

    if (whereConditions.length > 0) {
      const whereString = generateWhereString();
      if (whereString) {
        queryString += ` \nWHERE ${whereString}`;
      }
    }

    if (selectedOrderBy.length > 0) {
      const orderByString = selectedOrderBy
        .map((item) => `${item.column} ${item.direction}`)
        .join(', ');
      queryString += ` \nORDER BY ${orderByString}`;
    }

    if (limit !== null) {
      queryString += ` \nLIMIT ${limit}`;
    }

    if (offset !== null) {
      queryString += ` \nOFFSET ${offset}`;
    }

    queryString += ';';
    return queryString;
  }, [selectedTable, selectedColumns, whereConditions, limit, offset, selectedOrderBy]);

  return query;
};

export default useSqlQuery;
