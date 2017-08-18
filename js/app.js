/**
 * Config variables on top of the file to be able to quickly find all important params
 */
var config = {
    // Enemies
    ENEMY_MIN_SPEED: 500,
    ENEMY_MAX_SPEED: 1500,
    ENEMIES_NUMBER: 10,

    // Player
    PLAYER_START_X: 300,
    PLAYER_START_Y: 470,
    PLAYER_MOVEMENT_X: 100,
    PLAYER_MOVEMENT_Y: 80,
    PLAYER_LIVES: 3,

    // Gems
    GEMS_ARRAY: ["gem-blue.png", "gem-green.png", "gem-orange.png"],
    GEMS_NUMBER: 10,

    // Board
    ELEMENT_HEIGHT: 50,
    ELEMENT_WIDTH: 50,
    BOARD_POSITION_X: [0, 100, 200, 300, 400, 500, 600],
    BOARD_POSITION_Y: [150, 230, 310, 390],
    BOARD_LEFT_BOUNDARY: 0,
    BOARD_TOP_BOUNDARY: 20,
    BOARD_RIGHT_BOUNDARY: 600,
    BOARD_BOTTOM_BOUNDARY: 470,

    // Stats
    FONT: "20pt Cabin Sketch",
    FONT_COLOR: "white",
    STATS_X: 0,
    STATS_Y: 50,
    STATS_W: 707,
    STATS_H: 45,

    STATS_LEVEL_X: 10,
    STATS_LEVEL_Y: 82,

    STATS_LIVES_X: 465,
    STATS_LIVES_Y: 82,

    STATS_GEMS_X: 370,
    STATS_GEMS_Y: 82
};

// Global params to keep backwards compatibility with Engine
var paused = true,
    dead = false,
    allEnemies = [],
    allGems = [];


/**
 * Parent Class for all graphic elements like Player, Enemy, Gem
 */
function Element(x, y, sprite) {
    console.log()
    this.sprite = sprite;
    this.x = x;
    this.y = y;
    this.height = config.ELEMENT_HEIGHT;
    this.width = config.ELEMENT_WIDTH;
}

