(function(){
    var ctx = null;//一个用来容纳2D绘图环境空变量
    var Game = {
        canvas:document.getElementById('canvas'),
        setup:function(){
            ctx = this.canvas.getContext('2d');
            this.width = this.canvas.width;
            this.height = this.canvas.height;
            this.init();
            Ctrl.init();
        },
        animate:function(){
            Game.play = setInterval(function(){
                Game.draw();
            },1000/60)
        },
        init:function(){
            //包含了所有的对象实例
            Background.init();
            Hub.init();
            Bricks.init();
            Paddle.init();
            Ball.init();
            this.animate();
        },
        draw:function(){
            //用于处理所有的更新并绘制对象的逻辑
            ctx.clearRect(0,0,this.width,this.height);//每次更新时，之前绘制的图形会被清除
            Background.draw();
            Bricks.draw();
            Hub.draw();
            Paddle.draw();
            Ball.draw();
        },
        levelUp:function(){
            Hub.lv++;
            Bricks.init();
            Ball.init();
        },
        levelLimit:function(lv){
            //将砖块限定为最高只能达到7行
            return lv>5?5:lv;
        }
    };
    //自此向下的这些对象包含了游戏的所有可视化对象
    var Background = {
        init:function(){
            this.ready = false;
            this.img = new Image();
            this.img.src = "background.jpg";
            this.img.onload = function(){
                //在事件中，this指的是事件源
                Background.ready = true;
            }
        },
        draw:function(){
            if(this.ready){
                ctx.drawImage(this.img,0,0);
            }
        }
    };
    var Bricks = {
        gap:2,
        col:5,
        w:80,
        h:15,
        init:function(){
            this.w = (Game.width-(Bricks.col-1)*Bricks.gap)/Bricks.col;
            this.row = 2+Game.levelLimit(Hub.lv);
            this.total = 0;
            this.count = new Array(this.row);
            for(var i=0;i<this.row;i++){
                this.count[i] = new Array(this.col);
                for(var j=0;j<this.col;j++){
                   this.count[i][j] = true;
                }
            }
        },
        draw:function(){
           for(var i=0;i<this.row;i++) {
               for(var j=0;j<this.col;j++){
                   if(this.count[i][j]!==false){
                       if(Ball.x>=this.x(j)&&Ball.x<=this.x(j)+this.w&&Ball.y-Ball.r>=this.y(i)&&Ball.y-Ball.r<=this.y(i)+this.h){
                           this.collide(i,j);
                           continue;
                       }
                       ctx.fillStyle = this.gradient(i);
                       ctx.fillRect(this.x(j),this.y(i),this.w,this.h);
                   }
               }
           }
           if(this.total == this.row*this.col){
               Game.levelUp();
           }
        },
        collide:function(i,j){
            this.total++;
            Hub.score++;
            this.count[i][j] = false;
            Ball.sy = -Ball.sy;
        },
        gradient:function(row){
            switch (row){
                case 0:
                    return this.gradientPurple?this.gradientPurple:this.gradientPurple = this.makeGradient(row,'#bd06f9','#9604c7');
                case 1:
                    return this.gradientRed?this.gradientRed:this.gradientRed = this.makeGradient(row,'#f9064a','#c7043b');
                case 2:
                    return this.gradientGreen?this.gradientGreen:this.gradientGreen = this.makeGradient(row,'#05fa15','#04c711');
                default:
                    return this.gradientOrange?this.gradientOrange:this.gradientOrange = this.makeGradient(row,'#faa105','#c77f04');
            }
        },
        makeGradient:function(row,color1,color2){
            var y = this.y(row);
            var grad = ctx.createLinearGradient(0,y,0,y+this.h);
            grad.addColorStop(0,color1);
            grad.addColorStop(1,color2);
            return grad;

        },
        x:function(col){
            return (this.w+this.gap)*col
        },
        y:function(row){
            return (this.h+this.gap)*row
        }
    };
    var Ball = {
        r:10,
        init:function(){
            this.x = 120;
            this.y = 120;
            this.sx = 1+0.4*Hub.lv;
            this.sy = -1-0.4*Hub.lv;
        },
        draw:function(){
            this.edges();
            this.collide();
            this.move();
            ctx.beginPath();
            ctx.arc(this.x,this.y,this.r,0,2*Math.PI);
            ctx.closePath();
            ctx.fillStyle = "#eee";
            ctx.fill();
        },
        //小球运动逻辑
        edges:function(){
            if(this.y<this.r){
                //游戏容器的上边界
                this.y = this.r;
                this.sy = -this.sy;
            }else if(this.y>Game.height){
                //游戏容器的下边界
                this.sy = this.sx = 0;
                this.y = this.x = 1000;
            }
            if(this.x<this.r){
                //游戏容器的左边界
                this.x = this.r;
                this.sx = -this.sx;
            }else if(this.x>Game.width-this.r){
                //游戏容器的右边界
                this.x = Game.width-this.r;
                this.sx = -this.sx;
            }
        },
        collide:function(){
            if(this.x>=Paddle.x&&this.x<=Paddle.x+Paddle.w&&this.y-this.r>=Paddle.y&&this.y-this.r<=Paddle.y+Paddle.h){
                this.sy = -this.sy;
                this.sx = 7*(this.x - (Paddle.x+Paddle.w/2))/Paddle.w
            }
        },
        move:function(){
            this.x+=this.sx;
            this.y+=this.sy;
        }
    };
    var Paddle = {
        w:90,
        h:18,
        r:9,
        init:function(){
            this.x = 100;
            this.y = 210;
            this.speed = 4;
        },
        draw:function(){
            this.move();
            ctx.beginPath();
            ctx.moveTo(this.x,this.y);
            ctx.lineTo(this.x+this.w,this.y);
            ctx.arc(this.x+this.w,this.y+this.r,this.r,-Math.PI/2,Math.PI/2);
            ctx.lineTo(this.x,this.y+this.h);
            ctx.arc(this.x,this.y+this.r,this.r,Math.PI/2,-Math.PI/2);
            ctx.closePath();
            ctx.fillStyle = "#eee";
            ctx.fill();
        },
        move:function(){
            if(this.x>-(this.w/2)&&this.x<Game.width-(this.w/2)&&Ctrl.left){
                this.x +=-this.speed;
            }else if(this.x>-(this.w/2)&&this.x<Game.width-(this.w/2)&&Ctrl.right){
                this.x +=this.speed;
            }
        }

    };
    var Hub = {
        init:function(){
            this.lv = 1;
            this.score = 0;
        },
        draw:function(){
            ctx.font = "12px 微软雅黑";
            ctx.fillStyle = "#fff";
            ctx.textAlign = "left";
            ctx.fillText('Score:'+this.score,5,Game.height-5);
            ctx.textAlign = "right";
            ctx.fillText('Lv:'+this.lv,Game.width-5,Game.height-5);
        }
    };
    var Ctrl = {
        init:function(){
            //键盘操控
            window.addEventListener('keydown',this.keyDown);
            window.addEventListener('keyup',this.keyUp);
            //鼠标操控
            window.addEventListener('mousemove',this.movePaddle);
            //触摸控制
            Game.canvas.addEventListener('touchstart',this.movePaddle);
            Game.canvas.addEventListener('touchmove',this.movePaddle);
            Game.canvas.addEventListener('touchmove',this.stopTouchScroll);
        },
        keyDown:function(event){
            switch(event.keyCode){
                case 37:
                    Ctrl.left = true;
                    break;
                case 39:
                    Ctrl.right = true;
                    break;
                default:
                    break;
            }
        },
        keyUp:function(event){
            switch(event.keyCode){
                case 37:
                    Ctrl.left = false;
                    break;
                case 39:
                    Ctrl.right = false;
                    break;
                default:
                    break;
            }
        },
        movePaddle:function(event){
            if(event.touches){
                var mouseX = event.touches[0].pageX;
            }else{
                var mouseX = event.pageX;
            }
            var canvasX = Game.canvas.offsetLeft;
            var paddleMid = Paddle.w/2;
            if(mouseX>canvasX&&mouseX<canvasX+Game.width){
                var newX = mouseX - canvasX;
                Paddle.x = newX - paddleMid;
            }
        },
        stopTouchScroll:function(event){
            event.preventDefault();
        }
    };
    window.onload = function(){
        Game.setup();
    }

})();