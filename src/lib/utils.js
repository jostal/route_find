async function searchAddress(query) {
  const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&addressdetails=1`)
  return res.json()
}

async function reqRoute(lonStart, latStart, lonEnd, latEnd) {
  const res = await fetch(`http://router.project-osrm.org/route/v1/cycling/${lonStart},${latStart};${lonEnd},${latEnd}?geometries=geojson&steps=true&overview=full`)
  return res.json()
}

function parseRoute(routeData) {
  let route = routeData.routes[0]
  let routeGeo = route.geometry
  let routeDistance = route.distance
  let routeSteps = route.legs[0].steps

  let output = {
    geometry: routeGeo,
    steps: routeSteps
  }

  return output
}

function simRoute(routeData) {
  console.log(routeData)

  let output = {

  }

  return output
}

function exportJson(jsonObj) {
  return "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(jsonObj))
}

export { searchAddress, reqRoute, parseRoute, simRoute, exportJson }
