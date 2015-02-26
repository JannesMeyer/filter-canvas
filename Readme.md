# Pipes und Filters-Konfigurationswerkzeug

## Installation

Downloade und installiere [CouchDB](http://couchdb.apache.org/). Es gibt Anleitungen: [Installation guides for various OSs](http://docs.couchdb.org/en/latest/install/).

Bearbeite die Datei `local.ini`, welche normalerweise unter einem diser Pfade gefunden werden kann: `/etc/couchdb/local.ini` or `/opt/local/etc/couchdb/local.ini`

```
[httpd]
bind_address = 0.0.0.0
enable_cors = true

[cors]
origins = *
```

Lade die Datenbank mit den Daten:
```
cd ${PROJECT_DIR}
./couchdb-setup.sh
```

## Starten der Server

Starte eine CouchDB-Instanz. Unter Linux/OS X geht das so:

```bash
sudo couchdb -b
```

Überprüfe ob's geklappt hat, indem du die folgende URL im Browser aufrufst:
<http://localhost:5984/_utils>

Setze die Server-URL zum Datenbank-Server in der Datei `./public/config.js`.

Hoste den `public` Ordner mit einem Webserver (z.B. mit Apache, nginx, Node.js, IIS, etc.). Oder mit Python:

```bash
cd ${PROJECT_DIR}/public

# Python 2:
python -m SimpleHTTPServer 8080

# Python 3:
python -m http.server 8080
```

Gehe dann zu dieser URL um das Konfigurationswerkzeug zu benutzen:
<http://localhost:8080/>

## Source kompilieren

Downloade und installiere [node.js](http://nodejs.org/). Installiere dann webpack:

```bash
npm install -g webpack
```

Nun kann man mit folgendem Befehl die JavaScript-Datei kompilieren:

```bash
cd ${PROJECT_DIR}
NODE_ENV=production webpack
```

Mit diesem Befehl kann man einen Dev-Server starten:

```bash
node ./server.js
```


## Benutzte Open-Source-Projekte

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