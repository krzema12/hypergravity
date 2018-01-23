# Hypergravity - gravity simulation in Hyper terminal

## How to install it

This method is a workaround for issues with regular installation (see issue #8). If you know how to make it easier, you're welcome to contribute!

1. `cd ~/.hyper_plugins` - go to the directory where Hyper keeps all plugins
2. `yarn add hypergravity` - clone the NPM package with the plugin
3. `cd node_modules/hypergravity/` - after installation is done, go to the folder of the newly cloned plugin
4. `yarn build` - generates the main file: `index.js`. Without it, Hyper may complain about issues when running `hypergravity`.
5. Open `~/.hyper.js` and add `hypergravity` in the proper place:
```js
  plugins: [
    // some other plugins
    'hypergravity'
  ],
```
6. Run Hyper and press Command + G to toggle gravity mode!

## How to run it for development

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
