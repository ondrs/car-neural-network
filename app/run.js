var argv = require('yargs').argv,
  config = require('./config/config'),
  mongoskin = require('mongoskin'),
  Network = require('./network.js');



if(argv.train) {
  var mongo = mongoskin.db(config.mongo.train, { safe: true }),
    network = new Network(mongo);

  network
    .train()
    .then(function() {
      return network.saveToFile();
    })
    .done(process.exit);
}


if(argv.findCandidates) {
  var mongo = mongoskin.db(config.mongo.real, { safe: true }),
    network = new Network(mongo);

  network
    .loadFromFile()
    .then(function() {
      return network.findCandidates();
    })
    .then(function(result) {
      console.log(result.map(function(i) {
        return i.url;
      }));
    })
    .done(process.exit);
}

else {
  console.log('Nothing to do.. exit');
  process.exit();
}

