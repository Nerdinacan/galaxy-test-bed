# Galaxy component test bed

Provides a modern front-end development environment that lets you mount a component and use a local instance of galaxy
as if it were a separate api server using nginx to proxy ajax requests.


## Project setup

```
First install Docker.
```

I can't remember whether you need vue-cli installed globally but if you do:

```
npm install -g @vue/cli
```

Install the local packages as per any other javascript project.

```
npm install
```


Put your local galaxy path instance into package.json in the proxy script

```
"scripts": {
    "help": "vue-cli-service help test:unit",
    "serve": "npm run proxy $$ vue-cli-service serve --port=8081",
    "build": "vue-cli-service build",
    "lint": "vue-cli-service lint",
    "test:unit": "vue-cli-service test:unit --watch",
    "test:inspect": "vue-cli-service test:unit --inspect-brk --watch",
    /// HERE
    "proxy": "./proxy/start.sh GALAXYPATH=/Users/mason/Projects/ohsu/galaxy"
  },
```

Make an API Key in your local galaxy instance. The UI is buried somewhere in user preferences.
Put that API key into the Nginx proxy configuration at proxy/testbed.conf

```
location /api {

    # stick yer API key in here
    set $key "342sfablarblarblar";
    set $delimeter "";
    if ($is_args) {
        set $delimeter "&";
    }
```




Start galaxy locally on port 8080.

```
cd (to your galaxy folder)
./run.sh
```

Start proxy and vue-cli instance. The proxy is preconfigured to start on 8081. Nginx will deliver the testbed on localhost port 80

```
npm run serve
npm run proxy
```

Now put the components you're building or other code you want to test in the ./src folder and manipulate App.vue and main.js until it
launches to your satisfaction.




## Debugging unit tests in VS Code

Make sure the vue.config.js is having webpack emitting inline-source-maps or VsCode won't be able to deteremine how to
display the breakpoints in your code.

Fair warning, I don't think VsCode's built-in breakpoints work but you can still put a debugger statement in your tests.

Add this launch config to your VsCode project:

```
{
    "version": "0.2.0",
    "configurations": [
        {
            "type": "node",
            "request": "launch",
            "name": "Debug Unit Tests",
            "cwd": "${workspaceFolder}",
            "runtimeExecutable": "npm",
            "runtimeArgs": [
                "run-script",
                "test:inspect",
                "${file}"
            ],
            "port": 9229
        }
    ]
}
```

Then open the test file you want to debug and run the vs debugger on that file with the debugging config you just made.



## Standard Vue cli-commands

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Run your tests
```
npm run test
```

### Lints and fixes files
```
npm run lint
```

### Run your unit tests
```
npm run test:unit
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
