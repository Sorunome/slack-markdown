export const toHTML: (
  /** Raw markdown to parse */
  markdown: string,
  /** Configuration object */
  options?: SlackMarkdownOptions
) => string;

export interface SlackMarkdownOptions {
  /** if HTML should be escaped or not (default: true) */
  escapeHTML?: boolean,
  /** if only slack-specific markdown should be parsed (default: false) */
  slackOnly?: boolean,
  /** Object of the custom slack callbacks */
  slackCallbacks?: SlackCallbackOptions,
  /** name mapping of CSS classes to custom ones */
  cssModuleNames?: { [name: string]: string },
  /** Disable the addition of extra span tags on slack-specific parsing (default: false) */
  noExtraSpanTags?: boolean,
  /** Disable the addition of extra span tags around emojis (default: false) */
  noExtraEmojiSpanTags?: boolean
}

export interface SlackCallbackOptions {
  /** User mentions "<@ID|name>" */
  user?: (data: { id: string, name: string }) => string,
  /** Channel mentions "<#ID|name>" */
  channel?: (data: { id: string, name: string }) => string,
  /** User group mentions "<!subteam^ID|name>" */
  usergroup?: (data: { id: string, name: string }) => string,
  /** At here mentions "<!here|name>" */
  atHere?: (data: { name: string }) => string,
  /** At channel mentions "<!channel|name>" */
  atChannel?: (data: { name: string }) => string,
  /** At everyone mentions "<!everyone|name>" */
  atEveryone?: (data: { name: string }) => string,
  /** Date mentions "<!date^timestamp^format^link|fallback>" */
  date?: (data: { timestamp: string, format: string, link?: string, fallback: string }) => string
}
