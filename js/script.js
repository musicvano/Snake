class Segment {
    constructor(p0, p1, dir) {
        this.p0 = p0;
        this.p1 = p1;
        this.dir = dir;
    }

    // Returns legth of the segment
    Length() {
        var dx = this.p0.x - this.p1.x;
        var dy = this.p0.y - this.p1.y;
        return Math.hypot(dx, dy);
    }

    // Returns true if two segments are intersected
    // This method uses parametric equation of the edge P(t) = P0+(P1-P0)*t
    Intersect(seg) {
        var x1 = this.p0.x;
        var y1 = this.p0.y;
        var x2 = this.p1.x;
        var y2 = this.p1.y;
        var x3 = seg.p0.x;
        var y3 = seg.p0.y;
        var x4 = seg.p1.x;
        var y4 = seg.p1.y;
        var den = (y4 - y3) * (x2 - x1) - (y2 - y1) * (x4 - x3);
        var t1 = ((y4 - y3) * (x3 - x1) - (y3 - y1) * (x4 - x3)) / den;
        var t2 = ((y2 - y1) * (x3 - x1) - (y3 - y1) * (x2 - x1)) / den;
        return (t1 >= 0) && (t1 <= 1) && (t2 >= 0) && (t2 <= 1);
    }
}

class Apple {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Snake {
    constructor() {
        this.speed = 5;
        this.width = 10;
        this.color = '#0000FF';        
        this.segments = [
            new Segment(
                { x: 100, y: 100 },
                { x: 60, y: 100 },
                { x: 1, y: 0 }
            )];
    }

    // Returns the first snake segment
    GetFirstSegment() {
        return this.segments[0];
    }

    // Returns the last snake segment
    GetLastSegment() {
        return this.segments[this.segments.length - 1];
    }

    Extend() {
        var seg0 = this.GetFirstSegment();
        seg0.p0.x += seg0.dir.x * 5;
        seg0.p0.y += seg0.dir.y * 5;
    }

    // Makes one step of the snake
    Step() {
        var seg0 = this.GetFirstSegment();
        var dx = this.speed * seg0.dir.x;
        var dy = this.speed * seg0.dir.y;
        seg0.p0.x += dx;
        seg0.p0.y += dy;

        var seg1 = this.GetLastSegment();
        var dx = this.speed * seg1.dir.x;
        var dy = this.speed * seg1.dir.y;
        seg1.p1.x += dx;
        seg1.p1.y += dy;
        if (seg1.Length() < 5) {
            this.segments.pop();
        }
    }

    // Returns true if snake head is inside the box
    InsideBox(box) {
        var x = this.segments[0].p0.x;
        var y = this.segments[0].p0.y;
        return x >= 0
            && x <= box.width
            && y >= 0
            && y <= box.height;
    }

    // Returns true if the first segment intersects the snake
    Intersect() {
        var seg0 = this.GetFirstSegment();
        for (var i = 2; i < this.segments.length; i++) {
            if (seg0.Intersect(this.segments[i])) {
                return true;
            }
        }
        return false;
    }

    // Turns snake head
    Turn(dir) {
        var seg = this.GetFirstSegment();
        var dotProduct = seg.dir.x * dir.x + seg.dir.y * dir.y;
        const eps = 1e-3;
        if (Math.abs(dotProduct) <= eps) {
            var p0 = { x: seg.p0.x, y: seg.p0.y };
            var p1 = { x: seg.p0.x, y: seg.p0.y };
            var newSeg = new Segment(p0, p1, dir);
            this.segments.unshift(newSeg);
        }
    }
}

class Game {
    constructor() {
        this.box = document.getElementById('box');
        this.graphics = box.getContext('2d');
        this.snake = new Snake();
        this.appleColor = '#00FF00';
        this.apples = [];
        this.score = 0;
    }

    // Draws all items in the game
    Draw() {
        this.graphics.clearRect(0, 0, this.box.width, this.box.height);
        this.graphics.beginPath();
        this.graphics.lineCap = 'round';
        this.graphics.lineWidth = this.snake.width;
        this.graphics.strokeStyle = this.snake.color;
        for (var i = 0; i < this.snake.segments.length; i++) {
            var seg = this.snake.segments[i];
            this.graphics.moveTo(seg.p0.x, seg.p0.y);
            this.graphics.lineTo(seg.p1.x, seg.p1.y);
            this.graphics.stroke();
        }
        this.graphics.strokeStyle = this.appleColor;
        for (var i = 0; i < this.apples.length; i++) {
            var x = this.apples[i].x;
            var y = this.apples[i].y;
            this.graphics.beginPath();
            this.graphics.arc(x, y, 2, 0, 2 * Math.PI);
            this.graphics.stroke();
        }
        this.graphics.closePath();
    }

    // Adds apples to the game engine
    AddApples() {
        if (this.apples.length >= 10) {
            return;
        }
        var min = 10;
        var max = this.box.width - 10;
        var x = Math.floor(Math.random() * (max - min + 1)) + min;
        var y = Math.floor(Math.random() * (max - min + 1)) + min;
        var apple = new Apple(x, y);
        this.apples.push(apple);
    }

    // Removes apple if it meets the snake
    EatApple() {
        var x0 = this.snake.segments[0].p0.x;
        var y0 = this.snake.segments[0].p0.y;
        for (var i = 0; i < this.apples.length; i++) {
            var apple = this.apples[i];
            var distance = Math.hypot(apple.x - x0, apple.y - y0);
            if (distance < 10) {
                this.apples.splice(i, 1);
                this.snake.Extend();
                this.score++;
                $('#score').text(this.score);
            }
        }
    }

    // Updates one frame
    Process() {
        this.snake.Step();
        if (!this.snake.InsideBox(this.box) || this.snake.Intersect()) {
            this.Stop();
            return;
        }
        this.EatApple();
        this.AddApples();
        this.Draw();
    }

    // Starts the game
    Start() {
        this.timer = setInterval(this.Process.bind(this), 100);
    }

    // Stops the game and shows "Gane over!"
    Stop() {
        clearInterval(this.timer);
        this.graphics.font = '30px Arial';
        this.graphics.textAlign = 'center';
        this.graphics.fillStyle = 'red';
        this.graphics.fillText('Game over!', this.box.width / 2, this.box.height / 2);
        var sound = document.getElementById('player');
        sound.play();
    }

    // Keydown event handler
    OnKeyDown(event) {
        switch (event.which) {
            case 37:
                this.snake.Turn({ x: -1, y: 0 });
                break;
            case 38:
                this.snake.Turn({ x: 0, y: -1 });
                break;
            case 39:
                this.snake.Turn({ x: 1, y: 0 });
                break;
            case 40:
                this.snake.Turn({ x: 0, y: 1 });
                break;
            default:
        }
    }
}

$(function () {
    var game = new Game();
    $(document).keydown(game.OnKeyDown.bind(game));
    game.Start();
});