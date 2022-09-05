var user_email_input = "";

$(document).ready(function () {
    user_email_input = $("#email").val();
    var w = window.innerWidth;
    if (w > 768) {
        $('.break_popup_messages').remove();
    }
    increase_subscription_popup_count();

    $('.email-field-popup').keyup(function () {
        var user_email_input_update = $("#email_popup").val();
        if (user_email_input !== user_email_input_update) {
            user_email_input = user_email_input_update;
            prompt_for_correct_email('subscribe-form-popup', 'email_popup', 'email_subscription_popup_container');
        }
    });

    $('#already_subscribed').click(function () {
        var url = "/subscribe/set_cookie_for_subscription/already_subscribed";
        $.ajax(url, {
            type: "GET"
        });
        $(".subscription_alert").modal("hide");
        return false;
    });

    $('#no_thanks, #close_popup').click(function () {
        var url = "/subscribe/set_cookie_for_subscription/no_need_of_subscription";
        $.ajax(url, {
            type: "GET"
        });
        $(".subscription_alert").modal("hide");
        return false;
    });
    $(".subscription_alert").modal({
        show: true,
        backdrop: 'static',
        keyboard: false,
    });
});

var increase_subscription_popup_count = function () {
    var url = "/subscribe/subscriber_popup_display_count";
    $.ajax(url, {
        type: "POST"
    });
};
