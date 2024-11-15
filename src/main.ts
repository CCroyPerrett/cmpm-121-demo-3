//import {imageOverlay, map,  tileLayer, MapOptions, latLng} from "npm:@types/leaflet@^1.9.14";
// @deno-types="npm:@types/leaflet@^1.9.14"
import leaflet from "leaflet";

// Style sheets
import "leaflet/dist/leaflet.css";
import "./style.css";

// Fix missing marker images
import "./leafletWorkaround.ts";

// Deterministic random number generator
import luck from "./luck.ts";
//L.imageOverlay();

const mapdiv = document.createElement("div"); mapdiv.id = "map";
document.body.append(mapdiv);

let points:number[] = [36.98949379578401, -122.06277128548504];
const playerpos = leaflet.latLng(points[0], points[1]);

const gamemap = leaflet.map(document.getElementById("map")!,{
  zoom:19, center: playerpos,
  scrollWheelZoom: false, zoomControl:false}
);

leaflet
  .tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  })
  .addTo(gamemap);

const playerMarker = leaflet.marker(playerpos);
playerMarker.bindTooltip("There you are! Get to geocaching!");
playerMarker.addTo(gamemap);

function reloadmap(){
  gamemap.panTo(new leaflet.LatLng(points[0], points[1]))
  playerMarker.setLatLng(new leaflet.LatLng(points[0], points[1]));
}

const up = document.createElement("button"); 
up.innerHTML = "↑"; document.body.append(up);
up.addEventListener('click', (event) => {
  points[0] += 0.0001;
  reloadmap();
});

const down = document.createElement("button"); 
down.innerHTML = "↓"; document.body.append(down);
down.addEventListener('click', (event) => {
  points[0] -= 0.0001;
  reloadmap();
});

const left = document.createElement("button"); 
left.innerHTML = "←"; document.body.append(left);
left.addEventListener('click', (event) => {
  points[1] -= 0.0001;
  reloadmap();
});

const right = document.createElement("button"); 
right.innerHTML = "→"; document.body.append(right);
right.addEventListener('click', (event) => {
  points[1] += 0.0001;
  reloadmap();
});

const reset = document.createElement("button"); 
reset.innerHTML = "reset"; document.body.append(reset);
reset.addEventListener('click', (event) => {
  points[1] += 0.0001;
  points = [36.98949379578401, -122.06277128548504];
  reloadmap();
});

//const statusdiv = document.createElement("div"); mapdiv.id = "statusdiv";
//document.body.append(statusdiv);

//const status = document.createElement("h4"); mapdiv.id = "status";
//document.body.append(status);

// Display the player's points
let collectedpoints = 0;
const status = document.createElement("text"); 
status.innerHTML = "You have no points."; document.body.append(status);
//const statusPanel = document.querySelector<HTMLDivElement>("#statusdiv")!; // element `statusPanel` is defined in index.html
//status.innerHTML = "You have no points.";

let areasize = 8;
let tiledegrees = 1e-4;
let spawnchance = 0.1;

// Add caches to the map by cell numbers
function spawnCache(i: number, j: number) {
  const origin = leaflet.latLng(points[0], points[1]);
  const bounds = leaflet.latLngBounds([
    [origin.lat + i * tiledegrees, origin.lng + j * tiledegrees],
    [origin.lat + (i + 1) * tiledegrees, origin.lng + (j + 1) * tiledegrees],
  ]);


  const rect = leaflet.rectangle(bounds);
  rect.addTo(gamemap);

  // Handle interactions with the cache
  rect.bindPopup(() => {

    let pointValue = Math.floor(luck([i, j, "initialValue"].toString()) * 100);

    // The popup offers a description and button
    const popupDiv = document.createElement("div");
    popupDiv.innerHTML = `
                <div>There is a cache here at "${i},${j}". It has value <span id="value">${pointValue}</span>.</div>
                <button id="poke">poke</button><button id="deposit">deposit</button>`;

    // Clicking the button decrements the cache's value and increments the player's points
    popupDiv
      .querySelector<HTMLButtonElement>("#poke")!
      .addEventListener("click", () => {
        if(pointValue > 0){

          pointValue--;
          popupDiv.querySelector<HTMLSpanElement>("#value")!.innerHTML =
            pointValue.toString();
          collectedpoints++;
          status.innerHTML = `You have ${collectedpoints} points!`;
          }
      });

      popupDiv
      .querySelector<HTMLButtonElement>("#deposit")!
      .addEventListener("click", () => {
        if(collectedpoints > 0){

          pointValue++;
          popupDiv.querySelector<HTMLSpanElement>("#value")!.innerHTML =
            pointValue.toString();
          collectedpoints--;
          status.innerHTML = `You have ${collectedpoints} points!`;
          }
      });

    return popupDiv;
  });
}

for (let i = -areasize; i < areasize; i++) {
  for (let j = -areasize; j < areasize; j++) {
    if (luck([i, j].toString()) < spawnchance) {
      spawnCache(i, j);
    }
  }
}
