/*------------------------------BALL MANAGER (START)-------------------------------------------*/
function Ball(center, radius, color, cx) {
  this.center = center;
  this.radius = radius;
  this.cx = cx;
  this.color = color;
  this.goRequest = null;
  this.speed = 3;
  this.velocity = new Vector(0, -1);
  this.last_d2baffle = this.current_d2baffle = Math.abs(center.y);
  this.last_d2origin = this.current_d2origin = Math.abs(center.y);
  this.ballhit = new LevelManager;
  this.ballui = new UIManager;
}

Ball.prototype.display = function() {
  var cx = this.cx;
  cx.fillStyle = this.color;
  cx.beginPath();
  cx.arc(this.center.x, this.center.y, this.radius, 0, 2 * Math.PI, true);
  cx.fill();
};

Ball.prototype.disappear = function() {
  var cx = this.cx;
  cx.fillStyle = cx.canvas.style.backgroundColor;
  cx.beginPath();
  cx.arc(this.center.x, this.center.y, this.radius * 1.1, 0, 2 * Math.PI, true);
  cx.fill();
};

Ball.prototype.go = function() {
  this.disappear();
  var vx, vy, v;
  vx = this.velocity.x; vy = this.velocity.y;
  v = Math.sqrt(vx * vx + vy * vy);
  vx = this.speed*(vx / v); vy = this.speed*(vy / v);
  this.center.x += vx; this.center.y += vy;
  this.display();
}

Ball.prototype.hitsBaffle = function(baffle) {
  var x = this.center.x, y = this.center.y;
  var ball_angle = this.center.getPrincipalArgument();
  var d2origin = Math.sqrt(x * x + y * y); 
  var d2baffle = d2origin * Math.abs(Math.sin(baffle.theta - ball_angle));
  var d2origin_cos = d2origin * Math.abs(Math.cos(baffle.theta - ball_angle));
  this.last_d2baffle = this.current_d2baffle;
  this.current_d2baffle = d2baffle;
  if (this.current_d2baffle<this.last_d2baffle) {
    if (d2baffle<=baffle.thickness / 2 + this.radius * 1.8&&d2origin_cos<=baffle.length / 2) { 
       return true;
     }
  }
}

Ball.prototype.hitsWall = function(wall) {
  var ball_angle = this.center.getPrincipalArgument();
  var holes = wall.holes;
  for (var i = 0, n = holes.length; i<n; i++) { 
    if (ball_angle<holes[i].sAngle||ball_angle > holes[i].eAngle) continue;
    if (ball_angle>=holes[i].sAngle&&ball_angle<=holes[i].eAngle) return false;
  }
  var x = this.center.x, y = this.center.y;
  var d2origin = Math.sqrt(x * x + y * y); 
  this.last_d2origin = this.current_d2origin;
  this.current_d2origin = d2origin;
  if (this.current_d2origin > this.last_d2origin) {
    if (d2origin + this.radius * 1.5>=wall.radius) return true;
  }
}

Ball.prototype.hitsEnemy = function(enemy) {
  var enemyCenter = enemy.getCenter();
  var x1 = this.center.x, y1 = this.center.y,
      x2 = enemyCenter.x, y2 = enemyCenter.y;
  var d = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
  if (d<=this.radius + enemy.radius) return true;
}

Ball.prototype.rebound = function(theta) {
  var velocityArg = this.velocity.getPrincipalArgument();
  velocityArg = 2 * theta - velocityArg;
  return new Vector(Math.cos(velocityArg), Math.sin(velocityArg));
}

Ball.prototype.getWallTheta = function() {
  var ball_angle = this.center.getPrincipalArgument();
  return ball_angle + Math.PI / 2;
}

Ball.prototype.outsideOfWall = function(wall) {
  var x = this.center.x, y = this.center.y;
  var d2origin = Math.sqrt(x * x + y * y); 
  if (d2origin - this.radius > wall.radius) return true;
}

/*------------------------------BALL MANAGER (END)-------------------------------------------*/

