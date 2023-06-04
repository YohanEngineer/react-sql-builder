import { useEffect, useState } from 'react';
import axios from 'axios';

const useForeignTables = (selectedTable) => {
    const [foreignKeys, setForeignKeys] = useState([]);

    useEffect(() => {
        if (selectedTable) {
            axios.get(`http://172.31.249.233:9999/information-schema/foreign-keys/${selectedTable}`)
                .then(response => {
                    setForeignKeys(response.data);
                });
        }
    }, [selectedTable]);

    return { foreignKeys, setForeignKeys };
}

export default useForeignTables;
