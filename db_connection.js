const mongooseDB = require('mongoose')

async function db_connection(){
    return await mongooseDB.connect('mongodb+srv://smcc89:9NZWozUtp5CVn3sQ@clusterx.5ycdph1.mongodb.net/Myntra')
}

module.exports = db_connection