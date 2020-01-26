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
