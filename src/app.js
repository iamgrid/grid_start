"use strict";
import gStartBase from "./base.js";

function init() {
	window.gStartBase = gStartBase;
	gStartBase.init();
}

window.onload = init;
