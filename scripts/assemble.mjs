import {mkdirSync,copyFileSync} from 'node:fs';
mkdirSync('dist/legacy/conics',{recursive:true});
for(const name of ['conics-lab.html','ellipse-definitions.html','hyperbola-definitions.html','parabola-definitions.html'])copyFileSync('legacy/conics/'+name,'dist/legacy/conics/'+name);
console.log('Added all 24 legacy experiments to dist/legacy/conics/');
