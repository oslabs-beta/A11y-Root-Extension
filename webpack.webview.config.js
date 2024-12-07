const path = require('path');
//const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  // change to index.tsx
  entry: './src/webview/index.tsx',
  //entry: './src/webview/main.ts', // Entry point for the webview
  // webview-dist / filename bundle.js
  output: {
    path: path.resolve(__dirname, 'dist/webview'),
    filename: 'bundle.js',
    // path: path.resolve(__dirname, 'dist'), // Output directory
    // filename: 'webview.bundle.js', // Output file
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'], // Resolve TypeScript and JavaScript files
  },
  watch: true,
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: 'babel-loader', // Use Babel for React and TypeScript
      },
      {
        test: /\.css$/, // Add this rule
        use: ['style-loader', 'css-loader'], // Process CSS files
      },
    ],

    // rules: [
    //   {
    //     test: /\.ts$/,
    //     use: 'ts-loader',
    //     exclude: /node_modules/,
    //   },
    //   {
    //     test: /\.css$/,
    //     use: ['style-loader', 'css-loader'], // Load CSS files
    //   },
    // ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/webview/index.html', // Updated path for React webview
    }),
    // new HtmlWebpackPlugin({
    //   template: './src/webview/index.html', // HTML template for the webview
    //   filename: 'index.html',
    // }),
  ],
  devServer: {
    static: {
      directory: path.resolve(__dirname, 'dist'), // Serve static files from dist
    },
    server: {
      type: 'http',
    },
    port: 3000, // Port for the dev server
    open: true, // Automatically open in the browser
    hot: true, // Enable Hot Module Replacement
  },
};

// the following has come up several times in https server/webpack setup
// might come in handy when we start working on dev and prod

// devServer: process.env.NODE_ENV === 'development' ? {
//   https: {
//     key: path.resolve(__dirname, 'certs/key.pem'),
//     cert: path.resolve(__dirname, 'certs/cert.pem'),
//   },
//   port: 3000,
// } : undefined,

// OLD WEBPACK SETUP, LETS KEEP FOR NOW UNTIL CURRENT WEBPACK PROVES WORTHY!

// const path = require('path');
// const HtmlWebpackPlugin = require('html-webpack-plugin');

// module.exports = {
//   mode: 'development',
//   entry: './src/webview/main.ts', // Entry point for the webview
//   output: {
//     path: path.resolve(__dirname, 'dist'), // Output directory
//     filename: 'webview.bundle.js', // Output file
//   },
//   resolve: {
//     extensions: ['.ts', '.js'],
//   },
//   module: {
//     rules: [
//       {
//         test: /\.ts$/,
//         use: 'ts-loader',
//         exclude: /node_modules/,
//       },
//       {
//         test: /\.css$/,
//         use: ['style-loader', 'css-loader'], // Load CSS
//       },
//     ],
//   },
//   plugins: [
//     new HtmlWebpackPlugin({
//       template: './src/webview/index.html', // Use your HTML file as a template
//       filename: 'index.html',
//     }),
//   ],
//   devServer: {
//     static: {
//       directory: path.resolve(__dirname, 'dist', 'webview'),
//     },
//     server: {
//       type: 'https', // Specify HTTPS
//       options: {
//         key: path.resolve(__dirname, 'certs/localhost-key.pem'), // Path to SSL private key
//         cert: path.resolve(__dirname, 'certs/localhost.pem'), // Path to SSL certificate
//       },
//     },

//     port: 3000,
//     open: true, // Automatically open in the browser
//   },
// };
