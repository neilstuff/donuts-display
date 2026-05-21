const path = require('path');

module.exports = {
  mode: 'production',
  entry: {
    main: "./assets/javascripts/index.js",
  },
  output: {
    path: __dirname,
    hashFunction: 'sha256',
    filename: "[name].bundle.js"
  },
  resolve: {
    modules: [
      'node_modules',
      path.resolve(__dirname, 'node_modules')
    ],
    extensions: ['.js', '.json']
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        // css-loader runs first, then style-loader
        use: ["style-loader", "css-loader"],
      },
    ],
  }
};
