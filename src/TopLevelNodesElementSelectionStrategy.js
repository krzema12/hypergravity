import ElementSelectionStrategy from './ElementSelectionStrategy';

import DOMUtils from './DOMUtils';

class TopLevelNodesElementSelectionStrategy extends ElementSelectionStrategy {
  shouldAnimateElement(element) {
    return this._selectSpanNodesWithoutChildrenAndWithCursor(element);
  }

  _selectSpanNodesWithoutChildrenAndWithCursor(element) {
    return this._isTextElementWithoutChildren(element) || this._isCursor(element);
  }

  _isTextElementWithoutChildren(element) {
    return element.nodeName === 'SPAN' && DOMUtils.getChildren(element).length === 0;
  }

  _isCursor(element) {
    return element.className === 'cursor-node';
  }
}

export default TopLevelNodesElementSelectionStrategy;
