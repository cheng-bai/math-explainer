import { z } from 'zod';
const id = z.string().regex(/^[a-z][a-z0-9-]*$/);
const finite = z.number().finite();
export const blockSchema = z.discriminatedUnion('type', [
 z.object({ type:z.literal('text'), text:z.string().min(1) }).strict(),
 z.object({ type:z.literal('math'), tex:z.string().min(1), display:z.boolean().default(true) }).strict(),
 z.object({ type:z.literal('note'), title:z.string(), text:z.string().min(1) }).strict()
]);
const stepSchema = z.object({
 id, title:z.string().min(1), why:z.string().min(1), dependsOn:z.array(id),
 body:z.array(blockSchema).min(1), scenePatch:z.record(z.string(),finite), highlight:z.array(id)
}).strict();
export const lessonSchema = z.object({
 schemaVersion:z.literal(1), id, kind:z.enum(['concept','problem']), title:z.string().min(1),studentTitle:z.string().min(1),
 summary:z.string(), topic:z.string(), prerequisites:z.array(z.string()),
 source:z.object({ type:z.enum(['original','licensed']), label:z.string(), license:z.literal('MIT'), reference:z.string().optional() }).strict(),
 modelId:id, statement:z.array(blockSchema).min(1),
 paths:z.array(z.object({id,title:z.string(),steps:z.array(stepSchema).min(1)}).strict()).min(1),
 boundaries:z.array(blockSchema), review:z.object({status:z.enum(['draft','reviewed']),note:z.string()}).strict()
}).strict().superRefine((lesson,ctx)=>{
 const pathIds=new Set<string>();
 for(const path of lesson.paths){
  if(pathIds.has(path.id))ctx.addIssue({code:'custom',message:'重复的方法 id'});pathIds.add(path.id);
  const seen=new Set<string>();
  for(const step of path.steps){
   if(seen.has(step.id))ctx.addIssue({code:'custom',message:'重复的步骤 id'});
   for(const dependency of step.dependsOn)if(!seen.has(dependency))ctx.addIssue({code:'custom',message:'步骤依赖必须引用本路径中已声明的前置步骤，禁止环与悬空引用'});
   seen.add(step.id);
  }
 }
});
export type Block=z.infer<typeof blockSchema>;
export type Lesson=z.infer<typeof lessonSchema>;
export type Step=Lesson['paths'][number]['steps'][number];
export type State=Record<string,number>;
export type Vec2=readonly [number,number];
export type Graphic={id:string;label?:string;tone?:'main'|'aux'|'muted'} & (
 {type:'curve';points:Vec2[]} | {type:'segment';from:Vec2;to:Vec2} | {type:'point';at:Vec2}
);
export interface Scene {
 viewport:readonly [number,number,number,number];
 status:'valid'|'degenerate'|'empty';message:string;
 graphics:Graphic[];metrics:{label:string;value:string}[];
 invariants:{label:string;residual:number}[];
}
export interface Parameter {id:string;label:string;min:number;max:number;step:number;initial:number}
export interface MathModel {
 id:string;parameters:readonly Parameter[];objectIds:readonly string[];
 compute(state:Readonly<State>):Scene;
}
// A real data projection: no method, scene preset, hint, boundary, model or hidden answer payload.
export function studentDocument(lesson:Lesson){
 return {schemaVersion:1 as const,id:lesson.id,kind:lesson.kind,title:lesson.studentTitle,source:{...lesson.source},statement:lesson.statement.map(b=>({...b}))};
}
