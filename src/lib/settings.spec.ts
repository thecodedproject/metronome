import { DEFAULT_SETTINGS, parseBpm, parseSettings } from "./settings"

describe("parseSettings", () => {
  it("takes the defaults when nothing was saved", () => {
    expect(parseSettings(null)).toEqual(DEFAULT_SETTINGS)
    expect(parseSettings("not json")).toEqual(DEFAULT_SETTINGS)
    expect(parseSettings("null")).toEqual(DEFAULT_SETTINGS)
  })

  it("reads back what was saved", () => {
    const saved = { bpm: 90, beatsPerBar: 3, beatUnit: 8, pattern: "even", accent: true }
    expect(parseSettings(JSON.stringify(saved))).toEqual(saved)
  })

  it("keeps the good parts of a damaged save", () => {
    const saved = { bpm: 9999, beatsPerBar: "x", beatUnit: 5, pattern: "nope", accent: true }
    expect(parseSettings(JSON.stringify(saved))).toEqual({
      ...DEFAULT_SETTINGS, bpm: 300, accent: true,
    })
  })
})

describe("parseBpm", () => {
  it("reads whole tempos within range", () => {
    expect(parseBpm(" 96 ")).toBe(96)
    expect(parseBpm("96.6")).toBe(97)
    expect(parseBpm("5")).toBe(20)
    expect(parseBpm("")).toBeUndefined()
    expect(parseBpm("abc")).toBeUndefined()
  })
})
