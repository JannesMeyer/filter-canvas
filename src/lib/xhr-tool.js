/**
 * Sends an asynchronous JSON request to the specified URL
 *
 * Documentation about XMLHttpRequest:
 * https://developer.mozilla.org/en/docs/Web/API/XMLHttpRequest
 */
function getJSON(url, callback) {
	var req = new XMLHttpRequest();
	req.open('GET', url);
	req.setRequestHeader('Accept', 'application/json');

	// Setup event handlers
	req.onload = () => {
		try {
			callback(null, JSON.parse(req.response));
		} catch(err) {
			callback(err);
		}
	};
	req.onerror = () => {
		callback(new Error('Error ' + req.status));
	};
	req.ontimeout = () => {
		callback(new Error('Request timeout'));
	};

	// Send the request
	req.send();
}
exports.getJSON = getJSON;