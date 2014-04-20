var Helpers = {

  /**
   * @param {Object} vehicle
   * @returns {{brand: number, model: number, year: number, km: number, kw: number, ccm: number, gearbox: number, fuel: (*|number), price: number}}
   */
  scale: function(vehicle) {
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

    return {
      brand: vehicle.brand._id / 1000,
      model: vehicle.model._id / 10000,
      year: vehicle.date_made_year / 10000,
      km: vehicle.km / 10000000 || 0,
      kw: vehicle.kw / 1000,
      ccm: vehicle.kw / 10000,
      gearbox: vehicle.gearbox == 'automatická' ? 1 : 0,
      fuel: fuels[vehicle.fuel] || 0,
      price: vehicle.price / 100000000
    };
  },

  /**
   *
   * @param {Object} vehicle
   * @returns {{input: {brand: number, model: number, year: number, km: number, kw: number, ccm: number, gearbox: number, fuel: (*|number), price: number}, output: {mark: number}}}
   */
  transformInput: function(vehicle) {

    var sum = function(a, b) {
      return a + b;
    };

    var getMark = function(mark) {
      return mark.mark;
    };

    return {
      input: Helpers.scale(vehicle),
      output: {
        mark: vehicle.marks.map(getMark).reduce(sum) / vehicle.marks.length
      }
    }
  }
};


 module.exports = Helpers;
