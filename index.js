const globalShortcut = require('electron').remote.globalShortcut;

exports.decorateTerm = (Term, { React, notify }) => {
  return class extends React.Component {
    constructor (props, context) {
      super(props, context);

      globalShortcut.register('CommandOrControl+G', () => {
        console.log('CommandOrControl+G pressed');
      })
    }

    render () {
      return React.createElement(Term, this.props);
    }
  }
};
