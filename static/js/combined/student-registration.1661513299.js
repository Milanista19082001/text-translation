var user_email_input = $("#email").val();
$(document).ready(function() {
	$("#first_name, #last_name").attr("autocomplete", "none");
	update_banner_height();
	$(window).on("resize", function() {
		update_banner_height()
	});
	$(".email-field-student-registration").keyup(function() {
		var user_email_input_update = $("#email").val();
		if (user_email_input !== user_email_input_update) {
			user_email_input = user_email_input_update;
			prompt_for_correct_email("registration-form", "email")
		}
	});
	if (typeof job_url != "undefined" && job_url) {
		var interstitialUrl = "/json/student/interstitial/application/" +
			job_url;
		if ($(window).width() > 575) {
			$("#registration_modal_ellipse_container").remove();
			$(".apply-now-cta").on("click", function() {
				fire_ga_event_on_apply_now_cta_click();
				$.get(interstitialUrl, {}, function() {
					$("#registration_modal").modal("show")
				})
			})
		} else {
			$("#registration_modal").remove();
			load_ellipse_modal("#registration_modal_ellipse", function(cb) {
				fire_ga_event_on_apply_now_cta_click();
				$.get(interstitialUrl, {}, function() {
					cb()
				})
			})
		}
	}
	$("#registration-form").validate({
		onfocusout: function(element) {
			if (element.type !==
				"checkbox") this.element(element)
		},
		groups: {
			phone_number: "country_code phone_primary"
		},
		rules: {
			first_name: {
				required: true,
				user_name: true,
				maxlength: 100
			},
			last_name: {
				user_name: true,
				maxlength: 100
			},
			email: {
				required: true,
				email: true,
				maxlength: 100
			},
			password: {
				required: true,
				minlength: 6
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
			if (typeof to_show_recaptcha != "undefined" && to_show_recaptcha != null && to_show_recaptcha == 1) {
				grecaptcha.ready(function() {
					grecaptcha.execute(is_g_recaptcha, {
						action: "registration_submit"
					}).then(function(token) {
						registration_submit(token)
					})
				});
				return false
			} else registration_submit()
		}
	});
	if (typeof dataLayer != "undefined") dataLayer.push({
		"Referrer": "https://internshala.com"
	})
});

function fire_ga_event_on_apply_now_cta_click() {
	if (typeof dataLayer != "undefined" && typeof is_user_mapped_to_given_device_key != "undefined")
		if (is_user_mapped_to_given_device_key) {
			dataLayer.push({
				"event": "details_page_apply_now_click",
				"eventCategory": "returning",
				"eventAction": "click",
				"eventLabel": "apply_now"
			});
			dataLayer.push({
				"event": "details_page_click",
				"click": "returning"
			})
		} else {
			dataLayer.push({
				"event": "details_page_apply_now_click",
				"eventCategory": "non_returning",
				"eventAction": "click",
				"eventLabel": "apply_now"
			});
			dataLayer.push({
				"event": "details_page_click",
				"click": "non_returning"
			})
		}
}

function registration_submit(token) {
	token = token === undefined ? null : token;
	var data = $("#registration-form").serializeArray();
	if (typeof job_url != "undefined" && $(window).width() > 575) $("#registration_modal").modal("hide");
	else if (typeof job_url != "undefined" && typeof close_ellipse_modal != "undefined") close_ellipse_modal("#registration_modal_ellipse_container");
	if (typeof token != "undefined" && token != null) data.push({
		name: "g-recaptcha-response",
		value: token
	});
	var url = "/registration/student_submit";
	NProgress.start();
	$(".loading_image").show();
	$.ajax(url, {
		data: data,
		success: registration_success,
		error: onError,
		type: "POST"
	});
	return false
}
var registration_success = function(data) {
	try {
		NProgress.done();
		if (!data.success)
			if (typeof data.errorPage !== "undefined") throw_error(data.errorThrown, data.errorPage);
			else throw_error(data.errorThrown);
		else {
			goog_report_conversion();
			if (typeof dataLayer != "undefined") {
				dataLayer.push({
					"event": "student_signup",
					"eventCategory": "student_signup",
					"eventAction": "student_signup_success",
					"eventLabel": data.successLabel
				});
				dataLayer.push({
					"event": "students_signup",
					"tracking_info": "student_signup_success_" + data.successLabel
				})
			}
			var image =
				new Image(1, 1);
			image.src = "//conv.indeed.com/pagead/conv/9459742475614127/?script=0";
			throw_success(data.successMsg, data.successPage, "", true)
		}
	} catch (e) {
		throw_error(e);
		NProgress.done();
		$(".loading_image").hide()
	}
};

function update_banner_height() {
	var footer_height = $("#footer").outerHeight();
	var header_height = $(".header_container").outerHeight();
	$("#content").css("padding-bottom", footer_height);
	var window_height = window.innerHeight;
	var window_width = window.innerWidth;
	var background_image_height = 0;
	var min_window_height = window_height - footer_height - header_height;
	if (window_width >= 1024) background_image_height = window_height - 42 - header_height;
	if (background_image_height < min_window_height) $("#content-inner").css("min-height",
		min_window_height);
	else $("#content-inner").css("min-height", background_image_height)
};