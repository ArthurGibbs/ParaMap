var qs = location.search.substring(1).split('&').map(function(e) {return e.split('=')}).reduce(function(o, e){o[e[0]] = decodeURI(e[1]); return o}, {});
var version;
var config = {};
var map;

function initialize() {

  var mapProp = {
    center:new google.maps.LatLng(52.842595,-1.871109),
    zoom:6,
    mapTypeId:google.maps.MapTypeId.TERRAIN
  };

  var map=new google.maps.Map(document.getElementById("googleMap"),mapProp);

  var updateConfig = function() {
    return $.ajax('config/config.json', {
      dataType: 'json',
      cache: false
    }).then(function(configJSON) {
          if (version && configJSON.version > version) {
            location.reload();
          }
          version = configJSON.version;
          config = $.extend(configJSON, qs);


          setTimeout(updateConfig, config.refreshConfig);
        }, function() {
          setTimeout(updateConfig, config.refreshConfig);
        });
  };

  var getMetTimes = function GetMetTimes() {
    return $.ajax('http://datapoint.metoffice.gov.uk/public/data/val/wxobs/all/json/capabilities?res=hourly&key=' + config.MET.APIKEY,
        {dataType: 'json'})
  }

  var getMetData = function (lastTime) {
    return $.ajax('http://datapoint.metoffice.gov.uk/public/data/val/wxobs/all/json/all?res=hourly&time=' + lastTime + '&key=' + config.MET.APIKEY,
        {dataType: 'json'})
  };

  updateConfig().then(function() {
    //console.log(config.MET.APIKEY)
    getMetTimes().then(function(time) {
      //console.log(time)
      getMetData(time.Resource.TimeSteps.TS.slice(-1)[0]).then(function(data) {
        //console.log(data)
        data.SiteRep.DV.Location.forEach(function(data) {
          //console.log('hi')
          //console.log(data)

          function compassToDegrees(compass){
            var myMappings = {
              "N": 0,
              "NNE": 22.5,
              "NE": 45,
              "ENE": 67.5,
              "E": 90,
              "ESE": 112.5,
              "SE": 135,
              "SSE": 157,
              "S": 180,
              "SSW": 202.5,
              "SW": 225,
              "WSW": 247.5,
              "W": 270,
              "WNW": 292.5,
              "NW": 315,
              "NNW": 337.5
            };
            return  myMappings[compass]

          }

          var symbolOne = {
            path: 'M -2,-1 0,3 2,-1 1,-1 1,-3 -1,-3 -1,-1 z',
           // strokeColor: '#F00',
            rotation: compassToDegrees(data.Period.Rep.D),
            fillColor: '#F00',
            fillOpacity: 0.5,
            scale: 2 + data.Period.Rep.S/5,
            strokeWeight: 2
          };

          var marker = new google.maps.Marker({
            position: new google.maps.LatLng(data.lat, data.lon),
            icon: symbolOne,
            map: map
          });

//          var myCity = new google.maps.Circle({
//            center:new google.maps.LatLng(data.lat, data.lon),
//            radius:5000,
//            strokeColor:"#0000FF",
//            strokeOpacity:0.8,
//            strokeWeight:2,
//            fillColor:"#0000FF",
//            fillOpacity:0.4
//          });

          //myCity.setMap(map);

        })





      })
    });
  })


}



google.maps.event.addDomListener(window, 'load', initialize);