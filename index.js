// Require the framework and instantiate it
const app = require("fastify")({
  logger: true,
});

const cassandra = require("cassandra-driver");

var client = new cassandra.Client({
  contactPoints: ["127.0.0.1"],
  localDataCenter: "datacenter1", // here is the change required
  keyspace: "todo",
});
client.connect(function (err, result) {
  console.log("index: cassandra connected");
});

var getAllList = "SELECT * from items";

// GET route
app.get("/", function (req, reply) {
  client.execute(getAllList, [], function (err, result) {
    if (err) {
      reply.status(404).send({ msg: err });
    } else {
      const row = result.rows;
      reply.send(row);
    }
  });
});

// POST route
app.post("/todo", function (req, reply) {
  var Id = req.body.id;
  var Things = req.body.things;

  var upsertlist = "INSERT INTO todo.items(id, things) VALUES(?,?)";
  var params = [Id, Things];
  console.log(params);

  client.execute(upsertlist, params, function (err, result) {
    if (err) {
      reply.status(404).send({ msg: err });
    } else {
      reply.send(result.rows);
    }
  });
});

// Run the server!
app.listen(3000, (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  app.log.info(`server listening on ${address}`);
});
client.connect();
