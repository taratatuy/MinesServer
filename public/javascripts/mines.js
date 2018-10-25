const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;
canvas.oncontextmenu = e => {
  e.preventDefault();
};

var colors = [];

mouse = {
  x: 0,
  y: 0
};

addEventListener('mouseup', e => {
  var grid = objects[0];
  if (e.button == 0) {
    for (var i = 0; i < grid.cols; i++) {
      for (var j = 0; j < grid.rows; j++) {
        if (
          // mouse.x > grid.grid[i][j].x + 7 &&
          // mouse.y > grid.grid[i][j].y + 7 &&
          // mouse.x < grid.grid[i][j].x + grid.cageSize + 7 &&
          // mouse.y < grid.grid[i][j].y + grid.cageSize + 7
          grid.grid[i][j].mouseOn == true
        ) {
          if (!objects[0].grid[i][j].flag) {
            // if (!objects[0].grid[i][j].checked) {
            objects[0].grid[i][j].showBombs();
            // objects[0].grid[i][j].checked = true;
            // }
          }
        }
      }
    }
  }
  if (e.button == 2) {
    for (var i = 0; i < grid.cols; i++) {
      for (var j = 0; j < grid.rows; j++) {
        if (grid.grid[i][j].mouseOn == true) {
          if (!objects[0].grid[i][j].checked) {
            objects[0].grid[i][j].flag = !objects[0].grid[i][j].flag;
          }
        }
      }
    }
  }
});

addEventListener('mousemove', e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  var grid = objects[0];
  for (var i = 0; i < grid.cols; i++) {
    for (var j = 0; j < grid.rows; j++) {
      if (
        mouse.x > grid.grid[i][j].x + 7 &&
        mouse.y > grid.grid[i][j].y + 7 &&
        mouse.x < grid.grid[i][j].x + grid.cageSize + 7 &&
        mouse.y < grid.grid[i][j].y + grid.cageSize + 7
      ) {
        grid.grid[i][j].mouseOn = true;
      } else {
        grid.grid[i][j].mouseOn = false;
      }
    }
  }
});

class Grid {
  constructor(cols, rows) {
    this.cols = cols;
    this.rows = rows;
    this.grid = new Array(this.cols);
    this.bombs = 250;

    this.padding = 10;
    this.cageSize = 30;
    // Math.min(canvas.height - 20, canvas.width - 20) /
    // Math.max(this.cols, this.rows);

    for (var i = 0; i < this.cols; i++) {
      this.grid[i] = new Array(this.rows);
      for (var j = 0; j < this.rows; j++) {
        this.grid[i][j] = new Cage(
          this.padding + i * this.cageSize,
          this.padding + j * this.cageSize,
          this.cageSize
        );
      }
    }

    this.setBombs(this.bombs);

    for (var i = 0; i < this.cols; i++) {
      for (var j = 0; j < this.rows; j++) {
        if (i > 0) {
          if (j > 0) {
            this.grid[i][j].nbh[this.grid[i][j].nbh.length] = this.grid[i - 1][
              j - 1
            ];
          }
          this.grid[i][j].nbh[this.grid[i][j].nbh.length] = this.grid[i - 1][j];
          if (j < this.rows - 1) {
            this.grid[i][j].nbh[this.grid[i][j].nbh.length] = this.grid[i - 1][
              j + 1
            ];
          }
        }

        if (j > 0) {
          this.grid[i][j].nbh[this.grid[i][j].nbh.length] = this.grid[i][j - 1];
        }
        if (j < this.rows - 1) {
          this.grid[i][j].nbh[this.grid[i][j].nbh.length] = this.grid[i][j + 1];
        }

        if (i < this.cols - 1) {
          if (j > 0) {
            this.grid[i][j].nbh[this.grid[i][j].nbh.length] = this.grid[i + 1][
              j - 1
            ];
          }
          this.grid[i][j].nbh[this.grid[i][j].nbh.length] = this.grid[i + 1][j];
          if (j < this.rows - 1) {
            this.grid[i][j].nbh[this.grid[i][j].nbh.length] = this.grid[i + 1][
              j + 1
            ];
          }
        }

        // this.grid[i][j].showBombs(); //MOVE IT TO MOUSE EVANT (or not)
      }
    }
    // this.openAll();
    console.log(this.grid);
  }

  setBombs(value) {
    var cagesForBombs = [];
    for (var i = 0; i < this.cols; i++) {
      for (var j = 0; j < this.rows; j++) {
        cagesForBombs[cagesForBombs.length] = this.grid[i][j];
      }
    }

    for (var i = 0; i < value; i++) {
      var nextBomb = Math.floor(Math.random() * cagesForBombs.length);
      cagesForBombs[nextBomb].bomb = true;
      //
      // this.grid[1][1].bomb = true;
      // this.grid[2][2].bomb = true;
      // this.grid[4][4].bomb = true;
      //
    }
  }

