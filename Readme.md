# Pipes and Filters Konfigurationswerkzeug

## Installation

Download and install [CouchDB](http://couchdb.apache.org/).

Serve the `public` directory with any webserver you want (Apache, nginx, Python's SimpleHTTPServer etc.). Or with Python:

~~~bash
cd public/
# Python 2
python -m SimpleHTTPServer 8080
# Python 3
python -m http.server
~~~

Open your favorite browser and go to the this address: <http://localhost:8080/>

## Compile from source

Download and install [node.js](http://nodejs.org/)

Install dependencies:

~~~bash
npm install -g webpack
npm install
~~~

Compile JavaScript with webpack:

~~~bash
NODE_ENV=production webpack
~~~

