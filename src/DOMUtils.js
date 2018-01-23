class DOMUtils {
  static getChildren(element) {
    if (element.nodeName === 'IFRAME') {
      return element.contentWindow.document.body.children;
    }

    return element.children;
  }
}

export default DOMUtils;
