const HTML_tags = [
  'a',
  'abbr',
  'acronym',
  'address',
  'area',
  'article',
  'aside',
  'audio',
  'b',
  'bdi',
  'bdo',
  'big',
  'blink',
  'blockquote',
  'body',
  'br',
  'button',
  'canvas',
  'caption',
  'center',
  'cite',
  'code',
  'col',
  'colgroup',
  'content',
  'data',
  'datalist',
  'dd',
  'decorator',
  'del',
  'details',
  'dfn',
  'dialog',
  'dir',
  'div',
  'dl',
  'dt',
  'element',
  'em',
  'fieldset',
  'figcaption',
  'figure',
  'font',
  'footer',
  'form',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'head',
  'header',
  'hgroup',
  'hr',
  'html',
  'i',
  'img',
  'input',
  'ins',
  'kbd',
  'label',
  'legend',
  'li',
  'main',
  'map',
  'mark',
  'marquee',
  'menu',
  'menuitem',
  'meter',
  'nav',
  'nobr',
  'ol',
  'optgroup',
  'option',
  'output',
  'p',
  'picture',
  'pre',
  'progress',
  'q',
  'rp',
  'rt',
  'ruby',
  's',
  'samp',
  'section',
  'select',
  'shadow',
  'small',
  'source',
  'spacer',
  'span',
  'strike',
  'strong',
  'style',
  'sub',
  'summary',
  'sup',
  'table',
  'tbody',
  'td',
  'template',
  'textarea',
  'tfoot',
  'th',
  'thead',
  'time',
  'tr',
  'track',
  'tt',
  'u',
  'ul',
  'var',
  'video',
  'wbr',

  // Arbitrary tags
  '\n',
  '\t',
  '\b',

];

/// TODO: Make this function more sane,
// Including the ability to check for similiar tags,
// extended tags (i.e., <a href="" target="">), etc.
/**
 * Basic HTML Sanitiser for handling majority of basic tags,
 * Won't protect against XSS reflecting from a source website yet
 * @param input String to be sanitised
 * @returns Santised String
 */
function html_sanitise(input: string): string {
	for (let i = 0; i < HTML_tags.length; i++) {
		let test = `<${HTML_tags[i]}>`;

		if (input.includes(test)) {
			input.replace(test, "");
		}
	}

	return input;
};

/// TODO: Implement this
/**
 * Hybrid Function for sanitising multiple variations of text, including but not limited to:
 * - HTML/XML
 * - Escape Sequences
 * @param input Text to be sanitised
 * @param settings Settings object to define what to (not) sanitise
 */
function hybrid_sanitise(input: string, settings: {
	enabled: {
		html: boolean,
		escape: boolean
	},
	// Custom Patterns 
	patterns: {
		html: string,
		escape: string,
	}
}) {

};

module.exports = {
	html: html_sanitise,
	// hybrid: hybrid_sanitise
};
