const typesToMap = types => {
    const reqData = new Map()

    types.forEach((type) => {
        const tableId = type.tableId.toString()
        if(!reqData.has(tableId)) {
            reqData.set(tableId, []);
        }
        reqData.set(tableId, [...reqData.get(tableId), {columnName: type.columnName, columnIndex: type.columnIndex,}])
    })

    return reqData
}

const fetchTableData = async (client, reqData) => {
    const data = Array.from(reqData.keys()).map(async key => {
        let tableName = await client.query(`select relname from pg_class where oid = ${Number(key)}`)
        tableName = tableName.rows[0].relname

        let columnNames = await client.query(`select column_name, ordinal_position from information_schema.columns where table_name = '${tableName}'`)

        columnNames = columnNames.rows.map((column => {
            let reqColumnName = reqData.get(key).filter(x => x.columnIndex === column.ordinal_position)[0]
            if(reqColumnName === undefined) throw new Error(`primary key not present in query for table ${tableName}`)
            columnName = column.column_name

            return {
                originalColumnName: column.column_name,
                columnIndex: column.ordinal_position,
                reqColumnName,
            }
        }))

        let primaryKey = await client.query(`select column_name from information_schema.key_column_usage where table_name = '${tableName}' and constraint_name like '%pk%'`)

        if(!primaryKey.rows.length) {
            throw new Error(`primary key not found for table ${tableName}`)
        }

        primaryKey = primaryKey.rows[0].column_name

        return {
            tableId: key,
            tableName,
            columnNames,
            primaryKey,
        }

    })

    return Promise.all(data)

}

const getPrimaryKeyValue = (tableData, data) => {
    const primaryKeyColumnsName = tableData.columnNames.filter(v => {
        return v.originalColumnName === tableData.primaryKey
    })[0]

    if(!primaryKeyColumnsName) {
        throw new Error(`no primary key found, primary key must be send`)
    }
    return data[primaryKeyColumnsName.reqColumnName.columnName]
}

const putQuoteStringValue = v => {
    if(typeof v === "string") {
        v = `'${v}'`
    }

    if(v === null) {
        return 'null'
    }

    return v
}

module.exports = {
    typesToMap,
    fetchTableData,
    getPrimaryKeyValue,
    putQuoteStringValue,
}