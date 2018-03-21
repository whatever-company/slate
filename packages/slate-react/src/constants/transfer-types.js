import { IS_IE } from './environment'

/**
 * The transfer types that Slate recognizes.
 *
 * @type {Object}
 */

const TRANSFER_TYPES = {
  FRAGMENT: 'application/x-slate-fragment',
  HTML: 'text/html',
  NODE: 'application/x-slate-node',
  RICH: 'text/rtf',
  TEXT: IS_IE ? 'text' : 'text/plain',
}

/**
 * Export.
 *
 * @type {Object}
 */

export default TRANSFER_TYPES
