$(document).ready(function () {
    $("input[type=radio][name='user_type']").change(function () {
        var user_type = $("input[name='user_type']:checked").val();
        if (user_type === 'student') {
            $('#send_sms_container').hide();
            history.replaceState({}, null, '/login/forgot_password');
        } else {
            $('#send_sms_container').show();
            history.replaceState({}, null, '/login/forgot_password/employer');
        }
    });

    $('#forgot-password-form').validate({
        onfocusout: function (element) {
            this.element(element);
        },
        rules: {
            email: {
                required: true,
                email: true
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
                    action: 'forgot_password_submit'  // Button ID
                }).then(function (token) {
                    forgot_password_submit(token);
                });
            });
            return false;
        }
    });
});

function forgot_password_submit(token) {
    var data = $('#forgot-password-form').serializeArray();
    data.push({
        name: "g-recaptcha-response",
        value: token
    });
    var url = "/login/forgot_password_submit";
    NProgress.start();
    $('.loading_image').show();
    $.ajax(url, {
        data: data,
        success: forgot_password_success,
        error: onError,
        type: "POST"
    });
    return false;
}

var forgot_password_success = function (data) {
    try {
        NProgress.done();
        if (!data.success) {
            throw_error(data.errorThrown);
        } else {
            if (data.sms_send_and_verified == false) {
                internshala_alert(data.successMsg, '', "Close");
            } else {
                throw_success(data.successMsg, '');
            }
            $('#forgot_email').val('');
        }
    } catch (e) {
        throw_error(e);
        NProgress.done();
        $('.loading_image').hide();
    }
};