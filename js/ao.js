var map = null;

function filterNeighborhoods() {
    
    const neighborhoods = [...new Set(establecimientos.map(d => d.COLONIA))].sort();

    neighborhoods.forEach(n => {
        let o = new Option(n, n);
        /// jquerify the DOM object 'o' so we can use the html method
        $(o).html(n);
        $('#neighborhood-select').append(o);
    });
    
}

function filterPlaces(col) {
    
    const places = [...new Set(establecimientos.filter(b => b.COLONIA == col).map(b => b.NOMBRE_ESTABLECIMIENTO))].sort();

    places.forEach(s => {
        let o = new Option(s, s);
        $(o).html(s);
        $('#establecimiento-select').append(o);
    });
    
}

function initMap() {
    mapboxgl.accessToken = 'pk.eyJ1IjoiYWJyYXZvOTIxIiwiYSI6ImNqcG10MjBzcDBzZTczeHA1Njltd2o4MGMifQ.Ey4FPNa9j5C4X8UODu_7gw';
			
	map = new mapboxgl.Map({
				container: 'map',
				style: 'mapbox://styles/abravo921/cjpmtrfa126e92sml6bp1z2br'
			});
    map.on('load', function () {
        map.addSource('ao-liconsa-src', {
            type: 'geojson',
            data: {
              "type": "FeatureCollection",
              "features": []
            }
        });


        map.addLayer({
            "id": "ao-liconsa",
            "type": "symbol",
            "source": 'ao-liconsa-src',
            "layout": {
                "icon-image": "blue_pin",
                "icon-allow-overlap": true,
                "icon-size": 0.07,
                "text-field": "",
                "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
                "text-offset": [0, 0.6],
                "text-anchor": "top"
            }
        });
        

        map.on('click', 'ao-liconsa', e => {
            const place_id = e.features[0].properties.id;
            const info = establecimientos.find(b => b.id == place_id);
            
            const t = `<tr><td>Nombre del establecimiento</td><td class="uppercase">${info['NOMBRE_ESTABLECIMIENTO']}</td></tr>`
                    + `<tr><td>Sector</td><td class="uppercase">${info['SECTOR']}</td></tr>`
                    + `<tr><td>Personal</td><td class="uppercase">${info['PERSONAL']}</td></tr>`
                    + `<tr><td>Localización</td><td class="uppercase">${info['LOCALIZACION']}</td></tr>`
                    + `<tr><td>AGEB</td><td class="uppercase">${info['AGEB']}</td></tr>`
                    + `<tr><td>Manzana</td><td class="uppercase">${info['MANZANA']}</td></tr>`
                    + `<tr><td>Teléfono</td><td class="uppercase">${info['TELEFONO']}</td></tr>`
                    + `<tr><td>Correo electrónico</td><td class="uppercase">${info['EMAIL']}</td></tr>`
                    + `<tr><td></td><td></td></tr>`;

            const calle = info.CALLE.length ? info.CALLE : '';
            const numero = info.NUMERO.length ? info.NUMERO : '';
            const colonia = info.COLONIA.length ? info.COLONIA : '';
            const cp = info.CP.length ? info.CP : '';

            $('#info-table tbody').html(t);

            /*const img = info.imagen.length ? `<img src="./images/pictures/${info.imagen}.png"/>` : 'Sin imagen';
          
            $('#info-modal .modal-body #info-img').html(img);*/

            $('#info-modal .modal-footer p').text(`${calle} ${numero}, ${colonia}, CP ${cp}.`);

            $('#info-modal').modal('show');
        });
    });
   
}

function placePlaces(col, place) {
    let p = establecimientos.filter(b => b.COLONIA == col && b.NOMBRE_ESTABLECIMIENTO == place)
            .map(b => {
                const lng = b.LONGITUD != 0 ? Number(b.LONGITUD) : -99.1269;
                const lat = b.LATITUD != 0 ? Number(b.LATITUD) : 19.4978;
                return {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [lng, lat]
                    },
                    "properties": {
                        "id": b.id
                    }
                }
            });
 
    map.getSource('ao-liconsa-src').setData({
        "type": "FeatureCollection",
        "features": p
    });
 
}

$(function(){ 
    initMap();
    filterNeighborhoods();
    
    $('#neighborhood-select').on('change',function() {
        map.getSource('ao-liconsa-src').setData({
            "type": "FeatureCollection",
            "features": []
        });
        $('#establecimiento-select').empty().html('<option selected value="default">Selecciona una opción</option>');
        filterPlaces(this.value);
    });

    $('#establecimiento-select').on('change',function() {
        const n = $('#neighborhood-select').val();
        placePlaces(n,this.value);
    });

});