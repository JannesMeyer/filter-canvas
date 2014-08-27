var App = require('./components/App.react');

// Import CSS (with webpack)
require('normalize.css/normalize.css');
require('../stylus/main.styl');

// Render controller view
React.renderComponent(App(), document.body);