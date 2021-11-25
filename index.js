const markdown = require("simple-markdown");
const escapeHtml = require("escape-html");
const emoji = require("node-emoji");

function htmlTag(tagName, content, attributes, isClosed = true, state = {}) {
	if (typeof isClosed === "object") {
		state = isClosed;
		isClosed = true;
	}
	if (!attributes) {
		attributes = {};
	}
	if (attributes.class) {
		attributes.class = attributes.class.split(" ").map((cl) => state.cssModuleNames[cl] || cl).join(" ");
	}
	let attributeString = "";
	for (let attr in attributes) {
		if (Object.prototype.hasOwnProperty.call(attributes, attr) && attributes[attr]) {
			attributeString += ` ${markdown.sanitizeText(attr)}="${markdown.sanitizeText(attributes[attr])}"`;
		}
	}
	let unclosedTag = `<${tagName}${attributeString}>`;
	if (isClosed) {
		return unclosedTag + content + `</${tagName}>`;
	}
	return unclosedTag;
}
markdown.htmlTag = htmlTag;

function htmlSlackTag(content, attributes, state) {
	if (state.noExtraSpanTags) {
		return content;
	}
	return htmlTag("span", content, attributes, state);
}

const rulesUniversal = {
	emoji: {
		order: markdown.defaultRules.strong.order,
		match: (source) => /^:([a-zA-Z0-9_\-+]+):/.exec(source),
		parse: (capture) => {
			const code = capture[1];

			// slack uses <emoji>_face sometimes, so fallback to that
			const result = emoji.findByName(code) || emoji.findByName(code + "_face");

			return {
				content: result ? result.emoji : `:${code}:`,
				isEmoji: !!result,
			};
		},
		html: (node, output, state) => {
			const content = markdown.sanitizeText(node.content);
			if (!node.isEmoji || state.noExtraEmojiSpanTags) return content;
			return htmlTag("span", content, { class: "s-emoji" }, state);
		},
	},
	text: Object.assign({}, markdown.defaultRules.text, {
		match: (source) => /^[\s\S]+?(?=[^0-9A-Za-z\s\u00c0-\uffff-]|\n\n|\n|\w+:\S|$)/.exec(source),
		html: (node, output, state) => {
			const content = emoji.emojify(node.content);
			if (state.escapeHTML) {
				return markdown.sanitizeText(content);
			}

			return content;
		},
	}),
};

