const redis = require("redis");

//----------------- Redis Connnect ------------------------//

const redisClient = redis.createClient(
  14064,
  "redis-14064.c301.ap-south-1-1.ec2.cloud.redislabs.com",
  { no_ready_check: true }
);

redisClient.auth("PqUQxnu63j7X0pPsTqBoNRaHtrVMDuww", function (err) {
  if (err) throw err;
});

//------ Connect to the Server---------------->>

redisClient.on("connect", async function (err) {
  console.log("Connected to Redis!");
});

module.exports = { redisClient };
