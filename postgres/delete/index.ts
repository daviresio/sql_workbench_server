const {Client} = require('pg')
require('../pg_config')

const {extractErrorMessage} = require('../../shared/error')
const {sucessResponse, errorResponse} = require('../../shared/response')
const {clientBuilder} = require('../../shared/connection_util')
const {typesToMap, fetchTableData, getPrimaryKeyValue} = require('../../shared/map_fields_util')

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

        const primaryKeyValue = getPrimaryKeyValue(tables[0], body.data)
        const result = await client.query(`DELETE FROM ${tables[0].tableName} WHERE ${tables[0].primaryKey} = ${primaryKeyValue}`)

       if(result.rowCount === 0) {
           return errorResponse(JSON.stringify({message: `${tables[0].tableName} with ${tables[0].primaryKey} = ${primaryKeyValue} not found`}))
       }

        return sucessResponse()
    } catch (e) {
        return errorResponse(extractErrorMessage(e))
    } finally {
       if(client) await client.end()
    }
}