/*------------------------------BAFFLE MANAGER (START)-------------------------------------------*/
function Baffle(length, color, cx) {
  this.length = length;
  this.thickness = 2;
  this.cx = cx;
  this.start = new Vector(-this.length / 2, 0);
  this.end = new Vector(this.length / 2, 0);
  this.theta = 0;
  this.color = color;
  this.rotateRequest = null;
  this.rotating = false;
}

Baffle.prototype.display = function() {
  var cx = this.cx;
  cx.strokeStyle = this.color;
  cx.lineWidth = this.thickness;
  cx.beginPath();
  cx.moveTo(this.start.x, this.start.y);
  cx.lineTo(this.end.x, this.end.y);
  cx.stroke();
}

Baffle.prototype.disappear = function() {
  var cx = this.cx;
  cx.strokeStyle = cx.canvas.style.backgroundColor;
  cx.lineWidth = 4 * this.thickness;
  cx.beginPath();
  cx.moveTo(this.start.x, this.start.y);
  cx.lineTo(this.end.x, this.end.y);
  cx.stroke();
}

Baffle.prototype.rotate0 = function(clockwise) {
  if (this.rotateRequest) cancelAnimationFrame(this.rotateRequest);
  var step = clockwise ? 0.05 : -0.05;
  var self = this;
  function animate() {
    self.disappear();
    self.theta += step;
    self.setStartAndEnd();
    self.display();
    self.rotateRequest = requestAnimationFrame(animate);
  }
  this.rotateRequest = requestAnimationFrame(animate);
}

Baffle.prototype.rotate = function(direction) {
  var step;
  if (direction === 'clockwise')
    step = 0.04;
  else if (direction === 'anticlockwise')
    step = -0.04;
  else return;
  this.disappear();
  this.theta += step;
  this.setStartAndEnd();
  this.display();
}

Baffle.prototype.setStartAndEnd = function() {
  this.end.x = this.length / 2 * Math.cos(this.theta);
  this.end.y = this.length / 2 * Math.sin(this.theta);
  this.start.x = -this.end.x;
  this.start.y = -this.end.y;
}

Baffle.prototype.stopRotating = function() {
  cancelAnimationFrame(this.rotateRequest);
}

Baffle.prototype.reset = function() {
  this.theta = 0;
  this.setStartAndEnd();
}
/*------------------------------BAFFLE MANAGER (END)-------------------------------------------*/

/*------------------------------WALL MANAGER (START)-------------------------------------------*/
function Wall(radius, color, holesOptions, cx) {
  this.radius = radius;
  this.thickness = 0.02 * radius;
  this.color = color;
  this.cx = cx;
  this.holes = [];
  this.setHoles(holesOptions);
}

Wall.prototype.display = function() {
  var cx = this.cx;
  cx.strokeStyle = this.color;
  cx.lineWidth = this.thickness;
  cx.beginPath();
  cx.arc(0, 0, this.radius, 0, 2 * Math.PI);
  cx.stroke();
  this.displayHoles();
}

Wall.prototype.setHoles = function(holesOptions) {
  if(this.holes.length > 0) this.holes.length = 0;
  var gap = 2 * Math.PI / holesOptions.holesNum;
  var sAngle, eAngle;
  for(var i = 0; i < holesOptions.holesNum; i++) {
    sAngle = i * gap + holesOptions.startAngle;
    eAngle = sAngle + holesOptions.holeAngle;
    this.holes.push(new Hole(sAngle, eAngle));
  }
}

Wall.prototype.displayHoles = function() {
  var cx = this.cx;
  cx.strokeStyle = cx.canvas.style.backgroundColor;
  cx.lineWidth = this.thickness * 1.5;
  for(var i = 0, n = this.holes.length; i < n; i++) {
    cx.beginPath();
    cx.arc(0, 0, this.radius, this.holes[i].sAngle, this.holes[i].eAngle);
    cx.stroke();
  }
}
/*------------------------------WALL MANAGER (END)-------------------------------------------*/


