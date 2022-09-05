var focusedElement;
var loginModalSuccessPage = '';

$(document).ready(function () {
    if (typeof mainRole === "undefined" || mainRole == "guest") {
        $('#employer').click(function () {
            $('#employer').addClass('active');
            $('#student').removeClass('active');

            $('.google_login').hide();
            $('#form-container .helper').hide();
        });
        $('#student').click(function () {
            $('#student').addClass('active');
            $('#employer').removeClass('active');

            $('.google_login').show();
            $('#form-container .helper').show();
        });
        $('#modal_employer').click(function () {
            $('#modal_employer').addClass('active');
            $('#modal_student').removeClass('active');

            $('#google-button-container').hide();
            $('#login-modal .helper').hide();
        });
        $('#modal_student').click(function () {
            $('#modal_student').addClass('active');
            $('#modal_employer').removeClass('active');

            $('#google-button-container').show();
            $('#login-modal .helper').show();
        });

        $("#login-modal").on('shown.bs.modal', function () {
            $('.grecaptcha-badge').css('visibility', 'visible');
        });
        $("#login-modal").on('hidden.bs.modal', function () {
            $('.grecaptcha-badge').css('visibility', 'hidden');
        });

        $('#login-form').submit(function (e) {
            e.preventDefault();
        }).validate({
            onfocusout: function (element) {
                let validator = this;
                setTimeout(function () {
                    validator.element(element);
                }, 500);
            },
            rules: {
                email: {
                    required: true,
                    email: true
                },
                password: {
                    minlength: 6,
                    required: true
                }
            },
            highlight: function (label) {
                $(label).closest(".form-group").addClass('has-error');
                $(label).closest(".form-group").removeClass('has-success');
                $(label).closest('input').addClass('error');
                $(label).closest('input').removeClass('valid');
            },
            success: function (label) {
                $(label).closest(".form-group").addClass('has-success');
                $(label).closest(".form-group").removeClass('has-error');
                $(label).closest('input').addClass('valid');
                $(label).closest('input').removeClass('error');
            },
            submitHandler: function () {
                grecaptcha.ready(function () {
                    grecaptcha.execute(is_g_recaptcha, {
                        action: 'login_submit'  // Button ID
                    }).then(function (token) {
                        loginFormSubmit(token);
                    });
                });
                return false;
            }
        });

        $('#modal-login-form').validate({
            onfocusout: function (element) {
                let validator = this;
                setTimeout(function () {
                    validator.element(element);
                }, 500);
            },
            rules: {
                email: {
                    required: true,
                    email: true
                },
                password: {
                    minlength: 6,
                    required: true
                }
            },
            highlight: function (label) {
                $(label).closest(".form-group").addClass('has-error');
                $(label).closest(".form-group").removeClass('has-success');
                $(label).closest('input').addClass('error');
                $(label).closest('input').removeClass('valid');
            },
            success: function (label) {
                $(label).closest(".form-group").addClass('has-success');
                $(label).closest(".form-group").removeClass('has-error');
                $(label).closest('input').addClass('valid');
                $(label).closest('input').removeClass('error');
            },
            submitHandler: function () {
                if (typeof view !== 'undefined' && (view == 'login/forgot_password' || view == 'login/login')) {
                    modalLoginFormSubmit();
                } else {
                    grecaptcha.ready(function () {
                        grecaptcha.execute(is_g_recaptcha, {
                            action: 'modal_login_submit'  // Button ID
                        }).then(function (token) {
                            modalLoginFormSubmit(token);
                        });
                    });
                    return false;
                }
            }
        });
    }

    $('#employer').click(function () {
        $('#employer').addClass('active');
        $('#student').removeClass('active');

        $('#google-button-container').hide();
        $('#heading-login-student').hide();
        $('#heading-login-employer').show();
        $('#line-break').hide();
    });
    $('#student').click(function () {
        $('#student').addClass('active');
        $('#employer').removeClass('active');

        $('#google-button-container').show();
        $('#heading-login-student').show();
        $('#heading-login-employer').hide();
        $('#line-break').show();
    });

    $(document).keypress(function (e) {
        if ($("#semi_error_modal").is(":visible") && e.which == 13) {
            $("#semi_error_modal").hide();

            try {
                focusedElement.focus();
            } catch (e) {
            }
        }
    });
});

var modalLoginFormSubmit = function (token = null) {
    var data = $('#modal-login-form').serializeArray();
    if (typeof (token) != "undefined" && token != null) {
        data.push({
            name: "g-recaptcha-response",
            value: token
        });
    }
    if (typeof (utm_campaign) != "undefined" && utm_campaign === 'em_jobs') {
        loginModalSuccessPage = '/job_form';
    }
    var url = "/login/verify_ajax/user" + loginModalSuccessPage;
    NProgress.start();
    $('.loading_image').show();
    $.ajax(url, {
        data: data,
        success: login_success,
        error: onError,
        type: "POST"
    });
};

var loginFormSubmit = function (token) {
    var data = $('#login-form').serializeArray();
    data.push({
        name: "g-recaptcha-response",
        value: token
    });
    var url = "/login/verify_ajax/" + role + "/" + successPage;
    NProgress.start();
    $('.loading_image').show();
    $.ajax(url, {
        data: data,
        success: login_success,
        error: onError,
        type: "POST"
    });
};

var login_success = function (data) {
    try {
        NProgress.done();
        if (!data.success) {
            focusedElement = $(document.activeElement);
            if (focusedElement.is('input')) {
                focusedElement.blur();
            }
            if (data.errorCode === 'auto_block') {
                if (data.errorThrown == 'unpaid') {
                    $('#heading_content1').html("Attempting to offer unpaid internships to applicants");
                    $('#error_content1').html("Pitching unpaid internships, except in the case of NGOs or niche roles (e.g.  experimental physics, or aerospace engineering), is not allowed on Internshala.");
                    $('#heading_content2').hide();
                    $('#error_content2').hide();
                } else if (data.errorThrown == 'followers/signup') {
                    $('#heading_content1').html("Attempting to solicit followers/sign ups for your company");
                    $('#error_content1').html("Internshala does not allow employers to send assignments that ask applicants to promote the employer’s social media pages or platform. Assignments sent to applicants should assess suitability for the role.");
                    $('#heading_content2').hide();
                    $('#error_content2').hide();
                } else {
                    $('#heading_content1').html("• Attempting to offer unpaid internships to applicants");
                    $('#error_content1').html("Pitching unpaid internships, except in the case of NGOs or niche roles (e.g.  experimental physics, or aerospace engineering), is not allowed on Internshala.");
                    $('#heading_content2').html("• Attempting to solicit followers/sign ups for your company");
                    $('#error_content2').html("Internshala does not allow employers to send assignments that ask applicants to promote the employer’s social media pages or platform. Assignments sent to applicants should assess suitability for the role.");
                }
                $('#login-modal').modal("hide");
                $('.loading_image').hide();
                $('#employer_blocked_error_modal').modal("show");
            } else {
                if (typeof data.errorPage !== 'undefined') {
                    throw_error(data.errorThrown, data.errorPage);
                } else {
                    throw_error(data.errorThrown);
                }
            }

        } else {
            if (data.first_year_campaign !== 'undefined' && data.first_year_campaign) {
                throw_success(data.successMsg, data.successPage);
            } else {
                window.location.href = data.successPage;
            }
        }
    } catch (e) {
        throw_error(e);
        NProgress.done();
        $('.loading_image').hide();
    }
};
