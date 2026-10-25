// Optional localhost preview; the app also opens directly from index.html.
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=__dirname;
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.ttf':'font/ttf','.mp3':'audio/mpeg','.json':'application/json'};
http.createServer((req,res)=>{
  let p;try{p=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(p===root)p=path.join(root,'index.html')}catch(_){res.writeHead(400);res.end();return}
  if(!p.startsWith(root+path.sep)){res.writeHead(403);res.end();return}
  fs.readFile(p,(err,body)=>{if(err){res.writeHead(404);res.end('Not found');return}res.writeHead(200,{'Content-Type':mime[path.extname(p)]||'application/octet-stream','Cache-Control':'no-store'});res.end(body)});
}).listen(4175,'127.0.0.1',()=>console.log('SAATH preview: http://127.0.0.1:4175'));
