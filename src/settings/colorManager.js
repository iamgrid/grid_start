import Picker from "vanilla-picker";

export const colorManager = {
	pickerIsOpen: "",
	pickerTimeouts: {},
	colorPickers: [],
	colorPickerObjects: {},

	generatePickerInstances() {
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
				onChange: color => this.previewColor(divName, color),
				onDone: color => this.commitColor(divName, color),
				onOpen: color => this.pickerOpened(divName, color),
				onClose: color => this.pickerClosed(divName, color)
			};

			this.colorPickerObjects[divName] = new Picker(pickerSettings);
		});

		setTimeout(() => this.adjustPickerPositions(), 300);
	},

	cleanPickerColorValue(raw) {
		const re = raw.map(item => {
			if (String(item).includes("."))
				return Number.parseFloat(item).toPrecision(2);
			return item;
		});

		return `rgba(${re.join(", ")})`;
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

			// console.log(this.colorPickerObjects[itemName].settings.color);
		}
	},

	pickerOpened(itemName, color) {
		this.pickerIsOpen = itemName;
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

			gStartSettings.themeHasBeenModified();
			gStartSettings.unCommittedChanges();

			if (itemName.substr(0, 10) === "background") {
				gStartBase.changeWallpaper();
			}
		}
	},

	updatePickerStarterColors() {
		this.colorPickers.forEach(itemName => {
			let settingsName = itemName;
			if (itemName.substr(0, 10) !== "background")
				settingsName = "cssv-" + itemName;

			const settingsValue =
				gStartBase.settings.currentTheme["theme-settings"][settingsName];

			this.colorPickerObjects[itemName].setColor(settingsValue);
		});
	}
};
