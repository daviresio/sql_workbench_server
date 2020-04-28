
const extractErrorMessage = e => {
    return Object.getOwnPropertyDescriptor(e, 'message').value
}

module.exports = {
    extractErrorMessage,
}