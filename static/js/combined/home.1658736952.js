var placement = "";
$(document).ready(function() {
	slick_banners();
	$(".chosen-select").chosen({
		disable_search_threshold: 10
	});
	$("#search_submit").prop("disabled", false);
	$("body").on("click", function(e) {
		if ($(e.target).parents("#register").length == 0)
			if ($("#register").hasClass("show")) $("#register-container").removeClass("click")
	});
	$("#register").on("shown.bs.dropdown", function() {
		$("#register-container").addClass("click");
		$(this).find(".is_icon_header").addClass("ic-24-filled-up-arrow");
		$(this).find(".is_icon_header").removeClass("ic-24-filled-down-arrow")
	});
	$("#register").on("hidden.bs.dropdown",
		function() {
			$("#register-container").removeClass("click");
			$(this).find(".is_icon_header").addClass("ic-24-filled-down-arrow");
			$(this).find(".is_icon_header").removeClass("ic-24-filled-up-arrow")
		});
	$(".register_home").hover(function() {
		$(this).find(".is_icon_header").addClass("ic-24-filled-up-arrow");
		$(this).find(".is_icon_header").removeClass("ic-24-filled-down-arrow")
	}, function() {
		$(this).find(".is_icon_header").addClass("ic-24-filled-down-arrow");
		$(this).find(".is_icon_header").removeClass("ic-24-filled-up-arrow")
	});
	var win = $(window);
	if (win.width() > 767) placement = "top";
	else placement = "bottom";
	$("#internship_modal_search_input").autocomplete({
		select: function(event, ui) {
			var input_category = (ui.item ? ui.item.value : "").trim();
			search(input_category)
		}
	});
	$(".pop").popover({
		placement: placement,
		trigger: "focus",
		container: "#search_modal",
		html: true,
		sanitize: false,
		content: "<div style='width: 221px;'>Search by category, location or company name.</div>"
	});
	$("#looking_for_chosen").on("touchstart click", function() {
		$("#internship_modal_search_input").blur();
		$("#fresher_job_modal_search_input").blur()
	});
	$("#fresher_job_modal_search_input").autocomplete({
		select: function(event, ui) {
			var input_category = (ui.item ? ui.item.value : "").trim();
			search(input_category)
		}
	});
	$(document).on("submit", "#internship_search_button_form", function() {
		var input_category = $("#internship_modal_search_input").val().trim();
		search(input_category);
		return false
	});
	$(document).on("submit", "#fresher_job_search_button_form", function() {
		var input_category = $("#fresher_job_modal_search_input").val().trim();
		search(input_category);
		return false
	});
	resize_autocomplete();
	Array.prototype.toLowerCase = function() {
		var i = this.length;
		while (--i >= 0)
			if (typeof this[i] === "string") this[i] = this[i].toLowerCase();
		return this
	};
	if (typeof dataLayer !== "undefined") {
		dataLayer.push({
			"event": "home_page_search",
			"eventCategory": "home_page_search",
			"eventAction": "view"
		});
		dataLayer.push({
			"event": "home_page_search_view",
			"view": "view_count"
		})
	}
	$(".discover-image").click(function(e) {
		NProgress.start();
		$(".loading_image").show()
	});
	$("#view_all").click(function(e) {
		NProgress.start();
		$(".loading_image").show()
	});
	$("#register ul li a").click(function(e) {
		e.stopPropagation()
	});
	if (typeof is_slider_banner_preview !== "undefined" && is_slider_banner_preview) preview_notification('<strong>Admin Note:</strong> You are in preview mode. <a id="admin_exit_preview_button">Click here to exit preview.</a>');
	search_modal();
	handle_specialization_cards()
});

function handle_specialization_cards() {
	$("#specialization_training_container .specialization_card").on("click", function(e) {
		var link = e.currentTarget.getAttribute("link");
		window.open(link, "_blank").focus()
	});
	var images = document.querySelectorAll("#specialization_training_container img");
	images.forEach(function(img) {
		var imgPath = img.dataset.src;
		if (window.innerWidth > 576) img.setAttribute("src", imgPath);
		else {
			var imgPathSplit = imgPath.split(".");
			var mobileImagePath = imgPathSplit[0] + "_mobile." + imgPathSplit[1];
			img.setAttribute("src", mobileImagePath)
		}
	})
}

function search(input_category) {
	var looking_for = $("#looking_for").val();
	if (looking_for === "internships") categories_for_search = internship_categories_for_search_keywords;
	else if (looking_for === "jobs") categories_for_search = fresher_job_categories_for_search_keywords;
	var redirect_url = "/" + looking_for + "/";
	if (input_category !== "") {
		var category = input_category.toLowerCase().trim();
		var isCategoryExists = false;
		$.each(categories_for_search, function(index, value) {
			if (index.toLowerCase().trim() === category) {
				input_category =
					value;
				isCategoryExists = true;
				redirect_url = value;
				return
			}
		});
		if (!isCategoryExists) {
			var utm_source = looking_for === "internships" ? "hp_internship_keyword_search" : "hp_job_keyword_search";
			redirect_url = "/" + looking_for + "/keywords-" + encodeURIComponent(input_category) + "?utm_source=" + utm_source
		}
	}
	if (typeof dataLayer !== "undefined") {
		dataLayer.push({
			"event": "home_page_search",
			"eventCategory": "home_page_search",
			"eventAction": "click"
		});
		dataLayer.push({
			"event": "home_page_search_click",
			"click": "click_count"
		})
	}
	NProgress.start();
	$(".loading_image").show();
	window.location.href = redirect_url
}
$(document).on("click", "#admin_exit_preview_button", function() {
	$.get("/admin_banner/preview_slider_banner_end", {}, function() {
		if (window.opener) window.close();
		else window.location.reload()
	})
});

function showRemaining(banner_timer_detail) {
	if (typeof document.getElementById(banner_timer_detail["timer_element_id"]) === "undefined" || !document.getElementById(banner_timer_detail["timer_element_id"])) return;
	var days = Math.floor(banner_timer_detail["remaining_time"] / 24 / 60 / 60);
	var hoursLeft = Math.floor(banner_timer_detail["remaining_time"] - days * 86400);
	var hours = Math.floor(hoursLeft / 3600);
	var minutesLeft = Math.floor(hoursLeft - hours * 3600);
	var minutes = Math.floor(minutesLeft / 60);
	var remainingSeconds = banner_timer_detail["remaining_time"] %
		60;
	if (hours < 10) hours = "0" + hours;
	if (minutes < 10) minutes = "0" + minutes;
	if (remainingSeconds < 10) remainingSeconds = "0" + remainingSeconds;
	if (banner_timer_detail["remaining_time"] <= 0) {
		clearInterval(timer);
		document.getElementById(banner_timer_detail["timer_element_id"]).innerHTML = "Expired!"
	} else {
		if (days > 0) {
			days = "0" + days;
			document.getElementById(banner_timer_detail["timer_element_id"]).innerHTML = " " + days + "d:" + hours + "h:" + minutes + "m:" + remainingSeconds + "s"
		} else document.getElementById(banner_timer_detail["timer_element_id"]).innerHTML =
			" " + hours + "h:" + minutes + "m:" + remainingSeconds + "s";
		banner_timer_detail["remaining_time"]--
	}
}

function search_modal() {
	$(document).on("focus", "#search", function() {
		$("#search_modal").modal("show");
		$("#search_modal .form-control").val("");
		$("#looking_for").val("internships").trigger("change").trigger("chosen:updated")
	});
	$(document).on("change", "#trainings_dropdown", function() {
		window.open($(this).val());
		$("#trainings_dropdown option:selected").removeAttr("selected");
		$("#trainings_dropdown").trigger("chosen:updated")
	});
	$("#looking_for option:eq(0)").prop("selected", true);
	internships_related_changes();
	modal_search_bar_changes();
	$(document).on("change", "#looking_for", function() {
		var looking_for = $(this).val();
		if (looking_for === "internships") internships_related_changes();
		else if (looking_for === "jobs") jobs_related_changes();
		else if (looking_for === "trainings") trainings_related_changes()
	})
}

function internships_related_changes() {
	$(".modal_fresher_jobs_container").hide();
	$(".modal_trainings_container").hide();
	$(".modal_internship_container").show()
}

function trainings_related_changes() {
	$(".modal_fresher_jobs_container").hide();
	$(".modal_internship_container").hide();
	$(".modal_trainings_container").show()
}

function jobs_related_changes() {
	$("#modal_search_input").attr("placeholder", "eg. MBA, Graphic Design, Android, Mumbai, etc.");
	$(".modal_trainings_container").hide();
	$(".modal_internship_container").hide();
	$(".modal_fresher_jobs_container").show()
}

function resize_autocomplete() {
	jQuery.ui.autocomplete.prototype._resizeMenu = function() {
		var ul = this.menu.element;
		ul.outerWidth(this.element.parent().outerWidth())
	}
}

