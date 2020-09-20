export const liveSearch = {
	linkSet: [],
	searchResults: [],
	focusedResult: 0,

	buildLinkSet() {
		const elementList = document
			.getElementById("links")
			.querySelectorAll(".links__link");

		class LinkItem {
			constructor(text, url) {
				this.text = text;
				this.url = url;
			}
		}

		for (const el of elementList) {
			// attaching click handlers and element ids
			el.onclick = gStartBase.open;

			// building linkset
			let text = el.innerText;
			this.linkSet.push(new LinkItem(text, el.dataset["url"]));
		}

		document
			.getElementById("quicksearch")
			.addEventListener("keyup", liveSearch.doLiveSearch.bind(this));
	},

	doLiveSearch(event) {
		event.preventDefault();
		const searchPhrase = event.target.value;
		const focused = this.focusedResult;

		switch (event.keyCode) {
			case 27:
				// escape key
				event.target.value = "";
				document.getElementById("quicksearchresults").style.visibility =
					"hidden";
				break;
			case 13:
				// enter key
				if (this.searchResults.length < 1) return;

				const linkId = this.searchResults[this.focusedResult];
				window.open(this.linkSet[linkId].url, gStartBase.target);
				break;
			case 38:
				// up key
				document.getElementById("quicksearch").setSelectionRange(100, 100);

				if (focused === 0) return;
				this.resultCursor(focused - 1);
				break;
			case 40:
				// down key
				if (focused > this.searchResults.length - 2) return;
				this.resultCursor(focused + 1);
				break;
			default:
				if (searchPhrase.length < 2) {
					this.searchResults = [];
					document.getElementById("quicksearchresults").innerHTML = "";
					document.getElementById("quicksearchresults").style.visibility =
						"hidden";
					return;
				}

				const { newResultSet, resultDisplay } = this.createResultSet(
					searchPhrase
				);

				this.focusedResult = 0;
				this.searchResults = [...newResultSet];

				document.getElementById(
					"quicksearchresults"
				).innerHTML = resultDisplay.join("");

				document.getElementById("quicksearchresults").style.visibility =
					"visible";

				newResultSet.forEach((_, ix) => {
					document.getElementById("qsr_" + ix).onclick = gStartBase.open;
				});

				break;
		}
	},

	createResultSet(searchPhrase) {
		const newResultSetByNameStart = [];
		const newResultSetByName = [];
		const newResultSetByUrl = [];

		const regex = new RegExp(searchPhrase, "i");

		this.linkSet.forEach((el, ix) => {
			const textMatch = el.text.search(regex);
			if (textMatch === 0) {
				newResultSetByNameStart.push(ix);
				return;
			}
			if (textMatch > 0) {
				newResultSetByName.push(ix);
				return;
			}
			if (el.url.search(regex) >= 0) newResultSetByUrl.push(ix);
		});

		const newResultSet = newResultSetByNameStart
			.concat(newResultSetByName)
			.concat(newResultSetByUrl);

		let resultDisplay = newResultSet.map((el, ix) => {
			const text = this.linkSet[el].text;
			const url = this.linkSet[el].url;

			const showText = this.highlightPhrase(text, searchPhrase);
			const showUrl = this.highlightPhrase(url, searchPhrase);

			return `<a id="qsr_${ix}" class="quick-search__result${
				ix === 0 ? " quick-search__result--focused" : ""
			}" data-url="${url}">
					<div class="quick-search__result-name">${showText}</div>
					<div class="quick-search__result-url">${showUrl}</div>
				</a>`;
		});

		return { newResultSet, resultDisplay };
	},

	highlightPhrase(text, searchPhrase) {
		let re = text;
		const matchStart = text.toLowerCase().indexOf(searchPhrase);
		if (matchStart > -1) {
			const matchEnd = matchStart + searchPhrase.length;

			re = `${text.substring(0, matchStart)}<span>${text.substring(
				matchStart,
				matchEnd
			)}</span>${text.substring(matchEnd)}`;
		}

		return re;
	},

	resultCursor(newFocus) {
		const focused = this.focusedResult;
		document
			.getElementById("qsr_" + focused)
			.classList.remove("quick-search__result--focused");

		this.focusedResult = newFocus;
		document
			.getElementById("qsr_" + newFocus)
			.classList.add("quick-search__result--focused");
	},
};
