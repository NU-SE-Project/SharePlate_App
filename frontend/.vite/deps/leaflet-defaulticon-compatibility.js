import { r as __toESM } from "./chunk-BoAXSpZd.js";
import { t as require_leaflet_src } from "./leaflet.js";
//#region node_modules/leaflet-defaulticon-compatibility/src/Icon.Default.compatibility.js
var import_leaflet_src = /* @__PURE__ */ __toESM(require_leaflet_src());
import_leaflet_src.Icon.Default.mergeOptions({
	iconUrl: null,
	iconRetinaUrl: null,
	shadowUrl: null,
	iconSize: null,
	iconAnchor: null,
	popupAnchor: null,
	tooltipAnchor: null,
	shadowSize: null,
	classNamePrefix: "leaflet-default-icon-"
});
import_leaflet_src.Icon.Default.include({
	_needsInit: true,
	_getIconUrl: function(name) {
		var imagePath = this.options.imagePath || import_leaflet_src.Icon.Default.imagePath || "";
		if (this._needsInit) this._initializeOptions(imagePath);
		return imagePath + import_leaflet_src.Icon.prototype._getIconUrl.call(this, name);
	},
	_initializeOptions: function(imagePath) {
		this._setOptions("icon", _detectIconOptions, imagePath);
		this._setOptions("shadow", _detectIconOptions, imagePath);
		this._setOptions("popup", _detectDivOverlayOptions);
		this._setOptions("tooltip", _detectDivOverlayOptions);
		this._needsInit = false;
	},
	_setOptions: function(name, detectorFn, imagePath) {
		var options = this.options, prefix = options.classNamePrefix, optionValues = detectorFn(prefix + name, imagePath);
		for (var optionName in optionValues) options[name + optionName] = options[name + optionName] || optionValues[optionName];
	}
});
function _detectIconOptions(className, imagePath) {
	var el = import_leaflet_src.DomUtil.create("div", className, document.body), urls = _extractUrls(_getBkgImageOrCursor(el), imagePath), iconX = _getStyleInt(el, "width"), iconY = _getStyleInt(el, "height"), anchorNX = _getStyleInt(el, "margin-left"), anchorNY = _getStyleInt(el, "margin-top");
	el.parentNode.removeChild(el);
	return {
		Url: urls[0],
		RetinaUrl: urls[1],
		Size: [iconX, iconY],
		Anchor: [-anchorNX, -anchorNY]
	};
}
function _detectDivOverlayOptions(className) {
	var el = import_leaflet_src.DomUtil.create("div", className, document.body), anchorX = _getStyleInt(el, "margin-left"), anchorY = _getStyleInt(el, "margin-top");
	el.parentNode.removeChild(el);
	return { Anchor: [anchorX, anchorY] };
}
function _extractUrls(urlsContainer, imagePath) {
	var re = /url\(['"]?([^"']*?)['"]?\)/gi, urls = [], m = re.exec(urlsContainer);
	while (m) {
		urls.push(imagePath ? _stripPath(m[1]) : m[1]);
		m = re.exec(urlsContainer);
	}
	return urls;
}
function _stripPath(url) {
	return url.substr(url.lastIndexOf("/") + 1);
}
function _getStyleInt(el, style) {
	return parseInt(_getStyle(el, style), 10);
}
function _getStyle(el, style) {
	return import_leaflet_src.DomUtil.getStyle(el, style) || import_leaflet_src.DomUtil.getStyle(el, _kebabToCamelCase(style));
}
function _getBkgImageOrCursor(el) {
	var bkgImage = _getStyle(el, "background-image");
	return bkgImage && bkgImage !== "none" ? bkgImage : _getStyle(el, "cursor");
}
function _kebabToCamelCase(prop) {
	return prop.replace(/-(\w)/g, function(str, w) {
		return w.toUpperCase();
	});
}
//#endregion

//# sourceMappingURL=leaflet-defaulticon-compatibility.js.map