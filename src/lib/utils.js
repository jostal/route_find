async function searchAddress(query) {
  const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&addressdetails=1`)
  return res.json()
}

async function reqRoute(lonStart, latStart, lonEnd, latEnd) {
  const res = await fetch(`http://router.project-osrm.org/route/v1/cycling/${lonStart},${latStart};${lonEnd},${latEnd}?geometries=geojson&steps=true`)
  return res.json()
}

function parseRoute(routeData) {
  let route = routeData.routes[0]
  let routeGeo = route.geometry.coordinates
  let routeDistance = route.distance
  let routeSteps = route.legs[0].steps
  
  let output = {
    geo: routeGeo,
    distance: routeDistance,
    steps: routeSteps
  }

  return output
}

function exportJson(jsonObj) {
  return "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(jsonObj))
}

export { searchAddress, reqRoute, parseRoute, exportJson }
