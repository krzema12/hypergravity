const globalShortcut = require('electron').remote.globalShortcut;
const Matter = require('matter-js');
const PhysicsEngine = Matter.Engine;
const PhysicsWorld = Matter.World;
const PhysicsBodies = Matter.Bodies;
const PhysicsRender = Matter.Render;

exports.decorateTerm = (Term, { React, notify }) => {
  return class extends React.Component {
    constructor (props, context) {
      super(props, context);

      this._onTerminal = this._onTerminal.bind(this);
      this._selectSpanNodesWithoutChildrenAndCursor = this._selectSpanNodesWithoutChildrenAndCursor.bind(this);
      this._drawFrame = this._drawFrame.bind(this);
      this._elements = [];

      globalShortcut.register('CommandOrControl+G', () => {
        console.log('Gravity mode enabled');

        const elementsToAnimate = this._selectDOMElementsToAnimate(this._selectSpanNodesWithoutChildrenAndCursor);
        this._container = this._copyElementsToSeparateContainer(elementsToAnimate);
        this._createPhysicsWorld();
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

    _createPhysicsWorld() {
      const rootDivBoundingBox = this._rootDiv.getBoundingClientRect();

      this._physicsEngine = PhysicsEngine.create();
      this._physicsWorld = this._physicsEngine.world;

      var physicsBodies = [];

      for (var element of this._elements) {
        physicsBodies.push(PhysicsBodies.rectangle(
          element.x, element.y, element.width, element.height, { element: element }));
      }

      var bottomWall = PhysicsBodies.rectangle(
        (rootDivBoundingBox.right - rootDivBoundingBox.left)/2,
        0,
        rootDivBoundingBox.width,
        10,
        { isStatic: true });
      var topWall = PhysicsBodies.rectangle(
        (rootDivBoundingBox.right - rootDivBoundingBox.left)/2,
        rootDivBoundingBox.height,
        rootDivBoundingBox.width,
        10,
        { isStatic: true });
      var leftWall = PhysicsBodies.rectangle(
        0,
        (rootDivBoundingBox.bottom - rootDivBoundingBox.top)/2,
        10,
        rootDivBoundingBox.height,
        { isStatic: true });
      var rightWall = PhysicsBodies.rectangle(
        rootDivBoundingBox.width,
        (rootDivBoundingBox.bottom - rootDivBoundingBox.top)/2,
        10,
        rootDivBoundingBox.height,
        { isStatic: true });
      physicsBodies.push(bottomWall);
      physicsBodies.push(topWall);
      physicsBodies.push(leftWall);
      physicsBodies.push(rightWall);

      PhysicsWorld.add(this._physicsWorld, physicsBodies);

      // this._enableBodiesBoundariesPreview(rootDivBoundingBox);
    }

    _enableBodiesBoundariesPreview(rootDivBoundingBox) {
      var physicsPreviewElement = window.document.createElement('div');
      this._rootDiv.appendChild(physicsPreviewElement);

      var renderer = PhysicsRender.create({
        element: physicsPreviewElement,
        engine: this._physicsEngine,
        options: {
            width: rootDivBoundingBox.width,
            height: rootDivBoundingBox.height
          }
      });

      PhysicsRender.run(renderer);
    }

    _calculateNewElementPositions() {
      PhysicsEngine.update(this._physicsEngine, 1000 / 60);

      for (var physicsBody of this._physicsEngine.world.bodies) {
        if (physicsBody.isStatic) {
          continue;
        }

        physicsBody.element.x = physicsBody.position.x;
        physicsBody.element.y = physicsBody.position.y;
        physicsBody.element.rotation = physicsBody.angle;
        physicsBody.element.updatePosition();
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

    _selectSpanNodesWithoutChildrenAndCursor(element) {
      return this._isTextElementWithoutChildren(element) || this._isCursor(element);
    }

    _isTextElementWithoutChildren(element) {
      return element.nodeName === 'SPAN' && this._getChildren(element).length === 0;
    }

    _isCursor(element) {
      return element.className === 'cursor-node';
    }

    _hideOriginalElements(elements) {
      for (var i = 0; i < elements.length; i++) {
        elements[i].style.visibility = 'hidden';
      }
    }
  }
};
