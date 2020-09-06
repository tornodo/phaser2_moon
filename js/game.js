/*
 *  微信： tornodo
 *  博客：https://www.jianshu.com/u/1b05a5363c32
 *  微信公众号： 工匠前沿
 */

var game = new Phaser.Game(600, 600, Phaser.AUTO, 'game');

game.states = {};
// 引导
game.states.boot = function() {
    this.preload = function() {
        this.load.image('loading', 'assets/image/progress.png');
    	this.load.image('day', 'assets/bg/day.png');
    },
    this.create = function() {
    	game.state.start('preloader');
    }
}
// 用来显示资源加载进度
game.states.preloader = function() {
    this.preload = function() {
    	this.add.sprite(0, 0, 'day');
        var loadingSprite = this.add.sprite((this.world.width - 311) / 2, this.world.height / 2, 'loading');
        this.load.setPreloadSprite(loadingSprite, 0);
        this.load.image('night', 'assets/bg/night.png');
        this.load.image('player', 'assets/image/b.png');
        this.load.image('s1', 'assets/mooncake/11.png');
        this.load.image('s2', 'assets/mooncake/22.png');
        this.load.image('1', 'assets/mooncake/1.png');
        this.load.image('2', 'assets/mooncake/2.png');
        this.load.image('3', 'assets/mooncake/3.png');
        this.load.image('4', 'assets/mooncake/4.png');
        this.load.image('5', 'assets/mooncake/5.png');
        this.load.image('6', 'assets/mooncake/6.png');
        this.load.image('7', 'assets/mooncake/7.png');
        this.load.image('message', 'assets/menu/message.png')
        this.load.image('button', 'assets/image/button.png');
        this.load.audio('bang', 'assets/audio/bang.wav');
        this.load.audio('music', 'assets/audio/675.mp3');
		this.load.bitmapFont('font', 'assets/font/font_0.png', 'assets/font/font.fnt');
    },
    this.create = function() {
    	game.state.start('menu');
    }
}

// 游戏菜单
game.states.menu = function() {
    this.create = function() {
        this.add.sprite(0, 0, 'day');
    	var menu = this.add.sprite(0,0, 'message');
        menu.x = (game.width - menu.width) / 2;
        menu.y = (game.height - menu.height) / 2;
        var button = this.add.button(0, 0, 'button', this.startGame);
        button.x = menu.x + (menu.width - button.width) / 2;
        button.y = menu.y + menu.height - button.height + 30;
    },
    this.startGame = function() {
    	game.state.start('start');
    }
}

