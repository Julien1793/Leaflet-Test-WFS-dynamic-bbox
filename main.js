function init(){
    const StArnoult = {
        lat: 48.5532698,
        lng: 1.930517
    }

    const zoomLevel = 30;
    const map = L.map('mapid').setView([StArnoult.lat,StArnoult.lng],zoomLevel);
    const mainLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    });
    mainLayer.addTo(map);

    var start_at_zoom = 15;

    function onEachFeature(feature, layer) {
        // does this feature have a property named dz?
        if (feature.properties && feature.properties.dz) {
            layer.bindPopup(feature.properties.dz);
        }
    }
    
    var featureLayer = new L.GeoJSON(
        null, {
            onEachFeature: onEachFeature,
            style: function (feature){
                return{color:"red"};
            },
            onEachFeature: function (feature,layer){
                layer.bindPopup('<h3>'+'Parcelle (IGN)'+'</h3>'+
                '<p><span>Section : </span>'+feature.properties.section +
                '<p><span>Numero : </span>'+feature.properties.numero
                )
            }    
        }).addTo(map);
    load_wfs();
    
    function loadGeoJson(data) {
        // console.log(data);
        featureLayer.clearLayers();
    
        featureLayer.addData(data);
    
    }
    
    map.on('moveend', load_wfs);
    
    function load_wfs() {
        if (map.getZoom() > start_at_zoom) {
            var geoJsonUrl = 'https://wxs.ign.fr/parcellaire/geoportail/wfs';
            var defaultParameters = {
                service: 'WFS',
                version: '2.0.0',
                request: 'getFeature',
                typeName: 'CADASTRALPARCELS.PARCELLAIRE_EXPRESS:parcelle',
                //COUNT: 3000,
                outputFormat: 'json',
                //format_options: 'callback: getJson',
                srsName: 'EPSG:4326'
            };
    
    
    
            // Fonction Leaflet pour récupérer la BBOX dans la carte (xmin,ymin,xmax,ymax)
            // Problème ! cette méthode BBOX n'est pas compatible avec l'API IGN
            // !!! Cette variable ne peut pas être utilisée dans la requete  !!!
            var customParams_fail = {
                bbox_fail: map.getBounds().toBBoxString()
            };
            // Création liste : inversement des x;y pour le requetage WFS IGN => ymin,xmin,ymax,xmax
            var test = [map.getBounds().getSouth().toString(),
                map.getBounds().getWest().toString(),
                map.getBounds().getNorth().toString(),
                map.getBounds().getEast().toString()];
            // Transformation de la liste BBOX en texte pour le requetage
            var customParams={bbox:test.join()};

            // Renvoie les messages de la BBOX pour vérifier l'inversion des x;y
            console.log(test.join());
            console.log(customParams_fail);
            console.log(customParams);
            
            // Renvoie l'url avec les requetes => permet de vérifier la construction de l'url
            var parameters = L.Util.extend(defaultParameters, customParams);
            console.log(geoJsonUrl + L.Util.getParamString(parameters));
    
            // Envoie de la requete avec la méthode ajax
            $.ajax({
                jsonp: false,
                url: geoJsonUrl + L.Util.getParamString(parameters),
                dataType: 'json',
                jsonpCallback: 'getJson',
                success: loadGeoJson
            });

    
        } else {
            //alert("Zoom in to see the polygons!");
            console.log("Zoom in to see the layer!");
            featureLayer.clearLayers();
        }
    }
    
    /*Legend specific*/
    var legend = L.control({ position: "bottomleft" });

    legend.onAdd = function(map) {
    var div = L.DomUtil.create("div", "legend");
    div.innerHTML += "<h4>Legende</h4>";
    div.innerHTML += '<i style="border: solid #FF0000;background: #F2A0A0"></i><span>Parcelle (IGN)</span><br>';
    //div.innerHTML += '<i style="background: #448D40"></i><span>Forest</span><br>';
    //div.innerHTML += '<i style="background: #E6E696"></i><span>Land</span><br>';
    //div.innerHTML += '<i style="background: #E8E6E0"></i><span>Residential</span><br>';
    //div.innerHTML += '<i style="background: #FFFFFF"></i><span>Ice</span><br>';
    //div.innerHTML += '<i class="icon" style="background-image: url(https://d30y9cdsu7xlg0.cloudfront.net/png/194515-200.png);background-repeat: no-repeat;"></i><span>Grænse</span><br>';
    return div;
    };
    legend.addTo(map);

 
}
