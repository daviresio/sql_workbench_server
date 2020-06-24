
const dataTypeIdPostgresToString = v => {
    switch (v) {
        case 16:
            return 'bool';
        case 20:
        case 21:
        case 23:
            return 'int';
        case 25:
            return 'text';
        case 1043:
            return 'varchar';
        case 1114:
        case 1184:
            return 'timestamp';
        case 1700:
            return 'numeric';
        default:
            console.log(v)
            throw new Error(`DataType nao encontrado, oid ${v}`)
    }
}


module.exports = {
    dataTypeIdPostgresToString,
}