import { i as __require, t as __commonJSMin } from "../_runtime.mjs";
//#region node_modules/.pnpm/@fastify+busboy@3.2.0/node_modules/@fastify/busboy/deps/streamsearch/sbmh.js
var require_sbmh = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Copyright Brian White. All rights reserved.
	*
	* @see https://github.com/mscdex/streamsearch
	*
	* Permission is hereby granted, free of charge, to any person obtaining a copy
	* of this software and associated documentation files (the "Software"), to
	* deal in the Software without restriction, including without limitation the
	* rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
	* sell copies of the Software, and to permit persons to whom the Software is
	* furnished to do so, subject to the following conditions:
	*
	* The above copyright notice and this permission notice shall be included in
	* all copies or substantial portions of the Software.
	*
	* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
	* FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
	* IN THE SOFTWARE.
	*
	* Based heavily on the Streaming Boyer-Moore-Horspool C++ implementation
	* by Hongli Lai at: https://github.com/FooBarWidget/boyer-moore-horspool
	*/
	var { EventEmitter: EventEmitter$1 } = __require("node:events");
	var { inherits: inherits$5 } = __require("node:util");
	function SBMH(needle) {
		if (typeof needle === "string") needle = Buffer.from(needle);
		if (!Buffer.isBuffer(needle)) throw new TypeError("The needle has to be a String or a Buffer.");
		const needleLength = needle.length;
		const needleLastCharIndex = needleLength - 1;
		if (needleLength === 0) throw new Error("The needle cannot be an empty String/Buffer.");
		if (needleLength > 256) throw new Error("The needle cannot have a length bigger than 256.");
		this.maxMatches = Infinity;
		this.matches = 0;
		this._occ = (/* @__PURE__ */ new Uint8Array(256)).fill(needleLength);
		this._lookbehind_size = 0;
		this._needle = needle;
		this._bufpos = 0;
		this._lookbehind = Buffer.alloc(needleLastCharIndex);
		for (var i = 0; i < needleLastCharIndex; ++i) this._occ[needle[i]] = needleLastCharIndex - i;
	}
	inherits$5(SBMH, EventEmitter$1);
	SBMH.prototype.reset = function() {
		this._lookbehind_size = 0;
		this.matches = 0;
		this._bufpos = 0;
	};
	SBMH.prototype.push = function(chunk, pos) {
		if (!Buffer.isBuffer(chunk)) chunk = Buffer.from(chunk, "binary");
		const chlen = chunk.length;
		this._bufpos = pos || 0;
		let r;
		while (r !== chlen && this.matches < this.maxMatches) r = this._sbmh_feed(chunk);
		return r;
	};
	SBMH.prototype._sbmh_feed = function(data) {
		const len = data.length;
		const needle = this._needle;
		const needleLength = needle.length;
		const needleLastCharIndex = needleLength - 1;
		const needleLastChar = needle[needleLastCharIndex];
		let pos = -this._lookbehind_size;
		let ch;
		if (pos < 0) {
			while (pos < 0 && pos <= len - needleLength) {
				ch = data[pos + needleLastCharIndex];
				if (ch === needleLastChar && this._sbmh_memcmp(data, pos, needleLastCharIndex)) {
					this._lookbehind_size = 0;
					++this.matches;
					this.emit("info", true);
					return this._bufpos = pos + needleLength;
				}
				pos += this._occ[ch];
			}
			while (pos < 0 && !this._sbmh_memcmp(data, pos, len - pos)) ++pos;
			if (pos >= 0) {
				this.emit("info", false, this._lookbehind, 0, this._lookbehind_size);
				this._lookbehind_size = 0;
			} else {
				const bytesToCutOff = this._lookbehind_size + pos;
				if (bytesToCutOff > 0) this.emit("info", false, this._lookbehind, 0, bytesToCutOff);
				this._lookbehind_size -= bytesToCutOff;
				this._lookbehind.copy(this._lookbehind, 0, bytesToCutOff, this._lookbehind_size);
				data.copy(this._lookbehind, this._lookbehind_size);
				this._lookbehind_size += len;
				this._bufpos = len;
				return len;
			}
		}
		pos = data.indexOf(needle, pos + this._bufpos);
		if (pos !== -1) {
			++this.matches;
			if (pos === 0) this.emit("info", true);
			else this.emit("info", true, data, this._bufpos, pos);
			return this._bufpos = pos + needleLength;
		}
		pos = len - needleLastCharIndex;
		if (pos < 0) pos = 0;
		while (pos !== len && (data[pos] !== needle[0] || Buffer.compare(data.subarray(pos + 1, len), needle.subarray(1, len - pos)) !== 0)) ++pos;
		if (pos !== len) {
			data.copy(this._lookbehind, 0, pos, len);
			this._lookbehind_size = len - pos;
		}
		if (pos !== 0) this.emit("info", false, data, this._bufpos, pos);
		this._bufpos = len;
		return len;
	};
	SBMH.prototype._sbmh_lookup_char = function(data, pos) {
		return pos < 0 ? this._lookbehind[this._lookbehind_size + pos] : data[pos];
	};
	SBMH.prototype._sbmh_memcmp = function(data, pos, len) {
		for (var i = 0; i < len; ++i) if (this._sbmh_lookup_char(data, pos + i) !== this._needle[i]) return false;
		return true;
	};
	module.exports = SBMH;
}));
//#endregion
//#region node_modules/.pnpm/@fastify+busboy@3.2.0/node_modules/@fastify/busboy/deps/dicer/lib/PartStream.js
var require_PartStream = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var inherits$4 = __require("node:util").inherits;
	var ReadableStream = __require("node:stream").Readable;
	function PartStream(opts) {
		ReadableStream.call(this, opts);
	}
	inherits$4(PartStream, ReadableStream);
	PartStream.prototype._read = function(n) {};
	module.exports = PartStream;
}));
//#endregion
//#region node_modules/.pnpm/@fastify+busboy@3.2.0/node_modules/@fastify/busboy/lib/utils/getLimit.js
var require_getLimit = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = function getLimit(limits, name, defaultLimit) {
		if (!limits || limits[name] === void 0 || limits[name] === null) return defaultLimit;
		if (typeof limits[name] !== "number" || isNaN(limits[name])) throw new TypeError("Limit " + name + " is not a valid number");
		return limits[name];
	};
}));
//#endregion
//#region node_modules/.pnpm/@fastify+busboy@3.2.0/node_modules/@fastify/busboy/deps/dicer/lib/HeaderParser.js
var require_HeaderParser = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var EventEmitter = __require("node:events").EventEmitter;
	var inherits$3 = __require("node:util").inherits;
	var getLimit = require_getLimit();
	var StreamSearch = require_sbmh();
	var B_DCRLF = Buffer.from("\r\n\r\n");
	var RE_CRLF = /\r\n/g;
	var RE_HDR = /^([^:]+):[ \t]?([\x00-\xFF]+)?$/;
	function HeaderParser(cfg) {
		EventEmitter.call(this);
		cfg = cfg || {};
		const self = this;
		this.nread = 0;
		this.maxed = false;
		this.npairs = 0;
		this.maxHeaderPairs = getLimit(cfg, "maxHeaderPairs", 2e3);
		this.maxHeaderSize = getLimit(cfg, "maxHeaderSize", 81920);
		this.buffer = "";
		this.header = {};
		this.finished = false;
		this.ss = new StreamSearch(B_DCRLF);
		this.ss.on("info", function(isMatch, data, start, end) {
			if (data && !self.maxed) {
				if (self.nread + end - start >= self.maxHeaderSize) {
					end = self.maxHeaderSize - self.nread + start;
					self.nread = self.maxHeaderSize;
					self.maxed = true;
				} else self.nread += end - start;
				self.buffer += data.toString("binary", start, end);
			}
			if (isMatch) self._finish();
		});
	}
	inherits$3(HeaderParser, EventEmitter);
	HeaderParser.prototype.push = function(data) {
		const r = this.ss.push(data);
		if (this.finished) return r;
	};
	HeaderParser.prototype.reset = function() {
		this.finished = false;
		this.buffer = "";
		this.header = {};
		this.ss.reset();
	};
	HeaderParser.prototype._finish = function() {
		if (this.buffer) this._parseHeader();
		this.ss.matches = this.ss.maxMatches;
		const header = this.header;
		this.header = {};
		this.buffer = "";
		this.finished = true;
		this.nread = this.npairs = 0;
		this.maxed = false;
		this.emit("header", header);
	};
	HeaderParser.prototype._parseHeader = function() {
		if (this.npairs === this.maxHeaderPairs) return;
		const lines = this.buffer.split(RE_CRLF);
		const len = lines.length;
		let m, h;
		for (var i = 0; i < len; ++i) {
			if (lines[i].length === 0) continue;
			if (lines[i][0] === "	" || lines[i][0] === " ") {
				if (h) {
					this.header[h][this.header[h].length - 1] += lines[i];
					continue;
				}
			}
			const posColon = lines[i].indexOf(":");
			if (posColon === -1 || posColon === 0) return;
			m = RE_HDR.exec(lines[i]);
			h = m[1].toLowerCase();
			this.header[h] = this.header[h] || [];
			this.header[h].push(m[2] || "");
			if (++this.npairs === this.maxHeaderPairs) break;
		}
	};
	module.exports = HeaderParser;
}));
//#endregion
//#region node_modules/.pnpm/@fastify+busboy@3.2.0/node_modules/@fastify/busboy/deps/dicer/lib/Dicer.js
var require_Dicer = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var WritableStream$1 = __require("node:stream").Writable;
	var inherits$2 = __require("node:util").inherits;
	var StreamSearch = require_sbmh();
	var PartStream = require_PartStream();
	var HeaderParser = require_HeaderParser();
	var DASH = 45;
	var B_ONEDASH = Buffer.from("-");
	var B_CRLF = Buffer.from("\r\n");
	var EMPTY_FN = function() {};
	function Dicer(cfg) {
		if (!(this instanceof Dicer)) return new Dicer(cfg);
		WritableStream$1.call(this, cfg);
		if (!cfg || !cfg.headerFirst && typeof cfg.boundary !== "string") throw new TypeError("Boundary required");
		if (typeof cfg.boundary === "string") this.setBoundary(cfg.boundary);
		else this._bparser = void 0;
		this._headerFirst = cfg.headerFirst;
		this._dashes = 0;
		this._parts = 0;
		this._finished = false;
		this._realFinish = false;
		this._isPreamble = true;
		this._justMatched = false;
		this._firstWrite = true;
		this._inHeader = true;
		this._part = void 0;
		this._cb = void 0;
		this._ignoreData = false;
		this._partOpts = { highWaterMark: cfg.partHwm };
		this._pause = false;
		const self = this;
		this._hparser = new HeaderParser(cfg);
		this._hparser.on("header", function(header) {
			self._inHeader = false;
			self._part.emit("header", header);
		});
	}
	inherits$2(Dicer, WritableStream$1);
	Dicer.prototype.emit = function(ev) {
		if (ev === "finish" && !this._realFinish) {
			if (!this._finished) {
				const self = this;
				process.nextTick(function() {
					self.emit("error", /* @__PURE__ */ new Error("Unexpected end of multipart data"));
					if (self._part && !self._ignoreData) {
						const type = self._isPreamble ? "Preamble" : "Part";
						self._part.emit("error", /* @__PURE__ */ new Error(type + " terminated early due to unexpected end of multipart data"));
						self._part.push(null);
						process.nextTick(function() {
							self._realFinish = true;
							self.emit("finish");
							self._realFinish = false;
						});
						return;
					}
					self._realFinish = true;
					self.emit("finish");
					self._realFinish = false;
				});
			}
		} else WritableStream$1.prototype.emit.apply(this, arguments);
	};
	Dicer.prototype._write = function(data, encoding, cb) {
		if (!this._hparser && !this._bparser) return cb();
		if (this._headerFirst && this._isPreamble) {
			if (!this._part) {
				this._part = new PartStream(this._partOpts);
				if (this.listenerCount("preamble") !== 0) this.emit("preamble", this._part);
				else this._ignore();
			}
			const r = this._hparser.push(data);
			if (!this._inHeader && r !== void 0 && r < data.length) data = data.slice(r);
			else return cb();
		}
		if (this._firstWrite) {
			this._bparser.push(B_CRLF);
			this._firstWrite = false;
		}
		this._bparser.push(data);
		if (this._pause) this._cb = cb;
		else cb();
	};
	Dicer.prototype.reset = function() {
		this._part = void 0;
		this._bparser = void 0;
		this._hparser = void 0;
	};
	Dicer.prototype.setBoundary = function(boundary) {
		const self = this;
		this._bparser = new StreamSearch("\r\n--" + boundary);
		this._bparser.on("info", function(isMatch, data, start, end) {
			self._oninfo(isMatch, data, start, end);
		});
	};
	Dicer.prototype._ignore = function() {
		if (this._part && !this._ignoreData) {
			this._ignoreData = true;
			this._part.on("error", EMPTY_FN);
			this._part.resume();
		}
	};
	Dicer.prototype._oninfo = function(isMatch, data, start, end) {
		let buf;
		const self = this;
		let i = 0;
		let r;
		let shouldWriteMore = true;
		if (!this._part && this._justMatched && data) {
			while (this._dashes < 2 && start + i < end) if (data[start + i] === DASH) {
				++i;
				++this._dashes;
			} else {
				if (this._dashes) buf = B_ONEDASH;
				this._dashes = 0;
				break;
			}
			if (this._dashes === 2) {
				if (start + i < end && this.listenerCount("trailer") !== 0) this.emit("trailer", data.slice(start + i, end));
				this.reset();
				this._finished = true;
				if (self._parts === 0) {
					self._realFinish = true;
					self.emit("finish");
					self._realFinish = false;
				}
			}
			if (this._dashes) return;
		}
		if (this._justMatched) this._justMatched = false;
		if (!this._part) {
			this._part = new PartStream(this._partOpts);
			this._part._read = function(n) {
				self._unpause();
			};
			if (this._isPreamble && this.listenerCount("preamble") !== 0) this.emit("preamble", this._part);
			else if (this._isPreamble !== true && this.listenerCount("part") !== 0) this.emit("part", this._part);
			else this._ignore();
			if (!this._isPreamble) this._inHeader = true;
		}
		if (data && start < end && !this._ignoreData) {
			if (this._isPreamble || !this._inHeader) {
				if (buf) shouldWriteMore = this._part.push(buf);
				shouldWriteMore = this._part.push(data.slice(start, end));
				if (!shouldWriteMore) this._pause = true;
			} else if (!this._isPreamble && this._inHeader) {
				if (buf) this._hparser.push(buf);
				r = this._hparser.push(data.slice(start, end));
				if (!this._inHeader && r !== void 0 && r < end) this._oninfo(false, data, start + r, end);
			}
		}
		if (isMatch) {
			this._hparser.reset();
			if (this._isPreamble) this._isPreamble = false;
			else if (start !== end) {
				++this._parts;
				this._part.on("end", function() {
					if (--self._parts === 0) {
						if (self._finished) {
							self._realFinish = true;
							self.emit("finish");
							self._realFinish = false;
						} else self._unpause();
					}
				});
			}
			this._part.push(null);
			this._part = void 0;
			this._ignoreData = false;
			this._justMatched = true;
			this._dashes = 0;
		}
	};
	Dicer.prototype._unpause = function() {
		if (!this._pause) return;
		this._pause = false;
		if (this._cb) {
			const cb = this._cb;
			this._cb = void 0;
			cb();
		}
	};
	module.exports = Dicer;
}));
//#endregion
//#region node_modules/.pnpm/@fastify+busboy@3.2.0/node_modules/@fastify/busboy/lib/utils/decodeText.js
var require_decodeText = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var utf8Decoder = new TextDecoder("utf-8");
	var textDecoders = /* @__PURE__ */ new Map([["utf-8", utf8Decoder], ["utf8", utf8Decoder]]);
	function getDecoder(charset) {
		let lc;
		while (true) switch (charset) {
			case "utf-8":
			case "utf8": return decoders.utf8;
			case "latin1":
			case "ascii":
			case "us-ascii":
			case "iso-8859-1":
			case "iso8859-1":
			case "iso88591":
			case "iso_8859-1":
			case "windows-1252":
			case "iso_8859-1:1987":
			case "cp1252":
			case "x-cp1252": return decoders.latin1;
			case "utf16le":
			case "utf-16le":
			case "ucs2":
			case "ucs-2": return decoders.utf16le;
			case "base64": return decoders.base64;
			default:
				if (lc === void 0) {
					lc = true;
					charset = charset.toLowerCase();
					continue;
				}
				return decoders.other.bind(charset);
		}
	}
	var decoders = {
		utf8: (data, sourceEncoding) => {
			if (data.length === 0) return "";
			if (typeof data === "string") data = Buffer.from(data, sourceEncoding);
			return data.utf8Slice(0, data.length);
		},
		latin1: (data, sourceEncoding) => {
			if (data.length === 0) return "";
			if (typeof data === "string") return data;
			return data.latin1Slice(0, data.length);
		},
		utf16le: (data, sourceEncoding) => {
			if (data.length === 0) return "";
			if (typeof data === "string") data = Buffer.from(data, sourceEncoding);
			return data.ucs2Slice(0, data.length);
		},
		base64: (data, sourceEncoding) => {
			if (data.length === 0) return "";
			if (typeof data === "string") data = Buffer.from(data, sourceEncoding);
			return data.base64Slice(0, data.length);
		},
		other: (data, sourceEncoding) => {
			if (data.length === 0) return "";
			if (typeof data === "string") data = Buffer.from(data, sourceEncoding);
			if (textDecoders.has(exports.toString())) try {
				return textDecoders.get(exports).decode(data);
			} catch {}
			return typeof data === "string" ? data : data.toString();
		}
	};
	function decodeText(text, sourceEncoding, destEncoding) {
		if (text) return getDecoder(destEncoding)(text, sourceEncoding);
		return text;
	}
	module.exports = decodeText;
}));
//#endregion
//#region node_modules/.pnpm/@fastify+busboy@3.2.0/node_modules/@fastify/busboy/lib/utils/parseParams.js
var require_parseParams = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var decodeText = require_decodeText();
	var RE_ENCODED = /%[a-fA-F0-9][a-fA-F0-9]/g;
	var EncodedLookup = {
		"%00": "\0",
		"%01": "",
		"%02": "",
		"%03": "",
		"%04": "",
		"%05": "",
		"%06": "",
		"%07": "\x07",
		"%08": "\b",
		"%09": "	",
		"%0a": "\n",
		"%0A": "\n",
		"%0b": "\v",
		"%0B": "\v",
		"%0c": "\f",
		"%0C": "\f",
		"%0d": "\r",
		"%0D": "\r",
		"%0e": "",
		"%0E": "",
		"%0f": "",
		"%0F": "",
		"%10": "",
		"%11": "",
		"%12": "",
		"%13": "",
		"%14": "",
		"%15": "",
		"%16": "",
		"%17": "",
		"%18": "",
		"%19": "",
		"%1a": "",
		"%1A": "",
		"%1b": "\x1B",
		"%1B": "\x1B",
		"%1c": "",
		"%1C": "",
		"%1d": "",
		"%1D": "",
		"%1e": "",
		"%1E": "",
		"%1f": "",
		"%1F": "",
		"%20": " ",
		"%21": "!",
		"%22": "\"",
		"%23": "#",
		"%24": "$",
		"%25": "%",
		"%26": "&",
		"%27": "'",
		"%28": "(",
		"%29": ")",
		"%2a": "*",
		"%2A": "*",
		"%2b": "+",
		"%2B": "+",
		"%2c": ",",
		"%2C": ",",
		"%2d": "-",
		"%2D": "-",
		"%2e": ".",
		"%2E": ".",
		"%2f": "/",
		"%2F": "/",
		"%30": "0",
		"%31": "1",
		"%32": "2",
		"%33": "3",
		"%34": "4",
		"%35": "5",
		"%36": "6",
		"%37": "7",
		"%38": "8",
		"%39": "9",
		"%3a": ":",
		"%3A": ":",
		"%3b": ";",
		"%3B": ";",
		"%3c": "<",
		"%3C": "<",
		"%3d": "=",
		"%3D": "=",
		"%3e": ">",
		"%3E": ">",
		"%3f": "?",
		"%3F": "?",
		"%40": "@",
		"%41": "A",
		"%42": "B",
		"%43": "C",
		"%44": "D",
		"%45": "E",
		"%46": "F",
		"%47": "G",
		"%48": "H",
		"%49": "I",
		"%4a": "J",
		"%4A": "J",
		"%4b": "K",
		"%4B": "K",
		"%4c": "L",
		"%4C": "L",
		"%4d": "M",
		"%4D": "M",
		"%4e": "N",
		"%4E": "N",
		"%4f": "O",
		"%4F": "O",
		"%50": "P",
		"%51": "Q",
		"%52": "R",
		"%53": "S",
		"%54": "T",
		"%55": "U",
		"%56": "V",
		"%57": "W",
		"%58": "X",
		"%59": "Y",
		"%5a": "Z",
		"%5A": "Z",
		"%5b": "[",
		"%5B": "[",
		"%5c": "\\",
		"%5C": "\\",
		"%5d": "]",
		"%5D": "]",
		"%5e": "^",
		"%5E": "^",
		"%5f": "_",
		"%5F": "_",
		"%60": "`",
		"%61": "a",
		"%62": "b",
		"%63": "c",
		"%64": "d",
		"%65": "e",
		"%66": "f",
		"%67": "g",
		"%68": "h",
		"%69": "i",
		"%6a": "j",
		"%6A": "j",
		"%6b": "k",
		"%6B": "k",
		"%6c": "l",
		"%6C": "l",
		"%6d": "m",
		"%6D": "m",
		"%6e": "n",
		"%6E": "n",
		"%6f": "o",
		"%6F": "o",
		"%70": "p",
		"%71": "q",
		"%72": "r",
		"%73": "s",
		"%74": "t",
		"%75": "u",
		"%76": "v",
		"%77": "w",
		"%78": "x",
		"%79": "y",
		"%7a": "z",
		"%7A": "z",
		"%7b": "{",
		"%7B": "{",
		"%7c": "|",
		"%7C": "|",
		"%7d": "}",
		"%7D": "}",
		"%7e": "~",
		"%7E": "~",
		"%7f": "",
		"%7F": "",
		"%80": "",
		"%81": "",
		"%82": "",
		"%83": "",
		"%84": "",
		"%85": "",
		"%86": "",
		"%87": "",
		"%88": "",
		"%89": "",
		"%8a": "",
		"%8A": "",
		"%8b": "",
		"%8B": "",
		"%8c": "",
		"%8C": "",
		"%8d": "",
		"%8D": "",
		"%8e": "",
		"%8E": "",
		"%8f": "",
		"%8F": "",
		"%90": "",
		"%91": "",
		"%92": "",
		"%93": "",
		"%94": "",
		"%95": "",
		"%96": "",
		"%97": "",
		"%98": "",
		"%99": "",
		"%9a": "",
		"%9A": "",
		"%9b": "",
		"%9B": "",
		"%9c": "",
		"%9C": "",
		"%9d": "",
		"%9D": "",
		"%9e": "",
		"%9E": "",
		"%9f": "",
		"%9F": "",
		"%a0": "\xA0",
		"%A0": "\xA0",
		"%a1": "¡",
		"%A1": "¡",
		"%a2": "¢",
		"%A2": "¢",
		"%a3": "£",
		"%A3": "£",
		"%a4": "¤",
		"%A4": "¤",
		"%a5": "¥",
		"%A5": "¥",
		"%a6": "¦",
		"%A6": "¦",
		"%a7": "§",
		"%A7": "§",
		"%a8": "¨",
		"%A8": "¨",
		"%a9": "©",
		"%A9": "©",
		"%aa": "ª",
		"%Aa": "ª",
		"%aA": "ª",
		"%AA": "ª",
		"%ab": "«",
		"%Ab": "«",
		"%aB": "«",
		"%AB": "«",
		"%ac": "¬",
		"%Ac": "¬",
		"%aC": "¬",
		"%AC": "¬",
		"%ad": "­",
		"%Ad": "­",
		"%aD": "­",
		"%AD": "­",
		"%ae": "®",
		"%Ae": "®",
		"%aE": "®",
		"%AE": "®",
		"%af": "¯",
		"%Af": "¯",
		"%aF": "¯",
		"%AF": "¯",
		"%b0": "°",
		"%B0": "°",
		"%b1": "±",
		"%B1": "±",
		"%b2": "²",
		"%B2": "²",
		"%b3": "³",
		"%B3": "³",
		"%b4": "´",
		"%B4": "´",
		"%b5": "µ",
		"%B5": "µ",
		"%b6": "¶",
		"%B6": "¶",
		"%b7": "·",
		"%B7": "·",
		"%b8": "¸",
		"%B8": "¸",
		"%b9": "¹",
		"%B9": "¹",
		"%ba": "º",
		"%Ba": "º",
		"%bA": "º",
		"%BA": "º",
		"%bb": "»",
		"%Bb": "»",
		"%bB": "»",
		"%BB": "»",
		"%bc": "¼",
		"%Bc": "¼",
		"%bC": "¼",
		"%BC": "¼",
		"%bd": "½",
		"%Bd": "½",
		"%bD": "½",
		"%BD": "½",
		"%be": "¾",
		"%Be": "¾",
		"%bE": "¾",
		"%BE": "¾",
		"%bf": "¿",
		"%Bf": "¿",
		"%bF": "¿",
		"%BF": "¿",
		"%c0": "À",
		"%C0": "À",
		"%c1": "Á",
		"%C1": "Á",
		"%c2": "Â",
		"%C2": "Â",
		"%c3": "Ã",
		"%C3": "Ã",
		"%c4": "Ä",
		"%C4": "Ä",
		"%c5": "Å",
		"%C5": "Å",
		"%c6": "Æ",
		"%C6": "Æ",
		"%c7": "Ç",
		"%C7": "Ç",
		"%c8": "È",
		"%C8": "È",
		"%c9": "É",
		"%C9": "É",
		"%ca": "Ê",
		"%Ca": "Ê",
		"%cA": "Ê",
		"%CA": "Ê",
		"%cb": "Ë",
		"%Cb": "Ë",
		"%cB": "Ë",
		"%CB": "Ë",
		"%cc": "Ì",
		"%Cc": "Ì",
		"%cC": "Ì",
		"%CC": "Ì",
		"%cd": "Í",
		"%Cd": "Í",
		"%cD": "Í",
		"%CD": "Í",
		"%ce": "Î",
		"%Ce": "Î",
		"%cE": "Î",
		"%CE": "Î",
		"%cf": "Ï",
		"%Cf": "Ï",
		"%cF": "Ï",
		"%CF": "Ï",
		"%d0": "Ð",
		"%D0": "Ð",
		"%d1": "Ñ",
		"%D1": "Ñ",
		"%d2": "Ò",
		"%D2": "Ò",
		"%d3": "Ó",
		"%D3": "Ó",
		"%d4": "Ô",
		"%D4": "Ô",
		"%d5": "Õ",
		"%D5": "Õ",
		"%d6": "Ö",
		"%D6": "Ö",
		"%d7": "×",
		"%D7": "×",
		"%d8": "Ø",
		"%D8": "Ø",
		"%d9": "Ù",
		"%D9": "Ù",
		"%da": "Ú",
		"%Da": "Ú",
		"%dA": "Ú",
		"%DA": "Ú",
		"%db": "Û",
		"%Db": "Û",
		"%dB": "Û",
		"%DB": "Û",
		"%dc": "Ü",
		"%Dc": "Ü",
		"%dC": "Ü",
		"%DC": "Ü",
		"%dd": "Ý",
		"%Dd": "Ý",
		"%dD": "Ý",
		"%DD": "Ý",
		"%de": "Þ",
		"%De": "Þ",
		"%dE": "Þ",
		"%DE": "Þ",
		"%df": "ß",
		"%Df": "ß",
		"%dF": "ß",
		"%DF": "ß",
		"%e0": "à",
		"%E0": "à",
		"%e1": "á",
		"%E1": "á",
		"%e2": "â",
		"%E2": "â",
		"%e3": "ã",
		"%E3": "ã",
		"%e4": "ä",
		"%E4": "ä",
		"%e5": "å",
		"%E5": "å",
		"%e6": "æ",
		"%E6": "æ",
		"%e7": "ç",
		"%E7": "ç",
		"%e8": "è",
		"%E8": "è",
		"%e9": "é",
		"%E9": "é",
		"%ea": "ê",
		"%Ea": "ê",
		"%eA": "ê",
		"%EA": "ê",
		"%eb": "ë",
		"%Eb": "ë",
		"%eB": "ë",
		"%EB": "ë",
		"%ec": "ì",
		"%Ec": "ì",
		"%eC": "ì",
		"%EC": "ì",
		"%ed": "í",
		"%Ed": "í",
		"%eD": "í",
		"%ED": "í",
		"%ee": "î",
		"%Ee": "î",
		"%eE": "î",
		"%EE": "î",
		"%ef": "ï",
		"%Ef": "ï",
		"%eF": "ï",
		"%EF": "ï",
		"%f0": "ð",
		"%F0": "ð",
		"%f1": "ñ",
		"%F1": "ñ",
		"%f2": "ò",
		"%F2": "ò",
		"%f3": "ó",
		"%F3": "ó",
		"%f4": "ô",
		"%F4": "ô",
		"%f5": "õ",
		"%F5": "õ",
		"%f6": "ö",
		"%F6": "ö",
		"%f7": "÷",
		"%F7": "÷",
		"%f8": "ø",
		"%F8": "ø",
		"%f9": "ù",
		"%F9": "ù",
		"%fa": "ú",
		"%Fa": "ú",
		"%fA": "ú",
		"%FA": "ú",
		"%fb": "û",
		"%Fb": "û",
		"%fB": "û",
		"%FB": "û",
		"%fc": "ü",
		"%Fc": "ü",
		"%fC": "ü",
		"%FC": "ü",
		"%fd": "ý",
		"%Fd": "ý",
		"%fD": "ý",
		"%FD": "ý",
		"%fe": "þ",
		"%Fe": "þ",
		"%fE": "þ",
		"%FE": "þ",
		"%ff": "ÿ",
		"%Ff": "ÿ",
		"%fF": "ÿ",
		"%FF": "ÿ"
	};
	function encodedReplacer(match) {
		return EncodedLookup[match];
	}
	var STATE_KEY = 0;
	var STATE_VALUE = 1;
	var STATE_CHARSET = 2;
	var STATE_LANG = 3;
	function parseParams(str) {
		const res = [];
		let state = STATE_KEY;
		let charset = "";
		let inquote = false;
		let escaping = false;
		let p = 0;
		let tmp = "";
		const len = str.length;
		for (var i = 0; i < len; ++i) {
			const char = str[i];
			if (char === "\\" && inquote) {
				if (escaping) escaping = false;
				else {
					escaping = true;
					continue;
				}
			} else if (char === "\"") {
				if (!escaping) {
					if (inquote) {
						inquote = false;
						state = STATE_KEY;
						while (i + 1 < len && str[i + 1] !== ";") ++i;
					} else inquote = true;
					continue;
				} else escaping = false;
			} else {
				if (escaping && inquote) tmp += "\\";
				escaping = false;
				if ((state === STATE_CHARSET || state === STATE_LANG) && char === "'") {
					if (state === STATE_CHARSET) {
						state = STATE_LANG;
						charset = tmp.substring(1);
					} else state = STATE_VALUE;
					tmp = "";
					continue;
				} else if (state === STATE_KEY && (char === "*" || char === "=") && res.length) {
					state = char === "*" ? STATE_CHARSET : STATE_VALUE;
					res[p] = [tmp, void 0];
					tmp = "";
					continue;
				} else if (!inquote && char === ";") {
					state = STATE_KEY;
					if (charset) {
						if (tmp.length) tmp = decodeText(tmp.replace(RE_ENCODED, encodedReplacer), "binary", charset);
						charset = "";
					} else if (tmp.length) tmp = decodeText(tmp, "binary", "utf8");
					if (res[p] === void 0) res[p] = tmp;
					else res[p][1] = tmp;
					tmp = "";
					++p;
					continue;
				} else if (!inquote && (char === " " || char === "	")) continue;
			}
			tmp += char;
		}
		if (charset && tmp.length) tmp = decodeText(tmp.replace(RE_ENCODED, encodedReplacer), "binary", charset);
		else if (tmp) tmp = decodeText(tmp, "binary", "utf8");
		if (res[p] === void 0) {
			if (tmp) res[p] = tmp;
		} else res[p][1] = tmp;
		return res;
	}
	module.exports = parseParams;
}));
//#endregion
//#region node_modules/.pnpm/@fastify+busboy@3.2.0/node_modules/@fastify/busboy/lib/utils/basename.js
var require_basename = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = function basename(path) {
		if (typeof path !== "string") return "";
		for (var i = path.length - 1; i >= 0; --i) switch (path.charCodeAt(i)) {
			case 47:
			case 92:
				path = path.slice(i + 1);
				return path === ".." || path === "." ? "" : path;
		}
		return path === ".." || path === "." ? "" : path;
	};
}));
//#endregion
//#region node_modules/.pnpm/@fastify+busboy@3.2.0/node_modules/@fastify/busboy/lib/types/multipart.js
var require_multipart = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { Readable } = __require("node:stream");
	var { inherits: inherits$1 } = __require("node:util");
	var Dicer = require_Dicer();
	var parseParams = require_parseParams();
	var decodeText = require_decodeText();
	var basename = require_basename();
	var getLimit = require_getLimit();
	var RE_BOUNDARY = /^boundary$/i;
	var RE_FIELD = /^form-data$/i;
	var RE_CHARSET = /^charset$/i;
	var RE_FILENAME = /^filename$/i;
	var RE_NAME = /^name$/i;
	Multipart.detect = /^multipart\/form-data/i;
	function Multipart(boy, cfg) {
		let i;
		let len;
		const self = this;
		let boundary;
		const limits = cfg.limits;
		const isPartAFile = cfg.isPartAFile || ((fieldName, contentType, fileName) => contentType === "application/octet-stream" || fileName !== void 0);
		const parsedConType = cfg.parsedConType || [];
		const defCharset = cfg.defCharset || "utf8";
		const preservePath = cfg.preservePath;
		const fileOpts = { highWaterMark: cfg.fileHwm };
		for (i = 0, len = parsedConType.length; i < len; ++i) if (Array.isArray(parsedConType[i]) && RE_BOUNDARY.test(parsedConType[i][0])) {
			boundary = parsedConType[i][1];
			break;
		}
		function checkFinished() {
			if (nends === 0 && finished && !boy._done) {
				finished = false;
				self.end();
			}
		}
		if (typeof boundary !== "string") throw new Error("Multipart: Boundary not found");
		const fieldSizeLimit = getLimit(limits, "fieldSize", 1048576);
		const fileSizeLimit = getLimit(limits, "fileSize", Infinity);
		const filesLimit = getLimit(limits, "files", Infinity);
		const fieldsLimit = getLimit(limits, "fields", Infinity);
		const partsLimit = getLimit(limits, "parts", Infinity);
		const headerPairsLimit = getLimit(limits, "headerPairs", 2e3);
		const headerSizeLimit = getLimit(limits, "headerSize", 81920);
		let nfiles = 0;
		let nfields = 0;
		let nends = 0;
		let curFile;
		let curField;
		let finished = false;
		this._needDrain = false;
		this._pause = false;
		this._cb = void 0;
		this._nparts = 0;
		this._boy = boy;
		const parserCfg = {
			boundary,
			maxHeaderPairs: headerPairsLimit,
			maxHeaderSize: headerSizeLimit,
			partHwm: fileOpts.highWaterMark,
			highWaterMark: cfg.highWaterMark
		};
		this.parser = new Dicer(parserCfg);
		this.parser.on("drain", function() {
			self._needDrain = false;
			if (self._cb && !self._pause) {
				const cb = self._cb;
				self._cb = void 0;
				cb();
			}
		}).on("part", function onPart(part) {
			if (++self._nparts > partsLimit) {
				self.parser.removeListener("part", onPart);
				self.parser.on("part", skipPart);
				boy.hitPartsLimit = true;
				boy.emit("partsLimit");
				return skipPart(part);
			}
			if (curField) {
				const field = curField;
				field.emit("end");
				field.removeAllListeners("end");
			}
			part.on("header", function(header) {
				let contype;
				let fieldname;
				let parsed;
				let charset;
				let encoding;
				let filename;
				let nsize = 0;
				if (header["content-type"]) {
					parsed = parseParams(header["content-type"][0]);
					if (parsed[0]) {
						contype = parsed[0].toLowerCase();
						for (i = 0, len = parsed.length; i < len; ++i) if (RE_CHARSET.test(parsed[i][0])) {
							charset = parsed[i][1].toLowerCase();
							break;
						}
					}
				}
				if (contype === void 0) contype = "text/plain";
				if (charset === void 0) charset = defCharset;
				if (header["content-disposition"]) {
					parsed = parseParams(header["content-disposition"][0]);
					if (!RE_FIELD.test(parsed[0])) return skipPart(part);
					for (i = 0, len = parsed.length; i < len; ++i) if (RE_NAME.test(parsed[i][0])) fieldname = parsed[i][1];
					else if (RE_FILENAME.test(parsed[i][0])) {
						filename = parsed[i][1];
						if (!preservePath) filename = basename(filename);
					}
				} else return skipPart(part);
				if (header["content-transfer-encoding"]) encoding = header["content-transfer-encoding"][0].toLowerCase();
				else encoding = "7bit";
				let onData, onEnd;
				if (isPartAFile(fieldname, contype, filename)) {
					if (nfiles === filesLimit) {
						if (!boy.hitFilesLimit) {
							boy.hitFilesLimit = true;
							boy.emit("filesLimit");
						}
						return skipPart(part);
					}
					++nfiles;
					if (boy.listenerCount("file") === 0) {
						self.parser._ignore();
						return;
					}
					++nends;
					const file = new FileStream(fileOpts);
					curFile = file;
					file.on("end", function() {
						--nends;
						self._pause = false;
						checkFinished();
						if (self._cb && !self._needDrain) {
							const cb = self._cb;
							self._cb = void 0;
							cb();
						}
					});
					file._read = function(n) {
						if (!self._pause) return;
						self._pause = false;
						if (self._cb && !self._needDrain) {
							const cb = self._cb;
							self._cb = void 0;
							cb();
						}
					};
					boy.emit("file", fieldname, file, filename, encoding, contype);
					onData = function(data) {
						if ((nsize += data.length) > fileSizeLimit) {
							const extralen = fileSizeLimit - nsize + data.length;
							if (extralen > 0) file.push(data.slice(0, extralen));
							file.truncated = true;
							file.bytesRead = fileSizeLimit;
							part.removeAllListeners("data");
							file.emit("limit");
							return;
						} else if (!file.push(data)) self._pause = true;
						file.bytesRead = nsize;
					};
					onEnd = function() {
						curFile = void 0;
						file.push(null);
					};
				} else {
					if (nfields === fieldsLimit) {
						if (!boy.hitFieldsLimit) {
							boy.hitFieldsLimit = true;
							boy.emit("fieldsLimit");
						}
						return skipPart(part);
					}
					++nfields;
					++nends;
					let buffer = "";
					let truncated = false;
					curField = part;
					onData = function(data) {
						if ((nsize += data.length) > fieldSizeLimit) {
							const extralen = fieldSizeLimit - (nsize - data.length);
							buffer += data.toString("binary", 0, extralen);
							truncated = true;
							part.removeAllListeners("data");
						} else buffer += data.toString("binary");
					};
					onEnd = function() {
						curField = void 0;
						if (buffer.length) buffer = decodeText(buffer, "binary", charset);
						boy.emit("field", fieldname, buffer, false, truncated, encoding, contype);
						--nends;
						checkFinished();
					};
				}
				part._readableState.sync = false;
				part.on("data", onData);
				part.on("end", onEnd);
			}).on("error", function(err) {
				if (curFile) curFile.emit("error", err);
			});
		}).on("error", function(err) {
			boy.emit("error", err);
		}).on("finish", function() {
			finished = true;
			checkFinished();
		});
	}
	Multipart.prototype.write = function(chunk, cb) {
		const r = this.parser.write(chunk);
		if (r && !this._pause) cb();
		else {
			this._needDrain = !r;
			this._cb = cb;
		}
	};
	Multipart.prototype.end = function() {
		const self = this;
		if (self.parser.writable) self.parser.end();
		else if (!self._boy._done) process.nextTick(function() {
			self._boy._done = true;
			self._boy.emit("finish");
		});
	};
	function skipPart(part) {
		part.resume();
	}
	function FileStream(opts) {
		Readable.call(this, opts);
		this.bytesRead = 0;
		this.truncated = false;
	}
	inherits$1(FileStream, Readable);
	FileStream.prototype._read = function(n) {};
	module.exports = Multipart;
}));
//#endregion
//#region node_modules/.pnpm/@fastify+busboy@3.2.0/node_modules/@fastify/busboy/lib/utils/Decoder.js
var require_Decoder = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var RE_PLUS = /\+/g;
	var HEX = [
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		1,
		1,
		1,
		1,
		1,
		1,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		1,
		1,
		1,
		1,
		1,
		1,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0
	];
	function Decoder() {
		this.buffer = void 0;
	}
	Decoder.prototype.write = function(str) {
		str = str.replace(RE_PLUS, " ");
		let res = "";
		let i = 0;
		let p = 0;
		const len = str.length;
		for (; i < len; ++i) if (this.buffer !== void 0) {
			if (!HEX[str.charCodeAt(i)]) {
				res += "%" + this.buffer;
				this.buffer = void 0;
				--i;
			} else {
				this.buffer += str[i];
				++p;
				if (this.buffer.length === 2) {
					res += String.fromCharCode(parseInt(this.buffer, 16));
					this.buffer = void 0;
				}
			}
		} else if (str[i] === "%") {
			if (i > p) {
				res += str.substring(p, i);
				p = i;
			}
			this.buffer = "";
			++p;
		}
		if (p < len && this.buffer === void 0) res += str.substring(p);
		return res;
	};
	Decoder.prototype.reset = function() {
		this.buffer = void 0;
	};
	module.exports = Decoder;
}));
//#endregion
//#region node_modules/.pnpm/@fastify+busboy@3.2.0/node_modules/@fastify/busboy/lib/types/urlencoded.js
var require_urlencoded = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var Decoder = require_Decoder();
	var decodeText = require_decodeText();
	var getLimit = require_getLimit();
	var RE_CHARSET = /^charset$/i;
	UrlEncoded.detect = /^application\/x-www-form-urlencoded/i;
	function UrlEncoded(boy, cfg) {
		const limits = cfg.limits;
		const parsedConType = cfg.parsedConType;
		this.boy = boy;
		this.fieldSizeLimit = getLimit(limits, "fieldSize", 1048576);
		this.fieldNameSizeLimit = getLimit(limits, "fieldNameSize", 100);
		this.fieldsLimit = getLimit(limits, "fields", Infinity);
		let charset;
		for (var i = 0, len = parsedConType.length; i < len; ++i) if (Array.isArray(parsedConType[i]) && RE_CHARSET.test(parsedConType[i][0])) {
			charset = parsedConType[i][1].toLowerCase();
			break;
		}
		if (charset === void 0) charset = cfg.defCharset || "utf8";
		this.decoder = new Decoder();
		this.charset = charset;
		this._fields = 0;
		this._state = "key";
		this._checkingBytes = true;
		this._bytesKey = 0;
		this._bytesVal = 0;
		this._key = "";
		this._val = "";
		this._keyTrunc = false;
		this._valTrunc = false;
		this._hitLimit = false;
	}
	UrlEncoded.prototype.write = function(data, cb) {
		if (this._fields === this.fieldsLimit) {
			if (!this.boy.hitFieldsLimit) {
				this.boy.hitFieldsLimit = true;
				this.boy.emit("fieldsLimit");
			}
			return cb();
		}
		let idxeq;
		let idxamp;
		let i;
		let p = 0;
		const len = data.length;
		while (p < len) if (this._state === "key") {
			idxeq = idxamp = void 0;
			for (i = p; i < len; ++i) {
				if (!this._checkingBytes) ++p;
				if (data[i] === 61) {
					idxeq = i;
					break;
				} else if (data[i] === 38) {
					idxamp = i;
					break;
				}
				if (this._checkingBytes && this._bytesKey === this.fieldNameSizeLimit) {
					this._hitLimit = true;
					break;
				} else if (this._checkingBytes) ++this._bytesKey;
			}
			if (idxeq !== void 0) {
				if (idxeq > p) this._key += this.decoder.write(data.toString("binary", p, idxeq));
				this._state = "val";
				this._hitLimit = false;
				this._checkingBytes = true;
				this._val = "";
				this._bytesVal = 0;
				this._valTrunc = false;
				this.decoder.reset();
				p = idxeq + 1;
			} else if (idxamp !== void 0) {
				++this._fields;
				let key;
				const keyTrunc = this._keyTrunc;
				if (idxamp > p) key = this._key += this.decoder.write(data.toString("binary", p, idxamp));
				else key = this._key;
				this._hitLimit = false;
				this._checkingBytes = true;
				this._key = "";
				this._bytesKey = 0;
				this._keyTrunc = false;
				this.decoder.reset();
				if (key.length) this.boy.emit("field", decodeText(key, "binary", this.charset), "", keyTrunc, false);
				p = idxamp + 1;
				if (this._fields === this.fieldsLimit) return cb();
			} else if (this._hitLimit) {
				if (i > p) this._key += this.decoder.write(data.toString("binary", p, i));
				p = i;
				if ((this._bytesKey = this._key.length) === this.fieldNameSizeLimit) {
					this._checkingBytes = false;
					this._keyTrunc = true;
				}
			} else {
				if (p < len) this._key += this.decoder.write(data.toString("binary", p));
				p = len;
			}
		} else {
			idxamp = void 0;
			for (i = p; i < len; ++i) {
				if (!this._checkingBytes) ++p;
				if (data[i] === 38) {
					idxamp = i;
					break;
				}
				if (this._checkingBytes && this._bytesVal === this.fieldSizeLimit) {
					this._hitLimit = true;
					break;
				} else if (this._checkingBytes) ++this._bytesVal;
			}
			if (idxamp !== void 0) {
				++this._fields;
				if (idxamp > p) this._val += this.decoder.write(data.toString("binary", p, idxamp));
				this.boy.emit("field", decodeText(this._key, "binary", this.charset), decodeText(this._val, "binary", this.charset), this._keyTrunc, this._valTrunc);
				this._state = "key";
				this._hitLimit = false;
				this._checkingBytes = true;
				this._key = "";
				this._bytesKey = 0;
				this._keyTrunc = false;
				this.decoder.reset();
				p = idxamp + 1;
				if (this._fields === this.fieldsLimit) return cb();
			} else if (this._hitLimit) {
				if (i > p) this._val += this.decoder.write(data.toString("binary", p, i));
				p = i;
				if (this._val === "" && this.fieldSizeLimit === 0 || (this._bytesVal = this._val.length) === this.fieldSizeLimit) {
					this._checkingBytes = false;
					this._valTrunc = true;
				}
			} else {
				if (p < len) this._val += this.decoder.write(data.toString("binary", p));
				p = len;
			}
		}
		cb();
	};
	UrlEncoded.prototype.end = function() {
		if (this.boy._done) return;
		if (this._state === "key" && this._key.length > 0) this.boy.emit("field", decodeText(this._key, "binary", this.charset), "", this._keyTrunc, false);
		else if (this._state === "val") this.boy.emit("field", decodeText(this._key, "binary", this.charset), decodeText(this._val, "binary", this.charset), this._keyTrunc, this._valTrunc);
		this.boy._done = true;
		this.boy.emit("finish");
	};
	module.exports = UrlEncoded;
}));
//#endregion
//#region node_modules/.pnpm/@fastify+busboy@3.2.0/node_modules/@fastify/busboy/lib/main.js
var require_main = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var WritableStream = __require("node:stream").Writable;
	var { inherits } = __require("node:util");
	var Dicer = require_Dicer();
	var MultipartParser = require_multipart();
	var UrlencodedParser = require_urlencoded();
	var parseParams = require_parseParams();
	function Busboy(opts) {
		if (!(this instanceof Busboy)) return new Busboy(opts);
		if (typeof opts !== "object") throw new TypeError("Busboy expected an options-Object.");
		if (typeof opts.headers !== "object") throw new TypeError("Busboy expected an options-Object with headers-attribute.");
		if (typeof opts.headers["content-type"] !== "string") throw new TypeError("Missing Content-Type-header.");
		const { headers, ...streamOptions } = opts;
		this.opts = {
			autoDestroy: false,
			...streamOptions
		};
		WritableStream.call(this, this.opts);
		this._done = false;
		this._parser = this.getParserByHeaders(headers);
		this._finished = false;
	}
	inherits(Busboy, WritableStream);
	Busboy.prototype.emit = function(ev) {
		if (ev === "finish") {
			if (!this._done) {
				this._parser?.end();
				return;
			} else if (this._finished) return;
			this._finished = true;
		}
		WritableStream.prototype.emit.apply(this, arguments);
	};
	Busboy.prototype.getParserByHeaders = function(headers) {
		const parsed = parseParams(headers["content-type"]);
		const cfg = {
			defCharset: this.opts.defCharset,
			fileHwm: this.opts.fileHwm,
			headers,
			highWaterMark: this.opts.highWaterMark,
			isPartAFile: this.opts.isPartAFile,
			limits: this.opts.limits,
			parsedConType: parsed,
			preservePath: this.opts.preservePath
		};
		if (MultipartParser.detect.test(parsed[0])) return new MultipartParser(this, cfg);
		if (UrlencodedParser.detect.test(parsed[0])) return new UrlencodedParser(this, cfg);
		throw new Error("Unsupported Content-Type.");
	};
	Busboy.prototype._write = function(chunk, encoding, cb) {
		this._parser.write(chunk, cb);
	};
	module.exports = Busboy;
	module.exports.default = Busboy;
	module.exports.Busboy = Busboy;
	module.exports.Dicer = Dicer;
}));
//#endregion
export { require_main as t };
