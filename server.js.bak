const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const httpProxy = require('http-proxy');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const proxy = httpProxy.createProxyServer({
  ws: true,
  target: 'http://localhost:8000',
});

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    const { pathname } = parsedUrl;

    if (pathname.startsWith('/api')) {
      proxy.web(req, res, { target: 'http://localhost:8000' });
    } else {
      handle(req, res, parsedUrl);
    }
  }).listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
  }).on('upgrade', (req, socket, head) => {
    if (req.url.startsWith('/ws')) {
      proxy.ws(req, socket, head);
    }
  });
});
