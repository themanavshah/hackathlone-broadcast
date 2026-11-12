import { test } from 'node:test';
import assert from 'node:assert/strict';
import { showsSlateTime } from '../dist/slate-time.js';

test('the countdown shows on Break, and on Starting soon only while it runs',()=>{
  const running={endAt:Date.now()+60000}, stopped={endAt:null};
  assert.equal(showsSlateTime({scene:'break',timer:stopped}),true);
  assert.equal(showsSlateTime({scene:'break',timer:running}),true);
  assert.equal(showsSlateTime({scene:'starting',timer:stopped}),false);
  assert.equal(showsSlateTime({scene:'starting',timer:running}),true);
  assert.equal(showsSlateTime({scene:'ending',timer:running}),false);
  assert.equal(showsSlateTime({scene:'live',timer:running}),false);
});
