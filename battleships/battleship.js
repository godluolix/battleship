var view = {
  displayMessage: function (msg) {  //displayMessage是一个方法
    var messageArea = document.getElementById("messageArea");
    messageArea.innerHTML = msg;
  },
  displayHit: function (location) { //location为td元素的id
    var cell = document.getElementById(location);
    cell.setAttribute("class", "hit"); //增加指定的属性，并为他赋指定的值
    //hit为特性
  },
  displayMiss: function (location) {
    var cell = document.getElementById(location);
    cell.setAttribute("class", "miss");
  }
};
var model = {
  boardSize: 7,//网格大小
  numShips: 3,//战舰数
  shipLength: 3,//战舰位置及被击中的部位
  shipsSunk: 0,//有多少战舰被击沉
  ships: [
    { locations: [0, 0, 0], hits: ['', '', ''] }, //location存储了战舰占据的单元格
    { locations: [0, 0, 0], hits: ['', '', ''] }, //hits指出战舰是否被击中
    { locations: [0, 0, 0], hits: ['', '', ''] }],
  fire: function (guess) {
    for (var i = 0; i < this.numShips; i++) {
      var ship = this.ships[i]; //获取一个战舰
      var index = ship.locations.indexOf(guess); //将一个值作为参数，并返回这个值在数组中的索引（没有找到这个值，就返回-1）
      if (index >= 0) { //返回的值>=说明玩家击中了战舰
        ship.hits[index] = "hit";//将hits中的相应元素设置为"hit"
        view.displayHit(guess);//是否击中了战舰
        view.displayMessage("HIT!");//显示击中了战舰
        if (this.isSunk(ship)) { //判断战舰是否被击中
          view.displayMessage("you sank my battleship!");
          this.shipsSunk++;
        }
        return true;
      }
    }
    view.displayMiss(guess);//没有击中战舰
    view.displayMessage("you missed.");
    return false;
  },
  isSunk: function (ship) {
    for (var i = 0; i < this.shipLength; i++) {
      if (ship.hits[i] !== "hit") { //当i>3是返回true
        return false;
      }
    }
    return true;
  },
  generateShipLocations: function() { //每次都创建一个新的战舰直到在ships创建了足够的战舰
    var locations;
    for (var i = 0; i < this.numShips; i++) {//循环次数和生成位置的战舰数相同
      do {//使用do while循环
        locations = this.generateShip();//生成战舰占据的位置
      } while (this.collision(locations));//判断战舰是否有重叠 如果有就再次尝试
      this.ships[i].locations = locations;//生成可行的战舰后把他赋值给model.ships中的locations
    }
  },
  generateShip: function () {
    var direction = Math.floor(Math.random() * 2);//在0.5之前和之后做比较
    var row, col;
    if (direction === 1) {
      row = Math.floor(Math.random() * this.boardSize);
      col = Math.floor(Math.random() * (this.boardSize - this.shipLength));
    } else {
      row = Math.floor(Math.random() * (this.boardSize - this.shipLength));
      col = Math.floor(Math.random() * this.boardSize);
    }
    var newShipLocations = [];
    for (var i = 0; i < this.shipLength; i++) {
      if (direction === 1) {
        newShipLocations.push(row + "" + (col + i));//用于生成水平的战舰
      } else {
        newShipLocations.push((row + i) + "" + col);//用于生成竖直的战舰
      }
    }
    return newShipLocations;//返回给这个数组
  },
  collision: function (locations) { //用于判断战舰是否发生碰撞
    for (var i = 0; i < this.numShips; i++) { //i为战舰的数量
      var ship = model.ships[i];
      for (var j = 0; j < locations.length; j++) {
        if (ship.locations.indexOf(locations[j]) >= 0) {//>=0，返回true，发生碰撞
          return true;//从内部循环返回，立即终止俩个循环，退出函数并返回true
        }
      }
    }
    return false;//检查的所有位置都未被占据（没有产生碰撞）
  }
};
function parseGuess(guess) {
  var alphabet = ["A", "B", "C", "D", "E", "F", "G"];
  if (guess === null || guess.length !== 2) {//检查guess不为null，且长度为2
    alert("Oops, please enter a lettle and a number on the board.");
  } else {
    firstChar = guess.charAt(0);//用于获取guess的第一个字母
    var row = alphabet.indexOf(firstChar);//使用indexOf获取数字
    var column = guess.charAt(1);//获取第二串字符，表示列号
    if (isNaN(row) || isNaN(column)) {//检查是否都是数字
      alert("Oops, that isn't on the borad.");
    } else if (row < 0 || row >= model.boardSize || column < 0 || 
                        column >= model.boardSize) {
      //确认这些数字都在0-6之间      
      alert("Oops,that's off the borad!");
    } else {
      return row + column;//有效时，进行返回（自动类型转换）
    }
  }
  return null;//失败，返回
}
var controller = {
  guesses: 0,
  processGuess: function (guess) {
    var location = parseGuess(guess);
    if (location) {//只要返回的不是null，则获取的位置是有效的，null是一个假值
      this.guesses++;//猜测有效，在guesses上加1
      var hit = model.fire(location);//用字串符方式传递行号和列号，只用于击中
      if (hit && model.shipsSunk === model.numShips) {//显示击沉所有战舰的消息
        view.displayMessage("You sank all my battleships, in " + this.guesses + " guesses");
      }//显示花了多少次将所有战舰击沉
    }
  }
};
function init() {//存放代码的地方
  var fireButton = document.getElementById("fireButton");//使用Fire！按钮的id获取一个指向他的引用
  fireButton.onclick = handleFireButton;//给这个按钮添加单击事件处理程序handleFireButton
  var guessInput = document.getElementById("guessInput");
  guessInput.onkeypress = handleKeyPress;//添加一个新的处理程序，处理html出入的字段
  model.generateShipLocations();//需要调用生成战舰位置的函数，这个函数将修改模型中的空数组
}
function handleFireButton() {//定义函数，从表单中获取值的代码，开火的时候会调用这个代码
  var guessInput = document.getElementById("guessInput");
  var guess = guessInput.value;
  controller.processGuess(guess);
  guessInput.value = "";//继续操作，并保留之前的操作
}
function handleKeyPress(e) {//按键事件处理程序（包含按下哪个键的信息）
  var fireButton = document.getElementById("fireButton");
  if (e.keyCode === 13) {//按下回车键，调用fireButton的发放click，让它以为自己被单击了
    fireButton.click();
    return false;//返回false，让表单不做其他任何事情
  }
}
window.onload = init;//网页加载完毕后执行函数init