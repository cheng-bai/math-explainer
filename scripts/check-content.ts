import {catalog} from '../src/content/catalog';
import {validateLessonBindings,models} from '../src/math/models';
import {defaults,updateState} from '../src/core/state';
import {renderBlocks} from '../src/renderers/text';
import assert from 'node:assert/strict';
for(const lesson of catalog){
 assert.equal(validateLessonBindings(lesson).length,0,lesson.id);
 for(const blocks of [lesson.statement,lesson.boundaries,...lesson.paths.flatMap(p=>p.steps.map(s=>s.body))])renderBlocks(blocks);
 const model=models[lesson.modelId];
 for(const path of lesson.paths)for(const step of path.steps){
  const scene=model.compute(updateState(model,defaults(model),step.scenePatch));
  for(const invariant of scene.invariants)assert.ok(Math.abs(invariant.residual)<1e-9,invariant.label);
 }
}
console.log('Validated content, all formulas, model bindings and step preset invariants:',catalog.length,'lessons');