const rules = {
	blockQuote: Object.assign({}, markdown.defaultRules.blockQuote, {
		match: (source, state, prevSource) => !/^$|\n *$/.test(prevSource) || state.inQuote ? null : /^( *> [^\n]*(\n *> [^\n]*)*\n?)/.exec(source),
		parse: (capture, parse, state) => {
			const all = capture[0];
			const removeSyntaxRegex = /^ *> ?/gm;
			const content = all.replace(removeSyntaxRegex, "");

			state.inQuote = true;
			state.inline = true;
			const parsed = parse(content, state);
			state.inQuote = state.inQuote || false;
			state.inline = state.inline || false;

			return {
				content: parsed,
				type: "blockQuote",
			};
		},
	}),
	codeBlock: Object.assign({}, markdown.defaultRules.codeBlock, {
		match: markdown.inlineRegex(/^```([^]+?`*)\n*```/i),
		parse: (capture, parse, state) => {
			return {
				content: capture[1] || "",
				inQuote: state.inQuote || false,
			};
		},
		html: (node, output, state) => {
			const codeHtml = escapeHtml(node.content);
			return htmlTag("pre", htmlTag("code", codeHtml, null, state), null, state);
		},
	}),
	newline: markdown.defaultRules.newline,
	autolink: Object.assign({}, markdown.defaultRules.autolink, {
		order: markdown.defaultRules.strong.order + 1,
		match: markdown.inlineRegex(/^<((?:(?:(?:ht|f)tps?|ssh|irc):\/\/|mailto:|tel:)[^|>]+)(\|([^>]*))?>/),
		parse: (capture, parse, state) => {
			const content = capture[3] ? parse(capture[3], state) : [{
				type: "text",
				content: capture[1],
			}];
			return {
				content,
				target: capture[1],
			};
		},
		html: (node, output, state) => {
			return htmlTag("a", output(node.content, state), { href: markdown.sanitizeUrl(node.target) }, state);
		},
	}),
	url: Object.assign({ }, markdown.defaultRules.url, {
		parse: (capture) => {
			return {
				content: [{
					type: "text",
					content: capture[1],
				}],
				target: capture[1]
			}
		},
		html: (node, output, state) => {
			return htmlTag("a", output(node.content, state), { href: markdown.sanitizeUrl(node.target) }, state);
		},
	}),
	noem: {
		order: markdown.defaultRules.text.order,
		match: (source) => /^\\_/.exec(source),
		parse: function() {
			return {
				type: "text",
				content: "\\_",
			};
		},
		html: function(node, output, state) {
			return output(node.content, state);
		},
	},
	em: Object.assign({}, markdown.defaultRules.em, {
		match: markdown.inlineRegex(/^\b_(\S(?:\\[\s\S]|[^\\])*?\S|\S)_(?!_)\b/),
		parse: (capture, parse) => {
			return {
				content: parse(capture[1]),
				type: "em",
			};
		},
	}),
	strong: Object.assign({}, markdown.defaultRules.strong, {
		match: markdown.inlineRegex(/^\*(\S(?:\\[\s\S]|[^\\])*?\S|\S)\*(?!\*)/),
	}),
	strike: Object.assign({}, markdown.defaultRules.del, {
		match: markdown.inlineRegex(/^~(\S(?:\\[\s\S]|[^\\])*?\S|\S)~(?!~)/),
	}),
	inlineCode: markdown.defaultRules.inlineCode,
	br: Object.assign({ }, markdown.defaultRules.br, {
		match: markdown.anyScopeRegex(/^\n/),
	}),
};

const slackCallbackDefaults = {
	user: (node) => "@" + (node.name || node.id),
	channel: (node) => "#" + (node.name || node.id),
	usergroup: (node) => "^" + (node.name || node.id),
	atHere: (node) => "@" + (node.name || "here"),
	atChannel: (node) => "@" + (node.name || "channel"),
	atEveryone: (node) => "@" + (node.name || "everyone"),
	date: (node) => node.fallback,
};

const rulesSlack = {
	slackUser: {
		order: markdown.defaultRules.strong.order,
		match: (source) => /^<@([^|>]+)(\|([^>]*))?>/.exec(source),
		parse: (capture, parse, state) => {
			const name = capture[3] ? parse(capture[3], state) : "";
			return {
				id: capture[1],
				content: name,
			};
		},
		html: (node, output, state) => {
			const newNode = {
				id: node.id,
				name: node.content ? output(node.content, state) : "",
			};
			return htmlSlackTag(state.slackCallbacks.user(newNode), { class: "s-mention s-user" }, state);
		},
	},
	slackChannel: {
		order: markdown.defaultRules.strong.order,
		match: (source) => /^<#([^|>]+)(\|([^>]*))?>/.exec(source),
		parse: (capture, parse, state) => {
			const name = capture[3] ? parse(capture[3], state) : "";
			return {
				id: capture[1],
				content: name,
			};
		},
		html: (node, output, state) => {
			const newNode = {
				id: node.id,
				name: node.content ? output(node.content, state) : "",
			};
			return htmlSlackTag(state.slackCallbacks.channel(newNode), { class: "s-mention s-channel" }, state);
		},
	},
	slackUserGroup: {
		order: markdown.defaultRules.strong.order,
		match: (source) => /^<!subteam\^([^|>]+)(\|([^>]+))?>/.exec(source),
		parse: (capture, parse, state) => {
			const name = capture[3] ? parse(capture[3], state) : "";
			return {
				id: capture[1],
				content: name,
			};
		},
		html: (node, output, state) => {
			const newNode = {
				id: node.id,
				name: node.content ? output(node.content, state) : "",
			};
			return htmlSlackTag(state.slackCallbacks.usergroup(newNode), { class: "s-mention s-usergroup" }, state);
		},
	},
	slackAtHere: {
		order: markdown.defaultRules.strong.order,
		match: (source) => /^<!here(\|([^>]*))?>/.exec(source),
		parse: (capture, parse, state) => {
			const name = capture[2] ? parse(capture[2], state) : "";
			return {
				content: name,
			};
		},
		html: (node, output, state) => {
			const newNode = {
				name: node.content ? output(node.content, state) : "",
			};
			return htmlSlackTag(state.slackCallbacks.atHere(newNode), { class: "s-mention s-at-here" }, state);
		},
	},
	slackAtChannel: {
		order: markdown.defaultRules.strong.order,
		match: (source) => /^<!channel(\|([^>]*))?>/.exec(source),
		parse: (capture, parse, state) => {
			const name = capture[2] ? parse(capture[2], state) : "";
			return {
				content: name,
			};
		},
		html: (node, output, state) => {
			const newNode = {
				name: node.content ? output(node.content, state) : "",
			};
			return htmlSlackTag(state.slackCallbacks.atChannel(newNode), { class: "s-mention s-at-channel" }, state);
		},
	},
	slackAtEveryone: {
		order: markdown.defaultRules.strong.order,
		match: (source) => /^<!everyone(\|([^>]*))?>/.exec(source),
		parse: (capture, parse, state) => {
			const name = capture[2] ? parse(capture[2], state) : "";
			return {
				content: name,
			};
		},
		html: (node, output, state) => {
			const newNode = {
				name: node.content ? output(node.content, state) : "",
			};
			return htmlSlackTag(state.slackCallbacks.atEveryone(newNode), { class: "s-mention s-at-everyone" }, state);
		},
	},
	slackDate: {
		order: markdown.defaultRules.strong.order,
		match: (source) => /^<!date\^([^|>^]+)\^([^|>^]+)(\^([^|>^]+))?(\|([^>]*))?>/.exec(source),
		parse: (capture, parse, state) => {
			const name = capture[6] ? parse(capture[6], state) : "";
			const timestamp = capture[1];
			const format = capture[2];
			const link = capture[4];
			return {
				timestamp,
				format,
				link,
				content: name,
			};
		},
		html: (node, output, state) => {
			const newNode = {
				timestamp: node.timestamp,
				format: node.format,
				link: node.link,
				fallback: node.content ? output(node.content, state) : "",
			};
			return htmlSlackTag(state.slackCallbacks.date(newNode), { class: "s-mention s-date" }, state);
		},
	}
};
Object.assign(rules, rulesSlack);
Object.assign(rules, rulesUniversal);

const rulesSlackOnly = Object.assign({}, rulesSlack, rulesUniversal);

const parser = markdown.parserFor(rules);
const htmlOutput = markdown.htmlFor(markdown.ruleOutput(rules, "html"));
const parserSlack = markdown.parserFor(rulesSlackOnly);
const htmlOutputSlack = markdown.htmlFor(markdown.ruleOutput(rulesSlackOnly, "html"));

function toHTML(source, opts) {
	const options = Object.assign({
		escapeHTML: true,
		slackOnly: false,
		slackCallbacks: {},
		cssModuleNames: {},
		noExtraSpanTags: false,
		noExtraEmojiSpanTags: false,
	}, opts || {});
	let _parser = parser;
	let _htmlOutput = htmlOutput;
	if (options.slackOnly) {
		_parser = parserSlack;
		_htmlOutput = htmlOutputSlack;
	}

	const state = {
		inline: true,
		inQuote: false,
		escapeHTML: options.escapeHTML,
		cssModuleNames: options.cssModuleNames,
		slackCallbacks: Object.assign({}, slackCallbackDefaults, options.slackCallbacks),
		noExtraSpanTags: options.noExtraSpanTags,
		noExtraEmojiSpanTags: options.noExtraEmojiSpanTags,
	};

	return _htmlOutput(_parser(source, state), state);
}

module.exports = {
	rules,
	rulesSlack,
	rulesUniversal,
	toHTML,
};
