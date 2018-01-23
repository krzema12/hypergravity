import ElementSelectionStrategy from './ElementSelectionStrategy';

import DOMUtils from './DOMUtils';

class TopLevelNodesElementSelectionStrategy extends ElementSelectionStrategy {
  shouldAnimateElement(element) {
    return this._isChildOfRowElement(element) || this._isCursor(element);
  }

  _isChildOfRowElement(element) {
    return element.parentNode.nodeName === 'X-ROW';
  }

  _isCursor(element) {
    return element.className === 'cursor-node';
  }
}

export default TopLevelNodesElementSelectionStrategy;
