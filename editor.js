/* ---- Story editor ---- */

function getEditor() {
	return document.getElementById('storyEditor');
}

function getEditorText() {
	let e = getEditor();
	return e ? e.innerText : '';
}

function clearEditor() {
	let e = getEditor();
	if (e) e.innerHTML = '';
	let t = document.getElementById('storyTitle');
	if (t) t.value = '';
	localStorage.removeItem('story');
	localStorage.removeItem('storyTitle');
	updateWordCount();
}

function format(cmd) {
	document.execCommand(cmd, false, null);
	getEditor().focus();
	saveDraft();
}

function insertSeparator() {
	document.execCommand('insertHorizontalRule', false, null);
	getEditor().focus();
	saveDraft();
}

function saveDraft() {
	let e = getEditor();
	if (e) localStorage.story = e.innerHTML;
	let t = document.getElementById('storyTitle');
	if (t) localStorage.storyTitle = t.value;
}

function focusStoryTitle() {
	let t = document.getElementById('storyTitle');
	if (t) t.focus({ preventScroll: true });
}

function updateWordCount() {
	let el = document.getElementById('wordCount');
	if (!el) return;
	let words = getEditorText().trim().split(/\s+/).filter(Boolean).length;
	el.innerText = words + ' / 1500 words';
	el.classList.toggle('over-limit', words > 1500);
}

// One em space, used as the Tab indent character. It survives HTML whitespace
// collapsing and is treated as whitespace by \s, so it never counts as a word.
const INDENT_CHAR = ' ';

function initEditor() {
	let e = getEditor();
	if (!e) return;

	// Enter creates a new <p> (paragraph spacing); Shift+Enter stays a <br>.
	try { document.execCommand('defaultParagraphSeparator', false, 'p'); } catch (err) { /* ignore */ }

	if (localStorage.story) e.innerHTML = localStorage.story;
	let t = document.getElementById('storyTitle');
	if (t && localStorage.storyTitle) t.value = localStorage.storyTitle;

	e.addEventListener('input', function () { saveDraft(); updateWordCount(); });
	if (t) t.addEventListener('input', saveDraft);

	// Paste as plain text so external markup can't pollute the editor.
	e.addEventListener('paste', function (ev) {
		ev.preventDefault();
		let text = (ev.clipboardData || window.clipboardData).getData('text/plain');
		document.execCommand('insertText', false, text);
	});

	e.addEventListener('keydown', function (ev) {
		// Bold / Italic / Underline shortcuts (Ctrl on Win/Linux, Cmd on Mac).
		if ((ev.ctrlKey || ev.metaKey) && !ev.altKey) {
			let cmd = { b: 'bold', i: 'italic', u: 'underline' }[ev.key.toLowerCase()];
			if (cmd) {
				ev.preventDefault();
				format(cmd);
				return;
			}
		}

		// Tab indents; Shift+Tab removes a preceding indent.
		if (ev.key !== 'Tab') return;
		ev.preventDefault();
		if (ev.shiftKey) {
			let sel = window.getSelection();
			let node = sel.anchorNode;
			if (sel.isCollapsed && node && node.nodeType === 3 &&
			    sel.anchorOffset > 0 && node.textContent[sel.anchorOffset - 1] === INDENT_CHAR) {
				let range = sel.getRangeAt(0);
				range.setStart(node, sel.anchorOffset - 1);
				range.deleteContents();
			}
		} else {
			document.execCommand('insertText', false, INDENT_CHAR);
		}
		saveDraft();
		updateWordCount();
	});

	updateWordCount();
}

/* ---- Export (download / copy) ---- */

