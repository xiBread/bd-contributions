/**
 * @name RedditMentions
 * @website https://github.com/xiBread/bd-contributions/tree/master/src/RedditMentions
 * @source https://github.com/xiBread/bd-contributions/blob/master/src/RedditMentions/RedditMentions.plugin.js
 */

module.exports = (() => {
	const config = {
		main: "index.js",
		info: {
			name: "RedditMentions",
			authors: [{ name: "Bread", discord_id: "304260051915374603", github_username: "vBread" }],
			version: "1.0.1",
			description: "Renders subreddit and user mentions as hyperlinks",
			github: "https://github.com/xiBread/bd-contributions/tree/master/src/RedditMentions",
			github_raw:
				"https://github.com/xiBread/bd-contributions/blob/master/src/RedditMentions/RedditMentions.plugin.js",
		},
		changelog: [],
	};

	return !global.ZeresPluginLibrary
		? class {
				constructor() {
					this._config = config;
				}
				getName() {
					return config.info.name;
				}
				getAuthor() {
					return config.info.authors.map((a) => a.name).join(", ");
				}
				getDescription() {
					return config.info.description;
				}
				getVersion() {
					return config.info.version;
				}
				load() {
					BdApi.showConfirmationModal(
						"Library Missing",
						`The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`,
						{
							confirmText: "Download Now",
							cancelText: "Cancel",
							onConfirm: () => {
								require("request").get(
									"https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js",
									async (error, response, body) => {
										if (error)
											return require("electron").shell.openExternal(
												"https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js"
											);
										await new Promise((r) =>
											require("fs").writeFile(
												require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"),
												body,
												r
											)
										);
									}
								);
							},
						}
					);
				}
				start() {}
				stop() {}
		  }
		: (([Plugin, Api]) => {
				const plugin = (Plugin, Library) => {
					const { Patcher, WebpackModules, DiscordModules } = Library;
					const { React } = DiscordModules;

					const regex = /(?<!\w)\/?[ur]\/[\w\d-]{2,21}/g;

					return class RedditMentions extends Plugin {
						onStart() {
							const parser = WebpackModules.getByProps("parse", "parseTopic");

							Patcher.after(parser, "parse", (_, args, res) => this.inject(args, res));
						}

						onStop() {
							Patcher.unpatchAll();
						}

						inject(args, res) {
							const rendered = [];

							for (const el of res) {
								if (typeof el !== "string") {
									if (["u", "em", "strong"].includes(el.type)) {
										el.props.children = this.inject({}, el.props.children);
									}

									if (el.type.name === "StringPart") {
										el.props.parts = this.inject({}, el.props.parts);
									}

									rendered.push(el);
									continue;
								}

								if (!regex.test(el)) {
									rendered.push(el);
									continue;
								}

								const mentions = el.split(/(\/?[ur]\/[\w\d-]{2,21})/);

								for (const mention of mentions) {
									if (!regex.test(mention)) {
										rendered.push(mention);
										continue;
									}

									const entity = mention.match(/\/?([ur]\/[\w\d-]{2,21})/)[1];

									rendered.push(
										React.createElement(
											"a",
											{
												title: entity,
												rel: "noreferrer noopener",
												href: `https://reddit.com/${entity}`,
												role: "button",
												target: "_blank",
											},
											mention
										)
									);
								}
							}

							return rendered;
						}
					};
				};
				return plugin(Plugin, Api);
		  })(global.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/
