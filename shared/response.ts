const sucessResponse = (v = '') => {
    return {
        statusCode: 200,
        body: JSON.stringify(v)
    }
}

const errorResponse = error => {
    return {
        statusCode: 500,
        body: error
    }
}

module.exports = {
    sucessResponse,
    errorResponse,
}