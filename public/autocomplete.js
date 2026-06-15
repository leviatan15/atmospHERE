            /// #1 autocomplete for city input field
            cityInput.addEventListener("input", () => {
            
            firstQuery = false 
            completedValueCity = false

             greenefy == true ? cityInput.style.border = "4px solid red" : null
            
           
            if (cityInput.value == "" && countryInput.value == "") {
              countryInput.value = ""
              document.querySelector(".flagicon").style.backgroundImage = 'none'
              document.querySelector(".flagicon").style.border = 'none'
            }

            while (ul.firstChild) {
              ul.removeChild(ul.firstChild)
            }
            countero = cityInput.value.length
            let firstChar = ""
            let restChars = ""

            if (countero == 1) {
              firstChar = (cityInput.value[0]).toUpperCase()
            }
            else {
              if (cityInput.value[0])
              firstChar = (cityInput.value[0]).toUpperCase()
              restChars = ((cityInput.value).substring(1, countero)).toLowerCase()
            }

            partlyText = firstChar + restChars

            ///console.log(length)
            ///console.log("partyltext is :" + partlyText)

            countero < 3 ? citArr = cities : null

            if (countero >= 3) {

              if (countero == 3) {
                shortenedArray = []
              }

              if (countero > 3) {
                citArr = shortenedArray
              }

              citArr.forEach(element => {
                let matchPart = element.city.substring(0, countero)
                let matchPart2 = element.city_ascii.substring(0, countero)
                ///console.log("matchPart:" + matchPart)
                if (partlyText == matchPart || partlyText == matchPart2) {
                  if (countero == 3) {
                    shortenedArray.push(element)
                  }
                  ///console.log(element.country)
                  mennyi++
                  let newLi = document.createElement("li")
                  let newCont = document.createElement("div")
                  let leftDiv = document.createElement("div")
                  let rightP = document.createElement("p")
                  newCont.setAttribute("class", "boxcont")
                  rightP.setAttribute("class", "boxtext")
                  leftDiv.setAttribute("class", "loccont")
                  ul.appendChild(newCont)
                  newCont.appendChild(leftDiv)
                  newCont.appendChild(rightP)

                  rightP.innerHTML = element.city + ", " + element.country
                  leftDiv.innerHTML = newSVG

                }
              })
              if (document.querySelector(".boxcont")) {
                let box = document.querySelector(".boxcont")

                let boxList = document.querySelectorAll(".boxcont")

                boxList.forEach(element => {
                  element.addEventListener("click", (e) => {
                    completedValueCity = true
                    completedValueCountry = true
                    greenefy == true ? cityInput.style.border = "4px solid #48d945" : null
                    greenefy == true ? countryInput.style.border = "4px solid #48d945" : null
                    document.querySelector(".error").innerHTML = ""
                    while (ul.firstChild) {
                      ul.removeChild(ul.firstChild)
                    }
                    while (ul2.firstChild) {
                      ul2.removeChild(ul2.firstChild)
                    }

                    ///console.log("the target is: " + e.target)
                    let targ = e.target.innerHTML
                    ///console.log(targ)

                    if (event.target.matches(".boxcont")) {
                      targ = event.target.childNodes[1].innerHTML
                    }

                    else if (event.target.matches("svg")) {
                      targ = (event.target.parentNode).nextSibling.innerHTML
                    }

                    else if (event.target.matches(".loccont")) {
                      targ = event.target.nextSibling.innerHTML
                    }

                    else if (event.target.matches("path")) {
                      let ez = event.target.parentNode
                      let az = ez.parentNode
                      let oz = az.parentNode
                      targ = oz.nextSibling.innerHTML
                    }
                    else {
                      while (ul.firstChild) {
                        ul.removeChild(ul.firstChild)
                      }
                    }

                    let spl = targ.split(",")
                    citRes = spl[0]
                    countRes = spl[1].slice(1)
                    cityInput.value = citRes
                    countryInput.value = countRes
                   

                    document.querySelector(".flagicon").style.backgroundImage = `url('./images/flags/${countRes.toLowerCase()}.svg')`
                    countRes == "Nepal" ? null : document.querySelector(".flagicon").style.border = `0.5px solid rgb(170, 168, 168)`
                    

                  })

                })
              };

            }

            ///console.log(mennyi)

          })

          ///#2 autocomplete for country input field
          countryInput.addEventListener("input", () => {

            completedValueCountry = false
            firstQuery = false

            greenefy == true ? countryInput.style.border = "4px solid red" : null
       
            while (ul2.firstChild) {
              ul2.removeChild(ul2.firstChild)
            }
            countero2 = countryInput.value.length

            if (countero2 == 0) {
              document.querySelector(".flagicon").style.backgroundImage = 'none'
              document.querySelector(".flagicon").style.border = "none"
            }

            let firstChar = ""
            let restChars = ""
            let givenText = ""

            if (countero2 == 1) {
              firstChar = (countryInput.value[0]).toUpperCase()
            }
            else {
              if (countryInput.value[0])
                firstChar = (countryInput.value[0]).toUpperCase()
                restChars = ((countryInput.value).substring(1, countero2)).toLowerCase()
            }
            givenText = firstChar + restChars

            let givenTextIf = givenText.toUpperCase()

            givenTextIf === "US" ? givenText = "US" : givenText
            givenTextIf === "USA" ? givenText = "USA" : givenText

            if (countryInput !== ""){
            countArr.forEach(element => {

              let matchPart = element.name.substring(0, countero2)


              ///console.log("giventText is:" + givenText)
              if (givenText == matchPart && givenText.length !== 0) {

                let newContM = document.createElement("div")
                let leftDivM = document.createElement("div")
                let rightPM = document.createElement("p")
                newContM.setAttribute("class", "boxcont")
                rightPM.setAttribute("class", "boxtext")
                leftDivM.setAttribute("class", "flagplace")
                ul2.appendChild(newContM)
                newContM.appendChild(leftDivM)
                newContM.appendChild(rightPM)
                rightPM.innerHTML = element.name

                listCount = document.querySelectorAll(".flagplace").length
                ///console.log(listCount)
                document.querySelectorAll(".flagplace")[listCount - 1].style.backgroundImage = `url('./images/flags/${element.name.toLowerCase()}.svg')`
                element.name == "Nepal" ? leftDivM.style.border = "0px" : null
              }

            })
          }
          
            if (document.querySelector(".boxcont")) {
              let box = document.querySelector(".boxcont")

              let boxList = document.querySelectorAll(".boxcont")

              boxList.forEach(element => {
                element.addEventListener("click", (e) => {
                  completedValueCountry = true
                  greenefy == true ? countryInput.style.border = "4px solid #48d945" : null
                  document.querySelector(".error").innerHTML = ""
                  while (ul2.firstChild) {
                    ul2.removeChild(ul2.firstChild)
                  }

                  let targ = e.target.innerHTML
                  countryInput.value = targ
                  cityInput.value = ""
                  if (greenefy == true) { cityInput.style.border = "4px solid red" }

                  if (e.target.matches(".boxcont")) {
                    targ = e.target.childNodes[1].innerHTML
                  }

                  else if (e.target.matches(".flagplace")) {
                    targ = e.target.nextSibling.innerHTML
                  }

                  else if (event.target.matches("path")) {
                    let ez = event.target.parentNode
                    let az = ez.parentNode
                    let oz = az.parentNode
                    targ = oz.nextSibling.innerHTML
                  }

                  countryInput.value = targ
                  document.querySelector(".flagicon").style.backgroundImage = `url('./images/flags/${targ.toLowerCase()}.svg')`
                  targ == "Nepal" ? null : document.querySelector(".flagicon").style.border = `0.5px solid rgb(170, 168, 168)`
                })
              })
            }
          })
         
         

          ///#3 validation for date input field
             dateInput.addEventListener("keydown" , (e) => {e.key === "Backspace" ? ascend = false : ascend = true
              e.key === "-" ? e.preventDefault() : null
            }
          )

          dateInput.addEventListener("input", () => {

            
            if (dateInput.value !== "" && greenefy == true) {
              dateInput.style.border = "4px solid #48d945"
            }
            else if (dateInput.value == "" && greenefy == true) {
              dateInput.style.border = "4px solid red"
            }
            
            
             dateInput.value = dateInput.value.replace(/[^\d-]/g, "");
            
             dateInput.value.length === 4 && ascend == true || dateInput.value.length === 7 && ascend == true ? dateInput.value += "-" : null


             if (dateInput.value.length === 5){
            parseInt(dateInput.value.slice(0 , 4)) > parseInt(new Date().getFullYear()) ? dateInput.value = new Date().getFullYear() + "-" : null
            parseInt(dateInput.value.slice(0 , 4)) < 1970 ? dateInput.value = "1970-" : null
             }

             else if (dateInput.value.length === 8){
              parseInt(dateInput.value.slice(5 , 7)) > 12 ? dateInput.value = dateInput.value.slice(0 , 4) + "-12-" : null
              dateInput.value.slice(5 , 7) == "00" ? dateInput.value = dateInput.value.slice(0 , 4) + "-01-" : null
             }

             else if (dateInput.value.length === 10){
              let jak = dateInput.value.slice(8 , 10)
              if (dateInput.value.slice(5 , 7) == "01" || dateInput.value.slice(5 , 7) == "03" || dateInput.value.slice(5 , 7) == "05"|| dateInput.value.slice(5 , 7) == "07" || dateInput.value.slice(5 , 7) == "08" || dateInput.value.slice(5 , 7) == "10" || dateInput.value.slice(5 , 7) == "12"){
                parseInt(dateInput.value.slice(8 , 10)) > 31 ? dateInput.value = dateInput.value.slice(0 , 7) + "-31" : null
              }
              
               else if (dateInput.value.slice(5 , 7) == "04" || dateInput.value.slice(5 , 7) == "06" || dateInput.value.slice(5 , 7) == "09"|| dateInput.value.slice(5 , 7) == "11"){
               parseInt(dateInput.value.slice(8 , 10)) > 30 ? dateInput.value = dateInput.value.slice(0 , 7) + "-30" : null
              }
             
             else if (dateInput.value.slice(5 , 7) == "02") {
              let leapYear = ""
              parseInt(dateInput.value.slice(0 , 4)) % 4 === 0 ? leapYear = true : leapYear = false
              leapYear == true && parseInt(dateInput.value.slice(8 , 10)) > 29 ? dateInput.value = dateInput.value.slice(0 , 7) + "-29" : null
              leapYear == false && parseInt(dateInput.value.slice(8 , 10)) > 28 ? dateInput.value = dateInput.value.slice(0 , 7) + "-28" : null
             }
             dateInput.value.slice(8 , 10) == "00" ? dateInput.value = dateInput.value.slice(0 , 7) + "-01" : null
          }
        })

