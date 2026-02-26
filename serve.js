const http = require('http');
const fs = require('fs');
const path = require('path');
const PORT = 8000;
const MIME = {'.html':'text/html','.js':'application/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.json':'application/json','.wav':'audio/wav','.mp3':'audio/mpeg'};
http.createServer((req, res) => {
  let fp = path.join(__dirname, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
  if (!fs.existsSync(fp)) { res.writeHead(404); res.end('404'); return; }
  let ext = path.extname(fp);
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
  fs.createReadStream(fp).pipe(res);
}).listen(PORT, () => console.log('Server: http://localhost:' + PORT));
