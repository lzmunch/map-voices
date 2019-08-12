// config.js
var API_KEY = "AIzaSyAxCvGaKe4Z_q3zWNy-GA10JVizY7zCeH0";
var soundsInfoUrl = "../places/belfast_sounds_example-info.json";

var js_file = document.createElement('script');
js_file.type = 'text/javascript';
js_file.src = 'https://maps.googleapis.com/maps/api/js?callback=initMap&key=' + API_KEY;
js_file.async = 'sync';
js_file.defer = 'defer';
(document.getElementsByTagName('head'))[0].appendChild(js_file);