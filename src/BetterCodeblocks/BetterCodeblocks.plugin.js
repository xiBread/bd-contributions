/**
 * @name BetterCodeblocks
 * @website https://github.com/xiBread/bd-contributions/tree/master/src/BetterCodeblocks
 * @source https://github.com/xiBread/bd-contributions/blob/master/src/BetterCodeblocks/BetterCodeblocks.plugin.js
 */

module.exports = (() => {
	const githubLink = "https://github.com/xiBread/bd-contributions/tree/master/src/BetterCodeblocks";

	const config = {
		main: "index.js",
		info: {
			name: "BetterCodeblocks",
			authors: [{ name: "Bread", discord_id: "304260051915374603", github_username: "xiBread" }],
			version: "2.0.0",
			description: "Enhances the look and feel of Discord's codeblocks",
			github: githubLink,
			github_raw: `${githubLink}/BetterCodeblocks.plugin.js`,
		},
		changelog: [
			{
				title: "Overhaul",
				type: "improved",
				items: ["Complete rewrite using shiki", "Some features still need to be reimplemented"],
			},
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
					const { Patcher, WebpackModules, DiscordModules, Settings } = Library;
					// const { SettingGroup, Textbox } = Settings;

					/**
					 * @type {{ React: import('react') }}
					 */
					const { React } = DiscordModules;

					const prefix = "btr-codeblock";

					class BetterCodeblocks extends Plugin {
						async onStart() {
							this.shiki = this.loadShiki();
							this.highlighter = await this.shiki.getHighlighter({ theme: "one-dark-pro" });

							const parser = WebpackModules.getByProps("parse", "parseTopic");

							this.unpatch = Patcher.after(parser.defaultRules.codeBlock, "react", (_, nodes, output) => {
								if (!this.getLang(nodes[0].lang)) {
									return output;
								}

								output.props.render = () => {
									const { lang, content } = nodes[0];

									return React.createElement(Codeblock, {
										lang,
										content,
										highlighter: this.highlighter,
										getLang: this.getLang.bind(this),
									});
								};

								return output;
							});
						}

						onStop() {
							this.unpatch();
						}

						loadShiki() {
							const scriptID = `${prefix}-shiki`;
							const [first] = document.getElementsByTagName("script");

							if (document.getElementById(scriptID)) {
								return window.shiki;
							}

							const script = document.createElement("script");
							script.id = scriptID;
							script.src = "https://unpkg.com/shiki";

							first.parentNode.insertBefore(script, first);
							return window.shiki;
						}

						getLang(id) {
							return this.shiki.BUNDLED_LANGUAGES.find((lang) =>
								[...(lang.aliases || []), lang.id].includes(id)
							);
						}
					}

					class Codeblock extends React.PureComponent {
						ref = React.createRef();
						state = {
							/** @type {any[] | null} */
							tokens: null,
						};

						componentDidMount() {
							this.lazilyHighlight();
						}

						componentDidUpdate(prevProps) {
							if (prevProps.content !== this.props.content || prevProps.lang !== this.props.lang) {
								this.lazilyHighlight();
							}
						}

						lazilyHighlight() {
							const { content, lang, highlighter } = this.props;
							if (!lang) return;

							this.observer = new IntersectionObserver((entries) => {
								for (const entry of entries) {
									if (entry.isIntersecting) {
										try {
											this.setState({ tokens: highlighter.codeToThemedTokens(content, lang) });
										} catch {}

										this.observer.disconnect();
									}
								}
							});

							this.observer.observe(this.ref.current);
						}

						componentWillUnmount() {
							this.observer?.disconnect();
						}

						render() {
							const { getLang, lang, content, highlighter } = this.props;

							const language = getLang(lang)?.id.toUpperCase();
							const theme = highlighter?.getTheme();

							const plain = theme?.fg || "var(--text-normal)";
							const backgroundColor =
								theme?.colors?.["editor.background"] || "var(--background-secondary)";

							let tokens = this.state.tokens;

							if (!tokens) {
								tokens = content.split("\n").map((line) => [{ color: plain, content: line }]);
							}

							const lines = tokens.map((line) => {
								if (line.length === 0) {
									return React.createElement("span", null, "\n");
								}

								return line.map(({ content, color, fontStyle }) =>
									React.createElement(
										"span",
										{
											style: {
												color,
												fontStyle: fontStyle & 1 && "italic",
												fontWeight: fontStyle & 2 && "bold",
												textDecoration: fontStyle & 4 && "underline",
											},
										},
										content
									)
								);
							});

							return React.createElement(
								"pre",
								{
									ref: this.ref,
									className: prefix,
									style: { backgroundColor, color: plain },
								},
								React.createElement(
									"code",
									{
										style: {
											display: "block",
											overflowX: "auto",
											padding: ".5em",
											position: "relative",
											fontSize: "0.875rem",
											lineHeight: "1.125rem",
											textIndent: 0,
											whiteSpace: "pre-wrap",
											background: "transparent",
											border: "none",
										},
									},
									language &&
										React.createElement(
											"div",
											{
												className: `${prefix}-language`,
												style: {
													color: "var(--text-normal)",
													borderBottom: "1px solid var(--background-modifier-accent)",
													padding: "0 5px",
													marginBottom: "6px",
													fontSize: ".8em",
													fontWeight: "bold",
													fontFamily: "sans-serif",
												},
											},
											language
										),
									React.createElement(
										"table",
										{ className: `${prefix}-table`, style: { borderCollapse: "collapse" } },
										...lines.map((line, i) =>
											React.createElement(
												"tr",
												{ style: { height: "18px", width: "100%" } },
												React.createElement(
													"td",
													{
														className: `${prefix}-ln-num`,
														style: {
															color: plain,
															borderRight: "1px solid var(--background-modifier-accent)",
															padding: "0 8px 0 5px",
															userSelect: "none",
														},
													},
													`${i + 1}`.padStart(`${lines.length + 1}`.length)
												),
												React.createElement(
													"td",
													{
														style: {
															paddingLeft: "8px",
															wordBreak: "break-all",
														},
													},
													line
												)
											)
										)
									),
									this.props.children
								)
							);
						}
					}

					return BetterCodeblocks;
				};

				return plugin(Plugin, Api);
		  })(global.ZeresPluginLibrary.buildPlugin(config));
})();
