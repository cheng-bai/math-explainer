import type {Scene,State} from './core/schema';
declare global {interface Window {mathExplainer:{lessonId:string;pathId:string;stepId:string;state:State;scene:Scene}}}
