// Include static files in the build output (webpack)
import '../public/pipe-repository.json';
import '../public/filter-repository.json';
import '../public/complex-filter-repository.json';

// CouchDB server URL
// var baseURL = 'http://' + location.hostname + ':5984';

var config = {
	DEV: (process.env.NODE_ENV !== 'production'),
	LANGUAGES: new Map([
		['en', 'English'],
		['de', 'Deutsch'],
		['es', 'Español']
	]),
	DB_URLS: {
		// Static files (with relative URLs)
		pipes: 'pipe-repository.json',
		filters: 'filter-repository.json',
		complexFilters: 'complex-filter-repository.json'

		// CouchDB
		// pipes: baseURL + '/pipe-repository/_all_docs?include_docs=true',
		// filters: baseURL + '/filter-repository/_all_docs?include_docs=true',
		// complexFilters: baseURL + '/complex-filters/_all_docs?include_docs=true'
	}
};
export default config;