///input validation
        let greenefy = false
        let completedValueCity = false
        let completedValueCountry = false
        let firstQuery = true

        firstQuery === true ? completedValueCity = true : completedValueCity = false
        firstQuery === true ? completedValueCountry = true : completedValueCountry = false

        let form = document.getElementById('myForm')
        if (form) {
          let nezzuk = new Date()
          form.addEventListener("submit", function (e) {
             let nezzukMar = Math.floor(nezzuk/1000)
              let fullDays = Math.floor(nezzukMar / 86400)
              let lastSecOfThePrevDay = (fullDays * 86400) - 1

              let dateVal = document.querySelector("#date").value
              console.log(dateVal)

              let providedDate = new Date(dateVal)
              let providedDateUnix = Math.floor(providedDate/1000)

            if (document.querySelector("#cityloc").value == "" || document.querySelector("#countryloc").value == "" || document.querySelector("#date").value == "" || completedValueCity == false || completedValueCountry == false) {
              e.preventDefault()
              document.querySelector(".error").innerHTML = "Please fill in all required fields."
              document.querySelector(".error").style.display = "block"

              if (document.querySelector("#cityloc").value == "" || completedValueCity == false ) {
                document.querySelector("#cityloc").style.border = "4px solid red"
                greenefy = true
              }
              else { document.querySelector("#cityloc").style.border = "none" }
              if (document.querySelector("#countryloc").value == "" || completedValueCountry == false) {
                document.querySelector("#countryloc").style.border = "4px solid red"
                greenefy = true
              }
              else { document.querySelector("#countryloc").style.border = "none" }
              if (document.querySelector("#date").value == "") {
                document.querySelector("#date").style.border = "4px solid red"
                greenefy = true
              }
              else { document.querySelector("#date").style.border = "none" }
            }

            else if (document.querySelector("#date").value.charAt(4) !== "-" || document.querySelector("#date").value.charAt(7) !== "-" || document.querySelector("#date").value.length < 10){
                e.preventDefault()
              document.querySelector(".error").innerHTML = "Please provide a valid date."
              document.querySelector(".error").style.display = "block"
            }

             else if (providedDateUnix > lastSecOfThePrevDay) {
               e.preventDefault()
              document.querySelector(".error").innerHTML = "Date must be older."
              document.querySelector(".error").style.display = "block"
             }

             else if (providedDateUnix < 86400) {
               e.preventDefault()
              document.querySelector(".error").innerHTML = "1970-01-02 and onwards."
              document.querySelector(".error").style.display = "block"
             }

             else{document.querySelector("#loading-screen").style.display = "flex"

             }
          })
        }