/*------------------------------ENEMY MANAGER (START)-------------------------------------------*/
function Enemy(d2origin, argument, radius, color, cx) {
  this.d2origin = d2origin;
  this.argument = argument;
  this.radius = radius;
  this.color = color;
  this.cx = cx;
}

Enemy.prototype.display = function() {
  var cx = this.cx;
  cx.fillStyle = this.color;
  cx.beginPath();
  xcentre= Math.floor(Math.random() * (51) ) + 50;
  sign= Math.floor(Math.random() * (2) ) + 1;
  if (sign===2) {
    xcentre= xcentre*(-1);
  }
  ycentre= Math.floor(Math.random() * (51) ) + 50;
  sign= Math.floor(Math.random() * (2) ) + 1;
  if (sign===2) {
    ycentre= xcentre*(-1);
  }
  var center = this.getCenter();
  cx.arc(center.x, center.y, this.radius, 0, 2 * Math.PI, true);
  cx.closePath();
  cx.fill();
};

var xcentre=100, ycentre=100, sign=1, enemy_no;

Enemy.prototype.getCenter = function() {
  return new Vector(xcentre, ycentre);
}

Enemy.prototype.becomeBigger = function() {
  this.radius+=this.radius / 8;
}

Enemy.prototype.changeArgument = function(game_level) {
  this.argument = game_level;
  var center = this.getCenter();
  if (Math.abs(center.getPrincipalArgument() - (-Math.PI / 2)) < Math.PI / 6) {
    this.argument += Math.PI / 3;
  }
}
/*------------------------------ENEMY MANAGER (END)-------------------------------------------*/

/*------------------------------GAME MANAGER (START)-------------------------------------------*/
var current_score=100;

function Game(ballRadius, cx) {
  this.ballRadius = ballRadius;
  this.cx = cx;
  this.inputManager = new InputManager();
  this.levelManager = new LevelManager;
  this.uiManager = new UIManager;
  this.prepare();
  this.start();
}

Game.prototype.prepare = function() {
  this.prepareBaffle();
  this.prepareBall();
  this.prepareWall();
  this.prepareEnemy();
}

Game.prototype.start = function() {
  this.moveBall();
  this.inputManager.on('rotateBaffle', this.rotateBaffle.bind(this));
  this.inputManager.on('stopRotatingBaffle', this.stopRotatingBaffle.bind(this));
  this.inputManager.on('gotoNextLevel', this.gotoNextLevel.bind(this));

}

Game.prototype.prepareBaffle = function() {
  
  this.baffle = new Baffle(10 * this.ballRadius, 'brown', this.cx);
  this.baffle.display();
}

Game.prototype.prepareBall = function() {
  var center = new Vector(0, -this.baffle.thickness / 2 - this.ballRadius);
  this.ball = new Ball(center, this.ballRadius, 'green', this.cx);
  this.ball.display();
}

Game.prototype.prepareWall = function() {
  var holesOptions = this.levelManager.getLevelHolesOptions();
  this.wall = new Wall(20 * this.ballRadius, 'black', holesOptions, this.cx);
  this.wall.display();
}

Game.prototype.prepareEnemy = function() {
  var d2origin = this.wall.radius / 2,
      argument = this.levelManager.level;
  this.enemy = new Enemy(d2origin, argument, this.ballRadius, 'red', this.cx);
  this.enemy.display();
}

Game.prototype.moveBall = function() {
  var ball = this.ball,
      baffle = this.baffle,
      wall = this.wall, enemy = this.enemy;
  var self = this;
  var newVelocity;
  function animate() {
    ball.go();
    if (ball.hitsBaffle(baffle)) {
      bafflebounce.play();
      newVelocity = ball.rebound(baffle.theta);
      ball.velocity.x = newVelocity.x;
      ball.velocity.y = newVelocity.y;
    } else if (ball.hitsWall(wall)) {
      current_score--;
      wallbounce.play();
      newVelocity = ball.rebound(ball.getWallTheta());
      ball.velocity.x = newVelocity.x;
      ball.velocity.y = newVelocity.y;
    }
    if (ball.outsideOfWall(wall)) {
      win.play();
      self.win();
    } else if (ball.hitsEnemy(enemy)) {
      enemyhit.play();
      self.lose();
    } else ball.goRequest = requestAnimationFrame(animate);
  }
  ball.goRequest = requestAnimationFrame(animate);
}

