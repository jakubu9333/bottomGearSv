
export function createPersistentStore<T>(key: string, startValue: T) {
  let storedValue = null
  if (typeof window !== "undefined") {
    storedValue = window.localStorage.getItem(key);
  }

  let store = $state(storedValue ? JSON.parse(storedValue) as T : startValue);

  $effect(() => {
    window.localStorage.setItem(key, JSON.stringify(store))
  })

  return {
    get value() { return store },
    set value(value: T) { store = value }
  };
}