Element.prototype.render = function () {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

/**
 * Enemy Class constructor
 * @param y Defines which row to put Enemy on
 * @constructor
 */
function Enemy(y) {
    // Set a random x position on the canvas
    var x = getRandomInt(-parseInt(config.ELEMENT_WIDTH * 3), -config.ELEMENT_WIDTH);
    Element.call(this, x, y, "images/enemy-bug.png");

    this.speed = this.getSpeed();
}

Enemy.prototype = Object.create(Element.prototype);

/**
 * Update the enemy's position, required method for game
 * @param dt Time delta between ticks param to keep game speed same on different CPUs
 */
Enemy.prototype.update = function (dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.x += this.speed * dt;
    if (this.x > config.BOARD_RIGHT_BOUNDARY + this.width * 2) {
        this.x = getRandomInt(-(this.width * 5), -this.width * 2);
    }
};

/**
 * Random speed for enemies based on the current level
 * @returns integer speed
 */
Enemy.prototype.getSpeed = function () {
    var level, min, max, speed = getRandomInt(config.ENEMY_MIN_SPEED, config.ENEMY_MAX_SPEED);
    if (level = LevelControl.getLevel()) {
        min = parseInt((config.ENEMY_MIN_SPEED * 10 * level.getCurrentLevel()) / 100);
        max = parseInt((config.ENEMY_MAX_SPEED * 10 * level.getCurrentLevel()) / 100);
        speed = getRandomInt(min, max);
    }
    return speed;
};

/**
 * Object to control (render, update, reset, etc.) all the enemies at a time
 */
var Enemies = (function () {
    var enemies = [];
    return {
        init: function (num) {
            // assign global allEnemies to support Engine
            enemies = allEnemies;
            Enemies.reset(num);
        },

        /**
         * Creates num of enemies on the level
         */
        produce: function (num) {
            if (!isNaN(parseInt(num))) {
                for (var i = 0; i < num; i++) {
                    var enemy = new Enemy(config.BOARD_POSITION_Y[getRandomInt(0, 3)]);
                    enemies.push(enemy);
                }
            }
        },

        /**
         * Reset state of enemies on the level
         * @param num Defines how many enemies to produce on the level
         */
        reset: function (num) {
            enemies = [];
            Enemies.produce(num);
        },

        /**
         * Shortcut to render all the enemies
         */
        render: function () {
            enemies.forEach(function (enemy) {
                enemy.render();
            });
        },

        /**
         * Shortcut to update all the enemies
         * @param dt Time delta between ticks param to keep game speed same on different CPUs
         */
        update: function (dt) {
            enemies.forEach(function (enemy) {
                enemy.update(dt);
            });
        },

        /**
         * Shortcut to check all the enemies for collisions
         * In case of collision calls for die() method of the Player object
         */
        checkCollisions: function () {
            var player = PlayerControl.getPlayer();
            enemies.forEach(function (enemy) {
                if (collision(player, enemy)) {
                    player.die();
                }
            });
        }
    };
})();

/**
 * Singleton pattern object to create and control Player object
 */
var PlayerControl = (function () {
    var instance;

    return {
        /**
         * Should be only one Player object
         * @returns Player
         */
        getPlayer: function () {
            if (!instance) {
                instance = new Player();
                // Disable constructor for singleton to avoid human mistakes
                instance.constructor = null;
            }
            return instance;
        },

        reset: function () {
            this.getPlayer().reset();
        },

        render: function () {
            this.getPlayer().render();
        },

        update: function (dt) {
            this.getPlayer().update(dt);
        },

        /**
         * If Player get upper border of the playground - run levelUp
         */
        checkCollisions: function () {
            if (this.getPlayer().y <= 70) {
                LevelControl.getLevel().levelUp();
            }
        }

    };
})();

function Player() {
    Element.call(this, config.PLAYER_START_X, config.PLAYER_START_Y, "images/char-boy.png");
    this.alive_sprite = "images/char-boy.png";
    this.dead_sprite = "images/char-boy-dead.png";
    this.lives = config.PLAYER_LIVES;
}

Player.prototype = Object.create(Element.prototype);

Player.prototype.reset = function () {
    this.x = config.PLAYER_START_X;
    this.y = config.PLAYER_START_Y;
};

Player.prototype.init = function () {
    this.lives = config.PLAYER_LIVES;
    this.reset();
};

Player.prototype.update = function (dt) {
    if (dead) {
        this.sprite = this.dead_sprite;
    } else {
        this.sprite = this.alive_sprite;
    }
};

Player.prototype.makeDead = function () {
    dead = true;
    setTimeout(function () {
        dead = false;
    }, 900);
};

/**
 * TODO: Game feature to be implemented
 */
Player.prototype.addLives = function (num) {
    return this.updateLives("add", num);
};

Player.prototype.dropLives = function (num) {
    return this.updateLives("drop", num);
};

Player.prototype.updateLives = function (type, num) {
    if (!isNaN(parseInt(num))) {
        if (type === "add") {
            this.lives += num;
        } else if (type === "drop") {
            this.lives -= num;
            if (this.lives <= 0) {
                level.endGame();
            }
        } else {
            return false;
        }
        return this.lives;
    }
    return false;
};

Player.prototype.die = function () {
    if (this.lives > 1) {
        this.makeDead();
        $("#dead").show().fadeOut();
        this.dropLives(1);
        App.reset();
    } else {
        LevelControl.endGame();
    }
};

/**
 * Based on the input and current state of the game - move the Player
 * @param input
 * @returns {boolean}
 */
Player.prototype.handleInput = function (input) {
    if (paused || dead) {
        console.log("Attempt to control player while game paused or player is dead");
        return false;
    }

    var new_y, new_x;
    switch (input) {
        case "up":
            new_y = this.y - config.PLAYER_MOVEMENT_Y;
            if (new_y >= config.BOARD_TOP_BOUNDARY) {
                this.y = new_y;
            }
            break;

        case "down":
            new_y = this.y + config.PLAYER_MOVEMENT_Y;
            if (new_y <= config.BOARD_BOTTOM_BOUNDARY) {
                this.y = new_y;
            }
            break;

        case "left":
            new_x = this.x - config.PLAYER_MOVEMENT_X;
            if (new_x >= config.BOARD_LEFT_BOUNDARY) {
                this.x = new_x;
            }
            break;

        case "right":
            new_x = this.x + config.PLAYER_MOVEMENT_X;
            if (new_x <= config.BOARD_RIGHT_BOUNDARY) {
                this.x = new_x;
            }
            break;
    }
};

var Gem = function (x, y) {
    var gemArray = config.GEMS_ARRAY;
    Element.call(this, x, y, "images/" + gemArray[getRandomInt(0, 2)]);
};

Gem.prototype = Object.create(Element.prototype);

Gem.prototype.clear = function () {
    this.x = -100;
};

Gem.prototype.reset = function () {
    gem = new Gem();
};

var Gems = (function () {
    var gems = [];
    return {
        init: function (num) {
            // assign global allGems to support Engine
            gems = allGems;
            Gems.reset(num);
        },

        produce: function (num) {
            if (!isNaN(parseInt(num))) {
                for (var i = 0; i < num; i++) {
                    var gem = new Gem(config.BOARD_POSITION_X[getRandomInt(0, 6)], config.BOARD_POSITION_Y[getRandomInt(0, 3)]);
                    gems.push(gem);
                }
            }
        },

        reset: function (num) {
            gems = [];
            Gems.produce(num);
        },

        render: function () {
            gems.forEach(function (gem) {
                gem.render();
            });
        },

        checkCollisions: function () {
            var player = PlayerControl.getPlayer();
            gems.forEach(function (gem) {
                if (collision(player, gem)) {
                    gem.clear();
                    StatsControl.getStats().addGems();
                }
            });
        }
    };
})();

/**
 * Singleton pattern object to create and control Level object
 */
var LevelControl = (function () {
    var instance;

    return {
        /**
         * Should be only one Player object
         * @returns Player
         */
        getLevel: function () {
            if (!instance) {
                instance = new Level();
                // Disable constructor for singleton to avoid human mistakes
                instance.constructor = null;
            }
            return instance;
        },

        reset: function () {
            this.getLevel().reset();
        },

        endGame: function () {
            this.getLevel().endGame();
        }
    };
})();


var Level = function () {
    this.level = 1;
};

Level.prototype.levelUp = function () {
    $("#levelup").show().fadeOut();
    this.level++;
    PlayerControl.reset();
    Gems.reset(this.getNumberGems());
    Enemies.reset(this.getEnemiesNumber());
};

Level.prototype.reset = function () {
    this.level = 1;
};

Level.prototype.endGame = function () {
    paused = true;
    PlayerControl.getPlayer().init();
    PlayerControl.getPlayer().makeDead();
    Enemies.reset(0);
    StatsControl.reset();
    LevelControl.reset();
    $("#gameover").show();
};

Level.prototype.getCurrentLevel = function () {
    return this.level;
};

Level.prototype.getEnemiesNumber = function () {
    return parseInt((config.ENEMIES_NUMBER * 10 * this.getCurrentLevel()) / 100);
};

Level.prototype.getNumberGems = function () {
    return parseInt((config.GEMS_NUMBER * 10 * this.getCurrentLevel()) / 100);
};

var StatsControl = (function () {
    var instance;

    return {
        getStats: function () {
            if (!instance) {
                instance = new Stats();
                instance.constructor = null;
            }
            return instance;
        },

        reset: function () {
            this.getStats().reset();
        },

        render: function () {
            this.getStats().render();
        }
    };
})();


/**
 * Stat class to contain, count and render current state of the game
 */
var Stats = function () {
    this.font = config.FONT;
    this.fontColor = config.FONT_COLOR;
    this.currentScore = 0;
    this.currentGems = 0;
};

Stats.prototype.drawString = function (string, x, y, align) {
    if (align != "start" && align != "end") {
        align = "start";
    }
    ctx.font = this.font;
    ctx.fillStyle = this.fontColor;
    ctx.textAlign = align;
    ctx.fillText(string, x, y);
};

Stats.prototype.render = function () {
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(config.STATS_X, config.STATS_Y, config.STATS_W, config.STATS_H);
    this.showLevel();
    this.showScore();
    this.showLives();
    this.showGems();
};

Stats.prototype.showLevel = function () {
    var currentLevel = LevelControl.getLevel().getCurrentLevel();
    this.drawString("Level " + currentLevel, config.STATS_LEVEL_X, config.STATS_LEVEL_Y);

};

Stats.prototype.getScore = function () {
    return this.currentScore;
};

Stats.prototype.showScore = function () {
    this.drawString(this.getScore(), 700, 82, "end");
};

Stats.prototype.addScore = function (num) {
    this.currentScore += num;
};

Stats.prototype.showLives = function () {
    var lives = PlayerControl.getPlayer().lives;
    this.drawString("x " + lives, config.STATS_LIVES_X, config.STATS_LIVES_Y, "start");
    ctx.drawImage(Resources.get("images/stat-heart.png"), 430, 62);
};

Stats.prototype.getGemsAmount = function () {
    return this.currentGems;
};

Stats.prototype.showGems = function () {
    this.drawString("x " + this.getGemsAmount(), config.STATS_GEMS_X, config.STATS_GEMS_Y, "start");
    ctx.drawImage(Resources.get("images/stat-gem.png"), 340, 62);
};

Stats.prototype.addGems = function () {
    this.currentGems++;
    this.addScore(300);
};

Stats.prototype.reset = function () {
    $("#gameover #score").html(this.currentScore);
    this.currentScore = 0;
    this.currentGems = 0;
};

var App = (function (global) {
    var doc = global.document,
        allowedKeys = {
            37: "left",
            38: "up",
            39: "right",
            40: "down"
        };

    function initScreens() {
        // Click handler for "Play Now"
        $("#play-game").click(function () {
            $("#start-screen").fadeOut("fast");
            global.paused = false;
            return false;
        });

        // Click handler for "Play Again" button
        $("#play-again").click(function () {
            $("#gameover").hide();
            paused = false;
        });


    }

    /**
     * Init player object and give it away to global scope to support engine.
     */
    function initPlayer() {
        global.player = PlayerControl.getPlayer();
        global.player.init();
    }

    /**
     * Init number of enemies and push into global allEnemies to support engine.
     */
    function initEnemies() {
        Enemies.init(config.ENEMIES_NUMBER);
    }

    function initGems() {
        Gems.init(config.GEMS_NUMBER);
    }

    function initLevel() {
        global.level = LevelControl.getLevel();
    }

    /**
     * Init statistics to show current state of the game
     */
    function initStat() {
        global.stats = StatsControl.getStats();
    }

    /**
     * This listens for key presses and sends the keys to your
     * Player.handleInput() method. You don"t need to modify this.
     */
    function initKeyboard() {
        doc.addEventListener("keyup", function (e) {
            PlayerControl.getPlayer().handleInput(allowedKeys[e.keyCode]);
        });
    }

    return {
        /**
         * Init all components of the App
         */
        init: function () {
            initScreens();
            initPlayer();
            initEnemies();
            initGems();
            initLevel();
            initStat();
            initKeyboard();
        },

        /**
         * Render all we need for App
         */
        renderEntities: function () {
            PlayerControl.render();
            Enemies.render();
            Gems.render();
            StatsControl.render();
        },

        /**
         * This is called by the update function and loops through all of the
         * objects within your allEnemies array as defined in app.js and calls
         * their update() methods. It will then call the update function for your
         * player object. These update methods should focus purely on updating
         * the data/properties related to the object. Do your drawing in your
         * render methods.
         */
        updateEntities: function (dt) {
            Enemies.update(dt);
            PlayerControl.update(dt);
        },

        reset: function () {
            PlayerControl.reset();
            Gems.reset(LevelControl.getLevel().getNumberGems());
            Enemies.reset(LevelControl.getLevel().getEnemiesNumber());
        },

        /**
         * Collision-check logic for whole App
         */
        checkCollisions: function () {
            Enemies.checkCollisions();
            Gems.checkCollisions();
            PlayerControl.checkCollisions();
        }
    };

})(this);

