var Q = require('q');

/**
 *
 * @param {MongoClient} mongo
 * @constructor
 */
function NetworkTrainer(mongo) {
  this.mongo_ = mongo;
}

/**
 *  @param {MongoClient}
 *  @private
 */
NetworkTrainer.prototype.mongo_;


NetworkTrainer.prototype.train = function() {
  var self = this,
    deferred = Q.defer();

  return self.getData();
};


/**
 * @returns {Q.promise}
 */
NetworkTrainer.prototype.getData = function() {
  var self = this,
    deferred = Q.defer(),
    filter = {
      marks: { $exists: true }
    };

  self.mongo_.collection('vehicles').findItems(filter, function(err, result) {
    if(err) deferred.reject(err);
    else    deferred.resolve(result.map(self.transform));
  });

  return deferred.promise;
};


/**
 * @param {Object} vehicle
 * @returns {{brandId: number, modelId: number, year: number, km: number, kw: number, ccm: number, gearbox: number, fuel: number, price: number, mark: number}}
 */
NetworkTrainer.prototype.transform = function(vehicle) {
  var fuels = {
    'benzín': 0.1,
    'nafta': 0.2,
    'LPG': 0.3,
    'elektro': 0.4,
    'hybridní': 0.5,
    'CNG': 0.6,
    'ethanol': 0.7,
    'jiné': 0.8
  };


  var sum = function(a, b) {
    return a + b;
  };

  var getMark = function(mark) {
    return mark.mark;
  };

  return {
    brandId: vehicle.brand._id / 1000,
    modelId: vehicle.model._id / 10000,
    year: vehicle.date_made_year / 10000,
    km: vehicle.km / 10000000,
    kw: vehicle.kw / 1000,
    ccm: vehicle.kw / 10000,
    gearbox: vehicle.gearbox == 'automatická' ? 1 : 0,
    fuel: fuels[vehicle.fuel] || 0,
    price: vehicle.price / 100000000,
    mark: vehicle.marks
      .map(getMark)
      .reduce(sum)
      / vehicle.marks.length
  };
};


module.exports = NetworkTrainer;
