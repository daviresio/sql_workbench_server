const {Client} = require('pg')
require('../pg_config')

const {extractErrorMessage} = require('../../shared/error')
const {sucessResponse, errorResponse} = require('../../shared/response')
const {clientBuilder} = require('../../shared/connection_util')
const {typesToMap, fetchTableData, getPrimaryKeyValue, putQuoteStringValue} = require('../../shared/map_fields_util')

module.exports.handler = async (event) => {
    const body = JSON.parse(event.body)
    const client = new Client(clientBuilder(body.connection))
    try {
        await client.connect()

        const reqData = typesToMap(body.types)

        if(reqData.size > 1) {
            return errorResponse(JSON.stringify({message: 'Has more one table in this query'}))
        }

        let tables = await fetchTableData(client, reqData)


        const updatesQueries = tables.map(async v => {
            const primaryKeyValue = getPrimaryKeyValue(v, body.data)
            const query = `UPDATE ${v.tableName} SET ${v.columnNames.map(v => `${v.originalColumnName} = ${putQuoteStringValue(body.data[v.reqColumnName])}`).join(', ')} WHERE ${v.primaryKey} = ${primaryKeyValue}`
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