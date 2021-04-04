
export const extractErrorMessage = e => {
    let errorMessage = Object.getOwnPropertyDescriptor(e, 'message');
    return JSON.stringify({message: errorMessage?.value})
}