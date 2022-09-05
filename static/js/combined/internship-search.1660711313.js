var check_notification_flag = true;
$(document).ready(function() {
	if (typeof notification_id !== "undefined" && notification_id != "") {
		var top = ($("#notificaton_" + notification_id).offset() || {
			"top": NaN
		}).top;
		if (!isNaN(top)) {
			var reference_top = $("#notificaton_" + notification_id).offset().top;
			$("html, body").animate({
				scrollTop: reference_top
			}, 1E3);
			if (save_notification) store_notification(notification_id)
		}
	}
	$(document).on("click", "b.dashboard_notification", function() {
		if (notification_id == 5) check_notification_flag = false;
		$("#notification").html(notification_message);
		if (check_notification_flag) store_notification(notification_id);
		$("#notification").slideToggle("slow", function() {
			if ($(this).is(":visible")) $("b.dashboard_notification").html(" Hide");
			else $("b.dashboard_notification").html(" Know more")
		})
	});
	if (typeof to_show_filters_matching_preferences_notification != "undefined" && to_show_filters_matching_preferences_notification)
		if (typeof searchUIType != "undefined" && searchUIType == "new") show_filters_matching_preferences_notification_new_ui();
		else show_filters_matching_preferences_notification();
	$(document).on("click", "#filters_matching_preferences_notification_close_button", function() {
		insert_filters_matching_preferences_notification()
	});
	$(document).on("click", "#feedback_notification_close_button", function() {
		insert_application_feedback_dashboard_notification()
	})
});

function store_notification(notification_id) {
	var data = {
		"notification_id": notification_id
	};
	var url = "/student/check_notification";
	$.ajax(url, {
		data: data,
		success: store_notification_success,
		error: onError,
		type: "POST"
	})
}
var store_notification_success = function(data) {
	try {
		NProgress.done();
		if (!data.success) throw_semi_error(data.errorThrown);
		else check_notification_flag = false
	} catch (e) {
		throw_error(e);
		NProgress.done()
	}
};
var show_filters_matching_preferences_notification = function() {
	$("#filters").popover({
		html: "true",
		trigger: "manual"
	}).popover("show");
	$("#matching_preference").attr("disabled", true);
	$("#matching_checkbox_preferences_link").click(function() {
		return false
	});
	$("#matching_checkbox_preferences_link").css("cursor", "default");
	$("#preferences_checkbox_container_for_highlight").css("z-index", "1200");
	$(".popover_overlay").show()
};

function insert_filters_matching_preferences_notification() {
	var data = new Array;
	var url = "/student/insert_notification_by_name/matching_preference_notification";
	$.ajax(url, {
		data: data,
		success: insert_filters_matching_preferences_notification_success,
		error: onError,
		type: "POST"
	})
}
var insert_filters_matching_preferences_notification_success = function(data) {
	try {
		if (!data.success) throw_error(data.errorThrown, "/internships/");
		else {
			$("#filters").popover("hide");
			$("#preferences_checkbox_container_for_highlight").popover("hide");
			$(".filterUi").popover("hide");
			$(".popover_overlay").hide();
			$("#matching_preference").attr("disabled", false);
			$("#matching_checkbox_preferences_link").unbind("click");
			$("#matching_checkbox_preferences_link").css("cursor", "pointer");
			$("#preferences_checkbox_container_for_highlight").css("z-index",
				"0");
			to_show_filters_matching_preferences_notification = false
		}
	} catch (e) {
		throw_error(e)
	}
};

function insert_application_feedback_dashboard_notification() {
	var data = new Array;
	var url = "/student/insert_notification_by_name/student_application_feedback_dashboard_notification";
	$.ajax(url, {
		data: data,
		success: insert_application_feedback_dashboard_notification_success,
		error: onError,
		type: "POST"
	})
}
var insert_application_feedback_dashboard_notification_success = function(data) {
	try {
		if (!data.success) throw_error(data.errorThrown, "/student/dashboard/");
		else {
			$("#feedbackPopoverDiv").hide();
			$(".popover_overlay").hide();
			$("#feedback_popover_container_for_highlight").css("z-index", "0");
			$("#feedbackPopOver").css("background-color", "inherit");
			$("#feedbackPopOver").css("box-shadow", "none");
			$("#feedbackPopOver").css("padding", "0");
			$("#feedbackPopOver").find("a").attr("disabled", false);
			toShowApplicationFeedbackNotificationPopOver =
				0
		}
	} catch (e) {
		throw_error(e)
	}
};
var user_email_input = "";
$(document).ready(function() {
	user_email_input = $("#email").val();
	subscription_form_validate();
	$(".email-field-subscribe").keyup(function() {
		var user_email_input_update = $("#subscribe-form").find("#email").val();
		if (user_email_input !== user_email_input_update) {
			user_email_input = user_email_input_update;
			prompt_for_correct_email("subscribe-form", "email")
		}
	});
	$(".email-field-subscribe-marketing-right").keyup(function() {
		var user_email_input_update = $("#subscribe-form").find("#email").val();
		if (user_email_input !==
			user_email_input_update) {
			user_email_input = user_email_input_update;
			prompt_for_correct_email("subscribe-form", "email")
		}
	});
	$(".subscribe-form-at-bottom-email").keyup(function() {
		var user_email_input_update = $("#subscribe-form-at-bottom").find("#email").val();
		if (user_email_input !== user_email_input_update) {
			user_email_input = user_email_input_update;
			prompt_for_correct_email("subscribe-form-at-bottom", "email")
		}
	})
});

function subscription_form_validate() {
	$("#subscribe-form").validate({
		onfocusout: function(element) {
			this.element(element)
		},
		rules: {
			email: {
				required: true,
				email: true
			}
		},
		errorPlacement: function(label, element) {
			if (element.attr("name") === "email") label.insertAfter(element.closest(".input-group"));
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
			var currentUrl = window.location.href;
			$("#src_url").val(currentUrl);
			var data = $("#subscribe-form").serialize();
			var url = "/subscribe/submit";
			NProgress.start();
			$(".loading_image").show();
			$.ajax(url, {
				data: data,
				success: subscription_success,
				error: onError,
				type: "POST"
			});
			return false
		}
	});
	$("#subscribe-form-popup").validate({
		rules: {
			email: {
				required: true,
				email: true
			}
		},
		errorPlacement: function(label, element) {
			if (element.attr("name") === "email") label.insertAfter(element.closest(".input-group"));
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
			var data = $("#subscribe-form-popup").serialize() + "&current_url=" + window.location.href;
			var url = "/subscribe/submit";
			NProgress.start();
			$(".loading_image").show();
			$.ajax(url, {
				data: data,
				success: subscription_success,
				error: onError,
				type: "POST"
			})
		}
	});
	$("#subscribe-form-popup-blog").validate({
		rules: {
			email: {
				required: true,
				email: true
			}
		},
		errorPlacement: function(label, element) {
			if (element.attr("name") === "email") label.insertAfter("#but_subscription_popup_form");
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
			var data = $("#subscribe-form-popup").serialize() + "&current_url=" + window.location.href;
			var url = "/subscribe/submit";
			NProgress.start();
			$(".loading_image").show();
			$.ajax(url, {
				data: data,
				success: subscription_success,
				error: onError,
				type: "POST"
			});
			return false
		}
	});
	$("#subscribe-form-at-bottom").validate({
		onfocusout: function(element) {
			this.element(element)
		},
		rules: {
			email: {
				required: true,
				email: true
			}
		},
		errorPlacement: function(label, element) {
			label.insertAfter(element)
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
			var data = $("#subscribe-form-at-bottom").serialize();
			var url = "/subscribe/submit";
			NProgress.start();
			$(".loading_image").show();
			$.ajax(url, {
				data: data,
				success: subscription_success,
				error: onError,
				type: "POST"
			});
			return false
		}
	})
}
var subscription_success = function(data) {
	try {
		NProgress.done();
		$(".subscription_alert").hide();
		$(".modal-backdrop").hide();
		$("input[name='email']").val("");
		$(".backdrop").hide();
		if (data.subscriptionLocation == "subscription_popup_blog") {
			$(".blog_subscription_alert").hide();
			if (!data.success) parent.postMessage({
				blog: "resizePopup",
				status: "error"
			}, "*");
			else parent.postMessage({
				blog: "resizePopup",
				status: "success"
			}, "*");
			$(".modal").css("padding-left", "0px");
			$(".modal").css("padding-right", "0px");
			$(".modal-dialog").css("margin",
				"0px 0px")
		}
		if (!data.success) throw_error(data.errorThrown);
		else throw_success(data.successMsg);
		if (data.subscriptionLocation == "subscription_popup_blog") $(".modal").css("padding-right", "0px")
	} catch (e) {
		throw_error(e);
		NProgress.done();
		$(".loading_image").hide()
	}
};

function throw_success_blog(successMsg) {
	$(".semi_success_modal_blog .text-message").html(successMsg);
	$(".semi_success_modal_blog").show()
}

function throw_error_blog(errorThrown) {
	if (errorThrown.validationError) {
		throw_validation_error(errorThrown.validationError);
		return
	}
	$(".semi_error_modal_blog .text-message").html(errorThrown);
	$(".semi_error_modal_blog").show()
};
var is_ds_jos_ad_tracked = false;
var is_dm_jos_ad_tracked = false;
var is_hrm_jos_ad_tracked = false;
var is_fsw_jos_ad_tracked = false;
var is_native_ad_tracked_jobs = false;
$(document).ready(function() {
	add_trailing_slash();
	visible_pinned_internships();
	$(window).on("scroll", function() {
		visible_pinned_internships()
	});
	if (typeof is_slider_banner_preview != "undefined" && is_slider_banner_preview) preview_notification("<strong>Admin Note:</strong> You are in preview mode. <a id='admin_exit_preview_button'>Click here to exit preview.</a>");
	if (typeof is_jobs_found !== "undefined" && !is_jobs_found && typeof current_url !== "undefined") {
		dataLayer.push({
			"event": "search_page_no_result_event",
			"eventCategoryNoResult": "search_page_no_result",
			"eventActionNoResult": "view",
			"eventLabelNoResult": current_url
		});
		dataLayer.push({
			"event": "search_page_no_result",
			"view": current_url
		})
	}
	window.onscroll = function() {
		search_filter_scroll()
	};
	popovers();
	$(document).on("click", ".internship_for_women_button", function() {
		goToByScroll("internships_list_container")
	});
	$(document).on("click", "#select_category_chosen", function f() {
		$("#select_category_chosen .chosen-choices .search-field .chosen-search-input").focus()
	});
	$(document).on("click", "#city_sidebar_chosen", function f() {
		$("#city_sidebar_chosen .chosen-choices .search-field .chosen-search-input").focus()
	});
	$(document).on("click", ".view_detail_button", function(e) {
		var url = $(this).attr("href");
		if (typeof url !== "undefined") {
			e.preventDefault();
			if (window.innerWidth > 991) window.open(url, "_blank");
			else window.open(url, "_self")
		}
	});
	keyword_popovers();
	$(document).on("click", "#faqs_button_search", function(e) {
		e.preventDefault();
		if ($("#faq_generic").is(":visible")) {
			$("#faq_generic").slideUp();
			$("#faq_button_icon").removeClass("ic-16-s15-chevron-up").addClass("ic-16-s15-chevron-down")
		} else $("#faq_generic").slideDown(function() {
			goToByScroll("faq_generic");
			$("#faq_button_icon").removeClass("ic-16-s15-chevron-down").addClass("ic-16-s15-chevron-up")
		})
	});
	$(document).on("click", ".save-as-alert-cta", function(e) {
		e.preventDefault();
		set_cookie("is_from_save_as_alert", 1, 1, "/");
		var url = $(".save-as-alert-cta").attr("href");
		if (url) window.location.href = url;
		else $("#login-modal").modal()
	});
	if (typeof save_as_alert_toast_msg !=
		"undefined" && save_as_alert_toast_msg) setTimeout(function() {
		return general_toast(save_as_alert_toast_msg)
	}, 1E3)
});

function enable_save_search_as_alert_cta(type) {
	if (type === "job")
		if (window.innerWidth >= 992) {
			var url$0 = compute_desktop_search_url_for_wfh_filters_for_job_ajax();
			if (url$0.includes("-jobs") || url$0.includes("-in-") || url$0.includes("remote_jobs") || url$0.includes("internships")) {
				$("#save_as_alert").css("display", "flex");
				$("#save_as_alert_mobile").css("display", "flex");
				return
			}
		} else {
			if (filters_applied["category"].length || filters_applied["city"].length || filters_applied["remote_job"].length || filters_applied["remote_job"].length ||
				filters_applied["internship_checkbox"].length) {
				$("#save_as_alert").css("display", "flex");
				$("#save_as_alert_mobile").css("display", "flex");
				return
			}
		}
	else if (type === "internship")
		if (window.innerWidth >= 992) {
			var url$1 = window.location.href;
			if (url$1.includes("-internship") || url$1.includes("-in-") || url$1.includes("work-from-home")) {
				$("#save_as_alert").css("display", "flex");
				$("#save_as_alert_mobile").css("display", "flex");
				return
			}
		} else if (filters_applied["category"].length || filters_applied["city"].length || filters_applied["wfh"].length) {
		$("#save_as_alert").css("display",
			"flex");
		$("#save_as_alert_mobile").css("display", "flex");
		return
	}
	$("#save_as_alert").css("display", "none");
	$("#save_as_alert_mobile").css("display", "none")
}

function keyword_popovers() {
	$(".pop-mobile").popover({
		placement: "top",
		trigger: "focus",
		html: true,
		template: '<div class="popover keyword-search-mobile"><div class="arrow"></div><div class="popover-inner"><div class="popover-body"><p></p></div></div></div>',
		container: "#mobile_filters_container",
		sanitize: false,
		boundary: "viewport",
		content: "<div style='width: 221px;'>Search by category, location or company name.</div>"
	});
	$("body").popover({
		placement: "top",
		trigger: "focus",
		html: true,
		template: '<div class="popover keyword_popover_internship"><div class="arrow"></div><div class="popover-inner"><div class="popover-body"><p></p></div></div></div>',
		container: "#keyword_search_form",
		sanitize: false,
		boundary: "viewport",
		content: "<div style='width: 221px;'>Search by category, location or company name.</div>",
		selector: ".pop-internship"
	});
	$("#search_criteria_container").popover({
		placement: "top",
		trigger: "focus",
		html: true,
		template: '<div class="popover keyword_popover_job"><div class="arrow"></div><div class="popover-inner"><div class="popover-body"><p></p></div></div></div>',
		container: "#filters",
		sanitize: false,
		boundary: "viewport",
		content: "<div style='width: 221px;'>Search by category, location or company name.</div>",
		selector: ".pop-job"
	})
}

