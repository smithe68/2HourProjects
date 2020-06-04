var fishNames = [
	'Bubbles',
	'Nemo',
	'Jack',
	'Captain',
	'Finley',
	'Blue',
	'Moby',
	'Bubba',
	'Squirt',
	'Shadow',
	'Goldie',
	'Dory',
	'Ariel',
	'Angel',
	'Minnie',
	'Jewel',
	'Nessie',
	'Penny',
	'Crystal',
	'Ace',
	'Ajax',
	'Aldo',
	'Aqua',
	'Astra',
	'Azure',
	'Babel',
	'Bahari',
	'Batman',
	'Bayou',
	'Beau',
	'Blue',
	'Brizo',
	'Brook',
	'Bruce',
	'Buffy',
	'Calypso',
	'Casper',
	'Caspian',
	'Cayman',
	'Celeste',
	'Comet',
	'Cordelia',
	'Crimson',
	'Delta',
	'Dexter',
	'Diana',
	'Diva',
	'Draco',
	'Drake',
	'Einstein',
	'Electra',
	'Ella',
	'Elsa',
	'Fabian',
	'Fiona',
	'Genevieve',
	'Glimmer',
	'GreatWhite',
	'Grouper',
	'Hammerhead',
	'Haven',
	'Henry',
	'Hunter',
	'Hydra',
	'Isabella',
	'Jacques',
	'Jasper',
	'Johnson',
	'Jonah',
	'Juliet',
	'Jupiter',
	'Kai',
	'Kaiyo',
	'Kraken',
	'Leilani',
	'Luna',
	'Magnolia',
	'Mahi - Mahi',
	'Marina',
	'Misty',
	'Moana',
	'Moorea',
	'Morgan',
	'Murphy',
	'Neptune',
	'Orca',
	'Orion',
	'Oscar',
	'Penelope',
	'Plankton',
	'Poseidon',
	'Ripley',
	'River',
	'Romeo',
	'Sam',
	'Sebastian',
	'Selkie',
	'Silver',
	'Starlight',
	'Sydney',
	'Tallulah',
	'Tetra',
	'TidalWave',
	'Tsunami',
	'Ursula',
	'Veiltail',
	'Whale',
	'Xena',
	'Zeus',
	'Angie',
	'Annie',
	'Astro',
	'Baby',
	'Beluga',
	'Billie',
	'Bingo',
	'Bubba',
	'Cleo',
	'Coco',
	'Cookie',
	'Dobby',
	'Finn',
	'Flash',
	'Flipper',
	'Flounder',
	'Flower',
	'Freckles',
	'George',
	'Gordon',
	'Gracie',
	'Guppy',
	'Houdini',
	'Kiko',
	'Lenny',
	'Louie',
	'Lucky',
	'Marble',
	'Ollie',
	'Otter',
	'Paulie',
	'Popcorn',
	'Quimby',
	'Rex',
	'Rocky',
	'Roxy',
	'Salty',
	'Sammy',
	'Sandy',
	'Sassy',
	'Skippy',
	'Snapper',
	'Spike',
	'Spot',
	'Sprite',
	'Surfer',
	'Swimmer',
	'Toby',
	'Wavy',
	'Ziggy',
	'Coral'
];

const storyLines = [
	'New Aquerium opens up down the street it sucks - Local News',
	'Just went to the aquarium down the street kinda sucky - Homeless Woman',
	'Who pays to see a bunch up guppies at the aquarium... - internal monoluge',
	'Fish hut down the rode picking up steam...oh wait its an aquarium - mom',
	'wow they really have some sucky fish there boy am i not proud- dad',
	'ehh its aight... -me',
	'end of test story'
];

let currentMoney = 10;
let currentIncome = 0;

let maxMoney = 0;
let storyIntBoundry = 0;
let storyIntCurrent = 0;
let tankSize = 10;
let inTankSize = 0;

let fishTank = [[], [], [], [], [], [], []];

function addToFishTank(name, size, popularity, type) {
	let li = document.createElement('li');
	let n = document.createElement('span');
	n.innerHTML = name;
	let s = document.createElement('span');
	s.innerHTML = `${size.toFixed(2)}lb`;
	let w = document.createElement('span');
	w.innerHTML = `${popularity.toFixed(2)} kudos`;
	let t = document.createElement('span');
	t.innerHTML = type;

	li.append(n);
	li.append(s);
	li.append(w);
	li.append(t);

	document.getElementById('fish').append(li);
	document.getElementById('capacity').innerHTML = `capacity: ${inTankSize.toFixed(2)}/${tankSize.toFixed(2)}`;
}


const fishTypes = {
	'Guppy': [1, 1, 1],
	'Goldfish': [10, 4, 4],
	'Salmon': [80, 67, 6],
	'Ray': [169, 88, 6],
	'Dolphin': [300, 500, 80],
	'Shark': [1000, 4000, 200],
	'Whale': [10000, 40000, 2000],
};


function upgradeTankSize() {
	if (currentMoney >= 2 * tankSize) {
		tankSize += 10;
		currentMoney -= 2 * tankSize;
		document.getElementById('capacity').innerHTML = `capacity: ${inTankSize.toFixed(2)}/${tankSize.toFixed(2)}`;
	}
}

function buyFishType(type) {
	const fishStats = fishTypes[type];
	const keys = Object.keys(fishTypes);

	if (currentMoney >= fishStats[0] && tankSize > inTankSize) {
		fishTank[keys.indexOf(type)].push(new FishType(getFishName(), fishStats[0], fishStats[1], fishStats[2], type));
		currentMoney -= fishStats[0];
	}
}


class FishType {
	constructor(fishname, cost, popularity, size, type) {
		this.name = fishname;
		this.cost = cost;
		this.popularity = popularity + (Math.random() * 40000) % popularity;
		this.size = size + (Math.random() * 10000) % size;
		this.type = type;
		addToFishTank(this.name, this.size, this.popularity, this.type);
		inTankSize += this.size;
	}
}

function getFishName() {
	return fishNames[Math.round(Math.random() * 1000) % fishNames.length];
}

function tick() {
	let thisTickIncome = 0;
	for (let i = 0; i < fishTank.length; i++) {
		for (let j = 0; j < fishTank[i].length; j++) {
			let globalPopularity = Math.random();
			thisTickIncome += fishTank[i][j].popularity * globalPopularity;
		}
	}
	currentMoney += thisTickIncome;
	currentIncome = thisTickIncome;

	if (currentMoney > maxMoney) {
		maxMoney = currentMoney;
	}

	document.getElementById('money').innerHTML = `Money: $${currentMoney.toFixed(2)}`;
	document.getElementById('income').innerHTML = `Income: $${currentIncome.toFixed(2)}`;
}

function getStoryText() {
	if (maxMoney > storyIntBoundry && storyIntCurrent < storyLines.length) {
		storyIntCurrent++;
		storyIntBoundry += 500 * storyIntCurrent;
	}
	document.getElementById('storyline').innerHTML = storyLines[storyIntCurrent];
}

// Main
window.onload = () => {
	setInterval(tick, 2000);
	setInterval(getStoryText, 9999);
};
