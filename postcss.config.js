/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: [require('autoprefixer'), require('postcss-nested')],
};

module.exports = {
  plugins: {
    'autoprefixer': {},
    'postcss-nested': {}
  }
};