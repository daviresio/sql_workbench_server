
const extractErrorMessage = e => {
    return JSON.stringify({message: Object.getOwnPropertyDescriptor(e, 'message').value})
}

module.exports = {
    extractErrorMessage,
}