function orderTitle(lines) {
  const parts = []
  for (const line of lines) {
    if (line.type === 'powerbank') {
      parts.push('PB' + line.qty)
      continue
    }
    const colors = (line.colors || []).map((c) => (c === 'Pembe' ? 'P' : 'G')).join('')
    parts.push(line.packQty + 'x' + colors)
  }
  return ('EforHug ' + parts.join(' ')).slice(0, 30)
}
