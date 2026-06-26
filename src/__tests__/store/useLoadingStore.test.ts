import { describe, it, expect, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { useLoadingStore } from '@/store/useLoadingStore'

beforeEach(() => {
  useLoadingStore.setState({ count: 0, isLoading: false })
})

describe('useLoadingStore', () => {
  it('starts with count 0 and isLoading false', () => {
    expect(useLoadingStore.getState().count).toBe(0)
    expect(useLoadingStore.getState().isLoading).toBe(false)
  })

  it('increment increases count and sets isLoading true', () => {
    act(() => useLoadingStore.getState().increment())
    expect(useLoadingStore.getState().count).toBe(1)
    expect(useLoadingStore.getState().isLoading).toBe(true)
  })

  it('decrement decreases count', () => {
    act(() => {
      useLoadingStore.getState().increment()
      useLoadingStore.getState().increment()
      useLoadingStore.getState().decrement()
    })
    expect(useLoadingStore.getState().count).toBe(1)
  })

  it('decrement clamps to 0, never goes negative', () => {
    act(() => useLoadingStore.getState().decrement())
    expect(useLoadingStore.getState().count).toBe(0)
    expect(useLoadingStore.getState().isLoading).toBe(false)
  })

  it('isLoading is false when count reaches 0 after concurrent requests', () => {
    act(() => {
      useLoadingStore.getState().increment()
      useLoadingStore.getState().increment()
      useLoadingStore.getState().decrement()
      useLoadingStore.getState().decrement()
    })
    expect(useLoadingStore.getState().isLoading).toBe(false)
  })
})
