const { createProxyMiddleware } = require('http-proxy-middleware');
module.exports = function (app) {
    app.use(
        createProxyMiddleware(
            'http://localhost:8070/api/apps-metadata-server',
            {
                pathRewrite: { '^/api/apps-metadata-server/': '/' },
            }
        )
    );
    app.use(
        createProxyMiddleware('http://localhost:9000/api/gateway', {
            pathRewrite: { '^/api/gateway/': '/' },
        })
    );
};
