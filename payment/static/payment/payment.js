document.addEventListener("DOMContentLoaded", function () {

    const okButton = document.getElementById("okButton");

    if (!okButton) {
        return;
    }

    okButton.addEventListener("click", function () {

        // Go back to WashOS homepage
        window.location.href = "/";

    });

});