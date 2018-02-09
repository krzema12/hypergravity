import ElementSelectionStrategy from './ElementSelectionStrategy';

import DOMUtils from './DOMUtils';

class TopLevelNodesElementSelectionStrategy extends ElementSelectionStrategy {
  shouldAnimateElement(element) {
    return this._isNonEmptyTextNode(element) || this._isCursor(element);
  }

  _isNonEmptyTextNode(element) {
    return element.nodeType === Node.TEXT_NODE && element.textContent.trim() !== '';
  }

  _isCursor(element) {
    return element.className === 'cursor-node';
  }
}

export default TopLevelNodesElementSelectionStrategy;