Game.prototype.rotateBaffle = function(direction) { 
  if (this.baffle.rotating) return; 
  var baffle = this.baffle;
  baffle.rotating = true;
  function animate() {
    baffle.rotate(direction);
    baffle.rotateRequest = requestAnimationFrame(animate);
  }
  baffle.rotateRequest = requestAnimationFrame(animate);
  this.uiManager.updateScore(current_score);

}

Game.prototype.stopRotatingBaffle = function() {
  var baffle = this.baffle;
  baffle.stopRotating();
  baffle.rotating = false;
  this.uiManager.updateScore(current_score);
}

Game.prototype.win = function() {
  cancelAnimationFrame(this.ball.goRequest);
  if (this.levelManager.levelsOver()) this.uiManager.passAllLevels();
  else this.uiManager.win();
}

Game.prototype.lose = function() {
  cancelAnimationFrame(this.ball.goRequest);
  this.uiManager.lose();
}


Game.prototype.gotoNextLevel = function() { 

  this.levelManager.nextLevel();
  this.uiManager.updateScore(current_score);
  this.uiManager.removeDialog();
  this.uiManager.clearContext(this.cx);
  this.resetBaffleAndBall();

  this.wall.setHoles(this.levelManager.getLevelHolesOptions());
  this.wall.display();

  var wallR = this.wall.radius;
  this.enemy.changeArgument(this.levelManager.level);
  this.enemy.becomeBigger();
  this.enemy.display();

  this.moveBall();
}

Game.prototype.resetCurrentLevel = function() {
  this.levelManager.level=1;
  current_score=100;
  this.resetBaffleAndBall();
  this.enemy.display();
  this.wall.display();
}

Game.prototype.resetBaffleAndBall = function() { 
  var baffle = this.baffle,
      ball = this.ball;
  baffle.theta = 0;
  baffle.setStartAndEnd();
  ball.center.x = 0;
  ball.center.y = -this.baffle.thickness / 2 - this.ballRadius;
  ball.velocity.x = 0;
  ball.velocity.y = -1;
  baffle.display();
  ball.display();
}
/*------------------------------GAME MANAGER (END)-------------------------------------------*/

/*------------------------------INPUT MANAGER (START)-------------------------------------------*/
function InputManager() {
  this.events = {};
  this.listenToButtons();
  this.listenToKeyboard();
 }
 
 InputManager.prototype.on = function(event, callback) {
   if (!this.events[event]) {
     this.events[event] = [];
   }
   this.events[event].push(callback);
 }
 
 InputManager.prototype.emit = function(event, data) {
   var callbacks = this.events[event];
   if (callbacks) {
     callbacks.forEach(function(callback) {
       callback(data);
     });
   }
 }
 
 InputManager.prototype.listenToButtons = function() {
   this.bindButtonPress('.next-level-btn', this.gotoNextLevel);
 }
 
 InputManager.prototype.listenToKeyboard = function() {
   var self = this;
   var map= {
     65: 'clockwise',    
     68: 'anticlockwise' 
   };
 
   document.addEventListener('keydown', function(event) {
     var mapped = map[event.which]; 
       if (mapped !== undefined) {
         event.preventDefault();
         self.emit('rotateBaffle', mapped);
       }
 
   });
 
   document.addEventListener('keyup', function(event) {
     var mapped = map[event.which]; 
       if (mapped !== undefined) { 
         event.preventDefault();
         self.emit('stopRotatingBaffle');
       }
   });
 
 }
 
 
 InputManager.prototype.gotoNextLevel = function(event) {
   event.preventDefault();
   this.emit('gotoNextLevel');
 }
 
 InputManager.prototype.bindButtonPress = function(selector, fn) {
   var button = document.querySelector(selector);
   button.addEventListener('click', fn.bind(this));
   button.addEventListener('touchend', fn.bind(this));
 }