function chosen_initialization() {
	$("#select_category_chosen_temp").hide();
	$("#city_sidebar_chosen_temp").hide();
	$("#select_duration_chosen_temp").hide();
	$("#stipend_filter_mobile_chosen_temp").hide();
	$(".default-chosen").chosen({
		disable_search_threshold: 10
	});
	$("#select_duration").chosen({
		disable_search_threshold: 10,
		max_selected_options: 1
	});
	$("#select_duration_mobile").chosen({
		disable_search_threshold: 10,
		max_selected_options: 1
	});
	$("#stipend_filter_mobile").chosen({
		disable_search_threshold: 10,
		max_selected_options: 1
	})
}
var seo_heading = function() {
	if (from_campaign()) return;
	$("#search_criteria_mobile_container #content_open_button").click(function() {
		if ($(this).hasClass("active")) {
			$(this).removeClass("active");
			$("#search_criteria_mobile_container #open_content_collapse").slideUp();
			$("#search_criteria_mobile_container #content_open_button").removeClass("ic-16-chevron-up").addClass("ic-16-chevron-down")
		} else {
			$(this).addClass("active");
			$("#search_criteria_mobile_container #open_content_collapse").slideDown();
			$("#search_criteria_mobile_container #content_open_button").removeClass("ic-16-chevron-down").addClass("ic-16-chevron-up")
		}
	});
	$(".internship_seo_heading_container_desktop #content_open_button").click(function() {
		if ($(this).hasClass("active")) {
			$(this).removeClass("active");
			$(".internship_seo_heading_container_desktop #open_content_collapse").slideUp();
			$(".internship_seo_heading_container_desktop #content_open_button").removeClass("ic-16-chevron-up").addClass("ic-16-chevron-down")
		} else {
			$(this).addClass("active");
			$(".internship_seo_heading_container_desktop #open_content_collapse").slideDown();
			$(".internship_seo_heading_container_desktop #content_open_button").removeClass("ic-16-chevron-down").addClass("ic-16-chevron-up")
		}
	})
};
var navigation = function() {
	pagenumber = $("#pageNumber").html();
	islastpage = $("#isLastPage").val();
	if (islastpage == "1") $("#navigation-forward").addClass("disabled");
	else {
		$("#navigation-forward").removeClass("disabled");
		$("#navigation-forward").click(function() {
			pagenumber = parseInt(pagenumber, 10) + 1;
			is_wfh_url = false;
			if ($("#internship_checkbox").is(":checked") && $("#remote_job").is(":checked") && !$("#fresher_job_checkbox").is(":checked")) is_wfh_url = true;
			var url = get_url_for_navigation_panel(is_wfh_url);
			search(url,
				true);
			return false
		})
	}
	if (pagenumber == 1) $("#navigation-backward").addClass("disabled");
	else {
		$("#navigation-backward").removeClass("disabled");
		$("#navigation-backward").click(function() {
			pagenumber = parseInt(pagenumber, 10) - 1;
			is_wfh_url = false;
			if ($("#internship_checkbox").is(":checked") && $("#remote_job").is(":checked") && !$("#fresher_job_checkbox").is(":checked")) is_wfh_url = true;
			var url = get_url_for_navigation_panel(is_wfh_url);
			search(url, true);
			return false
		})
	}
};
var marketing = function(url) {
	var final_url = from_campaign() ? "/internship/search_marketing_ajax/" : "/internships_marketing_ajax/";
	if (employment_type == "job" || employment_type == "both" && employment_type_filter_selected !== "internship") final_url = "/fresher-jobs_marketing_ajax/";
	final_url = final_url + url;
	$.ajax(final_url, {
		type: "GET",
		success: marketing_success,
		error: onError,
		datatype: "text"
	});
	return false
};
var marketing_success = function(data) {
	try {
		var marketing_right_container_html = data.marketing_right_container_html;
		var marketing_first_container_html = data.marketing_first_container_html;
		var native_ad_id = data.native_ad_id;
		if (typeof timer_vtc_ftu != "undefined") clearInterval(timer_vtc_ftu);
		$("#marketing_right_container").html(marketing_right_container_html);
		$("#marketing_first_container").html(marketing_first_container_html);
		if (typeof subscription_form_validate != "undefined") subscription_form_validate();
		$("#marketing_first_container").show();
		if (native_ad_id !== "") {
			dataLayer.push({
				"event": "native_ad_loaded",
				"eventCategory": "native_ad",
				"eventAction": "native_ad_impressions",
				"eventLabel": "native_ad_" + native_ad_id
			});
			dataLayer.push({
				"event": "native_ad_view",
				"view": "native_ad_" + native_ad_id
			})
		}
		$("a.training_cms_link").each(function() {
			var $this = $(this);
			var _href = $this.attr("href");
			if (_href.toLowerCase().indexOf("trainings.internshala.com") >= 0) {
				if (utm_medium != "") _href += "&utm_medium=" + utm_medium;
				if (utm_campaign !=
					"") _href += "&utm_campaign=" + utm_campaign;
				$this.attr("href", _href)
			}
		});
		if (from_campaign()) {
			$(".image_ad").addClass("campaign_page_native_ad");
			if (typeof campaign_id != "undefined" && campaign_id) $(".image_ad").attr("data-campaign-id", campaign_id);
			$(".image_ad .logo_container .logo").text("Ad");
			$(".image_ad .logo_container").addClass("grey_logo_container")
		}
		$(".image_ad").addClass("jobs_search_page_ad");
		var to_track_view = false;
		var category = $(".image_ad").attr("data-category");
		var action = $(".image_ad").attr("data-action");
		var label = $(".image_ad").attr("data-label");
		if (category && action && label) {
			var categories = ["JOS_DS_ad", "SO_DS", "JOS_DM_ad", "SO_DM", "JOS_HRM_ad", "SO_HRM", "JOS_FSW_ad", "SO_FSW"];
			if (categories.includes(category)) is_specialization_banner_ad = true;
			if ((category == "JOS_DS_ad" || category == "SO_DS") && typeof is_ds_jos_ad_tracked != "undefined" && !is_ds_jos_ad_tracked) {
				to_track_view = true;
				is_ds_jos_ad_tracked = true
			} else if ((category == "JOS_DM_ad" || category == "SO_DM") && typeof is_dm_jos_ad_tracked != "undefined" && !is_dm_jos_ad_tracked) {
				to_track_view =
					true;
				is_dm_jos_ad_tracked = true
			} else if ((category == "JOS_HRM_ad" || category == "SO_HRM") && typeof is_hrm_jos_ad_tracked != "undefined" && !is_hrm_jos_ad_tracked) {
				to_track_view = true;
				is_hrm_jos_ad_tracked = true
			} else if ((category == "JOS_FSW_ad" || category == "SO_FSW") && typeof is_fsw_jos_ad_tracked != "undefined" && !is_fsw_jos_ad_tracked) {
				to_track_view = true;
				is_fsw_jos_ad_tracked = true
			} else if (typeof is_fresher_jobs_page != "undefined" && is_fresher_jobs_page && category == "jobs_generic_trainings_ad" && typeof is_native_ad_tracked_jobs !=
				"undefined" && !is_native_ad_tracked_jobs) {
				to_track_view = true;
				is_native_ad_tracked_jobs = true
			}
			if (to_track_view) {
				dataLayer.push({
					"event": "specialization_native_ad_loaded",
					"eventCategory": category,
					"eventAction": action,
					"eventLabel": label
				});
				dataLayer.push({
					"event": "specialization_native_ad_view",
					"view": category
				})
			}
		}
		if (window.innerWidth >= 768) $("a.marketing_ads_card").attr("target", "_blank")
	} catch (e) {
		throw_error(e);
		NProgress.done();
		$(".loading_image").hide()
	}
};

function make_ajax_call_for_marketing_ads() {
	if (from_campaign()) return;
	var pathArray = window.location.pathname.split("/");
	var new_url = "";
	if (pathArray[1] == "internships" || pathArray[1] == "internship" && pathArray[2] == "search" || typeof is_fresher_jobs_page != "undefined" && is_fresher_jobs_page || pathArray[1] == "internships-for-women") {
		pathArray = pathArray.slice(2);
		new_url = pathArray.join("/");
		marketing(new_url + window.location.search)
	}
}

function make_ajax_call_for_campaigns_marketing_ads() {
	if (from_campaign())
		if (typeof searchedUrl != "undefined" && searchedUrl) marketing(searchedUrl)
}
var show_filters_matching_preferences_notification_new_ui = function() {
	if (window.innerWidth < 768) $(".filterUi").popover({
		html: "true",
		trigger: "manual"
	}).popover("show");
	else;
	$(".popover_overlay").show()
};

function getValueInStringFromMultiChosen(element) {
	var value = $(element).val();
	if (value) return value.toString();
	else return ""
}
$(document).on("click", "#admin_exit_preview_button", function() {
	$.get("/admin_banner/preview_slider_banner_end", {}, function() {
		if (window.opener) window.close();
		else window.location.reload()
	})
});

function visible_pinned_internships() {
	var pinned_internship_cookie_name = "pi";
	var cookie_pinned_internships = getCookie(pinned_internship_cookie_name);
	var g_pinned_internships = get_cookie("gpi");
	$(".individual_internship").each(function() {
		var internship_id = $(this).attr("internshipid");
		if (pinned_internship_ids.indexOf(internship_id) !== -1 && $(this).isInViewport()) {
			if (cookie_pinned_internships.indexOf(internship_id) === -1) set_cookie(pinned_internship_cookie_name, cookie_pinned_internships + internship_id + ",",
				30, "/");
			if (g_pinned_internships.indexOf(internship_id) === -1) set_session_cookie("gpi", g_pinned_internships + internship_id + ",", "0", "/")
		}
	})
}

function search_filter_scroll() {
	if (!to_show_search_filters()) return;
	var header = document.getElementById("search_criteria_container");
	if (header) {
		var sticky = header.offsetTop;
		$("#filters_container").css("height", "auto");
		var is_reference_visible = is_element_in_viewport("reference");
		if (window.pageYOffset > sticky && is_reference_visible) {
			var is_footer_visible = is_element_in_viewport("footer_reference");
			var is_filter_overlapping_with_footer = false;
			if (is_footer_visible) {
				var filter_height = $("#filters").outerHeight() +
					24;
				var footer_top = $("#footer_reference").offset().top - $(window).scrollTop();
				if (footer_top < filter_height) is_filter_overlapping_with_footer = true
			}
			if (is_filter_overlapping_with_footer) {
				header.classList.add("sticky_bottom");
				header.classList.remove("sticky")
			} else {
				header.classList.add("sticky");
				header.classList.remove("sticky_bottom")
			}
		} else {
			header.classList.remove("sticky");
			header.classList.remove("sticky_bottom")
		}
	}
}

function popovers() {
	$(".rewards_popover").each(function() {
		$(this).popover({
			trigger: "hover",
			container: "body",
			placement: "bottom",
			html: true,
			sanitize: false,
			content: '<div class="close_tooltip_container"></div><div class="popover-content">' + $(this).attr("popover_content") + "</div>"
		})
	});
	$(".open_popover").each(function() {
		var popover_id = $(this).closest(".internships_for_women_container").attr("id");
		if ($(this).closest(".form-group").attr("disabled")) return;
		$(this).popover({
			trigger: "hover",
			container: "#" + popover_id,
			placement: "top",
			html: true,
			sanitize: false,
			content: '<div class="close_tooltip_container"></div><div class="popover-content">' + $(this).attr("popover_content") + "</div>"
		})
	});
	$("body").on("click", function(e) {
		if ($(e.target).data("toggle") !== "popover" && $(e.target).parents(".popover.in").length === 0) $(".is_premium_icon").popover("hide")
	});
	var trigger = "mouseenter";
	if (window.innerWidth < 1255) trigger = "click";
	$(document).on(trigger, ".is_premium_icon", function() {
		var id = $(this).attr("id");
		var heading_for_tooltip =
			"Premium employer";
		var content_for_tooltip = "You can expect a faster response!";
		var trigger = "hover";
		if (window.innerWidth < 1255) trigger = "click";
		popover_tooltip_dark_with_heading("#" + id, heading_for_tooltip, content_for_tooltip, "top", trigger);
		$("#" + id).popover("show")
	})
}

function keyword_input_changes(id) {
	$(".cross_btn").on("click", function() {
		$(this).parents().siblings(".form-control").val("").trigger("input").focus()
	});
	$(".has_cross_and_button").children(".form-control").on("focusin", function() {
		$(this).parent().addClass("is_focused")
	});
	$(".has_cross_and_button").children(".form-control").on("focusout", function() {
		$(this).parent().removeClass("is_focused")
	});
	var keyword_input = $("#" + id);
	if (keyword_input.length) {
		var length = keyword_input.val().length;
		if (length > 0) keyword_input.siblings(".cross_btn_container").show();
		else keyword_input.siblings(".cross_btn_container").hide()
	}
}

function from_campaign() {
	if (typeof is_from_campaign != "undefined" && is_from_campaign) return true;
	return false
}

function to_show_search_filters() {
	if (typeof to_show_filters != "undefined") {
		if (to_show_filters) return true;
		return false
	}
	return true
}

function getAppliedFiltersCount(filter_values) {
	var filters_count = 0;
	for (var key in filter_values) {
		if (key === "category_name_label_array") continue;
		if (key === "fresher_jobs") continue;
		if (key == "stipend" && filter_values[key] <= 0) continue;
		if (filter_values[key].length) filters_count = filters_count + filter_values[key].length
	}
	return filters_count
}

function add_trailing_slash() {
	if (employment_type !== "undefined") {
		var current_url = window.location.pathname;
		var params = location.search;
		var lastChar = current_url.substr(-1);
		if (lastChar != "/" && current_url) current_url = current_url + "/";
		current_url = current_url + params;
		if (employment_type == "job") history.pushState({
			page: 1
		}, "job search", current_url);
		else history.pushState({
			page: 1
		}, "internship search", current_url)
	}
};
var url = [];
var pagenumber, islastpage;
var to_show_filters_matching_preferences_notification = false;
var height_adjustment = 0;
var to_show_more_filters = false;
var employment_type_filter_selected = window.location.pathname.match(/employment_type_filter_selected-(job|internship)/);
if (employment_type === "both")
	if (employment_type_filter_selected === null) employment_type_filter_selected = "all";
	else employment_type_filter_selected = employment_type_filter_selected[0].split("-")[1];
$(document).ready(function() {
	$("#navigation-forward").click(function(e) {
		e.preventDefault()
	}, false);
	$("#navigation-backward").click(function(e) {
		e.preventDefault()
	}, false);
	updateFilterIcon(getAppliedFiltersCount(filters_applied));
	if (window.innerWidth >= 992) {
		var detail_page_path = "/internship/detail/";
		if (!from_campaign()) {
			if (window.location.pathname.indexOf(detail_page_path) == -1) make_ajax_call_for_marketing_ads();
			$("#filters").scroll(function() {
				close_datepicker()
			});
			$(window).scroll(function() {
				var window_top =
					$(window).scrollTop();
				var container_height = typeof $("#internship_list_container").offset() != "undefined" ? $("#internship_list_container").offset().top : false;
				close_datepicker();
				if (window_top < container_height) $("#android_app_message").slideUp();
				else $("#android_app_message").slideDown()
			});
			if (window.innerWidth > 425) $(window).bind("popstate", function(event) {
				location.reload()
			});
			if (toShowMatchingPreferencesEnabled == 1) {
				$("#select_category_chosen .chosen-choices").addClass("select_chosen_disabled");
				$("#city_sidebar_chosen .chosen-choices").addClass("select_chosen_disabled")
			} else {
				$("#select_category_chosen .chosen-choices").removeClass("select_chosen_disabled");
				$("#city_sidebar_chosen .chosen-choices").removeClass("select_chosen_disabled")
			}
			if ($("#matching_preference").is(":checked")) toShowMatchingPreferences = 1;
			else toShowMatchingPreferences = 0
		} else {
			if (window.location.pathname.indexOf(detail_page_path) == -1) make_ajax_call_for_campaigns_marketing_ads();
			$(window).scroll(function() {
				$(".ui-datepicker").hide();
				close_datepicker()
			})
		}
		left_panel();
		navigation();
		if (!from_campaign()) seo_heading();
		if (from_campaign()) {
			if (to_show_filters) searchCriterias()
		} else searchCriterias();
		$("#categoryOptions, #cityOptions").click(function() {
			close_datepicker()
		});
		var window_height = $(window).height();
		$("#filters").css("max-height", window_height - 45);
		initialise_filter_toggle();
		enable_save_search_as_alert_cta(employment_type)
	}
});
$(document).on("click", ".showGeneralToastOnMobile", function() {
	general_toast('Uncheck "As per my preferences" checkbox to search manually')
});
$(document).on("click", "#city_sidebar_chosen .chosen-choices", function() {
	$(".filtersModal_popover_overlay").hide();
	$(".popover_overlay").hide();
	$(".location-filters-popover").popover("hide")
});
var initialise_filter_toggle = function() {
	show_less_filters();
	$(document).on("click", "#filter_toggle", function() {
		to_show_more_filters = !to_show_more_filters;
		if (to_show_more_filters) show_more_filters();
		else show_less_filters()
	})
};
var show_more_filters = function() {
	$(".more_filters:last").show();
	$("#filter_toggle span").text("View less filters");
	$("#filter_toggle i").removeClass("ic-16-s15-chevron-down");
	$("#filter_toggle i").addClass("ic-16-s15-chevron-up")
};
var show_less_filters = function() {
	$(".more_filters:last").hide();
	$("#filter_toggle span").text("View more filters");
	$("#filter_toggle i").removeClass("ic-16-s15-chevron-up");
	$("#filter_toggle i").addClass("ic-16-s15-chevron-down")
};
var left_panel = function() {
	var window_height = $(window).height();
	$("#filters").css("max-height", window_height - 45);
	keyword_input_changes("keywords");
	chosen_initialization();
	custom_date_picker("start_date", "d M'' y", "start_date_pseudo");
	$(".datepicker_wrapper .form-control").each(function() {
		$(this).on("focusin", function() {
			var $this = $(this);
			setTimeout(function() {
				var month = $this.datepicker("option", "changeMonth");
				var year = $this.datepicker("option", "changeYear");
				if (month && year) {
					if ($(".ui-datepicker-title.with-dropdown").length ===
						0) {
						$(".ui-datepicker-next, .ui-datepicker-prev").hide();
						$(".ui-datepicker-title").addClass("with-dropdown")
					}
				} else if ($(".ui-datepicker-title").hasClass("with-dropdown")) {
					$(".ui-datepicker-next, .ui-datepicker-prev").show();
					$(".ui-datepicker-title").removeClass("without-dropdown")
				}
			}, 10)
		})
	});
	if (window.innerWidth >= 992) {
		$(document).on("change", "#select_category", function(e) {
			e.preventDefault();
			if (e.handled !== true) {
				e.handled = true;
				var url = get_url_for_left_panel("category");
				search(url, true)
			}
		});
		$(document).on("change",
			"#select_duration",
			function(e) {
				e.preventDefault();
				if (e.handled !== true) {
					e.handled = true;
					var url = get_url_for_left_panel("duration");
					search(url, true)
				}
			});
		$(document).on("change", "#city_sidebar", function(e) {
			e.preventDefault();
			if (e.handled !== true) {
				e.handled = true;
				$(".location-filters-popover").popover("hide");
				$(".popover_overlay").hide();
				$(".modal-backdrop").hide();
				var url = get_url_for_left_panel("city");
				search(url, true)
			}
		});
		$(document).on("click", "#ppo", function(e) {
			e.preventDefault();
			if (e.handled !== true) {
				e.handled =
					true;
				var url = get_url_for_left_panel("ppo");
				search(url, true)
			}
		});
		$(document).on("click", "#work_from_home", function(e) {
			e.preventDefault();
			if (e.handled !== true) {
				e.handled = true;
				var url = get_url_for_left_panel("work_from_home");
				search(url, true)
			}
		});
		$(document).on("click", "#fast_response_input", function(e) {
			e.preventDefault();
			if (e.handled !== true) {
				e.handled = true;
				var url = get_url_for_left_panel("fast_response");
				search(url, true)
			}
		});
		$(document).on("click", "#early_applicant_input", function(e) {
			e.preventDefault();
			if (e.handled !==
				true) {
				e.handled = true;
				var url = get_url_for_left_panel("early_applicant");
				search(url, true)
			}
		});
		$(document).on("click", "#internship_checkbox", function(e) {
			e.preventDefault();
			if (e.handled !== true) {
				e.handled = true;
				var url = get_url_for_left_panel("internship_checkbox");
				search(url, true)
			}
		});
		$(document).on("click", "#remote_job", function(e) {
			e.preventDefault();
			if (e.handled !== true) {
				e.handled = true;
				var url = get_url_for_left_panel("work-from-home");
				search(url, true)
			}
		});
		$(document).on("click", "#fresher_job_checkbox", function(e) {
			e.preventDefault();
			if (e.handled !== true) {
				e.handled = true;
				var pageUrl = window.location.href;
				var newPageUrl = "";
				if ($("#fresher_job_checkbox").is(":checked")) newPageUrl = pageUrl.replace("/jobs", "/fresher-jobs");
				else newPageUrl = pageUrl.replace("/fresher-jobs", "/jobs");
				var regex = /(page-)\d/;
				var m;
				if ((m = regex.exec(newPageUrl)) !== null) m.forEach(function(match, groupIndex) {
					newPageUrl = newPageUrl.replace(match, "")
				});
				window.location.href = newPageUrl;
				if ($("#internship_checkbox").is(":checked")) var url = get_url_for_left_panel("work-from-home")
			}
		});
		$(document).on("click", "#salary_3lpa_checkbox", function(e) {
			e.preventDefault();
			if (e.handled !== true) {
				e.handled = true;
				var url = get_url_for_left_panel("3lpa_jobs");
				search(url, true)
			}
		});
		$(document).on("click", "#internships_for_women_input", function(e) {
			e.preventDefault();
			if (e.handled !== true) {
				e.handled = true;
				var pageUrl = window.location.href;
				var newPageUrl = "";
				if ($("#internships_for_women_input").is(":checked")) newPageUrl = pageUrl.replace("/internships", "/internships-for-women");
				else newPageUrl = pageUrl.replace("/internships-for-women",
					"/internships");
				var regex = /(page-)\d/;
				var m;
				if ((m = regex.exec(newPageUrl)) !== null) m.forEach(function(match, groupIndex) {
					newPageUrl = newPageUrl.replace(match, "")
				});
				window.location.href = newPageUrl
			}
		});
		$(document).on("click", "#search_form .resetDateFilter", function(e) {
			e.preventDefault();
			if (e.handled !== true) {
				e.handled = true;
				$("#start_date").val("");
				var url = get_url_for_left_panel("start_date");
				search(url, true)
			}
		});
		$(document).on("click", ".cross_btn", function(e) {
			e.preventDefault();
			if (e.handled !== true) {
				e.handled =
					true;
				$(this).parents().siblings(".form-control").val("").trigger("input").focus();
				$("#keywords").val("");
				$(".resetKeywordFilter").hide();
				$(".pop").popover("hide");
				var url = "";
				search(url, true)
			}
		});
		$(document).on("click", "#internship_type", function(e) {
			e.preventDefault();
			if (e.handled !== true) {
				e.handled = true;
				var url = get_url_for_left_panel("internship_type");
				search(url, true)
			}
		});
		$(document).on("click", "#part_time", function(e) {
			e.preventDefault();
			if (e.handled !== true) {
				e.handled = true;
				var url = get_url_for_left_panel("part_time");
				search(url, true)
			}
		});
		$(document).on("click", "#matching_preference", function(e) {
			e.preventDefault();
			if (e.handled !== true) {
				e.handled = true;
				$(this).prop("disabled", true);
				if ($(this).is(":checked")) toShowMatchingPreferences = 1;
				else toShowMatchingPreferences = 0;
				var duration = $("#select_duration").val();
				var start_date = $("#start_date").val();
				var stipend = $("#stipend_filter").val();
				var new_url = "";
				new_url += "/" + get_url_for_matching_preference("");
				if (duration && duration != "") new_url += "/duration-" + duration;
				if (start_date !=
					"") new_url += "/start-date-" + start_date.replace(/-/g, "");
				if ($("#ppo").is(":checked")) new_url += "/ppo-true";
				if (stipend && stipend > 0) new_url += "/stipend-" + stipend;
				if ($("#fast_response_input").is(":checked")) new_url += "/fast-response-true";
				if ($("#early_applicant_input").is(":checked")) new_url += "/early-applicant-25";
				search(new_url, true)
			}
		});
		$(document).on("click", "#matching_preference_job", function(e) {
			e.preventDefault();
			if (e.handled !== true) {
				e.handled = true;
				$(this).prop("disabled", true);
				if ($(this).is(":checked")) toShowMatchingPreferences =
					1;
				else toShowMatchingPreferences = 0;
				var new_url = "/" + get_url_for_matching_preference("_job");
				search(new_url, true)
			}
		});
		$(document).on("change", "#stipend_filter", function(e) {
			e.preventDefault();
			if (e.handled !== true) {
				e.handled = true;
				stipend_filter_desktop_set_value();
				var url = get_url_for_left_panel("stipend");
				search(url, true)
			}
		});
		$(document).on("input", "#stipend_filter", function() {
			change_stipend_slider_filter_gradient_desktop()
		});
		if (typeof stipend_filters_values !== "undefined") $.each(stipend_filters_values, function(index,
			val) {
			$(document).on("click", ".value_" + val, function(e) {
				e.preventDefault();
				if (e.handled !== true) {
					e.handled = true;
					$("#stipend_filter").val(val);
					change_stipend_slider_filter_gradient_desktop();
					var url = get_url_for_left_panel("stipend");
					search(url, true)
				}
			})
		});
		if (employment_type === "both") {
			$(document).off("change", 'input[name="employment_type"]');
			$(document).on("change", 'input[name="employment_type"]', function(e) {
				var value = $('input[name="employment_type"]:checked').val();
				employment_type_filter_selected = value;
				var url = get_url_for_left_panel();
				search(url, true)
			})
		}
	}
	var is_reset_link_disabled = hasAttr($(".reset_link_desktop"), "disabled");
	$(".reset_link_desktop").click(function() {
		if (from_campaign()) {
			var keywords = $("#keywords").val();
			if (keywords) {
				var search_campaign_url = "keywords-" + encodeURIComponent(keywords);
				window.location.href = "/" + campaign_url + "/" + search_campaign_url + "#internships_list_container"
			} else window.location.href = "/" + campaign_url + "#internships_list_container"
		} else if (!is_reset_link_disabled) {
			var url =
				get_url_for_left_panel("reset");
			if (!url) {
				NProgress.done();
				if (employment_type == "job" || employment_type == "both") window.location.href = "/jobs";
				else window.location.href = "/internships";
				return
			}
			search(url, true)
		}
	});
	$("#keyword_search_form").validate({
		rules: {
			keywords: {
				required: true,
				minlength: 3
			}
		},
		errorPlacement: function(label, element) {
			label.insertAfter(element.closest(".keyword"))
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
			var url = get_url_for_keyword_panel();
			search(url, true);
			return false
		}
	})
};

