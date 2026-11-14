import { beatSound } from "./beats"

describe("beatSound", () => {
  const bar = (pattern: "every" | "odd" | "even", accent: boolean, beats = 4) =>
    Array.from({ length: beats }, (_, beat) => beatSound(beat, pattern, accent))

  it("clicks on every beat the same", () => {
    expect(bar("every", false)).toEqual(["click", "click", "click", "click"])
  })

  it("clicks on 1 and 3", () => {
    expect(bar("odd", false)).toEqual(["click", "silent", "click", "silent"])
  })

  it("clicks on 2 and 4", () => {
    expect(bar("even", false)).toEqual(["silent", "click", "silent", "click"])
  })

  it("accents the first beat when it sounds", () => {
    expect(bar("every", true)).toEqual(["accent", "click", "click", "click"])
    expect(bar("odd", true)).toEqual(["accent", "silent", "click", "silent"])
    expect(bar("even", true)).toEqual(["silent", "click", "silent", "click"])
  })

  it("carries the odd and even beats on through other bar lengths", () => {
    expect(bar("odd", false, 3)).toEqual(["click", "silent", "click"])
    expect(bar("even", false, 5)).toEqual(["silent", "click", "silent", "click", "silent"])
  })
})
