export function arranger (tmp, dailypr, prec, precm, cov, dailyraincov, whicprarr, whichpr, precippr, precty, newrainar, newrainarre, hourlyra, fg, sn, sndept, sndeptR, sndeptRP, thunAr, moonp, cli, ses, sris, suns, lt,lg, dat, dateti, tmi, icar, bacar, maxTemp, dailyAvg, ppl) {

   ///szél
   /// 1-20 Észak, 21-69 Északkelet, 70-110 Kelet, 111-159 Délkelet, 160-200 Dél, 201-249 Délnyugat, 250-290 Nyugat, 291-339 Északnyugat, 340-360 Észak
   


console.log("NEWRAINARRAYRELEVANT? " + newrainarre)
console.log("NEWRAINARRAY: " + newrainar)
   let cliCurr = cli
   let sesCurr = ses


function coverofclouds(cc) {
if (cov <= 10){
    cc = "1" ///napos   
}
else if(cov > 10 && cov < 31){
    cc = "2" ///enyhén felhős
}
else if(cov >= 31 && cov < 67){
    cc = "3" ///közepesen felhős
}
else if(cov >= 67 && cov < 90){
    cc = "4"  /// erősen felhős
}
else if(cov >= 90){
    cc = "5" ///teljesen felhős
}
return cc }

///ikonok
let dayOrnight = ""
let coverOfClouds = ""
let rain = ""
let thunder = "0"
let counter2 = false

//#1 nap vagy éjszaka
if (dat > sris - 3600 && dat < suns + 3600){
    dayOrnight = "1" ///day
}
else {
    dayOrnight = "2" ///night
}

let whichPrecip = ""



if (parseInt(sn) > 0 || parseInt(tmp) < 1){ ///hó
whichPrecip = "snow"

if (precty === "snow,rain" || parseInt(precippr) > 0 || parseInt(sn) > 0 || prec > 0 || tmi !== 23 && sndeptRP - sndeptR > 0){
    coverOfClouds = "6"
    if (parseInt(tmp) > 0 && parseInt(tmp) < 1){
    rain = "6" ///snowrain
    }

    else if(parseInt(tmp) <= 0){
    

    parseInt(precm) > 1.5 || parseInt(sn > 1.5) ? rain = "8" : rain = "7"
     sndeptRP - sndeptR > 1 ? rain = "8" : rain = "7"
    }

}

else {

rain = "0" ///no rain
coverOfClouds = coverofclouds(coverOfClouds)
}
}

else {///eső

   coverOfClouds = coverofclouds(coverOfClouds)
   hourlyra === 0 ? rain = "0" : null
   hourlyra == "avg" ? rain = "0" : null
   whichPrecip = "rain"
   
    

    if (newrainarre == false){ ///at least 6 hours of 24 measured rain, or no rain
    console.log("New rain array is not relevant.")
      parseInt(hourlyra) === 0 ? rain = "0" : null


    if (hourlyra > 0 && hourlyra <= 0.292) {
        rain = "1" ///light rain
        if (cov < 31){
            coverOfClouds = "3"
        }
    }
    else if (hourlyra > 0.292 && hourlyra <= 2.1){
        rain = "2" ///moderate rain
        if (cov < 67){
            coverOfClouds = "4"
        }
    }
    else if (hourlyra > 2.1){
        rain = "3" ///heavy rain
        coverOfClouds = "5"
    }
}
///itt jön a baj (ha kevesebb a 6nál a mért napi csapadékóra + sok a napi összes csapadék, akkor gyanús hogy nem helyesen elosztva mért az állomás, hanem egy órához beírta az értékek nagy részét)
else if (newrainarre == true){
    if (newrainar[tmi] === "heavyrain"){
        coverOfClouds = "5"///teljesen felhős
        rain = "3"///heavy rain
        cov < 50 ? coverOfClouds = "4" : null
    }

///feltétel
else if (newrainar[tmi] === "moderaterain"){
    coverOfClouds = "5" ///teljesen felhős
    rain = "2" ///moderate rain
    cov < 50 ? coverOfClouds = "4" : null
}

///feltétel
else if (newrainar[tmi] === "smallrain"){
    coverOfClouds = "5" ///teljesen felhős
    rain = "1" ///small rain
    cov < 80 && cov >= 55 ? coverOfClouds = "4" : null
    cov < 55 ? coverOfClouds = "3" : null
}

else if (newrainar[tmi] === "nothing"){
rain = "0"
}

///feltétel
}
}

///#5 köd
let isFog = "0"
/* egyelőre a ködöt hanyagolom
if (fg !== 0 || fg != ""){
fg < 1.7 ? isFog = "1" : isFog = "0"
}*/

///#6 Hold
let moon = "0"
let moonStatus = ""


if (moonp >= 0 && moonp < 0.03 || moonp === 0.99){
    dayOrnight === "2" ? moon = "1" : moon = "0"///new moon
}
else if (moonp >= 0.03 && moonp <= 0.23){
    dayOrnight === "2" ? moon = "2" : moon = "0"///waxing crescent
}
else if (moonp > 0.23 && moonp < 0.27){
    dayOrnight === "2" ? moon = "3" : moon = "0"///first quarter
}
else if (moonp >= 0.27 && moonp <= 0.47){
    dayOrnight === "2" ? moon = "4" : moon = "0"///waxing
}
else if (moonp > 0.47 && moonp < 0.53){
    dayOrnight === "2" ? moon = "5" : moon = "0"///full moon
}
else if (moonp >= 0.53 && moonp <= 0.73){
    dayOrnight === "2" ? moon = "6" : moon = "0"///waning gibbous
}
else if (moonp > 0.73 && moonp < 0.77){
    dayOrnight === "2" ? moon = "7" : moon = "0"///last quarter
}
else if (moonp >= 0.77 && moonp < 0.99){
    dayOrnight === "2" ? moon = "8" : moon = "0"///waning crescent
}

if (parseInt(coverOfClouds) == 5){
moon = "0"
}

  ///rain-> 4: snowrain  5: smallsnow  6: heavysnow


///háttér
let precType = ""
let snowCover = ""
let newCoverOfClouds = ""


parseFloat(sndept) > 0.5 ? snowCover = "1" : snowCover = "0" ///van snow/nincs snow
 

if (cli == "2" || cli == "9"){
if (snowCover == "0"){
if (dateti.charAt(6) == "1" && dateti.charAt(5) !== "1" ||  dateti.charAt(6) == "2"){
    sesCurr = "1" ///tél
    lt < 0 ? sesCurr = "3" : null ///déli félgömb nyár
  
    if (rain !== "0"){
    if (whichPrecip === "snow"){
        precType = "3"
        newCoverOfClouds = "3"
    }
    else if (whichPrecip === "rain"){
        precType = "2"
        newCoverOfClouds = "3"
    }
    }
}
else if (dateti.charAt(6) == "3" || dateti.charAt(6) == "4"  || dateti.charAt(6) == "5"){
    sesCurr = "2" ///tavasz

    dailyAvg <= 9 && dateti.charAt(6) !== "5" ? sesCurr = "1" : null///mégis tél
    lt < 0  && maxTemp >= 21 && dailyAvg > 20 ? sesCurr = "3": null ///déli félgömb nyár
    lt < 0  && maxTemp < 21 && dailyAvg <= 20 ? sesCurr = "4": null ///déli félgömb ősz
}
else if (dateti.charAt(6) == "6" || dateti.charAt(6) == "7" || dateti.charAt(6) == "8"){
sesCurr = "3" ///nyár
    lt < 0 ? sesCurr = "1" : null ///déli félgömb tél
}
else if (dateti.charAt(6) == "9" || dateti.charAt(6) == "0" || dateti.charAt(6) == "1" && dateti.charAt(5) == "1"){
    sesCurr = "4" ///ősz
    maxTemp >= 21 && dailyAvg > 20 && dateti.charAt(6) !== "1" ? sesCurr = "3" : null///mégis nyár
    lt < 0 && maxTemp < 10 && dailyAvg <= 8  ? sesCurr = "1" : null //déli félgömb tél
    lt < 0 && maxTemp >= 10 && dailyAvg > 8  ? sesCurr = "2" : null //déli félgömb tavasz
}
console.log("current season is: " + sesCurr)
}
  lg < -30 && lg > -55 && lt > -24 && lt < -11 ? sesCurr = "3" : null///mindig nyár
}

if (cli == "3"){///mediterrán
    if (parseFloat(sndept) > 0.0 || parseInt(rain) >= 6){
        cliCurr = "0"
    }parseFloat(sndept) > 0.0 ? snowCover = "1" : snowCover = "0" 

     maxTemp < 10 && dailyAvg <= 8 ? sesCurr = "1" : null///mégis tél
    }

    if (parseInt(coverOfClouds) < 3){
        newCoverOfClouds = "1"
    }
    else if (parseInt(coverOfClouds) >= 3 && parseInt(coverOfClouds) < 5){
        newCoverOfClouds = "2"
    }
    else if (parseInt(coverOfClouds) >= 5){
        newCoverOfClouds = "3"
    }


if (parseInt(rain) == 0){
    precType = "0" ///no rain
}
else if (parseInt(rain) > 0 && parseInt(rain) < 3)
{
    precType = "1" ///small rain
    newCoverOfClouds = "3"
}

else if (parseInt(rain) == 3) {
    precType = "2" ///heavyrain
    newCoverOfClouds = "3"
}

else if (parseInt(rain) == 6){
    precType = "3" ///snowrain
    newCoverOfClouds = "3"
}

else if (parseInt(rain) >= 7){
    precType = "4" ///snow
    sesCurr = "0"
    newCoverOfClouds = "3"
}


if (thunAr[tmi] === "thunder"){
    coverOfClouds = "5"
    thunder = "1"
    newCoverOfClouds = "3"
}


if (thunder === "1"){
    moon = "0"
    if (cli != "4" || cli != "5"){
    cliCurr = "0"
    sesCurr = "0"
    let randomPrec = Math.floor(Math.random() * 2)
    precType = randomPrec.toString()
    snowCover = "0"
    newCoverOfClouds = "3"
    isFog = "0"
    thunder = "1"
    }
    else {
        cliCurr = "5"
        sesCurr = "0"
        precType = "2"
        snowCover = "0"
        newCoverOfClouds = "3"
        isFog = "0"
        thunder = "1"
    }
}

dailypr == null ? rain = "0" : null
dailypr == null ? precType = "0" : null
parseInt(rain) > 7 ?  moon = "0" : null

const iconToGive = dayOrnight + coverOfClouds + rain + thunder + isFog + moon
    console.log("currenticon: " + iconToGive)

    console.log("dani:" + dayOrnight)
    console.log("covclo:" + coverOfClouds)
    console.log("rain:" + rain)
    console.log("thunder:" + thunder)
    console.log("fog:" + isFog)
    console.log("moon:" + moon)

    let backgroundToGive = cliCurr + sesCurr + dayOrnight + precType + snowCover + newCoverOfClouds + isFog + thunder

    cliCurr === "3" && parseInt(ppl) > 200000 && backgroundToGive === "30100100" ? backgroundToGive = "100100100" : null
    bacar[tmi] = backgroundToGive
    console.log("currentbackground: " + backgroundToGive)
return {icon: iconToGive,
        background: backgroundToGive,
        whichprec: whichPrecip
}
}