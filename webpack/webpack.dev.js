const path = require('path'); 
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

module.exports = {
	mode: 'development',
	devtool: 'eval-source-map',
	devServer: {
		historyApiFallback: true,
		static: {
			directory: path.resolve(__dirname, '..', './dist'), 
			publicPath: '/',
		},
		
		port: 8080,
		open: true,
		hot: true,
	},
	plugins: [new ReactRefreshWebpackPlugin()],
};
