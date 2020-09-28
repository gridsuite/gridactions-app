const { createProxyMiddleware } = require('http-proxy-middleware');
module.exports = function (app) {
    app.use(
        createProxyMiddleware('http://localhost:8080/api/actions-server', {
            pathRewrite: { '^/api/actions-server/': '/' },
        })
    );
    app.use(
        createProxyMiddleware('http://localhost:8080/ws/actions-server', {
            pathRewrite: { '^/ws/actions-server/': '/' },
            ws: true,
        })
    );
    app.use(
        createProxyMiddleware('http://localhost:9000/api/gateway', {
            pathRewrite: { '^/api/gateway/': '/' },
        })
    );
    app.use(
        createProxyMiddleware('http://localhost:9000/ws/gateway', {
            pathRewrite: { '^/ws/gateway/': '/' },
            ws: true,
        })
    );
};
