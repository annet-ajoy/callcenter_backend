
var getConnection = require('../database').getConnection;

async function check_token_valid(id,password,table,column)
{
            var sql =`select id from ${table} where id = ${id}`;
            var [result] = await getConnection.query(sql);
            return result
}


module.exports = {
    check_token_valid
}