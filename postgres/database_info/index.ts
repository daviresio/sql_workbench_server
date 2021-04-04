import {Client} from 'pg'
import '../pg_config'

import {extractErrorMessage} from '../../shared/error'
import {sucessResponse, errorResponse} from '../../shared/response'
import {clientBuilder} from '../../shared/connection_util'
import {nonNullArr} from '../../shared/operation_util'

export const handler = async (event) => {
    let client
    try {
        const body = JSON.parse(event.body)
        client = new Client(clientBuilder(body))
        console.log('############### ENTREI ###############');

        await client.connect()
        const resDatabases = await client.query("SELECT datname FROM pg_database")
        const resSchemas = await client.query("SELECT schema_name FROM information_schema.schemata")
        const resCurrentSchema = await client.query("SELECT current_schema()")

        const currentSchema = resCurrentSchema.rows[0].current_schema

        const resTables = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = '${currentSchema}'`)
        const resViews = await client.query(`SELECT table_name FROM information_schema.views WHERE table_schema = '${currentSchema}'`)
        const resStoreProducers = await client.query(`SELECT proname FROM pg_catalog.pg_namespace n JOIN pg_catalog.pg_proc p ON pronamespace = n.oid WHERE nspname = '${currentSchema}'`)
        const resFunctions = await client.query(`SELECT routines.routine_name FROM information_schema.routines WHERE routines.specific_schema='${currentSchema}'`)

        const responseBody = {
            databases: nonNullArr(resDatabases.rows).map(v => v.datname),
            schemas: nonNullArr(resSchemas.rows).map(v => v.schema_name),
            currentSchema,
            tables: nonNullArr(resTables.rows).map(v => v.table_name),
            views: nonNullArr(resViews.rows).map(v => v.table_name),
            storeProducers: nonNullArr(resStoreProducers.rows).map(v => v.proname),
            functions: nonNullArr(resFunctions.rows).map(v => v.routine_name),
        }

        //@ts-ignore
        return sucessResponse(responseBody)
    } catch (e) {
        return errorResponse(extractErrorMessage(e))
    } finally {
        if(client) await client.end()
    }

}