import type {MathModel,State} from './schema';
export function defaults(model:MathModel):State{return Object.fromEntries(model.parameters.map(p=>[p.id,p.initial]));}
export function normalizeState(model:MathModel,raw:State):State{
 const state=defaults(model);
 for(const p of model.parameters){const v=raw[p.id];if(Number.isFinite(v))state[p.id]=Math.max(p.min,Math.min(p.max,v));}
 return state;
}
export function updateState(model:MathModel,state:State,patch:State):State{return normalizeState(model,{...state,...patch});}
export function stateHash(lessonId:string,pathId:string,stepId:string,state:State):string{
 const hash=new URLSearchParams({v:'1',lesson:lessonId,path:pathId,step:stepId});
 for(const [key,value] of Object.entries(state))hash.set('p.'+key,String(value));
 return '#'+hash.toString();
}
export function parseHash(hash:string){
 const p=new URLSearchParams(hash.replace(/^#/,'')),state:State={};
 if(p.get('v')!=='1')return null;
 for(const [key,value] of p)if(key.startsWith('p.')&&value.trim()!==''&&Number.isFinite(Number(value)))state[key.slice(2)]=Number(value);
 return {lesson:p.get('lesson'),path:p.get('path'),step:p.get('step'),state};
}
export function requireFinite(state:Readonly<State>,keys:string[]){for(const key of keys)if(!Number.isFinite(state[key]))throw new RangeError('参数必须有限：'+key);}
