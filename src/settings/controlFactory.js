import { wallpapers } from "../base/wallpapers.js";

export const controlFactory = {
	genericControl: {
		completeRender() {
			let re = [];

			re.push("\t\t\t<div class='controls'>\n");
			re.push(`\t\t\t\t<div class='controls__label'>${this.dispName}</div>\n`);

			try {
				re.push(this.render());
			} catch (error) {
				console.log(error);
			}

			re.push("\t\t\t</div>\n");

			return re.join("");
		},
		render() {
			return "Default control";
		}
	},

	colorControl: {
		type: "color",
		render() {
			let cssVarName = "";
			if (this.subType === "bg") {
				cssVarName = "background-color-" + this.cName.substr(-1);
			} else if (this.subType === "cssv") {
				cssVarName = this.cName;
			}

			gStartSettings.colorPickers.push(cssVarName);

			return `<div class='color-preview ${"color-preview__" +
				cssVarName}' id='${"color-preview__" + cssVarName}'></div>`;
		}
	},

	selectControl: {
		type: "select",
		render() {
			let re = [];

			re.push(
				`<select id='controls__select-wallpaper' class='controls__select-wallpaper' onchange='gStartBase.changeWallpaper(event)'>\n`
			);
			Object.entries(wallpapers).map(([key]) => {
				let selected = "";
				if (
					gStartBase.settings.currentTheme["theme-settings"][
						"background-image"
					] === key
				)
					selected = "selected";
				re.push(`\t<option value='${key}' ${selected}>${key}</option>\n`);
			});
			re.push("</select>\n");

			return re.join("");
		}
	},

	checkboxControl: {
		type: "checkbox",
		render() {
			let re = [];

			let isChecked = "";
			if (gStartBase.settings.currentTheme["theme-settings"][this.cName])
				isChecked = " checked='true'";
			re.push(
				`<input type='checkbox' id='check_gradient' onchange='gStartBase.changeWallpaper(event)'${isChecked} />\n`
			);

			return re.join("");
		}
	},

	createControl(cName = "", dispName = "", type = "", subType = "") {
		const assembledControl = Object.create(this.genericControl);
		Object.assign(assembledControl, {
			cName: cName,
			dispName: dispName,
			subType: subType
		});

		if (type === "color") {
			Object.assign(assembledControl, this.colorControl);
		} else if (type === "select") {
			Object.assign(assembledControl, this.selectControl);
		} else if (type === "checkbox") {
			Object.assign(assembledControl, this.checkboxControl);
		}

		return assembledControl;
	}
};
