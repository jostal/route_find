<script>
  import { Map, View } from "ol";
  import { useGeographic } from "ol/proj.js";
  import OSM from "ol/source/OSM.js";
  import TileLayer from "ol/layer/Tile.js";
  import Control from "ol/control/Control.js";
  import { onMount } from "svelte";
  import { searchAddress } from "./utils.js";

  useGeographic();

  let target;
  let view;
  let map;
  let position;
  let addressSearch;

  let startSuggestions;
  let endSuggestions;
  let routeStart;
  let routeEnd;

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
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
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
    console.log(addRes);
  }

  function setStart(index) {
    routeStart = startSuggestions[index];
    console.log(routeStart);
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
