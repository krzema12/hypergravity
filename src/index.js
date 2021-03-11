import TextNodesElementSelectionStrategy from './TextNodesElementSelectionStrategy';
import GravityAnimationModel from './GravityAnimationModel';

import DOMUtils from './DOMUtils';

exports.decorateKeymaps = (keymaps) => {
  return Object.assign({}, keymaps, {
    'gravity:toggle': 'ctrl+g'
  });
}

exports.decorateTerms = (Terms, {React}) => {
  return class extends React.Component {
    constructor (props, context) {
      super(props, context);

      this._onDecorated = this._onDecorated.bind(this);
      this._terms = null;
    }

    render () {
      return React.createElement(Terms, Object.assign({}, this.props, {
        onDecorated: this._onDecorated
      }));
    }

    _onDecorated (terms) {
      if (this.props.onDecorated) { this.props.onDecorated(terms); };

      if (terms) {
        terms.registerCommands({
          'gravity:toggle': (e) => {
            this._toggleGravityMode();
            e.preventDefault();
          }
        });
      }

      this._terms = terms;
    }

    _toggleGravityMode () {
      if (!this._terms.getActiveTerm) {
        return;
      }
      const term = this._terms.getActiveTerm();
      console.log('term', term);
      if (term && term.props && term.props.toggleGravityMode) {
        term.props.toggleGravityMode();
      }
    }
  };
};

exports.decorateTerm = (Term, { React, notify }) => {
  return class extends React.Component {
    constructor (props, context) {
      super(props, context);

      this._onTerminal = this._onTerminal.bind(this);
      this._drawFrame = this._drawFrame.bind(this);
      this._toggleGravityMode = this._toggleGravityMode.bind(this);
      this._enableGravityMode = this._enableGravityMode.bind(this);
      this._disableGravityMode = this._disableGravityMode.bind(this);
      this._selectDOMElementsToAnimate = this._selectDOMElementsToAnimate.bind(this);
      this._elements = [];
      this._elmentSelectionStrategy = new TextNodesElementSelectionStrategy();
    }

    render () {
      return React.createElement(Term, Object.assign({}, this.props, {
        onTerminal: this._onTerminal,
        toggleGravityMode: this._toggleGravityMode
      }));
    }

    _drawFrame() {
      if (!this._isGravityEnabled) {
        return;
      }

      this._calculateNewElementPositions();
      window.requestAnimationFrame(this._drawFrame);
    }

    _createPhysicsWorld() {
      const rootDivBoundingBox = this._rootDiv.getBoundingClientRect();

      const options = {
        // physicsPreviewElement: this._createAndRegisterPhysicsPreviewElement()
      };

      this._animationModel = new GravityAnimationModel(rootDivBoundingBox, this._elements, options);
    }

    _createAndRegisterPhysicsPreviewElement() {
      this._physicsPreviewElement = window.document.createElement('div');
      this._rootDiv.appendChild(this._physicsPreviewElement);

      return this._physicsPreviewElement;
    }

    _destroyPhysicsPreviewElement() {
      if (!this._physicsPreviewElement) {
        return;
      }

      this._rootDiv.removeChild(this._physicsPreviewElement);
      this._physicsPreviewElement = null;
    }

    _calculateNewElementPositions() {
      const updatedElements = this._animationModel.getElementsForNextFrame(1000/60);

      for (let element of updatedElements) {
        element.updatePosition();
      }
    }

    _onTerminal (term) {
      if (this.props.onTerminal) {
        this.props.onTerminal(term);
      }

      this._rootDiv = term.div_;
    }

    _toggleGravityMode() {
      if (this._isGravityEnabled) {
        this._disableGravityMode();
      } else {
        this._enableGravityMode();
      }
    }

    _enableGravityMode() {
      this._elementsToAnimate = this._selectDOMElementsToAnimate();
      this._setElementsVisibility(DOMUtils.getChildren(this._rootDiv), 'hidden');
      this._container = this._copyElementsToSeparateContainer(this._elementsToAnimate);
      this._createPhysicsWorld();
      window.requestAnimationFrame(this._drawFrame);
      this._isGravityEnabled = true;
    }

    _disableGravityMode() {
      this._setElementsVisibility(DOMUtils.getChildren(this._rootDiv), 'visible');
      this._rootDiv.removeChild(this._container);
      this._animationModel.tearDown();
      this._destroyPhysicsPreviewElement();
      this._animationModel = null;
      this._elements = [];
      this._isGravityEnabled = false;
    }

    _selectDOMElementsToAnimate() {
      let queue = [this._rootDiv];
      let elementsToAnimate = [];

      while (queue.length > 0) {
        const elementFromTop = queue.shift();

        if (this._elmentSelectionStrategy.shouldAnimateElement(elementFromTop)) {
          elementsToAnimate.push(elementFromTop);
        }

        this._enqueueChildren(queue, elementFromTop);
      }

      return elementsToAnimate;
    }

    _copyElementsToSeparateContainer(elements) {
      let separateContainer = window.document.createElement('div');

      for (let i = 0; i < elements.length; i++) {
        const currentNode = elements[i];
        let clonedNode = currentNode.cloneNode(true);
        let objectToCalculateBoundingBox = currentNode;
        let objectToCalculateStyle = currentNode;

        if (currentNode.nodeType === Node.TEXT_NODE) {
          let spanWrapper = window.document.createElement('div');
          spanWrapper.textContent = currentNode.textContent;
          clonedNode = spanWrapper;

          let range = document.createRange();
          range.selectNodeContents(currentNode);
          objectToCalculateBoundingBox = range;
          objectToCalculateStyle = currentNode.parentNode;
        }

        let clonedStyle = window.getComputedStyle(objectToCalculateStyle).cssText;
        clonedNode.style.cssText = clonedStyle;
        clonedNode.style.position = 'absolute';

        const boundingBox = objectToCalculateBoundingBox.getBoundingClientRect();
        const valueToPreservePixelPerfectPosition = 1; // TODO understand why and remove it.
        clonedNode.style.top = boundingBox.top + valueToPreservePixelPerfectPosition + 'px';
        clonedNode.style.left = boundingBox.left + 'px';
        clonedNode.style.width = (boundingBox.right - boundingBox.left) + 'px';
        clonedNode.style.height = (boundingBox.bottom - boundingBox.top) + 'px';

        this._elements.push({
          x: boundingBox.left + boundingBox.width/2,
          y: boundingBox.top + boundingBox.height/2,
          width: boundingBox.width,
          height: boundingBox.height,
          rotation: 0,
          domElement: clonedNode,
          updatePosition: function() {
            this.domElement.style.left = this.x - this.width/2 + 'px';
            this.domElement.style.top = this.y - this.height/2 + 'px';
            this.domElement.style.transform = 'rotate(' + (this.rotation*180.0/Math.PI) + 'deg)';
            this.domElement.style.transformOrigin = 'center center';
          }
        });

        separateContainer.appendChild(clonedNode);
      }

      this._rootDiv.appendChild(separateContainer);
      return separateContainer;
    }

    _enqueueChildren(queue, element) {
      const children = DOMUtils.getChildren(element);
      for (let i = 0; i < children.length; i++) {
        queue.push(children[i]);
      }
    }

    _setElementsVisibility(elements, visibility) {
      for (let i = 0; i < elements.length; i++) {
        elements[i].style.visibility = visibility;
      }
    }
  }
};
