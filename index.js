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
        this._hideOriginalElements(elementsToAnimate);
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
      var queue = [this._rootDiv];
      var elementsToAnimate = [];

      while (queue.length > 0) {
        const elementFromTop = queue.shift();

        if (shouldSelectThisElement(elementFromTop)) {
          elementsToAnimate.push(elementFromTop);
        }

        this._enqueueChildren(queue, elementFromTop);
      }

      return elementsToAnimate;
    }

    _copyElementsToSeparateContainer(elements) {
      var separateContainer = window.document.createElement('div');

      for (var i = 0; i < elements.length; i++) {
        const currentNode = elements[i];
        var clonedNode = currentNode.cloneNode(true);
        var clonedStyle = window.getComputedStyle(currentNode).cssText;
        clonedNode.style.cssText = clonedStyle;
        clonedNode.style.display = 'block';
        clonedNode.style.position = 'absolute';

        const boundingBox = currentNode.getBoundingClientRect();
        const valueToPreservePixelPerfectPosition = 1; // TODO understand why and remove it.
        clonedNode.style.top = boundingBox.top + valueToPreservePixelPerfectPosition + 'px';
        clonedNode.style.left = boundingBox.left + 'px';

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

    _enqueueChildren(queue, element) {
      const children = this._getChildren(element);
      for (var i = 0; i < children.length; i++) {
        queue.push(children[i]);
      }
    }

    _selectSpanNodesWithoutChildren(element) {
      return element.nodeName === 'SPAN' && this._getChildren(element).length === 0;
    }

    _hideOriginalElements(elements) {
      console.log(elements);
      for (var i = 0; i < elements.length; i++) {
        elements[i].style.visibility = 'hidden';
      }
    }
  }
};
