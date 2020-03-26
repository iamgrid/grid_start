import { defaultSettings } from "./base/defaultSettings";
import { wallpapers } from "./base/wallpapers";

const gStartBase = {
	settings: {},
	settingsPanelOpen: false,
	settingsOpenedBefore: false,

	/* link opener function */

	getTarget(url) {
		let trg = "_blank";
		if (window.location.hash == "#self") trg = "_self";
		window.open(url, trg);
	},

	/* setting loader/saver functions */

	init() {
		console.log("initializing...");

		let storedSettings = localStorage.getItem("gStartSettings");

		if (!storedSettings) {
			console.log(
				"our gStartSettings item doesn't exist in localStorage yet, let's create one from defaultSettings..."
			);
			this.commitToStorage(null, defaultSettings);
			storedSettings = localStorage.getItem("gStartSettings");
		}

		console.log("loading settings...");
		this.settings = JSON.parse(storedSettings);

		console.log("loading current theme...");
		this.showcurrentTheme();
		// console.log(this.settings);
	},

	commitToStorage(event, settingsObj = null) {
		if (settingsObj === null) settingsObj = this.settings;
		const settingsStringified = JSON.stringify(settingsObj);

		localStorage.setItem("gStartSettings", settingsStringified);

		if (typeof gStartSettings !== "undefined") {
			gStartSettings.unCommittedChanges(false);
		}
	},

	changeWallpaper(event = null) {
		const settings = this.settings.currentTheme["theme-settings"];
		let bgColor1 = settings["background-color-1"];
		let bgColor2 = settings["background-color-2"];

		if (event !== null) {
			if (event.target) {
				if (event.target.id === "controls__select-wallpaper") {
					settings["background-image"] = event.target.value;
				} else if (event.target.id === "check_gradient") {
					settings["background-gradient"] = event.target.checked;
				}
				gStartSettings.themeHasBeenModified();
				gStartSettings.unCommittedChanges();
			} else if (event[0] === "colorPreview") {
				if (event[1] === "background-color-1") {
					bgColor1 = event[2];
				} else if (event[1] === "background-color-2") {
					bgColor2 = event[2];
				}
			}
		}

		let bgStyleString = "";

		if (settings["background-image"] !== "none") {
			bgStyleString = wallpapers[settings["background-image"]];
		} else if (settings["background-gradient"] === true) {
			bgStyleString = `linear-gradient(to bottom, ${bgColor1}, ${bgColor2})`;
		} else {
			bgStyleString = bgColor1;
		}

		const bodyEl = document.body;
		bodyEl.style.background = bgStyleString;
		bodyEl.style.backgroundRepeat = "no-repeat";
		bodyEl.style.backgroundSize = "cover";
	},

	showcurrentTheme() {
		const settings = this.settings.currentTheme["theme-settings"];

		// Set background

		this.changeWallpaper();

		// Set css variables

		const rootEl = document.documentElement;

		Object.entries(settings).map(([key, value]) => {
			if (key.substr(0, 4) == "cssv") {
				rootEl.style.setProperty(`--${key.substr(5)}`, value);
			}
		});

		rootEl.style.setProperty(
			`--background-color-1`,
			settings["background-color-1"]
		);
		rootEl.style.setProperty(
			`--background-color-2`,
			settings["background-color-2"]
		);

		// Update controls if settings are up

		if (this.settingsOpenedBefore) {
			document.getElementById("current_theme_disp").innerHTML =
				settings["theme-name"];

			document.getElementById("controls__select-wallpaper").value =
				settings["background-image"];
			document.getElementById("check_gradient").checked =
				settings["background-gradient"];

			// Update picker starter colors

			if (typeof gStartSettings !== "undefined") {
				gStartSettings.updatePickerStarterColors();
			}
		}
	},

	toggleSettingsPanel() {
		if (!this.settingsPanelOpen) {
			document.getElementById("settings").style.display = "block";
			this.settingsPanelOpen = true;
			if (!this.settingsOpenedBefore) {
				// dynamic import

				import(/* webpackChunkName: "settings" */ `./settings.js`)
					.then(gss => {
						window.gStartSettings = gss.default;
						gStartSettings.renderSettings();
						window.onresize = gStartSettings.onWindowResize;
					})
					.catch(error => {
						console.log(error);
						document.getElementById(
							"settings__inner-container"
						).innerHTML = `<div class='settings__error'>Error: ${error.message}</div>`;
					});
			} else {
				document.getElementById("settings__select-theme").focus();
			}
			document.getElementById("toggle-settings__text").innerHTML =
				"Close Panel";
			document
				.getElementById("toggle-settings__link")
				.classList.add("toggle-settings__link--open");
		} else {
			document.getElementById("settings").style.display = "none";
			this.settingsPanelOpen = false;
			document.getElementById("toggle-settings__text").innerHTML = "Settings";
			document
				.getElementById("toggle-settings__link")
				.classList.remove("toggle-settings__link--open");
		}
	}
};

export default gStartBase;