//游戏界面
game.states.start = function() {
    this.preload = function() {
        this.level = 1;//等级，默认从1开始
        this.score = 0; //得分
        this.scoreText;//得分的文字说明，添加到舞台上
        this.topScore = 0;//最高得分
        this.speed = 1000;//月饼的滚动速度，默认1000豪秒
        this.dropSpeed = 10000;//吃货的下落速度，默认10000毫秒
        this.changeBGScore = 0;
    },
    this.create = function() {
        this.night = this.add.sprite(0, 0, 'night');
		this.night.visible = false;
        this.day = this.add.sprite(0, 0, 'day'); // 添加背景图片
        this.bang = this.add.audio('bang'); // 添加撞击音乐
        this.music = this.add.audio('music'); // 添加背景音乐
        this.music.play('', 0, 1, true); // 一直播放背景音乐
        this.input.maxPointers = 1; // 只能单指点击屏幕或鼠标（非多人游戏）
        game.physics.startSystem(Phaser.Physics.ARCADE); // 启动物理引擎
        this.moonGroup = game.add.group();//创建月饼分组
        this.moonGroup.enableBody = true;
        this.addPlayer();
        this.addMoon();
        this.scoreText = game.add.text(10, 10, "-", {
            fill: "#000000"
        });
        this.topScore = localStorage.getItem("topScore") === null ? 0 : localStorage.getItem("topScore");
        this.updateScore();
        game.physics.arcade.collide(this.player, this.moonGroup);//对吃货和月饼组的月饼进行碰撞检测
    },
    this.update = function() {
        //对吃货和月饼组的月饼进行碰撞检测
        game.physics.arcade.overlap(this.player, this.moonGroup, this.collectMoon, null, this);
    }
    this.addPlayer = function() {
        this.player = this.add.sprite(0, 0, 'player');
        window.player = this.player;
        game.physics.arcade.enable(this.player);
        this.player.anchor.set(0.5);
        this.player.x = game.width / 2;
        this.player.y = game.height - this.player.height - 150;
        this.playerTween = game.add.tween(this.player).to({ y : game.height }, this.dropSpeed, 'Linear', true);
        this.playerTween.onComplete.add(this.gameOver, this);
        game.input.onDown.add(this.fire, this);
    },
    this.fire = function() {
        game.input.onDown.remove(this.fire, this);
        this.playerTween.stop();
        this.player.isFlying = true;
        this.playerTween = game.add.tween(this.player).to({ y : -this.player.height }, 500, 'Linear', true);
        this. playerTween.onComplete.add(this.gameOver, this);
    },
    this.addMoon = function() {
        this.moon;
        if (this.score > 0 && this.score % 10 == 0) {
            var name = game.rnd.between(0, 1) === 0 ? 's1' : 's2';
            this.moon = this.moonGroup.create(0, 0, name);
            this.moon.name = 'special';
            game.physics.arcade.enable(this.moon);
        } else {
            var index = game.rnd.between(1, 7);//随机一个1到7的数字，好创建对应数字的月饼
            this.moon = this.moonGroup.create(0, 0, index.toString());//创建月饼
        }
        this.moon.anchor.set(0.5); // 设置演员锚点为中心点
        var x = game.width - this.moon.width / 2;
        var y = -this.moon.height / 2;
        this.moon.x = x;
        this.moon.y = y;
        var moonEnterTween = game.add.tween(this.moon).to({y : game.height / 2 - this.level * 5}, 
            game.rnd.between(500, 1000), 'Bounce', true);
        moonEnterTween.onComplete.add(this.moveMoon, this, 0, this.moon);
    },
    this.moveMoon = function(moon) {
        this.playerSpeed(moon);
        this.currentMoonSpeed = (game.width - moon.width) / this.speed;
        moonTween = game.add.tween(moon).to({
            x : moon.width / 2,
            angle : -720
        }, this.speed, Phaser.Easing.Cubic.InOut, true);
        
        moon.moving = true;
        moonTween.onUpdateCallback(this.autoCalc, this);
        moonTween.yoyo(true, 0);
        moonTween.repeat(50, 0);
    },
    this.collectMoon = function(player, moon) {
        this.playerTween.stop();
        if(moon.name === 'special') {
            this.score += 5;
            this.changeBGScore += 5;
        } else {
            this.score += 1;
            this.changeBGScore += 1;
        }
        if (this.changeBGScore >= 20) {
            this.changeBGScore = 0;
            if (this.day.visible === false) {
                this.day.visible = true;
                this.night.visible = false;
            } else {
                this.day.visible = false;
                this.night.visible = true;
            }
        }
        player.isFlying = false;
        moon.moving = false;
        this.bang.play();//播放吃到月饼的声音
        moon.kill();//销毁月饼
        player.kill();//销毁吃货
        this.addMoon(); //添加一个新的月饼
        this.addPlayer();//添加一个新的吃货
        if(this.score - (this.level - 1) * 10 >= 10) {
            this.level += 1;
            this.resetSpeed();
        } 
        this.updateScore();//更新得分
    },
    this.updateScore = function() {
        this.scoreText.text = "得分：" + this.score + "    最高得分：" + Math.max(this.score, this.topScore);
    },
    this.resetSpeed = function() {
        this.speed =  this.speed - 1;
        this.speed <= 500 ? 500 : this.speed;
        this.dropSpeed = this.dropSpeed - 1;
        this.dropSpeed <= 800 ? 800 : this.dropSpeed;
    },
    this.playerSpeed = function(moon) {
        this.currentPlayerSpeed = 0.9;//(game.height - player.height - 150 + player.height) / 500
        this.playerTime = (game.height - this.player.height - 150 - moon.y) / this.currentPlayerSpeed;
    },
    this.autoCalc = function() {
        _this = this;
        if (_this.player && _this.player.isFlying) {
            return;
        }
        //避免放置多个吃货
        var b = (_this.moon.x - 300) / _this.currentMoonSpeed;//计算月饼所需时间
        //所需时间如果小于100毫秒就发射吃货
        if (_this.moon.moving && Math.abs(_this.playerTime - b) <= 100){
            _this.fire();
        }
    },
    this.gameOver = function() {
        localStorage.setItem("topScore", Math.max(this.score, this.topScore));//记录最高得分
        this.updateScore();//更新显示分数
        this.music.stop();//停止播放背景音乐
        window.score = this.score;
        window.topScore = this.topScore;
        game.state.start('stop');//跳转到游戏结束的舞台
    }
}

game.states.stop = function() {
    this.create = function() {
        this.add.sprite(0, 0, 'day');
        var menu = this.add.sprite(0,0, 'message');
        menu.x = (game.width - menu.width) / 2;
        menu.y = (game.height - menu.height) / 2;
        var button = this.add.button(0, 0, 'button', this.startGame);
        button.x = menu.x + (menu.width - button.width) / 2;
        button.y = menu.y + menu.height - button.height + 30;
        this.scoreText = game.add.text(Math.max(30, menu.x + 10), menu.y - 50, "-", {
            fill: "#000000"
        });
        this.scoreText.text = "得分：" + window.score + "    最高得分：" + Math.max(window.score, window.topScore);
    },
    this.startGame = function() {
        game.state.start('start');
    }
}

game.state.add('boot', game.states.boot);
game.state.add('preloader', game.states.preloader);
game.state.add('menu', game.states.menu);
game.state.add('start', game.states.start);
game.state.add('stop', game.states.stop);
game.state.start('boot');