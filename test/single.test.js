const markdown = require("../index");

test("Should convert *text* to <strong>text</strong>", () => {
	expect(markdown.toHTML("This is a *test* with *some bold* text in it"))
		.toBe("This is a <strong>test</strong> with <strong>some bold</strong> text in it");
});

it("Should convert _text_ to <em>text</em>", () => {
	expect(markdown.toHTML("This is a _test_ with _some italicized_ text in it"))
		.toBe("This is a <em>test</em> with <em>some italicized</em> text in it");
});

it("Should not convert inner_underscored_text to inner<em>underscored</em>text", () => {
	expect(markdown.toHTML("This is a _test_ with some_italicized_text in it"))
		.toBe("This is a <em>test</em> with some_italicized_text in it");
});

it("Should convert `text` to <code>text</code>", () => {
	expect(markdown.toHTML("Code: `1 + 1 = 2`"))
		.toBe("Code: <code>1 + 1 = 2</code>");
});

it("Should convert ~text~ to <del>text</del>", () => {
	expect(markdown.toHTML("~this~that"))
		.toBe("<del>this</del>that");
});

it("Should leave ~ test ~ alone", () => {
	expect(markdown.toHTML("this ~ is a ~ test"))
		.toBe("this ~ is a ~ test");
});

it("Should linkify URLs", () => {
	expect(markdown.toHTML("https://example.org"))
		.toBe("<a href=\"https://example.org\">https://example.org</a>");

	expect(markdown.toHTML("<https://example.org>"))
		.toBe("<a href=\"https://example.org\">https://example.org</a>");
});

it("Should handle named links", () => {
	expect(markdown.toHTML("<https://example.org|example>"))
		.toBe("<a href=\"https://example.org\">example</a>");
});

it("Should parse named links contents", () => {
	expect(markdown.toHTML("<https://example.org|this is *awesome*>"))
		.toBe("<a href=\"https://example.org\">this is <strong>awesome</strong></a>");
});

it("Should parse new lines", () => {
	expect(markdown.toHTML("new\nline"))
		.toBe("new<br>line");
})

it("Should fence code blocks", () => {
	expect(markdown.toHTML("text\n```code\nblock```\nmore text"))
		.toBe("text<br><pre><code>code\nblock</code></pre><br>more text");
});

it("Should fence code blocks on one line", () => {
	expect(markdown.toHTML("```test```"))
		.toBe("<pre><code>test</code></pre>");
});

it("Should fence weird stuff", () => {
	expect(markdown.toHTML("```codeblock `backtick````"))
		.toBe("<pre><code>codeblock `backtick`</code></pre>");
});

it("Should HTML-escape fenced code blocks", () => {
	expect(markdown.toHTML("`test`\n\n```<>```"))
		.toBe("<code>test</code><br><br><pre><code>&lt;&gt;</code></pre>");
});

it("Should not escape marks", () => {
	expect(markdown.toHTML("Code: \\`1 + 1` = 2`"))
		.toBe("Code: \\<code>1 + 1</code> = 2`");
});

it("Should do simple block quotes", () => {
	expect(markdown.toHTML("> text\n > here"))
		.toBe('<blockquote>text<br>here</blockquote>');
});

it("Should finish off block quotes", () => {
	expect(markdown.toHTML("hey\n> text\nhere"))
		.toBe("hey<br><blockquote>text<br></blockquote>here");
});

it("Should handle block quotes with blank lines", () => {
	expect(markdown.toHTML("> text\n> \n> here"))
		.toBe("<blockquote>text<br><br>here</blockquote>");
});

it("Should emojify things", () => {
	expect(markdown.toHTML("blah :fox: blah"))
		.toBe("blah <span class=\"s-emoji\">🦊</span> blah");

	expect(markdown.toHTML("blah :fox_face: blah"))
		.toBe("blah <span class=\"s-emoji\">🦊</span> blah");

	expect(markdown.toHTML("blah :fox: blah", { noExtraEmojiSpanTags: true }))
		.toBe("blah 🦊 blah");
});

it("Should leave unknown emojis alone", () => {
	expect(markdown.toHTML("blah :asdf: blah"))
		.toBe("blah :asdf: blah");
});

it("Should not italicize in words", () => {
	expect(markdown.toHTML("_this is italic_regular"))
		.toBe("_this is italic_regular");
});
