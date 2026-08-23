import { beforeEach, describe, expect, it } from 'vitest'
import {
  clearSearchHistory,
  pushSearchHistory,
  readSearchHistory,
  removeSearchHistory,
} from '../../../src/lib/searchHistory'

describe('searchHistory', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns an empty list when nothing is stored', () => {
    expect(readSearchHistory()).toEqual([])
  })

  it('pushes newest terms first and dedupes case-insensitively', () => {
    expect(pushSearchHistory('kundan')).toEqual(['kundan'])
    expect(pushSearchHistory('polki')).toEqual(['polki', 'kundan'])
    expect(pushSearchHistory('KUNDAN')).toEqual(['KUNDAN', 'polki'])
  })

  it('caps history at 8 entries', () => {
    for (let i = 1; i <= 10; i += 1) {
      pushSearchHistory(`term-${i}`)
    }
    expect(readSearchHistory()).toHaveLength(8)
    expect(readSearchHistory()[0]).toBe('term-10')
    expect(readSearchHistory()).not.toContain('term-1')
  })

  it('clears history', () => {
    pushSearchHistory('gold')
    clearSearchHistory()
    expect(readSearchHistory()).toEqual([])
  })

  it('removes a single history term case-insensitively', () => {
    pushSearchHistory('rings')
    pushSearchHistory('bangles')
    expect(removeSearchHistory('RINGS')).toEqual(['bangles'])
    expect(readSearchHistory()).toEqual(['bangles'])
  })
})
