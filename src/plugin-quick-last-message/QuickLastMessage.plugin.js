/**
 * @name QuickLastMessage
 * @author Bread
 * @authorId 304260051915374603
 * @description Quickly access your last message by pressing the down arrow
 * @version 1.0.7
 * @website https://github.com/xiBread/bd-contributions
 */

module.exports = () => ({
	active: true,
	start() {
		const webpack = BdApi.Webpack;
		const byProps = webpack.Filters.byProps;

		const { getMessages } = webpack.getModule(byProps("getMessage", "getMessages"));
		const { getCurrentUser } = webpack.getModule(byProps("getCurrentUser", "getUser"));

		const { getChannelId } = webpack.getModule(byProps("getLastSelectedChannelId"));
		const { ComponentDispatch } = webpack.getModule(byProps("ComponentDispatch"));

		document.addEventListener("keydown", (event) => {
			if (!this.active || event.ctrlKey || event.altKey) return;

			if (event.key === "ArrowDown") {
				const lastMsg = getMessages(getChannelId())
					.toArray()
					.filter((msg) => msg.content.trim() && msg.author.id === getCurrentUser().id)
					.pop();

				const [placeholder, textArea] = document.querySelectorAll(
					"div[class*='slateTextArea']"
				);

				if (!lastMsg || document.activeElement !== textArea || !placeholder) {
					return;
				}

				// FIXME
				ComponentDispatch.dispatchToLastSubscribed("INSERT_TEXT", {
					content: lastMsg.content.trim()
				});
			}
		});
	},

	stop() {
		this.active = false;
	},
});
