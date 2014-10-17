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


# Attribution

Die folgenden Open-Source-Libraries werden von diesem Projekt benutzt:

- [react](http://facebook.github.io/react/)
- [flux](https://github.com/facebook/flux)
- [immutable](https://github.com/facebook/immutable-js)
- [normalize.css](https://github.com/necolas/normalize.css)
- [browser-saveas](https://github.com/eligrey/FileSaver.js)

Die folgenden Open-Source-Build-Tools werden von diesem Projekt benutzt:

- [webpack](https://github.com/webpack/webpack) (Fügt Module zu einer einzigen Datei zusammen)
- [stylus](https://github.com/learnboost/stylus) (CSS-Precompiler)
- [autoprefixer](https://github.com/postcss/autoprefixer) (Fügt automatisch Vendor-Prefixes ins CSS ein)
- [jsx](http://facebook.github.io/react/docs/jsx-in-depth.html)
  (JavaScript-Precompiler, der bei der Benutzung von React empfohlen wird)
- [UglifyJS](https://github.com/mishoo/UglifyJS2) (JavaScript-Minifizierer)

Die Hintergrundgrafik stammt von [subtlepatterns.com](http://subtlepatterns.com/)/Atle Mo und wird unter der Lizenz [CC BY-SA 3.0](http://creativecommons.org/licenses/by-sa/3.0/) verteilt.

Die Icon-Font heißt [Font Awesome](http://fortawesome.github.io/Font-Awesome/) und wird unter der Lizenz [SIL Open Font License 1.1](http://scripts.sil.org/OFL) verteilt. Die Font-Datei wurde mit [fontello.com](http://fontello.com/) generiert.