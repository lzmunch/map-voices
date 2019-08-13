// TODO replace function to check for inViewport
// make volume depend on dist from center
// add stereo sound
// finagle w icon
// animate icon
// description pops up when marker in focus
// zoom?
// blur the edges, fishhole?

var BOUNDS = {
  north: -34.36,
  south: -47.35,
  west: 166.28,
  east: -175.81,
};
var CENTER = {lat: -37.06, lng: 174.58};

var map;

var SOUNDS_INFO;
var PATH_TO_SOUNDS = "sounds2/";

var SOUND_MARKERS = [];
var MAP_MARKERS = [];
var SOUND_HOWLS = [];
var INFO_WINDOWS = [];
var NUM_SOUNDS = 0;
var soundsLoaded;

var MAP_PROJECTION;

var initial = true;

var move = [0,0];
var zoom;
//var keyCodes = {up: 87, down: 83, left: 65, right: 68, zoomIn:90, zoomOut:88};
//var keyCodes = [87, 83, 65, 68, 90, 88];
var keyCodes = [38, 40, 37, 39,90, 88];
var keyDown = [false,false,false,false,false,false];
var panAmt = 5;
var fps = 60;
var masterVol = 0.25;

// get json w sounds info
var soundsInfoFromFile;
var url = soundsInfoUrl;
var promise = $.getJSON(url);

// on document load
$(function(){
  //  window.requestAnimationFrame(function(){map.panBy(move[0],move[1]);});

  $(document).bind("keydown", keyDownHandler);
  $(document).bind("keyup", keyUpHandler);

  window.setInterval(function(){
    //    console.log(move);
    //    console.log("pan");
    //    map.panBy(20,20)
    //    map.panBy(move[0],move[1])
    //        map.panBy(move[0],move[1]);
  }, 50);

  animateMap();
});

// init google maps + sound markers + listeners
function initMap() {
  // get json w sounds info
  $.when(promise).then(function(jsonResp){
    soundsInfoFromFile = jsonResp;
    initSoundsInfoFromFile();

    //map
    map = new google.maps.Map(document.getElementById('map'), {
      center: CENTER,
      restriction:{
        latLngBounds: BOUNDS,
        strictBounds: false,
      },
      zoom: 8,
      disableDefaultUI: true,
      mapTypeId: 'hybrid'
    });

    initSoundMarkers();

    // map markers
    var iconColor = "f55442";
    var iconScale = "0.75";
    var greenIconSrc = "https://mts.googleapis.com/vt/icon/name=icons/spotlight/spotlight-waypoint-a.png&text=A&psize=16&font=fonts/Roboto-Regular.ttf&color=ff333333&ax=44&ay=48&scale=1&";
    var iconSrc = "https://www.google.com/maps/vt/icon/name=assets/icons/spotlight/spotlight_pin_v2_shadow-1-small.png,assets/icons/spotlight/spotlight_pin_v2-1-small.png,assets/icons/spotlight/spotlight_pin_v2_dot-1-small.png,assets/icons/spotlight/spotlight_pin_v2_accent-1-small.png&highlight=ff000000,ea4335,960a0a,ff000000&color=ff000000?scale=2&scale="+iconScale;
    var pinletIconSrc = "https://www.google.com/maps/vt/icon/name=assets/icons/poi/tactile/pinlet_shadow-1-small.png,assets/icons/poi/tactile/pinlet_outline_v2-1-small.png,assets/icons/poi/tactile/pinlet-1-small.png,assets/icons/poi/quantum/pinlet/dot_pinlet-1-small.png&highlight=ff000000,ffffff," + iconColor + ",ffffff&color=ff000000?scale="+iconScale;
    var soundIcon = "https://upload.wikimedia.org/wikipedia/commons/2/21/Speaker_Icon.svg";
    var soundIcon2 = "https://downloadfreesvgicons.com/icons/music-and-sound-icons/svg-sound-level-icon-1/svg-sound-level-icon-1.svg"
    var scale = 20;
    var icon = {
      url: soundIcon2,
      scaledSize: new google.maps.Size(scale, scale), // scaled size
      origin: new google.maps.Point(0,0), // origin
      anchor: new google.maps.Point(0, 0) // anchor
    };
    for (var i=0; i < SOUND_MARKERS.length; i++){
      var s = SOUND_MARKERS[i];
      var mark = new google.maps.Marker({
        position: s.position,
        map: map,
        title: s.title,
        icon: icon
      });
      MAP_MARKERS.push(mark);
      console.log("new marker", mark);
    }
    console.log("map markers", MAP_MARKERS)

    // add update function
    google.maps.event.addListenerOnce(map, 'idle', function () {
      // map is ready
      setTimeout(function() {

        google.maps.event.addListener(map, 'bounds_changed', function() {
          var bounds =  map.getBounds();
          var ne = bounds.getNorthEast();
          var sw = bounds.getSouthWest();
          updateSounds(bounds);
        });

      }, 2000);
    });

    // check for marker in focus when user stops moving
    google.maps.event.addListener(map, 'idle', function () {
      //      var c = map.getCenter();
      console.log("idle");
      displayDescrip();
    });
  });
}

