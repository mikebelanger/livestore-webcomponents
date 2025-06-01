export function parseTemplate(source: string) {
  const el = document.createElement('template')
  el.innerHTML = source

  return {
    source,
    cloneNode() {
      return el.content.cloneNode(true)
    },
  }
}
