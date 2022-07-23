const redis = require("redis");

//----------------- Redis Connnect ------------------------//

const redisClient = redis.createClient(
  17869,
  "redis-17869.c301.ap-south-1-1.ec2.cloud.redislabs.com",
  { no_ready_check: true }
);

redisClient.auth("DlU3RpnMh17htVWvzB1v2V1Fq0di9ENQ");

//------ Connect to the Server---------------->>

redisClient.on("connect", async function (err) {
  console.log("Connected to Redis!");
});

module.exports = { redisClient };
