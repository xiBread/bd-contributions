/**
 * @name RedditMentions
 * @author Bread
 * @authorId 304260051915374603
 * @description Renders `r/` and `u/` mentions as hyperlinks as you would see on Reddit.
 * @version 1.0.5
 * @website https://github.com/xiBread/bd-contributions
 */

const SUB_OR_USER_RX = /(^|\s)(?:\/?r\/([a-zA-Z\d]\w{2,20})|\/?u\/([\w-]{3,20}))/g;

module.exports = () => ({
	start() {
		const webpack = BdApi.Webpack;
		const parser = webpack.getModule(webpack.Filters.byProps("parse", "parseTopic"));

		BdApi.Patcher.after("parseReddit", parser, "parse", (_0, _1, msg) => {
			return this.parseReddit(msg);
		});
	},

	stop() {
		BdApi.Patcher.unpatchAll("parseReddit");
	},

	parseReddit(msg) {
		const parsed = [];

		for (const element of msg) {
			if (typeof element !== "string") {
				if (["u", "em", "strong"].includes(element.type)) {
					element.props.children = this.parseReddit(element.props.children);
				}

				if (element.type.name === "StringPart") {
					element.props.parts = this.parseReddit(element.props.parts);
				}

				parsed.push(element);
				continue;
			}

			let idx = 0
			while ((myArray = SUB_OR_USER_RX.exec(element)) !== null) {
				if(myArray['index'] > idx) {
					parsed.push(element.substring(idx, myArray['index'])+myArray[1])
				}
				let match = myArray[0].trim()
				parsed.push(BdApi.React.createElement(
					"a",
					{
						title: match,
						href: `https://www.reddit.com/${match}`,
						rel: "noreferrer noopener",
						target: "_blank",
						role: "button",
						tabindex: 0,
					},
					match
				))
				idx = myArray['index']+myArray[0].length
			}
			if(idx == 0) {
				parsed.push(element);
			}
		}

		return parsed;
	},
});
