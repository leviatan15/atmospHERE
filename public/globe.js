
let requestedCountry = reqCountry

console.log(JSON.stringify(requestedCountry))

const earth = document.getElementById('globe');

const globe = Globe()(earth)
  .width(earth.clientWidth)
  .height(earth.clientHeight)
 

globe.globeImageUrl('https://unpkg.com/three-globe/example/img/earth-dark.jpg');

globe.backgroundColor('rgba(0,0,0,0)');

globe.atmosphereColor('cyan');
globe.atmosphereAltitude(0.2);

globe.scene().add(
  new THREE.AmbientLight(0x0a548a, 5)
);

globe.controls().minDistance = 120;
globe.controls().maxDistance = 330;

globe.controls().autoRotate = true;
globe.controls().autoRotateSpeed = 0.3

 fetch('/countries.geojson')
    .then(res => res.json())
    .then(data => {


      const promise = data.features.find(
        country => country.properties.name === requestedCountry
      )

      console.log(promise)

      globe
        .polygonsData([promise])
        .polygonCapColor(() => '#2ccf79')
        .polygonSideColor(() => '#2ccf79')
        .polygonStrokeColor(() => '#2ccf79')
        .polygonAltitude(0.01)
  
    });

    
      document.querySelector(".globecont").style.width = "270px"
      document.querySelector(".globecont").style.height = "290px"
    

  
     document.querySelector(".globecont").style.transform = "translateX(30px)"
     document.querySelector(".globecont").style.transform = "translateY(20px)"
     earth.style.transform = "translateY(-20px)"
 
     globe.pointsData([
  {
    lat: lat,
    lng: lon,
    size: 0.5,
    color: '#e31010'
  }
])

.pointColor('color')

globe.ringsData([
  {
    lat: lat,
    lng: lon,
    color: () => 'red'
  }
])

.ringColor('color')
.ringAltitude(0.03)



  
 globe.pointOfView(
  {
    lat: lat,
    lng: lon
  },
15000
)

  /*function stop(){
    globe.controls().autoRotate = false
  }*/


///setTimeout(zoom, 15000)
///setTimeout(stop, 25000)

