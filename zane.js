
const genres = [
	"Adventure",
	"Crime",
	"Drama",
	"Fantasy",
	"Historical",
	"Mystery",
	"Romance",
	"Science Fiction",
	"Thriller",
	"Western"
];

const settings = [
	"In a bar",
	"On a beach",
	"At a celebration",
	"In a church",
	"In the dark",
	"In a dark alley",
	"In a desert",
	"In a forest",
	"In a graveyard",
	"In a government building",
	"At home",
	"In a hospital",
	"In a mansion",
	"At a market",
	"Middle of nowhere",
	"At night",
	"At a park",
	"In prison",
	"In a room",
	"At a school",
	"On a ship",
	"In a small town/village",
	"In a store",
	"In a storm",
	"On the streets",
	"Underground"
];

const characters = [
	"Angry person",
	"Animal",
	"Blind person",
	"Child",
	"Deaf person",
	"Doctor",
	"Drunk person",
	"Gambler",
	"Homeless person",
	"Immortal being",
	"Inanimate object",
	"Insane person",
	"Old person",
	"Optimistic person",
	"Pirate",
	"Political leader",
	"Magician",
	"Murderer",
	"Musician",
	"Mute",
	"Nobleman/Politician",
	"Religious figure",
	"Salesman",
	"Short/small person",
	"Soldier",
	"Supernatural being",
	"Tall/large person",
	"Thief",
	"Teacher",
	"Writer/Storyteller"
];

let seconds = 0;
let timeout = null;

function startStory(toTop) {
	randomlySelect();
	start();
	if (toTop) {
		document.getElementById('readyToWrite').scrollIntoView();
	}
}

function randomlySelect() {
	let genre = pickRandom(genres);
	let setting = pickRandom(settings);
	let character = pickRandom(characters);
	
	localStorage['genre'] = genre;
	localStorage['setting'] = setting;
	localStorage['character'] = character;
	
	seconds = 60 * 60;
}

function start() {
	countdown();
	clearInterval(timeout);
	timeout = setInterval(countdown, 1000);
	
	document.getElementById('genre').innerText = localStorage.genre;
	document.getElementById('setting').innerText = localStorage.setting;
	document.getElementById('character').innerText = localStorage.character;
	
	document.getElementById('storyPrep').style.display = 'none';
	document.getElementById('storyCriteria').style.display = 'block';
	
}

function pickRandom(array) {
	let i = Math.floor(Math.random() * array.length);
	return array[i];
}

if (seconds > 0) {
	let t = new Date();
	t.setSeconds(t.getSeconds() + seconds);
	let endTime = t.toLocaleTimeString();
	endTime = endTime.replace(/:[0-9]{2}( |$)/, '');
	document.getElementById('endTime').innerHTML = 'Time will run out at ' + endTime + '.';
}

function countdown() {
	seconds--;
	localStorage['seconds'] = seconds;
	if (seconds <= 0) {
		document.getElementById('timeRemaining').innerText = "TIME'S UP!";
		document.getElementById('progressBar').style.width = '0';
		clearInterval(timeout);
		localStorage.clear();
	} else {
		let min = Math.floor(seconds / 60);
		let sec = seconds - (min*60);
		let time = min + ':' + (sec < 10 ? '0' : '') + sec;
		let pct = seconds / (60*60) * 100;
		document.getElementById('timeRemaining').innerText = time;
		document.getElementById('progressBar').style.width = pct + '%';
	}
}

function reset() {
	clearInterval(timeout);
	document.getElementById('storyPrep').style.display = 'block';
	document.getElementById('storyCriteria').style.display = 'none';
	localStorage.clear();
}

setTimeout(() => {
	if (localStorage.seconds) {
		seconds = parseInt(localStorage.seconds);
		start();
	}
}, 250);