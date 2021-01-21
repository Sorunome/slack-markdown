const markdown = require("../index");

it("Should escape HTML", () => {
	expect(markdown.toHTML("<b>test</b>"))
		.toBe("&lt;b&gt;test&lt;/b&gt;");
});

it("Should properly escape URLs", () => {
	expect(markdown.toHTML("https://example.org?a&b"))
		.toBe("<a href=\"https://example.org?a&amp;b\">https://example.org?a&amp;b</a>")

	expect(markdown.toHTML("<https://example.org?a&b>"))
		.toBe("<a href=\"https://example.org?a&amp;b\">https://example.org?a&amp;b</a>")
});

it("Should not escape HTML, if the flag is set", () => {
	expect(markdown.toHTML("<b>test</b>", { escapeHTML: false }))
		.toBe("<b>test</b>");
});

it("Should not lose arms", () => {
	expect(markdown.toHTML("¯\\_(ツ)_/¯"))
		.toBe("¯\\_(ツ)_/¯");
});
