#!/usr/bin/env sh

# Database server
DB=http://127.0.0.1:5984

# Delete old databases
echo 'Drop databases...'
curl -X DELETE $DB/filter-repository
curl -X DELETE $DB/pipe-repository
curl -X DELETE $DB/complex-filters

# Create 3 databases
echo '\nRe-create databases...'
curl -X PUT $DB/filter-repository
curl -X PUT $DB/pipe-repository
curl -X PUT $DB/complex-filters

# Prepare HTTP headers
HEADERS='Content-Type: application/json'

# Populate filter repository
echo '\nCreate filters...'
curl -X PUT $DB/filter-repository/SourceFilterExample -H "$HEADERS" -d '{ "inputs": 0, "outputs": 1, "parameter": { "waitMin": 10, "waitMax": 500000 } }'
curl -X PUT $DB/filter-repository/WorkFilterExample -H "$HEADERS" -d '{ "inputs": 1, "outputs": 1, "parameter": { "waitMin": 10, "waitMax": 500000 } }'
curl -X PUT $DB/filter-repository/EndFilterExample -H "$HEADERS" -d '{ "inputs": 1, "outputs": 0, "parameter": { "waitMin": 10, "waitMax": 500000 } }'
curl -X PUT $DB/filter-repository/OpenCVImageSource -H "$HEADERS" -d '{ "inputs": 1, "outputs": 1 }'
curl -X PUT $DB/filter-repository/RgbToGrayFilter -H "$HEADERS" -d '{ "inputs": 1, "outputs": 1 }'
curl -X PUT $DB/filter-repository/FindEdges -H "$HEADERS" -d '{ "inputs": 1, "outputs": 1 }'
curl -X PUT $DB/filter-repository/GLFWImageSink -H "$HEADERS" -d '{ "inputs": 1, "outputs": 0 }'

# Populate pipe repository
echo '\nCreate pipes...'
curl -X PUT $DB/pipe-repository/ForwardPipe -H "$HEADERS" -d '{ "inputs": 1, "outputs": 1, "variableInputs": true, "variableOutputs": true, "parameter": { "sync": false } }'
curl -X PUT $DB/pipe-repository/SplitPipe -H "$HEADERS" -d '{ "inputs": 1, "outputs": 2, "variableOutputs": true, "parameter": { "sync": false } }'
curl -X PUT $DB/pipe-repository/JoinPipe -H "$HEADERS" -d '{ "inputs": 2, "outputs": 1, "variableInputs": true, "parameter": { "sync": false } }'