/*------------------------------INPUT MANAGER (END)-------------------------------------------*/

/*------------------------------UI MANAGER (START)-------------------------------------------*/
start_from_menu = () => {
  document.getElementById("menu").style.display = "none";
  document.getElementById("game_display").style.display = "block";
}

open_help = () => {
  document.getElementById("menu").style.display = "none";
  document.getElementById("about_game").style.display = "block";
}

back_to_menu = () => {
  document.getElementById("about_game").style.display = "none";
  document.getElementById("menu").style.display = "block";
}


function UIManager() {
  this.cv = document.querySelector('canvas');
  this.dialogContainer = document.querySelector('.dialog-container')
  this.dialog = this.dialogContainer.querySelector('.dialog');
  this.dialogMsg = this.dialog.querySelector('.msg');
  this.nextLevelBtn = this.dialog.querySelector('.next-level-btn');
}

UIManager.prototype.win = function() {
  this.dialogMsg.innerText = 'WELL PLAYED !';
  this.nextLevelBtn.style.display = 'block';
  this.dialogContainer.style.display = 'block';
}

UIManager.prototype.lose = function() {
  this.dialogMsg.innerText = 'GAME OVER';
  if(this.nextLevelBtn.style.display === 'block') {
    this.nextLevelBtn.style.display = 'none';
  }
  this.dialogContainer.style.display = 'block';
}

UIManager.prototype.passAllLevels = function() {
  this.dialogMsg.innerText = 'CONGRATULATIONS, you passed all levels!';
  if(this.nextLevelBtn.style.display === 'block') {
    this.nextLevelBtn.style.display = 'none';
  }
  this.dialogContainer.style.display = 'block';
}

UIManager.prototype.clearContext = function(cx) {
  cx.clearRect(-cx.canvas.width/2, -cx.canvas.height/2, 
               cx.canvas.width, cx.canvas.height);
}

UIManager.prototype.removeDialog = function() {
  this.dialogContainer.style.display = 'none';
}

UIManager.prototype.updateScore = function(score) {
  var scoreContainer = document.querySelector('.score-value');
  scoreContainer.innerHTML = score;
}
/*------------------------------UI MANAGER (END)-------------------------------------------*/