function initSoundsInfoFromFile(){
  SOUNDS_INFO = soundsInfoFromFile["sounds"];

  var center = soundsInfoFromFile["center"];
  CENTER = {
    lat: parseFloat(center.lat),
    lng: parseFloat(center.lng)
  }

  var bounds = soundsInfoFromFile["bounds"];
  Object.keys(bounds).map(function(key, index) {
    bounds[key] = parseFloat(bounds[key]);
  });
  BOUNDS = bounds

  console.log("sounds info",SOUNDS_INFO);
  console.log("center",CENTER);
  console.log("bounds", BOUNDS);
}

function initSoundMarkers(){
  for (var i=0; i< SOUNDS_INFO.length; i++){
    var s = SOUNDS_INFO[i];

    if (!s.filename){
      console.log("bad", s.filename);
      s.filename = "Adventure_Time_Ending_Theme.mp3";
      //      return;
    }
    else
      console.log("good", s.filename)
    //    createSoundMarker(s.filename, s.pos, s.descrip);

    // map marker info
    //var m = new google.maps.Marker({})
    var m = {
      position: s.pos,
      title: s.descrip,
      inView: false,
    };

    // info window info
    var contentString = s.descrip + " (" + s.place + ")";
    var iw = new google.maps.InfoWindow({
      content: contentString
    })

    // howler howl
    var h = new Howl({
      src: [PATH_TO_SOUNDS + s.filename],
      html5: true,
      autoplay: false,
      pool: 1,
      volume: masterVol,
    });

    h.on('load', function(id) {
      console.log('loaded:', id);
      NUM_SOUNDS += 1;
    });   
    h.on('play', function(id) {
      console.log('played:', id);
    });   
    h.on('pause', function(id) {
      console.log('pause:', id);
    });             

    SOUND_HOWLS.push(h);
    SOUND_MARKERS.push(m);
    INFO_WINDOWS.push(iw);
  }

  console.log("sound howls", SOUND_HOWLS);
  console.log("markers", SOUND_MARKERS)
}

function updateSounds(bounds){
  //  console.log("update")
  //  if (!initial) return;
  //  console.log(MARKERS[0])
  var center = bounds.getCenter();

  //update in view flag
  for (var i=0; i < SOUND_MARKERS.length; i++){
    var pos = SOUND_MARKERS[i].position;
    var ne = bounds.ga;
    var sw = bounds.na;
    SOUND_MARKERS[i].inView = (ne.j < pos.lng) && (pos.lng < ne.l) && (sw.j < pos.lat) && (pos.lat < sw.l);
  }

  //update sounds
  for (var i=0; i < SOUND_MARKERS.length; i++){
    var m = SOUND_MARKERS[i];
    var s = SOUND_HOWLS[i]
    if (m.inView && !s.playing()){
      //      console.log("play")
      var d = distFromCenter(center, m.position);
      console.log("dist", d);
//      s.volume(d*masterVol);
      s.play();
    }
    else if (!m.inView && s.playing()){
      //      console.log("stop")
      //    sound1.mute(true);
      s.pause();
    }
  }

  if (initial){
    console.log("initially ready");
    initial = false;
  }
}

function animateMap(){
  setTimeout(function(){
    //    console.log(move, keyDown);
    //    map.setZoom(zoom);
    if (move[0] != 0 || move[1] != 0)
      map.panBy(move[0], move[1]);
    requestAnimationFrame(animateMap);  
  }, 1000 / fps)
}

