/**
 * @name QuickLastMessage
 * @author Bread
 * @authorId 304260051915374603
 * @website https://github.com/xiBread/bd-contributions/tree/master/src/QuickLastMessage
 * @source https://raw.githubusercontent.com/xiBread/bd-contributions/master/src/QuickLastMessage/QuickLastMessage.plugin.js
 * @updateUrl https://raw.githubusercontent.com/xiBread/bd-contributions/master/src/QuickLastMessage/QuickLastMessage.plugin.js
 */

 module.exports = (() => {
	const config = {
		info: {
			name: "QuickLastMessage",
			authors: [{ name: "Bread", discord_id: "304260051915374603", github_username: "xiBread" }],
			version: "1.0.5",
			description: "Quickly access your last message by pressing the down arrow",
			github: "https://github.com/xiBread/bd-contributions/tree/master/src/QuickLastMessage",
			github_raw:
				"https://raw.githubusercontent.com/xiBread/bd-contributions/master/src/QuickLastMessage/QuickLastMessage.plugin.js",
		},
		changelog: [
			{
				title: "Works again",
				type: "fixed",
				items: [""]
			}
		],
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
					const { WebpackModules, DiscordModules } = Library;

					return class QuickLastMessage extends Plugin {
						constructor() {
							super();

							this.active = true;
						}

						onStart() {
							const { getMessages } = DiscordModules.MessageStore;
							const { getCurrentUser } = DiscordModules.UserStore;

							const { getChannelId } = WebpackModules.getByProps("getLastSelectedChannelId");
							const { ComponentDispatch } = WebpackModules.getByProps("ComponentDispatch");

							document.addEventListener("keydown", (event) => {
								if (!this.active || event.ctrlKey || event.altKey) return;

								if (event.key === "ArrowDown") {
									let message;

									getMessages(getChannelId())
										.toArray()
										.map((msg) => {
											if (msg.content.trim() && msg.author.id === getCurrentUser().id) {
												message = msg;
											}
										});

									const { textContent } =
										document.querySelector("div[class*='slateTextArea']").childNodes[0]
											.childNodes[0];
									const role = document.activeElement.getAttribute("role");

									if (!textContent.trim().length && message && role === "textbox") {
										ComponentDispatch.dispatchToLastSubscribed("INSERT_TEXT", {
											content: message.content.trim(),
										});
									}
								}
							});
						}

						onStop() {
							this.active = false;
						}
					};
				};
				return plugin(Plugin, Api);
		  })(global.ZeresPluginLibrary.buildPlugin(config));
})();
