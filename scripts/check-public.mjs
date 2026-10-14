import {readdirSync,readFileSync,statSync} from 'node:fs';
const ignored=new Set(['.git','node_modules','dist','artifacts','test-results','playwright-report']);
const prohibited=[/\/Users\/[A-Za-z0-9_-]+\//,/\bgh[pousr]_[A-Za-z0-9]{20,}/,/sk-[A-Za-z0-9_-]{24,}/,/-----BEGIN (?:RSA |OPENSSH )?PRIVATE KEY-----/,/\b(?:CAC|AAC)-[A-Za-z0-9_-]{16,}/,/X-Amz-(?:Signature|Security-Token)=[^&\s"<>]{16,}/i];
let count=0;
function walk(dir){for(const name of readdirSync(dir)){if(ignored.has(name))continue;const path=dir+'/'+name;if(statSync(path).isDirectory()){walk(path);continue;}
 if(name.startsWith('.env')&&name!=='.env.example')throw new Error('私有环境文件：'+path);
 const text=readFileSync(path,'utf8');for(const re of prohibited)if(re.test(text))throw new Error('可能含本机路径或凭据：'+path);count++;
}}
walk('.');console.log('Public-source scan passed:',count,'files; this targeted scan complements explicit file review, not a guarantee about all sensitive text.');
