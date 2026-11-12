// Which slates show the countdown: Break always, Starting soon only while one is running.
export const showsSlateTime = (state) => state.scene === 'break' || (state.scene === 'starting' && Boolean(state.timer?.endAt));
