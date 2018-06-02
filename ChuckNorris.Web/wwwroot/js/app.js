const highlightPageIcon = function() {
    const urlPath = window.location.pathname.toLowerCase();
    const className = "selected-icon";

    if (urlPath.startsWith("/facts")) {
        $("#icon-home").addClass(className);
    } else if (urlPath.startsWith("/favorites")) {
        $("#icon-favorites").addClass(className);
    } else if (urlPath.startsWith("/bio")) {
        $("#icon-chuck").addClass(className);
    } else if (urlPath.startsWith("/contact")) {
        $("#icon-contact").addClass(className);
    }
};

$(document).ready(function () {
    highlightPageIcon();

    if (Notification.permission === "granted") {
        const notificationIcon = $("#notification-icon");
        notificationIcon.css({ '-webkit-filter': 'grayscale(0)', 'filter': 'grayscale(0)' });
    }

    $("#notification-icon").on("click", function () {
        const clickedElement = $(this);

        if (Notification.permission !== "granted") {
            Notification.requestPermission().then(permission => {

                Notification.permission === "granted"
                    ? clickedElement.css({ '-webkit-filter': 'grayscale(0)', 'filter': 'grayscale(0)' })
                    : clickedElement.css({ '-webkit-filter': 'grayscale(100%)', 'filter': 'grayscale(100%)' });

            });
        }
    });
});