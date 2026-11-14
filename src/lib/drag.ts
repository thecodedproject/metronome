// Dragging a number up and down to change it. The number follows the finger: each so
// many pixels moved is one step, however fast or far the drag goes, and it turns back
// the moment the finger does, even after running into the end of its range.

export interface DragState {
  // the value as dragged so far, with the part of a step not yet made
  exact: number
  lastY: number
}

export function startDrag(value: number, y: number): DragState {
  return { exact: value, lastY: y }
}

// moveDrag follows the finger to `y`; moving up raises the value
export function moveDrag(
  state: DragState, y: number, pxPerStep: number, min: number, max: number,
): DragState {
  const exact = state.exact + (state.lastY - y) / pxPerStep
  // kept within a hair of the range, so turning back moves it straight away
  return { exact: Math.min(max + 0.49, Math.max(min - 0.49, exact)), lastY: y }
}

export function dragValue(state: DragState, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(state.exact)))
}
