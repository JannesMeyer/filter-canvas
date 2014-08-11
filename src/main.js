var Workbench = require('./components/Workbench.react');

// Import CSS with webpack
require('main.css');

// Render controller view
React.renderComponent(Workbench(), document.body);