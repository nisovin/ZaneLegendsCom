
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

const constraints = [
	// Required element
	"Include a locked door",
	"Include a sudden storm",
	"Something important breaks",
	"Something goes missing",
	"Include a chase",
	"A secret is revealed",
	"Include a message or letter",
	"Include a countdown or deadline",
	// Ending
	"End on a twist",
	"End on a cliffhanger",
	"End worse than it began",
	"End with a revelation",
	// Tone & craft
	"Make it funny",
	"Make it eerie",
	"Make it bittersweet",
	"Tell it mostly through dialogue",
	"Keep the whole story in one location",
	"Write it in present tense",
	"Write in first-person"
];

const protagonists = {
	zane: {
		name: "Zane Legends",
		first: "Zane",
		opening: "Some people have a knack for finding strange things. Strange things always seem to find Zane Legends.",
		traits: [
			["Zane is afraid of stairs.", "This is not a simple fear but a debilitating phobia. Zane is absolutely terrified of stairs of all kinds, and will avoid them at all costs."],
			["Zane loves to eat.", "It doesn&rsquo;t matter what it is, where it came from, or whether it was actually offered to him. If it&rsquo;s edible, Zane will try it, and he&rsquo;ll almost always go back for seconds."],
			["Zane is impulsive.", "He tends to leap into any situation that presents itself without thinking too much about it. He gets himself into trouble, and has to figure out how to get back out of it again."],
			["Zane has an excellent sense of direction.", "It is also reliably wrong. He will set off without hesitation, leading the way with total confidence, and almost never in the right direction."],
			["There is an interesting scar on Zane&rsquo;s forehead.", "The scar is very visible, and is roughly shaped like a &ldquo;Y&rdquo;. The origin story of this scar is fascinating and exciting, but Zane never seems to get a chance to tell it."],
			["Zane often carries a ring of keys.", "There are dozens of them, of all shapes and sizes, and he has no idea what most of them open. Every so often, though, one of them fits a lock perfectly."],
			["Zane&rsquo;s preferred exclamation is &ldquo;Sausages!&rdquo;", "Sometimes adjectives or other words are added (for example, &ldquo;smoked sausages!&rdquo;). Zane uses it when excited, angry, or disappointed. Whatever the situation, if an exclamation is required, it&rsquo;s almost always &ldquo;Sausages!&rdquo;"]
		]
	},
	jane: {
		name: "Jane Legends",
		first: "Jane",
		opening: "Some people go looking for adventure. Adventure always seems to come looking for Jane Legends.",
		traits: [
			["Jane is afraid of clocks.", "This is not a simple unease but a genuine dread. Jane cannot stand to be near any clock, and will go out of her way to avoid them."],
			["Jane loves to eat.", "Jane fancies herself a great connoisseur, and will deliver a full review of every meal, whether anyone asked for it or not."],
			["Jane is stubborn.", "Once she has decided on something, nothing on earth will talk her out of it. This gets her into trouble, and then keeps her there long after she should have walked away."],
			["Jane always knows where she is.", "She simply never knows where she is going. She will set off with total confidence, and lead everyone somewhere else entirely by accident."],
			["There is an interesting scar on Jane&rsquo;s chin.", "It is roughly shaped like a &ldquo;K&rdquo;. She is delighted to tell anyone who asks how she got it, though the story is different each time."],
			["Jane carries a bundle of maps.", "There are dozens of them, of every place imaginable, and not one ever seems to match wherever she actually is. Every so often, though, one of them turns out to be useful."],
			["Jane&rsquo;s preferred exclamation is &ldquo;Biscuits!&rdquo;", "Sometimes other words are added (for example, &ldquo;burnt biscuits!&rdquo;). Jane uses it when excited, angry, or disappointed. Whatever the situation, if an exclamation is required, it is almost always &ldquo;Biscuits!&rdquo;"]
		]
	}
};

const defaultProtagonist = "zane";

function getProtagonistKey() {
	let checked = document.querySelector('input[name="protagonist"]:checked');
	if (checked && protagonists[checked.value]) return checked.value;
	let key = localStorage.protagonist;
	return (key && protagonists[key]) ? key : defaultProtagonist;
}

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
	localStorage['constraint'] = pickRandom(constraints);
	localStorage['protagonist'] = getProtagonistKey();

	seconds = 60 * 60;
}

function start() {
	countdown();
	clearInterval(timeout);
	timeout = setInterval(countdown, 1000);

	document.getElementById('genre').innerText = localStorage.genre;
	document.getElementById('setting').innerText = localStorage.setting;
	document.getElementById('character').innerText = localStorage.character;
	document.getElementById('constraint').innerText = localStorage.constraint || '';

	document.getElementById('storyPrep').style.display = 'none';
	document.getElementById('storyCriteria').style.display = 'block';

	if (seconds > 0) {
		let t = new Date();
		t.setSeconds(t.getSeconds() + seconds);
		let endTime = t.toLocaleTimeString();
		endTime = endTime.replace(/:[0-9]{2}( |$)/, '');
		document.getElementById('endTime').innerHTML = 'Time will run out at ' + endTime + '.';
	}
}

function pickRandom(array) {
	let i = Math.floor(Math.random() * array.length);
	return array[i];
}

function renderProtagonistOptions() {
	let container = document.getElementById('protagonistOptions');
	if (!container) return;
	let current = getProtagonistKey();
	let html = '';
	for (let key of Object.keys(protagonists)) {
		let checked = (key === current) ? ' checked' : '';
		html += '<label class="protagonist-option">'
		      + '<input type="radio" name="protagonist" value="' + key + '"' + checked
		      + ' onchange="selectProtagonist(this.value)"> '
		      + protagonists[key].name
		      + '</label>';
	}
	container.innerHTML = html;
	applyProtagonist(current);
}

function selectProtagonist(key) {
	if (!protagonists[key]) return;
	localStorage.protagonist = key;
	applyProtagonist(key);
}

function applyProtagonist(key) {
	let p = protagonists[key];

	let opening = document.getElementById('openingLine');
	if (opening) opening.innerText = p.opening;

	let names = document.getElementsByClassName('protagonist-name');
	for (let i = 0; i < names.length; i++) {
		names[i].innerText = p.name;
	}
	names = document.getElementsByClassName('protagonist-first');
	for (let i = 0; i < names.length; i++) {
		names[i].innerText = p.first;
	}

	let list = document.getElementById('traitsList');
	if (list) {
		let html = '';
		for (let t of p.traits) {
			html += '<li><strong>' + t[0] + '</strong><br>' + t[1] + '</li>';
		}
		list.innerHTML = html;
	}
}

function countdown() {
	seconds--;
	localStorage['seconds'] = seconds;
	if (seconds <= 0) {
		document.getElementById('timeRemaining').innerText = "Sausages! You did it!";
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

renderProtagonistOptions();

setTimeout(() => {
	if (localStorage.seconds) {
		seconds = parseInt(localStorage.seconds);
		start();
	}
}, 250);