  openAll() {
    for (var i = 0; i < this.cols; i++) {
      for (var j = 0; j < this.rows; j++) {
        this.grid[i][j].checked = true;
      }
    }
  }

  update() {
    this.draw();
  }

  draw() {
    for (var i = 0; i < this.cols; i++) {
      for (var j = 0; j < this.rows; j++) {
        this.grid[i][j].draw();
      }
    }
    // this.grid.forEach(cage => {
    //   cage.draw();
    // });
  }
}

class Cage {
  constructor(x, y, cageSize) {
    this.x = x;
    this.y = y;
    this.cageSize = cageSize;
    this.nbh = [];
    this.bomb = false;
    this.flag = false;
    this.bombsAround = 0;
    this.flagsAround = 0;
    this.checked = false;
    this.mouseOn = false;
  }

  showBombs() {
    if (!this.bomb) {
      if (this.checked) {
        this.flagsAround = this.getFlagsAround();

        if (this.flagsAround == this.bombsAround) {
          this.zeroRecursionOpen();
        }
      }

      if (!this.checked) {
        this.bombsAround = this.getBombsAround();
        this.checked = true;

        if (this.bombsAround == 0) {
          this.zeroRecursionOpen();
        }
      }
    } else {
      objects[0].openAll();
    }
  }

  getBombsAround() {
    let bombsCount = 0;
    for (var i = 0; i < this.nbh.length; i++) {
      if (this.nbh[i].bomb == true) {
        bombsCount++;
      }
    }
    return bombsCount;
  }

  getFlagsAround() {
    let flagCount = 0;
    for (var i = 0; i < this.nbh.length; i++) {
      if (this.nbh[i].flag == true) {
        flagCount++;
      }
    }
    return flagCount;
  }

  zeroRecursionOpen() {
    for (var i = 0; i < this.nbh.length; i++) {
      if (!this.nbh[i].checked && !this.nbh[i].flag) {
        this.nbh[i].showBombs();
      }
    }
  }

  update() {
    this.draw();
  }

  draw() {
    c.save();
    c.beginPath();
    c.fillStyle = 'lightgray';
    c.fillRect(this.x, this.y, this.cageSize, this.cageSize);
    if (this.mouseOn) {
      if (!this.checked) {
        c.fillStyle = 'white';
        c.fillRect(this.x, this.y, this.cageSize, this.cageSize);
      }
    }
    c.lineWidth = 1;
    c.strokeRect(this.x, this.y, this.cageSize, this.cageSize);
    c.closePath();
    c.restore();
    if (this.flag) {
      c.save();
      c.font = '40px Arial';
      c.fillStyle = 'red';
      c.fillText(
        '*',
        this.x + this.cageSize / 2 - 8,
        this.y + this.cageSize / 2 + 23
      );
      c.restore();
    }
    c.save();
    if (this.checked) {
      if (!this.bomb) {
        c.font = '20px Arial';
        // if (this.bombsAround == 0) {
        c.fillStyle = 'white';
        c.fillRect(this.x, this.y, this.cageSize, this.cageSize);
        c.strokeRect(this.x, this.y, this.cageSize, this.cageSize);
        // }
        if (this.bombsAround == 1) c.fillStyle = 'black';
        if (this.bombsAround == 2) c.fillStyle = 'black';
        if (this.bombsAround == 3) c.fillStyle = 'black';
        if (this.bombsAround == 4) c.fillStyle = 'black';
        if (this.bombsAround == 5) c.fillStyle = 'black';
        if (this.bombsAround == 6) c.fillStyle = 'black';
        if (this.bombsAround == 7) c.fillStyle = 'black';
        if (this.bombsAround == 8) c.fillStyle = 'black';
        c.fillText(
          this.bombsAround,
          this.x + this.cageSize / 2 - 5,
          this.y + this.cageSize / 2 + 7
        );
        c.restore();
      } else {
        c.save();
        c.beginPath();
        c.lineWidth = 1;
        c.fillStyle = 'red';
        c.fillRect(this.x, this.y, this.cageSize, this.cageSize);
        c.strokeRect(this.x, this.y, this.cageSize, this.cageSize);
        c.closePath();
        c.restore();
      }
    }
  }
}

var objects = [];
function init() {
  objects.push(new Grid(50, 20));
}

function animate() {
  requestAnimationFrame(animate);
  c.clearRect(0, 0, canvas.width, canvas.height);

  objects.forEach(object => {
    object.update();
  });
}

init();
animate();
