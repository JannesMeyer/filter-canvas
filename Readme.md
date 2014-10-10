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

Download and install [CouchDB](http://couchdb.apache.org/). [Installation guides for various OSs](http://docs.couchdb.org/en/latest/install/)


<https://wiki.archlinux.org/index.php/couchdb>

**/etc/couchdb/local.ini**
**/opt/local/etc/couchdb/local.ini**

~~~
[httpd]
bind_address = 0.0.0.0
enable_cors = true

[cors]
origins = *
~~~

start couchdb

	sudo couchdb

Verify that it's running by going to this URL: <http://localhost:5984/_utils>

Open your favorite browser and go to the this address: <http://localhost:8080/>

http://localhost:5984/_utils/docs/intro/tour.html

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

