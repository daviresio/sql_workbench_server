//TODO implementar conexao por ssl

export const clientBuilder = v => {
    return  {
        host: v.host,
        user: v.user,
        password: v.password,
        database: v.databaseName,
        port: v.port,
    }
}