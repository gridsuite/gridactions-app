const { createProxyMiddleware } = require('http-proxy-middleware');
module.exports = function (app) {
    app.use(
        createProxyMiddleware('http://localhost:5022/api/actions-server', {
            pathRewrite: { '^/api/actions-server/': '/' },
        })
    );
    app.use(
        createProxyMiddleware('http://localhost:9000/api/gateway', {
            pathRewrite: { '^/api/gateway/': '/' },
        })
    );
    app.use(
        createProxyMiddleware(
            'http://localhost:9000/ws/gateway/config-notification',
            {
                pathRewrite: { '^/ws/gateway/': '/' },
                ws: true,
            }
        )
    );
};
