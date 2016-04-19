//check page has loaded
document.addEventListener("DOMContentLoaded", function() {
    
    var distance = 10; //default race track distance = number of cells in table
    var score = 0; //set the starting score
    var lowVolume = document.getElementById("bg-audio").volume = 0.06; //set background audio volume to low
    var cars = []; //cars array
    var tires = []; //tires array
    //make array list of row items for use futher down programme
    var rows = [
      {
        element: document.querySelector("tr.strip.a"),
        name: "generic1",
        row: 0,
        querySelector: "tr.strip.a td",
        rowCells: document.querySelectorAll("tr.strip.a td")
      },
      {
        element: document.querySelector("tr.strip.b"),
        name: "generic",
        row: 1,
        querySelector: "tr.strip.b td",
        rowCells: document.querySelectorAll("tr.strip.b td"),
      },
      { 
        element: document.querySelector("tr.player1_strip"), //player1's track
        name: "car-1",
        row: 2, 
        querySelector: "tr.player1_strip td",
        rowCells: document.querySelectorAll("tr.player1_strip td"), //a list of all the cells in player1's track
      }, 
      {
        element: document.querySelector("tr.player2_strip"), //player2's track
        name: "car-2",
        row: 3,
        querySelector: "tr.player2_strip td",
        rowCells: document.querySelectorAll("tr.player2_strip td"), //a list of all the cells in player2's track
      },
      {
        element: document.querySelector("tr.strip.c"),
        name: "generic",
        row: 4,
        querySelector: "tr.strip.c td",
        rowCells: document.querySelectorAll("tr.strip.c td"),
        objectsPos: []
      },
      {
        element: document.querySelector("tr.strip.d"),
        name: "generic",
        row: 5,
        querySelector: "tr.strip.d td",
        rowCells: document.querySelectorAll("tr.strip.d td"),
      }, 
    ];
    // add/define some functionality to the game, moving and position etc, to be called on further down programme
    function Racer_Object( name, x, y, dir) {
      this.name = name;
      this.posX = x;
      this.posY = y;
      this.cell = rows[this.posY].rowCells[this.posX];
      this.direction = dir; 
      this.move = function(backToStart) { 
        this.cell.className = this.cell.className.replace(this.name, '');
        if(backToStart === "back to start") {
          this.posX = 0;
          this.cell = rows[this.posY].rowCells[this.posX];
          this.cell.className = this.name;
        }
        else{
          if(this.direction === "up") {
            this.posY--;
            if(this.posY < 0) {
              this.direction = "down";
              this.posY = 1;
            }
          }
          else if(this.direction === "down") {
            this.posY++;  
            if(this.posY > 5) {
              this.direction = "up"; 
              this.posY = 4;    
            }
          }
          else if(this.direction === "right") {
            this.posX++;                 
          }
          this.cell = rows[this.posY].rowCells[this.posX];
          this.cell.className = this.name;
          checkForCollision(this);
        }
      };     
      this.spawn = function() {
        this.cell.className = this.name;
      }
    }

    function Car(name, x, y, dir) {
      Racer_Object.call(this, name, x, y, dir);
    }

    function Tire(name, x, y, dir) {
      Racer_Object.call(this, name, x, y, dir);
    }

    newGame(); //start a new game
    
    function updatePlayerPosition(carName) {
      var car;      
      for(var i=0; i<cars.length; i++) {
        if(cars[i].name === carName)
          car = cars[i];
      }
      car.move();
      checkForCollision();
      //check for winner and display hidden text
      if(car.posX == distance) {
        showElem();
        document.removeEventListener("keyup", checkKeyPressed, false); 
        stopTires(intervalID); //stop tires
      }
    }

    function checkForCollision(car) { //check for car crash with tire, if so send car back to start
      for(var car=0; car<cars.length; car++) {
        for(var tire=0; tire<tires.length; tire++) {
          if(cars[car].posX == tires[tire].posX && cars[car].posY == tires[tire].posY) {
            cars[car].move("back to start");
          } 
        }
      }
    }    
    //check which key activated the eventlistener . If 65(A) move car1 forward. Else if 76(L) move car2 forward
    function checkKeyPressed(e) {        
      if (e.keyCode == "65") {                
        updatePlayerPosition("car-1");      
      }
      else if (e.keyCode == "76") {                
        updatePlayerPosition("car-2");        
      }
    }

    //start a new game
    function newGame() {    
      document.addEventListener("keyup", checkKeyPressed, false); //turn on eventlistener for keyboard
      setDistance(distance);
      // spawn cars and tires;  
      createGameItems();
    }    
      
    //fetch the value of the selected option in the distance select panel, then reset the game
    function changeDistance(e) {      
      distance = e.srcElement.value || e.target.value;
      newGame();
    }    

    //create the track according to selected distance, but first delete the current track
    function setDistance(dist) {            
      rows = rows.map(function(row) {
        var rowLength = row.rowCells.length;
        for(var i=rowLength; i>1; i--) {
          row.element.removeChild(row.rowCells[i-1]);   
        }
        for(var i=0; i<dist; i++) {
          var newCell = document.createElement("td"); //new cell
          row.element.appendChild(newCell); //add new cells to end of row 
          row.rowCells = document.querySelectorAll(row.querySelector);          
        } 
        if(row.name === "generic1") {
          row.element.innerHTML = row.element.innerHTML + "<td rowspan = \"6\" class = \"finish_line\"></td>"; //add finish line
          row.rowCells = document.querySelectorAll(row.querySelector); 
        }       
        return row;        
      });
    }  
    //creates game items by putting racers to start of track and randomising the postion of obstecles/flaming tires
    var intervalID;//
    function createGameItems() {
      if(intervalID !== undefined) {
        stopTires(intervalID);
      }
      cars = [];
      tires = [];
      //make cars places them at the start of player lanes, using the cell and row numbers
      cars.push(new Car("car-1", 0, 2, "right"));
      cars.push(new Car("car-2", 0, 3, "right"));
      for(var i=0; i<cars.length; i++)
        cars[i].spawn();
      //make tires, then calculates how many tires to add according to track distance, randomise tire cell start position
      var tiresX = [];      
      for(var i=0; i<distance; i++) {
        tiresX.push(i);
      }
      tiresX = tiresX.filter(function(val) {
        return val % 2 == 0;
      });
      function tiresY() {
        return Math.floor(Math.random() * 6); 
      }
      function tireDirection() {
        var dir = Math.floor(Math.random() * 2);
        if(dir === 0)
          return "up";
        else
          return "down";
      }
      for(var i=1; i<tiresX.length; i++) {
        var tire = new Tire("tire", tiresX[i], tiresY(), tireDirection());
        tires.push(tire);
        tire.spawn();
      }
      intervalID = setInterval(function() { 
        for(var i=0; i<tires.length; i++) {
          tires[i].move();
        }
      }, 400); //speed of tire/obstacle movement
    } 

    function stopTires(id) { //stops tires, needed when player wins
      clearInterval(id);
    } 

    //hide winner text
    function hideElem() {
    document.getElementById("racer-wins").style.display = "none"; 
    }
    
    //show winner text
    function showElem() {
    document.getElementById("racer-wins").style.display = "block"; 
    }
    // mute background music
    function musicStop() {
    document.getElementById('bg-audio').muted = true;
    } 

    // play background music
    function musicPlay() {
    document.getElementById('bg-audio').muted = false;
    }

    //hide mute audio btn and show unmute btn
    function hideMuteBtn() {
    document.getElementById("audio-btn").style.display = "none";
    document.getElementById("audio-btn2").style.display = "inline-block";
    }

    function showMuteBtn() {
    document.getElementById("audio-btn2").style.display = "none";
    document.getElementById("audio-btn").style.display = "inline-block";
    }

    
    //add eventListener for the 'New Game' button, hide winner text when new game started   
    var newGameBtn = document.getElementById("newGame");
    newGameBtn.addEventListener("click", newGame, false);
    newGameBtn.addEventListener("click", hideElem, false); 

    //add eventListener for the race track distance select panel
    var distanceSelect = document.getElementById("distance");
    distanceSelect.addEventListener("change", changeDistance, false);

    //add EventListener to audio button to mute background music
    var muteAudio = document.getElementById("audio-btn")
    muteAudio.addEventListener("click", musicStop, false);
    muteAudio.addEventListener("click", hideMuteBtn, false);

    //add EventListener to stop audio button 2 to unmute background music
    var unMuteAudio = document.getElementById("audio-btn2")
    unMuteAudio.addEventListener("click", musicPlay, false);
    unMuteAudio.addEventListener("click", showMuteBtn, false);

});