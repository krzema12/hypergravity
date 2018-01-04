# Hypergravity - gravity simulation in Hyper terminal

This plugin is not yet ready to be used, it's still under development! Production usage has not been tested

Currently, to run it for development:

1. Clone the repo to `~/.hyper_plugins/local/hypergravity`
2. Go to `hypergravity` folder.
3. Run `yarn` to install the dependencies.
4. Run `yarn build` to produce `index.js` which will be loaded by Hyper.
5. Add this to your `.hyper.js`:
```js
  localPlugins: [
    // maybe some other local plugins
    'hypergravity'
  ],
```
