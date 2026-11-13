// Presentation order: which team is on stage, and how teams move without losing track of it.
// `current` is the index of the team on stage, or null before the first team.

// How many teams the on-screen tower shows at once.
export const ROWS = 9;

const none = (value) => value === null || value === undefined;

// The team that "Next team" puts on stage, or null after the last team.
export function nextIndex(current, count) {
  if (!count) return null;
  if (none(current)) return 0;
  return current < count - 1 ? current + 1 : null;
}

// The team that "Back" puts on stage: one place up, or nobody before the first team.
export function previousIndex(current) {
  return !none(current) && current > 0 ? current - 1 : null;
}

export function status(index, current) {
  if (none(current)) return index === 0 ? 'next' : 'waiting';
  if (index < current) return 'done';
  if (index === current) return 'now';
  return index === current + 1 ? 'next' : 'waiting';
}

// Arrows reorder the waiting teams (or the finished ones) among themselves.
// The team on stage stays put, and no team jumps over it by accident.
export function movable(index, current, count) {
  if (none(current)) return { up: index > 0, down: index < count - 1 };
  if (index === current) return { up: false, down: false };
  if (index > current) return { up: index - 1 > current, down: index < count - 1 };
  return { up: index > 0, down: index + 1 < current };
}

// Move one team from one place to another; the team on stage stays on stage.
export function moveTeam(teams, current, from, to) {
  const count = teams.length;
  if (from === to || from < 0 || to < 0 || from >= count || to >= count) return { teams, current };
  const list = [...teams];
  const [moved] = list.splice(from, 1);
  list.splice(to, 0, moved);
  let now = current;
  if (!none(current)) {
    if (current === from) now = to;
    else if (from < current && to >= current) now = current - 1;
    else if (from > current && to <= current) now = current + 1;
  }
  return { teams: list, current: now };
}

// Put one team on stage now. A later team is pulled forward to go next, so the
// teams it skipped are still waiting; a team that already presented goes again.
export function bringOnStage(teams, current, index) {
  if (index < 0 || index >= teams.length) return { teams, current };
  if (none(current)) {
    const moved = moveTeam(teams, null, index, 0);
    return { teams: moved.teams, current: 0 };
  }
  if (index === current) return { teams, current };
  if (index > current) {
    const moved = moveTeam(teams, current, index, current + 1);
    return { teams: moved.teams, current: current + 1 };
  }
  const moved = moveTeam(teams, current, index, current);
  return { teams: moved.teams, current };
}

// After the list is replaced, keep the team on stage if it is still in it.
export function keepOnStage(oldTeams, current, newTeams) {
  if (none(current)) return null;
  const index = newTeams.indexOf(oldTeams[current]);
  return index >= 0 ? index : null;
}

// Which rows the tower shows: two finished teams above the one on stage, then the teams to come.
export function towerWindow(count, current, rows = ROWS) {
  const start = none(current) ? 0 : Math.min(Math.max(0, current - 2), Math.max(0, count - rows));
  return { start, end: Math.min(count, start + rows) };
}

// A stable key per row, so a moved team slides to its new place even if two teams share a name.
export function rowKeys(teams) {
  const seen = new Map();
  return teams.map((team) => {
    const n = (seen.get(team) || 0) + 1;
    seen.set(team, n);
    return `${team}\u0000${n}`;
  });
}
