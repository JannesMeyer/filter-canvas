# Pipes and Filters Konfigurationswerkzeug

## Installation

Serve the `public` directory with any webserver you want (for example with Apache, nginx, Python's SimpleHTTPServer, etc.). Or with Python:

~~~bash
cd ${PROJECT_DIR}/public

# Python 2:
python -m SimpleHTTPServer 8080

# Python 3:
python -m http.server 8080
~~~

Download and install [CouchDB](http://couchdb.apache.org/).

Open your favorite browser and go to the this address: <http://localhost:8080/>

## Compile from source

Download and install [node.js](http://nodejs.org/)

Install dependencies:

~~~bash
cd ${PROJECT_DIR}
npm install -g webpack
npm install
~~~

Compile JavaScript with webpack:

~~~bash
NODE_ENV=production webpack
~~~

