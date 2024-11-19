//import {imageOverlay, map,  tileLayer, MapOptions, latLng} from "npm:@types/leaflet@^1.9.14";
// @deno-types="npm:@types/leaflet@^1.9.14"
import leaflet, { LatLng } from "leaflet";

// Style sheets
import "leaflet/dist/leaflet.css";
import "./style.css";

// Fix missing marker images
import "./leafletWorkaround.ts";

// Deterministic random number generator
import luck from "./luck.ts";
//L.imageOverlay();

interface Coin {
  i: number
  j: number
  serial: number
}

interface Cache {
  i: number
  j: number
  coins: Coin[]
}

let Classroom = {i: 369894, j: -1220627};
let printRecord:Coin[] = [];
let playersCoins:Coin[] = [];
let cacheCoins:Cache[] = [];

//loads keys from memory
const pcoins = localStorage.getItem("playerscoins");
if(pcoins != null){
  playersCoins = JSON.parse(pcoins);
}
localStorage.setItem("playerscoins", JSON.stringify(playersCoins));

const ccoins = localStorage.getItem("cachecoins");
if(ccoins != null){
  cacheCoins = JSON.parse(ccoins);
}
localStorage.setItem("cachecoins", JSON.stringify(cacheCoins));

function PrintCoin(i_: number, j_: number){
  const newCoin:Coin = {
    i: i_,
    j: j_,
    serial: 0
  }

  let no_match = true;
  for(let k = 0; k < printRecord.length; k++){
    if(printRecord[k].j == j_ && printRecord[k].i == i_){
      newCoin.serial = printRecord[k].serial;
      printRecord[k].serial++;
      no_match = false;
      break;
    }
  }
  if(no_match){
    const recordCoin:Coin = {
      i: i_,
      j: j_,
      serial: 1
    }
    printRecord.push(recordCoin);
  }

  return newCoin;
}

const mapdiv = document.createElement("div"); mapdiv.id = "map";
document.body.append(mapdiv);

let points:number[] = [36.98949379578401, -122.06277128548504];
const playerpos = leaflet.latLng(points[0], points[1]);

const gamemap = leaflet.map(document.getElementById("map")!,{
  zoom:19, center: playerpos,
  scrollWheelZoom: false, zoomControl:false}
);
gamemap.dragging.disable();

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
  updatePolyline(points[0], points[1]);
  reloadmap();
});

const down = document.createElement("button"); 
down.innerHTML = "↓"; document.body.append(down);
down.addEventListener('click', (event) => {
  points[0] -= 0.0001;
  updatePolyline(points[0], points[1]);
  reloadmap();
});

const left = document.createElement("button"); 
left.innerHTML = "←"; document.body.append(left);
left.addEventListener('click', (event) => {
  points[1] -= 0.0001;
  updatePolyline(points[0], points[1]);
  reloadmap();
});

const right = document.createElement("button"); 
right.innerHTML = "→"; document.body.append(right);
right.addEventListener('click', (event) => {
  points[1] += 0.0001;
  updatePolyline(points[0], points[1]);
  reloadmap();
});


const reset = document.createElement("button"); 
reset.innerHTML = "return to start"; document.body.append(reset);
reset.addEventListener('click', (event) => {
  let sign = prompt("are you sure you want to return to start?", "yes");
  if(sign != null){
    points[1] += 0.0001;
  points = [36.98949379578401, -122.06277128548504];
  reloadmap();
  polyline.setLatLngs([leaflet.latLng(points[0], points[1])]);
  }
});

const displaypayercoins = document.createElement("button"); 
displaypayercoins.innerHTML = "show player coins"; document.body.append(displaypayercoins);
displaypayercoins.addEventListener('click', (event) => {
  showcachecoins = false; showplayercoins = true;
  status.innerHTML = `Your coins are: ` + TextCoins(playersCoins); document.body.append(status);
});

let tracklocation = false;
const worldupdate = document.createElement("button"); 
worldupdate.innerHTML = "🌐"; document.body.append(worldupdate);
worldupdate.addEventListener('click', (event) => {
  tracklocation = !tracklocation;
   navigator.geolocation.getCurrentPosition(
    (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      //console.log("Latitude:", latitude);
      //console.log("Longitude:", longitude);

      points = [latitude, longitude];
      polyline.setLatLngs([leaflet.latLng(points[0], points[1])]);
      tracklocation = false;
      reloadmap();
    },
    (error) => {
      console.error("Error getting location:", error);
    }
  )
  
});


let collectedpoints = 0;
const status = document.createElement("text"); 
status.innerHTML = `Your coins are: ` + TextCoins(playersCoins); document.body.append(status);
let showplayercoins = true; let showcachecoins = false;