function get_url_for_left_panel(source) {
	if (from_campaign()) return campaign_get_url_for_left_panel(source);
	var category = getValueInStringFromMultiChosen("#categoryOptions  .chosen-select");
	var city = getValueInStringFromMultiChosen("#cityOptions  .chosen-select");
	var duration = $("#select_duration").val() != undefined ? $("#select_duration").val() : "";
	var start_date = $("#start_date").val() != undefined ? $("#start_date").val() : "";
	var stipend = $("#stipend_filter").val() != undefined ? $("#stipend_filter").val() : 0;
	var type =
		"";
	var new_url = "";
	var is_new_part_time_url = 0;
	var is_multiple_cities = 0;
	var city_array = city.split(",");
	if (city_array.length > 1) is_multiple_cities = 1;
	category = category.replace(/%20/g, "-");
	if (employment_type == "job") {
		if (source === "reset") {
			$("#select_category").val("");
			$("#city_sidebar").val("");
			var keyword_url = base_url + "jobs/keywords-";
			if (toShowMatchingPreferences == 1) new_url = "matching-preferences";
			else if (window.location.href.indexOf(keyword_url) > -1) return get_url_for_keyword_panel();
			return new_url
		}
		var regular_url =
			"";
		var remote_job = "";
		var category_city_url = "";
		var new_url = "";
		if (city) city = "-in-" + city;
		if (category) category = category + "-";
		filter_types.matching_preferences.length = 0;
		if ($("#internship_checkbox").is(":checked"))
			if ($("#remote_job").is(":checked")) {
				if ($("#fresher_job_checkbox").is(":checked")) {
					remote_job = "/work-from-home";
					if (category || city) {
						category_city_url = "/" + category + "jobs" + city;
						regular_url = "/internships"
					} else regular_url = "/internships";
					new_url = "/fresher-jobs" + category_city_url + remote_job + regular_url
				} else if (category ||
					city) new_url = "/work-from-home-" + category + "jobs" + city;
				else new_url = "/work-from-home-jobs";
				if ($("#salary_3lpa_checkbox").is(":checked")) new_url += "/3lpa-job";
				newPageUrl = new_url;
				var regex = /(page-)\d/;
				var m;
				if ((m = regex.exec(newPageUrl)) !== null) m.forEach(function(match, groupIndex) {
					newPageUrl = newPageUrl.replace(match, "")
				});
				window.location.href = newPageUrl
			} else if (category || city) {
			category_city_url = "/" + category + "jobs" + city;
			regular_url = "/internships"
		} else regular_url = "/internships";
		else if ($("#remote_job").is(":checked")) {
			remote_job =
				"/work-from-home";
			if (category || city) category_city_url = "/" + category + "jobs" + city
		} else if (category || city) category_city_url = "/" + category + "jobs" + city;
		if (new_url == "") new_url = category_city_url + remote_job + regular_url;
		if ($("#salary_3lpa_checkbox").is(":checked")) new_url += "/3lpa-job"
	} else {
		if ($("#internship_type").is(":checked")) type = $("#internship_type").val() + "-";
		if (source === "reset") {
			$("#select_category").val("");
			$("#city_sidebar").val("");
			$("#select_duration").val("");
			$("#start_date").val("");
			$("#stipend_filter").val(0);
			change_stipend_slider_filter_gradient_desktop();
			var keyword_url = base_url + "internships/keywords-";
			if (toShowMatchingPreferences == 1) new_url = "matching-preferences";
			else if (window.location.href.indexOf(keyword_url) > -1) return get_url_for_keyword_panel();
			return new_url
		}
		if ($("#part_time").is(":checked") && type === "" && is_multiple_cities === 0)
			if (city === "" && category === "") {
				new_url = "part-time-jobs";
				is_new_part_time_url = 1
			} else if (category === "") {
			new_url = "part-time-jobs-in-";
			is_new_part_time_url = 1
		} else if (city === "") {
			new_url =
				"part-time-";
			is_new_part_time_url = 1
		} else if (city != "" && category != "") {
			new_url = "part-time-";
			is_new_part_time_url = 1
		}
		if ($("#work_from_home").is(":checked")) {
			is_new_part_time_url = 0;
			if (city === "" && category === "") new_url = "work-from-home-" + type + "internships";
			else new_url = "work-from-home-"
		}
		if (city !== "" && category !== "")
			if ($("#part_time").is(":checked") && type === "" && is_multiple_cities === 0 && !$("#work_from_home").is(":checked")) {
				new_url += category + "-" + type + "jobs-in-" + city;
				is_new_part_time_url = 1
			} else if ($("#work_from_home").is(":checked")) new_url +=
			category + "-" + type + "internships-in-" + city;
		else new_url += category + "-" + type + "internship-in-" + city;
		else if (city !== "")
			if ($("#part_time").is(":checked") && type === "" && is_multiple_cities === 0 && !$("#work_from_home").is(":checked")) {
				new_url += city;
				is_new_part_time_url = 1
			} else {
				if ($("#work_from_home").is(":checked")) new_url += type + "internships-in-" + city;
				else new_url += type + "internship-in-" + city;
				is_new_part_time_url = 0
			}
		else if (category !== "")
			if ($("#part_time").is(":checked") && type === "" && is_multiple_cities === 0 && !$("#work_from_home").is(":checked")) {
				new_url +=
					category + "-" + type + "jobs";
				is_new_part_time_url = 1
			} else {
				if ($("#work_from_home").is(":checked")) new_url += category + "-" + type + "internships";
				else new_url += category + "-" + type + "internship";
				is_new_part_time_url = 0
			} if (new_url == "" && type !== "") new_url = type + "internship";
		if (source == "start_date" || source == "duration" || source == "ppo" || source == "stipend" || source == "fast_response" || source == "early_applicant")
			if (toShowMatchingPreferences == 1)
				if (toShowMatchingPreferences == 1) new_url += "/" + get_url_for_matching_preference("");
		if (duration &&
			duration != "") new_url += "/duration-" + duration;
		if (start_date != "") new_url += "/start-date-" + start_date.replace(/-/g, "");
		if ($("#part_time").is(":checked") && is_new_part_time_url === 0) new_url += "/part-time-true";
		if ($("#ppo").is(":checked")) new_url += "/ppo-true";
		if (stipend && stipend > 0) new_url += "/stipend-" + stipend;
		if ($("#fast_response_input").is(":checked")) new_url += "/fast-response-true";
		if ($("#early_applicant_input").is(":checked")) new_url += "/early-applicant-25"
	}
	return new_url
}

function campaign_get_url_for_left_panel(source) {
	var category = getValueInStringFromMultiChosen("#categoryOptions  .chosen-select") || "";
	var city = getValueInStringFromMultiChosen("#cityOptions  .chosen-select") || "";
	var duration = $("#select_duration").val() || "";
	var start_date = $("#start_date").val() || "";
	var stipend = $("#stipend_filter").val() != undefined ? $("#stipend_filter").val() : 0;
	var args = [];
	if (source === "reset") {
		$("#select_category").val("");
		$("#city_sidebar").val("");
		$("#stipend_filter").val(0);
		change_stipend_slider_filter_gradient_desktop();
		return ""
	}
	if ($("#part_time").is(":checked")) args.push("part-time-true");
	if ($("#work_from_home").is(":checked")) args.push("work_from_home-true");
	if (city !== "") args.push("city-" + city);
	if (category !== "") args.push("category-" + category);
	if (duration !== "") args.push("duration-" + duration);
	if ($("#ppo").is(":checked")) args.push("ppo-true");
	else if (typeof campaign_name !== "undefined" && campaign_name === "branding_campaign_grads_2020") args.push("ppo-false");
	if (start_date !== "") args.push("start-date-" + start_date.replace(/-/g,
		""));
	if (stipend && stipend > 0) args.push("stipend-" + stipend);
	if (employment_type === "both" && employment_type_filter_selected != "all") args.push("employment_type_filter_selected-" + employment_type_filter_selected);
	return args.join("/")
}

function get_url_for_wfh_covid(source) {
	var category = getValueInStringFromMultiChosen("#categoryOptions  .chosen-select");
	var city = "";
	var duration = $("#select_duration").val();
	var start_date = $("#start_date").val();
	var type = "";
	var new_url = "";
	var is_new_part_time_url = 0;
	var is_wfh_url = 1;
	var is_multiple_cities = 0;
	var city_array = city.split(",");
	if (city_array.length > 1) is_multiple_cities = 1;
	if ($("#internship_type").is(":checked")) type = $("#internship_type").val() + "-";
	if ($("#part_time").is(":checked") && type ===
		"" && is_multiple_cities === 0)
		if (city === "" && category === "") {
			new_url = "part-time-jobs";
			is_new_part_time_url = 1
		} else if (category === "") {
		new_url = "part-time-jobs-in-";
		is_new_part_time_url = 1
	} else if (city === "") {
		new_url = "part-time-";
		is_new_part_time_url = 1
	} else if (city != "" && category != "") {
		new_url = "part-time-";
		is_new_part_time_url = 1
	}
	if (is_wfh_url) {
		is_new_part_time_url = 0;
		if (city === "" && category === "") new_url = "work-from-home-" + type + "jobs";
		else new_url = "work-from-home-"
	}
	if (city !== "" && category !== "")
		if ($("#part_time").is(":checked") &&
			type === "" && is_multiple_cities === 0 && !is_wfh_url) {
			new_url += category + "-" + type + "jobs-in-" + city;
			is_new_part_time_url = 1
		} else if (is_wfh_url) new_url += category + "-" + type + "jobs-in-" + city;
	else new_url += category + "-" + type + "internship-in-" + city;
	else if (city !== "")
		if ($("#part_time").is(":checked") && type === "" && is_multiple_cities === 0 && !is_wfh_url) {
			new_url += city;
			is_new_part_time_url = 1
		} else {
			if (is_wfh_url) new_url += type + "jobs-in-" + city;
			else new_url += type + "internship-in-" + city;
			is_new_part_time_url = 0
		}
	else if (category !== "")
		if ($("#part_time").is(":checked") &&
			type === "" && is_multiple_cities === 0 && !is_wfh_url) {
			new_url += category + "-" + type + "jobs";
			is_new_part_time_url = 1
		} else {
			if (is_wfh_url) new_url += category + "-" + type + "jobs";
			else new_url += category + "-" + type + "internship";
			is_new_part_time_url = 0
		} if (new_url == "" && type !== "") new_url = type + "internship";
	if (source == "start_date" || source == "duration") {
		if (toShowMatchingPreferences == 1) new_url += "/" + get_url_for_matching_preference();
		if (duration && duration != "") new_url += "/duration-" + duration;
		if (start_date != "") new_url += "/start-date-" +
			start_date.replace(/-/g, "")
	} else {
		if (duration && duration != "") new_url += "/duration-" + duration;
		if (start_date != "") new_url += "/start-date-" + start_date.replace(/-/g, "")
	}
	if ($("#part_time").is(":checked") && is_new_part_time_url === 0) new_url += "/part-time-true";
	if ($("#ppo").is(":checked")) new_url += "/ppo-true";
	else {
		var pageUrl = window.location.href;
		var newPageUrl = ""
	}
	return new_url
}

function get_url_for_keyword_panel() {
	var keywords = $("#keywords").val();
	var new_url = "keywords-" + encodeURIComponent(keywords);
	return new_url
}

function get_url_for_matching_preference(type) {
	var new_url = "";
	if (window.innerWidth >= 992)
		if ($("#matching_preference" + type).is(":checked")) new_url = "matching-preferences";
		else new_url = "matching_preference-false";
	else if (toShowMatchingPreferences == 1) new_url = "matching-preferences";
	else new_url = "";
	return new_url
}

