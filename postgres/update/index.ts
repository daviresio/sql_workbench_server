import {Client} from 'pg'
import '../pg_config'

import {extractErrorMessage} from '../../shared/error'
import {sucessResponse, errorResponse} from '../../shared/response'
import {clientBuilder} from '../../shared/connection_util'
import {typesToMap, fetchTableData, getPrimaryKeyValue, putQuoteStringValue} from '../../shared/map_fields_util'

export const handler = async (event) => {
    const body = JSON.parse(event.body)

    const client = new Client(clientBuilder(body.connection))
    try {
        await client.connect()

        const reqData = typesToMap(body.types)

        // if(reqData.size > 1) {
        //     return errorResponse(JSON.stringify({message: 'Has more one table in this query'}))
        // }

        let tables = await fetchTableData(client, reqData)


        const updatesQueries = tables.map(async v => {
            const primaryKeyValue = getPrimaryKeyValue(v, body.data)
            const query = `UPDATE "${v.tableName}" SET ${v.columnNames.map(x => {
                return `${x.originalColumnName} = ${putQuoteStringValue(body.data[x.reqColumnName.columnName])}`}
                ).join(', ')} WHERE ${v.primaryKey} = ${primaryKeyValue}`
            const result = await client.query(query)
            if(result.rowCount === 0) {
                throw new Error(`${v.tableName} with ${v.primaryKey} = ${primaryKeyValue} cant be changed`)
            }
        })

        await Promise.all(updatesQueries)
        return sucessResponse()
    } catch (e) {
        return errorResponse(extractErrorMessage(e))
    } finally {
       if(client) await client.end()
    }
}