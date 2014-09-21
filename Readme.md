# Pipes and Filters Konfigurationswerkzeug

Download and install [node.js](http://nodejs.org/)

Install dependencies:

	npm install -g webpack
	npm install

Compile JavaScript:

	NODE_ENV=production webpack

Then serve the `public` directory with any webserver you want. For example with Python:

	cd public/
	# Python 2
	python -m SimpleHTTPServer 8080
	# Python 3
	python -m http.server

Open your favorite browser and go to the this address: <http://localhost:8080/>