function markerIdxInFocus(c){
  var proj = map.getProjection();
  var lat = c.lat();
  var lng = c.lng();
  var pad = 0.0003; //px
  var pt = proj.fromLatLngToPoint(c);
  console.log(pt);
  //  var focusBounds = {n: lat+pad, s: lat-pad , e:lng+pad, w:lng-pad};
  var bounds = new google.maps.LatLngBounds({lat: lat-pad, lng: lng-pad}, {lat:lat+pad, lng:lng+pad});
//  var bounds = {x1: pt.x-pad, x2: pt.x+pad, y1: pt.y-pad, y2: pt.y+pad};
  console.log("focus bounds", bounds);

  for (var i=0; i < SOUND_MARKERS.length; i++){
    if (!SOUND_MARKERS[i].inView) continue;
//    var pos = SOUND_MARKERS[i].position;
    var pos = MAP_MARKERS[i].position;
//    var spt = proj.fromLatLngToPoint(pos);
    if(bounds.contains(pos)){
//    if (bounds.x1 < spt.x && spt.x < bounds.x2 && bounds.y1 < spt.y && spt.y < bounds.y2){
      console.log("found m", SOUND_MARKERS[i])
      //      return SOUND_MARKERS[i];
      return i;
    }
    else{
      INFO_WINDOWS[i].close();
    }
  }
  return -1;
}

function dist(x1,y1,x2,y2){
  return Math.sqrt(Math.pow(x1-x2,2) + Math.pow(y1-y2,2));
}

function distFromCenter(center, pos){
  var dToEdge = dist(center.lat(), BOUNDS.east, center.lat(), center.lng());
  var d = dist(center.lat(), center.lng(), pos.lat, pos.lng);
  console.log(d,dToEdge);
  return d / dToEdge;
}

  function displayDescrip(){
    var c = map.getCenter();
    var i = markerIdxInFocus(c);
    if (i>=0){
      console.log("in focus", SOUND_MARKERS[i], "volume=", SOUND_HOWLS[i].volume());
      INFO_WINDOWS[i].open(map, MAP_MARKERS[i]);
    } 
  }

  function keyDownHandler(e) {
    //  e.preventDefault();
    var kc = e.keyCode;

    //  console.log(kc, keyCodes.up);
    if (kc == keyCodes[0]){ //up
      move[1] = -panAmt;
      keyDown[0] = true;
    }
    if (kc == keyCodes[1]){ //down
      move[1] = panAmt;
      keyDown[1] = true;
    }
    if (kc == keyCodes[2]){ //left
      move[0] = -panAmt;
      keyDown[2] = true;
    }
    if (kc == keyCodes[3]){ //right
      move[0] = panAmt;
      keyDown[3] = true;
    }

    if (kc == keyCodes[4]){
      map.setZoom(map.getZoom() + 1);
      //      zoom += 1;
    }
    else if (kc == keyCodes[5]){
      map.setZoom(map.getZoom() - 1);
      //      zoom -= 1;
    }
    //    map.panBy(0,-panAmt);

    //    console.log("keydown, move",move);
  }

  function keyUpHandler(e){
    //  e.preventDefault();
    //  alert(e.keyCode);
    var kc = e.keyCode;

    if (kc == keyCodes[0]){ //up
      move[1] = keyDown[1] ? panAmt : 0;
      keyDown[0] = false;
    }
    if (kc == keyCodes[1]){ //down
      move[1] = keyDown[0] ? -panAmt : 0;
      keyDown[1] = false;
    }
    if (kc == keyCodes[2]){ //left
      move[0] = keyDown[3] ? panAmt : 0;
      keyDown[2] = false;
    }
    if (kc == keyCodes[3]){ //right
      move[0] = keyDown[2] ? -panAmt : 0;
      keyDown[3] = false;
    }
  }

  //debug
  function displayCoordinates(pnt) {
    var lat = pnt.lat();
    lat = lat.toFixed(4);
    var lng = pnt.lng();
    lng = lng.toFixed(4);
    console.log("Latitude: " + lat + "  Longitude: " + lng);
  }


function latLng2Point(latLng, map) {
  var topRight = map.getProjection().fromLatLngToPoint(map.getBounds().getNorthEast());
  var bottomLeft = map.getProjection().fromLatLngToPoint(map.getBounds().getSouthWest());
  var scale = Math.pow(2, map.getZoom());
  var worldPoint = map.getProjection().fromLatLngToPoint(latLng);
  return new google.maps.Point((worldPoint.x - bottomLeft.x) * scale, (worldPoint.y - topRight.y) * scale);
}

function point2LatLng(point, map) {
  var topRight = map.getProjection().fromLatLngToPoint(map.getBounds().getNorthEast());
  var bottomLeft = map.getProjection().fromLatLngToPoint(map.getBounds().getSouthWest());
  var scale = Math.pow(2, map.getZoom());
  var worldPoint = new google.maps.Point(point.x / scale + bottomLeft.x, point.y / scale + topRight.y);
  return map.getProjection().fromPointToLatLng(worldPoint);
}