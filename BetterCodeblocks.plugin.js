/**
 * @name BetterCodeblocks
 * @invite undefined
 * @authorLink undefined
 * @donate undefined
 * @patreon undefined
 * @website https://github.com/vBread/BetterCodeblocks
 * @source https://github.com/vBread/BetterCodeblocks/blob/master/BetterCodeblocks.plugin.js
 */
/*@cc_on
@if (@_jscript)
	
	// Offer to self-install for clueless users that try to run this directly.
	var shell = WScript.CreateObject("WScript.Shell");
	var fs = new ActiveXObject("Scripting.FileSystemObject");
	var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\BetterDiscord\plugins");
	var pathSelf = WScript.ScriptFullName;
	// Put the user at ease by addressing them in the first person
	shell.Popup("It looks like you've mistakenly tried to run me directly. \n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
	if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
		shell.Popup("I'm in the correct folder already.", 0, "I'm already installed", 0x40);
	} else if (!fs.FolderExists(pathPlugins)) {
		shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
	} else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
		fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
		// Show the user where to put plugins in the future
		shell.Exec("explorer " + pathPlugins);
		shell.Popup("I'm installed!", 0, "Successfully installed", 0x40);
	}
	WScript.Quit();

@else@*/

module.exports = (() => {
    const config = {"info":{"name":"BetterCodeblocks","authors":[{"name":"Bread","discord_id":"304260051915374603","github_username":"vBread"}],"version":"1.1.2","description":"Enhances the look and feel of Discord's codeblocks with customizable colors","github":"https://github.com/vBread/BetterCodeblocks","github_raw":"https://github.com/vBread/BetterCodeblocks/blob/master/BetterCodeblocks.plugin.js"},"changelog":[{"title":"Fix","type":"fixed","items":["Make the copy text visible on light theme"]}],"main":"index.js"};

    return !global.ZeresPluginLibrary ? class {
        constructor() {this._config = config;}
        getName() {return config.info.name;}
        getAuthor() {return config.info.authors.map(a => a.name).join(", ");}
        getDescription() {return config.info.description;}
        getVersion() {return config.info.version;}
        load() {
            BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`, {
                confirmText: "Download Now",
                cancelText: "Cancel",
                onConfirm: () => {
                    require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async (error, response, body) => {
                        if (error) return require("electron").shell.openExternal("https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js");
                        await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
                    });
                }
            });
        }
        start() {}
        stop() {}
    } : (([Plugin, Api]) => {
        const plugin = (Plugin, Library) => {
	const { Patcher, WebpackModules, DiscordModules, PluginUtilities, Settings } = Library;
	const { SettingPanel, SettingGroup, ColorPicker } = Settings
	const { React, hljs } = DiscordModules

	const colors = {
		purple: '#C678DD',
		beige: '#E6C07B',
		red: '#E06C75',
		gold: '#FFBA79',
		blue: '#61AEEE',
		gray: '#5C6370',
		mint: '#AFD485',
		smoke: '#BBBBBB'
	}

	return class BetterCodeblocks extends Plugin {
		constructor() {
			super()

			this.defaults = {
				// Main
				text: colors.smoke,
				background: '#282C34',

				// General
				keyword: colors.purple,
				built_in: colors.beige,
				type: colors.beige,
				literal: colors.gold,
				number: colors.gold,
				operator: colors.purple,
				punctuation: colors.smoke,
				regexp: colors.gold,
				string: colors.mint,
				subst: colors.red,
				symbol: colors.beige,
				class: colors.blue,
				function: colors.blue,
				variable: colors.red,
				title: colors.blue,
				params: colors.red,
				comment: colors.gray,
				doctag: colors.purple,

				// Meta
				meta: colors.blue,
				meta_keyword: colors.purple,
				meta_string: colors.mint,

				// Markdown
				bullet: colors.red,
				code: colors.smoke,
				emphasis: colors.blue,
				strong: colors.purple,
				link: colors.red,
				quote: colors.mint,

				// CSS
				selector_tag: colors.blue,
				selector_id: colors.blue,
				selector_class: colors.red,
				selector_attr: colors.blue,
				selector_pseudo: colors.beige,

				// Misc
				section: colors.red,
				tag: colors.red,
				name: colors.blue,
				attr: colors.beige,
				attribute: colors.red,
				addition: '#2ECC71',
				deletion: '#E74C3C'
			}

			this.hljs = PluginUtilities.loadSettings('BetterCodeblocks', this.defaults)
		}

		onStart() {
			const parser = WebpackModules.getByProps('parse', 'parseTopic')

			Patcher.after(parser.defaultRules.codeBlock, 'react', (_, args, res) => {
				this.inject(args, res)

				return res
			});

			PluginUtilities.addStyle('BetterCodeblocks', this.css)
		}

		onStop() {
			PluginUtilities.removeStyle('BetterCodeblocks')
			Patcher.unpatchAll();
		}

		getSettingsPanel() {
			return SettingPanel.build(() => {},
				new SettingGroup('Customization').append(
					new ColorPicker('Foreground', null, this.hljs.text, (color) => this.updateColor('text', color)),
					new ColorPicker('Background', null, this.hljs.background, (color) => this.updateColor('background', color)),

					new SettingGroup('General').append(
						...this.createColorPickers([
							['Keywords', 'Applies to keywords in a regular ALGOL-style language', 'keyword'],
							['Built-Ins', 'Applies to built-in objects and/or library objects', 'built_in'],
							['Types', 'Applies to syntactically significant types, excluding user-defined', 'type'],
							['Literals', 'Applies to special identifiers for built-in values', 'literal'],
							['Numbers', 'Applies to numbers, including units and modifiers (Not widely supported)', 'number'],
							['Operators', 'Applies to logical and mathematical operators', 'operator'],
							['Punctuation', 'Applies to auxillary punctuation (Not widely supported)', 'punctuation'],
							['Regular Expressions', 'Applies to literal regular expressions', 'regexp'],
							['Strings', 'Applies to literal strings/characters', 'string'],
							['String Interpolation', 'Applies to parsed sections inside a literal string', 'subst'],
							['Symbols', 'Applies to symbolic constants and interned strings', 'symbol'],
							['Classes', 'Applies to class-level declarations', 'class'],
							['Functions', 'Applies to function or method declarations', 'function'],
							['Variables', 'Applies to variables declarations', 'variable'],
							['Titles', 'Applies to other declarations', 'title'],
							['Parameters', 'Applies to function arguments at the place of declaration', 'params'],
							['Comments', 'Applies to line and block comments', 'comment'],
							['Documentation Tags', 'Applies to documentation markup within comments', 'doctag']
						])
					),

					new SettingGroup('Meta').append(
						...this.createColorPickers([
							['Meta', 'Applies to modifiers, annotations, preprocessor directives, etc.', 'meta'],
							['Meta Keywords', 'Applies to keywords or built-ins within meta constructs', 'meta_keyword'],
							['Meta Strings', 'Applies to strings within meta constructs', 'meta_string']
						]),
					),

					new SettingGroup('Markdown').append(
						...this.createColorPickers([
							['Bullets', 'Applies to bullet points in an unordered list', 'bullet'],
							['Code', 'Applies to code blocks', 'code'],
							['Italics', 'Applies to italicized text', 'emphasis'],
							['Bold', 'Applies to bold text', 'bold'],
							['Links', 'Applies to hyperlinks', 'link'],
							['Quotes', 'Applies to quotations or blockquotes', 'quote']
						])
					),

					new SettingGroup('CSS').append(
						...this.createColorPickers([
							['Tags', 'Applies to tag selectors', 'selector_tag'],
							['IDs (CSS)', 'Applies to ID selectors', 'selector_id'],
							['Classes (CSS)', 'Applies to class selectors', 'selector_class'],
							['Attributes', 'Applies to attribute selectors', 'selector_attr'],
							['Pseudos (CSS)', 'Applies to pseudo selectors', 'selector_pseudo']
						])
					),

					new SettingGroup('Misc').append(
						...this.createColorPickers([
							['Sections', 'Applies to headings of a section in a config file', 'section'],
							['Tags', 'Applies to XML and HTML tags', 'tag'],
							['Names', 'Applies to XML and HTML tag names and S-expressions', 'name'],
							['Unspecified Attributes', 'Applies to names of an attribute with no language defined semantics and sub-attribute within another highlighted object', 'attr'],
							['Attributes', 'Applies to names of an attribute followed by a structured value', 'attribute'],
							['Additions', 'Applies to diff additions', 'addition'],
							['Deletions', 'Applies to diff deletions', 'deletion']
						])
					)
				)
			)
		}

		createColorPickers(data) {
			const pickers = []

			for (const [title, desc, key] of data) {
				pickers.push(new ColorPicker(title, `${desc}. Default: ${this.defaults[key]}`, this.hljs[key], (color) => this.updateColor(key, color)))
			}

			return pickers
		}

		updateColor(key, color) {
			this.hljs[key] = color
			this.save()
		}

		save() {
			PluginUtilities.saveSettings('BetterCodeblocks', this.hljs)
			this.reload()
		}

		reload() {
			PluginUtilities.removeStyle('BetterCodeblocks')
			PluginUtilities.addStyle('BetterCodeblocks', this.css)
		}

		inject(args, res) {
			const render = res.props.render;

			res.props.render = (properties) => {
				const codeblock = render(properties);
				const { props } = codeblock.props.children;

				const classes = props.className.split(' ');
				const language = args ? args[0].lang : classes[classes.indexOf('hljs') + 1];

				const innerHTML = props.dangerouslySetInnerHTML
				let lines;

				if (innerHTML) {
					lines = innerHTML.__html.replace(/<span class="(hljs-[a-z]+)">([^<]*)<\/span>/g, (_, className, code) => code
						.split('\n')
						.map((line) => `<span class="${className}">${line}</span>`)
						.join('\n')
					).split('\n')
				} else {
					lines = props.children.split('\n')
				}

				delete props.dangerouslySetInnerHTML;
				props.children = this.render(language, lines);

				return codeblock;
			};
		}

		render(language, lines) {
			const { Messages } = WebpackModules.getByProps('Messages')

			if (hljs && typeof hljs.getLanguage === 'function') {
				language = hljs.getLanguage(language);
			}

			return React.createElement(React.Fragment, null,
				language && React.createElement('div', { className: 'bd-codeblock-language' }, language.name),

				React.createElement('table', { className: 'bd-codeblock-table' },
					...lines.map((line, i) => React.createElement('tr', null,
						React.createElement('td', null, i + 1),
						React.createElement('td',
							language ? {
								dangerouslySetInnerHTML: {
									__html: line
								}
							} : {
								children: line
							}
						)
					))
				),

				React.createElement('button', {
					className: 'bd-codeblock-copy-btn',
					onClick: this.clickHandler
				}, Messages.COPY)
			)
		}

		clickHandler({ target }) {
			const { Messages } = WebpackModules.getByProps('Messages')
			const { clipboard } = require('electron')

			if (target.classList.contains('copied')) {
				return void 0;
			}

			target.innerText = Messages.ACCOUNT_USERNAME_COPY_SUCCESS_1;
			target.classList.add('copied');

			setTimeout(() => {
				target.innerText = Messages.COPY;
				target.classList.remove('copied');
			}, 1e3);

			const code = [...target.parentElement.querySelectorAll('td:last-child')]
				.map((cell) => cell.textContent).join('\n');

			clipboard.writeText(code);
		}

		get css() {
			return `
				.hljs {
					background-color: ${this.hljs.background} !important;
					color: ${this.hljs.text};
					position: relative;
				}
				
				.hljs:not([class$='hljs']) {
					padding-top: 2px;
				}

				.bd-codeblock-language {
					color: var(--text-normal);
					border-bottom: 1px solid var(--background-modifier-accent);
					padding: 0 5px;
					margin-bottom: 6px;
					font-size: .8em;
					font-family: 'Raleway', sans-serif;
					font-weight: bold;
				}
				
				.bd-codeblock-table {
					border-collapse: collapse;
				}
				
				.bd-codeblock-table tr {
					height: 19px;
					width: 100%;
				}
				
				.bd-codeblock-table td:first-child {
					border-right: 1px solid var(--background-modifier-accent);
					padding-left: 5px;
					padding-right: 8px;
					user-select: none;
				}
				
				.bd-codeblock-table td:last-child {
					padding-left: 8px;
					word-break: break-all;
				}
				
				.bd-codeblock-copy-btn {
					color: var(--text-normal);
					border-radius: 4px;
					line-height: 20px;
					padding: 0 10px;
					font-family: 'Raleway', sans-serif;
					font-size: .8em;
					text-transform: uppercase;
					font-weight: bold;
					margin: 3px;
					background: var(--background-floating);
					position: absolute;
					right: 0 !important;
					bottom: 0 !important;
					opacity: 0;
					transition: .3s;
				}
				
				.bd-codeblock-copy-btn.copied {
					background-color: #43b581;
					opacity: 1;
				}
				
				.hljs:hover .bd-codeblock-copy-btn {
					opacity: 1;
				}

				${this.codeBlockStyle}				

				.codeLine-14BKbG > span > span {
					color: ${this.hljs.text};
				}

				${this.textBoxStyle}
			`
		}

		get codeBlockStyle() {
			return `
				.hljs > .bd-codeblock-table > tr > td > span > .hljs-tag {
					color: ${this.hljs.tag};
				}

				.hljs > .bd-codeblock-table > tr > td > span > .hljs-tag > .hljs-name {
					color: ${this.hljs.name};
				}

				.hljs > .bd-codeblock-table > tr > td > span > .hljs-tag > .hljs-attr {
					color: ${this.hljs.attr};
				}

				.hljs > .bd-codeblock-table > tr > td > .bash > .hljs-built_in {
					color: ${this.hljs.built_in};
				}

				.hljs > .bd-codeblock-table > tr > td > .bash > .hljs-variable {
					color: ${this.hljs.variable};
				}

				.hljs > .bd-codeblock-table > tr > td > .hljs-tag {
					color: ${this.hljs.tag} !important;
				}

				.hljs > .bd-codeblock-table > tr > td > .hljs-tag > .hljs-name {
					color: ${this.hljs.name};
				}

				.hljs > .bd-codeblock-table > tr > td > .hljs-tag > .hljs-attr {
					color: ${this.hljs.attr};
				}

				.hljs > .bd-codeblock-table > tr > td > .hljs-function > .hljs-params {
					color: ${this.hljs.params};
				}

				.hljs > .bd-codeblock-table > tr > td > .hljs-function > .hljs-type {
					color: ${this.hljs.type};
				}

				.hljs > .bd-codeblock-table > tr > td > .hljs-function > .hljs-params > .hljs-type {
					color: ${this.hljs.type};
				}

				.hljs > .bd-codeblock-table > tr > td > .hljs-operator {
					color: ${this.hljs.operator};
				}

				.hljs > .bd-codeblock-table > tr > td > .hljs-punctuation {
					color: ${this.hljs.punctuation};
				}

				.hljs > .bd-codeblock-table > tr > td > .hljs-name {
					color: ${this.hljs.name};
				}

				.hljs > .bd-codeblock-table > tr > td > .hljs-params {
					color: ${this.hljs.params};
				}

				.hljs > .bd-codeblock-table > tr > td > .hljs-title {
					color: ${this.hljs.title};
				}

				.hljs > .bd-codeblock-table > tr > td > .hljs-function > .hljs-params > .hljs-built_in {
					color: ${this.hljs.built_in};
				}

				.hljs > .bd-codeblock-table > tr > td > .hljs-selector-attr {
					color: ${this.hljs.selector_attr};
				}

				.hljs > .bd-codeblock-table > tr > td > .hljs-type {
					color: ${this.hljs.type};
				}

				.hljs > .bd-codeblock-table > tr > td > .hljs-selector-id {
					color: ${this.hljs.selector_id};
				}

				.hljs > .bd-codeblock-table > tr > td > .hljs-selector-pseudo {
					color: ${this.hljs.selector_pseudo};
				}

				.hljs > .bd-codeblock-table > tr > td > .hljs-bullet {
					color: ${this.hljs.bullet};
				}

				.hljs > .bd-codeblock-table > tr > td > .hljs-emphasis {
					color: ${this.hljs.emphasis}
				}

				.hljs > .bd-codeblock-table > tr > td > .hljs-link {
					color: ${this.hljs.link}
				}

				.hljs > .bd-codeblock-table > tr > td > .hljs-strong {
					color: ${this.hljs.strong}
				}

				.hljs > .bd-codeblock-table > tr > td > .hljs-addition {
					color: ${this.hljs.addition};
				}

				.hljs > .bd-codeblock-table > tr > td > .hljs-deletion {
					color: ${this.hljs.deletion};
				}

				.hljs > .bd-codeblock-table > tr > td > .hljs-regexp {
					color: ${this.hljs.regexp};
				}

				.hljs > .bd-codeblock-table > tr > td > .hljs-doctag {
					color: ${this.hljs.doctag};
				}

				.hljs > .bd-codeblock-table > tr > td > .hljs-built_in {
					color: ${this.hljs.built_in};
				}

				.hljs > .bd-codeblock-table > tr > td > .hljs-attr {
					color: ${this.hljs.attr};
				}

				.hljs > .bd-codeblock-table > tr > td .hljs-section {
					color: ${this.hljs.section};
				}

				.hljs > .bd-codeblock-table > tr > td .hljs-meta {
					color: ${this.hljs.meta};
				}
				
				.hljs > .bd-codeblock-table > tr > td .hljs-literal {
					color: ${this.hljs.literal};
				}

				.hljs > .bd-codeblock-table > tr > td > .hljs-function .hljs-title {
					color: ${this.hljs.function};
				}

				.hljs > .bd-codeblock-table > tr > td > .hljs-class .hljs-title {
					color: ${this.hljs.class};
				}

				.hljs > .bd-codeblock-table > tr > td .hljs-keyword {
					color: ${this.hljs.keyword};
				}

				.hljs > .bd-codeblock-table > tr > td .hljs-selector-tag {
					color: ${this.hljs.selector_tag};
				}
				
				.hljs > .bd-codeblock-table > tr > td .hljs-selector-class {
					color: ${this.hljs.selector_class};
				}

				.hljs > .bd-codeblock-table > tr > td .hljs-attribute {
					color: ${this.hljs.attribute};
				}

				.hljs > .bd-codeblock-table > tr > td .hljs-symbol {
					color: ${this.hljs.symbol};
				}

				.hljs > .bd-codeblock-table > tr > td .hljs-number {
					color: ${this.hljs.number};
				}

				.hljs > .bd-codeblock-table > tr > td .hljs-string {
					color: ${this.hljs.string};
				}

				.hljs > .bd-codeblock-table > tr > td .hljs-string > .hljs-subst > .hljs-built_in {
					color: ${this.hljs.built_in};
				}

				.hljs > .bd-codeblock-table > tr > td .hljs-subst {
					color: ${this.hljs.subst};
				}

				.hljs > .bd-codeblock-table > tr > td .hljs-code {
					color: ${this.hljs.code};
				}

				.hljs > .bd-codeblock-table > tr > td .hljs-comment {
					color: ${this.hljs.comment};
				}
				
				.hljs > .bd-codeblock-table > tr > td .hljs-quote {
					color: ${this.hljs.quote};
				}

				.hljs > .bd-codeblock-table > tr > td .hljs-variable {
					color: ${this.hljs.variable};
				}

				.hljs > .bd-codeblock-table > tr > td .hljs-meta-string {
					color: ${this.hljs.meta_string};
				}
			`
		}

		get textBoxStyle() {
			return this.codeBlockStyle.replace(/\.hljs[\w ->]+td/gm, '.codeLine-14BKbG > span > span')
		}
	};
};
        return plugin(Plugin, Api);
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/