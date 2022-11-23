const redis = require("redis");

//----------------- Redis Connnect ------------------------//

const redisClient = redis.createClient(
  12972,
  "redis-12972.c305.ap-south-1-1.ec2.cloud.redislabs.com",
  { no_ready_check: true }
);

redisClient.auth("aJQtcUSNQTbEEWtici6UobB630zRYyRn");

//------ Connect to the Server---------------->>

redisClient.on("connect", async function (err) {
  console.log("Connected to Redis!");
  
});

module.exports = { redisClient };
