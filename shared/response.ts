export const sucessResponse = (v = '') => {
    return {
        statusCode: 200,
        body: JSON.stringify(v)
    }
}

export const errorResponse = error => {
    return {
        statusCode: 500,
        body: error
    }
}
