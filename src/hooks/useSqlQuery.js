import { useMemo } from 'react';

const useSqlQuery = (selectedTable, selectedColumns, whereConditions, limit, offset, selectedOrderBy) => {
  const query = useMemo(() => {
    if (!selectedTable) {
      return '';
    }

    const columnsString = selectedColumns.length > 0 ? selectedColumns.join(', ') : '*';
    let queryString = `SELECT ${columnsString} \nFROM ${selectedTable}`;

    if (whereConditions.length > 0) {
      const whereString = whereConditions
        .map((condition) => `${condition.columnName} ${condition.operator} '${condition.value}'`)
        .join(' \nAND ');
      queryString += ` \nWHERE ${whereString}`;
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
