/**
 * Subclasses of this class describe what should happen with the elements in each new frame.
 */
class AnimationModel {
  constructor() {
    if (new.target === AnimationModel) {
      throw new TypeError('AnimationModel is abstract, cannot instantiate it!');
    }
  }

  getElementsForNextFrame(deltaSeconds) {
    throw new TypeError('AnimationModel.getElementsForNextFrame is abstract, cannot call it!');
  }
}

export default AnimationModel;
