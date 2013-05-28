module.exports = function (compound) {
  if (typeof window === 'undefined') {
    return [
      'jugglingdb',
      'seedjs',
    ].map(require);
  } else {
    return []
  }
};

