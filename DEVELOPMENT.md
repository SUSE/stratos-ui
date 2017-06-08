# Developing the Stratos UI Console

The Stratos Console UI provides a single comprehensive and ubiquitous user experience for: discovering, composing, developing and managing Cloud Native workloads which are hosted in a myriad of: public, managed and private cloud/compute providers.

1. [Working on the front end component](#working-on-the-front-end-component)
2. [Working on the backend component](#working-on-the-backend-component)
3. [Database Management](#database-management)
4. [Continuous Integration](#continuous-integration)


## Working on the front end component

### Source Code Structure
TODO OR REMOVE

### Style Sheets
TODO OR REMOVE
Styles are defined in `.scss` files and the Sass preprocessor is used to compile these files into a single `index.css` file. This application uses the default Bootstrap styles, but can be extended with your custom theme/styles through imports in `src/index.scss`.

### Testing
TODO OR REMOVE
This application uses Karma for unit testing and Protractor for end-to-end testing. Currently, only the `src/app` directory is included for unit testing with Karma. The `e2e` directory contains the Protractor tests. Unit tests can be run in the `tools` directory with: `npm test`.

### Linting
TODO OR REMOVE
This application uses ESLint as the linting utility for Javascript files in the `src` directory (excluding `lib`). To enable rules, please modify the .eslintrc file in the root directory. Linting can be run in the `tools` directory with: `./node_modules/.bin/gulp lint`.

### Tools
We use Gulp to automate our development and build workflow, and Bower for managing packages and dependencies. Please use `gulp.config.js` to abstract out configuration information (such as paths) from the main Gulp file.

## Working on the backend component

### Getting started

The portal-proxy is the back-end for the Console UI. It is written in Go.

#### Set a GOPATH
As Matt Farina says, “With the go toolchain there is no escaping the GOPATH.”  Feel free to choose where your GOPATH variable points to, just be sure you set one.
```
export GOPATH=~/go
```

#### Clone the project
```
mkdir -p $GOPATH/src
cd $GOPATH/src
git clone git@github.com:hpcloud/portal-proxy.git
```

#### Dependency Management (Glide)
Install the required package dependencies. We use [Glide](https://glide.sh), [docs](http://glide.readthedocs.io/en/latest/), [GitHub](https://github.com/Masterminds/glide) for dependency management.

Use the installation method appropriate for your development platform.

Once installed, first time use with the proxy project:
```
glide install
```

As you develop, you may need to add a dependency. Our dependency tree is fully
stored in git so that our build process can build the proxy without the need to
pull any external dependencies. As a result, when we add dependencies during
development, we need to store the full source within the vendor folder structure.

Add the entry to the `glide.yaml` file and then:
```
glide up -u -s
```
This will update dependencies in the vendor folder, and strip all VCS info,
including .git folders, from each dependent package.

If you happen to forget and discover that you have committed a dependency to git
as a submodule, you'll need to fix it. Let's use one of my recent mistakes as an
example. After converting the session backend from cookies to postgres,
I discovered I had made this mistake with the `pgstore` package.

Here's how I fixed it:
```
# 1) Ensure the package is in the glide.yaml file

# 2) Remove the package from git
$ git rm -r vendor/github.com/antonlindstrom
$ git add vendor/github.com/antonlindstrom
$ git commit -m "Remove the submodule based version of pgstore"

# 3) Update the package with the full source
# glide up -u -s

# 4) Add the latest to git
$ git add .
$ git commit -m "Update pgstore with the full source"
```

#### Set environment variables

The portal proxy is run using a series of environment variables. The best approach for development is to add a .rc file to export all of these. Copy the `development.rc.sample` file to `development.rc` as a start.

#### Set up developer certs

The proxy requires certs to run. When running in production or in the dev harness, the cert will come from environment variables, but since docker-compose can't handle multi-line variables in it's env_files, the proxy will first look for pproxy.crt and pproxy.key files in a dev-certs directory.  You can set the CONSOLE_PROXY_CERT and CONSOLE_PROXY_CERT_KEY variables in your .rc file to be random short strings. They won't be used, but must be present for the proxy to run.

#### Run in a container
See the section below entitled `Running portal-proxy in a container`.

### Testing

#### Unit Testing

Standard Golang unit testing approach and conventions apply.

Consider adopting GoConvey to run your unit tests as you write them:
http://goconvey.co

```
$GOPATH/bin/goconvey -port 9999
```


### Running portal-proxy in a container

#### Running "like a dev"

In order to facilitate a smoother, faster development process, the build script accepts arguments.  If provided these arguments will override the standard "CMD" block for a docker-container.  Here's an example you may find useful:
```
tools/build_portal_proxy.sh bash
... <lots of output here> ...
root@427ed6a1c84b:/go/src/github.com/hpcloud/portal-proxy#

# Or, just build:
root@427ed6a1c84b:/go/src/github.com/hpcloud/portal-proxy# go build
```

#### Running "like production"

We've attempted to create a set of helper scripts to aid in running the portal-proxy in a docker-container.  This avoids a lot of the nonsense normally associated with the GOPATH and also means that your build environment is the same as your running environment.

##### Run the build

Starting in the top-level directory of the portal-proxy repo, run the build script like so:
```
tools/build_portal_proxy.sh
```
NOTE: Currently, you MUST be in the top level of the directory.  There's some relative/base/absolute path issues that we (and by "we" I mean me, woodnt) haven't worked out yet.  Hopefully that'll all be solved soon.

##### Run the server

Starting in the top-level directory of the portal-proxy repo, run the server script:
```
tools/run_portal_proxy.sh
```
See note above about why you must run the code from the top-level directory.

#### Plans for the future
At some point, we'll try to provide some sort of "watcher-like" dev tools to make this process even easier. For example, the development-server script could restart every time the executable is re-made; or the build could be triggered whenever the source-code changes.

## Database Management
See [here](db/README.md)

## Continuous Integration
See [here](ci/README.md)
