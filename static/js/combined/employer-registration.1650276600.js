var user_email_input = $("#email").val();
var is_employer_first_name_in_restricted_keywords = 0;
var is_employer_last_name_in_restricted_keywords = 0;
var is_phone_primary_valid = false;
var is_country_code_valid = false;
$(document).ready(function() {
	$("#first_name, #last_name, #country_code, #phone_primary").attr("autocomplete", "none");
	$(".carousel-control-next").click(function(event) {
		$("#carousel-generic").carousel("next")
	});
	$("#hire_intern_footer_link").click(function(event) {
		event.preventDefault();
		jQuery("html,body").animate({
			scrollTop: 0
		}, 800)
	});
	$("#post_internship_button_desktop").click(function(event) {
		event.preventDefault();
		jQuery("html,body").animate({
			scrollTop: 0
		}, 800)
	});
	$("#post_job_button_desktop").click(function(event) {
		event.preventDefault();
		jQuery("html,body").animate({
			scrollTop: 0
		}, 800)
	});
	$("#employer_registration_footer").click(function(event) {
		event.preventDefault();
		jQuery("html,body").animate({
			scrollTop: 0
		}, 800)
	});
	$("#post_internship").click(function(event) {
		switch_to_employment_type("internship")
	});
	$("#post_job").click(function(event) {
		switch_to_employment_type("job")
	});
	$("#mobile_post_internship").click(function(event) {
		switch_to_employment_type("internship")
	});
	$("#mobile_post_job").click(function(event) {
		switch_to_employment_type("job")
	});
	if (window.innerWidth < 768) $(".mobile_testimonial").remove();
	if (window.innerWidth < 576) $(".mobile_testimonial_new").remove();
	$(".testimonials-carousel").carousel({
		interval: false
	});
	email_popover();
	update_login_modal_for_employer();
	if (typeof ribbon_content != "undefined" && ribbon_content) create_notification(ribbon_content, "custom_notification", "custom", "employer_campaign_ribbon");
	$("#employer").click(function() {
		update_login_modal_for_employer()
	});
	$("#student").click(function() {
		$("#student").addClass("active");
		$("#employer").removeClass("active");
		$("#google-button-container").show();
		$("#heading-login").text("Or login using your email address");
		$("#heading-login").css("text-align", "center");
		$("#heading-login").css("margin-top", "25px");
		$("#heading-login").css("margin-bottom", "10px");
		$("#line-break").css("margin-top", "20px");
		$("#line-break").show()
	});
	$(".email-field-employer-registration").keyup(function() {
		var id = $(this).attr("id");
		var form_id = $("#" + id).closest("form").attr("id");
		var user_email_input_update =
			$("#" + id).val();
		if (user_email_input !== user_email_input_update) {
			user_email_input = user_email_input_update;
			prompt_for_correct_email(form_id, id)
		}
	});
	$(".scroll_to_top").click(function() {
		$("html,body").animate({
			scrollTop: 0
		}, "slow", function() {
			$("input:text:visible:first").focus()
		})
	});
	$("#registration-form").validate({
		onfocusout: function(element) {
			if (element.type !== "checkbox") this.element(element)
		},
		rules: {
			first_name: {
				required: true,
				onlyalpha: true,
				maxlength: 100
			},
			last_name: {
				required: true,
				onlyalpha: true,
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
			},
			country_code: {
				required: true,
				countrycode: true
			},
			phone_primary: {
				required: true,
				onlynumbers: true,
				mobilenumber: function() {
					var country_code = $("#country_code").val();
					if (country_code === "+91") return true
				}
			},
			employer_linkedin_page: {
				url: true,
				maxlength: 100
			}
		},
		errorPlacement: function(label, element) {
			if (element.attr("name") === "phone_primary" || element.attr("name") === "country_code") {
				if (!$("#country_code-error").is(":visible") && !$("#phone_primary-error").is(":visible")) label.insertAfter("#phone_container")
			} else label.insertAfter(element)
		},
		highlight: function(label) {
			$(label).closest(".form-group").addClass("has-error");
			$(label).closest(".form-group").removeClass("has-success");
			$(label).closest("input").addClass("error");
			$(label).closest("input").removeClass("valid")
		},
		success: function(label, element) {
			if (element.name === "phone_primary" && !is_phone_primary_valid) is_phone_primary_valid = true;
			if (element.name === "country_code" && !is_country_code_valid) is_country_code_valid = true;
			if (element.name === "email" || element.name === "first_name" || element.name ===
				"last_name" || element.name === "password" || is_phone_primary_valid && is_country_code_valid) {
				$(label).closest(".form-group").addClass("has-success");
				$(label).closest(".form-group").removeClass("has-error");
				$(label).closest("input").addClass("valid");
				$(label).closest("input").removeClass("error")
			}
		},
		submitHandler: function() {
			var data = $("#registration-form").serialize();
			var url = "/registration/employer_submit";
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
	});
	$("#registration-form-modal").validate({
		onfocusout: function(element) {
			if (element.type !== "checkbox") this.element(element)
		},
		groups: {
			phone_number: "country_code phone_primary"
		},
		rules: {
			first_name: {
				required: true,
				onlyalpha: true,
				maxlength: 100
			},
			last_name: {
				required: true,
				onlyalpha: true,
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
			},
			country_code: {
				required: true,
				countrycode: true
			},
			phone_primary: {
				required: true,
				onlynumbers: true,
				mobilenumber: function() {
					var country_code =
						$("#country_code").val();
					if (country_code === "+91") return true
				}
			},
			employer_linkedin_page: {
				url: true,
				maxlength: 100
			}
		},
		errorPlacement: function(label, element) {
			if (element.attr("name") === "phone_primary" || element.attr("name") === "country_code") label.insertAfter("#phone_container_modal");
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
			var data = $("#registration-form-modal").serialize();
			var url = "/registration/employer_submit";
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
	});
	$("#first_name").keyup(function(event) {
		$("#first_name").removeClass("employer_name_is_restricted_keywords");
		is_employer_first_name_in_restricted_keywords = 0;
		if (is_employer_first_name_in_restricted_keywords != 1 && is_employer_last_name_in_restricted_keywords != 1) {
			$(".restricted_keyword_error").hide();
			$("#job_employer_registration_button button").removeClass("keepDisable");
			$("#job_employer_registration_button button").prop("disabled", false)
		}
	});
	$("#last_name").keyup(function(event) {
		$("#last_name").removeClass("employer_name_is_restricted_keywords");
		is_employer_last_name_in_restricted_keywords = 0;
		if (is_employer_first_name_in_restricted_keywords !=
			1 && is_employer_last_name_in_restricted_keywords != 1) {
			$(".restricted_keyword_error").hide();
			$("#job_employer_registration_button button").removeClass("keepDisable");
			$("#job_employer_registration_button button").prop("disabled", false)
		}
	});
	if (typeof companies_count !== "undefined" && companies_count !== 0) {
		var decrement_companies_count = 2;
		var companies_count_start = companies_count - decrement_companies_count;
		var counter = 1;
		$(".total_companies").html(companies_count_start.toLocaleString("en-IN"));
		window.addEventListener("scroll",
			function() {
				var st_element = document.querySelector(".total_companies");
				var st_position = st_element.getBoundingClientRect();
				if (st_position.top < window.innerHeight && st_position.bottom >= 0)
					for (counter; counter <= decrement_companies_count; counter++) setTimeout(function() {
						companies_count_start++;
						$(".total_companies").html(companies_count_start.toLocaleString("en-IN"))
					}, 3E3 * counter)
			})
	}
});
var registration_success = function(data) {
	try {
		NProgress.done();
		if (!data.success) {
			first_name = $("#first_name").val();
			last_name = $("#last_name").val();
			if (data.is_employer_name_in_restricted_keywords) {
				$(".loading_image").hide();
				if (typeof data.restricted_keyword_error != undefined && data.restricted_keyword_error != null) {
					$(".restricted_keyword_error").html(data.restricted_keyword_error);
					$(".restricted_keyword_error").show();
					$("#job_employer_registration_button button").addClass("keepDisable");
					$("#job_employer_registration_button button").prop("disabled",
						"disabled");
					if (data.is_first_name_in_restricted_keywords) {
						is_employer_first_name_in_restricted_keywords = 1;
						$("#first_name").addClass("employer_name_is_restricted_keywords")
					}
					if (data.is_last_name_in_restricted_keywords) {
						is_employer_last_name_in_restricted_keywords = 1;
						$("#last_name").addClass("employer_name_is_restricted_keywords")
					}
				}
			} else throw_error(data.errorThrown)
		} else {
			goog_report_conversion();
			var registration_url = window.location.pathname;
			if (registration_url.includes("/fresher-recruitment-drive-2021")) fbq("track",
				"CompleteRegistration", {
					content_name: "fresher-recruitment-drive-2021"
				});
			else if (registration_url.includes("/grand-summer-internship-fair/employer")) fbq("track", "CompleteRegistration", {
				content_name: "grand-summer-internship-fair"
			});
			else if (registration_url.includes("/registration/employer") && !registration_url.includes("/registration/employer/job") || registration_url.includes("registration/employer/jobs") || registration_url.includes("registration/employer/internship")) fbq("track", "CompleteRegistration", {
				content_name: "registration-internship"
			});
			else if (registration_url.includes("/post-job/fresher-hiring") || registration_url.includes("registration/employer/job")) fbq("track", "CompleteRegistration", {
				content_name: "registration-job"
			});
			throw_success(data.successMsg, data.successPage)
		}
	} catch (e) {
		throw_error(e);
		NProgress.done();
		$(".loading_image").hide()
	}
};

function update_login_modal_for_employer() {
	$("#employer").addClass("active");
	$("#student").removeClass("active");
	$("#google-button-container").hide();
	$("#heading-login").text("Login");
	$("#heading-login").css("text-align", "left");
	$("#heading-login").css("margin-top", "0");
	$("#heading-login").css("margin-bottom", "20px");
	$("#line-break").css("margin-top", "0px");
	$("#line-break").hide()
}

function email_popover() {
	var is_mobile = true;
	if (window.innerWidth > 768) is_mobile = false;
	$("#email").focusout(function(e) {
		var email = $("#email").val();
		var email_split_array = email.split("@");
		if (email_split_array.length < 2) return;
		var name = email_split_array[0];
		var domain = email_split_array[1];
		var domain_index = $.inArray(domain, personal_domains);
		var name_index = $.inArray(name, ["hr", "team", "admin", "info", "group"]);
		if (domain_index !== -1 || name_index !== -1) {
			if (!$("#" + $("#email_desktop").attr("aria-describedby")).is(":visible")) {
				$("#email_desktop").popover({
					html: true,
					sanitize: false,
					placement: is_mobile ? "top" : "left"
				});
				$("#email_desktop").popover("show");
				$("#" + $("#email_desktop").attr("aria-describedby")).addClass("popover-light")
			}
		} else $("#email_desktop").popover("hide");
		$("#email").onPositionChanged(function() {
			if ($(".popover").is(":visible")) {
				$("#email_desktop").popover("show");
				$("#" + $("#email_desktop").attr("aria-describedby")).addClass("popover-light")
			}
		})
	});
	$(document).on("click", ".popover .email_popover_close", function() {
		$("#email_desktop").popover("hide")
	})
}

function switch_to_employment_type(employment_type, to_replace) {
	to_replace = to_replace || false;
	if (employment_type !== "job" && employment_type !== "internship") return;
	var prev_employment_type = employment_type === "job" ? "internship" : "job";
	if ($("#" + prev_employment_type + "_form").length > 0) {
		$("#" + prev_employment_type + "_form").attr("id", employment_type + "_form");
		$("#" + employment_type + "-registration-container-left").show();
		$("#" + employment_type + "_registration_sections").show();
		$("#" + employment_type + "_registration_button_container").show();
		$("#" + prev_employment_type + "-registration-container-left").hide();
		$("#" + prev_employment_type + "_registration_sections").hide();
		$("#" + prev_employment_type + "_registration_button_container").hide();
		$("#registration-container-right").removeClass(prev_employment_type);
		$("#registration-container-right").addClass(employment_type);
		$("#registration_source").val(employment_type);
		if (history.pushState) {
			var fn = to_replace ? "replaceState" : "pushState";
			if (employment_type === "job") {
				history[fn](null, null, job_registration_url);
				$(document).prop("title", "Post Job | Fresher Hiring Made Fast & Hassle-free")
			} else {
				history[fn](null, null, internship_registration_url);
				$(document).prop("title", "Hire interns | Find interns | Hiring intern | Post internships- Internshala")
			}
		}
		$(".nav-item").removeClass("active").addClass("inactive");
		$("#post_" + employment_type).parent().removeClass("inactive").addClass("active");
		$(".mobile_header .post_item").removeClass("active");
		$(".mobile_header #mobile_post_" + employment_type).removeClass("inactive").addClass("active");
		var help_center_link = "";
		var margin_top_tc = "";
		var text_color_tc = "";
		var line_height_tc = "";
		var font_weight_tc = "";
		if (employment_type == "job") {
			help_center_link = job_help_center_link;
			margin_top_tc = "24px";
			text_color_tc = "#484848";
			line_height_tc = "1.33";
			font_weight_tc = "500"
		} else {
			help_center_link = internship_help_center_link;
			margin_top_tc = "16px";
			text_color_tc = "#333333";
			line_height_tc = "1.57";
			font_weight_tc = "400"
		}
		$(".label_toc span").css({
			"color": text_color_tc,
			"line-height": line_height_tc,
			"font-weight": font_weight_tc
		});
		$("#job_registration_form_extras").css("margin-top", margin_top_tc);
		$(".label_toc_2").children("a").attr("href", help_center_link)
	}
}
$(window).on("popstate", function() {
	if (location.pathname === job_registration_url) switch_to_employment_type("job", true);
	else if (location.pathname === internship_registration_url) switch_to_employment_type("internship", true)
});