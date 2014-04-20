var argv = require('yargs').argv,
  config = require('./config/config'),
  mongoskin = require('mongoskin'),
  Network = require('./network.js');


if(argv.train) {
  var mongo = mongoskin.db(config.mongo.train, { safe: true }),
    networkOptions = {};

  if(argv.h) {
    networkOptions.hiddenLayers = argv.h instanceof Array ? argv.h : [argv.h];
  }

  if(argv.l) {
    networkOptions.learningRate = argv.l;
  }

  network = new Network(mongo, networkOptions);

  console.time('train time');

  network
    .train()
    .then(function() {
      return network.saveToFile(argv.f);
    })
    .done(function() {
      console.timeEnd('train time');
      process.exit();
    });
}


else if(argv.lookup) {
  var mongo = mongoskin.db(config.mongo.real, { safe: true }),
    network = new Network(mongo);

  network
    .loadFromFile(argv.f)
    .then(function() {
      return network.lookup(argv.m);
    })
    .then(function(result) {
      console.log(result.map(function(i) {
        return {
          url: i.url,
          mark: i.mark
        };
      }));
    })
    .done(process.exit);
}

else {
  console.log('Nothing to do.. exit');
  process.exit();
}