/*------------------------------LEVEL MANAGER (START)-------------------------------------------*/
function LevelManager() {
  this.level = 1;
  this.levelConfig = {
    1: {
      holesOptions:  {holesNum: 12, startAngle: Math.PI/24, holeAngle: Math.PI / 16}

    },
    2: {
      holesOptions:  {holesNum: 12, startAngle: Math.PI /24, holeAngle: Math.PI / 18}
    },
    3: {
      holesOptions:  {holesNum: 12, startAngle: Math.PI /24, holeAngle: Math.PI / 20}
    },
    4: {
      holesOptions:  {holesNum: 10, startAngle: 0, holeAngle: Math.PI / 16}
    },
    5: {
      holesOptions:  {holesNum: 10, startAngle: 0, holeAngle: Math.PI / 18}
    },
    6: {
      holesOptions:  {holesNum: 10, startAngle: 0, holeAngle: Math.PI / 20}
    },
    7: {
      holesOptions:  {holesNum: 8, startAngle: Math.PI /12, holeAngle: Math.PI / 16}
    },
    8: {
      holesOptions:  {holesNum: 8, startAngle: Math.PI /12, holeAngle: Math.PI / 18}
    },
    9: {
      holesOptions:  {holesNum: 8, startAngle: Math.PI /12, holeAngle: Math.PI / 20}
    },
    10: {
      holesOptions:  {holesNum: 6, startAngle: Math.PI /6, holeAngle: Math.PI / 16}
    },
    11: {
      holesOptions:  {holesNum: 6, startAngle: Math.PI /6, holeAngle: Math.PI / 18}
    },
    12: {
      holesOptions:  {holesNum: 6, startAngle: Math.PI /6, holeAngle: Math.PI / 20}
    },
    13: {
      holesOptions:  {holesNum: 4, startAngle: Math.PI /6, holeAngle: Math.PI / 16}
    },
    14: {
      holesOptions:  {holesNum: 4, startAngle: Math.PI /6, holeAngle: Math.PI / 18}
    },
    15: {
      holesOptions:  {holesNum: 4, startAngle: Math.PI /6, holeAngle: Math.PI / 20}
    },
    16: {
      holesOptions:  {holesNum: 3, startAngle: Math.PI /4, holeAngle: Math.PI / 16}
    },
    17: {
      holesOptions:  {holesNum: 3, startAngle: Math.PI /6, holeAngle: Math.PI / 18}
    },
    18: {
      holesOptions:  {holesNum: 3, startAngle: 0, holeAngle: Math.PI / 20}
    },
    19: {
      holesOptions:  {holesNum: 2, startAngle: 0, holeAngle: Math.PI / 16}
    },
    20: {
      holesOptions:  {holesNum: 2, startAngle: Math.PI /6, holeAngle: Math.PI / 18}
    },
    21: {
      holesOptions:  {holesNum: 2, startAngle: Math.PI /5, holeAngle: Math.PI / 20}
    },
    22: {
      holesOptions:  {holesNum: 1, startAngle: Math.PI /5, holeAngle: Math.PI / 16}
    },
    23: {
      holesOptions:  {holesNum: 1, startAngle: 0, holeAngle: Math.PI / 18}
    },
    24: {
      holesOptions:  {holesNum: 1, startAngle: Math.PI /2, holeAngle: Math.PI / 20}
    },

  }
}

LevelManager.prototype.getLevelHolesOptions = function() {
  return this.levelConfig[this.level]['holesOptions'];
}

LevelManager.prototype.getLevelEnemyOptions = function() {
  return this.levelConfig[this.level]['enemyOptions'];
}

LevelManager.prototype.nextLevel = function() {
  this.level++;
  current_score+=100;
}


LevelManager.prototype.levelsOver = function() {
  return this.levelConfig[this.level + 1] === undefined ? true : false;
}

function Hole(sAngle, eAngle) {
  this.sAngle = sAngle; 
  this.eAngle = eAngle; 
}
/*------------------------------LEVEL MANAGER (END)-------------------------------------------*/

/*------------------------------MOTION MANAGER (START)-------------------------------------------*/
function Vector(x, y) { 
  this.x = x;
  this.y = y;
}

Vector.prototype.getPrincipalArgument = function() { 
  var x = this.x,
      y = this.y;
  var principalArgument = Math.atan(y / x);
  if (x < 0 && y >= 0) {
    principalArgument += Math.PI;
  } else if (x < 0 && y < 0) {
    principalArgument -= Math.PI;
  } else if (x === 0 && y > 0) {
    principalArgument = Math.PI / 2;
  } else if (x === 0 && y < 0) {
    principalArgument = -Math.PI / 2;
  }
  return principalArgument;
}
/*------------------------------MOTION MANAGER (END)-------------------------------------------*/

/*------------------------------SOUND MANAGER (START)-------------------------------------------*/
function sound(src) {
  this.sound = document.createElement("audio");
  this.sound.src = src;
  this.sound.setAttribute("preload", "auto");
  this.sound.setAttribute("controls", "none");
  this.sound.style.display = "none";
  this.sound.loop=false;
  document.body.appendChild(this.sound);
  this.play = function(){
      this.sound.play();
  }
  this.stop = function(){
      this.sound.pause();
  }    
}

var wallbounce = new sound("./sounds/wallbounce.mp3");
var bafflebounce = new sound("./sounds/bafflebounce.mp3");
var enemyhit = new sound("./sounds/enemyhit.mp3");
var win = new sound("./sounds/win.mp3");
/*------------------------------SOUND MANAGER (END)-------------------------------------------*/
