import { dragValue, moveDrag, startDrag } from "./drag"

describe("dragging a number", () => {
  const px = 5

  it("moves a step for each so many pixels, up raising it", () => {
    let s = startDrag(120, 500)
    s = moveDrag(s, 475, px, 20, 300)
    expect(dragValue(s, 20, 300)).toBe(125)
    s = moveDrag(s, 525, px, 20, 300)
    expect(dragValue(s, 20, 300)).toBe(115)
  })

  it("goes by distance moved, not how it was moved", () => {
    let fast = moveDrag(startDrag(100, 0), -50, px, 20, 300)
    let slow = startDrag(100, 0)
    for (let y = -1; y >= -50; y--) {
      slow = moveDrag(slow, y, px, 20, 300)
    }
    expect(dragValue(fast, 20, 300)).toBe(110)
    expect(dragValue(slow, 20, 300)).toBe(110)
  })

  it("stops at the end of its range and turns back straight away", () => {
    let s = startDrag(298, 0)
    s = moveDrag(s, -500, px, 20, 300)
    expect(dragValue(s, 20, 300)).toBe(300)
    s = moveDrag(s, -495, px, 20, 300)
    expect(dragValue(s, 20, 300)).toBe(299)
  })
})
