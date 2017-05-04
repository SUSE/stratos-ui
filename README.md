# Console UI
The Console UI is written in JavaScript. It also uses Angular 1.4.x to maintain compatibility with Angular UI Bootstrap.

For more implementation details, please see the following pages:
* [Overview](docs/README.md)
* [Architecture](docs/architecture.md)
* [Plugins](docs/plugins.md)

## System Requirements
Nginx is used to serve static files while a Golang based REST API backend. Another container hosts the Postgres database for session and service instance management.

This project depends on the following:
* [Docker](https://docs.docker.com/mac)
* [Node.js](https://nodejs.org) - to easily install Node.js modules
* [portal-proxy](https://github.com/hpcloud/portal-proxy) - Golang based REST API
* [helion-ui-framework](https://github.com/hpcloud/helion-ui-framework) - reusable Angular-based UI components, Helion branding, assets, styles, theme files

## Installation
Install Docker and clone the repositories listed above at the same level as this project.

### Build and run
See the README in the `stratos-deploy` repo for details on how to develop against the Console.

## Docker commands and development tools

### View Logs
```
docker logs stratos-ui
```

### SSH into the running container
```
docker exec -it stratos-ui /bin/bash
```
or, from the stratos-deploy project
```
docker-compose run --rm ui bash
```

### Running Karma tests in container
```
$ cd tools
$ npm test
```

### Running Protractor tests in container
```
$ cd tools
$ npm run update-webdriver
$ npm run e2e
```
By default tests will execute against the local machine's ip address. To run against, for example, the gulp dev instance use
```
$ npm run e2e -- --params.host=localhost --params.port=3100
```

### Running ESLint in container
```
$ cd tools
$ ./node_modules/.bin/gulp lint
```

### Running gate check script
This runs the unit tests and linting.
```
$ cd tools
$ npm run gate-check
```

### Generate documentation (experimental)
Locally, run the following command to generate documentation in the `docs/src` folder. You can then view the documentation by pointing your browser to the `index.html` file of that `docs/src` folder.
```
cd tools 
./node_modules/.bin/jsdoc ../src/app ../src/*.js -r -d ../docs/src
```
