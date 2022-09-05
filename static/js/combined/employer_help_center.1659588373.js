/*
 jQuery Form Plugin
 version: 3.34.0-2013.05.17
 @requires jQuery v1.5 or later
 Copyright (c) 2013 M. Alsup
 Examples and documentation at: http://malsup.com/jquery/form/
 Project repository: https://github.com/malsup/form
 Dual licensed under the MIT and GPL licenses.
 https://github.com/malsup/form#copyright-and-license
*/
(function($) {
	var feature = {};
	feature.fileapi = $("<input type='file'/>").get(0).files !== undefined;
	feature.formdata = window.FormData !== undefined;
	var hasProp = !!$.fn.prop;
	$.fn.attr2 = function() {
		if (!hasProp) return this.attr.apply(this, arguments);
		var val = this.prop.apply(this, arguments);
		if (val && val.jquery || typeof val === "string") return val;
		return this.attr.apply(this, arguments)
	};
	$.fn.ajaxSubmit = function(options) {
		if (!this.length) {
			log("ajaxSubmit: skipping submit process - no element selected");
			return this
		}
		var method,
			action, url, $form = this;
		if (typeof options == "function") options = {
			success: options
		};
		method = options.type || this.attr2("method");
		action = options.url || this.attr2("action");
		url = typeof action === "string" ? $.trim(action) : "";
		url = url || window.location.href || "";
		if (url) url = (url.match(/^([^#]+)/) || [])[1];
		options = $.extend(true, {
			url: url,
			success: $.ajaxSettings.success,
			type: method || "GET",
			iframeSrc: /^https/i.test(window.location.href || "") ? "javascript:false" : "about:blank"
		}, options);
		var veto = {};
		this.trigger("form-pre-serialize",
			[this, options, veto]);
		if (veto.veto) {
			log("ajaxSubmit: submit vetoed via form-pre-serialize trigger");
			return this
		}
		if (options.beforeSerialize && options.beforeSerialize(this, options) === false) {
			log("ajaxSubmit: submit aborted via beforeSerialize callback");
			return this
		}
		var traditional = options.traditional;
		if (traditional === undefined) traditional = $.ajaxSettings.traditional;
		var elements = [];
		var qx, a = this.formToArray(options.semantic, elements);
		if (options.data) {
			options.extraData = options.data;
			qx = $.param(options.data,
				traditional)
		}
		if (options.beforeSubmit && options.beforeSubmit(a, this, options) === false) {
			log("ajaxSubmit: submit aborted via beforeSubmit callback");
			return this
		}
		this.trigger("form-submit-validate", [a, this, options, veto]);
		if (veto.veto) {
			log("ajaxSubmit: submit vetoed via form-submit-validate trigger");
			return this
		}
		var q = $.param(a, traditional);
		if (qx) q = q ? q + "&" + qx : qx;
		if (options.type.toUpperCase() == "GET") {
			options.url += (options.url.indexOf("?") >= 0 ? "&" : "?") + q;
			options.data = null
		} else options.data = q;
		var callbacks = [];
		if (options.resetForm) callbacks.push(function() {
			$form.resetForm()
		});
		if (options.clearForm) callbacks.push(function() {
			$form.clearForm(options.includeHidden)
		});
		if (!options.dataType && options.target) {
			var oldSuccess = options.success || function() {};
			callbacks.push(function(data) {
				var fn = options.replaceTarget ? "replaceWith" : "html";
				$(options.target)[fn](data).each(oldSuccess, arguments)
			})
		} else if (options.success) callbacks.push(options.success);
		options.success = function(data, status, xhr) {
			var context = options.context ||
				this;
			for (var i = 0, max = callbacks.length; i < max; i++) callbacks[i].apply(context, [data, status, xhr || $form, $form])
		};
		if (options.error) {
			var oldError = options.error;
			options.error = function(xhr, status, error) {
				var context = options.context || this;
				oldError.apply(context, [xhr, status, error, $form])
			}
		}
		if (options.complete) {
			var oldComplete = options.complete;
			options.complete = function(xhr, status) {
				var context = options.context || this;
				oldComplete.apply(context, [xhr, status, $form])
			}
		}
		var fileInputs = $('input[type=file]:enabled[value!=""]',
			this);
		var hasFileInputs = fileInputs.length > 0;
		var mp = "multipart/form-data";
		var multipart = $form.attr("enctype") == mp || $form.attr("encoding") == mp;
		var fileAPI = feature.fileapi && feature.formdata;
		log("fileAPI :" + fileAPI);
		var shouldUseFrame = (hasFileInputs || multipart) && !fileAPI;
		var jqxhr;
		if (options.iframe !== false && (options.iframe || shouldUseFrame))
			if (options.closeKeepAlive) $.get(options.closeKeepAlive, function() {
				jqxhr = fileUploadIframe(a)
			});
			else jqxhr = fileUploadIframe(a);
		else if ((hasFileInputs || multipart) && fileAPI) jqxhr =
			fileUploadXhr(a);
		else jqxhr = $.ajax(options);
		$form.removeData("jqxhr").data("jqxhr", jqxhr);
		for (var k = 0; k < elements.length; k++) elements[k] = null;
		this.trigger("form-submit-notify", [this, options]);
		return this;

		function deepSerialize(extraData) {
			var serialized = $.param(extraData).split("&");
			var len = serialized.length;
			var result = [];
			var i, part;
			for (i = 0; i < len; i++) {
				serialized[i] = serialized[i].replace(/\+/g, " ");
				part = serialized[i].split("=");
				result.push([decodeURIComponent(part[0]), decodeURIComponent(part[1])])
			}
			return result
		}

		function fileUploadXhr(a) {
			var formdata = new FormData;
			for (var i = 0; i < a.length; i++) formdata.append(a[i].name, a[i].value);
			if (options.extraData) {
				var serializedData = deepSerialize(options.extraData);
				for (i = 0; i < serializedData.length; i++)
					if (serializedData[i]) formdata.append(serializedData[i][0], serializedData[i][1])
			}
			options.data = null;
			var s = $.extend(true, {}, $.ajaxSettings, options, {
				contentType: false,
				processData: false,
				cache: false,
				type: method || "POST"
			});
			if (options.uploadProgress) s.xhr = function() {
				var xhr = jQuery.ajaxSettings.xhr();
				if (xhr.upload) xhr.upload.addEventListener("progress", function(event) {
					var percent = 0;
					var position = event.loaded || event.position;
					var total = event.total;
					if (event.lengthComputable) percent = Math.ceil(position / total * 100);
					options.uploadProgress(event, position, total, percent)
				}, false);
				return xhr
			};
			s.data = null;
			var beforeSend = s.beforeSend;
			s.beforeSend = function(xhr, o) {
				o.data = formdata;
				if (beforeSend) beforeSend.call(this, xhr, o)
			};
			return $.ajax(s)
		}

		function fileUploadIframe(a) {
			var form = $form[0],
				el, i, s, g, id, $io, io, xhr, sub,
				n, timedOut, timeoutHandle;
			var deferred = $.Deferred();
			if (a)
				for (i = 0; i < elements.length; i++) {
					el = $(elements[i]);
					if (hasProp) el.prop("disabled", false);
					else el.removeAttr("disabled")
				}
			s = $.extend(true, {}, $.ajaxSettings, options);
			s.context = s.context || s;
			id = "jqFormIO" + (new Date).getTime();
			if (s.iframeTarget) {
				$io = $(s.iframeTarget);
				n = $io.attr2("name");
				if (!n) $io.attr2("name", id);
				else id = n
			} else {
				$io = $('<iframe name="' + id + '" src="' + s.iframeSrc + '" />');
				$io.css({
					position: "absolute",
					top: "-1000px",
					left: "-1000px"
				})
			}
			io = $io[0];
			xhr = {
				aborted: 0,
				responseText: null,
				responseXML: null,
				status: 0,
				statusText: "n/a",
				getAllResponseHeaders: function() {},
				getResponseHeader: function() {},
				setRequestHeader: function() {},
				abort: function(status) {
					var e = status === "timeout" ? "timeout" : "aborted";
					log("aborting upload... " + e);
					this.aborted = 1;
					try {
						if (io.contentWindow.document.execCommand) io.contentWindow.document.execCommand("Stop")
					} catch (ignore) {}
					$io.attr("src", s.iframeSrc);
					xhr.error = e;
					if (s.error) s.error.call(s.context, xhr, e, status);
					if (g) $.event.trigger("ajaxError",
						[xhr, s, e]);
					if (s.complete) s.complete.call(s.context, xhr, e)
				}
			};
			g = s.global;
			if (g && 0 === $.active++) $.event.trigger("ajaxStart");
			if (g) $.event.trigger("ajaxSend", [xhr, s]);
			if (s.beforeSend && s.beforeSend.call(s.context, xhr, s) === false) {
				if (s.global) $.active--;
				deferred.reject();
				return deferred
			}
			if (xhr.aborted) {
				deferred.reject();
				return deferred
			}
			sub = form.clk;
			if (sub) {
				n = sub.name;
				if (n && !sub.disabled) {
					s.extraData = s.extraData || {};
					s.extraData[n] = sub.value;
					if (sub.type == "image") {
						s.extraData[n + ".x"] = form.clk_x;
						s.extraData[n +
							".y"] = form.clk_y
					}
				}
			}
			var CLIENT_TIMEOUT_ABORT = 1;
			var SERVER_ABORT = 2;

			function getDoc(frame) {
				var doc = null;
				try {
					if (frame.contentWindow) doc = frame.contentWindow.document
				} catch (err) {
					log("cannot get iframe.contentWindow document: " + err)
				}
				if (doc) return doc;
				try {
					doc = frame.contentDocument ? frame.contentDocument : frame.document
				} catch (err$0) {
					log("cannot get iframe.contentDocument: " + err$0);
					doc = frame.document
				}
				return doc
			}
			var csrf_token = $("meta[name=csrf-token]").attr("content");
			var csrf_param = $("meta[name=csrf-param]").attr("content");
			if (csrf_param && csrf_token) {
				s.extraData = s.extraData || {};
				s.extraData[csrf_param] = csrf_token
			}

			function doSubmit() {
				var t = $form.attr2("target"),
					a = $form.attr2("action");
				form.setAttribute("target", id);
				if (!method) form.setAttribute("method", "POST");
				if (a != s.url) form.setAttribute("action", s.url);
				if (!s.skipEncodingOverride && (!method || /post/i.test(method))) $form.attr({
					encoding: "multipart/form-data",
					enctype: "multipart/form-data"
				});
				if (s.timeout) timeoutHandle = setTimeout(function() {
						timedOut = true;
						cb(CLIENT_TIMEOUT_ABORT)
					},
					s.timeout);

				function checkState() {
					try {
						var state = getDoc(io).readyState;
						log("state = " + state);
						if (state && state.toLowerCase() == "uninitialized") setTimeout(checkState, 50)
					} catch (e) {
						log("Server abort: ", e, " (", e.name, ")");
						cb(SERVER_ABORT);
						if (timeoutHandle) clearTimeout(timeoutHandle);
						timeoutHandle = undefined
					}
				}
				var extraInputs = [];
				try {
					if (s.extraData)
						for (var n in s.extraData)
							if (s.extraData.hasOwnProperty(n))
								if ($.isPlainObject(s.extraData[n]) && s.extraData[n].hasOwnProperty("name") && s.extraData[n].hasOwnProperty("value")) extraInputs.push($('<input type="hidden" name="' +
									s.extraData[n].name + '">').val(s.extraData[n].value).appendTo(form)[0]);
								else extraInputs.push($('<input type="hidden" name="' + n + '">').val(s.extraData[n]).appendTo(form)[0]);
					if (!s.iframeTarget) {
						$io.appendTo("body");
						if (io.attachEvent) io.attachEvent("onload", cb);
						else io.addEventListener("load", cb, false)
					}
					setTimeout(checkState, 15);
					try {
						form.submit()
					} catch (err) {
						var submitFn = document.createElement("form").submit;
						submitFn.apply(form)
					}
				} finally {
					form.setAttribute("action", a);
					if (t) form.setAttribute("target", t);
					else $form.removeAttr("target");
					$(extraInputs).remove()
				}
			}
			if (s.forceSync) doSubmit();
			else setTimeout(doSubmit, 10);
			var data, doc, domCheckCount = 50,
				callbackProcessed;

			function cb(e) {
				if (xhr.aborted || callbackProcessed) return;
				doc = getDoc(io);
				if (!doc) {
					log("cannot access response document");
					e = SERVER_ABORT
				}
				if (e === CLIENT_TIMEOUT_ABORT && xhr) {
					xhr.abort("timeout");
					deferred.reject(xhr, "timeout");
					return
				} else if (e == SERVER_ABORT && xhr) {
					xhr.abort("server abort");
					deferred.reject(xhr, "error", "server abort");
					return
				}
				if (!doc ||
					doc.location.href == s.iframeSrc)
					if (!timedOut) return;
				if (io.detachEvent) io.detachEvent("onload", cb);
				else io.removeEventListener("load", cb, false);
				var status = "success",
					errMsg;
				try {
					if (timedOut) throw "timeout";
					var isXml = s.dataType == "xml" || doc.XMLDocument || $.isXMLDoc(doc);
					log("isXml=" + isXml);
					if (!isXml && window.opera && (doc.body === null || !doc.body.innerHTML))
						if (--domCheckCount) {
							log("requeing onLoad callback, DOM not available");
							setTimeout(cb, 250);
							return
						} var docRoot = doc.body ? doc.body : doc.documentElement;
					xhr.responseText =
						docRoot ? docRoot.innerHTML : null;
					xhr.responseXML = doc.XMLDocument ? doc.XMLDocument : doc;
					if (isXml) s.dataType = "xml";
					xhr.getResponseHeader = function(header) {
						var headers = {
							"content-type": s.dataType
						};
						return headers[header]
					};
					if (docRoot) {
						xhr.status = Number(docRoot.getAttribute("status")) || xhr.status;
						xhr.statusText = docRoot.getAttribute("statusText") || xhr.statusText
					}
					var dt = (s.dataType || "").toLowerCase();
					var scr = /(json|script|text)/.test(dt);
					if (scr || s.textarea) {
						var ta = doc.getElementsByTagName("textarea")[0];
						if (ta) {
							xhr.responseText =
								ta.value;
							xhr.status = Number(ta.getAttribute("status")) || xhr.status;
							xhr.statusText = ta.getAttribute("statusText") || xhr.statusText
						} else if (scr) {
							var pre = doc.getElementsByTagName("pre")[0];
							var b = doc.getElementsByTagName("body")[0];
							if (pre) xhr.responseText = pre.textContent ? pre.textContent : pre.innerText;
							else if (b) xhr.responseText = b.textContent ? b.textContent : b.innerText
						}
					} else if (dt == "xml" && !xhr.responseXML && xhr.responseText) xhr.responseXML = toXml(xhr.responseText);
					try {
						data = httpData(xhr, dt, s)
					} catch (err) {
						status =
							"parsererror";
						xhr.error = errMsg = err || status
					}
				} catch (err$1) {
					log("error caught: ", err$1);
					status = "error";
					xhr.error = errMsg = err$1 || status
				}
				if (xhr.aborted) {
					log("upload aborted");
					status = null
				}
				if (xhr.status) status = xhr.status >= 200 && xhr.status < 300 || xhr.status === 304 ? "success" : "error";
				if (status === "success") {
					if (s.success) s.success.call(s.context, data, "success", xhr);
					deferred.resolve(xhr.responseText, "success", xhr);
					if (g) $.event.trigger("ajaxSuccess", [xhr, s])
				} else if (status) {
					if (errMsg === undefined) errMsg = xhr.statusText;
					if (s.error) s.error.call(s.context, xhr, status, errMsg);
					deferred.reject(xhr, "error", errMsg);
					if (g) $.event.trigger("ajaxError", [xhr, s, errMsg])
				}
				if (g) $.event.trigger("ajaxComplete", [xhr, s]);
				if (g && !--$.active) $.event.trigger("ajaxStop");
				if (s.complete) s.complete.call(s.context, xhr, status);
				callbackProcessed = true;
				if (s.timeout) clearTimeout(timeoutHandle);
				setTimeout(function() {
					if (!s.iframeTarget) $io.remove();
					xhr.responseXML = null
				}, 100)
			}
			var toXml = $.parseXML || function(s, doc) {
				if (window.ActiveXObject) {
					doc = new ActiveXObject("Microsoft.XMLDOM");
					doc.async = "false";
					doc.loadXML(s)
				} else doc = (new DOMParser).parseFromString(s, "text/xml");
				return doc && doc.documentElement && doc.documentElement.nodeName != "parsererror" ? doc : null
			};
			var parseJSON = $.parseJSON || function(s) {
				return window["eval"]("(" + s + ")")
			};
			var httpData = function(xhr, type, s) {
				var ct = xhr.getResponseHeader("content-type") || "",
					xml = type === "xml" || !type && ct.indexOf("xml") >= 0,
					data = xml ? xhr.responseXML : xhr.responseText;
				if (xml && data.documentElement.nodeName === "parsererror")
					if ($.error) $.error("parsererror");
				if (s && s.dataFilter) data = s.dataFilter(data, type);
				if (typeof data === "string")
					if (type === "json" || !type && ct.indexOf("json") >= 0) data = parseJSON(data);
					else if (type === "script" || !type && ct.indexOf("javascript") >= 0) $.globalEval(data);
				return data
			};
			return deferred
		}
	};
	$.fn.ajaxForm = function(options) {
		options = options || {};
		options.delegation = options.delegation && $.isFunction($.fn.on);
		if (!options.delegation && this.length === 0) {
			var o = {
				s: this.selector,
				c: this.context
			};
			if (!$.isReady && o.s) {
				log("DOM not ready, queuing ajaxForm");
				$(function() {
					$(o.s, o.c).ajaxForm(options)
				});
				return this
			}
			log("terminating; zero elements found by selector" + ($.isReady ? "" : " (DOM not ready)"));
			return this
		}
		if (options.delegation) {
			$(document).off("submit.form-plugin", this.selector, doAjaxSubmit).off("click.form-plugin", this.selector, captureSubmittingElement).on("submit.form-plugin", this.selector, options, doAjaxSubmit).on("click.form-plugin", this.selector, options, captureSubmittingElement);
			return this
		}
		return this.ajaxFormUnbind().bind("submit.form-plugin",
			options, doAjaxSubmit).bind("click.form-plugin", options, captureSubmittingElement)
	};

	function doAjaxSubmit(e) {
		var options = e.data;
		if (!e.isDefaultPrevented()) {
			e.preventDefault();
			$(this).ajaxSubmit(options)
		}
	}

	function captureSubmittingElement(e) {
		var target = e.target;
		var $el = $(target);
		if (!$el.is("[type=submit],[type=image]")) {
			var t = $el.closest("[type=submit]");
			if (t.length === 0) return;
			target = t[0]
		}
		var form = this;
		form.clk = target;
		if (target.type == "image")
			if (e.offsetX !== undefined) {
				form.clk_x = e.offsetX;
				form.clk_y =
					e.offsetY
			} else if (typeof $.fn.offset == "function") {
			var offset = $el.offset();
			form.clk_x = e.pageX - offset.left;
			form.clk_y = e.pageY - offset.top
		} else {
			form.clk_x = e.pageX - target.offsetLeft;
			form.clk_y = e.pageY - target.offsetTop
		}
		setTimeout(function() {
			form.clk = form.clk_x = form.clk_y = null
		}, 100)
	}
	$.fn.ajaxFormUnbind = function() {
		return this.unbind("submit.form-plugin click.form-plugin")
	};
	$.fn.formToArray = function(semantic, elements) {
		var a = [];
		if (this.length === 0) return a;
		var form = this[0];
		var els = semantic ? form.getElementsByTagName("*") :
			form.elements;
		if (!els) return a;
		var i, j, n, v, el, max, jmax;
		for (i = 0, max = els.length; i < max; i++) {
			el = els[i];
			n = el.name;
			if (!n || el.disabled) continue;
			if (semantic && form.clk && el.type == "image") {
				if (form.clk == el) {
					a.push({
						name: n,
						value: $(el).val(),
						type: el.type
					});
					a.push({
						name: n + ".x",
						value: form.clk_x
					}, {
						name: n + ".y",
						value: form.clk_y
					})
				}
				continue
			}
			v = $.fieldValue(el, true);
			if (v && v.constructor == Array) {
				if (elements) elements.push(el);
				for (j = 0, jmax = v.length; j < jmax; j++) a.push({
					name: n,
					value: v[j]
				})
			} else if (feature.fileapi && el.type == "file") {
				if (elements) elements.push(el);
				var files = el.files;
				if (files.length)
					for (j = 0; j < files.length; j++) a.push({
						name: n,
						value: files[j],
						type: el.type
					});
				else a.push({
					name: n,
					value: "",
					type: el.type
				})
			} else if (v !== null && typeof v != "undefined") {
				if (elements) elements.push(el);
				a.push({
					name: n,
					value: v,
					type: el.type,
					required: el.required
				})
			}
		}
		if (!semantic && form.clk) {
			var $input = $(form.clk),
				input = $input[0];
			n = input.name;
			if (n && !input.disabled && input.type == "image") {
				a.push({
					name: n,
					value: $input.val()
				});
				a.push({
					name: n + ".x",
					value: form.clk_x
				}, {
					name: n + ".y",
					value: form.clk_y
				})
			}
		}
		return a
	};
	$.fn.formSerialize = function(semantic) {
		return $.param(this.formToArray(semantic))
	};
	$.fn.fieldSerialize = function(successful) {
		var a = [];
		this.each(function() {
			var n = this.name;
			if (!n) return;
			var v = $.fieldValue(this, successful);
			if (v && v.constructor == Array)
				for (var i = 0, max = v.length; i < max; i++) a.push({
					name: n,
					value: v[i]
				});
			else if (v !== null && typeof v != "undefined") a.push({
				name: this.name,
				value: v
			})
		});
		return $.param(a)
	};
	$.fn.fieldValue = function(successful) {
		for (var val = [], i = 0, max = this.length; i < max; i++) {
			var el = this[i];
			var v =
				$.fieldValue(el, successful);
			if (v === null || typeof v == "undefined" || v.constructor == Array && !v.length) continue;
			if (v.constructor == Array) $.merge(val, v);
			else val.push(v)
		}
		return val
	};
	$.fieldValue = function(el, successful) {
		var n = el.name,
			t = el.type,
			tag = el.tagName.toLowerCase();
		if (successful === undefined) successful = true;
		if (successful && (!n || el.disabled || t == "reset" || t == "button" || (t == "checkbox" || t == "radio") && !el.checked || (t == "submit" || t == "image") && el.form && el.form.clk != el || tag == "select" && el.selectedIndex == -1)) return null;
		if (tag == "select") {
			var index = el.selectedIndex;
			if (index < 0) return null;
			var a = [],
				ops = el.options;
			var one = t == "select-one";
			var max = one ? index + 1 : ops.length;
			for (var i = one ? index : 0; i < max; i++) {
				var op = ops[i];
				if (op.selected) {
					var v = op.value;
					if (!v) v = op.attributes && op.attributes["value"] && !op.attributes["value"].specified ? op.text : op.value;
					if (one) return v;
					a.push(v)
				}
			}
			return a
		}
		return $(el).val()
	};
	$.fn.clearForm = function(includeHidden) {
		return this.each(function() {
			$("input,select,textarea", this).clearFields(includeHidden)
		})
	};
	$.fn.clearFields = $.fn.clearInputs = function(includeHidden) {
		var re = /^(?:color|date|datetime|email|month|number|password|range|search|tel|text|time|url|week)$/i;
		return this.each(function() {
			var t = this.type,
				tag = this.tagName.toLowerCase();
			if (re.test(t) || tag == "textarea") this.value = "";
			else if (t == "checkbox" || t == "radio") this.checked = false;
			else if (tag == "select") this.selectedIndex = -1;
			else if (t == "file")
				if (/MSIE/.test(navigator.userAgent)) $(this).replaceWith($(this).clone(true));
				else $(this).val("");
			else if (includeHidden)
				if (includeHidden ===
					true && /hidden/.test(t) || typeof includeHidden == "string" && $(this).is(includeHidden)) this.value = ""
		})
	};
	$.fn.resetForm = function() {
		return this.each(function() {
			if (typeof this.reset == "function" || typeof this.reset == "object" && !this.reset.nodeType) this.reset()
		})
	};
	$.fn.enable = function(b) {
		if (b === undefined) b = true;
		return this.each(function() {
			this.disabled = !b
		})
	};
	$.fn.selected = function(select) {
		if (select === undefined) select = true;
		return this.each(function() {
			var t = this.type;
			if (t == "checkbox" || t == "radio") this.checked = select;
			else if (this.tagName.toLowerCase() == "option") {
				var $sel = $(this).parent("select");
				if (select && $sel[0] && $sel[0].type == "select-one") $sel.find("option").selected(false);
				this.selected = select
			}
		})
	};
	$.fn.ajaxSubmit.debug = false;

	function log() {
		if (!$.fn.ajaxSubmit.debug) return;
		var msg = "[jquery.form] " + Array.prototype.join.call(arguments, "");
		if (window.console && window.console.log) window.console.log(msg);
		else if (window.opera && window.opera.postError) window.opera.postError(msg)
	}
})(jQuery);
/*
 Chosen, a Select Box Enhancer for jQuery and Prototype
by Patrick Filler for Harvest, http://getharvest.com

Version 1.8.7
Full source at https://github.com/harvesthq/chosen
Copyright (c) 2011-2018 Harvest http://getharvest.com

MIT License, https://github.com/harvesthq/chosen/blob/master/LICENSE.md
This file is generated by `grunt build`, do not edit it by hand.
*/
(function() {
	var $, AbstractChosen, Chosen, SelectParser, bind = function(fn, me) {
			return function() {
				return fn.apply(me, arguments)
			}
		},
		extend = function(child, parent) {
			for (var key in parent)
				if (hasProp.call(parent, key)) child[key] = parent[key];

			function ctor() {
				this.constructor = child
			}
			ctor.prototype = parent.prototype;
			child.prototype = new ctor;
			child.__super__ = parent.prototype;
			return child
		},
		hasProp = {}.hasOwnProperty;
	SelectParser = function() {
		function SelectParser() {
			this.options_index = 0;
			this.parsed = []
		}
		SelectParser.prototype.add_node =
			function(child) {
				if (child.nodeName.toUpperCase() === "OPTGROUP") return this.add_group(child);
				else return this.add_option(child)
			};
		SelectParser.prototype.add_group = function(group) {
			var group_position, i, len, option, ref, results1;
			group_position = this.parsed.length;
			this.parsed.push({
				array_index: group_position,
				group: true,
				label: group.label,
				title: group.title ? group.title : void 0,
				children: 0,
				disabled: group.disabled,
				classes: group.className
			});
			ref = group.childNodes;
			results1 = [];
			for (i = 0, len = ref.length; i < len; i++) {
				option = ref[i];
				results1.push(this.add_option(option, group_position, group.disabled))
			}
			return results1
		};
		SelectParser.prototype.add_option = function(option, group_position, group_disabled) {
			if (option.nodeName.toUpperCase() === "OPTION") {
				if (option.text !== "") {
					if (group_position != null) this.parsed[group_position].children += 1;
					this.parsed.push({
						array_index: this.parsed.length,
						options_index: this.options_index,
						value: option.value,
						text: option.text,
						html: option.innerHTML,
						title: option.title ? option.title : void 0,
						selected: option.selected,
						disabled: group_disabled === true ? group_disabled : option.disabled,
						group_array_index: group_position,
						group_label: group_position != null ? this.parsed[group_position].label : null,
						classes: option.className,
						style: option.style.cssText
					})
				} else this.parsed.push({
					array_index: this.parsed.length,
					options_index: this.options_index,
					empty: true
				});
				return this.options_index += 1
			}
		};
		return SelectParser
	}();
	SelectParser.select_to_array = function(select) {
		var child, i, len, parser, ref;
		parser = new SelectParser;
		ref = select.childNodes;
		for (i = 0,
			len = ref.length; i < len; i++) {
			child = ref[i];
			parser.add_node(child)
		}
		return parser.parsed
	};
	AbstractChosen = function() {
		function AbstractChosen(form_field, options1) {
			this.form_field = form_field;
			this.options = options1 != null ? options1 : {};
			this.label_click_handler = bind(this.label_click_handler, this);
			if (!AbstractChosen.browser_is_supported()) return;
			this.is_multiple = this.form_field.multiple;
			this.set_default_text();
			this.set_default_values();
			this.setup();
			this.set_up_html();
			this.register_observers();
			this.on_ready()
		}
		AbstractChosen.prototype.set_default_values =
			function() {
				this.click_test_action = function(_this) {
					return function(evt) {
						return _this.test_active_click(evt)
					}
				}(this);
				this.activate_action = function(_this) {
					return function(evt) {
						return _this.activate_field(evt)
					}
				}(this);
				this.active_field = false;
				this.mouse_on_container = false;
				this.results_showing = false;
				this.result_highlighted = null;
				this.is_rtl = this.options.rtl || /\bchosen-rtl\b/.test(this.form_field.className);
				this.allow_single_deselect = this.options.allow_single_deselect != null && this.form_field.options[0] != null &&
					this.form_field.options[0].text === "" ? this.options.allow_single_deselect : false;
				this.disable_search_threshold = this.options.disable_search_threshold || 0;
				this.disable_search = this.options.disable_search || false;
				this.enable_split_word_search = this.options.enable_split_word_search != null ? this.options.enable_split_word_search : true;
				this.group_search = this.options.group_search != null ? this.options.group_search : true;
				this.search_contains = this.options.search_contains || false;
				this.single_backstroke_delete = this.options.single_backstroke_delete !=
					null ? this.options.single_backstroke_delete : true;
				this.max_selected_options = this.options.max_selected_options || Infinity;
				this.inherit_select_classes = this.options.inherit_select_classes || false;
				this.display_selected_options = this.options.display_selected_options != null ? this.options.display_selected_options : true;
				this.display_disabled_options = this.options.display_disabled_options != null ? this.options.display_disabled_options : true;
				this.include_group_label_in_selected = this.options.include_group_label_in_selected ||
					false;
				this.max_shown_results = this.options.max_shown_results || Number.POSITIVE_INFINITY;
				this.case_sensitive_search = this.options.case_sensitive_search || false;
				return this.hide_results_on_select = this.options.hide_results_on_select != null ? this.options.hide_results_on_select : true
			};
		AbstractChosen.prototype.set_default_text = function() {
			if (this.form_field.getAttribute("data-placeholder")) this.default_text = this.form_field.getAttribute("data-placeholder");
			else if (this.is_multiple) this.default_text = this.options.placeholder_text_multiple ||
				this.options.placeholder_text || AbstractChosen.default_multiple_text;
			else this.default_text = this.options.placeholder_text_single || this.options.placeholder_text || AbstractChosen.default_single_text;
			this.default_text = this.escape_html(this.default_text);
			return this.results_none_found = this.form_field.getAttribute("data-no_results_text") || this.options.no_results_text || AbstractChosen.default_no_result_text
		};
		AbstractChosen.prototype.choice_label = function(item) {
			if (this.include_group_label_in_selected && item.group_label !=
				null) return "<b class='group-name'>" + this.escape_html(item.group_label) + "</b>" + item.html;
			else return item.html
		};
		AbstractChosen.prototype.mouse_enter = function() {
			return this.mouse_on_container = true
		};
		AbstractChosen.prototype.mouse_leave = function() {
			return this.mouse_on_container = false
		};
		AbstractChosen.prototype.input_focus = function(evt) {
			if (this.is_multiple) {
				if (!this.active_field) return setTimeout(function(_this) {
					return function() {
						return _this.container_mousedown()
					}
				}(this), 50)
			} else if (!this.active_field) return this.activate_field()
		};
		AbstractChosen.prototype.input_blur = function(evt) {
			if (!this.mouse_on_container) {
				this.active_field = false;
				return setTimeout(function(_this) {
					return function() {
						return _this.blur_test()
					}
				}(this), 100)
			}
		};
		AbstractChosen.prototype.label_click_handler = function(evt) {
			if (this.is_multiple) return this.container_mousedown(evt);
			else return this.activate_field()
		};
		AbstractChosen.prototype.results_option_build = function(options) {
			var content, data, data_content, i, len, ref, shown_results;
			content = "";
			shown_results = 0;
			ref = this.results_data;
			for (i = 0, len = ref.length; i < len; i++) {
				data = ref[i];
				data_content = "";
				if (data.group) data_content = this.result_add_group(data);
				else data_content = this.result_add_option(data);
				if (data_content !== "") {
					shown_results++;
					content += data_content
				}
				if (options != null ? options.first : void 0)
					if (data.selected && this.is_multiple) this.choice_build(data);
					else if (data.selected && !this.is_multiple) this.single_set_selected_text(this.choice_label(data));
				if (shown_results >= this.max_shown_results) break
			}
			return content
		};
		AbstractChosen.prototype.result_add_option =
			function(option) {
				var classes, option_el;
				if (!option.search_match) return "";
				if (!this.include_option_in_results(option)) return "";
				classes = [];
				if (!option.disabled && !(option.selected && this.is_multiple)) classes.push("active-result");
				if (option.disabled && !(option.selected && this.is_multiple)) classes.push("disabled-result");
				if (option.selected) classes.push("result-selected");
				if (option.group_array_index != null) classes.push("group-option");
				if (option.classes !== "") classes.push(option.classes);
				option_el = document.createElement("li");
				option_el.className = classes.join(" ");
				if (option.style) option_el.style.cssText = option.style;
				option_el.setAttribute("data-option-array-index", option.array_index);
				option_el.innerHTML = option.highlighted_html || option.html;
				if (option.title) option_el.title = option.title;
				return this.outerHTML(option_el)
			};
		AbstractChosen.prototype.result_add_group = function(group) {
			var classes, group_el;
			if (!(group.search_match || group.group_match)) return "";
			if (!(group.active_options > 0)) return "";
			classes = [];
			classes.push("group-result");
			if (group.classes) classes.push(group.classes);
			group_el = document.createElement("li");
			group_el.className = classes.join(" ");
			group_el.innerHTML = group.highlighted_html || this.escape_html(group.label);
			if (group.title) group_el.title = group.title;
			return this.outerHTML(group_el)
		};
		AbstractChosen.prototype.results_update_field = function() {
			this.set_default_text();
			if (!this.is_multiple) this.results_reset_cleanup();
			this.result_clear_highlight();
			this.results_build();
			if (this.results_showing) return this.winnow_results()
		};
		AbstractChosen.prototype.reset_single_select_options = function() {
			var i, len, ref, result, results1;
			ref = this.results_data;
			results1 = [];
			for (i = 0, len = ref.length; i < len; i++) {
				result = ref[i];
				if (result.selected) results1.push(result.selected = false);
				else results1.push(void 0)
			}
			return results1
		};
		AbstractChosen.prototype.results_toggle = function() {
			if (this.results_showing) return this.results_hide();
			else return this.results_show()
		};
		AbstractChosen.prototype.results_search = function(evt) {
			if (this.results_showing) return this.winnow_results();
			else return this.results_show()
		};
		AbstractChosen.prototype.winnow_results = function(options) {
			var escapedQuery, fix, i, len, option, prefix, query, ref, regex, results, results_group, search_match, startpos, suffix, text;
			this.no_results_clear();
			results = 0;
			query = this.get_search_text();
			escapedQuery = query.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
			regex = this.get_search_regex(escapedQuery);
			ref = this.results_data;
			for (i = 0, len = ref.length; i < len; i++) {
				option = ref[i];
				option.search_match = false;
				results_group = null;
				search_match = null;
				option.highlighted_html = "";
				if (this.include_option_in_results(option)) {
					if (option.group) {
						option.group_match = false;
						option.active_options = 0
					}
					if (option.group_array_index != null && this.results_data[option.group_array_index]) {
						results_group = this.results_data[option.group_array_index];
						if (results_group.active_options === 0 && results_group.search_match) results += 1;
						results_group.active_options += 1
					}
					text = option.group ? option.label : option.text;
					if (!(option.group && !this.group_search)) {
						search_match = this.search_string_match(text,
							regex);
						option.search_match = search_match != null;
						if (option.search_match && !option.group) results += 1;
						if (option.search_match) {
							if (query.length) {
								startpos = search_match.index;
								prefix = text.slice(0, startpos);
								fix = text.slice(startpos, startpos + query.length);
								suffix = text.slice(startpos + query.length);
								option.highlighted_html = this.escape_html(prefix) + "<em>" + this.escape_html(fix) + "</em>" + this.escape_html(suffix)
							}
							if (results_group != null) results_group.group_match = true
						} else if (option.group_array_index != null && this.results_data[option.group_array_index].search_match) option.search_match =
							true
					}
				}
			}
			this.result_clear_highlight();
			if (results < 1 && query.length) {
				this.update_results_content("");
				return this.no_results(query)
			} else {
				this.update_results_content(this.results_option_build());
				if (!(options != null ? options.skip_highlight : void 0)) return this.winnow_results_set_highlight()
			}
		};
		AbstractChosen.prototype.get_search_regex = function(escaped_search_string) {
			var regex_flag, regex_string;
			regex_string = this.search_contains ? escaped_search_string : "(^|\\s|\\b)" + escaped_search_string + "[^\\s]*";
			if (!(this.enable_split_word_search ||
					this.search_contains)) regex_string = "^" + regex_string;
			regex_flag = this.case_sensitive_search ? "" : "i";
			return new RegExp(regex_string, regex_flag)
		};
		AbstractChosen.prototype.search_string_match = function(search_string, regex) {
			var match;
			match = regex.exec(search_string);
			if (!this.search_contains && (match != null ? match[1] : void 0)) match.index += 1;
			return match
		};
		AbstractChosen.prototype.choices_count = function() {
			var i, len, option, ref;
			if (this.selected_option_count != null) return this.selected_option_count;
			this.selected_option_count =
				0;
			ref = this.form_field.options;
			for (i = 0, len = ref.length; i < len; i++) {
				option = ref[i];
				if (option.selected) this.selected_option_count += 1
			}
			return this.selected_option_count
		};
		AbstractChosen.prototype.choices_click = function(evt) {
			evt.preventDefault();
			this.activate_field();
			if (!(this.results_showing || this.is_disabled)) return this.results_show()
		};
		AbstractChosen.prototype.keydown_checker = function(evt) {
			var ref, stroke;
			stroke = (ref = evt.which) != null ? ref : evt.keyCode;
			this.search_field_scale();
			if (stroke !== 8 && this.pending_backstroke) this.clear_backstroke();
			switch (stroke) {
				case 8:
					this.backstroke_length = this.get_search_field_value().length;
					break;
				case 9:
					if (this.results_showing && !this.is_multiple) this.result_select(evt);
					this.mouse_on_container = false;
					break;
				case 13:
					if (this.results_showing) evt.preventDefault();
					break;
				case 27:
					if (this.results_showing) evt.preventDefault();
					break;
				case 32:
					if (this.disable_search) evt.preventDefault();
					break;
				case 38:
					evt.preventDefault();
					this.keyup_arrow();
					break;
				case 40:
					evt.preventDefault();
					this.keydown_arrow();
					break
			}
		};
		AbstractChosen.prototype.keyup_checker =
			function(evt) {
				var ref, stroke;
				stroke = (ref = evt.which) != null ? ref : evt.keyCode;
				this.search_field_scale();
				switch (stroke) {
					case 8:
						if (this.is_multiple && this.backstroke_length < 1 && this.choices_count() > 0) this.keydown_backstroke();
						else if (!this.pending_backstroke) {
							this.result_clear_highlight();
							this.results_search()
						}
						break;
					case 13:
						evt.preventDefault();
						if (this.results_showing) this.result_select(evt);
						break;
					case 27:
						if (this.results_showing) this.results_hide();
						break;
					case 9:
					case 16:
					case 17:
					case 18:
					case 38:
					case 40:
					case 91:
						break;
					default:
						this.results_search();
						break
				}
			};
		AbstractChosen.prototype.clipboard_event_checker = function(evt) {
			if (this.is_disabled) return;
			return setTimeout(function(_this) {
				return function() {
					return _this.results_search()
				}
			}(this), 50)
		};
		AbstractChosen.prototype.container_width = function() {
			if (this.options.width != null) return this.options.width;
			else return this.form_field.offsetWidth + "px"
		};
		AbstractChosen.prototype.include_option_in_results = function(option) {
			if (this.is_multiple && (!this.display_selected_options && option.selected)) return false;
			if (!this.display_disabled_options && option.disabled) return false;
			if (option.empty) return false;
			return true
		};
		AbstractChosen.prototype.search_results_touchstart = function(evt) {
			this.touch_started = true;
			return this.search_results_mouseover(evt)
		};
		AbstractChosen.prototype.search_results_touchmove = function(evt) {
			this.touch_started = false;
			return this.search_results_mouseout(evt)
		};
		AbstractChosen.prototype.search_results_touchend = function(evt) {
			if (this.touch_started) return this.search_results_mouseup(evt)
		};
		AbstractChosen.prototype.outerHTML =
			function(element) {
				var tmp;
				if (element.outerHTML) return element.outerHTML;
				tmp = document.createElement("div");
				tmp.appendChild(element);
				return tmp.innerHTML
			};
		AbstractChosen.prototype.get_single_html = function() {
			return '<a class="chosen-single chosen-default">\n  <span>' + this.default_text + '</span>\n  <div><b></b></div>\n</a>\n<div class="chosen-drop">\n  <div class="chosen-search">\n    <input class="chosen-search-input" type="text" autocomplete="off" />\n  </div>\n  <ul class="chosen-results"></ul>\n</div>'
		};
		AbstractChosen.prototype.get_multi_html = function() {
			return '<ul class="chosen-choices">\n  <li class="search-field">\n    <input class="chosen-search-input" type="text" autocomplete="off" value="' + this.default_text + '" />\n  </li>\n</ul>\n<div class="chosen-drop">\n  <ul class="chosen-results"></ul>\n</div>'
		};
		AbstractChosen.prototype.get_no_results_html = function(terms) {
			return '<li class="no-results">\n  ' + this.results_none_found + " <span>" + this.escape_html(terms) + "</span>\n</li>"
		};
		AbstractChosen.browser_is_supported =
			function() {
				if ("Microsoft Internet Explorer" === window.navigator.appName) return document.documentMode >= 8;
				if (/iP(od|hone)/i.test(window.navigator.userAgent) || /Windows Phone/i.test(window.navigator.userAgent) || /Android.*Mobile/i.test(window.navigator.userAgent)) return true;
				else if (/IEMobile/i.test(window.navigator.userAgent) || /BlackBerry/i.test(window.navigator.userAgent) || /BB10/i.test(window.navigator.userAgent)) return false;
				return true
			};
		AbstractChosen.default_multiple_text = "Select Some Options";
		AbstractChosen.default_single_text =
			"Select an Option";
		AbstractChosen.default_no_result_text = "No results match";
		return AbstractChosen
	}();
	$ = jQuery;
	$.fn.extend({
		chosen: function(options) {
			if (!AbstractChosen.browser_is_supported()) return this;
			return this.each(function(input_field) {
				var $this, chosen;
				$this = $(this);
				chosen = $this.data("chosen");
				if (options === "destroy") {
					if (chosen instanceof Chosen) chosen.destroy();
					return
				}
				if (!(chosen instanceof Chosen)) $this.data("chosen", new Chosen(this, options))
			})
		}
	});
	Chosen = function(superClass) {
		extend(Chosen, superClass);

		function Chosen() {
			return Chosen.__super__.constructor.apply(this, arguments)
		}
		Chosen.prototype.setup = function() {
			this.form_field_jq = $(this.form_field);
			return this.current_selectedIndex = this.form_field.selectedIndex
		};
		Chosen.prototype.set_up_html = function() {
			var container_classes, container_props;
			container_classes = ["chosen-container"];
			container_classes.push("chosen-container-" + (this.is_multiple ? "multi" : "single"));
			if (this.inherit_select_classes && this.form_field.className) container_classes.push(this.form_field.className);
			if (this.is_rtl) container_classes.push("chosen-rtl");
			container_props = {
				"class": container_classes.join(" "),
				"title": this.form_field.title
			};
			if (this.form_field.id.length) container_props.id = this.form_field.id.replace(/[^\w]/g, "_") + "_chosen";
			this.container = $("<div />", container_props);
			this.container.width(this.container_width());
			if (this.is_multiple) this.container.html(this.get_multi_html());
			else this.container.html(this.get_single_html());
			this.form_field_jq.hide().after(this.container);
			this.dropdown = this.container.find("div.chosen-drop").first();
			this.search_field = this.container.find("input").first();
			this.search_results = this.container.find("ul.chosen-results").first();
			this.search_field_scale();
			this.search_no_results = this.container.find("li.no-results").first();
			if (this.is_multiple) {
				this.search_choices = this.container.find("ul.chosen-choices").first();
				this.search_container = this.container.find("li.search-field").first()
			} else {
				this.search_container = this.container.find("div.chosen-search").first();
				this.selected_item = this.container.find(".chosen-single").first()
			}
			this.results_build();
			this.set_tab_index();
			return this.set_label_behavior()
		};
		Chosen.prototype.on_ready = function() {
			return this.form_field_jq.trigger("chosen:ready", {
				chosen: this
			})
		};
		Chosen.prototype.register_observers = function() {
			this.container.on("touchstart.chosen", function(_this) {
				return function(evt) {
					_this.container_mousedown(evt)
				}
			}(this));
			this.container.on("touchend.chosen", function(_this) {
				return function(evt) {
					_this.container_mouseup(evt)
				}
			}(this));
			this.container.on("mousedown.chosen", function(_this) {
				return function(evt) {
					_this.container_mousedown(evt)
				}
			}(this));
			this.container.on("mouseup.chosen", function(_this) {
				return function(evt) {
					_this.container_mouseup(evt)
				}
			}(this));
			this.container.on("mouseenter.chosen", function(_this) {
				return function(evt) {
					_this.mouse_enter(evt)
				}
			}(this));
			this.container.on("mouseleave.chosen", function(_this) {
				return function(evt) {
					_this.mouse_leave(evt)
				}
			}(this));
			this.search_results.on("mouseup.chosen", function(_this) {
				return function(evt) {
					_this.search_results_mouseup(evt)
				}
			}(this));
			this.search_results.on("mouseover.chosen", function(_this) {
				return function(evt) {
					_this.search_results_mouseover(evt)
				}
			}(this));
			this.search_results.on("mouseout.chosen", function(_this) {
				return function(evt) {
					_this.search_results_mouseout(evt)
				}
			}(this));
			this.search_results.on("mousewheel.chosen DOMMouseScroll.chosen", function(_this) {
				return function(evt) {
					_this.search_results_mousewheel(evt)
				}
			}(this));
			this.search_results.on("touchstart.chosen", function(_this) {
				return function(evt) {
					_this.search_results_touchstart(evt)
				}
			}(this));
			this.search_results.on("touchmove.chosen", function(_this) {
				return function(evt) {
					_this.search_results_touchmove(evt)
				}
			}(this));
			this.search_results.on("touchend.chosen", function(_this) {
				return function(evt) {
					_this.search_results_touchend(evt)
				}
			}(this));
			this.form_field_jq.on("chosen:updated.chosen", function(_this) {
				return function(evt) {
					_this.results_update_field(evt)
				}
			}(this));
			this.form_field_jq.on("chosen:activate.chosen", function(_this) {
				return function(evt) {
					_this.activate_field(evt)
				}
			}(this));
			this.form_field_jq.on("chosen:open.chosen", function(_this) {
				return function(evt) {
					_this.container_mousedown(evt)
				}
			}(this));
			this.form_field_jq.on("chosen:close.chosen",
				function(_this) {
					return function(evt) {
						_this.close_field(evt)
					}
				}(this));
			this.search_field.on("blur.chosen", function(_this) {
				return function(evt) {
					_this.input_blur(evt)
				}
			}(this));
			this.search_field.on("keyup.chosen", function(_this) {
				return function(evt) {
					_this.keyup_checker(evt)
				}
			}(this));
			this.search_field.on("keydown.chosen", function(_this) {
				return function(evt) {
					_this.keydown_checker(evt)
				}
			}(this));
			this.search_field.on("focus.chosen", function(_this) {
				return function(evt) {
					_this.input_focus(evt)
				}
			}(this));
			this.search_field.on("cut.chosen",
				function(_this) {
					return function(evt) {
						_this.clipboard_event_checker(evt)
					}
				}(this));
			this.search_field.on("paste.chosen", function(_this) {
				return function(evt) {
					_this.clipboard_event_checker(evt)
				}
			}(this));
			if (this.is_multiple) return this.search_choices.on("click.chosen", function(_this) {
				return function(evt) {
					_this.choices_click(evt)
				}
			}(this));
			else return this.container.on("click.chosen", function(evt) {
				evt.preventDefault()
			})
		};
		Chosen.prototype.destroy = function() {
			$(this.container[0].ownerDocument).off("click.chosen",
				this.click_test_action);
			if (this.form_field_label.length > 0) this.form_field_label.off("click.chosen");
			if (this.search_field[0].tabIndex) this.form_field_jq[0].tabIndex = this.search_field[0].tabIndex;
			this.container.remove();
			this.form_field_jq.removeData("chosen");
			return this.form_field_jq.show()
		};
		Chosen.prototype.search_field_disabled = function() {
			this.is_disabled = this.form_field.disabled || this.form_field_jq.parents("fieldset").is(":disabled");
			this.container.toggleClass("chosen-disabled", this.is_disabled);
			this.search_field[0].disabled = this.is_disabled;
			if (!this.is_multiple) this.selected_item.off("focus.chosen", this.activate_field);
			if (this.is_disabled) return this.close_field();
			else if (!this.is_multiple) return this.selected_item.on("focus.chosen", this.activate_field)
		};
		Chosen.prototype.container_mousedown = function(evt) {
			var ref;
			if (this.is_disabled) return;
			if (this.is_multiple) {
				if (evt && (ref = evt.type) === "mousedown" && !this.results_showing) evt.preventDefault()
			} else if (evt && ((ref = evt.type) === "mousedown" || ref ===
					"touchstart") && !this.results_showing) evt.preventDefault();
			if (!(evt != null && $(evt.target).hasClass("search-choice-close"))) {
				if (!this.active_field) {
					if (this.is_multiple) this.search_field.val("");
					$(this.container[0].ownerDocument).on("click.chosen", this.click_test_action);
					this.results_show()
				} else if (!this.is_multiple && evt && ($(evt.target)[0] === this.selected_item[0] || $(evt.target).parents("a.chosen-single").length)) {
					evt.preventDefault();
					this.results_toggle()
				}
				return this.activate_field()
			}
		};
		Chosen.prototype.container_mouseup =
			function(evt) {
				if (evt.target.nodeName === "ABBR" && !this.is_disabled) return this.results_reset(evt)
			};
		Chosen.prototype.search_results_mousewheel = function(evt) {
			var delta;
			if (evt.originalEvent) delta = evt.originalEvent.deltaY || -evt.originalEvent.wheelDelta || evt.originalEvent.detail;
			if (delta != null) {
				evt.preventDefault();
				if (evt.type === "DOMMouseScroll") delta = delta * 40;
				return this.search_results.scrollTop(delta + this.search_results.scrollTop())
			}
		};
		Chosen.prototype.blur_test = function(evt) {
			if (!this.active_field && this.container.hasClass("chosen-container-active")) return this.close_field()
		};
		Chosen.prototype.close_field = function() {
			$(this.container[0].ownerDocument).off("click.chosen", this.click_test_action);
			this.active_field = false;
			this.results_hide();
			this.container.removeClass("chosen-container-active");
			this.clear_backstroke();
			this.show_search_field_default();
			this.search_field_scale();
			return this.search_field.blur()
		};
		Chosen.prototype.activate_field = function() {
			if (this.is_disabled) return;
			this.container.addClass("chosen-container-active");
			this.active_field = true;
			this.search_field.val(this.search_field.val());
			return this.search_field.focus()
		};
		Chosen.prototype.test_active_click = function(evt) {
			var active_container;
			active_container = $(evt.target).closest(".chosen-container");
			if (active_container.length && this.container[0] === active_container[0]) return this.active_field = true;
			else return this.close_field()
		};
		Chosen.prototype.results_build = function() {
			this.parsing = true;
			this.selected_option_count = null;
			this.results_data = SelectParser.select_to_array(this.form_field);
			if (this.is_multiple) this.search_choices.find("li.search-choice").remove();
			else {
				this.single_set_selected_text();
				if (this.disable_search || this.form_field.options.length <= this.disable_search_threshold) {
					this.search_field[0].readOnly = true;
					this.container.addClass("chosen-container-single-nosearch")
				} else {
					this.search_field[0].readOnly = false;
					this.container.removeClass("chosen-container-single-nosearch")
				}
			}
			this.update_results_content(this.results_option_build({
				first: true
			}));
			this.search_field_disabled();
			this.show_search_field_default();
			this.search_field_scale();
			return this.parsing =
				false
		};
		Chosen.prototype.result_do_highlight = function(el) {
			var high_bottom, high_top, maxHeight, visible_bottom, visible_top;
			if (el.length) {
				this.result_clear_highlight();
				this.result_highlight = el;
				this.result_highlight.addClass("highlighted");
				maxHeight = parseInt(this.search_results.css("maxHeight"), 10);
				visible_top = this.search_results.scrollTop();
				visible_bottom = maxHeight + visible_top;
				high_top = this.result_highlight.position().top + this.search_results.scrollTop();
				high_bottom = high_top + this.result_highlight.outerHeight();
				if (high_bottom >= visible_bottom) return this.search_results.scrollTop(high_bottom - maxHeight > 0 ? high_bottom - maxHeight : 0);
				else if (high_top < visible_top) return this.search_results.scrollTop(high_top)
			}
		};
		Chosen.prototype.result_clear_highlight = function() {
			if (this.result_highlight) this.result_highlight.removeClass("highlighted");
			return this.result_highlight = null
		};
		Chosen.prototype.results_show = function() {
			if (this.is_multiple && this.max_selected_options <= this.choices_count()) {
				this.form_field_jq.trigger("chosen:maxselected", {
					chosen: this
				});
				return false
			}
			this.container.addClass("chosen-with-drop");
			this.results_showing = true;
			this.search_field.focus();
			this.search_field.val(this.get_search_field_value());
			this.winnow_results();
			return this.form_field_jq.trigger("chosen:showing_dropdown", {
				chosen: this
			})
		};
		Chosen.prototype.update_results_content = function(content) {
			return this.search_results.html(content)
		};
		Chosen.prototype.results_hide = function() {
			if (this.results_showing) {
				this.result_clear_highlight();
				this.container.removeClass("chosen-with-drop");
				this.form_field_jq.trigger("chosen:hiding_dropdown", {
					chosen: this
				})
			}
			return this.results_showing = false
		};
		Chosen.prototype.set_tab_index = function(el) {
			var ti;
			if (this.form_field.tabIndex) {
				ti = this.form_field.tabIndex;
				this.form_field.tabIndex = -1;
				return this.search_field[0].tabIndex = ti
			}
		};
		Chosen.prototype.set_label_behavior = function() {
			this.form_field_label = this.form_field_jq.parents("label");
			if (!this.form_field_label.length && this.form_field.id.length) this.form_field_label = $("label[for='" + this.form_field.id +
				"']");
			if (this.form_field_label.length > 0) return this.form_field_label.on("click.chosen", this.label_click_handler)
		};
		Chosen.prototype.show_search_field_default = function() {
			if (this.is_multiple && this.choices_count() < 1 && !this.active_field) {
				this.search_field.val(this.default_text);
				return this.search_field.addClass("default")
			} else {
				this.search_field.val("");
				return this.search_field.removeClass("default")
			}
		};
		Chosen.prototype.search_results_mouseup = function(evt) {
			var target;
			target = $(evt.target).hasClass("active-result") ?
				$(evt.target) : $(evt.target).parents(".active-result").first();
			if (target.length) {
				this.result_highlight = target;
				this.result_select(evt);
				return this.search_field.focus()
			}
		};
		Chosen.prototype.search_results_mouseover = function(evt) {
			var target;
			target = $(evt.target).hasClass("active-result") ? $(evt.target) : $(evt.target).parents(".active-result").first();
			if (target) return this.result_do_highlight(target)
		};
		Chosen.prototype.search_results_mouseout = function(evt) {
			if ($(evt.target).hasClass("active-result") || $(evt.target).parents(".active-result").first()) return this.result_clear_highlight()
		};
		Chosen.prototype.choice_build = function(item) {
			var choice, close_link;
			choice = $("<li />", {
				"class": "search-choice"
			}).html("<span>" + this.choice_label(item) + "</span>");
			if (item.disabled) choice.addClass("search-choice-disabled");
			else {
				close_link = $("<a />", {
					"class": "search-choice-close",
					"data-option-array-index": item.array_index
				});
				close_link.on("click.chosen", function(_this) {
					return function(evt) {
						return _this.choice_destroy_link_click(evt)
					}
				}(this));
				choice.append(close_link)
			}
			return this.search_container.before(choice)
		};
		Chosen.prototype.choice_destroy_link_click = function(evt) {
			evt.preventDefault();
			evt.stopPropagation();
			if (!this.is_disabled) return this.choice_destroy($(evt.target))
		};
		Chosen.prototype.choice_destroy = function(link) {
			if (this.result_deselect(link[0].getAttribute("data-option-array-index"))) {
				if (this.active_field) this.search_field.focus();
				else this.show_search_field_default();
				if (this.is_multiple && this.choices_count() > 0 && this.get_search_field_value().length < 1) this.results_hide();
				link.parents("li").first().remove();
				return this.search_field_scale()
			}
		};
		Chosen.prototype.results_reset = function() {
			this.reset_single_select_options();
			this.form_field.options[0].selected = true;
			this.single_set_selected_text();
			this.show_search_field_default();
			this.results_reset_cleanup();
			this.trigger_form_field_change();
			if (this.active_field) return this.results_hide()
		};
		Chosen.prototype.results_reset_cleanup = function() {
			this.current_selectedIndex = this.form_field.selectedIndex;
			return this.selected_item.find("abbr").remove()
		};
		Chosen.prototype.result_select =
			function(evt) {
				var high, item;
				if (this.result_highlight) {
					high = this.result_highlight;
					this.result_clear_highlight();
					if (this.is_multiple && this.max_selected_options <= this.choices_count()) {
						this.form_field_jq.trigger("chosen:maxselected", {
							chosen: this
						});
						return false
					}
					if (this.is_multiple) high.removeClass("active-result");
					else this.reset_single_select_options();
					high.addClass("result-selected");
					item = this.results_data[high[0].getAttribute("data-option-array-index")];
					item.selected = true;
					this.form_field.options[item.options_index].selected =
						true;
					this.selected_option_count = null;
					if (this.is_multiple) this.choice_build(item);
					else this.single_set_selected_text(this.choice_label(item));
					if (this.is_multiple && (!this.hide_results_on_select || (evt.metaKey || evt.ctrlKey)))
						if (evt.metaKey || evt.ctrlKey) this.winnow_results({
							skip_highlight: true
						});
						else {
							this.search_field.val("");
							this.winnow_results()
						}
					else {
						this.results_hide();
						this.show_search_field_default()
					}
					if (this.is_multiple || this.form_field.selectedIndex !== this.current_selectedIndex) this.trigger_form_field_change({
						selected: this.form_field.options[item.options_index].value
					});
					this.current_selectedIndex = this.form_field.selectedIndex;
					evt.preventDefault();
					return this.search_field_scale()
				}
			};
		Chosen.prototype.single_set_selected_text = function(text) {
			if (text == null) text = this.default_text;
			if (text === this.default_text) this.selected_item.addClass("chosen-default");
			else {
				this.single_deselect_control_build();
				this.selected_item.removeClass("chosen-default")
			}
			return this.selected_item.find("span").html(text)
		};
		Chosen.prototype.result_deselect = function(pos) {
			var result_data;
			result_data = this.results_data[pos];
			if (!this.form_field.options[result_data.options_index].disabled) {
				result_data.selected = false;
				this.form_field.options[result_data.options_index].selected = false;
				this.selected_option_count = null;
				this.result_clear_highlight();
				if (this.results_showing) this.winnow_results();
				this.trigger_form_field_change({
					deselected: this.form_field.options[result_data.options_index].value
				});
				this.search_field_scale();
				return true
			} else return false
		};
		Chosen.prototype.single_deselect_control_build = function() {
			if (!this.allow_single_deselect) return;
			if (!this.selected_item.find("abbr").length) this.selected_item.find("span").first().after('<abbr class="search-choice-close"></abbr>');
			return this.selected_item.addClass("chosen-single-with-deselect")
		};
		Chosen.prototype.get_search_field_value = function() {
			return this.search_field.val()
		};
		Chosen.prototype.get_search_text = function() {
			return $.trim(this.get_search_field_value())
		};
		Chosen.prototype.escape_html = function(text) {
			return $("<div/>").text(text).html()
		};
		Chosen.prototype.winnow_results_set_highlight =
			function() {
				var do_high, selected_results;
				selected_results = !this.is_multiple ? this.search_results.find(".result-selected.active-result") : [];
				do_high = selected_results.length ? selected_results.first() : this.search_results.find(".active-result").first();
				if (do_high != null) return this.result_do_highlight(do_high)
			};
		Chosen.prototype.no_results = function(terms) {
			var no_results_html;
			no_results_html = this.get_no_results_html(terms);
			this.search_results.append(no_results_html);
			return this.form_field_jq.trigger("chosen:no_results", {
				chosen: this
			})
		};
		Chosen.prototype.no_results_clear = function() {
			return this.search_results.find(".no-results").remove()
		};
		Chosen.prototype.keydown_arrow = function() {
			var next_sib;
			if (this.results_showing && this.result_highlight) {
				next_sib = this.result_highlight.nextAll("li.active-result").first();
				if (next_sib) return this.result_do_highlight(next_sib)
			} else return this.results_show()
		};
		Chosen.prototype.keyup_arrow = function() {
			var prev_sibs;
			if (!this.results_showing && !this.is_multiple) return this.results_show();
			else if (this.result_highlight) {
				prev_sibs =
					this.result_highlight.prevAll("li.active-result");
				if (prev_sibs.length) return this.result_do_highlight(prev_sibs.first());
				else {
					if (this.choices_count() > 0) this.results_hide();
					return this.result_clear_highlight()
				}
			}
		};
		Chosen.prototype.keydown_backstroke = function() {
			var next_available_destroy;
			if (this.pending_backstroke) {
				this.choice_destroy(this.pending_backstroke.find("a").first());
				return this.clear_backstroke()
			} else {
				next_available_destroy = this.search_container.siblings("li.search-choice").last();
				if (next_available_destroy.length &&
					!next_available_destroy.hasClass("search-choice-disabled")) {
					this.pending_backstroke = next_available_destroy;
					if (this.single_backstroke_delete) return this.keydown_backstroke();
					else return this.pending_backstroke.addClass("search-choice-focus")
				}
			}
		};
		Chosen.prototype.clear_backstroke = function() {
			if (this.pending_backstroke) this.pending_backstroke.removeClass("search-choice-focus");
			return this.pending_backstroke = null
		};
		Chosen.prototype.search_field_scale = function() {
			var div, i, len, style, style_block, styles, width;
			if (!this.is_multiple) return;
			style_block = {
				position: "absolute",
				left: "-1000px",
				top: "-1000px",
				display: "none",
				whiteSpace: "pre"
			};
			styles = ["fontSize", "fontStyle", "fontWeight", "fontFamily", "lineHeight", "textTransform", "letterSpacing"];
			for (i = 0, len = styles.length; i < len; i++) {
				style = styles[i];
				style_block[style] = this.search_field.css(style)
			}
			div = $("<div />").css(style_block);
			div.text(this.get_search_field_value());
			$("body").append(div);
			width = div.width() + 25;
			div.remove();
			if (this.container.is(":visible")) width = Math.min(this.container.outerWidth() -
				10, width);
			return this.search_field.width(width)
		};
		Chosen.prototype.trigger_form_field_change = function(extra) {
			this.form_field_jq.trigger("input", extra);
			return this.form_field_jq.trigger("change", extra)
		};
		return Chosen
	}(AbstractChosen)
}).call(this);
var total_size = 0;
var total_attachments = 0;
var max_attachments = 10;
var attachments = [];
$(document).ready(function() {
	$(".chosen-select").chosen();
	load_accordions("employer");
	query_box();
	handle_login();
	$(window).on("popstate", function() {
		var category_id = window.location.pathname.substr(1).split("/").slice(2)[0];
		$("#category_heading_" + category_id).click()
	});
	if ($("#container").is(":visible") && $("#categories_container").length > 0) {
		var category_content_to_activate = $(".category_heading:first").attr("data-id");
		history.replaceState("", "", "/employer/help_center_faq/" + category_content_to_activate)
	}
	$("#email").change(function() {
		if (mainRole ===
			"guest") $("#query_data_logged_out > a").attr("href", "/login/employer/" + encodeURIComponent("/employer/help_center_faq/" + query_box_id) + "?email=" + encodeURIComponent($(this).val()))
	});
	faq_expand_tag()
});

function query_box() {
	query_subject("employer");
	query_form("employer");
	query_attachment();
	query_remove_attachment()
}

function handle_login() {
	$(".faq_category_content a[href]").click(function(e) {
		if (window.location.host !== this.host) return;
		if (this.pathname.startsWith("/registration/employer")) return;
		if (this.pathname.startsWith("/login/forgot_password/employer")) return;
		if (mainRole === "guest") {
			e.preventDefault();
			loginModalSuccessPage = "/" + encodeURIComponent(this.pathname);
			$("#modal-login-form #modal_email").val("");
			$("#modal-login-form #modal_password").val("");
			reset_form_validations("modal-login-form");
			$("#login-modal").modal("show");
			var email = $("#query_form #email").val();
			if (email) $("#modal-login-form #modal_email").val(email);
			$("#modal_employer").click()
		} else if (mainRole === "employer") {
			var matches = this.pathname.match(/^\/employer\/help_center_faq\/(\d+)(?:\/?(\d+)\/?)?$/);
			if (matches) {
				var groups = matches.slice(1);
				if (groups.length > 0) {
					var category_id = groups[0];
					var placeholder_id = groups[1];
					if (category_id == query_box_id) {
						e.preventDefault();
						show_query_box(placeholder_id)
					}
				}
			}
		}
	});
	$("#login-modal").on("hidden.bs.modal", function() {
		loginModalSuccessPage =
			""
	})
}
var query_success = function(data) {
	try {
		NProgress.done();
		total_size = 0;
		total_attachments = 0;
		attachments.length = 0;
		$("#uploaded_attachments").html("");
		if (data.success) {
			reset_form_validations("query_form");
			$("#query_form")[0].reset();
			$(".chosen-select").val("").trigger("chosen:updated");
			$("#job_selection_box .chosen-single span").html(format_selection_options);
			$("#attachments_error").html("");
			throw_success(data.successMsg)
		} else throw_error(data.errorThrown)
	} catch (e) {
		throw_error(e);
		NProgress.done();
		$(".loading_image").hide()
	}
};

function show_query_box(placeholder_id) {
	var new_url;
	if (placeholder_id) new_url = "/employer/help_center_faq/" + query_box_id + "/" + placeholder_id;
	else new_url = "/employer/help_center_faq/" + query_box_id;
	if (mainRole === "guest") {
		loginModalSuccessPage = "/" + encodeURIComponent(new_url);
		$("#modal-login-form #modal_email").val("");
		$("#modal-login-form #modal_password").val("");
		reset_form_validations("modal-login-form");
		$("#login-modal").modal("show");
		$("#modal_employer").click();
		return
	}
	if (!$("#category_heading_" + query_box_id).hasClass("active") &&
		$("#category_heading_" + query_box_id).length) {
		var category_content_to_activate = $("#category_heading_" + query_box_id).attr("data-id");
		$(".category_heading").removeClass("active");
		$("#category_heading_" + query_box_id).addClass("active");
		$(".category_heading").addClass("disabled");
		$(".faq_category_content.active_category").fadeOut("", function() {
			$(".category_heading").removeClass("disabled");
			$(".faq_category_content").removeClass("active_category");
			$("#breadcrumb_active_category").html($("#category_heading_" +
				query_box_id).attr("data-name"));
			$("#category_content_" + category_content_to_activate).fadeIn().addClass("active_category")
		});
		close_accordion_section()
	}
	if (placeholder_id) {
		$("#query_data").attr("placeholder", query_box_placeholders[placeholder_id]);
		$("#query_subject").val(placeholder_id).trigger("chosen:updated")
	}
	history.pushState("", "", new_url)
}

function job_selection_drop_down() {
	$("#query_job_selection").val("").trigger("chosen:updated");
	var subject_value = $("#query_subject").val();
	var subject_other_ids = [18, 24];
	var employment_type = $('#query_form input[name="user_type"]').val() == "employer" ? "internship" : "job";
	if (subject_value == 15 || subject_value == 21 || $("#query_data").val()) $("#query_form").validate().element("#query_data");
	if (employer_help_center_subject_ids.includes(Number(subject_value)) || subject_other_ids.includes(Number(subject_value))) {
		$("#job_selection_box").show();
		$.ajax({
			type: "POST",
			url: "/employer/get_jobs_for_employer_help_center",
			data: {
				subject_value: subject_value,
				employment_type: employment_type
			},
			success: get_job_success,
			error: onError
		})
	} else $("#job_selection_box").hide();
	if (subject_other_ids.includes(Number(subject_value))) {
		$("#job_selection_box .label_hint").show();
		$("#job_selection_box").removeClass("has-error")
	} else $("#job_selection_box .label_hint").hide();
	$("#job_selection_box .chosen-single span").html(format_selection_options);
	$("#query_job_selection").chosen().on("chosen:showing_dropdown",
		function() {
			$("#query_job_selection_chosen .chosen-results li").html(format_selection_options)
		});
	$(document).on("keyup", "#query_job_selection_chosen .chosen-search-input", function() {
		$("#query_job_selection_chosen .chosen-results li").html(format_selection_options)
	});
	$(document).on("click touchend", "#query_job_selection_chosen .chosen-results li", function() {
		$("#query_job_selection_chosen .chosen-single span").html(format_selection_options)
	});
	$(document).on("keyup", "#query_job_selection_chosen", function() {
		$("#query_job_selection_chosen .chosen-single span").html(format_selection_options)
	})
}

function format_selection_options() {
	var html = $(this).html();
	if (/::/.test(html) && /^/.test(html)) {
		html = html.replace("^", "<span class='title_location'>");
		html = html.replace("::", "</span><span class='posted_on'>") + "</span>";
		return html
	} else return html
}

function get_job_success(data) {
	$("#query_job_selection").find("option").not(":disabled").remove();
	$("#query_job_selection").append(data.view);
	$("#query_job_selection").trigger("chosen:updated");
	$("#job_selection_box .chosen-single span").html(format_selection_options)
};

function faq_expand_tag() {
	$(".card-header .btn").click(function() {
		var answer_id = $(this).attr("data-target");
		var faq_id = $(this).attr("faq_id");
		setTimeout(function() {
			if ($(answer_id).hasClass("show"))
				if (typeof dataLayer !== "undefined") {
					dataLayer.push({
						"event": "help_center_click_event",
						"eventCategory": "help_center_section",
						"eventAction": "click",
						"eventLabel": faq_id
					});
					dataLayer.push({
						"event": "help_center_click",
						"click": "section_" + faq_id
					})
				}
		}, 500)
	})
}

function query_form(help_center_role) {
	$("#query_form").validate({
		ignore: "",
		onfocusout: function(element) {
			this.element(element)
		},
		rules: {
			email: {
				required: true,
				email: true,
				maxlength: 100
			},
			name: {
				required: true,
				user_name: true,
				maxlength: 100
			},
			query_subject: {
				required: true
			},
			query_data: {
				required: function(elm) {
					if (help_center_role === "employer") {
						var select_query_id = $("#query_subject").find("option:checked").val();
						return ![15, 21].includes(Number(select_query_id))
					} else return true
				},
				maxlength: 2048,
				minlength: function() {
					var select_query_id =
						$("#query_subject").find("option:checked").val();
					if (select_query_id == 15) return 0;
					else return 50
				}
			},
			query_job_selection: {
				required: function(elm) {
					if (help_center_role === "employer") {
						var subject_query_id = $("#query_subject").find("option:checked").val();
						return employer_help_center_subject_ids.includes(Number(subject_query_id))
					} else return false
				}
			},
			query_internship: {
				required: function(elm) {
					if (help_center_role === "student") {
						internship_query_id = $("#query_subject").find("option:checked").val();
						return internship_query_ids.includes(Number(internship_query_id))
					} else return false
				}
			},
			"query_sub_category_internship[]": {
				required: function(elm) {
					if (help_center_role === "student") {
						var employment_type;
						if (window.is_on_chat_page) {
							employment_type = $("#query_internship").attr("employment_type");
							internship_query_id = $("#query_subject").val()
						} else {
							employment_type = $("#query_internship").find(":selected").attr("employment_type");
							internship_query_id = $("#query_subject").find("option:checked").val();
							if (!employment_type) employment_type = "internship"
						}
						return employment_type == "internship" && internship_query_id ==
							query_box_id
					} else return false
				}
			},
			"query_sub_category_job[]": {
				required: function(elm) {
					if (help_center_role === "student") {
						var employment_type;
						if (window.is_on_chat_page) {
							employment_type = $("#query_internship").attr("employment_type");
							internship_query_id = $("#query_subject").val()
						} else {
							employment_type = $("#query_internship").find(":selected").attr("employment_type");
							internship_query_id = $("#query_subject").find("option:checked").val()
						}
						return employment_type == "job" && internship_query_id == query_box_id
					} else return false
				}
			},
			"attachments[]": {
				extension: "jpg,jpeg,png,gif,bmp,pdf,JPG,JPEG,PNG,GIF,BMP,PDF",
				size: 10
			}
		},
		messages: {
			query_data: {
				minlength: jQuery.validator.format("Enter at least {0} characters to proceed.")
			}
		},
		errorPlacement: function(label, element) {
			if (element.attr("name") === "query_subject") label.appendTo("#query_subject_error");
			else if (element.attr("name") === "query_job_selection") label.appendTo("#query_job_selection_error");
			else if (element.attr("name") === "query_internship") label.appendTo("#query_internship_error");
			else if (element.attr("name") === "query_sub_category_internship[]") label.appendTo("#query_subcategory_error");
			else if (element.attr("name") === "query_sub_category_job[]") label.appendTo("#query_subcategory_error");
			else if (element.attr("name") === "attachments[]") label.appendTo("#attachments_error");
			else label.insertAfter(element)
		},
		highlight: function(label) {
			$(label).closest(".form-group").addClass("has-error");
			$(label).closest(".form-group").removeClass("has-success");
			$(label).closest("input").addClass("error");
			$(label).closest("input").removeClass("valid")
		},
		success: function(label) {
			$(label).closest(".form-group").addClass("has-success");
			$(label).closest(".form-group").removeClass("has-error");
			$(label).closest("input").addClass("valid");
			$(label).closest("input").removeClass("error")
		},
		submitHandler: function() {
			if (total_size > 5E3) {
				$("#attachments_error").html("Attachment failed. Total files size allowed is 5 MB.");
				return false
			}
			if (total_attachments > max_attachments) {
				$("#attachments_error").html("Attachment failed. You can only upload maximum 10 attachments.");
				return false
			}
			var form = document.querySelector("#query_form");
			var form_data = new FormData(form);
			form_data["delete"]("attachments[]");
			for (var i = 0, len = attachments.length; i < len; i++) form_data.append("attachments[]", attachments[i].file);
			var url = "/" + help_center_role + "/query_box_submit";
			if (!window.is_on_chat_page && help_center_role === "student" && total_attachments === 0) show_attachment_alert_modal(url, form_data);
			else {
				$.ajax(url, {
					data: form_data,
					success: query_success,
					error: onError,
					type: "POST",
					processData: false,
					contentType: false
				});
				NProgress.start();
				$(".loading_image").show()
			}
			return false
		}
	})
}

function show_attachment_alert_modal(url, form_data) {
	$(".loading_image").hide();
	$("#alert_modal .text-heading").hide();
	$("#alert_modal .text-message").html("It seems like you have not attached any screenshots regarding the issue. Do you want to send anyway?");
	$("#alert_modal .modal_primary_btn").text("Send");
	if ($("#alert_modal .modal_secondary_btn").length === 0) $("#alert_modal .button_container").prepend('<button class="btn btn-secondary modal_secondary_btn close_action" data-dismiss="modal">Cancel</button>');
	$("#alert_modal .modal_primary_btn").addClass("close_action");
	$("#alert_modal .modal_primary_btn").removeAttr("href");
	$("#alert_modal .modal_primary_btn").attr("data-dismiss", "modal");
	$("#alert_modal .modal_primary_btn").off("click").click(function() {
		$.ajax(url, {
			data: form_data,
			success: query_success,
			error: onError,
			type: "POST",
			processData: false,
			contentType: false
		});
		NProgress.start();
		$(".loading_image").show()
	});
	$("#alert_modal").removeData("bs.modal").modal({
		show: true,
		backdrop: "true",
		keyboard: true
	})
}

function show_attachment_error(error_massage) {
	$("#attachments_error").html(error_massage);
	$("#attachment").val("");
	return false
}

function query_subject(help_center_role) {
	$("#query_subject").change(function() {
		if (mainRole === help_center_role || !$("#query_subject").val() || $("#query_subject").find("option:checked").text() === "Others") {
			$("#query_data").show();
			$("#query_data_logged_out").hide();
			$("#query_data_logged_out a").attr("href", "/" + help_center_role + "/help_center_faq/" + query_box_id)
		} else {
			$("#query_data").val("");
			$("#query_data").hide();
			$("#query_data_logged_out").show();
			if (typeof query_box_id != "undefined")
				if ($(this).val()) $("#query_data_logged_out a").attr("href",
					"/" + help_center_role + "/help_center_faq/" + query_box_id + "/" + $(this).val());
				else $("#query_data_logged_out a").attr("href", "/" + help_center_role + "/help_center_faq/" + query_box_id);
			else $("#query_data_logged_out a").attr("href", "/" + help_center_role + "/help_center_faq/");
			$("#query_data").closest(".form-control").removeClass("error");
			$("#query_data").closest(".form-control").removeClass("valid");
			$("#query_data").closest(".form-group").removeClass("has-error");
			$("#query_data").closest(".form-group").removeClass("has-success");
			$("#query_data-error").remove()
		}
		if (help_center_role == "employer") {
			$("#query_data").attr("placeholder", query_box_placeholders[$("#query_subject").val()]);
			if (mainRole === help_center_role) job_selection_drop_down()
		}
		if (help_center_role == "student") {
			internship_query_id = $("#query_subject").find("option:checked").val();
			if (mainRole === help_center_role && internship_query_ids.includes(Number(internship_query_id))) $("#query_internship_container").show();
			else $("#query_internship_container").hide()
		}
	})
}

function load_accordions(type) {
	$("#category_container .nav-item").click(function() {
		var heading_element = $(this).find(".category_heading");
		if (!heading_element.hasClass("active")) {
			var category_content_to_activate = heading_element.attr("data-id");
			if (typeof dataLayer !== "undefined") {
				dataLayer.push({
					"event": "help_center_click_event",
					"eventCategory": "help_center_catgory",
					"eventAction": "click",
					"eventLabel": category_content_to_activate
				});
				dataLayer.push({
					"event": "help_center_click",
					"click": "category_" + category_content_to_activate
				})
			}
			$(".category_heading").removeClass("active");
			heading_element.addClass("active");
			$(".faq_category_content.active_category").fadeOut("", function() {
				close_accordion_section();
				$(".faq_category_content").removeClass("active_category");
				$("#breadcrumb_active_category").html(heading_element.attr("data-name"));
				history.replaceState("", "", "/" + type + "/help_center_faq/" + category_content_to_activate);
				$("#category_content_" + category_content_to_activate).fadeIn().addClass("active_category")
			})
		}
	})
}

function scroll_tabs() {
	if ($("#category_container .nav-item .active").is(":visible")) {
		var heading_scroll_position = $("#category_container .nav-item .active").offset().left + $("#category_container .nav-item .active").outerWidth(true) / 2 + $("#category_container").scrollLeft() - $("#category_container").width() / 2;
		$("#category_container .vertical_reverse").scrollLeft(heading_scroll_position)
	}
}

function close_accordion_section() {
	$(".card-header .btn").addClass("collapsed");
	$(".answer").removeClass("show")
}

function query_remove_attachment() {
	$(document).on("click", ".delete_attachment", function() {
		var attachment_id = $(this).attr("data-id");
		for (var i = 0; i < attachments.length; ++i)
			if (attachments[i].id === attachment_id) {
				if (total_size > 1) {
					var size = attachments[i].file.size / 1024;
					size = Math.round(size * 100) / 100;
					total_size = total_size - size
				}
				if (total_attachments >= 1) total_attachments--;
				attachments.splice(i, 1)
			} $(this).parent("#" + attachment_id).remove();
		if (total_size < 5E3 || total_attachments < max_attachments) $("#attachments_error").html("")
	})
}

function query_attachment() {
	$("#attachment").change(function(e) {
		$("#attachments_error").html("");
		if (this.files && this.files.length)
			for (var x = 0; x < this.files.length; x++) {
				var name = this.files[x].name;
				var size = this.files[x].size / 1024;
				size = Math.round(size * 100) / 100;
				if (total_size + size > 5E3) return show_attachment_error("Attachment failed. Total files size allowed is 5 MB.");
				if (total_attachments >= max_attachments) return show_attachment_error("Attachment failed. You can only upload maximum 10 attachments.");
				var extension =
					this.files[x].name.replace(/^.*\./, "");
				extension = extension.toLowerCase();
				var file_type = "";
				var type = "doc";
				switch (extension) {
					case "png":
					case "jpg":
					case "jpeg":
					case "gif":
					case "bmp":
						file_type = extension.toUpperCase();
						type = "image";
						break;
					case "pdf":
						file_type = extension.toUpperCase();
						break;
					default:
						return show_attachment_error("Please upload a file with a valid extension.")
				}
				var date = new Date;
				var attachment = '<div class="attachment" id="attachment_' + date.getTime() + '" title="' + name + '">' + '   <div class="attachment_icon ' +
					type + '">' + file_type + "</div>" + '   <div class="attachment_text">' + '       <span class="attachment_name">' + name.replace("." + extension, "").slice(0, 19) + (name.length > 19 ? "...." : ".") + extension + "</span>" + "       <br>" + '       <span class="attachment_size">' + size + " KB</span>" + "   </div>" + '   <img class="delete_attachment" data-id="attachment_' + date.getTime() + '" src="/static/images/help_center/attachment_cross_icon.svg">' + "</div>";
				$("#uploaded_attachments").append(attachment);
				attachments.push({
					id: "attachment_" +
						date.getTime(),
					file: this.files[x]
				});
				total_size = total_size + size;
				total_attachments++;
				attachment = ""
			}
	})
};