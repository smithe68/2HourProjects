import $ from 'jquery';

const $state = $('#state');
const $roomName = $('#roomName');
const $enemy = $('#enemy');
const $desc = $('#desc');

let gameState: GameState | null = null;
let rooms: Room[] | null = null;
let enemies: Enemy[] | null = null;

/*
    We start out inside a cave dungeon
    Centipede bear is final boss
*/

enum EnemyType {
    Basic,
    Moderate,
    Advanced,
    Boss
}

interface Enemy {
    name: string,
    hitPoints: number,
    strength: number,
    type: EnemyType
}

interface Room {
    name: string,
    desc: string,
    items: string[],
    interactables: string[],
    enemies: string[]
}

class GameState {
    currentRoom: Room;
    previousRoom: Room | null;
    inCombat: boolean;
    health: number;
    strength: number;
    enemies: Enemy[] | null;
    currentEnemy: Enemy | null;
    healthPotions: number;

    constructor(firstRoom: Room, previousRoom: Room | null) {
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

function appendMessage(message: string) {
    let p = document.createElement('p');
    p.innerHTML = message;
    $state.append(p);
}

const fightFunctions: { [key: string]: Function; } = {
    "attack": () => {
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
                gameState.strength += (Math.round(Math.random() * gameState.currentEnemy.strength / 2)) + 5;
                gameState.enemies?.pop();
                if (gameState.enemies === null) return;
                if (gameState.enemies.length > 0) {
                    gameState.currentEnemy = gameState.enemies[0];
                } else {
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
}

const commandFunctions: { [key: string]: Function; } = {

    "options": () => displayOptions(),
    "look": () => setRoomInfo(),
    "move next": () => {
        if (gameState === null) return;
        if (rooms === null) return;
        gameState.previousRoom = gameState.currentRoom;
        gameState.currentRoom = rooms[Math.round(Math.random() * (rooms?.length - 1))];
        $roomName.html(gameState.currentRoom.name);
        $desc.html(gameState.currentRoom.desc);
        $enemy.html('Enemies: ???');
        gameState.enemies = getEnemies();
    },
    "move previous": () => {
        if (gameState === null) return;
        if (gameState.previousRoom === null) return;

        let temp: Room = gameState.currentRoom;
        gameState.currentRoom = gameState.previousRoom;
        gameState.previousRoom = temp;
        gameState.enemies = null;
        setRoomInfo();

    },
    "fight": () => {
        if (gameState === null) return;
        gameState.enemies = getEnemies();
        if (gameState.enemies !== null && gameState.enemies.length > 0) {
            gameState.currentEnemy = gameState.enemies[0];
            appendMessage("You have entered combat, you cannot run your only options are victory or death");
            gameState.inCombat = true;
        } else {
            appendMessage("There are no enemies in this room!");
        }
    }
};

function getEnemies(): Enemy[] | null {
    if (gameState === null || enemies === null) return null;
    if (gameState.currentRoom.enemies === null) return null;
    if (gameState.currentRoom.enemies.length <= 0) return null;

    let newEnemies = enemies.filter(e => e.type.toString() ==
        gameState?.currentRoom.enemies[0]);

    let roomEnemies: Enemy[] = [newEnemies[Math.round(Math.random() * (newEnemies.length - 1))],
    newEnemies[Math.round(Math.random() * (newEnemies.length - 1))]];

    return roomEnemies;
}

function setRoomInfo() {
    if (gameState === null) return;
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

$('#input').keypress((ev) => {
    if (ev.keyCode === 13) {
        let $input = $('#input');
        let keys = Object.keys(gameState?.inCombat ?
            fightFunctions : commandFunctions);

        let val = $input.val();
        if (typeof val === "string") {
            val = val.toLowerCase();
            if (keys.includes(val)) {
                if (gameState?.inCombat) {
                    fightFunctions[val]();
                }
                else {
                    commandFunctions[val]();
                }

                $input.val('');
                if (gameState === null) return;
            }
        } else {
            displayOptions();
        }
    }
});

$(async () => {
    rooms = (await (await fetch("rooms.json")).json()).rooms;
    enemies = (await (await fetch("enemies.json")).json()).enemies;
    if (rooms === null) return;
    gameState = new GameState(rooms[0], null);
    gameState.start();
});

