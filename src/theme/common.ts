export type RefFactory = <T>(value: T) => { value: T }
export type Ref<T> = { value: T }
export const ref = <T>(value: T): Ref<T> => {
  return { value }
}
