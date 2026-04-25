import type { FocusLevelOption, FocusLevelValue } from '@/types/api'

export const focusLevelOptionToValueMap: Record<FocusLevelOption, FocusLevelValue> = {
  LOW: 1,
  MEDIUM: 3,
  HIGH: 5,
}

const focusLevelValueToOptionMap: Record<FocusLevelValue, FocusLevelOption> = {
  1: 'LOW',
  2: 'LOW',
  3: 'MEDIUM',
  4: 'HIGH',
  5: 'HIGH',
}

export function mapFocusLevelOptionToValue(
  focusLevel?: FocusLevelOption
): FocusLevelValue | undefined {
  return focusLevel ? focusLevelOptionToValueMap[focusLevel] : undefined
}

export function mapFocusLevelValueToOption(
  focusLevel?: FocusLevelValue | null
): FocusLevelOption | undefined {
  if (focusLevel == null) {
    return undefined
  }

  return focusLevelValueToOptionMap[focusLevel]
}
