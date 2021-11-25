# slack-markdown
Slack-markdown aims to be a markdown parser for slack messages.

## Installation
`npm install --save slack-markdown`

## Usage
```js
const { toHTML } = require("slack-markdown");
console.log(toHTML("This *is* a _test_"));
// outputs: This <strong>is</strong> a <em>test</em>
```

## Options
```js
const { toHTML } = require("slack-markdown");
toHTML("This *is* a _test_", options);
```

`options` is an object with the following properties (all are optional):

 - `escapeHTML`: `boolean` (default: `true`), if HTML should be escaped or not
 - `slackOnly`: `boolean` (default: `false`), if only slack-specific markdown should be parsed
 - `slackCallbacks`: Object of the custom slack callbacks
   - `user`: (`id`: ID, `name`: Name) User mentions "<@ID|name>"
   - `channel`: (`id`: ID, `name`: Name) Channel mentions "<#ID|name>"
   - `usergroup`: (`id`: ID, `name`: Name) User group mentions "<!subteam^ID|name>"
   - `atHere`: (`name`: Name) At here mentions "<!here|name>"
   - `atChannel`: (`name`: Name) At channel mentions "<!channel|name>"
   - `atEveryone`: (`name`: Name) At everyone mentions "<!everyone|name>"
   - `date`: (`timestamp`: Timestamp, `format`: Format, `link`: Optional link, `fallback`: fallback string) Date mentions "<!date^timestamp^format^link|fallback>"
  - `cssModuleNames`: `object`, name mapping of CSS classes to custom ones
  - `noExtraSpanTags`: `boolean` (default: `false`) Disable the addition of extra span tags on slack-specific parsing
  - `noExtraEmojiSpanTags`: `boolean` (default: `false`) Disable the addition of extra span tags around emojis