function escapeHtml(s) {
	return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function slugify(s) {
	return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
}

// Strip everything but basic formatting tags from the editor HTML.
function sanitizeStoryHtml(html) {
	let allowed = { B: 1, STRONG: 1, I: 1, EM: 1, U: 1, P: 1, BR: 1, DIV: 1, HR: 1 };
	let tmp = document.createElement('div');
	tmp.innerHTML = html;
	(function walk(node) {
		Array.prototype.slice.call(node.childNodes).forEach(function (child) {
			if (child.nodeType !== 1) return;
			if (!allowed[child.tagName]) {
				while (child.firstChild) node.insertBefore(child.firstChild, child);
				node.removeChild(child);
			} else {
				while (child.attributes.length) child.removeAttribute(child.attributes[0].name);
				walk(child);
			}
		});
	})(tmp);
	return tmp.innerHTML;
}

function getSessionPrompt() {
	let key = localStorage.protagonist || getProtagonistKey();
	return {
		name: protagonists[key].name,
		genre: localStorage.genre || '',
		setting: localStorage.setting || '',
		character: localStorage.character || '',
		constraint: localStorage.constraint || ''
	};
}

function promptLines(p) {
	let lines = [];
	if (p.genre) lines.push('Genre: ' + p.genre);
	if (p.setting) lines.push('Setting: ' + p.setting);
	if (p.character) lines.push('Character: ' + p.character);
	if (p.constraint) lines.push('Challenge: ' + p.constraint);
	return lines;
}

function buildShareHtml(title, p, storyHtml) {
	let h = '';
	if (title) h += '<h1>' + escapeHtml(title) + '</h1>';
	h += '<p><em>A ' + escapeHtml(p.name) + ' adventure</em></p>';
	let lines = promptLines(p);
	if (lines.length) h += '<p>' + lines.map(escapeHtml).join('<br>') + '</p>';
	h += '<hr><div>' + storyHtml + '</div>';
	return h;
}

function buildShareText(title, p, storyText) {
	let parts = [];
	if (title) parts.push(title);
	parts.push('A ' + p.name + ' adventure');
	let lines = promptLines(p);
	if (lines.length) parts.push(lines.join('\n'));
	parts.push('');
	parts.push(storyText);
	return parts.join('\n');
}

function downloadStory() {
	let title = (document.getElementById('storyTitle').value || '').trim();
	let p = getSessionPrompt();
	let storyHtml = sanitizeStoryHtml(getEditor().innerHTML);
	let docTitle = title || (p.name + ' Story');
	let style = 'body{font-family:Georgia,serif;max-width:40rem;margin:2rem auto;padding:0 1rem;line-height:1.6;color:#222}'
	          + 'hr{border:none;border-top:1px solid #ccc;margin:1.5rem 0}em{color:#555}';
	let full = '<!doctype html><html lang="en"><head><meta charset="UTF-8">'
	         + '<meta name="viewport" content="width=device-width, initial-scale=1.0">'
	         + '<title>' + escapeHtml(docTitle) + '</title><style>' + style + '</style></head><body>'
	         + buildShareHtml(title, p, storyHtml) + '</body></html>';
	let blob = new Blob([full], { type: 'text/html' });
	let a = document.createElement('a');
	a.href = URL.createObjectURL(blob);
	a.download = (slugify(docTitle) || 'zane-legends-story') + '.html';
	document.body.appendChild(a);
	a.click();
	a.remove();
	URL.revokeObjectURL(a.href);
}

function copyStory() {
	let title = (document.getElementById('storyTitle').value || '').trim();
	let p = getSessionPrompt();
	let html = buildShareHtml(title, p, sanitizeStoryHtml(getEditor().innerHTML));
	let text = buildShareText(title, p, getEditorText());
	if (navigator.clipboard && window.ClipboardItem) {
		navigator.clipboard.write([new ClipboardItem({
			'text/html': new Blob([html], { type: 'text/html' }),
			'text/plain': new Blob([text], { type: 'text/plain' })
		})]).then(copied, function () { fallbackCopy(text); });
	} else {
		fallbackCopy(text);
	}
}

function fallbackCopy(text) {
	let ta = document.createElement('textarea');
	ta.value = text;
	ta.style.position = 'fixed';
	ta.style.opacity = '0';
	document.body.appendChild(ta);
	ta.select();
	try { document.execCommand('copy'); copied(); } catch (e) { /* ignore */ }
	ta.remove();
}

function copied() {
	let btn = document.getElementById('copyBtn');
	if (!btn || btn.dataset.busy) return;
	btn.dataset.busy = '1';
	let orig = btn.innerHTML;
	btn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
	setTimeout(function () { btn.innerHTML = orig; delete btn.dataset.busy; }, 1500);
}
