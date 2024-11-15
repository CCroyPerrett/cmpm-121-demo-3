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

// todo
/*const alert_button = document.createElement("button");
document.body.append(alert_button);
alert_button.innerHTML = "alert";
alert_button.addEventListener("click", () => {
  alert("you clicked the button!");
});
*/
const mapdiv = document.createElement("div"); mapdiv.id = "map";
document.body.append(mapdiv);

let points:number[] = [36.98949379578401, -122.06277128548504];
const playerpos = leaflet.latLng(points[0], points[1]);
//const mapdata: MapOptions {
 // center: new L.LatLng(40.731253, -73.996139),
 // zoom: 12
//};
/*const map = leaflet.map(document.getElementById("map")!, {
  center: OAKES_CLASSROOM,
  zoom: GAMEPLAY_ZOOM_LEVEL,
  minZoom: GAMEPLAY_ZOOM_LEVEL,
  maxZoom: GAMEPLAY_ZOOM_LEVEL,
  zoomControl: false,
  scrollWheelZoom: false,
});*/

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

function reloadmap(){
  gamemap.panTo(new leaflet.LatLng(points[0], points[1]))
  playerMarker.setLatLng(new leaflet.LatLng(points[0], points[1]));
}

const playerMarker = leaflet.marker(playerpos);
playerMarker.bindTooltip("There you are! Get to geocaching!");
playerMarker.addTo(gamemap);

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