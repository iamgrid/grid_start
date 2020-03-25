import Picker from "vanilla-picker";
import { controlFactory } from "./settings/controlFactory.js";
import { post } from "./settings/post.js";
import { themeManager } from "./settings/themeManager.js";

const gStartSettings = {
	catchEnter(event) {
		const key = event.keyCode || event.which;
		if (key === 13) {
			if (event.target.id === "save-as-form__name-input") {
				themeManager.saveThemeAsActual();
			}
		}
	},

	themeHasBeenModified(mode = true) {
		gStartBase.settings.currentTheme["theme-modified"] = mode;
		let re = " (modified)";
		if (!mode) {
			re = "";
			document
				.getElementById("saveAsButton")
				.classList.remove("ibutton--preferred");
		} else {
			document
				.getElementById("saveAsButton")
				.classList.add("ibutton--preferred");
		}
		document.getElementById("unsaved_disp").innerHTML = re;
	},

	unCommittedChanges(mode = true) {
		let re = " (uncommited changes)";
		if (!mode) {
			re = "";
			document
				.getElementById("commitButton")
				.classList.remove("ibutton--preferred");
		} else {
			document
				.getElementById("commitButton")
				.classList.add("ibutton--preferred");
		}
		document.getElementById("uncommitted_disp").innerHTML = re;
	},

	exportSettings() {
		const settingsStringified = JSON.stringify(gStartBase.settings);
		post("export_json.php", { export: settingsStringified });
	},

	previewColor(itemName, newColor) {
		const rootEl = document.documentElement;
		let properColor = "";
		if (newColor._rgba) {
			properColor = this.cleanPickerColorValue(newColor._rgba);
			rootEl.style.setProperty("--" + itemName, properColor);
			if (itemName.substr(0, 10) === "background") {
				gStartBase.changeWallpaper(["colorPreview", itemName, properColor]);
			}

			// console.log(gStartSettings.colorPickerObjects[itemName].settings.color);
		}
	},

	pickerIsOpen: "",
	pickerOpened(itemName, color) {
		this.pickerIsOpen = itemName;
	},

	onWindowResize() {
		gStartSettings.adjustPickerPositions();
	},

	adjustPickerPositions() {
		if (this.pickerIsOpen !== "") {
			this.colorPickerObjects[this.pickerIsOpen].closeHandler();
			this.pickerIsOpen = "";
		}

		this.colorPickers.forEach(itemName => {
			const cPreviewName = `color-preview__${itemName}`;
			const cPreviewDiv = document.getElementById(cPreviewName);

			if (cPreviewDiv.offsetLeft + 360 > window.innerWidth) {
				// console.log(itemName, "picker moved to left");
				this.colorPickerObjects[itemName].movePopup({ popup: "left" }, false);
			} else {
				// console.log(itemName, "picker moved to right");
				this.colorPickerObjects[itemName].movePopup({ popup: "right" }, false);
			}
		});
	},

	pickerTimeouts: {},
	pickerClosed(itemName, newColor) {
		this.pickerIsOpen = "";

		this.pickerTimeouts[itemName] = window.setTimeout(
			() => this.restoreColor(itemName),
			300
		);
	},

	restoreColor(itemName) {
		// console.log("restoring " + itemName + " color");
		const rootEl = document.documentElement;

		let settingsName = itemName;
		if (itemName.substr(0, 10) !== "background")
			settingsName = "cssv-" + itemName;

		const settingsValue =
			gStartBase.settings.currentTheme["theme-settings"][settingsName];

		rootEl.style.setProperty("--" + itemName, settingsValue);
		this.colorPickerObjects[itemName].setColor(settingsValue);
		if (itemName.substr(0, 10) === "background") {
			gStartBase.changeWallpaper();
		}
	},

	commitColor(itemName, newColor) {
		window.clearTimeout(this.pickerTimeouts[itemName]);

		let properColor = "";
		let settingsName = itemName;
		if (newColor._rgba) {
			properColor = this.cleanPickerColorValue(newColor._rgba);
			if (itemName.substr(0, 10) !== "background")
				settingsName = "cssv-" + itemName;

			// console.log(`commiting ${properColor} to ${settingsName}`);
			gStartBase.settings.currentTheme["theme-settings"][
				settingsName
			] = properColor;

			this.themeHasBeenModified();
			this.unCommittedChanges();

			if (itemName.substr(0, 10) === "background") {
				gStartBase.changeWallpaper();
			}
		}
	},

	cleanPickerColorValue(raw) {
		const re = raw.map(item => {
			if (String(item).includes("."))
				return Number.parseFloat(item).toPrecision(2);
			return item;
		});

		return `rgba(${re.join(", ")})`;
	},

	colorPickerObjects: {},

	renderSettings() {
		let re = [];

		re.push("<div class='settings__controls'>\n");

		// Load theme section

		re.push("<div class='sp_section'>\n");
		re.push("\t<div class='settings__section-title'>Load theme</div>\n");
		re.push(
			"\t\t<div class='settings__section-content settings__section-content--loader' id='theme_selector_wrapper'>\n"
		);
		re.push("\t\t</div>\n");
		re.push("</div>\n");

		// Theme editor section

		re.push("<div class='sp_section'>\n");
		re.push(
			`\t<div class='settings__section-title'>Theme Editor: '<span id='current_theme_disp'>${
				gStartBase.settings.currentTheme["theme-settings"]["theme-name"]
			}</span>'<span class='settings__section-title-disp' id='unsaved_disp'>${
				gStartBase.settings.currentTheme["theme-modified"] ? " (Unsaved)" : ""
			}</span><span class='settings__section-title-disp' id='uncommitted_disp'></span></div>\n`
		);
		re.push("\t\t<div class='settings__section-content'>\n");

		const controls = [];

		controls.push(
			controlFactory.createControl("wall", "wallpaper", "select", "")
		);
		controls.push(
			controlFactory.createControl(
				"background-gradient",
				"background gradient",
				"checkbox",
				""
			)
		);
		controls.push(
			controlFactory.createControl(
				"background-color-1",
				"background color 1",
				"color",
				"bg"
			)
		);
		controls.push(
			controlFactory.createControl(
				"background-color-2",
				"background color 2",
				"color",
				"bg"
			)
		);

		const cssVs = {
			"title-text-color": "title",
			"title-text-color-hl": "title (highlighted)",
			"title-text-shadow": "title shadow",
			"subtitle-text-color": "subtitle",
			"subtitle-text-color-hl": "subtitle (highlighted)",
			"separator-color": "separator",
			"separator-color-hl": "separator (highlighted)",
			"link-text-color": "link",
			"link-text-color-hl": "link (highlighted)",
			"link-text-shadow": "link shadow",
			"link-background": "link background",
			"link-background-hl": "link background (highlighted)",
			"scrollbar-track": "scrollbar track",
			"scrollbar-thumb": "scrollbar thumb"
		};

		Object.entries(cssVs).forEach(([key, value]) => {
			controls.push(controlFactory.createControl(key, value, "color", "cssv"));
		});

		const renderedControls = controls.map(item => item.completeRender());
		re.push(renderedControls.join(""));

		re.push("\t\t</div>\n"); // /settings__section-content
		re.push("</div>\n"); // /sp_section
		re.push("</div>\n"); // /settings__controls

		re.push(
			`<div class='settings-buttons'><div class='settings-buttons__inner'>
				<a class='ibutton settings-buttons__ibutton' id='deleteButton'>Delete Theme</a>
				<a class='ibutton settings-buttons__ibutton' id='saveButton'>Save Theme</a>
				<a class='ibutton settings-buttons__ibutton' id='saveAsButton'>Save Theme As...</a>
				<a class='ibutton settings-buttons__ibutton' id='exportButton'>Export Settings</a>
				<a class='ibutton settings-buttons__ibutton' id='commitButton'>Commit Settings to Storage</a>
			</div></div>\n`
		); // settings-buttons

		re.push(
			`<div class='save-as-form' id='save-as-form'><div class='save-as-form__inner'>
				<input type='text' id='save-as-form__name-input' name='save-as-form__name-input' class='save-as-form__name-input' placeholder='New theme name...' />
				<a class='ibutton ibutton--preferred' id='saveThemeAsActualButton'>Save</a>
				<a class='ibutton' id='cancelSaveThemeAsButton'>Cancel</a>
			</div></div>\n`
		); // save-as-form

		document.getElementById("settings__inner-container").innerHTML = re.join(
			""
		);

		document.getElementById("deleteButton").onclick = themeManager.deleteTheme;
		document.getElementById("saveButton").onclick = themeManager.saveTheme;
		document.getElementById("saveAsButton").onclick = themeManager.saveThemeAs;
		document.getElementById("exportButton").onclick = this.exportSettings;
		document.getElementById(
			"commitButton"
		).onclick = gStartBase.commitToStorage.bind(gStartBase);
		document.getElementById(
			"save-as-form__name-input"
		).onkeyup = this.catchEnter;
		document.getElementById("saveThemeAsActualButton").onclick =
			themeManager.saveThemeAsActual;
		document.getElementById("cancelSaveThemeAsButton").onclick =
			themeManager.cancelSaveThemeAs;

		this.renderThemeSelector();

		// generate color pickers

		if (!gStartBase.settingsOpenedBefore) {
			this.colorPickers.forEach(item => {
				const divName = item;
				let settingsName = "cssv-" + divName;
				if (divName.substr(0, 10) === "background") {
					settingsName = divName;
				}
				const currentColor =
					gStartBase.settings.currentTheme["theme-settings"][settingsName];

				const pickerSettings = {
					parent: document.querySelector("#color-preview__" + divName),
					color: currentColor,
					editor: true,
					popup: "right",
					onChange: color => gStartSettings.previewColor(divName, color),
					onDone: color => gStartSettings.commitColor(divName, color),
					onOpen: color => gStartSettings.pickerOpened(divName, color),
					onClose: color => gStartSettings.pickerClosed(divName, color)
				};

				this.colorPickerObjects[divName] = new Picker(pickerSettings);
			});

			setTimeout(() => gStartSettings.adjustPickerPositions(), 300);

			gStartBase.settingsOpenedBefore = true;
		}

		// console.log(this.colorPickerObjects);

		document.getElementById("settings__select-theme").focus();
	},

	renderThemeSelector() {
		let re = [];
		re.push(
			`\t\t\t<select id='settings__select-theme' class='settings__select-theme'>\n`
		);
		Object.entries(gStartBase.settings.themes).map(([key, value]) => {
			let selected = "";
			if (gStartBase.settings.currentTheme["based-on-theme"] === key)
				selected = "selected";
			re.push(
				`\t\t\t\t<option value='${key}' ${selected}>${value["theme-name"]}</option>\n`
			);
		});
		re.push("\t\t\t</select>\n");

		document.getElementById("theme_selector_wrapper").innerHTML = re.join("");

		document.getElementById("settings__select-theme").onchange =
			themeManager.activateTheme;
	},

	colorPickers: []
};

export default gStartSettings;
