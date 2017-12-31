const globalShortcut = require('electron').remote.globalShortcut;

exports.decorateTerm = (Term, { React, notify }) => {
  return class extends React.Component {
    constructor (props, context) {
      super(props, context);

      this._onTerminal = this._onTerminal.bind(this);
      this._selectSpanNodesWithoutChildren = this._selectSpanNodesWithoutChildren.bind(this);
      this._drawFrame = this._drawFrame.bind(this);

      globalShortcut.register('CommandOrControl+G', () => {
        console.log('Gravity mode enabled');

        const elementsToAnimate = this._selectDOMElementsToAnimate(this._selectSpanNodesWithoutChildren);
        this._container = this._copyElementsToSeparateContainer(elementsToAnimate);
        this._hideOriginalElements(elementsToAnimate);
        window.requestAnimationFrame(this._drawFrame);
      })
    }

    render () {
      return React.createElement(Term, Object.assign({}, this.props, {
        onTerminal: this._onTerminal
      }));
    }

    _drawFrame() {
      this._calculateNewElementPositions();
      window.requestAnimationFrame(this._drawFrame);
    }

    _calculateNewElementPositions() {
      const currentTimeInMillis = new Date().getTime();

      for (var element of this._container.children) {
        element.style.top = 200 + 50*Math.sin(
          currentTimeInMillis*0.005 + parseInt(element.style.left)*0.005) + 'px';
      }
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
      for (var i = 0; i < elements.length; i++) {
        elements[i].style.visibility = 'hidden';
      }
    }
  }
};
