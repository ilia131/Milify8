import reducer, { pausePlayback, playNext, playPrev, removeFromQueue, setQueue, type Song } from "./playerSlice";

const track = (id: number) => ({ id, title: `Track ${id}`, unique_id: String(id) }) as Song;

test("next and previous retain the listening queue across route-independent state updates", () => {
  const queue = [track(1), track(2)];
  const listening = reducer(undefined, setQueue({ songs: queue, startIndex: 1 }));
  const next = reducer(listening, playNext());
  expect(next.queue).toEqual(queue);
  expect(next.currentIndex).toBe(0);
  expect(reducer(next, playPrev()).currentIndex).toBe(1);
});

test("queue edits preserve the selected track and the paused state", () => {
  const second = track(2);
  const listening = reducer(undefined, setQueue({ songs: [track(1), second], startIndex: 1 }));
  const paused = reducer(listening, pausePlayback());
  const edited = reducer(paused, removeFromQueue(0));
  expect(edited.queue[edited.currentIndex]).toEqual(second);
  expect(edited.isPlaying).toBe(false);
  expect(reducer(edited, removeFromQueue(0))).toMatchObject({ queue: [], isPlaying: false });
});
