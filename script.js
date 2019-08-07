var map;
var BOUNDS = {
  north: -34.36,
  south: -47.35,
  west: 166.28,
  east: -175.81,
};
var CENTER = {lat: -37.06, lng: 174.58};
var SOUND_MARKERS = [];
var MAP_MARKERS = [];
var SOUND_HOWLS = [];
var NUM_SOUNDS = 0;
var soundsLoaded;

var SOUNDS_INFO;

var sound1, marker1;

var PATH_TO_SOUNDS = "sounds2/";

var initial = true;

//Functions
var updateSounds;

var move = [0,0];
var zoom;
//var keyCodes = {up: 87, down: 83, left: 65, right: 68, zoomIn:90, zoomOut:88};
//var keyCodes = [87, 83, 65, 68, 90, 88];
var keyCodes = [38, 40, 37, 39,90, 88];
var keyDown = [false,false,false,false,false,false];
var panAmt = 15;
var fps = 60;

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

function initSoundsInfo(){
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

function animateMap(){
  setTimeout(function(){
    //    console.log(move, keyDown);
    //    map.setZoom(zoom);
    if (move[0] != 0 || move[1] != 0)
      map.panBy(move[0], move[1]);
    requestAnimationFrame(animateMap);  
  }, 1000 / fps)
}



function initMap() {

  initSoundsInfo();

  map = new google.maps.Map(document.getElementById('map'), {
    center: CENTER,
    restriction:{
      latLngBounds: BOUNDS,
      strictBounds: false,
    },
    zoom: 8,
    disableDefaultUI: false
  });

  //  zoom = map.getZoom();

  initSoundMarkers();

  for (var i=0; i < SOUND_MARKERS.length; i++){
    MAP_MARKERS.push(new google.maps.Marker(SOUND_MARKERS[i]));
    console.log("new marker made");
  }
  
  console.log("map markers", MAP_MARKERS)

  //    initSounds(); 

  //  initialize(); //easing??


  //  marker1 = new google.maps.Marker( {position: CENTER, map: map, title: 'aukland', play: false},);
  //  sound1 = new Howl({
  //    src: ['Adventure Time Ending Theme.mp3'],
  //    html5: true,
  //    autoplay: false,
  //  });
  //  sound1.on('load', function(id) { console.log('loaded:', id);});   
  //  sound1.on('play', function(id) {console.log('played:', id);});   
  //  sound1.on('end', function(id) { console.log('ended:', id);});   

    google.maps.event.addListenerOnce(map, 'idle', function () {
      // map is ready
      setTimeout(function() {
        //      console.assert(NUM_SOUNDS == SOUND_HOWLS.length && NUM_SOUNDS == MARKERS.length);
//        while(NUM_SOUNDS != SOUND_HOWLS.length){}
  
        google.maps.event.addListener(map, 'bounds_changed', function() {
          var bounds =  map.getBounds();
          var ne = bounds.getNorthEast();
          var sw = bounds.getSouthWest();
          updateSounds(bounds);
        });
  
      }, 2000);
    });

  //  google.maps.event.addListener(map, 'mousemove', function (event) {
  //    //    displayCoordinates(event.latLng);
  //    //          map.setCenter(event.latLng);
  //
  //  });
}

function keyDownHandler(e) {
  e.preventDefault();
  //  alert(e.keyCode);
  var kc = e.keyCode;

//    if (kc == 32) addSoundsToMap();

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
  e.preventDefault();
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
    var m = {
      position: s.pos,
      map: map,
      title: s.descrip,
      play: false
    };
    var h = new Howl({
      src: [PATH_TO_SOUNDS + s.filename],
      html5: true,
      autoplay: false,
      pool: 1,
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
  }

  console.log("sound howls", SOUND_HOWLS);
  console.log("markers", SOUND_MARKERS)
}

function updateSounds(bounds){
//  console.log("update")
//  if (!initial) return;
  //  console.log(MARKERS[0])
  for (var i=0; i < SOUND_MARKERS.length; i++){
    var pos = SOUND_MARKERS[i].position;
    var ne = bounds.ga;
    var sw = bounds.na;
    SOUND_MARKERS[i].play = (ne.j < pos.lng) && (pos.lng < ne.l) && (sw.j < pos.lat) && (pos.lat < sw.l);
  }

  for (var i=0; i < SOUND_MARKERS.length; i++){
    var m = SOUND_MARKERS[i];
    var s = SOUND_HOWLS[i]
    if (m.play && !s.playing()){
      //      console.log("play")
      s.play();
    }
    else if (!m.play && s.playing()){
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

function displayCoordinates(pnt) {
  var lat = pnt.lat();
  lat = lat.toFixed(4);
  var lng = pnt.lng();
  lng = lng.toFixed(4);
  console.log("Latitude: " + lat + "  Longitude: " + lng);
}

//easing
var EasingAnimator = function(opt){
  opt = opt || {};
  this.easingInterval = opt.easingInterval;
  this.duration = opt.duration || 1000;
  this.step = opt.step || 50;
  this.easingFn = opt.easingFn  || function easeInOutElastic(t, b, c, d) {
    if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
    return -c/2 * ((t-=2)*t*t*t - 2) + b;
  };
  this.callBack = opt.callBack || function(){};
};

EasingAnimator.makeFromCallback = function(callBack){
  return new EasingAnimator({
    callBack: callBack
  });
};

EasingAnimator.prototype.easeProp = function(obj, propDict){
  propDict = propDict || {};

  var self = this,
      t = 0,
      out_vals = JSON.parse(JSON.stringify(obj));

  clearInterval(self.easingInterval);
  self.easingInterval = setInterval(function(){
    t+= self.step;
    if (t >= self.duration) {
      clearInterval(self.easingInterval);
      self.callBack(propDict);
      return;
    }
    var percent = self.easingFn(t, 0, 1, self.duration);
    Object.keys(propDict).forEach(function(key, i) {
      var old_val = obj[key];

      out_vals[key] = old_val - percent*(old_val - propDict[key]);
    });
    self.callBack(out_vals);
  }, self.step);
};

function initialize() {
  var easingAnimator = EasingAnimator.makeFromCallback(function(latLng){
    map.setCenter(latLng) 
  })
  }

//google.maps.event.addDomListener(window, 'load', initialize);