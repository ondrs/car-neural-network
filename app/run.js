var argv = require('yargs').argv,
  util = require('util'),

  config = require('./config/config'),

  appDir = __dirname,
  baseDir = appDir + '/..',
  tempDir = baseDir + '/temp',

  mongoskin = require('mongoskin'),
  mongo = mongoskin.db(config.mongo.remote, { safe: true });




if(argv.train) {
  var NetworkTrainer = require('./network-trainer.js');
  var trainer = new NetworkTrainer(mongo);

  trainer
    .train()
    .done(process.exit);
}

else {
  console.log('Nothing to do.. exit');
  process.exit();
}

