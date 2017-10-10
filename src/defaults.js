const DEFAULT_LOCATIONS = {
  home: 'https://studio.code.org/maker/setup',
};

const LOCAL_DEFAULT_LOCATIONS = {
  home: 'http://localhost-studio.code.org:3000/maker/setup',
};

function _locations() {
  return process.env.NODE_ENV === 'production' ?
    DEFAULT_LOCATIONS :
    LOCAL_DEFAULT_LOCATIONS;
}

function home() {
  return _locations().home;
}

module.exports = {home};
