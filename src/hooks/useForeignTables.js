import { useEffect, useState } from 'react';
import axios from 'axios';

const useForeignTables = (selectedTable) => {
    const [foreignKeys, setForeignKeys] = useState([]);

    useEffect(() => {
        if (selectedTable) {
            axios.get(`http://localhost:9999/information-schema/foreign-keys/${selectedTable}`)
                .then(response => {
                    setForeignKeys(response.data);
                });
        }
    }, [selectedTable]);

    return { foreignKeys, setForeignKeys };
}

export default useForeignTables;