let areasize = 8;
let tiledegrees = 1e-4;
let spawnchance = 0.1;


function spawnCache(i: number, j: number) {
  const origin = leaflet.latLng(points[0], points[1]);
  const bounds = leaflet.latLngBounds([
    [origin.lat + i * tiledegrees, origin.lng + j * tiledegrees],
    [origin.lat + (i + 1) * tiledegrees, origin.lng + (j + 1) * tiledegrees],
  ]);


    let pointValue = Math.floor(luck([i, j, "initialValue"].toString()) * 100);
    //if(getCache(i,j) == null){
    let cache:Cache = {i:i + Classroom.i, j:j + Classroom.j, coins: [] };
      for(let k =  pointValue -1; k >= 0; k--){
        cache.coins.push({i:i + Classroom.i, j:j + Classroom.j, serial: k});
      }
      
      if(getCache(i + Classroom.i,j + Classroom.j) != null){
        console.log("getcache is null")
        cacheCoins.push(cache);
      }
    //}

  
  const i_value = i + Classroom.i; const j_value = j + Classroom.j;
  const rect = leaflet.rectangle(bounds);
  rect.addTo(gamemap);
  

  rect.bindPopup(() => {
    let thiscache = getCache(i_value, j_value);
    const popupDiv = document.createElement("div");
    popupDiv.innerHTML = `
                <div>There is a cache here at "${i + Classroom.i},${Classroom.j}". It has <span id="value">${ thiscache?.coins.length}</span> coins.</div>
                <button id="poke">poke</button><button id="deposit">deposit</button><button id="cachescoins">show cache's coins</button>`;


    popupDiv
      .querySelector<HTMLButtonElement>("#poke")!
      .addEventListener("click", () => {

        let thiscache = getCache(i_value, j_value);
        if(thiscache != null){
          if(thiscache.coins.length > 0){
  
            let topcoin = thiscache.coins.pop(); pointValue--;
            popupDiv.querySelector<HTMLSpanElement>("#value")!.innerHTML =
            (thiscache.coins.length).toString();
              if(topcoin != undefined){playersCoins.push(topcoin)}; collectedpoints++;
            if(showplayercoins){
              status.innerHTML = `Your coins are: ` + TextCoins(playersCoins);
            }
            else{
              status.innerHTML = `This cache's coins are: ` + TextCoins(thiscache.coins);
            }
            localStorage.setItem("playerscoins", JSON.stringify(playersCoins));
            localStorage.setItem("cachecoins", JSON.stringify(cacheCoins));
            }
        }
        
      });

      popupDiv
      .querySelector<HTMLButtonElement>("#deposit")!
      .addEventListener("click", () => {
        let thiscache = getCache(i_value, j_value);
        if(thiscache != null){
          if(playersCoins.length > 0){

            let topcoin = playersCoins.pop();  pointValue++; collectedpoints--;
            if(topcoin != undefined){thiscache.coins.push(topcoin);};
            popupDiv.querySelector<HTMLSpanElement>("#value")!.innerHTML =
            (thiscache.coins.length).toString();
            if(showplayercoins){
              status.innerHTML = `Your coins are: ` + TextCoins(playersCoins);
            }
            else{
              status.innerHTML = `This cache's coins are: ` + TextCoins(thiscache.coins);
            }
            localStorage.setItem("playerscoins", JSON.stringify(playersCoins));
            localStorage.setItem("cachecoins", JSON.stringify(cacheCoins));
            }
        }
        
      });

      popupDiv
      .querySelector<HTMLButtonElement>("#cachescoins")!
      .addEventListener("click", () => {
        let thiscache = getCache(i_value, j_value);
        if(thiscache != null){

            status.innerHTML = `This cache's coins are: ` + TextCoins(thiscache.coins);
            showplayercoins = false; showcachecoins = true;
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

function getCache(i:number, j:number){
  for(let k = 0; k < cacheCoins.length; k++){
    //console.log("j is: " + j);
    if(cacheCoins[k].j == j && cacheCoins[k].i == i){
      return cacheCoins[k];
    }
  }
  return null;
}

function TextCoins(coins:Coin[]){
  let str = "";
  for(let i = 0; i < coins.length; i++){
    str = str + "(i: " + coins[i].i + ", j: " + coins[i].j + ", serial: "
    + coins[i].serial + "), ";
  }
  return str;
}

//impliments polyline
var latlngs:LatLng[] = [
  leaflet.latLng(points[0], points[1]),
];

var polyline = leaflet.polyline(latlngs, {color: 'red'}).addTo(gamemap);
//gamemap.fitBounds(polyline.getBounds());
function updatePolyline(i:number, j:number){
  polyline.addLatLng(leaflet.latLng(points[0], points[1]))
  //polyline.addTo(gamemap);
}