function campaign_get_url_for_navigation_panel($this) {
	var _href = $this.attr("href");
	var pathArray = _href.split("/");
	var index = searchStringInArray("page-", pathArray);
	var new_url = "";
	if (index !== -1) pathArray[index] = "page-" + pagenumber;
	else {
		var length = pathArray.length;
		if (pathArray[length - 1] !== "") pathArray[length] = "page-" + pagenumber;
		else pathArray[length - 1] = "page-" + pagenumber
	}
	pathArray = pathArray.slice(2);
	new_url = pathArray.join("/");
	return new_url
}

function get_url_for_navigation_panel(is_wfh_url) {
	is_wfh_url = is_wfh_url === undefined ? false : is_wfh_url;
	if (from_campaign()) var pathname = decodeURIComponent(window.location.pathname);
	else var pathname = window.location.pathname;
	var pathArray = pathname.split("/");
	var index = searchStringInArray("page-", pathArray);
	var new_url = "";
	if (index !== -1) pathArray[index] = "page-" + pagenumber;
	else {
		var length = pathArray.length;
		if (pathArray[length - 1] !== "") pathArray[length] = "page-" + pagenumber;
		else pathArray[length - 1] = "page-" + pagenumber
	}
	if (is_wfh_url) pathArray =
		pathArray.slice(1);
	else pathArray = pathArray.slice(2);
	new_url = pathArray.join("/");
	return new_url
}
var search = function(url, toAddInHistory) {
	if (url == "redirected") return;
	if (from_campaign()) {
		url = url || "";
		var url_to_append = "campaign_id-" + campaign_id + "/disable-student_checks-true/" + url;
		marketing(url_to_append);
		if (employment_type === "internship" || employment_type_filter_selected === "internship") var final_url = "/internship/search_ajax/";
		else var final_url = "/jobs_ajax/";
		final_url = final_url + url_to_append;
		if (campaign_url == "intern_skills") history.pushState({
			page: 1
		}, document.title, "/" + campaign_url + "/" + url);
		else history.pushState({
				page: 1
			},
			document.title, "/" + campaign_url + "/" + encodeURIComponent(url));
		NProgress.start();
		$(".loading_image").show();
		$.ajax(final_url, {
			type: "GET",
			success: search_success,
			error: onError,
			datatype: "text"
		})
	} else {
		marketing(url);
		change_stipend_slider_filter_gradient_desktop();
		var wfh_url = "";
		if (typeof employment_type != "undefined" && employment_type !== "job")
			if (typeof internship_type != undefined && internship_type == "internship_for_women") var final_url = "/internships-for-women_ajax/";
			else var final_url = "/internships_ajax/";
		else {
			var final_url =
				"/jobs_ajax/";
			if ($("#fresher_job_checkbox").is(":checked")) var final_url = "/fresher-jobs_ajax/";
			else if ($("#internship_checkbox").is(":checked") && $("#remote_job").is(":checked")) {
				wfh_url = url;
				url = compute_desktop_search_url_for_wfh_filters_for_job_ajax()
			}
		}
		var last_slash_position = parseInt(final_url.lastIndexOf("/")) + 1;
		var final_url_length = final_url.length;
		if (last_slash_position == final_url_length) {
			if (url.indexOf("/") == 0) url = url.replace("/", "");
			final_url = final_url + url
		} else final_url = final_url + url;
		if (big_brand ==
			"yes" && url != "matching-preferences")
			if (final_url.search("big-brand") == -1) final_url = final_url + "/big-brand/";
		if (from_campaign()) final_url = final_url + "/campaign_id-" + campaign_id;
		NProgress.start();
		$(".loading_image").show();
		$.ajax(final_url, {
			type: "GET",
			success: search_success,
			error: onError,
			datatype: "text"
		});
		if (typeof toAddInHistory == "undefined" || toAddInHistory == null) toAddInHistory = true;
		if (url == "matching_preference-false") url = "";
		if (url) {
			var lastChar = url.substr(-1);
			if (lastChar != "/") url = url + "/"
		}
		if (wfh_url) {
			var lastCharwfh =
				wfh_url.substr(-1);
			if (lastCharwfh != "/") wfh_url = wfh_url + "/"
		}
		if (toAddInHistory)
			if (employment_type == "job")
				if (job_type !== undefined && job_type == "fresher_job") history.pushState({
					page: 1
				}, "job search", "/fresher-jobs/" + url);
				else if ($("#internship_checkbox").is(":checked") && $("#remote_job").is(":checked")) history.pushState({
			page: 1
		}, "job search", "/" + wfh_url);
		else history.pushState({
			page: 1
		}, "job search", "/jobs/" + url);
		else if (typeof internship_type != undefined && internship_type == "internship_for_women") history.pushState({
				page: 1
			},
			"internship search", "/internships-for-women/" + url);
		else if (from_campaign()) history.pushState({
			page: 1
		}, campaign_name, "/" + campaign_url + "/" + url);
		else history.pushState({
			page: 1
		}, "internship search", "/internships/" + url)
	}
	return false
};
var search_success = function(data) {
	NProgress.done();
	var seo = data.seo;
	scroll_page_number = 1;
	var internship_seo_heading_html = data.internship_seo_heading_html;
	var internship_list_html = data.internship_list_html;
	var search_criteria_html = data.search_criteria_html;
	var faqs_html = data.faqs_html;
	if (!from_campaign()) document.title = seo.title;
	filters_applied = filter_types;
	scroll_from_id = data.scroll_from_id;
	var popular_locations_html = data.popular_locations_html;
	if (!from_campaign()) {
		$(".internship_seo_heading_container_desktop").html(internship_seo_heading_html);
		$("#dual_search_container").html(popular_locations_html)
	}
	$("#internship_list_container").html(internship_list_html);
	$("#search_criteria_container").html(search_criteria_html);
	$("#search_page_faqs").html(faqs_html);
	updateFilterIcon(data.filters_count);
	left_panel();
	navigation();
	popovers();
	if (!from_campaign()) {
		$("#matching_preference").prop("disabled", false);
		seo_heading();
		if (employment_type == "job" || typeof internship_type !== "undefined" && internship_type == "internship_for_women") goToByScroll("internships_list_container");
		else $(document).scrollTop(0);
		if (to_show_filters_matching_preferences_notification) show_filters_matching_preferences_notification_new_ui()
	} else goToByScroll("internships_list_container");
	searchedUrl = data.searchedUrl;
	if (!from_campaign())
		if (typeof internship_type != undefined && internship_type == "internship_for_women")
			if (searchedUrl.indexOf("page-1") >= 0) {
				$("#internship_for_women").show();
				$("#ifw_partners_container").show()
			} else if (searchedUrl.indexOf("page") == -1) {
		$("#internship_for_women").show();
		$("#ifw_partners_container").show()
	} else {
		$("#internship_for_women").hide();
		$("#ifw_partners_container").hide()
	} else {
		$("#internship_for_women").hide();
		$("#ifw_partners_container").hide()
	}
	searchCriterias();
	if (typeof subscription_form_validate != "undefined") subscription_form_validate();
	enable_save_search_as_alert_cta(employment_type);
	$(".loading_imsearch_successage").hide()
};
var updateFilterIcon = function(filters_count) {
	if (filters_count > 0) {
		$("#filter_ui_icon_desktop").removeClass("ic-16-filter");
		$("#filter_ui_icon_desktop").addClass("ic-24-filter-applied");
		$("#filter_ui_heading_mobile").removeClass("heading_5");
		$("#filter_ui_heading_mobile").addClass("heading_6")
	} else {
		$("#filter_ui_icon_desktop").removeClass("ic-24-filter-applied");
		$("#filter_ui_icon_desktop").addClass("ic-16-filter");
		$("#filter_ui_heading_mobile").removeClass("heading_6");
		$("#filter_ui_heading_mobile").addClass("heading_5")
	}
};
var searchCriterias = function() {
	if (typeof searchedUrl == "undefined") searchedUrl = "";
	$("#select_category_chosen").css("pointer-events", "none");
	$("#city_sidebar_chosen").css("pointer-events", "none");
	if (typeof employment_type != "undefined" && employment_type === "internship" || employment_type_filter_selected === "internship") {
		var url = "internship";
		if (typeof internship_type != undefined && internship_type == "internship_for_women") url = "ifwinternship";
		var final_url = "/" + url + "/get_search_criterias_newui/"
	} else {
		url = "job";
		var final_url = "/" + url + "/get_search_criterias/"
	}
	var searchedUrl_array = searchedUrl.split("%3F");
	var params = "";
	if (typeof searchedUrl_array[0] !== "undefined") params = searchedUrl_array[0];
	else {
		searchedUrl_array = searchedUrl.split("?");
		if (typeof searchedUrl_array[0] !== "undefined") params = searchedUrl_array[0];
		else params = searchedUrl
	}
	if (job_type !== undefined && job_type == "fresher_job") params = params + "/job_type-fresher_job";
	if ($("#internship_checkbox").is(":checked")) params = params + "/include_internship-true";
	final_url =
		final_url + params;
	$.ajax(final_url, {
		type: "GET",
		success: searchCriteriasSuccess,
		error: onError,
		datatype: "text"
	});
	return false
};
var searchCriteriasSuccess = function(data) {
	try {
		$("#cityOptions").html(data.cityView);
		$("#categoryOptions").html(data.categoryView);
		$("#select_category_chosen").css("pointer-events", "auto");
		$("#city_sidebar_chosen").css("pointer-events", "auto");
		var city_for_covid = getValueInStringFromMultiChosen("#cityOptions  .chosen-select");
		if (employment_type == "internship" && !$("#work_from_home").is(":checked") && city_for_covid != "" && $("#isLastPage").val() == "1");
		chosen_initialization();
		var url$2 = location.href;
		if (!(url$2.includes("internships-for-women") ||
				url$2.includes("ppo-true") || url$2.includes("start-date-") || url$2.includes("duration-") || url$2.includes("fast-response-true") || url$2.includes("early-applicant-"))) {
			to_show_more_filters = false;
			show_less_filters()
		} else {
			to_show_more_filters = true;
			show_more_filters()
		}
		$("#filter_toggle").css("display", "flex");
		$(window).trigger("scroll");
		if (toShowMatchingPreferencesEnabled == 1) {
			$("#select_category_chosen .chosen-choices").addClass("select_chosen_disabled");
			$("#city_sidebar_chosen .chosen-choices").addClass("select_chosen_disabled")
		} else {
			$("#select_category_chosen .chosen-choices").removeClass("select_chosen_disabled");
			$("#city_sidebar_chosen .chosen-choices").removeClass("select_chosen_disabled")
		}
		$(".loading_image").hide()
	} catch (e) {
		throw_error(e);
		NProgress.done();
		$(".loading_image").hide()
	}
};

function searchStringInArray(str, strArray) {
	for (var j = 0; j < strArray.length; j++)
		if (strArray[j].match(str)) return j;
	return -1
}

function close_datepicker() {
	$("#start_date").datepicker("hide");
	$("#start_date").blur()
}
$(document).on("change", "#keywords", function() {
	if ($("#keywords").val()) $(".resetKeywordFilter").show();
	else {
		$(".resetKeywordFilter").hide();
		$("#keywords").val("");
		reset_form_validations("keyword_search_form");
		$("#keywords").val("")
	}
});

function custom_date_picker(id, format, div_id) {
	div_id = div_id === undefined ? "" : div_id;
	if (!div_id) div_id = "date_input_with_cross_pseudo";
	var placeholder = $("#" + id).attr("placeholder");
	if (!placeholder) placeholder = format;
	$("#" + id + "_pseudo  .default").html(placeholder);
	$("#" + id).datepicker({
		dateFormat: format,
		minDate: "+0d",
		maxDate: "+1y",
		orientation: "bottom",
		beforeShow: function(textbox, instance) {
			var txtBoxOffset = $("#" + id + "_pseudo").offset();
			var top = txtBoxOffset.top + 40;
			if (id == "start_date_mobile") {
				top = "unset";
				$("#ui-datepicker-div").css("margin-top", "-16px")
			}
			setTimeout(function() {
				instance.dpDiv.css({
					top: top,
					position: "absolute"
				})
			}, 0);
			updateFiltersObject("start_date", "");
			if (id == "start_date_mobile") $(this).after($(this).datepicker("widget"))
		},
		onClose: function() {
			if (window.innerWidth < 992) $("#start_date_mobile_container_overlay").hide()
		}
	}).on("change", function(e) {
		create_url_for_date_select(id);
		if (id == "start_date") {
			e.preventDefault();
			if (e.handled !== true) {
				e.handled = true;
				var url = get_url_for_left_panel("start_date");
				search(url, true)
			}
		}
	});
	$("#" + div_id).click(function(element) {
		var target = $(element.target);
		if (target.is("#" + div_id + " .date_clear"));
		else {
			if ($("#" + id + "_pseudo  .default").is(":visible")) {
				$("#" + id + "_pseudo  .default").show();
				$("#" + id + "_pseudo  .value").hide();
				$("#" + id + "_pseudo  .value span").html("");
				$("#" + id).val("")
			} else {
				$("#" + id + "_pseudo  .default").hide();
				$("#" + id + "_pseudo  .value").show()
			}
			$("#" + id).datepicker("show")
		}
	});
	$(document).on("click", "#" + div_id + " .date_clear", function(e) {
		$("#" + id + "_pseudo  .default").show();
		$("#" + id + "_pseudo  .value").hide();
		$("#" + id).datepicker("hide");
		$("#" + id).val("");
		$("#" + id + "_pseudo  .value span").html("");
		create_url_for_date_select(id);
		if (id == "start_date") {
			e.preventDefault();
			if (e.handled !== true) {
				e.handled = true;
				var url = get_url_for_left_panel("start_date");
				search(url, true)
			}
		}
	})
}

function create_url_for_date_select(id) {
	var final_date = "";
	if ($("#" + id).val()) {
		$("#" + id + "_pseudo  .default").hide();
		$("#" + id + "_pseudo  .value").show();
		$("#" + id + "_pseudo  .value span").html($("#" + id).val());
		var start_date_from_id = get_correct_date_format(id);
		var start_date = new Date(start_date_from_id);
		var curr_date = start_date.getDate();
		var curr_month = start_date.getMonth() + 1;
		if (curr_month < 10) curr_month = "0" + curr_month;
		if (curr_date < 10) curr_date = "0" + curr_date;
		var curr_year = start_date.getFullYear();
		final_date =
			curr_year + "-" + curr_month + "-" + curr_date;
		$("#" + id).val(final_date)
	} else {
		$("#" + id + "_pseudo  .default").show();
		$("#" + id + "_pseudo  .value").hide()
	}
	if (id == "start_date_mobile") {
		$("#start_date_mobile_container_overlay").hide();
		if (final_date !== "") $("#form_container_mobile .resetDateFilter").show();
		updateFiltersObject("start_date", final_date)
	}
}

