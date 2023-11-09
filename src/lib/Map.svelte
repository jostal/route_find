<script>
  import { Map, View } from "ol";
  import { useGeographic } from "ol/proj.js";
  import OSM from "ol/source/OSM.js";
  import Control from "ol/control/Control.js";
  import Feature from "ol/Feature.js";
  import Point from "ol/geom/Point.js";
  import LineString from "ol/geom/LineString.js"
  import { Icon, Stroke, Style } from "ol/style.js";
  import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer.js";
  import { Vector as VectorSource } from "ol/source.js"
  import { onMount } from "svelte";
  import { searchAddress, reqRoute, parseRoute, exportJson } from "./utils.js";

  useGeographic();

  let target;
  let view;
  let map;
  let position;
  let addressSearch;
  let featureLayer
  let featureLayerEnd
  let startFeature
  let endFeature
  let routeFeature

  let startSuggestions;
  let endSuggestions;
  let routeStart;
  let routeEnd;
  let routeLayer
  let routeRes

  const rasterLayer = new TileLayer({
    source: new OSM(),
  });

  let locSuccess = (position) => {
    position = position;
    let newCoord = [position.coords.longitude, position.coords.latitude];
    view.setCenter(newCoord);
  };

  let locErr = (err) => {
    console.error(err);
  };

  onMount(() => {
    const addressSearchControl = new Control({
      element: addressSearch,
    });

    navigator.geolocation.getCurrentPosition(locSuccess, locErr);
    view = new View({
      center: [-80.22646426076366, 43.53269058649391],
      zoom: 15,
    });
    map = new Map({
      layers: [rasterLayer],
      target: target,
      view: view,
      controls: [addressSearchControl],
    });
  });

  async function searchPoint(formEl) {
    let formData = new FormData(formEl);
    let startPoint = formData.get("startPoint");
    let endPoint = formData.get("endPoint");

    let addRes = await searchAddress(startPoint ? startPoint : endPoint);
    if (startPoint) {
      startSuggestions = addRes;
      endSuggestions = null;
    }

    if (endPoint) {
      endSuggestions = addRes;
      startSuggestions = null;
    }
  }

  function setStart(index) {
    routeStart = startSuggestions[index];
    startSuggestions = null

    map.removeLayer(featureLayer)
    startFeature = new Feature(new Point([parseFloat(routeStart.lon), parseFloat(routeStart.lat)]))
    featureLayer = new VectorLayer({
      className: "startLayer",
      source: new VectorSource({
        features: [startFeature]
      }),
      style: new Style({
        image: new Icon({
          src: 'startMarker.svg',
          scale: 0.2
        })
      })
    })
    map.addLayer(featureLayer)
  }

  function setEnd(index) {
    routeEnd = endSuggestions[index];
    endSuggestions = null;

    map.removeLayer(featureLayerEnd)
    endFeature = new Feature(new Point([parseFloat(routeEnd.lon), parseFloat(routeEnd.lat)]))
    featureLayerEnd = new VectorLayer({
      className: "endLayer",
      source: new VectorSource({
        features: [endFeature]
      }),
      style: new Style({
        image: new Icon({
          src: 'endMarker.svg',
          scale: 0.2
        })
      })
    })
    map.addLayer(featureLayerEnd)
  }

  async function findRoute() {
    routeRes = await reqRoute(routeStart.lon, routeStart.lat, routeEnd.lon, routeEnd.lat) 

    map.removeLayer(routeLayer)
    routeFeature = new Feature(new LineString(routeRes.routes[0].geometry.coordinates))
    routeLayer = new VectorLayer({
      source: new VectorSource({
        features: [routeFeature]
      }),
      style: new Style({
        stroke: new Stroke({
          color: '#3268ab',
          width: 4
        })
      })
    })
    map.addLayer(routeLayer)
  }
</script>

<section>
  <div id="map" class="map" bind:this={target} />
  <div id="addressSearch" bind:this={addressSearch}>
    <form
      on:submit|preventDefault={(e) => searchPoint(e.target)}
      id="startRoute"
      class="routeInput"
    >
      <label for="startPoint">Start</label>
      <input name="startPoint" list="startSug" />
    </form>

    <form
      on:submit|preventDefault={(e) => searchPoint(e.target)}
      id="endRoute"
      class="routeInput"
    >
      <label for="endPoint">End</label>
      <input name="endPoint" />
    </form>
    {#if routeStart && routeEnd}
      <button on:click={findRoute}>Find Route</button>
    {/if}
    {#if routeRes}
      <button><a href={exportJson(parseRoute(routeRes))} download="route.json">Download route.json</a></button>
    {/if}
  </div>

  {#if startSuggestions}
    <div class="pointSelect">
      {#each startSuggestions as sug, i}
        <div sug-id="i" class="suggestion" on:click={() => setStart(i)}>
          {sug.display_name}
        </div>
      {/each}
    </div>
  {/if}

  {#if endSuggestions}
    <div class="pointSelect">
      {#each endSuggestions as sug, i}
        <div sug-id="i" class="suggestion" on:click={() => setEnd(i)}>
          {sug.display_name}
        </div>
      {/each}
    </div>
  {/if}
</section>

<style>
  section {
    height: 100%;
    width: 100%;
  }

  #map {
    height: 100%;
    width: 100%;
  }

  #addressSearch {
    width: fit-content;
    padding: 5px;
    background: rgba(110, 105, 102, 0.7);
  }

  .routeInput {
    padding: 3px;
  }

  .routeInput > label {
    display: block;
  }

  input {
    padding: 5px;
  }

  .pointSelect {
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translate(-50%, 0);
    background: rgba(110, 105, 102, 0.7);
  }

  .suggestion {
    color: white;
    padding: 5px;
    border-top: 1px solid white;
    border-left: 1px solid white;
    border-right: 1px solid white;
    cursor: pointer;
  }

  .suggestion:last-child {
    border-bottom: 1px solid white;
  }
</style>
