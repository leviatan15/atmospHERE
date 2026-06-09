import dotenv from "dotenv"
dotenv.config()
import rateLimit from 'express-rate-limit'
import express from "express"
import bodyParser from "body-parser"
import axios from "axios"
import cities from './public/cities.json' with { type: 'json' };
import {arranger} from "./arranger.js"
import { clearCache } from "ejs"
import fs from 'fs';
const years = JSON.parse(
fs.readFileSync('./storms.json', 'utf-8'))


const PORT = 3000
const myApiKey = process.env.API_KEY

const app = express()

app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static("public"));


let latitude = 0
let longitude = 0
let unixTime = 0
let unixTimePlus = 0
let empty = true
let pastTime = true
let now = 13
let timeIndex = 0
let cityAnswer = ""
let countryAnswer = ""
let dateAnswer = ""
let timeProvided = false
let newTimeReq = ""
let lastDay = false
let firstDay = false
let fullData = ""
let APIerror = "Incorrect source data for the requested date. We are sorry, please choose another date."


///limiting requests per IP
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: "Too many requests, please try again later."
});


///middleware #1: converts provided time into UNIX format
function timeConverter(req, res, next){
if (req.url === "/getweather" && req.body.date){
    if (req.body.date !== "" && req.body.time === ""){
     unixTime = Math.floor(new Date(req.body.date).getTime() / 1000) - 3600
    unixTimePlus = unixTime + 86400
    console.log("the unix time is: " + unixTime)
    console.log("timeindex is: " + timeIndex)
   
    }
    else if (req.body.date !== "" && req.body.time !== ""){
        console.log(req.body.date + " " + req.body.time)
        unixTime = Math.floor(new Date(req.body.date + " " + req.body.time).getTime() / 1000)
        unixTimePlus = unixTime + 1
        console.log("the unix time is: " + unixTime)
        now = parseInt(((req.body.time[0]) + (req.body.time[1])))
        console.log("timeindex: " + timeIndex)
        timeProvided = true
    }}
next()
}

///middleware #2: Provides if input are not empty (Backend side)
function isNotEmpty(req, res, next){
if(req.url === "/getweather") {
    if(req.body.city !== "" && req.body.country !== "" && req.body.date !== ""){
        empty = false   
    }
 else {
    cityAnswer = req.body.city
    countryAnswer = req.body.country
    dateAnswer = req.body.date
 }
}
next()
}

app.use("/getweather", limiter);
app.use(timeConverter)
app.use(isNotEmpty)



app.get("/", (req, res) => {
res.render("index.ejs"
)})

