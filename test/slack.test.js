const markdown = require("../index");

it("Should parse user mentions", () => {
	expect(markdown.toHTML("hey <@ID|user>!"))
		.toBe("hey <span class=\"s-mention s-user\">@user</span>!");
});


it("Should do custom user parsing", () => {
	expect(markdown.toHTML("hey <@ID|user>!", {
		slackCallbacks: { user: (node) => "@++" + node.name + "++" },
	})).toBe("hey <span class=\"s-mention s-user\">@++user++</span>!");
});

it("Should parse channel mentions", () => {
	expect(markdown.toHTML("hey <#ID|chan>!"))
		.toBe("hey <span class=\"s-mention s-channel\">#chan</span>!");
});

it("Should do custom channel parsing", () => {
	expect(markdown.toHTML("hey <#ID|chan>!", {
		slackCallbacks: { channel: (node) => "#++" + node.name + "++" },
	})).toBe("hey <span class=\"s-mention s-channel\">#++chan++</span>!");
});

it("Should parse user group mentions", () => {
	expect(markdown.toHTML("hey <!subteam^ID|usergroup>!"))
		.toBe("hey <span class=\"s-mention s-usergroup\">^usergroup</span>!");
});

it("Should do custom user group parsing", () => {
	expect(markdown.toHTML("hey <!subteam^ID|usergroup>!", {
		slackCallbacks: { usergroup: (node) => "^++" + node.name + "++" },
	})).toBe("hey <span class=\"s-mention s-usergroup\">^++usergroup++</span>!");
});

it("Should parse at here", () => {
	expect(markdown.toHTML("hey <!here>!"))
		.toBe("hey <span class=\"s-mention s-at-here\">@here</span>!");
});

it("Should do custom at here parsing", () => {
	expect(markdown.toHTML("hey <!here>!", {
		slackCallbacks: { atHere: () => "@++here++" },
	})).toBe("hey <span class=\"s-mention s-at-here\">@++here++</span>!");
});

it("Should parse at channel", () => {
	expect(markdown.toHTML("hey <!channel>!"))
		.toBe("hey <span class=\"s-mention s-at-channel\">@channel</span>!");
});

it("Should do custom at channel parsing", () => {
	expect(markdown.toHTML("hey <!channel>!", {
		slackCallbacks: { atChannel: () => "@++channel++" },
	})).toBe("hey <span class=\"s-mention s-at-channel\">@++channel++</span>!");
});

it("Should parse at everyone", () => {
	expect(markdown.toHTML("hey <!everyone>!"))
		.toBe("hey <span class=\"s-mention s-at-everyone\">@everyone</span>!");
});

it("Should do custom at everyone parsing", () => {
	expect(markdown.toHTML("hey <!everyone>!", {
		slackCallbacks: { atEveryone: () => "@++everyone++" },
	})).toBe("hey <span class=\"s-mention s-at-everyone\">@++everyone++</span>!");
});

it("Should disable the extra span tags, if set", () => {
	expect(markdown.toHTML("hey <@ID|user>!", { noExtraSpanTags: true }))
		.toBe("hey @user!");
});

it("should prioritize links", () => {
	expect(markdown.toHTML("Hey _beep <https://example.org|hmm_yeah>"))
		.toBe("Hey _beep <a href=\"https://example.org\">hmm_yeah</a>");
});
