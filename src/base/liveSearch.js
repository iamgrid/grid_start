export const liveSearch = {
	linkSet: [],
	searchResults: [],
	maxResults: 8,
	focusedResult: 0,
	domNodes: {
		searchField: document.getElementById("quicksearch"),
		resultsDiv: document.getElementById("quicksearchresults"),
	},

	buildLinkSet() {
		const elementList = document
			.getElementById("links")
			.querySelectorAll(".links__link");

		class LinkItem {
			constructor(text, url, searchableUrl) {
				this.text = text;
				this.url = url;
				this.searchableUrl = searchableUrl;
			}
		}

		const sURegex = new RegExp(/(https?:\/\/|www\.|the)/, "gi");

		for (const el of elementList) {
			// attaching click handlers and element ids
			el.onclick = gStartBase.open;

			// building linkset
			let text = el.innerText;
			let url = el.dataset["url"];
			let searchableUrl = url.replace(sURegex, "");
			this.linkSet.push(new LinkItem(text, url, searchableUrl));
		}

		this.domNodes.searchField.addEventListener(
			"keyup",
			liveSearch.doLiveSearch.bind(this)
		);
	},

	doLiveSearch(event) {
		event.preventDefault();
		const searchPhrase = event.target.value;
		const focused = this.focusedResult;

		switch (event.keyCode) {
			case 27:
				// escape key
				event.target.value = "";
				this.domNodes.resultsDiv.style.visibility = "hidden";
				break;
			case 13:
				// enter key
				if (this.searchResults.length < 1) return;

				const linkId = this.searchResults[this.focusedResult];
				window.open(this.linkSet[linkId].url, gStartBase.target);
				break;
			case 38:
				// up key
				this.domNodes.searchField.setSelectionRange(100, 100);

				if (focused === 0) return;
				this.resultCursor(focused - 1);
				break;
			case 40:
				// down key
				if (focused > this.searchResults.length - 2) return;
				this.resultCursor(focused + 1);
				break;
			default:
				if (searchPhrase.length < 1) {
					this.searchResults = [];
					this.domNodes.resultsDiv.innerHTML = "";
					this.domNodes.resultsDiv.style.visibility = "hidden";
					return;
				}

				const {
					newResultSet,
					resultDisplay,
					hasCollapsedResults,
				} = this.createResultSet(searchPhrase);

				this.focusedResult = 0;
				this.searchResults = [...newResultSet];

				this.domNodes.resultsDiv.innerHTML = resultDisplay.join("");

				if (hasCollapsedResults) {
					this.domNodes.resultsDiv.classList.add(
						"quick-search__results--has-collapsed-hits"
					);
				} else {
					this.domNodes.resultsDiv.classList.remove(
						"quick-search__results--has-collapsed-hits"
					);
				}

				this.domNodes.resultsDiv.style.visibility = "visible";

				newResultSet.forEach((_, ix) => {
					document.getElementById("qsr_" + ix).onclick = gStartBase.open;
				});

				break;
		}
	},

	createResultSet(searchPhrase) {
		const newResultSetByNameStart = [];
		const newResultSetByName = [];
		const newResultSetByUrlStart = [];
		const newResultSetByUrl = [];

		const regex = new RegExp(searchPhrase, "i");

		this.linkSet.forEach((el, ix) => {
			const textMatch = el.text.search(regex);
			const urlMatch = el.searchableUrl.search(regex);

			if (textMatch === 0) {
				newResultSetByNameStart.push(ix);
				return;
			}

			if (urlMatch === 0) {
				newResultSetByUrlStart.push(ix);
				return;
			}

			if (searchPhrase.length > 1) {
				// when we only get a searchPhrase of length 1 we won't
				// return matches from inside strings
				if (textMatch > 0) {
					newResultSetByName.push(ix);
					return;
				}
				if (urlMatch > 0) newResultSetByUrl.push(ix);
			}
		});

		let newResultSet = newResultSetByNameStart
			.concat(newResultSetByName)
			.concat(newResultSetByUrlStart)
			.concat(newResultSetByUrl);

		let collapsedResults = 0;
		if (newResultSet.length > this.maxResults) {
			collapsedResults = newResultSet.length - this.maxResults;
			newResultSet = newResultSet.slice(0, this.maxResults);
		}

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

		let hasCollapsedResults = false;

		if (collapsedResults > 0) {
			hasCollapsedResults = true;
			resultDisplay.push(
				`<div class="quick-search__collapsed-results">+ ${collapsedResults} hidden hits</div>`
			);
		}

		return { newResultSet, resultDisplay, hasCollapsedResults };
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