function modal_search_bar_changes() {
	$(".cross_btn_container").hide();
	$(".cross_btn").on("click", function() {
		$(this).parents().siblings(".form-control").val("").trigger("input").focus()
	});
	$(".has_cross_and_button").children(".form-control").on("focusin", function() {
		$(this).parent().addClass("is_focused")
	});
	$(".has_cross_and_button").children(".form-control").on("focusout", function() {
		$(this).parent().removeClass("is_focused")
	});
	$(".has_cross_and_button").children(".form-control").on("input", function() {
		var length =
			$(this).val().length;
		if (length > 0) $(this).siblings(".cross_btn_container").show();
		else $(this).siblings(".cross_btn_container").hide()
	})
}

function slick_banners() {
	$("#banners").on("init", function(event, slick) {
		setInterval(function() {
			$(banner_timer_details).each(function() {
				showRemaining(this)
			})
		}, 1E3)
	});
	$("#banners").slick({
		slidesToShow: 1,
		slidesToScroll: 1,
		centerMode: true,
		infinite: true,
		variableWidth: true,
		draggable: true,
		autoplay: true,
		autoplaySpeed: 5E3,
		pauseOnHover: true,
		dots: true,
		arrows: true,
		responsive: [{
			breakpoint: 1255,
			settings: {
				arrows: false
			}
		}]
	});
	var screen_width = window.innerWidth;
	$("#banners .banner").each(function(index) {
		var open_link_in_new_tab_desktop =
			$(this).attr("open_link_in_new_tab_desktop");
		var open_link_in_new_tab_mobile = $(this).attr("open_link_in_new_tab_mobile");
		if (screen_width > 991) {
			if (open_link_in_new_tab_desktop == "yes") $(this).attr("target", "_blank")
		} else if (open_link_in_new_tab_mobile == "yes") $(this).attr("target", "_blank")
	})
};
! function(i) {
	"function" == typeof define && define.amd ? define(["jquery"], i) : "undefined" != typeof exports ? module.exports = i(require("jquery")) : i(jQuery)
}(function(i) {
	var e = window.Slick || {};
	(e = function() {
		var e = 0;
		return function(t, o) {
			var s, n = this;
			n.defaults = {
					accessibility: !0,
					adaptiveHeight: !1,
					appendArrows: i(t),
					appendDots: i(t),
					arrows: !0,
					asNavFor: null,
					prevArrow: '<button class="slick-prev" aria-label="Previous" type="button">Previous</button>',
					nextArrow: '<button class="slick-next" aria-label="Next" type="button">Next</button>',
					autoplay: !1,
					autoplaySpeed: 3E3,
					centerMode: !1,
					centerPadding: "50px",
					cssEase: "ease",
					customPaging: function(e, t) {
						return i('<button type="button" />').text(t + 1)
					},
					dots: !1,
					dotsClass: "slick-dots",
					draggable: !0,
					easing: "linear",
					edgeFriction: .35,
					fade: !1,
					focusOnSelect: !1,
					focusOnChange: !1,
					infinite: !0,
					initialSlide: 0,
					lazyLoad: "ondemand",
					mobileFirst: !1,
					pauseOnHover: !0,
					pauseOnFocus: !0,
					pauseOnDotsHover: !1,
					respondTo: "window",
					responsive: null,
					rows: 1,
					rtl: !1,
					slide: "",
					slidesPerRow: 1,
					slidesToShow: 1,
					slidesToScroll: 1,
					speed: 500,
					swipe: !0,
					swipeToSlide: !1,
					touchMove: !0,
					touchThreshold: 5,
					useCSS: !0,
					useTransform: !0,
					variableWidth: !1,
					vertical: !1,
					verticalSwiping: !1,
					waitForAnimate: !0,
					zIndex: 1E3
				}, n.initials = {
					animating: !1,
					dragging: !1,
					autoPlayTimer: null,
					currentDirection: 0,
					currentLeft: null,
					currentSlide: 0,
					direction: 1,
					$dots: null,
					listWidth: null,
					listHeight: null,
					loadIndex: 0,
					$nextArrow: null,
					$prevArrow: null,
					scrolling: !1,
					slideCount: null,
					slideWidth: null,
					$slideTrack: null,
					$slides: null,
					sliding: !1,
					slideOffset: 0,
					swipeLeft: null,
					swiping: !1,
					$list: null,
					touchObject: {},
					transformsEnabled: !1,
					unslicked: !1
				}, i.extend(n, n.initials), n.activeBreakpoint = null, n.animType = null, n.animProp = null, n.breakpoints = [], n.breakpointSettings = [], n.cssTransitions = !1, n.focussed = !1, n.interrupted = !1, n.hidden = "hidden", n.paused = !0, n.positionProp = null, n.respondTo = null, n.rowCount = 1, n.shouldClick = !0, n.$slider = i(t), n.$slidesCache = null, n.transformType = null, n.transitionType = null, n.visibilityChange = "visibilitychange", n.windowWidth = 0, n.windowTimer = null, s = i(t).data("slick") || {}, n.options =
				i.extend({}, n.defaults, o, s), n.currentSlide = n.options.initialSlide, n.originalSettings = n.options, void 0 !== document.mozHidden ? (n.hidden = "mozHidden", n.visibilityChange = "mozvisibilitychange") : void 0 !== document.webkitHidden && (n.hidden = "webkitHidden", n.visibilityChange = "webkitvisibilitychange"), n.autoPlay = i.proxy(n.autoPlay, n), n.autoPlayClear = i.proxy(n.autoPlayClear, n), n.autoPlayIterator = i.proxy(n.autoPlayIterator, n), n.changeSlide = i.proxy(n.changeSlide, n), n.clickHandler = i.proxy(n.clickHandler, n), n.selectHandler =
				i.proxy(n.selectHandler, n), n.setPosition = i.proxy(n.setPosition, n), n.swipeHandler = i.proxy(n.swipeHandler, n), n.dragHandler = i.proxy(n.dragHandler, n), n.keyHandler = i.proxy(n.keyHandler, n), n.instanceUid = e++, n.htmlExpr = /^(?:\s*(<[\w\W]+>)[^>]*)$/, n.registerBreakpoints(), n.init(!0)
		}
	}()).prototype.activateADA = function() {
			this.$slideTrack.find(".slick-active").attr({
				"aria-hidden": "false"
			}).find("a, input, button, select").attr({
				tabindex: "0"
			})
		}, e.prototype.addSlide = e.prototype.slickAdd = function(e, t, o) {
			var s =
				this;
			if ("boolean" == typeof t) o = t, t = null;
			else if (t < 0 || t >= s.slideCount) return !1;
			s.unload(), "number" == typeof t ? 0 === t && 0 === s.$slides.length ? i(e).appendTo(s.$slideTrack) : o ? i(e).insertBefore(s.$slides.eq(t)) : i(e).insertAfter(s.$slides.eq(t)) : !0 === o ? i(e).prependTo(s.$slideTrack) : i(e).appendTo(s.$slideTrack), s.$slides = s.$slideTrack.children(this.options.slide), s.$slideTrack.children(this.options.slide).detach(), s.$slideTrack.append(s.$slides), s.$slides.each(function(e, t) {
					i(t).attr("data-slick-index", e)
				}),
				s.$slidesCache = s.$slides, s.reinit()
		}, e.prototype.animateHeight = function() {
			var i = this;
			if (1 === i.options.slidesToShow && !0 === i.options.adaptiveHeight && !1 === i.options.vertical) {
				var e = i.$slides.eq(i.currentSlide).outerHeight(!0);
				i.$list.animate({
					height: e
				}, i.options.speed)
			}
		}, e.prototype.animateSlide = function(e, t) {
			var o = {},
				s = this;
			s.animateHeight(), !0 === s.options.rtl && !1 === s.options.vertical && (e = -e), !1 === s.transformsEnabled ? !1 === s.options.vertical ? s.$slideTrack.animate({
					left: e
				}, s.options.speed, s.options.easing,
				t) : s.$slideTrack.animate({
				top: e
			}, s.options.speed, s.options.easing, t) : !1 === s.cssTransitions ? (!0 === s.options.rtl && (s.currentLeft = -s.currentLeft), i({
				animStart: s.currentLeft
			}).animate({
				animStart: e
			}, {
				duration: s.options.speed,
				easing: s.options.easing,
				step: function(i) {
					i = Math.ceil(i), !1 === s.options.vertical ? (o[s.animType] = "translate(" + i + "px, 0px)", s.$slideTrack.css(o)) : (o[s.animType] = "translate(0px," + i + "px)", s.$slideTrack.css(o))
				},
				complete: function() {
					t && t.call()
				}
			})) : (s.applyTransition(), e = Math.ceil(e), !1 ===
				s.options.vertical ? o[s.animType] = "translate3d(" + e + "px, 0px, 0px)" : o[s.animType] = "translate3d(0px," + e + "px, 0px)", s.$slideTrack.css(o), t && setTimeout(function() {
					s.disableTransition(), t.call()
				}, s.options.speed))
		}, e.prototype.getNavTarget = function() {
			var e = this,
				t = e.options.asNavFor;
			return t && null !== t && (t = i(t).not(e.$slider)), t
		}, e.prototype.asNavFor = function(e) {
			var t = this.getNavTarget();
			null !== t && "object" == typeof t && t.each(function() {
				var t = i(this).slick("getSlick");
				t.unslicked || t.slideHandler(e, !0)
			})
		}, e.prototype.applyTransition =
		function(i) {
			var e = this,
				t = {};
			!1 === e.options.fade ? t[e.transitionType] = e.transformType + " " + e.options.speed + "ms " + e.options.cssEase : t[e.transitionType] = "opacity " + e.options.speed + "ms " + e.options.cssEase, !1 === e.options.fade ? e.$slideTrack.css(t) : e.$slides.eq(i).css(t)
		}, e.prototype.autoPlay = function() {
			var i = this;
			i.autoPlayClear(), i.slideCount > i.options.slidesToShow && (i.autoPlayTimer = setInterval(i.autoPlayIterator, i.options.autoplaySpeed))
		}, e.prototype.autoPlayClear = function() {
			var i = this;
			i.autoPlayTimer &&
				clearInterval(i.autoPlayTimer)
		}, e.prototype.autoPlayIterator = function() {
			var i = this,
				e = i.currentSlide + i.options.slidesToScroll;
			i.paused || i.interrupted || i.focussed || (!1 === i.options.infinite && (1 === i.direction && i.currentSlide + 1 === i.slideCount - 1 ? i.direction = 0 : 0 === i.direction && (e = i.currentSlide - i.options.slidesToScroll, i.currentSlide - 1 == 0 && (i.direction = 1))), i.slideHandler(e))
		}, e.prototype.buildArrows = function() {
			var e = this;
			!0 === e.options.arrows && (e.$prevArrow = i(e.options.prevArrow).addClass("slick-arrow"),
				e.$nextArrow = i(e.options.nextArrow).addClass("slick-arrow"), e.slideCount > e.options.slidesToShow ? (e.$prevArrow.removeClass("slick-hidden").removeAttr("aria-hidden tabindex"), e.$nextArrow.removeClass("slick-hidden").removeAttr("aria-hidden tabindex"), e.htmlExpr.test(e.options.prevArrow) && e.$prevArrow.prependTo(e.options.appendArrows), e.htmlExpr.test(e.options.nextArrow) && e.$nextArrow.appendTo(e.options.appendArrows), !0 !== e.options.infinite && e.$prevArrow.addClass("slick-disabled").attr("aria-disabled",
					"true")) : e.$prevArrow.add(e.$nextArrow).addClass("slick-hidden").attr({
					"aria-disabled": "true",
					tabindex: "-1"
				}))
		}, e.prototype.buildDots = function() {
			var e, t, o = this;
			if (!0 === o.options.dots) {
				for (o.$slider.addClass("slick-dotted"), t = i("<ul />").addClass(o.options.dotsClass), e = 0; e <= o.getDotCount(); e += 1) t.append(i("<li />").append(o.options.customPaging.call(this, o, e)));
				o.$dots = t.appendTo(o.options.appendDots), o.$dots.find("li").first().addClass("slick-active")
			}
		}, e.prototype.buildOut = function() {
			var e = this;
			e.$slides = e.$slider.children(e.options.slide + ":not(.slick-cloned)").addClass("slick-slide"), e.slideCount = e.$slides.length, e.$slides.each(function(e, t) {
					i(t).attr("data-slick-index", e).data("originalStyling", i(t).attr("style") || "")
				}), e.$slider.addClass("slick-slider"), e.$slideTrack = 0 === e.slideCount ? i('<div class="slick-track"/>').appendTo(e.$slider) : e.$slides.wrapAll('<div class="slick-track"/>').parent(), e.$list = e.$slideTrack.wrap('<div class="slick-list"/>').parent(), e.$slideTrack.css("opacity", 0),
				!0 !== e.options.centerMode && !0 !== e.options.swipeToSlide || (e.options.slidesToScroll = 1), i("img[data-lazy]", e.$slider).not("[src]").addClass("slick-loading"), e.setupInfinite(), e.buildArrows(), e.buildDots(), e.updateDots(), e.setSlideClasses("number" == typeof e.currentSlide ? e.currentSlide : 0), !0 === e.options.draggable && e.$list.addClass("draggable")
		}, e.prototype.buildRows = function() {
			var i, e, t, o, s, n, r, l = this;
			if (o = document.createDocumentFragment(), n = l.$slider.children(), l.options.rows > 1) {
				for (r = l.options.slidesPerRow *
					l.options.rows, s = Math.ceil(n.length / r), i = 0; i < s; i++) {
					var d = document.createElement("div");
					for (e = 0; e < l.options.rows; e++) {
						var a = document.createElement("div");
						for (t = 0; t < l.options.slidesPerRow; t++) {
							var c = i * r + (e * l.options.slidesPerRow + t);
							n.get(c) && a.appendChild(n.get(c))
						}
						d.appendChild(a)
					}
					o.appendChild(d)
				}
				l.$slider.empty().append(o), l.$slider.children().children().children().css({
					width: 100 / l.options.slidesPerRow + "%",
					display: "inline-block"
				})
			}
		}, e.prototype.checkResponsive = function(e, t) {
			var o, s, n, r = this,
				l = !1,
				d = r.$slider.width(),
				a = window.innerWidth || i(window).width();
			if ("window" === r.respondTo ? n = a : "slider" === r.respondTo ? n = d : "min" === r.respondTo && (n = Math.min(a, d)), r.options.responsive && r.options.responsive.length && null !== r.options.responsive) {
				s = null;
				for (o in r.breakpoints) r.breakpoints.hasOwnProperty(o) && (!1 === r.originalSettings.mobileFirst ? n < r.breakpoints[o] && (s = r.breakpoints[o]) : n > r.breakpoints[o] && (s = r.breakpoints[o]));
				null !== s ? null !== r.activeBreakpoint ? (s !== r.activeBreakpoint || t) && (r.activeBreakpoint =
					s, "unslick" === r.breakpointSettings[s] ? r.unslick(s) : (r.options = i.extend({}, r.originalSettings, r.breakpointSettings[s]), !0 === e && (r.currentSlide = r.options.initialSlide), r.refresh(e)), l = s) : (r.activeBreakpoint = s, "unslick" === r.breakpointSettings[s] ? r.unslick(s) : (r.options = i.extend({}, r.originalSettings, r.breakpointSettings[s]), !0 === e && (r.currentSlide = r.options.initialSlide), r.refresh(e)), l = s) : null !== r.activeBreakpoint && (r.activeBreakpoint = null, r.options = r.originalSettings, !0 === e && (r.currentSlide = r.options.initialSlide),
					r.refresh(e), l = s), e || !1 === l || r.$slider.trigger("breakpoint", [r, l])
			}
		}, e.prototype.changeSlide = function(e, t) {
			var o, s, n, r = this,
				l = i(e.currentTarget);
			switch (l.is("a") && e.preventDefault(), l.is("li") || (l = l.closest("li")), n = r.slideCount % r.options.slidesToScroll != 0, o = n ? 0 : (r.slideCount - r.currentSlide) % r.options.slidesToScroll, e.data.message) {
				case "previous":
					s = 0 === o ? r.options.slidesToScroll : r.options.slidesToShow - o, r.slideCount > r.options.slidesToShow && r.slideHandler(r.currentSlide - s, !1, t);
					break;
				case "next":
					s =
						0 === o ? r.options.slidesToScroll : o, r.slideCount > r.options.slidesToShow && r.slideHandler(r.currentSlide + s, !1, t);
					break;
				case "index":
					var d = 0 === e.data.index ? 0 : e.data.index || l.index() * r.options.slidesToScroll;
					r.slideHandler(r.checkNavigable(d), !1, t), l.children().trigger("focus");
					break;
				default:
					return
			}
		}, e.prototype.checkNavigable = function(i) {
			var e, t;
			if (e = this.getNavigableIndexes(), t = 0, i > e[e.length - 1]) i = e[e.length - 1];
			else
				for (var o in e) {
					if (i < e[o]) {
						i = t;
						break
					}
					t = e[o]
				}
			return i
		}, e.prototype.cleanUpEvents = function() {
			var e =
				this;
			e.options.dots && null !== e.$dots && (i("li", e.$dots).off("click.slick", e.changeSlide).off("mouseenter.slick", i.proxy(e.interrupt, e, !0)).off("mouseleave.slick", i.proxy(e.interrupt, e, !1)), !0 === e.options.accessibility && e.$dots.off("keydown.slick", e.keyHandler)), e.$slider.off("focus.slick blur.slick"), !0 === e.options.arrows && e.slideCount > e.options.slidesToShow && (e.$prevArrow && e.$prevArrow.off("click.slick", e.changeSlide), e.$nextArrow && e.$nextArrow.off("click.slick", e.changeSlide), !0 === e.options.accessibility &&
					(e.$prevArrow && e.$prevArrow.off("keydown.slick", e.keyHandler), e.$nextArrow && e.$nextArrow.off("keydown.slick", e.keyHandler))), e.$list.off("touchstart.slick mousedown.slick", e.swipeHandler), e.$list.off("touchmove.slick mousemove.slick", e.swipeHandler), e.$list.off("touchend.slick mouseup.slick", e.swipeHandler), e.$list.off("touchcancel.slick mouseleave.slick", e.swipeHandler), e.$list.off("click.slick", e.clickHandler), i(document).off(e.visibilityChange, e.visibility), e.cleanUpSlideEvents(), !0 === e.options.accessibility &&
				e.$list.off("keydown.slick", e.keyHandler), !0 === e.options.focusOnSelect && i(e.$slideTrack).children().off("click.slick", e.selectHandler), i(window).off("orientationchange.slick.slick-" + e.instanceUid, e.orientationChange), i(window).off("resize.slick.slick-" + e.instanceUid, e.resize), i("[draggable!=true]", e.$slideTrack).off("dragstart", e.preventDefault), i(window).off("load.slick.slick-" + e.instanceUid, e.setPosition)
		}, e.prototype.cleanUpSlideEvents = function() {
			var e = this;
			e.$list.off("mouseenter.slick", i.proxy(e.interrupt,
				e, !0)), e.$list.off("mouseleave.slick", i.proxy(e.interrupt, e, !1))
		}, e.prototype.cleanUpRows = function() {
			var i, e = this;
			e.options.rows > 1 && ((i = e.$slides.children().children()).removeAttr("style"), e.$slider.empty().append(i))
		}, e.prototype.clickHandler = function(i) {
			!1 === this.shouldClick && (i.stopImmediatePropagation(), i.stopPropagation(), i.preventDefault())
		}, e.prototype.destroy = function(e) {
			var t = this;
			t.autoPlayClear(), t.touchObject = {}, t.cleanUpEvents(), i(".slick-cloned", t.$slider).detach(), t.$dots && t.$dots.remove(),
				t.$prevArrow && t.$prevArrow.length && (t.$prevArrow.removeClass("slick-disabled slick-arrow slick-hidden").removeAttr("aria-hidden aria-disabled tabindex").css("display", ""), t.htmlExpr.test(t.options.prevArrow) && t.$prevArrow.remove()), t.$nextArrow && t.$nextArrow.length && (t.$nextArrow.removeClass("slick-disabled slick-arrow slick-hidden").removeAttr("aria-hidden aria-disabled tabindex").css("display", ""), t.htmlExpr.test(t.options.nextArrow) && t.$nextArrow.remove()), t.$slides && (t.$slides.removeClass("slick-slide slick-active slick-center slick-visible slick-current").removeAttr("aria-hidden").removeAttr("data-slick-index").each(function() {
					i(this).attr("style",
						i(this).data("originalStyling"))
				}), t.$slideTrack.children(this.options.slide).detach(), t.$slideTrack.detach(), t.$list.detach(), t.$slider.append(t.$slides)), t.cleanUpRows(), t.$slider.removeClass("slick-slider"), t.$slider.removeClass("slick-initialized"), t.$slider.removeClass("slick-dotted"), t.unslicked = !0, e || t.$slider.trigger("destroy", [t])
		}, e.prototype.disableTransition = function(i) {
			var e = this,
				t = {};
			t[e.transitionType] = "", !1 === e.options.fade ? e.$slideTrack.css(t) : e.$slides.eq(i).css(t)
		}, e.prototype.fadeSlide =
		function(i, e) {
			var t = this;
			!1 === t.cssTransitions ? (t.$slides.eq(i).css({
				zIndex: t.options.zIndex
			}), t.$slides.eq(i).animate({
				opacity: 1
			}, t.options.speed, t.options.easing, e)) : (t.applyTransition(i), t.$slides.eq(i).css({
				opacity: 1,
				zIndex: t.options.zIndex
			}), e && setTimeout(function() {
				t.disableTransition(i), e.call()
			}, t.options.speed))
		}, e.prototype.fadeSlideOut = function(i) {
			var e = this;
			!1 === e.cssTransitions ? e.$slides.eq(i).animate({
				opacity: 0,
				zIndex: e.options.zIndex - 2
			}, e.options.speed, e.options.easing) : (e.applyTransition(i),
				e.$slides.eq(i).css({
					opacity: 0,
					zIndex: e.options.zIndex - 2
				}))
		}, e.prototype.filterSlides = e.prototype.slickFilter = function(i) {
			var e = this;
			null !== i && (e.$slidesCache = e.$slides, e.unload(), e.$slideTrack.children(this.options.slide).detach(), e.$slidesCache.filter(i).appendTo(e.$slideTrack), e.reinit())
		}, e.prototype.focusHandler = function() {
			var e = this;
			e.$slider.off("focus.slick blur.slick").on("focus.slick blur.slick", "*", function(t) {
				t.stopImmediatePropagation();
				var o = i(this);
				setTimeout(function() {
					e.options.pauseOnFocus &&
						(e.focussed = o.is(":focus"), e.autoPlay())
				}, 0)
			})
		}, e.prototype.getCurrent = e.prototype.slickCurrentSlide = function() {
			return this.currentSlide
		}, e.prototype.getDotCount = function() {
			var i = this,
				e = 0,
				t = 0,
				o = 0;
			if (!0 === i.options.infinite)
				if (i.slideCount <= i.options.slidesToShow) ++o;
				else
					for (; e < i.slideCount;) ++o, e = t + i.options.slidesToScroll, t += i.options.slidesToScroll <= i.options.slidesToShow ? i.options.slidesToScroll : i.options.slidesToShow;
			else if (!0 === i.options.centerMode) o = i.slideCount;
			else if (i.options.asNavFor)
				for (; e <
					i.slideCount;) ++o, e = t + i.options.slidesToScroll, t += i.options.slidesToScroll <= i.options.slidesToShow ? i.options.slidesToScroll : i.options.slidesToShow;
			else o = 1 + Math.ceil((i.slideCount - i.options.slidesToShow) / i.options.slidesToScroll);
			return o - 1
		}, e.prototype.getLeft = function(i) {
			var e, t, o, s, n = this,
				r = 0;
			return n.slideOffset = 0, t = n.$slides.first().outerHeight(!0), !0 === n.options.infinite ? (n.slideCount > n.options.slidesToShow && (n.slideOffset = n.slideWidth * n.options.slidesToShow * -1, s = -1, !0 === n.options.vertical &&
					!0 === n.options.centerMode && (2 === n.options.slidesToShow ? s = -1.5 : 1 === n.options.slidesToShow && (s = -2)), r = t * n.options.slidesToShow * s), n.slideCount % n.options.slidesToScroll != 0 && i + n.options.slidesToScroll > n.slideCount && n.slideCount > n.options.slidesToShow && (i > n.slideCount ? (n.slideOffset = (n.options.slidesToShow - (i - n.slideCount)) * n.slideWidth * -1, r = (n.options.slidesToShow - (i - n.slideCount)) * t * -1) : (n.slideOffset = n.slideCount % n.options.slidesToScroll * n.slideWidth * -1, r = n.slideCount % n.options.slidesToScroll * t * -1))) :
				i + n.options.slidesToShow > n.slideCount && (n.slideOffset = (i + n.options.slidesToShow - n.slideCount) * n.slideWidth, r = (i + n.options.slidesToShow - n.slideCount) * t), n.slideCount <= n.options.slidesToShow && (n.slideOffset = 0, r = 0), !0 === n.options.centerMode && n.slideCount <= n.options.slidesToShow ? n.slideOffset = n.slideWidth * Math.floor(n.options.slidesToShow) / 2 - n.slideWidth * n.slideCount / 2 : !0 === n.options.centerMode && !0 === n.options.infinite ? n.slideOffset += n.slideWidth * Math.floor(n.options.slidesToShow / 2) - n.slideWidth : !0 ===
				n.options.centerMode && (n.slideOffset = 0, n.slideOffset += n.slideWidth * Math.floor(n.options.slidesToShow / 2)), e = !1 === n.options.vertical ? i * n.slideWidth * -1 + n.slideOffset : i * t * -1 + r, !0 === n.options.variableWidth && (o = n.slideCount <= n.options.slidesToShow || !1 === n.options.infinite ? n.$slideTrack.children(".slick-slide").eq(i) : n.$slideTrack.children(".slick-slide").eq(i + n.options.slidesToShow), e = !0 === n.options.rtl ? o[0] ? -1 * (n.$slideTrack.width() - o[0].offsetLeft - o.width()) : 0 : o[0] ? -1 * o[0].offsetLeft : 0, !0 === n.options.centerMode &&
					(o = n.slideCount <= n.options.slidesToShow || !1 === n.options.infinite ? n.$slideTrack.children(".slick-slide").eq(i) : n.$slideTrack.children(".slick-slide").eq(i + n.options.slidesToShow + 1), e = !0 === n.options.rtl ? o[0] ? -1 * (n.$slideTrack.width() - o[0].offsetLeft - o.width()) : 0 : o[0] ? -1 * o[0].offsetLeft : 0, e += (n.$list.width() - o.outerWidth()) / 2)), e
		}, e.prototype.getOption = e.prototype.slickGetOption = function(i) {
			return this.options[i]
		}, e.prototype.getNavigableIndexes = function() {
			var i, e = this,
				t = 0,
				o = 0,
				s = [];
			for (!1 === e.options.infinite ?
				i = e.slideCount : (t = -1 * e.options.slidesToScroll, o = -1 * e.options.slidesToScroll, i = 2 * e.slideCount); t < i;) s.push(t), t = o + e.options.slidesToScroll, o += e.options.slidesToScroll <= e.options.slidesToShow ? e.options.slidesToScroll : e.options.slidesToShow;
			return s
		}, e.prototype.getSlick = function() {
			return this
		}, e.prototype.getSlideCount = function() {
			var e, t, o = this;
			return t = !0 === o.options.centerMode ? o.slideWidth * Math.floor(o.options.slidesToShow / 2) : 0, !0 === o.options.swipeToSlide ? (o.$slideTrack.find(".slick-slide").each(function(s,
				n) {
				if (n.offsetLeft - t + i(n).outerWidth() / 2 > -1 * o.swipeLeft) return e = n, !1
			}), Math.abs(i(e).attr("data-slick-index") - o.currentSlide) || 1) : o.options.slidesToScroll
		}, e.prototype.goTo = e.prototype.slickGoTo = function(i, e) {
			this.changeSlide({
				data: {
					message: "index",
					index: parseInt(i)
				}
			}, e)
		}, e.prototype.init = function(e) {
			var t = this;
			i(t.$slider).hasClass("slick-initialized") || (i(t.$slider).addClass("slick-initialized"), t.buildRows(), t.buildOut(), t.setProps(), t.startLoad(), t.loadSlider(), t.initializeEvents(), t.updateArrows(),
				t.updateDots(), t.checkResponsive(!0), t.focusHandler()), e && t.$slider.trigger("init", [t]), !0 === t.options.accessibility && t.initADA(), t.options.autoplay && (t.paused = !1, t.autoPlay())
		}, e.prototype.initADA = function() {
			var e = this,
				t = Math.ceil(e.slideCount / e.options.slidesToShow),
				o = e.getNavigableIndexes().filter(function(i) {
					return i >= 0 && i < e.slideCount
				});
			e.$slides.add(e.$slideTrack.find(".slick-cloned")).attr({
					"aria-hidden": "true",
					tabindex: "-1"
				}).find("a, input, button, select").attr({
					tabindex: "-1"
				}), null !== e.$dots &&
				(e.$slides.not(e.$slideTrack.find(".slick-cloned")).each(function(t) {
					var s = o.indexOf(t);
					i(this).attr({
						role: "tabpanel",
						id: "slick-slide" + e.instanceUid + t,
						tabindex: -1
					}), -1 !== s && i(this).attr({
						"aria-describedby": "slick-slide-control" + e.instanceUid + s
					})
				}), e.$dots.attr("role", "tablist").find("li").each(function(s) {
					var n = o[s];
					i(this).attr({
						role: "presentation"
					}), i(this).find("button").first().attr({
						role: "tab",
						id: "slick-slide-control" + e.instanceUid + s,
						"aria-controls": "slick-slide" + e.instanceUid + n,
						"aria-label": s +
							1 + " of " + t,
						"aria-selected": null,
						tabindex: "-1"
					})
				}).eq(e.currentSlide).find("button").attr({
					"aria-selected": "true",
					tabindex: "0"
				}).end());
			for (var s = e.currentSlide, n = s + e.options.slidesToShow; s < n; s++) e.$slides.eq(s).attr("tabindex", 0);
			e.activateADA()
		}, e.prototype.initArrowEvents = function() {
			var i = this;
			!0 === i.options.arrows && i.slideCount > i.options.slidesToShow && (i.$prevArrow.off("click.slick").on("click.slick", {
				message: "previous"
			}, i.changeSlide), i.$nextArrow.off("click.slick").on("click.slick", {
					message: "next"
				},
				i.changeSlide), !0 === i.options.accessibility && (i.$prevArrow.on("keydown.slick", i.keyHandler), i.$nextArrow.on("keydown.slick", i.keyHandler)))
		}, e.prototype.initDotEvents = function() {
			var e = this;
			!0 === e.options.dots && (i("li", e.$dots).on("click.slick", {
				message: "index"
			}, e.changeSlide), !0 === e.options.accessibility && e.$dots.on("keydown.slick", e.keyHandler)), !0 === e.options.dots && !0 === e.options.pauseOnDotsHover && i("li", e.$dots).on("mouseenter.slick", i.proxy(e.interrupt, e, !0)).on("mouseleave.slick", i.proxy(e.interrupt,
				e, !1))
		}, e.prototype.initSlideEvents = function() {
			var e = this;
			e.options.pauseOnHover && (e.$list.on("mouseenter.slick", i.proxy(e.interrupt, e, !0)), e.$list.on("mouseleave.slick", i.proxy(e.interrupt, e, !1)))
		}, e.prototype.initializeEvents = function() {
			var e = this;
			e.initArrowEvents(), e.initDotEvents(), e.initSlideEvents(), e.$list.on("touchstart.slick mousedown.slick", {
				action: "start"
			}, e.swipeHandler), e.$list.on("touchmove.slick mousemove.slick", {
				action: "move"
			}, e.swipeHandler), e.$list.on("touchend.slick mouseup.slick", {
				action: "end"
			}, e.swipeHandler), e.$list.on("touchcancel.slick mouseleave.slick", {
				action: "end"
			}, e.swipeHandler), e.$list.on("click.slick", e.clickHandler), i(document).on(e.visibilityChange, i.proxy(e.visibility, e)), !0 === e.options.accessibility && e.$list.on("keydown.slick", e.keyHandler), !0 === e.options.focusOnSelect && i(e.$slideTrack).children().on("click.slick", e.selectHandler), i(window).on("orientationchange.slick.slick-" + e.instanceUid, i.proxy(e.orientationChange, e)), i(window).on("resize.slick.slick-" + e.instanceUid,
				i.proxy(e.resize, e)), i("[draggable!=true]", e.$slideTrack).on("dragstart", e.preventDefault), i(window).on("load.slick.slick-" + e.instanceUid, e.setPosition), i(e.setPosition)
		}, e.prototype.initUI = function() {
			var i = this;
			!0 === i.options.arrows && i.slideCount > i.options.slidesToShow && (i.$prevArrow.show(), i.$nextArrow.show()), !0 === i.options.dots && i.slideCount > i.options.slidesToShow && i.$dots.show()
		}, e.prototype.keyHandler = function(i) {
			var e = this;
			i.target.tagName.match("TEXTAREA|INPUT|SELECT") || (37 === i.keyCode && !0 ===
				e.options.accessibility ? e.changeSlide({
					data: {
						message: !0 === e.options.rtl ? "next" : "previous"
					}
				}) : 39 === i.keyCode && !0 === e.options.accessibility && e.changeSlide({
					data: {
						message: !0 === e.options.rtl ? "previous" : "next"
					}
				}))
		}, e.prototype.lazyLoad = function() {
			function e(e) {
				i("img[data-lazy]", e).each(function() {
					var e = i(this),
						t = i(this).attr("data-lazy"),
						o = i(this).attr("data-srcset"),
						s = i(this).attr("data-sizes") || n.$slider.attr("data-sizes"),
						r = document.createElement("img");
					r.onload = function() {
						e.animate({
								opacity: 0
							}, 100,
							function() {
								o && (e.attr("srcset", o), s && e.attr("sizes", s)), e.attr("src", t).animate({
									opacity: 1
								}, 200, function() {
									e.removeAttr("data-lazy data-srcset data-sizes").removeClass("slick-loading")
								}), n.$slider.trigger("lazyLoaded", [n, e, t])
							})
					}, r.onerror = function() {
						e.removeAttr("data-lazy").removeClass("slick-loading").addClass("slick-lazyload-error"), n.$slider.trigger("lazyLoadError", [n, e, t])
					}, r.src = t
				})
			}
			var t, o, s, n = this;
			if (!0 === n.options.centerMode ? !0 === n.options.infinite ? s = (o = n.currentSlide + (n.options.slidesToShow /
					2 + 1)) + n.options.slidesToShow + 2 : (o = Math.max(0, n.currentSlide - (n.options.slidesToShow / 2 + 1)), s = n.options.slidesToShow / 2 + 1 + 2 + n.currentSlide) : (o = n.options.infinite ? n.options.slidesToShow + n.currentSlide : n.currentSlide, s = Math.ceil(o + n.options.slidesToShow), !0 === n.options.fade && (o > 0 && o--, s <= n.slideCount && s++)), t = n.$slider.find(".slick-slide").slice(o, s), "anticipated" === n.options.lazyLoad)
				for (var r = o - 1, l = s, d = n.$slider.find(".slick-slide"), a = 0; a < n.options.slidesToScroll; a++) r < 0 && (r = n.slideCount - 1), t = (t = t.add(d.eq(r))).add(d.eq(l)),
					r--, l++;
			e(t), n.slideCount <= n.options.slidesToShow ? e(n.$slider.find(".slick-slide")) : n.currentSlide >= n.slideCount - n.options.slidesToShow ? e(n.$slider.find(".slick-cloned").slice(0, n.options.slidesToShow)) : 0 === n.currentSlide && e(n.$slider.find(".slick-cloned").slice(-1 * n.options.slidesToShow))
		}, e.prototype.loadSlider = function() {
			var i = this;
			i.setPosition(), i.$slideTrack.css({
				opacity: 1
			}), i.$slider.removeClass("slick-loading"), i.initUI(), "progressive" === i.options.lazyLoad && i.progressiveLazyLoad()
		}, e.prototype.next =
		e.prototype.slickNext = function() {
			this.changeSlide({
				data: {
					message: "next"
				}
			})
		}, e.prototype.orientationChange = function() {
			var i = this;
			i.checkResponsive(), i.setPosition()
		}, e.prototype.pause = e.prototype.slickPause = function() {
			var i = this;
			i.autoPlayClear(), i.paused = !0
		}, e.prototype.play = e.prototype.slickPlay = function() {
			var i = this;
			i.autoPlay(), i.options.autoplay = !0, i.paused = !1, i.focussed = !1, i.interrupted = !1
		}, e.prototype.postSlide = function(e) {
			var t = this;
			t.unslicked || (t.$slider.trigger("afterChange", [t, e]), t.animating = !1, t.slideCount > t.options.slidesToShow && t.setPosition(), t.swipeLeft = null, t.options.autoplay && t.autoPlay(), !0 === t.options.accessibility && (t.initADA(), t.options.focusOnChange && i(t.$slides.get(t.currentSlide)).attr("tabindex", 0).focus()))
		}, e.prototype.prev = e.prototype.slickPrev = function() {
			this.changeSlide({
				data: {
					message: "previous"
				}
			})
		}, e.prototype.preventDefault = function(i) {
			i.preventDefault()
		}, e.prototype.progressiveLazyLoad = function(e) {
			e = e || 1;
			var t, o, s, n, r, l = this,
				d = i("img[data-lazy]", l.$slider);
			d.length ?
				(t = d.first(), o = t.attr("data-lazy"), s = t.attr("data-srcset"), n = t.attr("data-sizes") || l.$slider.attr("data-sizes"), (r = document.createElement("img")).onload = function() {
					s && (t.attr("srcset", s), n && t.attr("sizes", n)), t.attr("src", o).removeAttr("data-lazy data-srcset data-sizes").removeClass("slick-loading"), !0 === l.options.adaptiveHeight && l.setPosition(), l.$slider.trigger("lazyLoaded", [l, t, o]), l.progressiveLazyLoad()
				}, r.onerror = function() {
					e < 3 ? setTimeout(function() {
						l.progressiveLazyLoad(e + 1)
					}, 500) : (t.removeAttr("data-lazy").removeClass("slick-loading").addClass("slick-lazyload-error"),
						l.$slider.trigger("lazyLoadError", [l, t, o]), l.progressiveLazyLoad())
				}, r.src = o) : l.$slider.trigger("allImagesLoaded", [l])
		}, e.prototype.refresh = function(e) {
			var t, o, s = this;
			o = s.slideCount - s.options.slidesToShow, !s.options.infinite && s.currentSlide > o && (s.currentSlide = o), s.slideCount <= s.options.slidesToShow && (s.currentSlide = 0), t = s.currentSlide, s.destroy(!0), i.extend(s, s.initials, {
				currentSlide: t
			}), s.init(), e || s.changeSlide({
				data: {
					message: "index",
					index: t
				}
			}, !1)
		}, e.prototype.registerBreakpoints = function() {
			var e,
				t, o, s = this,
				n = s.options.responsive || null;
			if ("array" === i.type(n) && n.length) {
				s.respondTo = s.options.respondTo || "window";
				for (e in n)
					if (o = s.breakpoints.length - 1, n.hasOwnProperty(e)) {
						for (t = n[e].breakpoint; o >= 0;) s.breakpoints[o] && s.breakpoints[o] === t && s.breakpoints.splice(o, 1), o--;
						s.breakpoints.push(t), s.breakpointSettings[t] = n[e].settings
					} s.breakpoints.sort(function(i, e) {
					return s.options.mobileFirst ? i - e : e - i
				})
			}
		}, e.prototype.reinit = function() {
			var e = this;
			e.$slides = e.$slideTrack.children(e.options.slide).addClass("slick-slide"),
				e.slideCount = e.$slides.length, e.currentSlide >= e.slideCount && 0 !== e.currentSlide && (e.currentSlide = e.currentSlide - e.options.slidesToScroll), e.slideCount <= e.options.slidesToShow && (e.currentSlide = 0), e.registerBreakpoints(), e.setProps(), e.setupInfinite(), e.buildArrows(), e.updateArrows(), e.initArrowEvents(), e.buildDots(), e.updateDots(), e.initDotEvents(), e.cleanUpSlideEvents(), e.initSlideEvents(), e.checkResponsive(!1, !0), !0 === e.options.focusOnSelect && i(e.$slideTrack).children().on("click.slick", e.selectHandler),
				e.setSlideClasses("number" == typeof e.currentSlide ? e.currentSlide : 0), e.setPosition(), e.focusHandler(), e.paused = !e.options.autoplay, e.autoPlay(), e.$slider.trigger("reInit", [e])
		}, e.prototype.resize = function() {
			var e = this;
			i(window).width() !== e.windowWidth && (clearTimeout(e.windowDelay), e.windowDelay = window.setTimeout(function() {
				e.windowWidth = i(window).width(), e.checkResponsive(), e.unslicked || e.setPosition()
			}, 50))
		}, e.prototype.removeSlide = e.prototype.slickRemove = function(i, e, t) {
			var o = this;
			if (i = "boolean" ==
				typeof i ? !0 === (e = i) ? 0 : o.slideCount - 1 : !0 === e ? --i : i, o.slideCount < 1 || i < 0 || i > o.slideCount - 1) return !1;
			o.unload(), !0 === t ? o.$slideTrack.children().remove() : o.$slideTrack.children(this.options.slide).eq(i).remove(), o.$slides = o.$slideTrack.children(this.options.slide), o.$slideTrack.children(this.options.slide).detach(), o.$slideTrack.append(o.$slides), o.$slidesCache = o.$slides, o.reinit()
		}, e.prototype.setCSS = function(i) {
			var e, t, o = this,
				s = {};
			!0 === o.options.rtl && (i = -i), e = "left" == o.positionProp ? Math.ceil(i) + "px" :
				"0px", t = "top" == o.positionProp ? Math.ceil(i) + "px" : "0px", s[o.positionProp] = i, !1 === o.transformsEnabled ? o.$slideTrack.css(s) : (s = {}, !1 === o.cssTransitions ? (s[o.animType] = "translate(" + e + ", " + t + ")", o.$slideTrack.css(s)) : (s[o.animType] = "translate3d(" + e + ", " + t + ", 0px)", o.$slideTrack.css(s)))
		}, e.prototype.setDimensions = function() {
			var i = this;
			!1 === i.options.vertical ? !0 === i.options.centerMode && i.$list.css({
				padding: "0px " + i.options.centerPadding
			}) : (i.$list.height(i.$slides.first().outerHeight(!0) * i.options.slidesToShow),
				!0 === i.options.centerMode && i.$list.css({
					padding: i.options.centerPadding + " 0px"
				})), i.listWidth = i.$list.width(), i.listHeight = i.$list.height(), !1 === i.options.vertical && !1 === i.options.variableWidth ? (i.slideWidth = Math.ceil(i.listWidth / i.options.slidesToShow), i.$slideTrack.width(Math.ceil(i.slideWidth * i.$slideTrack.children(".slick-slide").length))) : !0 === i.options.variableWidth ? i.$slideTrack.width(5E3 * i.slideCount) : (i.slideWidth = Math.ceil(i.listWidth), i.$slideTrack.height(Math.ceil(i.$slides.first().outerHeight(!0) *
				i.$slideTrack.children(".slick-slide").length)));
			var e = i.$slides.first().outerWidth(!0) - i.$slides.first().width();
			!1 === i.options.variableWidth && i.$slideTrack.children(".slick-slide").width(i.slideWidth - e)
		}, e.prototype.setFade = function() {
			var e, t = this;
			t.$slides.each(function(o, s) {
				e = t.slideWidth * o * -1, !0 === t.options.rtl ? i(s).css({
					position: "relative",
					right: e,
					top: 0,
					zIndex: t.options.zIndex - 2,
					opacity: 0
				}) : i(s).css({
					position: "relative",
					left: e,
					top: 0,
					zIndex: t.options.zIndex - 2,
					opacity: 0
				})
			}), t.$slides.eq(t.currentSlide).css({
				zIndex: t.options.zIndex -
					1,
				opacity: 1
			})
		}, e.prototype.setHeight = function() {
			var i = this;
			if (1 === i.options.slidesToShow && !0 === i.options.adaptiveHeight && !1 === i.options.vertical) {
				var e = i.$slides.eq(i.currentSlide).outerHeight(!0);
				i.$list.css("height", e)
			}
		}, e.prototype.setOption = e.prototype.slickSetOption = function() {
			var e, t, o, s, n, r = this,
				l = !1;
			if ("object" === i.type(arguments[0]) ? (o = arguments[0], l = arguments[1], n = "multiple") : "string" === i.type(arguments[0]) && (o = arguments[0], s = arguments[1], l = arguments[2], "responsive" === arguments[0] && "array" ===
					i.type(arguments[1]) ? n = "responsive" : void 0 !== arguments[1] && (n = "single")), "single" === n) r.options[o] = s;
			else if ("multiple" === n) i.each(o, function(i, e) {
				r.options[i] = e
			});
			else if ("responsive" === n)
				for (t in s)
					if ("array" !== i.type(r.options.responsive)) r.options.responsive = [s[t]];
					else {
						for (e = r.options.responsive.length - 1; e >= 0;) r.options.responsive[e].breakpoint === s[t].breakpoint && r.options.responsive.splice(e, 1), e--;
						r.options.responsive.push(s[t])
					} l && (r.unload(), r.reinit())
		}, e.prototype.setPosition = function() {
			var i =
				this;
			i.setDimensions(), i.setHeight(), !1 === i.options.fade ? i.setCSS(i.getLeft(i.currentSlide)) : i.setFade(), i.$slider.trigger("setPosition", [i])
		}, e.prototype.setProps = function() {
			var i = this,
				e = document.body.style;
			i.positionProp = !0 === i.options.vertical ? "top" : "left", "top" === i.positionProp ? i.$slider.addClass("slick-vertical") : i.$slider.removeClass("slick-vertical"), void 0 === e.WebkitTransition && void 0 === e.MozTransition && void 0 === e.msTransition || !0 === i.options.useCSS && (i.cssTransitions = !0), i.options.fade &&
				("number" == typeof i.options.zIndex ? i.options.zIndex < 3 && (i.options.zIndex = 3) : i.options.zIndex = i.defaults.zIndex), void 0 !== e.OTransform && (i.animType = "OTransform", i.transformType = "-o-transform", i.transitionType = "OTransition", void 0 === e.perspectiveProperty && void 0 === e.webkitPerspective && (i.animType = !1)), void 0 !== e.MozTransform && (i.animType = "MozTransform", i.transformType = "-moz-transform", i.transitionType = "MozTransition", void 0 === e.perspectiveProperty && void 0 === e.MozPerspective && (i.animType = !1)), void 0 !==
				e.webkitTransform && (i.animType = "webkitTransform", i.transformType = "-webkit-transform", i.transitionType = "webkitTransition", void 0 === e.perspectiveProperty && void 0 === e.webkitPerspective && (i.animType = !1)), void 0 !== e.msTransform && (i.animType = "msTransform", i.transformType = "-ms-transform", i.transitionType = "msTransition", void 0 === e.msTransform && (i.animType = !1)), void 0 !== e.transform && !1 !== i.animType && (i.animType = "transform", i.transformType = "transform", i.transitionType = "transition"), i.transformsEnabled = i.options.useTransform &&
				null !== i.animType && !1 !== i.animType
		}, e.prototype.setSlideClasses = function(i) {
			var e, t, o, s, n = this;
			if (t = n.$slider.find(".slick-slide").removeClass("slick-active slick-center slick-current").attr("aria-hidden", "true"), n.$slides.eq(i).addClass("slick-current"), !0 === n.options.centerMode) {
				var r = n.options.slidesToShow % 2 == 0 ? 1 : 0;
				e = Math.floor(n.options.slidesToShow / 2), !0 === n.options.infinite && (i >= e && i <= n.slideCount - 1 - e ? n.$slides.slice(i - e + r, i + e + 1).addClass("slick-active").attr("aria-hidden", "false") : (o = n.options.slidesToShow +
					i, t.slice(o - e + 1 + r, o + e + 2).addClass("slick-active").attr("aria-hidden", "false")), 0 === i ? t.eq(t.length - 1 - n.options.slidesToShow).addClass("slick-center") : i === n.slideCount - 1 && t.eq(n.options.slidesToShow).addClass("slick-center")), n.$slides.eq(i).addClass("slick-center")
			} else i >= 0 && i <= n.slideCount - n.options.slidesToShow ? n.$slides.slice(i, i + n.options.slidesToShow).addClass("slick-active").attr("aria-hidden", "false") : t.length <= n.options.slidesToShow ? t.addClass("slick-active").attr("aria-hidden", "false") :
				(s = n.slideCount % n.options.slidesToShow, o = !0 === n.options.infinite ? n.options.slidesToShow + i : i, n.options.slidesToShow == n.options.slidesToScroll && n.slideCount - i < n.options.slidesToShow ? t.slice(o - (n.options.slidesToShow - s), o + s).addClass("slick-active").attr("aria-hidden", "false") : t.slice(o, o + n.options.slidesToShow).addClass("slick-active").attr("aria-hidden", "false"));
			"ondemand" !== n.options.lazyLoad && "anticipated" !== n.options.lazyLoad || n.lazyLoad()
		}, e.prototype.setupInfinite = function() {
			var e, t, o, s = this;
			if (!0 === s.options.fade && (s.options.centerMode = !1), !0 === s.options.infinite && !1 === s.options.fade && (t = null, s.slideCount > s.options.slidesToShow)) {
				for (o = !0 === s.options.centerMode ? s.options.slidesToShow + 1 : s.options.slidesToShow, e = s.slideCount; e > s.slideCount - o; e -= 1) t = e - 1, i(s.$slides[t]).clone(!0).attr("id", "").attr("data-slick-index", t - s.slideCount).prependTo(s.$slideTrack).addClass("slick-cloned");
				for (e = 0; e < o + s.slideCount; e += 1) t = e, i(s.$slides[t]).clone(!0).attr("id", "").attr("data-slick-index", t + s.slideCount).appendTo(s.$slideTrack).addClass("slick-cloned");
				s.$slideTrack.find(".slick-cloned").find("[id]").each(function() {
					i(this).attr("id", "")
				})
			}
		}, e.prototype.interrupt = function(i) {
			var e = this;
			i || e.autoPlay(), e.interrupted = i
		}, e.prototype.selectHandler = function(e) {
			var t = this,
				o = i(e.target).is(".slick-slide") ? i(e.target) : i(e.target).parents(".slick-slide"),
				s = parseInt(o.attr("data-slick-index"));
			s || (s = 0), t.slideCount <= t.options.slidesToShow ? t.slideHandler(s, !1, !0) : t.slideHandler(s)
		}, e.prototype.slideHandler = function(i, e, t) {
			var o, s, n, r, l, d = null,
				a = this;
			if (e =
				e || !1, !(!0 === a.animating && !0 === a.options.waitForAnimate || !0 === a.options.fade && a.currentSlide === i))
				if (!1 === e && a.asNavFor(i), o = i, d = a.getLeft(o), r = a.getLeft(a.currentSlide), a.currentLeft = null === a.swipeLeft ? r : a.swipeLeft, !1 === a.options.infinite && !1 === a.options.centerMode && (i < 0 || i > a.getDotCount() * a.options.slidesToScroll)) !1 === a.options.fade && (o = a.currentSlide, !0 !== t ? a.animateSlide(r, function() {
					a.postSlide(o)
				}) : a.postSlide(o));
				else if (!1 === a.options.infinite && !0 === a.options.centerMode && (i < 0 || i > a.slideCount -
					a.options.slidesToScroll)) !1 === a.options.fade && (o = a.currentSlide, !0 !== t ? a.animateSlide(r, function() {
				a.postSlide(o)
			}) : a.postSlide(o));
			else {
				if (a.options.autoplay && clearInterval(a.autoPlayTimer), s = o < 0 ? a.slideCount % a.options.slidesToScroll != 0 ? a.slideCount - a.slideCount % a.options.slidesToScroll : a.slideCount + o : o >= a.slideCount ? a.slideCount % a.options.slidesToScroll != 0 ? 0 : o - a.slideCount : o, a.animating = !0, a.$slider.trigger("beforeChange", [a, a.currentSlide, s]), n = a.currentSlide, a.currentSlide = s, a.setSlideClasses(a.currentSlide),
					a.options.asNavFor && (l = (l = a.getNavTarget()).slick("getSlick")).slideCount <= l.options.slidesToShow && l.setSlideClasses(a.currentSlide), a.updateDots(), a.updateArrows(), !0 === a.options.fade) return !0 !== t ? (a.fadeSlideOut(n), a.fadeSlide(s, function() {
					a.postSlide(s)
				})) : a.postSlide(s), void a.animateHeight();
				!0 !== t ? a.animateSlide(d, function() {
					a.postSlide(s)
				}) : a.postSlide(s)
			}
		}, e.prototype.startLoad = function() {
			var i = this;
			!0 === i.options.arrows && i.slideCount > i.options.slidesToShow && (i.$prevArrow.hide(), i.$nextArrow.hide()),
				!0 === i.options.dots && i.slideCount > i.options.slidesToShow && i.$dots.hide(), i.$slider.addClass("slick-loading")
		}, e.prototype.swipeDirection = function() {
			var i, e, t, o, s = this;
			return i = s.touchObject.startX - s.touchObject.curX, e = s.touchObject.startY - s.touchObject.curY, t = Math.atan2(e, i), (o = Math.round(180 * t / Math.PI)) < 0 && (o = 360 - Math.abs(o)), o <= 45 && o >= 0 ? !1 === s.options.rtl ? "left" : "right" : o <= 360 && o >= 315 ? !1 === s.options.rtl ? "left" : "right" : o >= 135 && o <= 225 ? !1 === s.options.rtl ? "right" : "left" : !0 === s.options.verticalSwiping ?
				o >= 35 && o <= 135 ? "down" : "up" : "vertical"
		}, e.prototype.swipeEnd = function(i) {
			var e, t, o = this;
			if (o.dragging = !1, o.swiping = !1, o.scrolling) return o.scrolling = !1, !1;
			if (o.interrupted = !1, o.shouldClick = !(o.touchObject.swipeLength > 10), void 0 === o.touchObject.curX) return !1;
			if (!0 === o.touchObject.edgeHit && o.$slider.trigger("edge", [o, o.swipeDirection()]), o.touchObject.swipeLength >= o.touchObject.minSwipe) {
				switch (t = o.swipeDirection()) {
					case "left":
					case "down":
						e = o.options.swipeToSlide ? o.checkNavigable(o.currentSlide + o.getSlideCount()) :
							o.currentSlide + o.getSlideCount(), o.currentDirection = 0;
						break;
					case "right":
					case "up":
						e = o.options.swipeToSlide ? o.checkNavigable(o.currentSlide - o.getSlideCount()) : o.currentSlide - o.getSlideCount(), o.currentDirection = 1
				}
				"vertical" != t && (o.slideHandler(e), o.touchObject = {}, o.$slider.trigger("swipe", [o, t]))
			} else o.touchObject.startX !== o.touchObject.curX && (o.slideHandler(o.currentSlide), o.touchObject = {})
		}, e.prototype.swipeHandler = function(i) {
			var e = this;
			if (!(!1 === e.options.swipe || "ontouchend" in document && !1 ===
					e.options.swipe || !1 === e.options.draggable && -1 !== i.type.indexOf("mouse"))) switch (e.touchObject.fingerCount = i.originalEvent && void 0 !== i.originalEvent.touches ? i.originalEvent.touches.length : 1, e.touchObject.minSwipe = e.listWidth / e.options.touchThreshold, !0 === e.options.verticalSwiping && (e.touchObject.minSwipe = e.listHeight / e.options.touchThreshold), i.data.action) {
				case "start":
					e.swipeStart(i);
					break;
				case "move":
					e.swipeMove(i);
					break;
				case "end":
					e.swipeEnd(i)
			}
		}, e.prototype.swipeMove = function(i) {
			var e, t, o, s, n,
				r, l = this;
			return n = void 0 !== i.originalEvent ? i.originalEvent.touches : null, !(!l.dragging || l.scrolling || n && 1 !== n.length) && (e = l.getLeft(l.currentSlide), l.touchObject.curX = void 0 !== n ? n[0].pageX : i.clientX, l.touchObject.curY = void 0 !== n ? n[0].pageY : i.clientY, l.touchObject.swipeLength = Math.round(Math.sqrt(Math.pow(l.touchObject.curX - l.touchObject.startX, 2))), r = Math.round(Math.sqrt(Math.pow(l.touchObject.curY - l.touchObject.startY, 2))), !l.options.verticalSwiping && !l.swiping && r > 4 ? (l.scrolling = !0, !1) : (!0 === l.options.verticalSwiping &&
				(l.touchObject.swipeLength = r), t = l.swipeDirection(), void 0 !== i.originalEvent && l.touchObject.swipeLength > 4 && (l.swiping = !0, i.preventDefault()), s = (!1 === l.options.rtl ? 1 : -1) * (l.touchObject.curX > l.touchObject.startX ? 1 : -1), !0 === l.options.verticalSwiping && (s = l.touchObject.curY > l.touchObject.startY ? 1 : -1), o = l.touchObject.swipeLength, l.touchObject.edgeHit = !1, !1 === l.options.infinite && (0 === l.currentSlide && "right" === t || l.currentSlide >= l.getDotCount() && "left" === t) && (o = l.touchObject.swipeLength * l.options.edgeFriction,
					l.touchObject.edgeHit = !0), !1 === l.options.vertical ? l.swipeLeft = e + o * s : l.swipeLeft = e + o * (l.$list.height() / l.listWidth) * s, !0 === l.options.verticalSwiping && (l.swipeLeft = e + o * s), !0 !== l.options.fade && !1 !== l.options.touchMove && (!0 === l.animating ? (l.swipeLeft = null, !1) : void l.setCSS(l.swipeLeft))))
		}, e.prototype.swipeStart = function(i) {
			var e, t = this;
			if (t.interrupted = !0, 1 !== t.touchObject.fingerCount || t.slideCount <= t.options.slidesToShow) return t.touchObject = {}, !1;
			void 0 !== i.originalEvent && void 0 !== i.originalEvent.touches &&
				(e = i.originalEvent.touches[0]), t.touchObject.startX = t.touchObject.curX = void 0 !== e ? e.pageX : i.clientX, t.touchObject.startY = t.touchObject.curY = void 0 !== e ? e.pageY : i.clientY, t.dragging = !0
		}, e.prototype.unfilterSlides = e.prototype.slickUnfilter = function() {
			var i = this;
			null !== i.$slidesCache && (i.unload(), i.$slideTrack.children(this.options.slide).detach(), i.$slidesCache.appendTo(i.$slideTrack), i.reinit())
		}, e.prototype.unload = function() {
			var e = this;
			i(".slick-cloned", e.$slider).remove(), e.$dots && e.$dots.remove(),
				e.$prevArrow && e.htmlExpr.test(e.options.prevArrow) && e.$prevArrow.remove(), e.$nextArrow && e.htmlExpr.test(e.options.nextArrow) && e.$nextArrow.remove(), e.$slides.removeClass("slick-slide slick-active slick-visible slick-current").attr("aria-hidden", "true").css("width", "")
		}, e.prototype.unslick = function(i) {
			var e = this;
			e.$slider.trigger("unslick", [e, i]), e.destroy()
		}, e.prototype.updateArrows = function() {
			var i = this;
			Math.floor(i.options.slidesToShow / 2), !0 === i.options.arrows && i.slideCount > i.options.slidesToShow &&
				!i.options.infinite && (i.$prevArrow.removeClass("slick-disabled").attr("aria-disabled", "false"), i.$nextArrow.removeClass("slick-disabled").attr("aria-disabled", "false"), 0 === i.currentSlide ? (i.$prevArrow.addClass("slick-disabled").attr("aria-disabled", "true"), i.$nextArrow.removeClass("slick-disabled").attr("aria-disabled", "false")) : i.currentSlide >= i.slideCount - i.options.slidesToShow && !1 === i.options.centerMode ? (i.$nextArrow.addClass("slick-disabled").attr("aria-disabled", "true"), i.$prevArrow.removeClass("slick-disabled").attr("aria-disabled",
					"false")) : i.currentSlide >= i.slideCount - 1 && !0 === i.options.centerMode && (i.$nextArrow.addClass("slick-disabled").attr("aria-disabled", "true"), i.$prevArrow.removeClass("slick-disabled").attr("aria-disabled", "false")))
		}, e.prototype.updateDots = function() {
			var i = this;
			null !== i.$dots && (i.$dots.find("li").removeClass("slick-active").end(), i.$dots.find("li").eq(Math.floor(i.currentSlide / i.options.slidesToScroll)).addClass("slick-active"))
		}, e.prototype.visibility = function() {
			var i = this;
			i.options.autoplay && (document[i.hidden] ?
				i.interrupted = !0 : i.interrupted = !1)
		}, i.fn.slick = function() {
			var i, t, o = this,
				s = arguments[0],
				n = Array.prototype.slice.call(arguments, 1),
				r = o.length;
			for (i = 0; i < r; i++)
				if ("object" == typeof s || void 0 === s ? o[i].slick = new e(o[i], s) : t = o[i].slick[s].apply(o[i].slick, n), void 0 !== t) return t;
			return o
		}
});
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