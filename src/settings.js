import { themeManager } from "./settings/themeManager";
import { controlFactory } from "./settings/controlFactory";
import { colorManager } from "./settings/colorManager";
import { post } from "./settings/post";

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

	onWindowResize() {
		colorManager.adjustPickerPositions();
	},

	updatePickerStarterColors() {
		colorManager.updatePickerStarterColors();
	},

	renderSettings() {
		let re = [];

		re.push("<div class='settings__controls'>\n");

		// Theme loader html

		re.push("<div class='sp_section'>\n");
		re.push("\t<div class='settings__section-title'>Load theme</div>\n");
		re.push(
			"\t\t<div class='settings__section-content settings__section-content--loader' id='theme_selector_wrapper'>\n"
		);
		re.push("\t\t</div>\n");
		re.push("</div>\n");

		// Theme editor section html

		re.push("<div class='sp_section'>\n");
		re.push(
			`\t<div class='settings__section-title'>Theme Editor: '<span id='current_theme_disp'>${
				gStartBase.settings.currentTheme["theme-settings"]["theme-name"]
			}</span>'<span class='settings__section-title-disp' id='unsaved_disp'>${
				gStartBase.settings.currentTheme["theme-modified"] ? " (Unsaved)" : ""
			}</span><span class='settings__section-title-disp' id='uncommitted_disp'></span></div>\n`
		);
		re.push("\t\t<div class='settings__section-content'>\n");

		// Control html

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

		const colorControlNames = {
			"background-color-1": {
				displayName: "background color 1",
				subType: "bg"
			},
			"background-color-2": {
				displayName: "background color 2",
				subType: "bg"
			},
			"title-text-color": { displayName: "title", subType: "cssv" },
			"title-text-color-hl": {
				displayName: "title (highlighted)",
				subType: "cssv"
			},
			"title-text-shadow": { displayName: "title shadow", subType: "cssv" },
			"subtitle-text-color": { displayName: "subtitle", subType: "cssv" },
			"subtitle-text-color-hl": {
				displayName: "subtitle (highlighted)",
				subType: "cssv"
			},
			"separator-color": { displayName: "separator", subType: "cssv" },
			"separator-color-hl": {
				displayName: "separator (highlighted)",
				subType: "cssv"
			},
			"link-text-color": { displayName: "link", subType: "cssv" },
			"link-text-color-hl": {
				displayName: "link (highlighted)",
				subType: "cssv"
			},
			"link-text-shadow": { displayName: "link shadow", subType: "cssv" },
			"link-background": { displayName: "link background", subType: "cssv" },
			"link-background-hl": {
				displayName: "link background (highlighted)",
				subType: "cssv"
			},
			"scrollbar-track": { displayName: "scrollbar track", subType: "cssv" },
			"scrollbar-thumb": { displayName: "scrollbar thumb", subType: "cssv" }
		};

		Object.entries(colorControlNames).forEach(([key, value]) => {
			controls.push(
				controlFactory.createControl(
					key,
					value.displayName,
					"color",
					value.subType
				)
			);
		});

		const renderedControls = controls.map(item => item.completeRender());
		re.push(renderedControls.join(""));

		re.push("\t\t</div>\n"); // /settings__section-content
		re.push("</div>\n"); // /sp_section
		re.push("</div>\n"); // /settings__controls

		// Button html

		re.push(
			`<div class='settings-buttons'><div class='settings-buttons__inner'>
				<a class='ibutton settings-buttons__ibutton' id='deleteButton'>Delete Theme</a>
				<a class='ibutton settings-buttons__ibutton' id='saveButton'>Save Theme</a>
				<a class='ibutton settings-buttons__ibutton' id='saveAsButton'>Save Theme As...</a>
				<a class='ibutton settings-buttons__ibutton' id='exportButton'>Export Settings</a>
				<a class='ibutton settings-buttons__ibutton' id='commitButton'>Commit Settings to Storage</a>
			</div></div>\n`
		);

		// Save as form html

		re.push(
			`<div class='save-as-form' id='save-as-form'><div class='save-as-form__inner'>
				<input type='text' id='save-as-form__name-input' name='save-as-form__name-input' class='save-as-form__name-input' placeholder='New theme name...' />
				<a class='ibutton ibutton--preferred' id='saveThemeAsActualButton'>Save</a>
				<a class='ibutton' id='cancelSaveThemeAsButton'>Cancel</a>
			</div></div>\n`
		);

		// Html insertion

		document.getElementById("settings__inner-container").innerHTML = re.join(
			""
		);

		// Button/control bindings

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

		// Color picker generation

		if (!gStartBase.settingsOpenedBefore) {
			colorManager.generatePickerInstances();
			gStartBase.settingsOpenedBefore = true;
		}

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
	}
};

export default gStartSettings;
