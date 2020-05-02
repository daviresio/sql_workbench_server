const {Client} = require('pg')
require('../pg_config')

const {extractErrorMessage} = require('../../shared/error')
const {sucessResponse, errorResponse} = require('../../shared/response')
const {clientBuilder} = require('../../shared/connection_util')
const {dataTypeIdPostgresToString} = require('../../shared/data_type_util')


module.exports.handler = async (event) => {
    const body = JSON.parse(event.body)
    const client = new Client(clientBuilder(body.connection))

    try {
        await client.connect()
        const res = await client.query(body.query)
        console.log(res)
        return sucessResponse({data: res.rows, types: res.fields.map(v => ({
                columnName: v.name,
                tableId: v.tableID,
                columnIndex: v.columnID,
                dataType: dataTypeIdPostgresToString(v.dataTypeID)
            }))})
    } catch (e) {
        return errorResponse(extractErrorMessage(e))
    } finally {
       if(client) await client.end()
    }
}