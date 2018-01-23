/**
 * Subclasses of this class describe which DOM elements shoudl be animated.
 */
class ElementSelectionStrategy {
  constructor() {
    if (new.target === ElementSelectionStrategy) {
      throw new TypeError('ElementSelectionStrategy is abstract, cannot instantiate it!');
    }
  }

  shouldAnimateElement(element) {
    throw new TypeError('ElementSelectionStrategy.shouldAnimateElement is abstract, cannot call it!');
  }
}

export default ElementSelectionStrategy;
