import {
  Engine as PhysicsEngine,
  World as PhysicsWorld,
  Bodies as PhysicsBodies,
  Render as PhysicsRender } from 'matter-js';
import AnimationModel from './AnimationModel';

const WALL_THICKNESS = 10;

/**
 * This animation model implements gravity.
 * The boundaries of the console window are considered static walls.
 */
class GravityAnimationModel extends AnimationModel {
 /**
  * Parameters:
  * - boundingBox: a description of a rectangle where the gravity should act in.
  *                It should expose the following attributes: width, height, top, bottom, left, right.
  * - elements: an array of elements to be animated.
  *             It should expose the following attributes: x, y, width, height, rotation (in radians).
  */
  constructor(boundingBox, elements, options) {
    super();
    this._elements = elements;

    this._physicsEngine = PhysicsEngine.create();
    this._addPhysicsBodies(this._physicsEngine, boundingBox, elements);

    if (options.physicsPreviewElement) {
      this._configurePhysicsPreview(
        this._physicsEngine, options.physicsPreviewElement, boundingBox);
    }
  }

  getElementsForNextFrame(deltaSeconds) {
    PhysicsEngine.update(this._physicsEngine, deltaSeconds);

    let elementsToReturn = [];

    for (let physicsBody of this._physicsEngine.world.bodies) {
      if (physicsBody.isStatic) {
        continue;
      }

      physicsBody.element.x = physicsBody.position.x;
      physicsBody.element.y = physicsBody.position.y;
      physicsBody.element.rotation = physicsBody.angle;
      elementsToReturn.push(physicsBody.element);
    }

    return elementsToReturn;
  }

  tearDown() {
    PhysicsRender.stop(this._renderer);
  }

  _addPhysicsBodies(physicsEngine, boundingBox, elements) {
    const walls = this._createWalls(boundingBox);
    const animatableBodies = this._createAnimatableBodies(elements);
    PhysicsWorld.add(physicsEngine.world, [...walls, ...animatableBodies]);
  }

  _configurePhysicsPreview(physicsEngine, domElement, boundingBox) {
    this._renderer = PhysicsRender.create({
      element: domElement,
      engine: physicsEngine,
      options: {
          width: boundingBox.width,
          height: boundingBox.height
        }
    });

    PhysicsRender.run(this._renderer);
  }

  _createWalls(boundingBox) {
    return [
      this._createTopWall(boundingBox),
      this._createBottomWall(boundingBox),
      this._createLeftWall(boundingBox),
      this._createRightWall(boundingBox)
    ];
  }

  _createAnimatableBodies(elements) {
    return elements.map(
      element => PhysicsBodies.rectangle(
        element.x, element.y, element.width, element.height, { element: element }))
  }

  _createTopWall(boundingBox) {
    const positionX = this._middle(boundingBox.left, boundingBox.right);
    return PhysicsBodies.rectangle(
      positionX, -WALL_THICKNESS/2, boundingBox.width, WALL_THICKNESS, { isStatic: true });
  }

  _createBottomWall(boundingBox) {
    const positionX = this._middle(boundingBox.left, boundingBox.right);
    return PhysicsBodies.rectangle(
      positionX, boundingBox.height + WALL_THICKNESS/2, boundingBox.width, WALL_THICKNESS, { isStatic: true });
  }

  _createLeftWall(boundingBox) {
    const positionY = this._middle(boundingBox.top, boundingBox.bottom);
    return PhysicsBodies.rectangle(
      -WALL_THICKNESS/2, positionY, WALL_THICKNESS, boundingBox.height, { isStatic: true });
  }

  _createRightWall(boundingBox) {
    const positionY = this._middle(boundingBox.top, boundingBox.bottom);
    return PhysicsBodies.rectangle(
      boundingBox.width + WALL_THICKNESS/2, positionY, WALL_THICKNESS, boundingBox.height, { isStatic: true });
  }

  _middle(lower, higher) {
    return (higher - lower)/2;
  }
}

export default GravityAnimationModel;
