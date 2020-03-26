"use strict";
import gStartBase from "./base";
import css from "./gstart.css";

function init() {
	window.gStartBase = gStartBase;
	gStartBase.init();
}

window.onload = init;
