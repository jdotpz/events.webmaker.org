Mozilla Webmaker Events
============

## Development Setup

  * This project uses [compound.js](http://compoundjs.com/), an express.js extension that has some
    default conventions to save time when building RESTful web applications using node. First, you
    must install node.
  * It is strongly recommended you install compound globally, so do a `npm install compound -g`
  * Install dependencies with `npm install`
  * Database Setup
    * Create a local MySQL database
    * Edit config/database.json as necessary
    * Run `compound db migrate` to create the necessary DB tables
  * Run with `node .` and connect to http://localhost:3000

## More information on the compound commend

To find out more information on the compound command, check out the
[docs](http://compoundjs.com/docs.html), which explain how it's possible to seed DB data, generate
new models, controllers, etc, and use the REPL console (see a quick guide below).

## REPL Console

You can debug the application in your terminal using a REPL (Run Eval Print Loop) console. To access
it, simply run:

```
compound console
```

or its shortcut:

```
compound c
```

It will pull up the application (with all the models and enviornment present) so you can debug. As
a shortcut for debugging callbacks, a special function named `c` exists. Here's an example:

```
compound c
compound> User.find(53, c)
Callback called with 2 arguments:
_0 = null
_1 = [object Object]
compound> _1
{ email: [Getter/Setter],
  password: [Getter/Setter],
  activationCode: [Getter/Setter],
  activated: [Getter/Setter],
  forcePassChange: [Getter/Setter],
  isAdmin: [Getter/Setter],
  id: [Getter/Setter] }
```

