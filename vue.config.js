// 转发机制
// paths webpack-dev-server
// var axios = require ('axios');
// var apiRoutes = express.Router();
// apiRoutes.get("/getDiscList", function(req, res) {
//   var url = "https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_by_tag.fcg";
//   axios.get(url, {
//     header: {
//       referer: 'https://c.y.qq.com/',
//       host: 'cy.qq.com'
//     },
//     params: req.query
//   }).then((response) => {
//     res.json(response.data)
//   }).catch((e) => {
//     console.log(e);
//   })
// });
// app.use('/api', apiRoutes)

// module.exports = {
//   devServer: {
//     proxy: {
//       "/api": {
//         target: "http://localhost:8080",
//         changeOrigin: true,
//         pathRewrite: {
//           "^/api": "/mock",
//         },
//       },
//     },
//   },
// };
