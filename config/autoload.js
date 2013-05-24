module.exports = function (compound) {
  var defaultModules = [
      'jugglingdb',
    ], developmentModules = [];

  if ('development' === compound.app.get('env')) {
    developmentModules = [
      'seedjs',
    ]
  }

  if (typeof window === 'undefined') {
    return defaultModules.concat(developmentModules).map(require);
  } else {
    return []
  }
};

