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
  //console.log("i is: " + i + ", j is: " + j);

  let pointValue = Math.floor(luck([i, j, "initialValue"].toString()) * 100);
  let cache:Cache = {i:i + Classroom.i, j:j + Classroom.j, coins: [] };
    for(let k =  pointValue -1; k >= 0; k--){
      cache.coins.push({i:i + Classroom.i, j:j + Classroom.j, serial: k});
    }
    cacheCoins.push(cache);
  
  const i_value = i + Classroom.i; const j_value = j + Classroom.j;
  const rect = leaflet.rectangle(bounds);
  rect.addTo(gamemap);
  

  // Handle interactions with the cache
  rect.bindPopup(() => {
    //let pointValue = Math.floor(luck([i, j, "initialValue"].toString()) * 100);
    // The popup offers a description and button
    let thiscache = getCache(i_value, j_value);
    const popupDiv = document.createElement("div");
    popupDiv.innerHTML = `
                <div>There is a cache here at "${i + Classroom.i},${Classroom.j}". It has value <span id="value">${ (pointValue)}</span>.</div>
                <button id="poke">poke</button><button id="deposit">deposit</button>`;

    // Clicking the button decrements the cache's value and increments the player's points
    popupDiv
      .querySelector<HTMLButtonElement>("#poke")!
      .addEventListener("click", () => {
        //console.log("i is: " + i_value + ", j is: " + j_value);
        let thiscache = getCache(i_value, j_value);
        if(thiscache != null){
          if(thiscache.coins.length > 0){
  
            let topcoin = thiscache.coins.pop(); pointValue--;
            popupDiv.querySelector<HTMLSpanElement>("#value")!.innerHTML =
            (pointValue).toString();
              if(topcoin != undefined){playersCoins.push(topcoin)}; collectedpoints++;
            //status.innerHTML = `You have ${playersCoins.length} points!`;
            status.innerHTML = `Your coins are: ` + TextCoins(playersCoins);
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
            popupDiv.querySelector<HTMLSpanElement>("#value")!.innerHTML =
            (pointValue).toString();
            if(topcoin != undefined){thiscache.coins.push(topcoin);};//pointValue++;};
            //status.innerHTML = `You have ${playersCoins.length} points!`;
            status.innerHTML = `Your coins are: ` + TextCoins(playersCoins);
            }
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
  for(let k = 0; cacheCoins.length; k++){
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


