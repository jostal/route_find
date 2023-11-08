async function searchAddress(query) {
  const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&addressdetails=1`)
  return res.json()
}

export { searchAddress }
