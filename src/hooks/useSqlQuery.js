import { useMemo } from 'react';

const useSqlQuery = (selectedTable, selectedColumns, whereConditions, limit, offset, selectedOrderBy, joins) => {

  const query = useMemo(() => {
    if (!selectedTable) {
      return '';
    }

    console.log('useMemo called');


    const generateJoinString = (join) => {
      const foreignTableName = join.foreignTableName;
      const foreignColumnName = join.foreignColumnName;
      return `JOIN ${foreignTableName} ON ${selectedTable}.${foreignColumnName} = ${foreignTableName}.${foreignColumnName}`;
    };

    const generateConditionString = (condition) => {
      const { columnName, columnType, operator, value } = condition;
      const isNumericColumn = ['integer', 'bigint', 'numeric', 'float'].includes(columnType);

      // Pour 'IS NULL' et 'IS NOT NULL', la valeur n'est pas nécessaire
      if (['IS NULL', 'IS NOT NULL'].includes(operator)) {
        return `${columnName} ${operator}`;
      }
      // Pour 'IN' et 'NOT IN', traiter la valeur comme une liste séparée par des virgules
      else if (['IN', 'NOT IN'].includes(operator)) {
        const valuesList = value.split(',').map(item => item.trim());
        const formattedValues = valuesList.map(item => isNumericColumn || columnType === 'boolean' ? item : `'${item}'`).join(', ');
        return `${columnName} ${operator} (${formattedValues})`;
      }
      // Pour les autres opérateurs, formattez simplement la valeur en fonction du type de colonne
      else {
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

    console.log("length :: " + joins.length);

    if (joins.length > 0) {
      joins.forEach((join) => {
        console.log(join);
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
    console.log(queryString);
    return queryString;
  }, [selectedTable, selectedColumns, whereConditions, limit, offset, selectedOrderBy, joins]);

  return query;
};

export default useSqlQuery;
