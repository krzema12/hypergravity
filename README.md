# Hypergravity - gravity simulation in Hyper terminal

![Animated demo](https://user-images.githubusercontent.com/3110813/35337934-d11d8afc-011c-11e8-9131-6c0bf23ec669.gif)

## How to install and use it

1. Open `~/.hyper.js` and add `hypergravity` in the proper place:
```js
  plugins: [
    // some other plugins
    'hypergravity'
  ],
```
2. Run Hyper and press `Command + G` (or `Control + G` on Linux and Windows) to toggle gravity mode!

## How to run it for development

1. Clone the repo to `~/.hyper_plugins/local/hypergravity`
2. Go to `hypergravity` folder.
3. Run `yarn` to install the dependencies.
4. Add this to your `.hyper.js`:
```js
  localPlugins: [
    // maybe some other local plugins
    'hypergravity'
  ],
```
5. At the beginning and after each change in source files, run `yarn build` to (re)build `index.js` which is in fact loaded by Hyper.
