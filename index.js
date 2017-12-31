const globalShortcut = require('electron').remote.globalShortcut;

exports.decorateTerm = (Term, { React, notify }) => {
  return class extends React.Component {
    constructor (props, context) {
      super(props, context);

      this._onTerminal = this._onTerminal.bind(this);
      this._selectSpanNodesWithoutChildren = this._selectSpanNodesWithoutChildren.bind(this);

      globalShortcut.register('CommandOrControl+G', () => {
        console.log('CommandOrControl+G pressed');
        console.log('Root div:');
        console.log(this._rootDiv);

        const elementsToAnimate = this._selectDOMElementsToAnimate(this._selectSpanNodesWithoutChildren);
        const container = this._copyElementsToSeparateContainer(elementsToAnimate);
      })
    }

    render () {
      return React.createElement(Term, Object.assign({}, this.props, {
        onTerminal: this._onTerminal
      }));
    }

    _onTerminal (term) {
      if (this.props.onTerminal) {
        this.props.onTerminal(term);
      }

      this._rootDiv = term.div_;
    }

    _selectDOMElementsToAnimate(shouldSelectThisElement) {
      var stack = [this._rootDiv];
      var elementsToAnimate = [];

      while (stack.length > 0) {
        const elementFromTop = stack.pop();

        if (shouldSelectThisElement(elementFromTop)) {
          elementsToAnimate.push(elementFromTop);
        }

        this._pushChildrenToStack(stack, elementFromTop);
      }

      return elementsToAnimate;
    }

    _copyElementsToSeparateContainer(elements) {
      const separateContainer = window.document.createElement('div');

      for (var i = 0; i < elements.length; i++) {
        var clonedNode = elements[i].cloneNode(true);
        separateContainer.appendChild(clonedNode);
      }

      this._rootDiv.appendChild(separateContainer);
      return separateContainer;
    }

    _getChildren(element) {
      if (element.nodeName === 'IFRAME') {
        return element.contentWindow.document.body.children;
      }

      return element.children;
    }

    _pushChildrenToStack(stack, element) {
      const children = this._getChildren(element);
      for (var i = 0; i < children.length; i++) {
        stack.push(children[i]);
      }
    }

    _selectSpanNodesWithoutChildren(element) {
      return element.nodeName === 'SPAN' && this._getChildren(element).length === 0;
    }
  }
};