app.post("/getweather", async (req, res) => {
    if (empty === false) {
        let city = ""
        let country = ""
        let popRaw = ""
        let pop = 0
        let strictLeft = false
        let strictRight = false

        ///if user requests data from input fields
        if (req.body.city && req.body.country){
            city = req.body.city
            country = req.body.country
        }

        ///if user requests data from stepping hours to previous/next days
        else if (req.body.mode === "strict"){
           let cityRaw = req.body.citynext
           let countryRaw = req.body.countrynext

for (let i = 0; i < cityRaw.length; i++) {
    if (cityRaw[i] !== "_") {
    city += cityRaw[i]
    }
    else {city += " "
    }
}   

for (let i = 0; i < countryRaw.length; i++) {
    if (countryRaw[i] !== "_") {
    country += countryRaw[i]
    }
    else {country += " "
    }
}     
        }

        ///console.log("kért város: " + city)
        ///console.log("kért ország: " + country)

////const resp = await axios.get("http://api.openweathermap.org/geo/1.0/direct?q=" + req.body.city + "&q=" + req.body.country + "&appid=" + myApiKey) <-ez volt régen a lot lan lekérés de szarul működik, ezért nem használom


///finds match of user's request in database
const match = cities.find((element) => {
    return element.city === city && element.country === country
})

cities.forEach((element) => {
element.city === city && element.country === country ? popRaw = element.population : null
})

///population of requested area
pop = parseInt(popRaw)


latitude = match.lat
longitude = match.lng
const start = unixTime
const end = unixTimePlus
///console.log("lat is " + latitude)
///console.log("long is " + longitude) 

const requestedCity = city
let ToBeModifiedName = country
let requestedCountry = ""

///changes " " to "_" in a name to find corresponding flag
for (let i = 0; i < ToBeModifiedName.length; i++) {
    if (ToBeModifiedName[i] !== " ") {
    requestedCountry += ToBeModifiedName[i].toLowerCase()
    }
    else {requestedCountry += "_"
    }
}

let requestedDate = ""
let requestedTime = ""


///if user requests data from input fields
if (req.body.city && req.body.country){
    requestedDate = req.body.date
    req.body.time !== "" ? requestedTime = req.body.time : requestedTime = "13:00"
    daysOver(requestedDate)
}

 ///if user requests data from stepping hours to previous/next days
else if (req.body.mode === "strict"){

    requestedDate = req.body.datenext

    if (req.body.dir === "prev"){
        strictRight = true
        requestedTime = "23:00"
        now = 23
    }
    else if (req.body.dir === "next"){
        strictLeft = true
    requestedTime = "00:00"
    now = 0
    }
daysOver(requestedDate)   
}

/*console.log("CITY IS: " + city)
console.log("COUNTRY IS: " + country)
console.log("DATE IS: " + requestedDate)
console.log("TIME IS: " + requestedTime)*/

 now = parseInt(((requestedTime[0]) + (requestedTime[1])))


 /// axios request for source weather data API
const resp2 = await axios.get("https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/" + latitude + "," + longitude + "/" + requestedDate + "/?key=" + myApiKey)

   ///console.log(resp2.data)

   ///checks if API's response data contains error (missing data)
  resp2.data.days[0].hours.length == 24 ? fullData = true : fullData = false
  fullData == false ? res.render("index.ejs", {error:APIerror}) : null


  ///functions to be used --->


function daysOver (dateInp){///sends to frontend to be able to check and control the time period the user prompts.
let datechk = new Date()
              let datechkN = Math.floor(datechk/1000)
              let fullDays = Math.floor(datechkN / 86400) - 1
              let lastSecOfThePrevDay = (fullDays * 86400) - 1

              let providedDate = new Date(dateInp)
              let providedDateUnix = Math.floor(providedDate/1000)

    providedDateUnix > lastSecOfThePrevDay ? lastDay = true : lastDay = false
    providedDateUnix < 86401 ? firstDay = true : firstDay = false

    /*console.log(providedDateUnix)
    console.log("firstday is " + firstDay)
    console.log("lastday is: " + lastDay)*/
}

    function switchtoAvg(orig, newImp){///if only daily average data is available, switches to it.
    orig = newImp
    return orig
   }

   function switchCard(mainFirst, fromWhat, toWhat, text){///function for above
    if(mainFirst == null || fromWhat == null){ 
    if (toWhat !== null){
    fromWhat = switchtoAvg(fromWhat, toWhat)}
   else{
    console.log("előtte: " + fromWhat)
    fromWhat = switchtoAvg(fromWhat, "-no data-")
    console.log("utána: " + fromWhat)}
   }
    return fromWhat}

   let hourChecker = (hourlyData, avgData, arrToPush) => {///checks the each hours' data. If no data, marks the line
    if (hourlyData === null || hourlyData === ""){
        if (avgData !== null){
            arrToPush.push("avg")}
        else {arrToPush.push("-no data-")}}
    else  {
        arrToPush.push(hourlyData)}
   }

    let celsTransform = (origArr, celsArr) => {///transforms to metric system (Celsius)
    origArr.forEach(value => {
        if (value !== "avg" && value !== "-no data-"){
            let C = (value-32) / 1.8
            if (C < 0.5 && C > -0.5){
                celsArr.push("0")
            }
            else {celsArr.push(Math.round(C))}
        }
        else {celsArr.push(value)}
    })}
   
    let speedTransform = (origArr, modArr) => {///transforms to metric system (km/h)
    origArr.forEach(value => {
        if (value !== "avg" && value !== "-no data-"){
            let S = (value * 1.60934).toFixed(1)
            modArr.push(S)
        }
        else {modArr.push(value)}
    })}

    let inchTransform = (origArr, modArr) => {/// ///transforms to metric system (cm + mm)
         origArr.forEach(value => {
        if (value !== "avg" && value !== "-no data-"){
            let S = ((value * 2.54) * 10).toFixed(1)
            modArr.push(S)
        }
        else {modArr.push(value)}
    })}

    ///Sets up the direction of the wind arrow
    function arrowing (arrow) {

   if (arrow > 1 && arrow <= 20){
    arrowArr.push("eszak")
    windDirTextArr.push("North")
}

  else if (arrow > 20 && arrow <= 69){
    arrowArr.push("eszakkelet")
    windDirTextArr.push("Northeast")
  }

  else if (arrow > 69 && arrow <= 110){
    arrowArr.push("kelet")
    windDirTextArr.push("East")
  }
  
  else if (arrow > 110 && arrow <= 159){
    arrowArr.push("delkelet")
    windDirTextArr.push("Southeast")
  }
   else if (arrow > 159 && arrow <= 200){
    arrowArr.push("del")
    windDirTextArr.push("South")
   }

  else if (arrow > 200 && arrow <= 249){
    arrowArr.push("delnyugat")
    windDirTextArr.push("Southwest")
  }

  else if (arrow > 249 && arrow <= 290){
    arrowArr.push("nyugat")
    windDirTextArr.push("West") 
  }

  else if (arrow > 290 && arrow <= 339){
    arrowArr.push("eszaknyugat")
    windDirTextArr.push("Northwest") 
  }
  
  else if (arrow > 339 && arrow <= 360){
    arrowArr.push("eszak")
    windDirTextArr.push("North") 
  }

  else if (arrow > 360 && arrow <= 360){
    arrowArr.push("unknown")
    windDirTextArr.push("unknown")
  }

  else {
    arrowArr.push("nowind")
    windDirTextArr.push("no wind")
    }
  }

   let rawTemperatureNow = resp2.data.days[0].hours[now].temp
   let humidityNow = resp2.data.days[0].hours[now].humidity
   console.log("humidity is: " + humidityNow)
   let pressureNow = Math.floor(resp2.data.days[0].hours[now].pressure)
   console.log("pressure is: " + pressureNow)
   let precipRawNow = resp2.data.days[0].hours[now].precip
   let precipDailyRawNow = resp2.data.days[0].precip
   let precipDailyNow = ((precipDailyRawNow * 2.54) * 10).toFixed(1)///converts inches to mm
   let precipDailyCmNow = precipDailyNow * 2.54 ///cm
   let cloudcoverNow = resp2.data.days[0].hours[now].cloudcover
   let visibilityRawNow = resp2.data.days[0].hours[now].visibility
   let visibilityNow = ""
   let solarEnergyNow = resp2.data.days[0].hours[now].solarenergy
   let solarRadiationNow = resp2.data.days[0].hours[now].solarradiation
   let UVindexNow = resp2.data.days[0].hours[now].uvindex
   let windRawNow = resp2.data.days[0].hours[now].windspeed
   let windNow = 0
   let windGustRawNow = resp2.data.days[0].hours[now].windgust
   let windGustNow = 0
   let arrowDirNow = ""
   let dirTextNow = ""
   let hours = JSON.stringify(resp2.data.days[0].hours)
   let hoursReal = JSON.parse(hours)
   let windDirectionNow = resp2.data.days[0].hours[now].winddir
   ///console.log("winddirection is :" + windDirectionNow) /// 1-20 Észak, 21-69 Északkelet, 70-110 Kelet, 111-159 Délkelet, 160-200 Dél, 201-249 Délnyugat, 250-290 Nyugat, 291-339 Északnyugat, 340-360 Észak
   
   let coverNow = resp2.data.days[0].hours[now].cloudcover
   let dailyRainCover = resp2.data.days[0].precipcover
   let whichPrecipNow = ""
   let coverOfCloudsNow = ""

   const fogRawNow = (resp2.data.days[0].hours[now].visibility)
   const fogNow = fogRawNow*1.609344
   const snowRawNow = resp2.data.days[0].hours[now].snow
   const snowBigNow = snowRawNow * 2.54
   const snowNow = snowBigNow.toFixed(1)
   let snowDailyRawNow = resp2.data.days[0].snow
   const snowBigDailyNow = snowDailyRawNow * 2.54
   let snowDailyNow = snowBigDailyNow.toFixed(1)
   let snowDepthRawNow = resp2.data.days[0].hours[now].snowdepth
   let snowDepthBigNow = snowDepthRawNow * 2.54
   let snowDepthNow = snowDepthBigNow.toFixed(1)
   let conditionsNow = resp2.data.days[0].hours[now].conditions
   const iconNow = resp2.data.days[0].hours[now].icon
   const moonPhase = resp2.data.days[0].moonphase
   const descNow = resp2.data.days[0].description
   const sunRise = resp2.data.days[0].sunrise
   const sunSet = resp2.data.days[0].sunset
   let stations = 0

   if (resp2.data.days[0].stations){
   stations = resp2.data.days[0].stations.length}
   let thunder = ""

     let tempFeelsRawNow = resp2.data.days[0].hours[now].feelslike
     let tempFeelsNow = 0

   
    if ((tempFeelsRawNow-32/1.8) < 0.5 && (tempFeelsRawNow-32/1.8) > -0.5){
                tempFeelsNow = "0"
    }
   else {tempFeelsNow = Math.round((tempFeelsRawNow-32) / 1.8)}
  

   let dewRawNow = resp2.data.days[0].hours[now].dew
   dewRawNow = switchCard(rawTemperatureNow, dewRawNow, resp2.data.days[0].dew, "dew")
   let dewNow = 0


   if (dewRawNow !== "-no data-"){
      if ((dewRawNow-32/1.8) < 0.5 && (dewRawNow-32/1.8) > -0.5){
                dewNow = "0"
    }
   else {dewNow = Math.round((dewRawNow-32) / 1.8)}
}

else {dewNow = "-no data-"}
  

let hourlyRain = (resp2.data.days[0].hours[now].precip)*25.4
let dayOrnightNow = ""
let moonNow = "0"
let moonStatus = ""
let newRainArrayRelevant = true
let mainDat = true
let iconToGive = ""
let iconReady = ""
let backgroundToGive = ""
let background = ""


    let dailyAvgTempRaw = resp2.data.days[0].temp

    let dailyAvgTemp = (dailyAvgTempRaw - 32) /1.8
        dailyAvgTemp === 0 ? dailyAvgTemp = "0" : null
    

   let tempMaxRaw = resp2.data.days[0].tempmax
   let tempMaxDigit = 0
   let tempMax = 0

   let tempMinRaw = resp2.data.days[0].tempmin
   let tempMinDigit = 0
   let tempMin = 0

   if (resp2.data.days[0].tempmax == null){
        tempMax = "-no data-"}
    else {tempMaxDigit = (tempMaxRaw-32) / 1.8
        tempMax = Math.round(tempMaxDigit)}

    if (resp2.data.days[0].tempmin == null){
        tempMin = "-no data-"}
    else {tempMinDigit = (tempMinRaw-32) / 1.8
        tempMin = Math.round(tempMinDigit)}

   ///setting up hour arrays
   let rawTempArr = []
   let tempArr = []
   let feelsRawArr = []
   let feelsArr = []  
   let humArr = []
   let presArr = []
   let precRawArr = []
   let precArr = []
   let whichPrecArr = []
   let snowRawArr = []
   let snowArr = []
   let snowDepthRawArr = []
   let snowDepthArr = []
   let windRawArr = []
   let windArr = []
   let windDirTextArr = []
   let arrowArr = []
   let windgustRawArr = []
   let windgustArr = []
   let dewRawArr = []
   let dewArr = []
   let condArr = []
   let visRawArr = []
   let visArr = []
   let cloudArr = []
   let uvArr = []
   let solErArr = []
   let solArr = []
   let iconArr = []
   let backgroundArr = []

     hoursReal.forEach(hour => {

    hourChecker(hour.temp, resp2.data.days[0].temp, rawTempArr)
    hourChecker(hour.feelslike, resp2.data.days[0].feelslike, feelsRawArr)
    hourChecker(hour.humidity, resp2.data.days[0].humidity, humArr)
    hourChecker(hour.pressure, resp2.data.days[0].pressure, presArr)
    hourChecker(hour.windspeed, resp2.data.days[0].windspeed, windRawArr)
    hourChecker(hour.windgust, resp2.data.days[0].windgust, windgustRawArr)
    hourChecker(hour.dew, resp2.data.days[0].dew, dewRawArr)
    hourChecker(hour.conditions, resp2.data.days[0].conditions, condArr)
    hourChecker(hour.visibility, resp2.data.days[0].visibility, visRawArr)
    hourChecker(hour.cloudcover, resp2.data.days[0].cloudcover, cloudArr)
    hourChecker(hour.uvindex, resp2.data.days[0].uvindex, uvArr)
    hourChecker(hour.solarenergy, resp2.data.days[0].solarenergy, solErArr)
    hourChecker(hour.solarradiation, resp2.data.days[0].solarradiation, solArr)
    hourChecker(hour.snow, resp2.data.days[0].solarradiation, snowRawArr)
    hourChecker(hour.snowdepth, resp2.data.days[0].snowdepth, snowDepthRawArr)
   });

    
///celstemp + speed
celsTransform(rawTempArr, tempArr)
celsTransform(feelsRawArr, feelsArr)
celsTransform(dewRawArr, dewArr)
speedTransform(windRawArr, windArr)
speedTransform(windgustRawArr, windgustArr)
speedTransform(visRawArr, visArr)

 
    snowRawArr.forEach(value => {
        if (value !== "avg" && value !== "-no data-"){
            let C = value * 2.54
            snowArr.push((C).toFixed(1))
        }
        else {snowArr.push(value)}
    })
///console.log("SNOWDEPTHRAWARR" + snowDepthRawArr)
///console.log("SNOWARR" + snowArr)
     snowDepthRawArr.forEach(value => {
        if (value !== "avg" && value !== "-no data-"){
            let C = value * 2.54
            snowDepthArr.push(C.toFixed(1))
        }
        else {snowDepthArr.push(value)}
    })

hoursReal.forEach(hour => {
    arrowing(hour.winddir)
});

 /*console.log("ÓRAÉRTÉKEK: " + rawTempArr)
 console.log("CELSIUS ÓRAÉRTÉKEK:" + tempArr)
 console.log("IRÁNYOK: " + arrowArr)
 console.log("IRÁNYSZÖVEGEK: " + windDirTextArr)
 console.log("VISIBILITY : " + visRawArr)*/


let sunRiseEpoch = resp2.data.days[0].sunriseEpoch
let sunSetEpoch = resp2.data.days[0].sunsetEpoch

///Sometimes rain is not distributed in a realistic way by the API's servers, instead it accumumulates the total daily rain as one specific hour's data. To this I set up a calculator, to pull it closer to reality.

let newRainArray = []
let thunderArray = []
let thunderCounter = 0
let counter2 = false


   let celsTempNow = tempArr[now]
   celsTempNow == "avg" ? celsTempNow = Math.round((resp2.data.days[0].temp - 32) / 1.8) : null
   celsTempNow < 0.5 && celsTempNow > -0.5 ? celsTempNow = "0" : null

   
   let precipNow = ((precipRawNow * 2.54) * 10).toFixed(1)
   let precipCm = ""

   ///console.log(hours)

     if (snowDailyRawNow == null){
        snowDailyRawNow = "-no data-"
        snowDailyNow = "-no data-"
    }

   
///fill up new arrays
for (let i = 0 ; i < 24; i++){
   newRainArray.push("nothing")
}

for (let i = 0 ; i < 24; i++){
    thunderArray.push("nothing")
 }


hoursReal.forEach(hour => {
     hourChecker(hour.precip, resp2.data.days[0].precip, precRawArr)
});

inchTransform(precRawArr, precArr)


dailyRainCover >= 25 || dailyRainCover == 0 ? newRainArrayRelevant = false : null

    let totalTemp = 0
    let avgTemp = 0
 for (let i = 10; i < 19; i++) {///napi átlaghőmérséklet
    Math.round(totalTemp += tempArr[i] * 10)
    console.log(totalTemp)
 }
 avgTemp = (totalTemp/10)/9

 ///condition
 if (dailyRainCover < 25 && (resp2.data.days[0].precip)*25.4 > 3){
    precipNow = "-no data-"

///During the warmest hours was there significant and sudden cooldown in weather (can refer to storm)
 for (let i = 10; i < 19; i++) {
    if (avgTemp > 13) {
   if (avgTemp - tempArr[i] > 4){
    thunderArray[i] = "thunder"
    thunderCounter++
    if ((resp2.data.days[0].precip)*25.4 < 5 && (resp2.data.days[0].precip)*25.4 > 1){
        newRainArray[i] = "moderaterain"
    }
    else if ((resp2.data.days[0].precip)*25.4 < 1) {
        newRainArray[i] = "smallrain" 
    }
    else {
        newRainArray[i] = "heavyrain" 
    }}
}}

let counter = 0
for (let i = 0; i < 24; i++) {
if (precArr[i] == 0.0) {
    counter++
}
else if (precArr[i] > 0) {

    for (let y = i ; y > i - counter + (Math.floor(Math.random() * counter-1)); y--){

       if (precArr[i] >= 10) {
        newRainArray[y] = "heavyrain"
       }

       else if (precArr[i] >= 5 && precArr[i] < 10) {
        newRainArray[y] = "moderaterain"
       }

       else if (precArr[i] >= 0 && precArr[i] < 5) {
        newRainArray[y] = "smallrain"
       }
    }
    counter = 0
}}
}

///condition
else if (dailyRainCover < 25 && (resp2.data.days[0].precip)*25.4 <= 3 && (resp2.data.days[0].precip)*25.4 > 0){
    precipNow = "-no data-"


///During the warmest hours was there significant and sudden cooldown in weather (can refer to storm)
 for (let i = 10; i < 19; i++) {
    if (avgTemp > 13) {
   if (avgTemp - tempArr[i] > 4){
    thunderArray[i] = "thunder"
    thunderCounter++
    counter2 = true
    newRainArray[i] = "moderaterain" 
}}}

let counter = 0
for (let i = 0; i < 24; i++) {
if (precArr[i] === 0) {
    counter++
}
else if (precArr[i] > 0) {

    for (let y = i ; y > i - counter + (Math.floor(Math.random() * counter-1)); y--){
    
       if (precArr[i] >= 5 && precArr[i] < 10) {
        newRainArray[y] = "moderaterain"
       }
    
       else if (precArr[i] >= 0 && precArr[i] < 5) {
        newRainArray[y] = "smallrain"
       }
    }
    counter = 0
}    
}
   }

if (resp2.data.days[0].precip < 0.03 && resp2.data.days[0].precip > 0 && resp2.data.days[0].hours[now].precipprob === 100){}

else {
if (counter2 == false && (resp2.data.days[0].precip)*25.4 > 0) {
   let counter = 0
   for (let i = 0; i < 24; i++) {
   if (precArr[i] === 0) {
       counter++
   }

   else if (precArr[i] > 0) {
   
       for (let y = i ; y > i - counter + (Math.floor(Math.random() * counter-1)); y--) {
          if (precArr[i] <= 3 && precArr[i] >= 1) {
           newRainArray[y] = "moderaterain"
          }
          else if (precArr[i] < 1) {
           newRainArray[y] = "smallrain"
          }
       }
       counter = 0
    }
 }
}
}

///storm counter
if (parseInt(snowDailyNow) <= 0 || parseInt(celsTempNow) >= 1){
let yr2013start = 1356994800
let yr2024start = 1704063600
let leapYearCounter = 2013
let yearmonthCounter = 1356994800
let monthlyThunderHours = 0
let leapYearAmount = 0
if (unixTime >= yr2013start && unixTime < yr2024start){
    for (let i = 0; i < years.length; i++){
        for (let y = 0; y < 12; y++){

            if (y === 1){///leap, or not leap year
                leapYearCounter === 2016 || leapYearCounter === 2020 ? leapYearAmount = 2505600 : leapYearAmount = 2419200
            
                if (unixTime >= yearmonthCounter && unixTime < (yearmonthCounter + leapYearAmount)){
                    for (let z = 0; z < years[i][y].length; z++) {
                        if (latitude < years[i][y][z].latstart && latitude > years[i][y][z].latend && longitude > years[i][y][z].longstart && longitude < years[i][y][z].longend){
                            monthlyThunderHours = years[i][y][z].thunderhours
                    }   
                }}
                else {    
                    yearmonthCounter += leapYearAmount
                    }}
            
            else if (y === 3 || y === 5 || y === 8 || y === 10){ /// 30 days months
                if (unixTime >= yearmonthCounter && unixTime < (yearmonthCounter + 2592000)){
                    for (let z = 0; z < years[i][y].length; z++) {
                        if (latitude < years[i][y][z].latstart && latitude > years[i][y][z].latend && longitude > years[i][y][z].longstart && longitude < years[i][y][z].longend){
                    }   
                }}            
                else {  
                yearmonthCounter += 2592000
                }

            }
            else { /// 31 days months
                if (unixTime >= yearmonthCounter && unixTime < (yearmonthCounter + 2678400)){
                    for (let z = 0; z < years[i][y].length; z++) {
                        if (latitude < years[i][y][z].latstart && latitude > years[i][y][z].latend && longitude > years[i][y][z].longstart && longitude < years[i][y][z].longend){
                                monthlyThunderHours = years[i][y][z].thunderhours
                        }   
                    }
                }

                else {    
                yearmonthCounter += 2678400
                }
            }
        }
        leapYearCounter += 1
    }   
}

let toBeGivenThunder = monthlyThunderHours - thunderCounter
let totalWind = 0
let avgWind = 0
for (let i = 0; i < 24; i++) {///daily average wind
Math.round(totalWind += windArr[i] * 10)
}
avgWind = (totalWind/10)/24

for (let i = 0; i < 24; i++) {///If there was significantly stronger wind than daily average (refers to storm)
    if (avgWind - windArr[i] < -15 && resp2.data.days[0].hours[i].cloudcover > 60 && toBeGivenThunder > 0){
     thunderArray[i] = "thunder"
     toBeGivenThunder--
    }  
    else if (avgWind - windArr[i] < -15 && resp2.data.days[0].hours[i].cloudcover > 80 && toBeGivenThunder === 0){
        thunderArray[i] = "thunder"
       }  
 }

 if (thunderArray[now] === "thunder"){
    thunder = "1" ///there is thunder
 }

 else {
    thunder = "0" ///no thunder
 }
}

///moon phase
if (moonPhase >= 0 && moonPhase < 0.03 || moonPhase === 0.99){
    dayOrnightNow === "2" ? moonNow = "1" : moonNow = "0"///new moon
    moonStatus = "New Moon"
}
else if (moonPhase >= 0.03 && moonPhase <= 0.23){
    dayOrnightNow === "2" ? moonNow = "2" : moonNow = "0"///waxing crescent
    moonStatus = "Waxing Crescent"
}
else if (moonPhase > 0.23 && moonPhase < 0.27){
    dayOrnightNow === "2" ? moonNow = "3" : moonNow = "0"///first quarter
    moonStatus = "First Quarter"
}
else if (moonPhase >= 0.27 && moonPhase <= 0.47){
    dayOrnightNow === "2" ? moonNow = "4" : moonNow = "0"///waxing
    moonStatus = "Waxing Gibbous"
}
else if (moonPhase > 0.47 && moonPhase < 0.53){
    dayOrnightNow === "2" ? moonNow = "5" : moonNow = "0"///full moon
     moonStatus = "Full Moon"
}
else if (moonPhase >= 0.53 && moonPhase <= 0.73){
    dayOrnightNow === "2" ? moonNow = "6" : moonNow = "0"///waning gibbous
    moonStatus = "Waning Gibbous"
}
else if (moonPhase > 0.73 && moonPhase < 0.77){
    dayOrnightNow === "2" ? moonNow = "7" : moonNow = "0"///last quarter
    moonStatus = "Last Quarter" 
}
else if (moonPhase >= 0.77 && moonPhase < 0.99){
    dayOrnightNow === "2" ? moonNow = "8" : moonNow = "0"///waning crescent
    moonStatus = "Waning Crescent"
}

  ///rain-> 4: snowrain  5: smallsnow  6: heavysnow

if (parseInt(coverOfCloudsNow) == 5){
moonNow = "0"
}

let snowCoverNow = ""

parseInt(snowDepthNow) > 0.5 ? snowCoverNow = "1" : snowCoverNow = "0"

let climate = ""
let season = "0" ///no season counted

if (latitude > 57) {
    climate = "1" ///tundra
    if (snowCoverNow === "0"){ ///évszak
        if (resp2.data.days[0].datetime.charAt(6) == "9" || resp2.data.days[0].datetime.charAt(5) == "1" && resp2.data.days[0].datetime.charAt(6) == "0" || resp2.data.days[0].datetime.charAt(5) == "1" && resp2.data.days[0].datetime.charAt(6) == "1"){
            season = "3" /// fall
        }

        else if (resp2.data.days[0].datetime.charAt(6) == "1" || resp2.data.days[0].datetime.charAt(6) == "2" || resp2.data.days[0].datetime.charAt(5) == "1" && resp2.data.days[0].datetime.charAt(6) == "2"){
        season = "1" ///winter
        }
        else {
            season = "2" ///spring+summer
        }
        }
}

else if (longitude >= -11 && longitude <= 55 && latitude <= 60 && latitude >= 42 || longitude >= -125 && longitude <= -52 && latitude <= 60 && latitude >= 28 || longitude >= -80 && longitude < -38 && latitude <= -14 && latitude >= -80 || longitude >= 55 && longitude <= 175 && latitude <= 60 && latitude >= 50 || longitude >= 119.1 && longitude <= 166 && latitude <= 50 && latitude >= 30 || longitude >= 92 && longitude <= 123 && latitude <= 53 && latitude >= 19 || longitude >= 150 && longitude <= 154 && latitude <= -22 && latitude >= -34 || longitude >= 164  && longitude <= 179 && latitude <= -32 && latitude >= -47 || longitude > 148 && longitude < 153 && latitude > -43 && latitude < -26 || longitude > 144 && longitude < 150 && latitude > -43 && latitude < -36 || longitude > 114 && longitude < 118 && latitude > -35 && latitude < -31){
climate = "2" ///kontinentális
}

else if (longitude > -11 && longitude < 55 && latitude < 42 && latitude > 34 || longitude < -61 && longitude > -120 && latitude < 31 && latitude > 14 || longitude > -115 && longitude < -95 && latitude > 17 && latitude < 28){
    climate = "3" ///mediterrán
}


else if (longitude > -124 && longitude < -96 && latitude < 60 && latitude > 18 || longitude > -70 && longitude < -66 && latitude >= -26 && latitude <= -28 || longitude > 44 && longitude < 47 && latitude < 12 && latitude > 9 || longitude > 48 && longitude < 86 && latitude < 52 && latitude > 37){
climate = "4" ///félsivatag
}
else if (longitude > -70 && longitude < -64 && latitude < -17 && latitude > -26 || longitude > -11 && longitude < 60 && latitude < 34 && latitude > 11 || longitude > 55 && longitude < 119 && latitude < 50 && latitude > 42 ||  longitude > 55 && longitude < 113 && latitude < 42 && latitude > 37 || longitude > 55 && longitude < 107 && latitude < 37 && latitude > 35 || longitude > 55 && longitude < 101 && latitude <= 35 && latitude > 29 || longitude > 111 && longitude < 149 && latitude <= -11 && latitude >= -34 || longitude > 43 && longitude < 50 && latitude < 10 && latitude > 7 || latitude > -4 && latitude < 19 && longitude > 39 && longitude < 55){
climate = "5" ///sivatag
}
else if (longitude > -16 && longitude < 42 && latitude < 15 && latitude > 5 || longitude > 12 && longitude < 50 && latitude < -6 && latitude > -34 || longitude > 143 && longitude < 151 && latitude < -34 && latitude > -44 || longitude > 30 && longitude < 45 && latitude < 3.56 && latitude > -8){
climate = "6"///szavanna
if (longitude < 13 && longitude > 23 && latitude < -22 && latitude > -32){
    climate = "5" ///sivatag 
}}

else if (longitude < -31 && longitude > -95 && latitude < 15 && latitude > -15 || longitude < 35 && longitude > 4 && latitude < 7 && latitude > -6 || longitude < 97 && longitude > 92 && latitude < 27 && latitude > 18 || longitude < 158 && longitude > 93 && latitude < 19 && latitude > -12) {
climate ="7" ///esőerdő

 if (longitude >= -94 && longitude <= -79 && latitude <= -4 && latitude >= -6 || longitude >= -81 && longitude <= -78 && latitude <= -6 && latitude >= -9 || longitude >= -81 && longitude <= -76 && latitude <= -9 && latitude >= -12.5 || longitude >= -81 && longitude <= -74 && latitude <= -9 && latitude >= -13 ||longitude >= -76 && longitude <= -71 && latitude <= -9 && latitude >= -15 || longitude >= -73 && longitude <= -68 && latitude <= -10 && latitude >= -15 || longitude >= -70 && longitude <= -64 && latitude <= -17 && latitude >= -26 || longitude >= -70  && longitude <= -66 && latitude <= -26 && latitude >= -28){
climate = "5" ///sivatag
 }
}
else if (longitude > 70 && longitude < 75 && latitude < 33 && latitude > 27 || longitude > 65 && longitude < 93 && latitude < 34 && latitude > 6){
   climate = "8"  ///india
}


if (JSON.parse(pop) > 350000 && climate == "2"){
    climate = "9" ///város
}

if (newRainArrayRelevant == true){
   for (let i = 0; i < 24; i++) {
precArr[i] = "-no data-"}
}

   let celsTempFunc = ""
   let precipRawFunc = ""
   let precipFunc = ""
   let precipCmFunc = ""
   let dailyPrecFunc = ""
   let coverFunc = ""
   let dailyRainCoverFunc = ""
   let whichPrecipFunc = ""
   let precipProbFunc = ""
   let precipTypeFunc = ""
   let newRainArrayFunc = ""
   let newRainArrayRelevantFunc = ""
   let hourlyRainFunc = ""
   let fogRawFunc = ""
   let fogFunc = ""
   let snowRawFunc = ""
   let snowBigFunc = ""
   let snowFunc = ""
   let snowDepthRawFunc = ""
   let snowDepthRawPlusFunc = ""
   let snowDepthBigFunc = ""
   let snowDepthFunc = ""
   let moonphaseFunc = ""
   let climateFunc = ""
   let seasonFunc = ""
   let givenDateFunc = ""
   let dateTimeFunc = ""
   let sunRiseEpochFunc = ""
   let sunsetEpochFunc = ""
   let whichPrecArrFunc = ""
   let latitudeFunc = ""
   let longitudeFunc = ""
   let thunderArrFunc = ""
   let dailyMaxFunc = ""
   let avgTempFunc = ""
   let popFunc = ""

   let current = ""

   
for (let i = 0; i < 24; i++) {
     if (resp2.data.days[0].hours[timeIndex+1]?.datetime !== undefined){
    celsTempFunc = tempArr[timeIndex]
    precipRawFunc = resp2.data.days[0].hours[timeIndex].precip
    precipFunc = ((precipRawFunc * 2.54) * 10).toFixed(1)
    precipCmFunc = (precipFunc / 10).toFixed(1)
    dailyPrecFunc = resp2.data.days[0].precip
    coverFunc = resp2.data.days[0].hours[timeIndex].cloudcover
    dailyRainCoverFunc = resp2.data.days[0].precipcover
    whichPrecArrFunc = whichPrecArr
    precipProbFunc = resp2.data.days[0].hours[timeIndex].precipprob
    precipTypeFunc = resp2.data.days[0].hours[timeIndex].preciptype
    newRainArrayFunc = newRainArray
    newRainArrayRelevantFunc = newRainArrayRelevant
    hourlyRainFunc = precArr[timeIndex]
    fogRawFunc = (resp2.data.days[0].hours[timeIndex].visibility)
    fogFunc = fogRawFunc*1.609344
    snowRawFunc = resp2.data.days[0].hours[timeIndex].snow
    snowBigFunc = snowRawFunc * 2.54
    snowFunc = snowBigFunc.toFixed(1)
    snowDepthRawFunc = resp2.data.days[0].hours[timeIndex].snowdepth
   
    timeIndex > 22 ? null : snowDepthRawPlusFunc = resp2.data.days[0].hours[timeIndex+1].snowdepth
    
    snowDepthBigFunc = snowDepthRawFunc * 2.54
    snowDepthFunc = snowDepthBigFunc
    moonphaseFunc = resp2.data.days[0].moonphase
    climateFunc = climate
    seasonFunc = season
    givenDateFunc = resp2.data.days[0].hours[timeIndex].datetimeEpoch
    dateTimeFunc = resp2.data.days[0].datetime
    sunRiseEpochFunc = sunRiseEpoch
    sunsetEpochFunc = sunSetEpoch
    latitudeFunc = match.lat
    longitudeFunc = match.lng
    thunderArrFunc = thunderArray
    dailyMaxFunc = tempMax
    avgTempFunc = dailyAvgTemp
    popFunc = JSON.parse(pop)
    let current = ""
     }

     ///call external function 24 times to set all hours' data
const {background, icon, whichprec} = arranger(celsTempFunc, dailyPrecFunc, precipFunc, precipCmFunc, coverFunc, dailyRainCoverFunc, whichPrecArrFunc, whichPrecipFunc, precipProbFunc, precipTypeFunc, newRainArrayFunc, newRainArrayRelevant, hourlyRainFunc, fogFunc, snowFunc, snowDepthFunc, snowDepthRawFunc, snowDepthRawPlusFunc, thunderArrFunc, moonphaseFunc, climateFunc, seasonFunc, sunRiseEpochFunc, sunsetEpochFunc, latitudeFunc, longitudeFunc, givenDateFunc, dateTimeFunc, timeIndex, iconArr, backgroundArr, dailyMaxFunc, avgTempFunc, popFunc)

backgroundArr[timeIndex] = background
iconArr[timeIndex] = icon
whichPrecArr[timeIndex] = whichprec
timeIndex++ 
}
    

timeIndex = 0


pressureNow = switchCard(rawTemperatureNow, pressureNow, resp2.data.days[0].pressure, "pressure")
pressureNow = presArr[now]
pressureNow == "avg" ? pressureNow = resp2.data.days[0].pressure : null
resp2.data.days[0].pressure == null ? pressureNow = "-no data-" : null

humidityNow = switchCard(rawTemperatureNow, humidityNow, resp2.data.days[0].humidity, "humidity")
windDirectionNow = switchCard(rawTemperatureNow, windDirectionNow, resp2.data.days[0].winddir, "winddir")
snowDepthRawNow = switchCard(rawTemperatureNow, snowDepthRawNow, resp2.data.days[0].snowdepth, "snowdepth")
solarEnergyNow = switchCard(rawTemperatureNow, solarEnergyNow, resp2.data.days[0].solarenergy, "solarenergy")
solarRadiationNow = switchCard(rawTemperatureNow, solarRadiationNow, resp2.data.days[0].solarradiation, "solarradiation")
UVindexNow = switchCard(rawTemperatureNow, UVindexNow, resp2.data.days[0].uvindex, "uvindex")

 
///edge cases
   if(rawTemperatureNow == null || precipRawNow == null){ 
   precipRawNow = switchtoAvg(precipRawNow, "-no data-")}

   if(rawTemperatureNow == null || cloudcoverNow == null){ 
   if (resp2.data.days[0].cloudcover !== null){
   cloudcoverNow = switchtoAvg(cloudcoverNow, resp2.data.days[0].cloudcover)
   coverNow = switchtoAvg(coverNow, resp2.data.days[0].cloudcover)}
   else{
   cloudcoverNow = switchtoAvg(cloudcoverNow, "-no data-")
   coverNow = switchtoAvg(cloudcoverNow, "-no data-")}
    }

   if(rawTemperatureNow == null || conditionsNow == ""){ 
   if (resp2.data.days[0].conditions !== ""){
   conditionsNow = switchtoAvg(conditionsNow, resp2.data.days[0].conditions)}
   else{
   conditionsNow = switchtoAvg(conditionsNow, "-no data-")}
    }

if (rawTemperatureNow == null){

   if (resp2.data.days[0].temp !== null){
   rawTemperatureNow = switchtoAvg(rawTemperatureNow, resp2.data.days[0].temp)}
   else {
   rawTemperatureNow = switchtoAvg(rawTemperatureNow, "-no data-")}
    }

iconToGive = iconArr[now]
 ///iconToGive = dayOrnightNow + coverOfCloudsNow + rain + thunder + isFog + moon
console.log(iconToGive)
 iconReady = `url('./images/icons/${iconToGive}.gif')`

 
///now-ra switcher
whichPrecipNow = whichPrecArr[now]
windNow = windArr[now]
if (windNow === "avg"){
    windNow= switchtoAvg(windNow, resp2.data.days[0].windspeed)
}
windGustNow = windgustArr[now]
if (windGustNow === "avg"){
    windGustNow = switchtoAvg(windGustNow, resp2.data.days[0].windgust)
}
visibilityNow = visArr[now]
if (visibilityNow === "avg"){
    visibilityNow = switchtoAvg(visibilityNow, resp2.data.days[0].visibility)
}
coverOfCloudsNow = cloudArr[now]
if (coverOfCloudsNow === "avg"){
    coverOfCloudsNow = switchtoAvg(coverOfCloudsNow, resp2.data.days[0].cloudcover)
}
tempFeelsNow = feelsArr[now]
if (tempFeelsNow == "avg"){
    let tempFeelsNowR = switchtoAvg(tempFeelsNow, resp2.data.days[0].feelslike)
    tempFeelsNow = Math.round((tempFeelsNowR - 32) / 1.8)
}
arrowDirNow = arrowArr[now]
dirTextNow = windDirTextArr[now]


/*console.log("BACKGROUND ARR IS: " + backgroundArr)
console.log("ICON ARR IS: " + iconArr)*/
backgroundToGive = backgroundArr[now]
///console.log("background is:" + backgroundToGive)
background = `url('./images/themes/${backgroundToGive}.gif')`

now == 0 ? now = "0" : null
now == 0 ? strictLeft = true : null
now == 23 ? strictRight = true : null


res.render("index.ejs", {temp: celsTempNow,
                         hum: humidityNow,
                         pres: pressureNow,
                         wind: windNow,
                         winddir: windDirectionNow,
                         windgust: windGustNow,
                         arrow: arrowDirNow,
                         dirtext: dirTextNow,
                         cloudcover: cloudcoverNow,
                         visibility: visibilityNow,
                         solarenergy: solarEnergyNow,
                         solarradiation: solarRadiationNow,
                         uvindex: UVindexNow,
                         cond: conditionsNow,
                         snow: snowNow,
                         dailysnow: snowDailyNow,
                         depth: snowDepthNow,
                         prec: precipNow,
                         dailyprec: precipDailyNow,
                         dailypreccm: precipDailyCmNow,
                         moon: moonStatus,
                         sunrise: sunRise,
                         sunset: sunSet,
                         stations: stations,
                         snowOrrain: whichPrecipNow,
                         whichPrecArray: whichPrecArr,
                         reqCit: requestedCity,
                         reqCount: requestedCountry,
                         reqCount2: ToBeModifiedName,
                         reqLat: latitude,
                         reqLon: longitude,
                         reqDate: requestedDate,
                         reqTime: requestedTime,
                         tempMax: tempMax,
                         tempMin: tempMin,
                         tempFeels: tempFeelsNow,
                         dew: dewNow,
                         tempArray: tempArr,
                         feelsArray: feelsArr,
                         humArray: humArr,
                         presArray: presArr,
                         windArray: windArr,
                         windDirTextArray: windDirTextArr,
                         arrowArray: arrowArr,
                         windGustArray: windgustArr,
                         precipArray: precArr,
                         snowArray: snowArr,
                         snowDepthArray: snowDepthArr,
                         dewArray: dewArr,
                         visArray: visArr,
                         cloudArray: cloudArr,
                         uvArray: uvArr,
                         solArray: solArr,
                         solErArray: solErArr,
                         condArray: condArr,
                         currentTime: now,
                         backgroundArray: backgroundArr,
                         iconArray: iconArr,
                         newRainArrayRelevant: newRainArrayRelevant,
                         isStrictLeft: strictLeft,
                         isStrictRight: strictRight,
                         lastDay: lastDay,
                         firstDay: firstDay                     
})

req.body.city = ""
req.body.country = ""

}

    else {/*possible later scalability*/}
        })

app.listen(PORT, () =>
console.log(`Server is listening on port ${PORT}. Open this link in your browser:  http://127.0.0.1:${PORT}`))