import { useState, useEffect } from 'react';

const useSqlQuery = (selectedTable, selectedColumns, whereConditions, limit, offset, selectedOrderBy, joins) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!selectedTable) {
      setQuery('');
      return;
    }

    const generateJoinString = (join) => {
      const foreignTableName = join.foreignTableName;
      const foreignColumnName = join.foreignColumnName;
      const tableName = join.tableName;
      const joinType = join.joinType || 'JOIN';
      const column = join.columnName;
      return `${joinType} ${foreignTableName} ON ${tableName}.${column} = ${foreignTableName}.${foreignColumnName}`;
    };

    const generateConditionString = (condition) => {
      const { columnName, columnType, operator, value } = condition;
      const isNumericColumn = ['integer', 'bigint', 'numeric', 'float'].includes(columnType);

      if (['IS NULL', 'IS NOT NULL'].includes(operator)) {
        return `${columnName} ${operator}`;
      } else if (['IN', 'NOT IN'].includes(operator)) {
        const valuesList = value.split(',').map(item => item.trim());
        const formattedValues = valuesList.map(item => isNumericColumn || columnType === 'boolean' ? item : `'${item}'`).join(', ');
        return `${columnName} ${operator} (${formattedValues})`;
      } else {
        if (isNumericColumn || columnType === 'boolean') {
          return `${columnName} ${operator} ${value}`;
        } else if (columnType === 'character varying' || columnType === 'date') {
          return `${columnName} ${operator} '${value}'`;
        } else {
          throw new Error(`Type de colonne non pris en charge : ${columnType}`);
        }
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

    if (joins.length > 0) {
      console.log('joins', joins);
      joins.forEach((join) => {
        queryString += `\n${generateJoinString(join)}`;
      });
    }
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
    setQuery(queryString);
  }, [selectedTable, selectedColumns, whereConditions, limit, offset, selectedOrderBy, joins]);

  return query;
};

export default useSqlQuery;
