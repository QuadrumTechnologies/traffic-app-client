export function SetItemToLocalStorage(key: string, payload: any) {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(payload))
  }
}

export function GetItemFromLocalStorage(key: string) {
  if (typeof window !== "undefined") {
    const item = localStorage.getItem(key)
    return item !== null ? JSON.parse(item) : null
  }
}

export function RemoveItemFromLocalStorage(key: string) {
  if (typeof window !== "undefined") {
    localStorage.removeItem(key)
  }
}
