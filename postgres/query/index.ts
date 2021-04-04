import {Client} from 'pg'
import '../pg_config'

import {extractErrorMessage} from '../../shared/error'
import {sucessResponse, errorResponse} from '../../shared/response'
import {clientBuilder} from '../../shared/connection_util'
import {dataTypeIdPostgresToString} from '../../shared/data_type_util'


export const handler = async (event) => {
    const body = JSON.parse(event.body)
    const client = new Client(clientBuilder(body.connection))

    try {
        await client.connect()
        const res = await client.query(body.query)
        //@ts-ignore
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