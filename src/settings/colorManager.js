import Picker from "vanilla-picker";

export const colorManager = {
	pickerIsOpen: "",

	// prettier-ignore
	colorControls: {
		"background-color-1": {
			displayName: "background color 1",
			subType: "bg"
		},
		"background-color-2": {
			displayName: "background color 2",
			subType: "bg"
		},
		"title-text-color": { 
			displayName: "title", 
			subType: "cssv" 
		},
		"title-text-color-hl": {
			displayName: "title (highlighted)",
			subType: "cssv"
		},
		"title-text-shadow": { 
			displayName: "title shadow", 
			subType: "cssv" 
		},
		"subtitle-text-color": { 
			displayName: "subtitle", 
			subType: "cssv" 
		},
		"subtitle-text-color-hl": {
			displayName: "subtitle (highlighted)",
			subType: "cssv"
		},
		"separator-color": { 
			displayName: "separator", 
			subType: "cssv" 
		},
		"separator-color-hl": {
			displayName: "separator (highlighted)",
			subType: "cssv"
		},
		"link-text-color": { 
			displayName: "link", 
			subType: "cssv"
		},
		"link-text-color-hl": {
			displayName: "link (highlighted)",
			subType: "cssv"
		},
		"link-text-shadow": { 
			displayName: "link shadow", 
			subType: "cssv" 
		},
		"link-background": { 
			displayName: "link background", 
			subType: "cssv" 
		},
		"link-background-hl": {
			displayName: "link background (highlighted)",
			subType: "cssv"
		},
		"scrollbar-track": { 
			displayName: "scrollbar track", 
			subType: "cssv" 
		},
		"scrollbar-thumb": { 
			displayName: "scrollbar thumb", 
			subType: "cssv" 
		}
	},

	generatePickerInstances() {
		Object.keys(this.colorControls).forEach(itemName => {
			const divName = itemName;

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

			this.colorControls[divName].pickerInstance = new Picker(pickerSettings);
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

			// console.log(this.colorControls[itemName].pickerInstance.settings.color);
		}
	},

	pickerOpened(itemName, color) {
		this.pickerIsOpen = itemName;
	},

	adjustPickerPositions() {
		if (this.pickerIsOpen !== "") {
			this.colorControls[this.pickerIsOpen].pickerInstance.closeHandler();
			this.pickerIsOpen = "";
		}

		Object.keys(this.colorControls).forEach(itemName => {
			const cPreviewName = `color-preview__${itemName}`;
			const cPreviewDiv = document.getElementById(cPreviewName);

			if (cPreviewDiv.offsetLeft + 360 > window.innerWidth) {
				// console.log(itemName, "picker moved to left");
				this.colorControls[itemName].pickerInstance.movePopup(
					{ popup: "left" },
					false
				);
			} else {
				// console.log(itemName, "picker moved to right");
				this.colorControls[itemName].pickerInstance.movePopup(
					{ popup: "right" },
					false
				);
			}
		});
	},

	pickerClosed(itemName, newColor) {
		this.pickerIsOpen = "";

		this.colorControls[itemName].timeout = window.setTimeout(
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
		this.colorControls[itemName].pickerInstance.setColor(settingsValue);
		if (itemName.substr(0, 10) === "background") {
			gStartBase.changeWallpaper();
		}
	},

	commitColor(itemName, newColor) {
		window.clearTimeout(this.colorControls[itemName].timeout);

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
		Object.keys(this.colorControls).forEach(itemName => {
			let settingsName = itemName;
			if (itemName.substr(0, 10) !== "background")
				settingsName = "cssv-" + itemName;

			const settingsValue =
				gStartBase.settings.currentTheme["theme-settings"][settingsName];

			this.colorControls[itemName].pickerInstance.setColor(settingsValue);
		});
	}
};
