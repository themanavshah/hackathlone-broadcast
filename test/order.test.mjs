import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nextIndex, previousIndex, status, movable, moveTeam, bringOnStage, keepOnStage, towerWindow, rowKeys, ROWS } from '../dist/order.js';

const teams = ['A', 'B', 'C', 'D', 'E'];

test('Next starts with the first team and stops after the last one', () => {
  assert.equal(nextIndex(null, 5), 0);
  assert.equal(nextIndex(0, 5), 1);
  assert.equal(nextIndex(3, 5), 4);
  assert.equal(nextIndex(4, 5), null);
  assert.equal(nextIndex(null, 0), null);
});

test('Back steps one team back, and from the first team to nobody', () => {
  assert.equal(previousIndex(3), 2);
  assert.equal(previousIndex(0), null);
  assert.equal(previousIndex(null), null);
});

test('every team is done, on stage, next or waiting', () => {
  assert.deepEqual(teams.map((_, i) => status(i, null)), ['next', 'waiting', 'waiting', 'waiting', 'waiting']);
  assert.deepEqual(teams.map((_, i) => status(i, 2)), ['done', 'done', 'now', 'next', 'waiting']);
  assert.deepEqual(teams.map((_, i) => status(i, 4)), ['done', 'done', 'done', 'done', 'now']);
});

test('arrows only move teams within the waiting or the done group', () => {
  // Nobody on stage yet: every team is waiting.
  assert.deepEqual(movable(0, null, 5), { up: false, down: true });
  assert.deepEqual(movable(4, null, 5), { up: true, down: false });
  // C is on stage: it cannot move, and nobody can jump over it.
  assert.deepEqual(movable(2, 2, 5), { up: false, down: false });
  assert.deepEqual(movable(3, 2, 5), { up: false, down: true });
  assert.deepEqual(movable(4, 2, 5), { up: true, down: false });
  assert.deepEqual(movable(1, 2, 5), { up: true, down: false });
  assert.deepEqual(movable(0, 2, 5), { up: false, down: true });
});

test('moving a team keeps the same team on stage', () => {
  assert.deepEqual(moveTeam(teams, 1, 3, 2), { teams: ['A', 'B', 'D', 'C', 'E'], current: 1 });
  assert.deepEqual(moveTeam(teams, 1, 0, 2), { teams: ['B', 'C', 'A', 'D', 'E'], current: 0 });
  assert.deepEqual(moveTeam(teams, 1, 4, 0), { teams: ['E', 'A', 'B', 'C', 'D'], current: 2 });
  assert.deepEqual(moveTeam(teams, 1, 1, 3), { teams: ['A', 'C', 'D', 'B', 'E'], current: 3 });
  assert.deepEqual(moveTeam(teams, null, 0, 1), { teams: ['B', 'A', 'C', 'D', 'E'], current: null });
  assert.deepEqual(moveTeam(teams, 1, 0, 9), { teams, current: 1 });
});

test('bringing a later team on stage pulls it forward without skipping anyone', () => {
  assert.deepEqual(bringOnStage(teams, null, 3), { teams: ['D', 'A', 'B', 'C', 'E'], current: 0 });
  assert.deepEqual(bringOnStage(teams, 1, 3), { teams: ['A', 'B', 'D', 'C', 'E'], current: 2 });
  assert.deepEqual(bringOnStage(teams, 1, 2), { teams, current: 2 });
  assert.deepEqual(bringOnStage(teams, 1, 1), { teams, current: 1 });
  // A team that already presented goes on again after the team on stage.
  assert.deepEqual(bringOnStage(teams, 3, 0), { teams: ['B', 'C', 'D', 'A', 'E'], current: 3 });
});

test('a new list keeps the team on stage when it is still there', () => {
  assert.equal(keepOnStage(teams, 1, ['E', 'B', 'A']), 1);
  assert.equal(keepOnStage(teams, 1, ['A', 'C']), null);
  assert.equal(keepOnStage(teams, null, teams), null);
});

test('the tower shows two finished teams above the one on stage', () => {
  assert.equal(ROWS, 9);
  assert.deepEqual(towerWindow(20, null), { start: 0, end: 9 });
  assert.deepEqual(towerWindow(20, 1), { start: 0, end: 9 });
  assert.deepEqual(towerWindow(20, 5), { start: 3, end: 12 });
  assert.deepEqual(towerWindow(20, 19), { start: 11, end: 20 });
  assert.deepEqual(towerWindow(5, 4), { start: 0, end: 5 });
});

test('rows keep their identity even when two teams share a name', () => {
  const keys = rowKeys(['A', 'B', 'A']);
  assert.equal(new Set(keys).size, 3);
  assert.deepEqual(rowKeys(['A', 'B', 'A']), keys);
});
