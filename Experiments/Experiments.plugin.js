/**
 * @name Experiments
 * @author Bread
 * @description Enables the Experiments and related tabs in the settings menu.
 * @version 1.0.0
 * @authorId 304260051915374603
 * @website https://github.com/xiBread/bd-contributions
 */

module.exports = () => ({
	start() {
		let $require;
		window.webpackChunkdiscord_app.push([[Math.random()], {}, (req) => void ($require = req)]);

		const modules = Object.values($require.c);

		const users = modules.find((mod) => mod?.exports?.default?.getUsers);
		const isDev = modules.find(
			(mod) => typeof mod?.exports?.default?.isDeveloper !== "undefined"
		);

		const type = "CONNECTION_OPEN";
		const nodes = Object.values(
			isDev.exports.default._dispatcher._actionHandlers._dependencyGraph.nodes
		);

		try {
			nodes
				.find((node) => node.name == "ExperimentStore")
				.actionHandler[type]({
					user: {
						flags: 1,
					},
					type,
				});
		} catch {}

		const $getCurrentUser = users.exports.default.getCurrentUser;
		users.exports.default.getCurrentUser = () => ({ hasFlag: () => true });

		nodes.find((node) => node.name == "DeveloperExperimentStore").actionHandler[type]();
		users.exports.default.getCurrentUser = $getCurrentUser;
	},

	stop() {},
});
