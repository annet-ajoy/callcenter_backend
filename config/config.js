const Redis = require('ioredis');
if(process.env.PRODUCTION == 'developmentLive'){
    var redis = new Redis({
        host: process.env.REDIS_HOST,  // Redis server hostname (default is localhost)
        port: process.env.REDIS_PORT,         // Redis server port (default is 6379)
        db: 0               // Redis database index (default is 0)
      })
}
if(process.env.PRODUCTION == 'live'){
    var redis = new Redis({
        host: process.env.REDIS_HOST,  // Redis server hostname (default is localhost)
        port: process.env.REDIS_PORT,         // Redis server port (default is 6379)
        password:process.env.REDIS_PASSWORD,
        db: 0               // Redis database index (default is 0)
      })
}
if(process.env.PRODUCTION == 'development' && process.env.ENABLE_LOCAL_REDIS === "yes") {
    var redis = new Redis({
        host: process.env.REDIS_HOST,  // Redis server hostname (default is localhost)
        port: process.env.REDIS_PORT,         // Redis server port (default is 6379)
        db: 0               // Redis database index (default is 0)
      })
}
module.exports = {
    url:process.env.DB_MONGODB,
     redis : redis
}