var StatsD = require('node-statsd'),
    client = new StatsD();


// Increment: Increments a stat by a value (default is 1)
const counter_metric = async (req, res) => {
    client.increment(`${req}_call_counter`);
}

module.exports = {
    counter_metric
}

client.socket.on('error', function (error) {
    return console.error("Error in socket: ", error);
});


