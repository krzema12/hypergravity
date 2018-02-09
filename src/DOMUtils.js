class DOMUtils {
  static getChildren(element) {
    if (element.nodeName === 'IFRAME') {
      return element.contentWindow.document.body.childNodes;
    }

    return element.childNodes;
  }
}

export default DOMUtils;
