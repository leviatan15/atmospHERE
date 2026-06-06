if (document.querySelector("select")){
          let thisDate = new Date().getFullYear()
        for (let i = parseInt(thisDate); i > 1969; i--){
          let opt = document.createElement("option")
          opt.innerHTML = i
          opt.setAttribute("value", i)
          opt.classList.add("yearopt")
          document.querySelector("select").appendChild(opt)
        }
      for (let i = 0 ; i < 42; i++){
        let dayP = document.createElement("p")
        dayP.classList.add("daysopt")
        dayP.classList.add("clickopt")
        document.querySelector(".daysarea").appendChild(dayP)
      }}
          
        
                const months = [
              {name: "January", num: "01", active: false},
              {name: "February", num: "02", active: false},
              {name: "March", num: "03", active: false},
              {name: "April", num: "04", active: false},
              {name: "May", num: "05", active: false},
              {name: "June", num: "06", active: false},
              {name: "July", num: "07", active: false},
              {name: "August", num: "08", active: false},
              {name: "September", num: "09", active: false},
              {name: "October", num: "10", active: false},
              {name: "November", num: "11", active: false},
              {name: "December", num: "12", active: false},
            ]
            
            const yearMap = [
             {length: 31, start: "", startMap: ""},
             {length: 0, start: "", startMap: ""},
             {length: 31, start: "", startMap: ""},
             {length: 30, start: "", startMap: ""},
             {length: 31, start: "", startMap: ""},
             {length: 30, start: "", startMap: ""},
             {length: 31, start: "", startMap: ""},
             {length: 31, start: "", startMap: ""},
             {length: 30, start: "", startMap: ""},
             {length: 31, start: "", startMap: ""},
             {length: 30, start: "", startMap: ""},
             {length: 31, start: "", startMap: ""},
            ]
              
        let activeMonth = 0
        let openedCal = false

         
        document.querySelector(".calendar").addEventListener("click", (e) => {
          openedCal = true
        e.stopPropagation();
        document.querySelector(".calend").style.display = "block";
         document.querySelector(".monthopt").innerHTML = months[0].name
         months[0].active = true
         activeMonth = 0
         daysArranger()
         
        });

        function monthChanger(left, right, event) {
          months[activeMonth].active = false
          if (left.contains(event)) {
            activeMonth == 0 ? activeMonth = 11 : activeMonth--
            activeMonth == 0 ? months[11].active = true : months[activeMonth].active = true
          }
          else if (right.contains(event)) {
            activeMonth == 11 ? activeMonth = 0 : activeMonth++
            activeMonth == 11 ? months[0].active = true : months[activeMonth].active = true
          }
          document.querySelector(".monthopt").innerHTML = months[activeMonth].name
          daysArranger()
          return activeMonth
        }

        function daysSet(){
          ///berakja itt is a napokat
          document.querySelectorAll(".clickopt").forEach((e) => {e.innerHTML = ""
            
          })
          let num = 1
          for (i = parseInt(yearMap[activeMonth].startMap); i < parseInt(yearMap[activeMonth].length) + parseInt(yearMap[activeMonth].startMap) ; i++){
           
            document.querySelectorAll(".daysopt") ? document.querySelectorAll(".daysopt")[i].innerHTML = JSON.stringify(num) : null
          
            num++
          }
        }
       
        window.addEventListener("click", (e) => {
           if(openedCal == true){
        document.querySelector(".calend").contains(e.target) ? null : document.querySelector(".calend").style.display = "none"
        document.querySelector(".calend").contains(e.target) ? null : openedCal = false
        
       activeMonth = monthChanger(document.querySelector("#arrwdiv"), document.querySelector("#arrediv"), e.target)
       daysSet()
            }})

  ///napkiosztó funkció
            function daysArranger () {
               ///az adott év minden hónapján megkeresi hogy az első nap milyen napra esett
         for (let i =  1; i < 13; i++) {
          let mark = ""
          let currentDate = ""
          i < 10 ? mark = "0" : null
          currentDate = document.querySelector("select").value + "-" + mark + JSON.stringify(i) + "-" + "01"
          const date = new Date(currentDate)
          const day = date.getDay()
          console.log(day)
          yearMap[i-1].start = day

            ///berakja a kezdőpontokat és kezdődátumokat a yearMap array-be
          day == "0" ? yearMap[i-1].startMap = "13" : null
          parseInt(day) > 0 ? yearMap[i-1].startMap = JSON.stringify(parseInt(day) + 6) : null
          if (i == 2){
          document.querySelector("select").value % 4 === 0 ? yearMap[1].length = 29 : yearMap[1].length = 28
          }
         }
         ///console.log(yearMap)
         ///elhelyezi a térképen

         document.querySelectorAll(".clickopt").forEach((e) => {e.innerHTML = ""
          e.style.border = "1px solid #141616" 
         })
         document.querySelectorAll(".daysopt").forEach((e) => {e.classList.remove("clickhoveropt")
         })
          let num = 1
          for (i = parseInt(yearMap[activeMonth].startMap); i < parseInt(yearMap[activeMonth].length) + parseInt(yearMap[activeMonth].startMap) ; i++){
           
            document.querySelectorAll(".daysopt")[i].innerHTML = JSON.stringify(num)
            document.querySelectorAll(".daysopt")[i].classList.add("clickhoveropt")
            num++
          }  
            }


            if (document.querySelector("select")){
        document.querySelector("select").addEventListener("change", () => {
          daysArranger()
        })
      }
        
  document.querySelectorAll(".clickopt").forEach((day) => {day.addEventListener("click", (e) => {

   if(e.target.innerHTML != ""){

    console.log(e.target.innerHTML)
    dateInput.value = ""
    let mark = ""
    e.target.innerHTML < 10 ? mark = "0" : null
    let clickedValue = document.querySelector("select").value + "-" + months[activeMonth].num + "-" + mark + e.target.innerHTML
    dateInput.value = clickedValue
    document.querySelector(".calend").style.display = "none"
   }
  })})