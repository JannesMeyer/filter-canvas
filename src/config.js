// CouchDB
// var baseURL = 'http://' + location.hostname + ':5984';
// window.pipesURL = baseURL + '/pipe-repository/_all_docs?include_docs=true';
// window.filtersURL = baseURL + '/filter-repository/_all_docs?include_docs=true';
// window.complexFiltersURL = baseURL + '/complex-filters/_all_docs?include_docs=true';

// Static files (with relative URLs)
require('../public/pipe-repository.json');
require('../public/filter-repository.json');
require('../public/complex-filter-repository.json');
window.pipesURL = 'pipe-repository.json';
window.filtersURL = 'filter-repository.json';
window.complexFiltersURL = 'complex-filter-repository.json';