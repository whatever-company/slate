import getWindow from 'get-window'

import { Range } from 'slate'
import findNode from './find-node'
import findRange from './find-range'

/**
 * Get the target range from a DOM `event`.
 *
 * @param {Event} event
 * @param {Value} value
 * @return {Range}
 */

function getEventRange(event, value) {
  if (event.nativeEvent) {
    event = event.nativeEvent
  }

  const { x, y, target } = event
  if (x == null || y == null) return null

  const { document } = value
  const node = findNode(target, value)
  if (!node) return null

  // If the drop target is inside a void node, move it into either the next or
  // previous node, depending on which side the `x` and `y` coordinates are
  // closest to.
  if (node.isVoid) {
    const rect = target.getBoundingClientRect()
    const isPrevious =
      node.object == 'inline'
        ? x - rect.left < rect.left + rect.width - x
        : y - rect.top < rect.top + rect.height - y

    const text = node.getFirstText()
    const range = Range.create()
    return isPrevious
      ? range.moveToEndOf(document.getPreviousText(text.key))
      : range.moveToStartOf(document.getNextText(text.key))
  }

  // Else resolve a range from the caret position where the drop occured.
  const window = getWindow(target)
  let native

  // COMPAT: In Firefox, `caretRangeFromPoint` doesn't exist. (2016/07/25)
  if (window.document.caretRangeFromPoint) {
    native = window.document.caretRangeFromPoint(x, y)
  } else if (window.document.caretPositionFromPoint) {
    const position = window.document.caretPositionFromPoint(x, y)
    native = window.document.createRange()
    native.setStart(position.offsetNode, position.offset)
    native.setEnd(position.offsetNode, position.offset)
  } else if (event.rangeParent) {
    // COMPAT : in IE11, `caretPositionFromPoint` does not exist (2018/03/20)
    native = window.document.createRange()
    native.setStart(event.rangeParent, event.rangeOffset)
  } else if (window.getSelection) {
    native = window.document.createRange()
    const selection = window.getSelection()
    const range = selection.getRangeAt
      ? selection.getRangeAt(0)
      : selection.createRange()
    native.setStart(
      selection.focusNode,
      range.collapsed
        ? selection.focusOffset
        : selection.focusNode.innerText.length
    )
  }

  // Resolve a Slate range from the DOM range.
  const range = findRange(native, value)
  if (!range) return null

  return range
}

/**
 * Export.
 *
 * @type {Function}
 */

export default getEventRange
