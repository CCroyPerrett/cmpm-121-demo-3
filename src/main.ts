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