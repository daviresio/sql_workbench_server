
const dataTypeIdPostgresToString = v => {
    switch (v) {
        case 16:
            return 'bool';
        case 20:
        case 21:
        case 23:
            return 'int';
        case 1043:
            return 'varchar';
        case 1114:
            return 'timestamp';
        case 1700:
            return 'numeric';
        // case :
        //     return '';
        // case :
        //     return '';
        // case :
        //     return '';
        default:
            console.log(v)
            throw new Error(`DataType nao encontrado, oid ${v}`)
    }
}


module.exports = {
    dataTypeIdPostgresToString,
}