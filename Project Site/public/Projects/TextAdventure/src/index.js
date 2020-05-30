"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jquery_1 = __importDefault(require("jquery"));
const $state = jquery_1.default('#state');
const $roomName = jquery_1.default('#roomName');
const $enemy = jquery_1.default('#enemy');
const $desc = jquery_1.default('#desc');
let gameState = null;
let rooms = null;
let enemies = null;
/*
    We start out inside a cave dungeon
    Centipede bear is final boss
*/
var EnemyType;
(function (EnemyType) {
    EnemyType[EnemyType["Basic"] = 0] = "Basic";
    EnemyType[EnemyType["Moderate"] = 1] = "Moderate";
    EnemyType[EnemyType["Advanced"] = 2] = "Advanced";
    EnemyType[EnemyType["Boss"] = 3] = "Boss";
})(EnemyType || (EnemyType = {}));
class GameState {
    constructor(firstRoom, previousRoom) {
        this.currentRoom = firstRoom;
        this.previousRoom = previousRoom;
        this.health = 100;
        this.inCombat = false;
        this.enemies = null;
        this.currentEnemy = null;
        this.strength = 4;
        this.healthPotions = 1;
    }
    start() {
        commandFunctions["look"]();
    }
}
function appendMessage(message) {
    let p = document.createElement('p');
    p.innerHTML = message;
    $state.append(p);
}
const fightFunctions = {
    "attack": () => {
        var _a;
        if (gameState !== null && gameState.currentEnemy !== null) {
            gameState.currentEnemy.hitPoints -= gameState.strength;
            appendMessage(`You hit the enemy for ${gameState.strength}hp!`);
            if (Math.random() > .8) {
                gameState.health -= gameState.currentEnemy.strength;
                appendMessage(`You were hit by the enemy for ${gameState.currentEnemy.strength}hp! Your hp is now ${gameState.health}`);
                if (gameState.health <= 0) {
                    appendMessage(`You have been slain`);
                }
            }
            if (gameState.currentEnemy.hitPoints <= 0) {
                appendMessage("you have slain the enemy and are awarded some strength");
                gameState.strength += (Math.round(Math.random() * gameState.currentEnemy.strength / 10));
                (_a = gameState.enemies) === null || _a === void 0 ? void 0 : _a.pop();
                if (gameState.enemies === null)
                    return;
                if (gameState.enemies.length > 0) {
                    gameState.currentEnemy = gameState.enemies[0];
                }
                else {
                    gameState.inCombat = false;
                }
            }
        }
    },
    "drink": () => {
        if (gameState != null) {
            if (gameState.healthPotions <= 0) {
                appendMessage("you are out of potions");
            }
            else {
                gameState.healthPotions -= 1;
                gameState.health = 100;
                appendMessage(`you drank a potion and are now at ${gameState.health}hp`);
            }
        }
    },
};
const commandFunctions = {
    "options": () => displayOptions(),
    "look": () => setRoomInfo(),
    "move next": () => {
        if (gameState === null)
            return;
        if (rooms === null)
            return;
        gameState.previousRoom = gameState.currentRoom;
        gameState.currentRoom = rooms[Math.round(Math.random() * ((rooms === null || rooms === void 0 ? void 0 : rooms.length) - 1))];
        $roomName.html(gameState.currentRoom.name);
        $desc.html(gameState.currentRoom.desc);
        $enemy.html('Enemies: ???');
        gameState.enemies = getEnemies();
    },
    "move previous": () => {
        if (gameState === null)
            return;
        if (gameState.previousRoom === null)
            return;
        let temp = gameState.currentRoom;
        gameState.currentRoom = gameState.previousRoom;
        gameState.previousRoom = temp;
        gameState.enemies = null;
        setRoomInfo();
    },
    "fight": () => {
        if (gameState === null)
            return;
        gameState.enemies = getEnemies();
        if (gameState.enemies !== null && gameState.enemies.length > 0) {
            gameState.currentEnemy = gameState.enemies[0];
            appendMessage("You have entered combat, you cannot run your only options are victory or death");
            gameState.inCombat = true;
        }
        else {
            appendMessage("There are no enemies in this room!");
        }
    }
};
function getEnemies() {
    if (gameState === null || enemies === null)
        return null;
    if (gameState.currentRoom.enemies === null)
        return null;
    if (gameState.currentRoom.enemies.length <= 0)
        return null;
    let newEnemies = enemies.filter(e => e.type.toString() == (gameState === null || gameState === void 0 ? void 0 : gameState.currentRoom.enemies[0]));
    let roomEnemies = [newEnemies[Math.round(Math.random() * (newEnemies.length - 1))],
        newEnemies[Math.round(Math.random() * (newEnemies.length - 1))]];
    return roomEnemies;
}
function setRoomInfo() {
    if (gameState === null)
        return;
    $roomName.html(gameState.currentRoom.name);
    $desc.html(gameState.currentRoom.desc);
    if (gameState.enemies !== null && gameState.enemies.length > 0) {
        if (gameState.enemies[0] !== undefined) {
            $enemy.html(`Enemy: ${gameState.enemies[0].name}\n` +
                `Hit Points: ${gameState.enemies[0].hitPoints}\n` +
                `Strength: ${gameState.enemies[0].type}`);
        }
    }
    else {
        $enemy.html("Enemy: None");
    }
}
function displayOptions() {
    appendMessage(`What you can currently do is ${Object.keys(commandFunctions)}`);
}
jquery_1.default('#input').keypress((ev) => {
    if (ev.keyCode === 13) {
        let $input = jquery_1.default('#input');
        let keys = Object.keys((gameState === null || gameState === void 0 ? void 0 : gameState.inCombat) ?
            fightFunctions : commandFunctions);
        let val = $input.val();
        if (typeof val === "string") {
            val = val.toLowerCase();
            if (keys.includes(val)) {
                if (gameState === null || gameState === void 0 ? void 0 : gameState.inCombat) {
                    fightFunctions[val]();
                }
                else {
                    commandFunctions[val]();
                }
                $input.val('');
                if (gameState === null)
                    return;
            }
        }
        else {
            displayOptions();
        }
    }
});
jquery_1.default(async () => {
    rooms = (await (await fetch("rooms.json")).json()).rooms;
    enemies = (await (await fetch("enemies.json")).json()).enemies;
    if (rooms === null)
        return;
    gameState = new GameState(rooms[0], null);
    gameState.start();
});
