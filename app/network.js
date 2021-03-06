var Q = require('q'),
  Helpers = require('./helpers'),
  fs = require('fs'),
  md5 = require('MD5'),
  brain = require('brain');

/**
 *
 * @param {MongoClient} mongo
 * @param {Object} netOptions
 * @constructor
 */
function Network(mongo, netOptions) {
  this.mongo_ = mongo;
  this.net_ = new brain.NeuralNetwork(netOptions);
}

/**
 * @param {MongoClient}
 * @private
 */
Network.prototype.mongo_;

/**
 * @param {NeuralNetwork}
 * @private
 */
Network.prototype.net_;


/**
 * @returns {*}
 */
Network.prototype.train = function() {
  var self = this,
    deferred = Q.defer();

  return self
    .getTrainingData_()
    .then(function(data) {
      self.net_.train(data);
    });

};


/**
 *
 * @param {string=} filename
 * @returns {Q.promise}
 */
Network.prototype.saveToFile = function(filename) {
  var self = this,
    deferred = Q.defer();

  var netStructure = self.net_.toJSON();

  fs.writeFile(__dirname + '/nets/' + (filename || 'last') + '.json', JSON.stringify(netStructure), function(err) {
    if(err) deferred.reject(err);
    else    deferred.resolve(netStructure);
  });

  return deferred.promise;
};


/**
 *
 * @param {string=} filename
 * @returns {Q.promise}
 */
Network.prototype.loadFromFile = function(filename) {
  var self = this,
    deferred = Q.defer();

  fs.readFile(__dirname + '/nets/' + (filename || 'last') + '.json', function(err, data) {
    if(err) {
      deferred.reject(err);
      return;
    }

    var json = JSON.parse(data);
    self.net_.fromJSON(json);

    deferred.resolve(json);
  });

  return deferred.promise;
};


/**
 * @private
 * @returns {Q.promise}
 */
Network.prototype.getTrainingData_ = function() {
  var self = this,
    deferred = Q.defer(),
    filter = {
      marks: { $exists: true }
    };

  self.mongo_.collection('vehicles').findItems(filter, function(err, result) {
    if(err) deferred.reject(err);
    else    deferred.resolve(result.map(Helpers.transformInput));
  });

  return deferred.promise;
};


/**
 * @param {number} mark
 * @returns {Q.promise}
 */
Network.prototype.lookup = function(mark) {
  var self = this,
    deferred = Q.defer(),
    filter = {
      "brand._id": { $in: [1, 2, 5, 93] },
      "date_made_year": { $gte: 2012 },
      "price": { $gte: 500000 }
    },
    candidates = [];

  var cursor = self.mongo_.collection('vehicles').find(filter);

  cursor.each(function(err, item) {

    if(err) {
      deferred.reject(err);
      return;
    }

    if(item === null) {
      deferred.resolve(candidates);
      return;
    }

    var output = self.net_.run(Helpers.scale(item));

    if(output.mark > (0.95 || mark)) {
      item.mark = output.mark;
      candidates.push(item);
    }
  });


  return deferred.promise;
};



module.exports = Network;
