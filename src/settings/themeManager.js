import { v4 as uuidv4 } from "uuid";

export const themeManager = {
	activateTheme(event) {
		const req = event.target.value;

		console.log(`loading theme ${req} ...`);

		const activateThemeProper = () => {
			gStartBase.settings.currentTheme["based-on-theme"] = req;
			gStartBase.settings.currentTheme["theme-modified"] = false;
			Object.assign(
				gStartBase.settings.currentTheme["theme-settings"],
				gStartBase.settings.themes[req]
			);

			gStartBase.showcurrentTheme();

			gStartSettings.unCommittedChanges();

			console.log(`loaded ${req}.`);
		};

		if (gStartBase.settings.currentTheme["theme-modified"]) {
			if (
				window.confirm(
					"Your current theme has unsaved changes. Continue anyway?"
				)
			) {
				activateThemeProper();
				gStartSettings.themeHasBeenModified(false);
			} else {
				document.getElementById(event.target.id).value =
					gStartBase.settings.currentTheme["based-on-theme"];
			}
		} else {
			activateThemeProper();
		}
	},

	saveTheme() {
		if (confirm("Are you sure you'd like to overwrite the current theme?")) {
			const basedOn = gStartBase.settings.currentTheme["based-on-theme"];
			Object.assign(
				gStartBase.settings.themes[basedOn],
				gStartBase.settings.currentTheme["theme-settings"]
			);
			console.log("attempted to save... " + basedOn);
			// console.log(gStartBase.settings);

			gStartSettings.themeHasBeenModified(false);
			gStartSettings.unCommittedChanges(true);
		}
	},

	saveThemeAs() {
		document.getElementById("save-as-form").style.display = "grid";
		document.getElementById("save-as-form__name-input").focus();
	},

	cancelSaveThemeAs() {
		document.getElementById("save-as-form").style.display = "none";
		document.getElementById("save-as-form__name-input").value = "";
	},

	saveThemeAsActual() {
		const newThemeName = document.getElementById("save-as-form__name-input")
			.value;

		let newThemeId = uuidv4();

		console.log(`saving ${newThemeName} to ${newThemeId}...`);

		gStartBase.settings.currentTheme["theme-settings"][
			"theme-name"
		] = newThemeName;

		gStartBase.settings.themes[newThemeId] = {};
		Object.assign(
			gStartBase.settings.themes[newThemeId],
			gStartBase.settings.currentTheme["theme-settings"]
		);

		gStartBase.settings.currentTheme["based-on-theme"] = String(newThemeId);
		gStartSettings.unCommittedChanges();
		gStartSettings.themeHasBeenModified(false);

		gStartSettings.renderThemeSelector();

		document.getElementById("current_theme_disp").innerHTML =
			gStartBase.settings.currentTheme["theme-settings"]["theme-name"];

		document.getElementById("save-as-form").style.display = "none";
		document.getElementById("save-as-form__name-input").value = "";
	},

	deleteTheme() {
		if (confirm("Are you sure you'd like to delete the current theme?")) {
			if (gStartBase.settings.currentTheme["based-on-theme"] === "0") {
				alert("Sorry, the default theme can not be deleted.");
				return null;
			}
			const themeToDelete = gStartBase.settings.currentTheme["based-on-theme"];

			delete gStartBase.settings.themes[themeToDelete];

			Object.assign(
				gStartBase.settings.currentTheme["theme-settings"],
				gStartBase.settings.themes["0"]
			);

			gStartBase.settings.currentTheme["based-on-theme"] = "0";
			gStartBase.settings.currentTheme["theme-modified"] = false;
			gStartSettings.unCommittedChanges();

			gStartSettings.renderThemeSelector();

			gStartBase.showcurrentTheme();
		}
	}
};