function get_correct_date_format(id) {
	var date = $("#" + id).val().replace(/\'/g, "");
	var date_array = date.split(" ");
	return date_array[0] + " " + date_array[1] + " 20" + date_array[2]
}

function stipend_filter_desktop_set_value() {
	var slider = document.getElementById("stipend_filter");
	if (slider != null) {
		var value = slider.value;
		var closest = stipend_filters_values.reduce(function(prev, curr) {
			return Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
		});
		slider.value = closest;
		change_stipend_slider_filter_gradient_desktop()
	}
}

function change_stipend_slider_filter_gradient_desktop() {
	var slider = document.getElementById("stipend_filter");
	if (slider != null) {
		var slider_percentage = (slider.value - slider.min) / (slider.max - slider.min) * 100;
		slider.style.background = "linear-gradient(to right, #dddddd 0%, #dddddd " + slider_percentage + "%, #008BDC " + slider_percentage + "%, #008BDC 100%)";
		var stipend_values_container_name = "stipend_values_container";
		$("#" + stipend_values_container_name + " .stipend_value").removeClass("selected_stipend_value");
		$("#" +
			stipend_values_container_name + " .value_" + slider.value).addClass("selected_stipend_value")
	}
}

function compute_desktop_search_url_for_wfh_filters_for_job_ajax() {
	var category = getValueInStringFromMultiChosen("#categoryOptions  .chosen-select");
	var city = getValueInStringFromMultiChosen("#cityOptions  .chosen-select");
	var regular_url = "";
	var remote_job = "";
	var category_city_url = "";
	var new_url = "";
	if (city) city = "-in-" + city;
	if (category) category = category + "-";
	if ($("#internship_checkbox").is(":checked")) regular_url = "/internships";
	if ($("#remote_job").is(":checked")) remote_job = "/remote_jobs";
	if (category ||
		city) category_city_url = "/" + category + "jobs" + city;
	new_url = category_city_url + remote_job + regular_url;
	var pathname = window.location.pathname;
	var pathArray = pathname.split("/");
	var index = searchStringInArray("page-", pathArray);
	if (index !== -1) page_url = "page-" + pagenumber;
	else {
		var length = pathArray.length;
		if (pathArray[length - 1] !== "") page_url = "page-" + pagenumber;
		else page_url = "page-" + pagenumber
	}
	new_url = new_url + "/" + page_url;
	return new_url
};
var device = "";
var filtersCount = 0;
var to_show_filters_matching_preferences_notification = false;
var categoryArray = [];
var filter_types = {
	"category": [],
	"category_name_label_array": [],
	"city": [],
	"wfh": [],
	"part_time": [],
	"internship_checkbox": [],
	"remote_job": [],
	"start_date": [],
	"duration": [],
	"ifw": [],
	"ppo": [],
	"type": [],
	"keyword": [],
	"matching_preferences": [],
	"stipend": [],
	"fresher_jobs": [],
	"fast_response": [],
	"early_applicant": [],
	"employment_type_filter_selected": [],
	"salary": []
};
var month = new Array;
month[0] = "Jan";
month[1] = "Feb";
month[2] = "Mar";
month[3] = "Apr";
month[4] = "May";
month[5] = "Jun";
month[6] = "Jul";
month[7] = "Aug";
month[8] = "Sep";
month[9] = "Oct";
month[10] = "Nov";
month[11] = "Dec";
var customHistory = [];
var currentUrlWhenFilterModalShown = "";
var isFilterModalOpen = false;
var to_show_more_filters_mobile = false;
var employment_type_filter_selected = window.location.pathname.match(/employment_type_filter_selected-(job|internship)/);
if (employment_type === "both")
	if (employment_type_filter_selected === null) employment_type_filter_selected = "all";
	else employment_type_filter_selected = employment_type_filter_selected[0].split("-")[1];
$(document).ready(function() {
	updateCustomHistoryFromSessionStorage();
	checkPageFocus();
	internship_checkbox_text_change();
	if (window.innerWidth < 992) {
		device = "mobile";
		isFilterModalOpen = false;
		if (typeof filters_applied != "undefined") create_tags();
		var detail_page_path = "/internship/detail/";
		if (window.location.pathname.indexOf(detail_page_path) == -1)
			if (!from_campaign()) make_ajax_call_for_marketing_ads();
			else make_ajax_call_for_campaigns_marketing_ads();
		var isAppModalVisible = false;
		$(window).scroll(function() {
			var window_top =
				$(window).scrollTop();
			var container_height = typeof $("#internship_list_container").offset() != "undefined" ? $("#internship_list_container").offset().top : false;
			if (!from_campaign())
				if (!isFilterModalOpen)
					if (window_top < container_height) {
						if (!isAppModalVisible) {
							$("#android_app_message").slideUp();
							isAppModalVisible = true
						}
					} else {
						if (isAppModalVisible) {
							$("#android_app_message").slideDown();
							isAppModalVisible = false
						}
					}
			else $("#android_app_message").hide()
		});
		chosen_initialization();
		custom_date_picker("start_date_mobile",
			"d M'' y", "start_date_mobile_pseudo");
		filters_applied = set_all_filters_applied_keys_if_not_exists(JSON.parse(JSON.stringify(filters_applied)));
		updateAppliedFiltersCount(filters_applied);
		filter_types = filters_applied;
		mobile_filters();
		navigationMobile();
		$(window).bind("popstate", function(event) {
			var currentState = getLastEntryFromHistory(true);
			if (typeof currentState == "undefined" || currentState.indexOf("#filters") == -1) location.reload();
			else {
				hideSearchFiltersModal();
				updateAppliedFiltersCount(filters_applied);
				if (currentUrlWhenFilterModalShown != "") history.pushState({
					page: 1
				}, "internship search", currentUrlWhenFilterModalShown)
			}
		});
		initialise_filter_toggle_mobile();
		enable_save_search_as_alert_cta(employment_type)
	}
});
var initialise_filter_toggle_mobile = function() {
	show_less_filters_mobile();
	$(document).on("click", "#filter_toggle_mobile", function() {
		to_show_more_filters_mobile = !to_show_more_filters_mobile;
		if (to_show_more_filters_mobile) show_more_filters_mobile();
		else show_less_filters_mobile()
	})
};
var show_more_filters_mobile = function() {
	$(".more_filters_mobile").show();
	$("#filter_toggle_mobile span").text("View less filters");
	$("#filter_toggle_mobile i").removeClass("ic-16-s15-chevron-down");
	$("#filter_toggle_mobile i").addClass("ic-16-s15-chevron-up")
};
var show_less_filters_mobile = function() {
	$("#filter_toggle_mobile").css("display", "flex");
	$(".more_filters_mobile").hide();
	$("#filter_toggle_mobile span").text("View more filters");
	$("#filter_toggle_mobile i").removeClass("ic-16-s15-chevron-up");
	$("#filter_toggle_mobile i").addClass("ic-16-s15-chevron-down")
};

function getLastEntryFromHistory(toUpdateStorage) {
	var currentState = customHistory.pop();
	if (toUpdateStorage) updateCustomHistoryToSessionStorage();
	return currentState
}

function putEntryInHistory(url, toUpdateStorage) {
	customHistory.push(url);
	if (toUpdateStorage) updateCustomHistoryToSessionStorage()
}

function updateCustomHistoryToSessionStorage() {
	if (window.sessionStorage) sessionStorage.setItem("customHistory", JSON.stringify(customHistory))
}

function updateCustomHistoryFromSessionStorage() {
	if (window.sessionStorage) {
		customHistory = JSON.parse(sessionStorage.getItem("customHistory"));
		if (customHistory == null) customHistory = []
	} else customHistory = [];
	for (var i = customHistory.length - 1; i >= 0; i--) {
		var val = customHistory[i];
		if (val.indexOf("#filters") != -1) customHistory.pop();
		else break
	}
}
$(document).on("click", "#matching_preference_mobile", function() {
	updatePreferenceClickCheckboxData(true)
});
$(document).on("click", "chosen-drop", function() {
	$(".filtersModal_popover_overlay").hide();
	$(".popover_overlay").hide();
	$(".location-filters-popover").popover("hide")
});

function updatePreferenceClickCheckboxData(from_modal) {
	if (from_campaign()) return;
	if ($("#matching_preference_mobile").is(":checked")) {
		toShowMatchingPreferences = 1;
		enablePreferenceCheckedUI();
		$("#category_container").addClass("transparent");
		$("#category_container").addClass("showGeneralToastOnMobile");
		$("#category_container").removeClass("showGeneralToastOnMobileFalse");
		$("#location_filter_mobile").addClass("transparent");
		$("#location_filter_mobile").addClass("showGeneralToastOnMobile");
		$("#location_filter_mobile").removeClass("showGeneralToastOnMobileFalse");
		$(".filters_checkboxes_containers_add_transparent").addClass("transparent");
		$(".filters_checkboxes_containers_add_transparent").addClass("showGeneralToastOnMobile");
		$(".filters_checkboxes_containers_add_transparent").removeClass("showGeneralToastOnMobileFalse");
		$(".checkmark").css("border", "1px solid #ccc");
		$("#select_category_chosen .chosen-choices").addClass("select_chosen_disabled");
		$("#city_sidebar_chosen .chosen-choices").addClass("select_chosen_disabled");
		$("#keyword_search_form_mobile").addClass("transparent");
		$(".checkmark").css("cursor", "default")
	} else {
		searchedUrl = get_final_url("./internship-search.1660711313.js");
		searchCriteriasMobile();
		showSearchFiltersModal(false, false);
		toShowMatchingPreferences = 0;
		enablePreferenceUnCheckedUI();
		$("#category_container").removeClass("transparent");
		$("#category_container").addClass("showGeneralToastOnMobileFalse");
		$("#category_container").removeClass("showGeneralToastOnMobile");
		if (from_modal) {
			$("#category_container").attr("title", "");
			$("#location_filter_mobile").attr("title", "");
			$(".filters_checkboxes_containers_add_transparent").attr("title",
				"")
		}
		$("#location_filter_mobile").removeClass("transparent");
		$("#location_filter_mobile").addClass("showGeneralToastOnMobileFalse");
		$("#location_filter_mobile").removeClass("showGeneralToastOnMobile");
		$(".filters_checkboxes_containers_add_transparent").removeClass("transparent");
		$(".filters_checkboxes_containers_add_transparent").addClass("showGeneralToastOnMobileFalse");
		$(".filters_checkboxes_containers_add_transparent").removeClass("showGeneralToastOnMobile");
		$(".checkmark").css("border", "1px solid #ccc");
		$("#select_category_chosen .chosen-choices").removeClass("select_chosen_disabled");
		$("#city_sidebar_chosen .chosen-choices").removeClass("select_chosen_disabled");
		$("#keyword_search_form_mobile").removeClass("transparent");
		$(".checkmark").css("cursor", "pointer")
	}
}

function enablePreferenceCheckedUI() {
	if (from_campaign()) return;
	$("#cityOptions_mobile #city_sidebar ").val([]).trigger("chosen:updated");
	$("#cityOptions_mobile #city_sidebar ").prop("disabled", true).trigger("chosen:updated");
	$("#categoryOptions_mobile  .chosen-select").val([]).trigger("chosen:updated");
	$("#categoryOptions_mobile  .chosen-select").prop("disabled", true).trigger("chosen:updated");
	$("#work_from_home_mobile").prop("checked", false);
	$("#work_from_home_mobile").prop("disabled", true);
	$("#keywords_mobile").prop("disabled",
		true);
	$("#search_mobile").prop("disabled", true);
	if (employment_type == "job") {
		$("#internship_checkbox_mobile").prop("checked", false);
		$("#internship_checkbox_mobile").prop("disabled", true);
		$("#remote_job_mobile").prop("checked", false);
		$("#remote_job_mobile").prop("disabled", true);
		$("#fresher_job_checkbox_mobile").prop("checked", false);
		$("#fresher_job_checkbox_mobile").prop("disabled", true)
	} else {
		$("#part_time_mobile").prop("checked", false);
		$("#part_time_mobile").prop("disabled", true);
		$("#internship_type_mobile").prop("checked",
			false);
		$("#internship_type_mobile").prop("disabled", true)
	}
	filter_types.part_time.length = 0;
	filter_types.internship_checkbox.length = 0;
	filter_types.remote_job.length = 0;
	filter_types.type.length = 0;
	filter_types.wfh.length = 0;
	filter_types.city.length = 0;
	filter_types.category.length = 0;
	filter_types.category_name_label_array.length = 0;
	$(".showGeneralToastOnMobileFalse").addClass("showGeneralToastOnMobile").removeClass("showGeneralToastOnMobileFalse");
	updateAppliedFiltersCount(filter_types)
}

function enablePreferenceUnCheckedUI() {
	if (from_campaign()) return;
	if (employment_type == "job") {
		$("#internship_checkbox_mobile").prop("disabled", false);
		$("#remote_job_mobile").prop("disabled", false);
		$("#fresher_job_checkbox_mobile").prop("disabled", false)
	} else {
		$("#part_time_mobile").prop("disabled", false);
		$("#internship_type_mobile").prop("disabled", false)
	}
	$("#work_from_home_mobile").prop("disabled", false);
	$("#keywords_mobile").prop("disabled", false);
	$("#search_mobile").prop("disabled", false);
	$("#cityOptions_mobile #city_sidebar ").prop("disabled",
		false).trigger("chosen:updated");
	$("#categoryOptions_mobile  .chosen-select").prop("disabled", false).trigger("chosen:updated");
	$(".showGeneralToastOnMobile").addClass("showGeneralToastOnMobileFalse").removeClass("showGeneralToastOnMobile");
	updateAppliedFiltersCount(filter_types)
}
$(document).on("click", "#contentFilters #filtersModal .cancel", function() {
	hideSearchFiltersModal();
	getLastEntryFromHistory(true);
	if (from_campaign()) var matchingPreferences = 0;
	else var matchingPreferences = filters_applied.matching_preferences.length !== 0 ? 1 : 0;
	if (!matchingPreferences) {
		$("#matching_preference_mobile").prop("checked", false);
		toShowMatchingPreferences = 0;
		enablePreferenceUnCheckedUI();
		$("#category_container").removeClass("transparent");
		$("#category_container").addClass("showGeneralToastOnMobileFalse");
		$("#category_container").removeClass("showGeneralToastOnMobile");
		$("#location_filter_mobile").removeClass("transparent");
		$("#location_filter_mobile").addClass("showGeneralToastOnMobileFalse");
		$("#location_filter_mobile").removeClass("showGeneralToastOnMobile");
		$(".filters_checkboxes_containers_add_transparent").removeClass("transparent");
		$(".filters_checkboxes_containers_add_transparent").addClass("showGeneralToastOnMobileFalse");
		$(".filters_checkboxes_containers_add_transparent").removeClass("showGeneralToastOnMobile");
		$(".checkmark").css("border", "1px solid #ccc");
		$("#select_category_chosen .chosen-choices").removeClass("select_chosen_disabled");
		$("#city_sidebar_chosen .chosen-choices").removeClass("select_chosen_disabled");
		$(".checkmark").css("cursor", "pointer")
	} else $("#matching_preference_mobile").prop("checked", true);
	var keywords = filters_applied.keyword.length !== 0 ? filters_applied.keyword[0] : "";
	if (keywords != "") {
		var decodedKeyword = decodeURIComponent(keywords);
		var valueToDisplay = keywords;
		if (!(decodedKeyword.includes("<script>") ||
				decodedKeyword.includes("\x3c/script>") || decodedKeyword.includes("<SCRIPT>") || decodedKeyword.includes("\x3c/SCRIPT>") || decodedKeyword.includes("<Script>") || decodedKeyword.includes("\x3c/Script>"))) valueToDisplay = decodedKeyword;
		$("#keywords_mobile").val(valueToDisplay);
		$(".resetKeywordFilter").show()
	} else {
		$("#keywords_mobile").val("");
		$(".resetKeywordFilter").hide()
	}
});
$(document).on("click", "#contentFilters #filtersModal .reset", function() {
	getLastEntryFromHistory(true);
	filtersCount = 0;
	toShowMatchingPreferences = 0;
	internship_type = "";
	filter_types = {
		"category": [],
		"category_name_label_array": [],
		"city": [],
		"wfh": [],
		"part_time": [],
		"internship_checkbox": [],
		"remote_job": [],
		"start_date": [],
		"duration": [],
		"ifw": [],
		"ppo": [],
		"type": [],
		"keyword": [],
		"matching_preferences": [],
		"stipend": [],
		"employment_type_filter_selected": [],
		"fresher_jobs": [],
		"fast_response": [],
		"early_applicant": [],
		"salary": []
	};
	if (searchedUrl.indexOf("keywords-") < 0) {
		searchedUrl = "";
		$("#keywords_mobile").val("")
	} else {
		var keywords = $("#keywords_mobile").val();
		var keywords_encoded = encodeURIComponent(keywords);
		filter_types.keyword.push(keywords_encoded)
	}
	updateAppliedFiltersCount(filter_types);
	clearUpperFiltersView();
	$(".black_bottom_toast .toast-body").html($(this).attr("title"));
	if (!is_showing_toast) {
		is_showing_toast = true;
		$(".black_bottom_toast").fadeIn(400).delay(3E3).fadeOut(400, function() {
			is_showing_toast = false
		})
	}
	$("#work_from_home_label_mobile .work_from_home_content").html("Work from home");
	searchCriteriasMobile();
	matching_preferences_checkbox_jobs()
});
$(document).on("click", "#contentFilters #filtersModal .apply", function() {
	$("#keywords_mobile").val("");
	filter_types["keyword"].splice(0, 1);
	$(".resetKeywordFilter").hide();
	getLastEntryFromHistory(true);
	applyFilters()
});

function showSearchFiltersModal(toAddInHistory, toScrollToTop) {
	$("#wrapper").css("min-height", "0");
	$("#android_app_message").hide();
	$("#filtersModal").show();
	$("#header").hide();
	$("#content").hide();
	$("#footer").hide();
	if (typeof toScrollToTop == "undefined" || toScrollToTop) {
		$("html, body").animate({
			scrollTop: 0
		}, "slow");
		updateAppliedFiltersCount(filters_applied)
	}
	isFilterModalOpen = true;
	currentUrlWhenFilterModalShown = location.pathname;
	var keywords = filters_applied.keyword.length !== 0 ? filters_applied.keyword[0] :
		"";
	if (keywords != "") {
		var decodedKeyword = decodeURIComponent(keywords);
		var valueToDisplay = keywords;
		if (!(decodedKeyword.includes("<script>") || decodedKeyword.includes("\x3c/script>") || decodedKeyword.includes("<SCRIPT>") || decodedKeyword.includes("\x3c/SCRIPT>") || decodedKeyword.includes("<Script>") || decodedKeyword.includes("\x3c/Script>"))) valueToDisplay = decodedKeyword;
		$("#keywords_mobile").val(valueToDisplay)
	} else $("#keywords_mobile").val("");
	if (employment_type == "job") {
		if (window.history.state == null) history.pushState({
				page: 1
			},
			"job search", location.pathname)
	} else {
		var start_date = $("#start_date_mobile").val();
		if (start_date !== "") $("#form_container_mobile .resetDateFilter").show();
		else $("#form_container_mobile .resetDateFilter").hide();
		if (window.history.state == null) history.pushState({
			page: 1
		}, "internship search", location.pathname)
	}
	if (toAddInHistory) {
		var pathName = window.location.pathname;
		pathName.replace("#filters", "");
		putEntryInHistory(pathName + "#filters", true)
	}
}

function hideSearchFiltersModal(toScrollToTop) {
	updateWrapperHeight();
	$("#start_date_mobile").datepicker("hide");
	$("#filtersModal").hide();
	$("#header").show();
	$("#content").show();
	$("#footer").show();
	isFilterModalOpen = false;
	if (typeof toScrollToTop == "undefined" || toScrollToTop) $("html, body").animate({
		scrollTop: 0
	}, "slow")
}
$(document).on("click", ".removeTagFilter", function() {
	var filterType = $(this).closest(".filter_tag").attr("filter_type");
	if (filterType == "category" || filterType == "city") {
		var filterValue = $(this).closest(".filter_tag").attr("filter_value");
		filterValue = encodeURIComponent(filterValue.toLowerCase());
		if (filterType == "category") {
			var category_name_label_array_index = getIndexOfNameFromArray(filterValue);
			filter_types["category_name_label_array"].splice(category_name_label_array_index, 1)
		}
	} else var filterValue = $(this).closest(".filter_tag").attr("filter_value");
	filter_types[filterType].splice(filter_types[filterType].indexOf(filterValue), 1);
	if (filterType == "city" && typeof filter_types[filterType] != "undefined" && filter_types[filterType].length == 0) {
		$("#work_from_home_label_mobile .work_from_home_content").html("Work from home");
		$("#remote_check_box_label").html("Work from home")
	}
	if (filterType == "start_date") reset_mobile_start_date("");
	if (filterType == "duration") $("#select_duration_mobile").val([]).trigger("chosen:updated");
	if (filterType == "wfh") $("#work_from_home_mobile").prop("checked",
		false);
	if (filterType == "part_time") $("#part_time_mobile").prop("checked", false);
	if (filterType == "internship_checkbox") $("#internship_checkbox_mobile").prop("checked", false);
	if (filterType == "remote_job") $("#remote_job_mobile").prop("checked", false);
	if (filterType == "type") $("#internship_type_mobile").prop("checked", false);
	if (filterType == "ppo") $("#ppo_mobile").prop("checked", false);
	if (filterType == "ifw") {
		$("#internships_for_women_input_mobile").prop("checked", false);
		$("#internship_for_women").hide();
		$("#ifw_partners_container").hide();
		internship_type = ""
	}
	if (filterType == "matching_preferences") {
		$("#matching_preference_mobile").prop("checked", false);
		toShowMatchingPreferences = 0
	}
	if (filterType == "keyword") {
		$("#keywords_mobile").val("");
		$(".resetKeywordFilter").hide();
		reset_form_validations("keyword_search_form_mobile")
	}
	if (filterType == "stipend") $("#stipend_filter_mobile").val([]).trigger("chosen:updated");
	if (filterType == "fast_response") $("#fast_response_input_mobile").prop("checked", false);
	if (filterType == "early_applicant") $("#early_applicant_input_mobile").prop("checked",
		false);
	if (filterType == "fresher_jobs") $("#fresher_job_checkbox_mobile").prop("checked", false);
	if (filterType == "salary") $("#salary_3lpa_checkbox_mobile").prop("checked", false);
	applyFilters()
});
$(document).on("click", "#search_criteria_mobile_container .filterUi, #individual_internship_no_result_message .filterUi", function() {
	var part_time = filters_applied.part_time.length !== 0 ? filters_applied.part_time[0] : "";
	var internship_checkbox = filters_applied.internship_checkbox.length !== 0 ? filters_applied.internship_checkbox[0] : "";
	var remote_job = filters_applied.remote_job.length !== 0 ? filters_applied.remote_job[0] : "";
	var type = filters_applied.type.length !== 0 ? filters_applied.type[0] : "";
	var wfh = filters_applied.wfh.length !==
		0 ? filters_applied.wfh[0] : "";
	var ppo = filters_applied.ppo.length !== 0 ? filters_applied.ppo[0] : "";
	var duration = filters_applied.duration.length !== 0 ? filters_applied.duration[0] : "";
	var stipend = filters_applied.stipend.length !== 0 ? filters_applied.stipend[0] : 0;
	var fast_response = filters_applied.fast_response.length !== 0 ? filters_applied.fast_response[0] : "";
	var early_applicant = filters_applied.early_applicant.length !== 0 ? filters_applied.early_applicant[0] : "";
	var city = filters_applied.city.length !== 0 ? filters_applied.city : [];
	var category = filters_applied.category.length !== 0 ? filters_applied.category : [];
	var start_date = filters_applied.start_date.length !== 0 ? filters_applied.start_date[0] : "";
	var ifw = filters_applied.ifw.length !== 0 ? filters_applied.ifw[0] : "";
	var matchingPreferences = filters_applied.matching_preferences.length !== 0 ? 1 : 0;
	var fresher_job = filters_applied.fresher_jobs.length !== 0 ? 1 : 0;
	var salary = filters_applied.salary.length !== 0 ? 1 : 0;
	if (city.length > 0) {
		var temp_city = [];
		for (var i = 0; i < city.length; i++) {
			var city_name = decodeURIComponent(city[i]);
			temp_city.push(encodeURIComponent(city_name.toLowerCase()))
		}
		$("#cityOptions_mobile #city_sidebar ").val(temp_city).trigger("chosen:updated")
	} else $("#cityOptions_mobile #city_sidebar ").val([]).trigger("chosen:updated");
	if (category.length > 0) {
		var temp_cat = [];
		for (var i = 0; i < category.length; i++) {
			var cat_name = decodeURIComponent(category[i]);
			temp_cat.push(encodeURIComponent(cat_name.toLowerCase()))
		}
		$("#categoryOptions_mobile  .chosen-select").val(temp_cat).trigger("chosen:updated")
	} else $("#categoryOptions_mobile  .chosen-select").val([]).trigger("chosen:updated");
	$("#work_from_home_mobile").prop("checked", wfh ? true : false);
	if (employment_type == "job") {
		$("#internship_checkbox_mobile").prop("checked", internship_checkbox ? true : false);
		$("#remote_job_mobile").prop("checked", remote_job ? true : false);
		$("#fresher_job_checkbox_mobile").prop("checked", fresher_job ? true : false);
		$("#salary_3lpa_checkbox_mobile").prop("checked", salary ? true : false)
	} else {
		reset_mobile_start_date(start_date);
		if (duration) $("#select_duration_mobile ").val(duration).trigger("chosen:updated");
		$("#internships_for_women_input_mobile").prop("checked",
			ifw ? true : false);
		$("#internship_type_mobile").prop("checked", type ? true : false);
		$("#part_time_mobile").prop("checked", part_time ? true : false);
		$("#ppo_mobile").prop("checked", ppo ? true : false);
		$("#stipend_filter_mobile").val(stipend).trigger("chosen:updated");
		$("#fast_response_input_mobile").prop("checked", fast_response ? true : false);
		$("#early_applicant_input_mobile").prop("checked", early_applicant ? true : false);
		change_stipend_filter_mobile_input(stipend)
	}
	$("#matching_preference_mobile").prop("checked", matchingPreferences ?
		true : false);
	updatePreferenceClickCheckboxData(false);
	showSearchFiltersModal(true)
});
$(document).on("click", ".resetKeywordFilter", function() {
	$("#keywords_mobile").val("");
	$(".resetKeywordFilter").hide();
	reset_form_validations("keyword_search_form_mobile")
});
$(document).on("keyup", "#keywords_mobile", function() {
	if ($("#keywords_mobile").val()) $(".resetKeywordFilter").show();
	else {
		$(".resetKeywordFilter").hide();
		reset_form_validations("keyword_search_form_mobile");
		$("#keywords_mobile").val("")
	}
});
$(document).on("click", "#form_container_mobile .resetDateFilter", function() {
	reset_mobile_start_date("");
	filter_types.start_date.length = 0;
	$(".resetDateFilter").hide();
	updateAppliedFiltersCount(filter_types)
});

function mobile_filters() {
	searchCriteriasMobile();
	seo_heading();
	onChangeSearchFilters();
	matching_preferences_checkbox_jobs();
	$("#keyword_search_form_mobile").validate({
		rules: {
			keywords: {
				required: true,
				minlength: 3
			}
		},
		errorPlacement: function(label, element) {
			label.insertAfter(element.closest(".keyword"))
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
			var keywords = $("#keywords_mobile").val();
			var encoded = encodeURIComponent(keywords);
			filter_types.keyword.length = 0;
			filter_types.keyword.push(encoded);
			var new_url = "keywords-" + encoded;
			clearUpperFiltersView();
			filter_types.part_time.length = 0;
			filter_types.internship_checkbox.length =
				0;
			filter_types.remote_job.length = 0;
			filter_types.ifw.length = 0;
			filter_types.type.length = 0;
			filter_types.wfh.length = 0;
			filter_types.ppo.length = 0;
			filter_types.duration.length = 0;
			filter_types.city.length = 0;
			filter_types.category.length = 0;
			filter_types.start_date.length = 0;
			filter_types.category_name_label_array.length = 0;
			filter_types.stipend.length = 0;
			internship_type = "";
			filters_applied = JSON.parse(JSON.stringify(filter_types));
			hideSearchFiltersModal();
			getLastEntryFromHistory(true);
			create_tags();
			updateAppliedFiltersCount(filters_applied);
			search_mobile(new_url, "");
			$("resetKeywordFilter").show()
		}
	})
}

function clearUpperFiltersView() {
	$("#cityOptions_mobile #city_sidebar ").val("").trigger("chosen:updated");
	$("#categoryOptions_mobile  .chosen-select").val("").trigger("chosen:updated");
	$("#work_from_home_mobile").prop("checked", false);
	$('input[name="employment_type_mobile"]').prop("checked", false);
	$("#m_radio1").prop("checked", true);
	if (employment_type_filter_selected !== null) employment_type_filter_selected = "all";
	if (employment_type == "job") {
		$("#internship_checkbox_mobile").prop("checked", false);
		$("#remote_job_mobile").prop("checked",
			false);
		$("#fresher_job_checkbox_mobile").prop("checked", false);
		$("#salary_3lpa_checkbox_mobile").prop("checked", false)
	} else {
		reset_mobile_start_date("");
		$("#select_duration_mobile").val([]).trigger("chosen:updated");
		$("#internships_for_women_input_mobile").prop("checked", false);
		$("#internship_type_mobile").prop("checked", false);
		$("#part_time_mobile").prop("checked", false);
		$("#ppo_mobile").prop("checked", false);
		$("#stipend_filter_mobile").val([]).trigger("chosen:updated");
		$("#fast_response_input_mobile").prop("checked",
			false);
		$("#early_applicant_input_mobile").prop("checked", false)
	}
}
var searchCriteriasMobile = function() {
	var fresher_job = filters_applied.fresher_jobs.length !== 0 ? 1 : 0;
	var internship_checkbox = filters_applied.internship_checkbox.length !== 0 ? filters_applied.internship_checkbox[0] : "";
	keyword_input_changes("keywords_mobile");
	if (typeof searchedUrl == "undefined") searchedUrl = "";
	$("#cityOptions_mobile #city_sidebar ").prop("disabled", true).trigger("chosen:updated");
	$("#categoryOptions_mobile  .chosen-select").prop("disabled", true).trigger("chosen:updated");
	$("#select_category_chosen").css("pointer-events",
		"none");
	$("#city_sidebar_chosen").css("pointer-events", "none");
	if (typeof employment_type != "undefined" && employment_type === "internship" || employment_type_filter_selected === "internship") {
		var url = "internship";
		if (typeof internship_type != undefined && internship_type == "internship_for_women") url = "ifwinternship";
		var final_url = "/" + url + "/get_search_criterias_newui/"
	} else {
		url = "job";
		var final_url = "/" + url + "/get_search_criterias/"
	}
	var searchedUrl_array = searchedUrl.split("%3F");
	var params = "";
	params = searchedUrl_array[0];
	if (typeof searchedUrl_array[0] !== "undefined") params = searchedUrl_array[0];
	else {
		searchedUrl_array = searchedUrl.split("?");
		if (typeof searchedUrl_array[0] !== "undefined") params = searchedUrl_array[0];
		else params = searchedUrl
	}
	if (fresher_job != "") params = params + "/job_type-fresher_job";
	if (internship_checkbox != "") params = params + "/include_internship-true";
	final_url = final_url + params;
	$(".loading_image").show();
	$.ajax(final_url, {
		type: "GET",
		success: searchCriteriasMobileSuccess,
		error: onError,
		datatype: "text"
	});
	return false
};
var covid_search_mobile_success = function(data) {};
var searchCriteriasMobileSuccess = function(data) {
	try {
		if (device === "mobile") {
			$("#cityOptions_mobile").html(data.cityView);
			$("#categoryOptions_mobile").html(data.categoryView)
		} else {
			$("#cityOptions").html(data.cityView);
			$("#categoryOptions").html(data.categoryView)
		}
		$("#select_category_chosen").css("pointer-events", "auto");
		$("#city_sidebar_chosen").css("pointer-events", "auto");
		chosen_initialization();
		if (filters_applied["start_date"].length || filters_applied["duration"].length || filters_applied["ppo"].length ||
			filters_applied["ifw"].length || filters_applied["fast_response"].length || filters_applied["early_applicant"].length) {
			to_show_more_filters_mobile = true;
			show_more_filters_mobile()
		} else {
			to_show_more_filters_mobile = false;
			show_less_filters_mobile()
		}
		if (device === "mobile") {
			var category = filters_applied.category.length !== 0 ? filters_applied.category : [];
			var chosenCat = [];
			$(data.categoryArray).each(function() {
				var tempVal = this.name;
				tempVal = encodeURIComponent(tempVal.toLowerCase());
				tempVal != "" ? chosenCat.push(tempVal) :
					""
			});
			for (var i = 0; i < category.length; i++) {
				var categoryToSearch = category[i];
				var categoryToSearchTemp = category[i].toLowerCase();
				if ($.inArray(categoryToSearchTemp, chosenCat) == -1) $("#select_category").append('<option value="' + categoryToSearchTemp + '">' + jsUcfirst(categoryToSearch) + "</option>")
			}
			$("#select_category").trigger("chosen:updated");
			var city = filters_applied.city.length !== 0 ? filters_applied.city : [];
			var chosenCity = [];
			$(data.cityArray).each(function() {
				var tempVal = this;
				tempVal = !tempVal ? "" : encodeURIComponent(tempVal.toLowerCase());
				tempVal != "" ? chosenCity.push(tempVal) : ""
			});
			for (var i = 0; i < city.length; i++) {
				var cityToSearch = city[i];
				var cityToSearchTemp = city[i].toLowerCase();
				if ($.inArray(cityToSearchTemp, chosenCity) == -1) $("#city_sidebar").append('<option value="' + cityToSearchTemp + '">' + jsUcfirst(cityToSearch) + "</option>")
			}
			$("#city_sidebar").trigger("chosen:updated")
		}
		categoryArray = JSON.parse(JSON.stringify(data.categoryArray));
		var city = getValueInStringFromMultiChosen("#cityOptions_mobile #city_sidebar");
		if (city !== "")
			if (employment_type ==
				"internship") $("#part_time_check_box_mobile").show();
		updateAppliedFiltersCount(filter_types);
		$("#cityOptions_mobile #city_sidebar ").prop("disabled", false).trigger("chosen:updated");
		$("#categoryOptions_mobile  .chosen-select").prop("disabled", false).trigger("chosen:updated");
		$(".loading_image").hide()
	} catch (e) {
		throw_error(e);
		NProgress.done();
		$(".loading_image").hide()
	}
};

function updateFiltersObject(filter_type, value) {
	if (filter_type === "category") {
		filter_types[filter_type].length = 0;
		filter_types.category_name_label_array.length = 0;
		if (value !== "") {
			var data = value.split(",");
			for (var i = 0; i < data.length; i++)
				if (filter_types[filter_type].indexOf(data[i]) === -1) {
					filter_types[filter_type].push(data[i]);
					var category_name_label_object = getNameLabelObject(data[i]);
					if (category_name_label_object !== "") filter_types.category_name_label_array.push(category_name_label_object)
				}
		}
	} else if (filter_type ===
		"city") {
		filter_types[filter_type].length = 0;
		if (value !== "") {
			var data = value.split(",");
			for (var i = 0; i < data.length; i++)
				if (filter_types[filter_type].indexOf(data[i]) === -1) filter_types[filter_type].push(data[i])
		}
	} else if (typeof filter_types[filter_type] !== "undefined") {
		filter_types[filter_type].length = 0;
		if (value !== "") filter_types[filter_type].push(value)
	}
	var filters_count = 0;
	for (var key in filter_types) {
		if (key === "category_name_label_array") continue;
		if (filter_types[key].length) filters_count++
	}
	if (filters_count ==
		1 && filter_types["internship_checkbox"].length) {
		filter_types["internship_checkbox"].length = 0;
		filter_types["internship_checkbox"].push("Include all internships")
	} else if (filters_count > 1)
		if (filter_types["internship_checkbox"].length) {
			filter_types["internship_checkbox"].length = 0;
			filter_types["internship_checkbox"].push("Include all internships matching filters")
		} updateAppliedFiltersCount(filter_types)
}

function updateAppliedFiltersCount(filter_values) {
	var filters_count = getAppliedFiltersCount(filter_values);
	if (filters_count > 0) {
		$("#filter_ui_icon_mobile").removeClass("ic-16-filter");
		$("#filter_ui_icon_mobile").addClass("ic-24-filter-applied");
		$("#filter_ui_heading_mobile").removeClass("heading_5");
		$("#filter_ui_heading_mobile").addClass("heading_6")
	} else {
		$("#filter_ui_icon_mobile").removeClass("ic-24-filter-applied");
		$("#filter_ui_icon_mobile").addClass("ic-16-filter");
		$("#filter_ui_heading_mobile").removeClass("heading_6");
		$("#filter_ui_heading_mobile").addClass("heading_5")
	}
	if (filters_count > 1) $("#internship_check_box_label").html("Include all internships matching filters");
	else if (filters_count == 1)
		if (!filter_values["internship_checkbox"].length && !filter_values["matching_preferences"].length) $("#internship_check_box_label").html("Include all internships matching filters");
		else $("#internship_check_box_label").html("Include all internships");
	else $("#internship_check_box_label").html("Include all internships")
}

function create_tags() {
	$(".filters_tags").html("");
	$(".filters_tags").hide();
	var tags_count = 0;
	for (var key in filters_applied) {
		var value = filters_applied[key];
		if (key == "category") continue;
		if (key == "stipend" && value <= 0) continue;
		if (filters_applied[key].length > 0) {
			var value = filters_applied[key];
			if (key === "category_name_label_array")
				for (var i = 0; i < value.length; i++) {
					tags_count++;
					cleanedValue = value[i];
					if (cleanedValue)
						if (tags_count <= 5) {
							var tag = " <div class='filter_tag' filter_type='category' filter_value='" + cleanedValue.name +
								"'><div>" + cleanedValue.label + "</div><i class='removeTagFilter ic-16-cross'></i></div>";
							$(".filters_tags").css("display", "flex");
							$(".filters_tags").append(tag)
						}
				} else if (key === "city")
					for (var i = 0; i < value.length; i++) {
						tags_count++;
						if (tags_count <= 5) {
							var cleanedValue = jsUcfirst(decodeURIComponent(value[i]));
							var tag = " <div class='filter_tag' filter_type='" + key + "' filter_value='" + cleanedValue + "'><div>" + cleanedValue + "</div><i class='removeTagFilter ic-16-cross'></i></div>";
							$(".filters_tags").css("display", "flex");
							$(".filters_tags").append(tag)
						}
					} else {
						tags_count++;
						if (tags_count <= 5) {
							if (key == "duration") {
								if (value) value = "Duration <= " + value + " month" + (value > 1 ? "s" : "")
							} else if (key == "start_date") value = "Date >= " + GetFormattedDate(value);
							else if (key == "keyword") {
								var decodedKeyword = decodeURIComponent(value);
								var valueToDisplay = value;
								if (!(decodedKeyword.includes("<script>") || decodedKeyword.includes("\x3c/script>") || decodedKeyword.includes("<SCRIPT>") || decodedKeyword.includes("\x3c/SCRIPT>") || decodedKeyword.includes("<Script>") ||
										decodedKeyword.includes("\x3c/Script>"))) valueToDisplay = decodedKeyword;
								value = "Keyword: " + valueToDisplay
							} else if (key == "stipend")
								if (value > 0) value = 'At least <i class="ic-16-currency-inr"></i> ' + value + "/month";
							var tag = " <div class='filter_tag' filter_type='" + key + "' filter_value='" + value + "'><div>" + value + "</div><i class='removeTagFilter ic-16-cross'></i></div>";
							$(".filters_tags").css("display", "flex");
							$(".filters_tags").append(tag)
						}
					}
		}
	}
	if (tags_count > 5) {
		var moreTags = '<div class="filter_tag filterUi"><div>+' +
			(tags_count - 5) + " more</div></div>";
		$(".filters_tags").css("display", "flex");
		$(".filters_tags").append(moreTags)
	}
}

function applyFilters() {
	var ifw = filter_types.ifw.length !== 0 ? filter_types.ifw[0] : "";
	var fresher_jobs = filter_types.fresher_jobs.length !== 0 ? filter_types.fresher_jobs[0] : "";
	var internship_checkbox = filter_types.internship_checkbox.length !== 0 ? filter_types.internship_checkbox[0] : "";
	var remote_job = filter_types.remote_job.length !== 0 ? filter_types.remote_job[0] : "";
	filters_applied = JSON.parse(JSON.stringify(filter_types));
	var is_wfh_url = false;
	if (remote_job !== "" && internship_checkbox !== "") is_wfh_url = true;
	create_tags();
	reset_form_validations("keyword_search_form_mobile");
	search_url = get_final_url("./internship-search.1660711313.js");
	search_mobile(search_url, ifw, fresher_jobs, is_wfh_url)
}

function jsUcfirst(string) {
	return string.charAt(0).toUpperCase() + string.slice(1)
}

function campaign_get_final_url("./internship-search.1660711313.js") {
	$("#keywords_mobile").val("");
	hideSearchFiltersModal(false);
	var part_time = filter_types.part_time.length !== 0 ? filter_types.part_time[0] : "";
	var wfh = filter_types.wfh.length !== 0 ? filter_types.wfh[0] : "";
	var ppo = filter_types.ppo.length !== 0 ? filter_types.ppo[0] : "";
	var duration = filter_types.duration.length !== 0 ? filter_types.duration[0] : "";
	var city = filter_types.city.length !== 0 ? filter_types.city.toString() : "";
	var category = filter_types.category.length !== 0 ? filter_types.category.toString() :
		"";
	var start_date = filter_types.start_date.length !== 0 ? filter_types.start_date[0] : "";
	var keywords = filter_types.keyword.length !== 0 ? filter_types.keyword.toString() : "";
	var stipend = filter_types.stipend.length !== 0 ? filter_types.stipend[0] : 0;
	var etfs = filter_types.employment_type_filter_selected.length !== 0 ? filter_types.employment_type_filter_selected[0] : "";
	var args = [];
	if (keywords !== "") return "keywords-" + keywords;
	if (part_time !== "") args.push("part-time-true");
	if (wfh !== "") args.push("work_from_home-true");
	if (city !==
		"") args.push("city-" + city);
	if (category !== "") args.push("category-" + category);
	if (duration !== "") args.push("duration-" + duration);
	if (ppo !== "") args.push("ppo-true");
	else if (typeof campaign_name !== "undefined" && campaign_name === "branding_campaign_grads_2020") args.push("ppo-false");
	if (start_date !== "") args.push("start-date-" + start_date.replace(/-/g, ""));
	if (stipend > 0) args.push("stipend-" + stipend);
	if (etfs !== "") args.push("employment_type_filter_selected-" + employment_type_filter_selected);
	return args.join("/")
}

function get_final_url("./internship-search.1660711313.js") {
	if (from_campaign()) return campaign_get_final_url("./internship-search.1660711313.js");
	var category_location_url = "";
	var duration_url = "";
	var search_url = "";
	var start_date_url = "";
	var keywords_url = "";
	var stipend_url = "";
	$("#keywords_mobile").val("");
	hideSearchFiltersModal(false);
	var part_time = filter_types.part_time.length !== 0 ? filter_types.part_time[0] : "";
	var internship_checkbox = filter_types.internship_checkbox.length !== 0 ? filter_types.internship_checkbox[0] : "";
	var remote_job = filter_types.remote_job.length !== 0 ? filter_types.remote_job[0] :
		"";
	var type = filter_types.type.length !== 0 ? filter_types.type[0] : "";
	var wfh = filter_types.wfh.length !== 0 ? filter_types.wfh[0] : "";
	var ppo = filter_types.ppo.length !== 0 ? filter_types.ppo[0] : "";
	var duration = filter_types.duration.length !== 0 ? filter_types.duration[0] : "";
	var city = filter_types.city.length !== 0 ? filter_types.city.toString() : "";
	var category = filter_types.category.length !== 0 ? filter_types.category.toString() : "";
	var start_date = filter_types.start_date.length !== 0 ? filter_types.start_date[0] : "";
	var matchingPreferences =
		filter_types.matching_preferences.length !== 0 ? 1 : 0;
	var ifw = filter_types.ifw.length !== 0 ? filter_types.ifw[0] : "";
	var keywords = filter_types.keyword.length !== 0 ? filter_types.keyword.toString() : "";
	var stipend = filter_types.stipend.length !== 0 ? filter_types.stipend[0] : 0;
	var fast_response = filter_types.fast_response.length !== 0 ? filter_types.fast_response[0] : "";
	var early_applicant = filter_types.early_applicant.length !== 0 ? filter_types.early_applicant[0] : "";
	var fresher_jobs = filter_types.fresher_jobs.length !== 0 ? filter_types.fresher_jobs[0] :
		"";
	var salary = filter_types.salary.length !== 0 ? filter_types.salary[0] : "";
	var is_new_part_time_url = 0;
	var is_multiple_cities = 0;
	var city_array = city.split(",");
	if (city_array.length > 1) is_multiple_cities = 1;
	category = category.replace(/%20/g, "-");
	toShowMatchingPreferences = matchingPreferences;
	if (employment_type == "job") {
		var regular_url = "";
		var remote_job_url = "";
		var category_city_url = "";
		if (city) city = "-in-" + city;
		if (category) category = category + "-";
		if (internship_checkbox)
			if (remote_job)
				if (fresher_jobs) {
					remote_job_url =
						"/work-from-home";
					if (category || city) {
						category_city_url = "/" + category + "jobs" + city;
						regular_url = "/internships"
					} else regular_url = "/internships"
				} else if (category || city) {
			search_url = "/work-from-home-" + category + "jobs" + city;
			salary !== "" ? search_url += "/3lpa-job" : ""
		} else {
			search_url = "/work-from-home-jobs";
			salary !== "" ? search_url += "/3lpa-job" : ""
		} else if (category || city) {
			category_city_url = "/" + category + "jobs" + city;
			regular_url = "/internships"
		} else regular_url = "/internships";
		else {
			if (remote_job) remote_job_url = "/work-from-home";
			if (category || city) category_city_url = "/" + category + "jobs" + city
		}
		if (keywords !== "") keywords_url = "keywords-" + keywords;
		if (keywords_url && keywords_url !== "") search_url = keywords_url;
		else if (search_url == "") {
			search_url = category_city_url + remote_job_url + regular_url;
			salary !== "" ? search_url += "/3lpa-job" : ""
		}
	} else {
		if (part_time !== "" && type === "" && is_multiple_cities === 0)
			if (city === "" && category === "") {
				category_location_url = "part-time-jobs";
				is_new_part_time_url = 1
			} else if (category === "") {
			category_location_url = "part-time-jobs-in-";
			is_new_part_time_url = 1
		} else if (city !== "" && category !== "") {
			category_location_url = "part-time-";
			is_new_part_time_url = 1
		}
		if (wfh !== "") {
			is_new_part_time_url = 0;
			if (city === "" && category === "") category_location_url = "work-from-home-" + type + "internships";
			else category_location_url = "work-from-home-"
		}
		if (city !== "" && category !== "")
			if (part_time !== "" && type === "" && is_multiple_cities === 0 && wfh === "") {
				category_location_url += category + "-" + type + "jobs-in-" + city;
				is_new_part_time_url = 1
			} else if (wfh !== "") category_location_url += category +
			"-" + type + "internships-in-" + city;
		else category_location_url += category + "-" + type + "internship-in-" + city;
		else if (city !== "")
			if (part_time !== "" && type === "" && is_multiple_cities === 0 && wfh === "") {
				category_location_url += city;
				is_new_part_time_url = 1
			} else {
				if (wfh !== "") category_location_url += type + "internships-in-" + city;
				else category_location_url += type + "internship-in-" + city;
				is_new_part_time_url = 0
			}
		else if (category !== "")
			if (wfh !== "") category_location_url += category + "-" + type + "internships";
			else category_location_url += category +
				"-" + type + "internship";
		if (duration !== "") duration_url = "duration-" + duration;
		if (keywords !== "") keywords_url = "keywords-" + keywords;
		if (start_date) start_date_url = "start-date-" + start_date.replace(/-/g, "");
		if (stipend > 0) stipend_url = "stipend-" + stipend;
		if (keywords_url) keywords_url !== "" ? search_url += keywords_url : "";
		else {
			category_location_url !== "" ? search_url += category_location_url : "";
			ppo !== "" ? search_url += "/ppo-true" : "";
			part_time !== "" && is_new_part_time_url === 0 ? search_url += "/part-time-true" : "";
			duration !== "" ? search_url +=
				"/" + duration_url : "";
			start_date !== "" ? search_url += "/" + start_date_url : "";
			big_brand === "yes" && toShowMatchingPreferences !== 1 ? search_url += "/big-brand" : "";
			stipend > 0 ? search_url += "/" + stipend_url : "";
			fast_response !== "" ? search_url += "/fast-response-true" : "";
			early_applicant !== "" ? search_url += "/early-applicant-25" : ""
		}
	}
	if (toShowMatchingPreferences) {
		var preferences_url = get_url_for_matching_preference();
		if (preferences_url) search_url = "/" + get_url_for_matching_preference() + search_url
	}
	return search_url
}

function search_mobile(search_url, ifw, fresher_jobs, is_wfh_url) {
	is_wfh_url = is_wfh_url === undefined ? false : is_wfh_url;
	search_url.replace("#filters", "");
	if (from_campaign()) {
		var url_to_append = "campaign_id-" + campaign_id + "/disable-student_checks-true/" + search_url;
		marketing(url_to_append);
		history.pushState({
			page: 1
		}, document.title, "/" + campaign_url + "/" + encodeURIComponent(search_url));
		putEntryInHistory("/" + campaign_url + "/" + search_url, true);
		search_url = "/internship/search_ajax/" + url_to_append
	} else {
		marketing(search_url);
		if (search_url) {
			var lastChar = search_url.substr(-1);
			if (lastChar != "/") search_url = search_url + "/"
		}
		search_url = search_url.replace(/^\/+/, "");
		if (typeof employment_type != "undefined" && employment_type !== "job")
			if (ifw !== "") {
				history.pushState({
					page: 1
				}, "internship search", "/internships-for-women/" + search_url);
				putEntryInHistory("/internships-for-women/" + search_url, true);
				search_url = "/internships-for-women_ajax/" + search_url
			} else {
				history.pushState({
					page: 1
				}, "internship search", "/internships/" + search_url);
				putEntryInHistory("/internships/" +
					search_url, true);
				search_url = "/internships_ajax/" + search_url
			}
		else if (fresher_jobs !== "") {
			history.pushState({
				page: 1
			}, "job search", "/fresher-jobs/" + search_url);
			search_url = "/fresher-jobs_ajax/" + search_url
		} else {
			if (is_wfh_url) {
				history.pushState({
					page: 1
				}, "job search", "/" + search_url);
				search_url = compute_search_url_for_wfh_filters_for_job_ajax()
			} else history.pushState({
				page: 1
			}, "job search", "/jobs/" + search_url);
			search_url = "/jobs_ajax/" + search_url
		}
	}
	NProgress.start();
	$(".loading_image").show();
	$.ajax(search_url, {
		type: "GET",
		success: search_success_mobile,
		error: onError,
		datatype: "text"
	})
}
var search_success_mobile = function(data) {
	NProgress.done();
	var seo = data.seo;
	scroll_page_number = 1;
	filters_applied = filter_types;
	document.title = seo.title;
	scroll_from_id = data.scroll_from_id;
	var internship_seo_heading_html = data.internship_seo_heading_html;
	var internship_list_html = data.internship_list_html;
	var popular_locations_html = data.popular_locations_html;
	var faqs_html = data.faqs_html;
	$("#search_criteria_mobile_container #internship_seo_heading_container").html(internship_seo_heading_html);
	$("#internship_list_container").html(internship_list_html);
	$("#dual_search_container").html(popular_locations_html);
	$("#search_page_faqs").html(faqs_html);
	$("#matching_preference_mobile").prop("disabled", false);
	categoryArray = data.categoryArray;
	if (typeof internship_type !== "undefined" && internship_type == "internship_for_women") {
		goToByScroll("internship_for_women");
		$("#internship_for_women").show();
		$("#ifw_partners_container").show();
		$("#header_registration_link").attr("href", "/registration/student?utm_source=ifwregistrationheader")
	} else {
		$("#internship_for_women").hide();
		$("#ifw_partners_container").hide();
		$("#header_registration_link").attr("href", "/registration/student")
	}
	if (!from_campaign()) seo_heading();
	else goToByScroll("internships_list_container");
	popovers();
	if (to_show_filters_matching_preferences_notification) {
		if (device == "mobile") showSearchFiltersModal(true);
		show_filters_matching_preferences_notification_new_ui()
	}
	searchedUrl = data.searchedUrl;
	if (!from_campaign())
		if (typeof internship_type != undefined && internship_type == "internship_for_women")
			if (searchedUrl.indexOf("page-1") >=
				0) {
				$("#internship_for_women").show();
				$("#ifw_partners_container").show()
			} else if (searchedUrl.indexOf("page") == -1) {
		$("#internship_for_women").show();
		$("#ifw_partners_container").show()
	} else {
		$("#internship_for_women").hide();
		$("#ifw_partners_container").hide()
	} else {
		$("#internship_for_women").hide();
		$("#ifw_partners_container").hide()
	}
	pagenumber = $("#pageNumber").val();
	islastpage = $("#isLastPage").val();
	if (islastpage == "1") $("#navigation-forward").addClass("disabled");
	else $("#navigation-forward").removeClass("disabled");
	if (pagenumber == 1) $("#navigation-backward").addClass("disabled");
	else $("#navigation-backward").removeClass("disabled");
	searchCriteriasMobile();
	navigationMobile();
	if (typeof subscription_form_validate != "undefined") subscription_form_validate();
	if (!from_campaign()) $("html, body").animate({
		scrollTop: 0
	}, "slow");
	enable_save_search_as_alert_cta(employment_type);
	$(".loading_image").hide()
};
var navigationMobile = function() {
	pagenumber = $("#pageNumber").html();
	islastpage = $("#isLastPage").val();
	if (islastpage == "1") $("#navigation-forward").addClass("disabled");
	else {
		$("#navigation-forward").removeClass("disabled");
		$("#navigation-forward").click(function() {
			pagenumber = parseInt(pagenumber, 10) + 1;
			filter_types = filters_applied;
			var ifw = filter_types.ifw.length !== 0 ? filter_types.ifw[0] : "";
			var fresher_jobs = filter_types.fresher_jobs.length !== 0 ? filter_types.fresher_jobs[0] : "";
			var internship_checkbox = filter_types.internship_checkbox.length !==
				0 ? filter_types.internship_checkbox[0] : "";
			var remote_job = filter_types.remote_job.length !== 0 ? filter_types.remote_job[0] : "";
			var is_wfh_url = false;
			if (remote_job !== "" && internship_checkbox !== "" && fresher_jobs === "") is_wfh_url = true;
			search_url = get_url_for_navigation_panel(is_wfh_url);
			search_mobile(search_url, ifw, fresher_jobs, is_wfh_url)
		})
	}
	if (pagenumber == 1) $("#navigation-backward").addClass("disabled");
	else {
		$("#navigation-backward").removeClass("disabled");
		$("#navigation-backward").click(function() {
			pagenumber =
				parseInt(pagenumber, 10) - 1;
			filter_types = filters_applied;
			var ifw = filter_types.ifw.length !== 0 ? filter_types.ifw[0] : "";
			var fresher_jobs = filter_types.fresher_jobs.length !== 0 ? filter_types.fresher_jobs[0] : "";
			var internship_checkbox = filter_types.internship_checkbox.length !== 0 ? filter_types.internship_checkbox[0] : "";
			var remote_job = filter_types.remote_job.length !== 0 ? filter_types.remote_job[0] : "";
			var is_wfh_url = false;
			if (remote_job !== "" && internship_checkbox !== "" && fresher_jobs === "") is_wfh_url = true;
			wfh_url = "";
			if (is_wfh_url) wfh_url =
				compute_search_url_for_wfh_filters_for_job_ajax();
			search_url = get_url_for_navigation_panel(wfh_url);
			search_mobile(search_url, ifw, fresher_jobs, is_wfh_url)
		})
	}
};
var covid_search_mobile_success = function(data) {};

function onChangeSearchFilters() {
	$(document).on("change", "#categoryOptions_mobile .chosen-select", function() {
		var category = getValueInStringFromMultiChosen("#categoryOptions_mobile  .chosen-select");
		filter_types.keyword.length = 0;
		updateFiltersObject("category", category);
		searchedUrl = get_final_url("./internship-search.1660711313.js");
		searchCriteriasMobile();
		showSearchFiltersModal(false, false)
	});
	$(document).on("change", "#cityOptions_mobile #city_sidebar", function() {
		var city = getValueInStringFromMultiChosen("#cityOptions_mobile #city_sidebar");
		$(".location-filters-popover").popover("hide");
		$(".filtersModal_popover_overlay").hide();
		$(".modal-backdrop").hide();
		filter_types.keyword.length = 0;
		if (city !== "") {
			$("#work_from_home_mobile_label").html("Include work from home also");
			$("#remote_check_box_label").html("Include work from home also")
		} else {
			$("#work_from_home_mobile_label").html("Work from home");
			$("#remote_check_box_label").html("Work from home")
		}
		updateFiltersObject("city", city);
		searchedUrl = get_final_url("./internship-search.1660711313.js");
		searchCriteriasMobile();
		showSearchFiltersModal(false,
			false)
	});
	$("#select_duration_mobile").change(function() {
		var duration = $("#select_duration_mobile").val();
		if (duration && duration.length > 0) updateFiltersObject("duration", duration[0]);
		else {
			updateFiltersObject("duration", "");
			$("#select_duration_mobile_chosen .chosen-search-input").addClass("default")
		}
	});
	$("#ppo_mobile").click(function() {
		if ($("#ppo_mobile").is(":checked")) updateFiltersObject("ppo", "With job offer");
		else updateFiltersObject("ppo", "")
	});
	$("#fast_response_input_mobile").click(function() {
		if ($("#fast_response_input_mobile").is(":checked")) updateFiltersObject("fast_response",
			"Fast response");
		else updateFiltersObject("fast_response", "")
	});
	$("#early_applicant_input_mobile").click(function() {
		if ($("#early_applicant_input_mobile").is(":checked")) updateFiltersObject("early_applicant", "Early applicant");
		else updateFiltersObject("early_applicant", "")
	});
	$("#work_from_home_mobile").click(function() {
		if ($("#work_from_home_mobile").is(":checked"))
			if (employment_type == "job") updateFiltersObject("wfh", "Work from home jobs");
			else updateFiltersObject("wfh", "Work from home");
		else updateFiltersObject("wfh",
			"")
	});
	$("#internships_for_women_input_mobile").click(function() {
		if ($("#internships_for_women_input_mobile").is(":checked")) {
			internship_type = "internship_for_women";
			updateFiltersObject("ifw", "For Women")
		} else {
			internship_type = "";
			$("#internship_for_women").hide();
			$("#ifw_partners_container").hide();
			updateFiltersObject("ifw", "")
		}
	});
	$("#internship_type_mobile").click(function() {
		if ($("#internship_type_mobile").is(":checked")) updateFiltersObject("type", "Summer");
		else updateFiltersObject("type", "")
	});
	$("#part_time_mobile").click(function() {
		if ($("#part_time_mobile").is(":checked")) updateFiltersObject("part_time",
			"Part time allowed");
		else updateFiltersObject("part_time", "")
	});
	$("#internship_checkbox_mobile").click(function() {
		if ($("#internship_checkbox_mobile").is(":checked")) {
			var filters_count = 0;
			for (var key in filter_types) {
				if (key === "category_name_label_array") continue;
				if (filter_types[key].length) filters_count++
			}
			if (filters_count >= 1) updateFiltersObject("internship_checkbox", "Include all internships matching filters");
			else updateFiltersObject("internship_checkbox", "Include all internships")
		} else updateFiltersObject("internship_checkbox",
			"")
	});
	$("#remote_job_mobile").click(function() {
		if ($("#remote_job_mobile").is(":checked")) updateFiltersObject("remote_job", "Work from home");
		else updateFiltersObject("remote_job", "")
	});
	$("#stipend_filter_mobile").change(function() {
		var stipend = $("#stipend_filter_mobile").val();
		change_stipend_filter_mobile_input(stipend);
		if (stipend && stipend.length > 0 && stipend > 0) updateFiltersObject("stipend", stipend);
		else {
			updateFiltersObject("stipend", 0);
			$("#stipend_filter_mobile_chosen .chosen-search-input").addClass("default")
		}
	});
	$("#matching_preference_mobile").click(function() {
		if ($("#matching_preference_mobile").is(":checked")) updateFiltersObject("matching_preferences", "As per preferences");
		else {
			updateFiltersObject("matching_preferences", "");
			popovers()
		}
	});
	$("#fresher_job_checkbox_mobile").click(function() {
		if ($("#fresher_job_checkbox_mobile").is(":checked")) {
			updateFiltersObject("fresher_jobs", "Fresher jobs");
			$(".matching_preference_container_mobile").hide()
		} else {
			updateFiltersObject("fresher_jobs", "");
			$(".matching_preference_container_mobile").show()
		}
	});
	$("#salary_3lpa_checkbox_mobile").click(function() {
		if ($("#salary_3lpa_checkbox_mobile").is(":checked")) {
			updateFiltersObject("salary", "Show only 3 LPA+ jobs");
			$(".matching_preference_container_mobile").hide()
		} else {
			updateFiltersObject("salary", "");
			$(".matching_preference_container_mobile").show()
		}
	});
	if (employment_type === "both") {
		$(document).off("change", 'input[name="employment_type_mobile"]');
		$(document).on("change", 'input[name="employment_type_mobile"]', function(e) {
			var value = $('input[name="employment_type_mobile"]:checked').val();
			employment_type_filter_selected = value;
			if (value === "all") updateFiltersObject("employment_type_filter_selected", "");
			else if (value === "internship") updateFiltersObject("employment_type_filter_selected", "Internships");
			else updateFiltersObject("employment_type_filter_selected", "Fresher jobs")
		})
	}
}

function GetFormattedDate(date) {
	var todayTime = new Date(date);
	var month = (todayTime.getMonth() + 1).toString();
	if (month.length === 1) month = "0" + month;
	var day = todayTime.getDate().toString();
	if (day.length === 1) day = "0" + day;
	var year = todayTime.getFullYear().toString().substr(-2);
	return day + "-" + month + "-" + year
}

function getIndexOfNameFromArray(name) {
	for (var i = 0; i < filter_types.category_name_label_array.length; i++)
		if (filter_types.category_name_label_array[i].name.toLowerCase() == decodeURIComponent(name).toLowerCase()) return i
}

function getNameLabelObject(name) {
	for (var i = 0; i < categoryArray.length; i++)
		if (categoryArray[i].name.toLowerCase() == decodeURIComponent(name).toLowerCase()) return categoryArray[i];
	return ""
}

function checkPageFocus() {
	$(document).on("focus", "#select_category_chosen", function() {
		$("#city_sidebar_chosen .chosen-results").hide();
		$("#select_category_chosen .chosen-results").show();
		$("#city_sidebar_chosen").removeClass("chosen-with-drop chosen-container-active")
	});
	$(document).on("focus", "#city_sidebar_chosen", function() {
		$("#select_category_chosen .chosen-results").hide();
		$("#select_category_chosen").removeClass("chosen-with-drop chosen-container-active");
		$("#city_sidebar_chosen .chosen-results").show()
	});
	$(document).on("focus, click", "#start_date_mobile_pseudo", function() {
		$("#city_sidebar_chosen .chosen-results").hide();
		$("#select_category_chosen .chosen-results").hide();
		$("#select_category_chosen").removeClass("chosen-with-drop chosen-container-active");
		$("#city_sidebar_chosen").removeClass("chosen-with-drop chosen-container-active");
		var datepicker = $("#ui-datepicker-div").is(":visible");
		if (datepicker) $("#start_date_mobile_container_overlay").show()
	});
	$(document).on("focusout", "#start_date_mobile_pseudo",
		function() {
			var datepicker = $("#ui-datepicker-div").is(":visible");
			if (!datepicker) $("#start_date_mobile_container_overlay").hide()
		})
}

function reset_mobile_start_date(value) {
	$("#start_date_mobile").val(value);
	if (!value) {
		$("#start_date_mobile_pseudo  .default").show();
		$("#start_date_mobile_pseudo  .value").hide()
	} else {
		$("#start_date_mobile_pseudo  .default").hide();
		$("#start_date_mobile_pseudo  .value").show();
		var start_date = new Date(value);
		var curr_date = start_date.getDate();
		var curr_month = month[start_date.getMonth()];
		var curr_year = start_date.getFullYear() % 100;
		var date_To_display = curr_date + " " + curr_month + "' " + curr_year;
		$("#start_date_mobile_pseudo  .value span").html(date_To_display)
	}
}

function internship_checkbox_text_change() {
	var filters_count = 0;
	var filter_values = filters_applied;
	for (var key in filter_values) {
		if (key === "category_name_label_array") continue;
		if (key === "fresher_jobs") continue;
		if (filter_values[key].length) filters_count++
	}
	if (filters_count > 1)
		if (typeof filter_values["internship_checkbox"] != "undefined" && filter_values["internship_checkbox"].length && !filter_values["matching_preferences"].length) {
			filters_applied["internship_checkbox"].length = 0;
			filters_applied["internship_checkbox"].push("Include all internships matching filters")
		}
}

function set_all_filters_applied_keys_if_not_exists(filters_applied_array) {
	$.each(filter_types, function(key, value) {
		if (!(key in filters_applied_array)) filters_applied_array[key] = []
	});
	return filters_applied_array
}

function change_stipend_filter_mobile_input(stipend) {
	if (stipend > 0) $("#stipend_filter_mobile_chosen .chosen-choices .search-choice span").html("At least <i class='ic-16-currency-inr'></i> " + stipend)
}

function matching_preferences_checkbox_jobs() {
	if ($("#fresher_job_checkbox_mobile").is(":checked")) $(".matching_preference_container_mobile").hide();
	else $(".matching_preference_container_mobile").show()
}

function compute_search_url_for_wfh_filters_for_job_ajax() {
	var keywords_url = "";
	$("#keywords_mobile").val("");
	var internship_checkbox = filter_types.internship_checkbox.length !== 0 ? filter_types.internship_checkbox[0] : "";
	var remote_job = filter_types.remote_job.length !== 0 ? filter_types.remote_job[0] : "";
	var city = filter_types.city.length !== 0 ? filter_types.city.toString() : "";
	var category = filter_types.category.length !== 0 ? filter_types.category.toString() : "";
	var matchingPreferences = filter_types.matching_preferences.length !==
		0 ? 1 : 0;
	var keywords = filter_types.keyword.length !== 0 ? filter_types.keyword.toString() : "";
	var salary = filter_types.salary.length !== 0 ? filter_types.salary[0] : "";
	toShowMatchingPreferences = matchingPreferences;
	var regular_url = "";
	var remote_job_url = "";
	var category_city_url = "";
	var salary_url = "";
	if (city) city = "-in-" + city;
	if (category) category = category + "-";
	if (internship_checkbox) regular_url = "/internships";
	if (remote_job) remote_job_url = "/remote_jobs";
	if (category || city) category_city_url = "/" + category + "jobs" + city;
	if (salary) salary_url =
		"/3lpa-job";
	if (keywords !== "") keywords_url = "keywords-" + keywords;
	if (keywords_url && keywords_url !== "") search_url = keywords_url;
	else search_url = category_city_url + remote_job_url + regular_url + salary_url;
	var pathname = window.location.pathname;
	var pathArray = pathname.split("/");
	var index = searchStringInArray("page-", pathArray);
	if (index !== -1) page_url = "page-" + pagenumber;
	else {
		var length = pathArray.length;
		if (pathArray[length - 1] !== "") page_url = "page-" + pagenumber;
		else page_url = "page-" + pagenumber
	}
	search_url = search_url +
		"/" + page_url;
	return search_url
};
$(document).ready(function() {
	setTimeout(function() {
		if ($("#credential_picker_container").length) {
			dataLayer.push({
				"event": "google_one_tap",
				"eventCategory": "google_one_tap",
				"eventAction": "view",
				"eventLabel": "view"
			});
			dataLayer.push({
				"event": "google_one_tap_view",
				"view": "view"
			})
		}
	}, 1E3)
});

function handle_one_tap_credential_response(response) {
	dataLayer.push({
		"event": "google_one_tap",
		"eventCategory": "google_one_tap",
		"eventAction": "click",
		"eventLabel": "click"
	});
	dataLayer.push({
		"event": "google_one_tap_click",
		"click": "click"
	});
	var csrf_name = $("#csrf_google_one_tap").attr("name");
	var csrf_value = $("#csrf_google_one_tap").attr("value");
	response[csrf_name] = csrf_value;
	if (typeof page !== "undefined" && typeof job_url !== "undefined")
		if (page === "details") {
			response["referral"] = "detail";
			response["job_url"] =
				job_url
		} else response["referral"] = "search";
	$.ajax("/login/google_one_tap", {
		type: "POST",
		success: handle_one_tap_sign_in_success,
		error: onError,
		data: response
	});
	NProgress.start();
	$(".loading_image").show()
}
var handle_one_tap_sign_in_success = function(data) {
	NProgress.done();
	$(".loading_image").hide();
	try {
		if (!data.success) {
			error_modal(data.error, null, data.error_button);
			dataLayer.push({
				"event": "google_one_tap",
				"eventCategory": "google_one_tap",
				"eventAction": "click",
				"eventLabel": "user_error"
			});
			dataLayer.push({
				"event": "google_one_tap_click",
				"click": "user_error"
			})
		} else {
			if (data.type) {
				dataLayer.push({
					"event": "google_one_tap",
					"eventCategory": "google_one_tap",
					"eventAction": "click",
					"eventLabel": data.type
				});
				dataLayer.push({
					"event": "google_one_tap_click",
					"click": data.type
				})
			}
			if (data.success_page === "reload") location.reload();
			else window.location.href = data.success_page
		}
	} catch (e) {
		throw_error(e)
	}
};
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

function popover_tooltip_light_with_heading(id, heading, content, placement) {
	placement = placement === undefined ? "bottom" : placement;
	var popover_close_id = "popover_close_" + id.substr(1);
	var title = '<div class="heading-6">' + heading + '</div><i class="ic-24-cross" id="' + popover_close_id + '"></i>';
	var popover = $(id).popover({
		placement: placement,
		html: true,
		title: title,
		template: '<div class="popover popover-light popover-custom"><div class="arrow"></div><div class="popover-inner"><div class="popover-header"></div><div class="popover-body"><p></p></div></div></div>',
		content: content
	});
	$(document).on("click", "#" + popover_close_id, function() {
		$(id).popover("hide")
	});
	return popover
}

function popover_tooltip_light_without_heading(id, content, placement) {
	placement = placement === undefined ? "bottom" : placement;
	var popover_close_id = "popover_close_" + id.substr(1);
	var popover = $(id).popover({
		placement: placement,
		html: true,
		template: '<div class="popover popover-light popover-custom noheading"><div class="arrow"></div><div class="popover-inner"><div class="popover-header"></div><div class="popover-body"><p></p></div></div><i class="ic-24-cross" id="' + popover_close_id + '"></i></div>',
		content: content
	});
	$(document).on("click", "#" + popover_close_id, function() {
		$(id).popover("hide")
	});
	return popover
}

function popover_tooltip_dark_with_heading(id, heading, content, placement, trigger) {
	placement = placement === undefined ? "bottom" : placement;
	trigger = trigger === undefined ? "click" : trigger;
	var popover_close_id = "popover_close_" + id.substr(1);
	var title = '<div class="heading-6">' + heading + '</div><i class="ic-24-cross" id="' + popover_close_id + '"></i>';
	var popover = $(id).popover({
		placement: placement,
		trigger: trigger,
		html: true,
		title: title,
		template: '<div class="popover popover-dark popover-custom"><div class="arrow"></div><div class="popover-inner"><div class="popover-header"></div><div class="popover-body"><p></p></div></div></div>',
		content: content
	});
	$(document).on("click", "#" + popover_close_id, function() {
		$(id).popover("hide")
	});
	return popover
}

function popover_tooltip_dark_without_heading(id, content, placement) {
	placement = placement === undefined ? "bottom" : placement;
	var popover_close_id = "popover_close_" + id.substr(1);
	var popover = $(id).popover({
		placement: placement,
		html: true,
		template: '<div class="popover popover-dark popover-custom noheading"><div class="arrow"></div><div class="popover-inner"><div class="popover-header"></div><div class="popover-body"><p></p></div></div><i class="ic-24-cross" id="' + popover_close_id + '"></i></div>',
		content: content
	});
	$(document).on("click", "#" + popover_close_id, function() {
		$(id).popover("hide")
	});
	return popover
}

function popover_tooltip_light_small(id, content, placement, position) {
	placement = placement === undefined ? "bottom" : placement;
	position = position === undefined ? "" : position;
	var popover = $(id).popover({
		placement: placement,
		html: false,
		sanitize: false,
		template: '<div class="popover popover-small popover-light' + position + '"><div class="arrow"></div><div class="popover-inner"><div class="popover-body"><p></p></div></div></div>',
		content: content
	});
	return popover
}

function popover_tooltip_dark_small(id, content, placement, position) {
	placement = placement === undefined ? "bottom" : placement;
	position = position === undefined ? "" : position;
	var popover = $(id).popover({
		placement: placement,
		html: false,
		sanitize: false,
		template: '<div class="popover popover-small popover-dark ' + position + '"><div class="arrow"></div><div class="popover-inner"><div class="popover-body"><p></p></div></div></div>',
		content: content
	});
	return popover
};