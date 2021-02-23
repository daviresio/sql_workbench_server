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

        let table = await fetchTableData(client, reqData)
        table = table[0]


        const saveQuery = async () => {
            let keys = table.columnNames.map(v => {
                return [v.originalColumnName, v.reqColumnName.columnName]
            })

            //se o id for nullo, mesmo com autoincrement, ele da erro de non-null, entao removo todos os null
            keys = keys.filter(v => body.data[v[1]] !== null)

            const query = `INSERT INTO "${table.tableName}"(${keys.map(v => {return v[0]}).join(', ')}) values (${keys.map(v => v[1]).map(v => putQuoteStringValue(body.data[v])).join(', ')});`
            return await client.query(query)
        }

        const result = await saveQuery()
        return sucessResponse()
    } catch (e) {
        return errorResponse(extractErrorMessage(e))
    } finally {
        if(client) await client.end()
    }
}