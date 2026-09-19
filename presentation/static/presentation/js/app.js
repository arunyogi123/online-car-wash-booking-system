const API_URL = "/api";

// ---------- PAGE LOAD ----------

document.addEventListener("DOMContentLoaded", function () {
    console.log("app.js loaded");

    setupAccountTabs();
    setupNavLogin();
    setupBookingForm();
    setupLoginForm();
    setupRegisterForm();
    setupLogoutButton();
    setMinDate();

    loadServices();
    loadBookedSlots();

    if (getToken()) {
        loadBookings();
    }
});


// ---------- BOOKED SLOTS ----------

let bookedSlots = [];

async function loadBookedSlots() {
    try {
        const res = await fetch(API_URL + "/booking/booked-slots/");
        const data = await res.json();

        if (!res.ok) {
            console.error("Could not load booked slots:", data);
            return;
        }

        bookedSlots = Array.isArray(data)
            ? data
            : (data.data || data.results || []);

        renderBookedSlots();

    } catch (err) {
        console.error("Booked slots error:", err);

        const calendarBox =
            document.getElementById("bookingCalendar");

        if (calendarBox) {
            calendarBox.innerHTML =
                '<p class="calendar-loading">Unable to load booked slots.</p>';
        }
    }
}


// ---------- GROUP BOOKED SLOTS BY SERVICE ----------

function groupBookedSlotsByService(slots) {
    const groups = {};

    slots.forEach(function (slot) {
        const name = slot.service_name || "Other";

        if (!groups[name]) {
            groups[name] = [];
        }

        groups[name].push(slot);
    });

    // preferred display order, with anything else sorted after
    const preferredOrder = ["Basic", "Standard", "Premium"];

    const orderedNames = Object.keys(groups).sort(function (a, b) {
        const ai = preferredOrder.indexOf(a);
        const bi = preferredOrder.indexOf(b);

        if (ai === -1 && bi === -1) return a.localeCompare(b);
        if (ai === -1) return 1;
        if (bi === -1) return -1;

        return ai - bi;
    });

    return orderedNames.map(function (name) {
        return { name: name, slots: groups[name] };
    });
}


// ---------- DISPLAY BOOKED SLOTS ----------

function renderBookedSlots() {
    const calendarBox =
        document.getElementById("bookingCalendar");

    if (!calendarBox) {
        return;
    }

    if (bookedSlots.length === 0) {
        calendarBox.innerHTML =
            '<p class="calendar-loading">No slots booked yet. All times are free.</p>';

        return;
    }

    const groups = groupBookedSlotsByService(bookedSlots);

    let html = "";

    groups.forEach(function (group) {

        const sortedSlots = group.slots.slice().sort(function (a, b) {

            if (a.booking_date === b.booking_date) {
                return a.booking_time.localeCompare(
                    b.booking_time
                );
            }

            return a.booking_date.localeCompare(
                b.booking_date
            );
        });

        let boxesHTML = "";

        sortedSlots.forEach(function (slot) {

            const niceDate =
                formatDate(slot.booking_date);

            const niceTime =
                slot.booking_time.slice(0, 5);

            boxesHTML +=
                '<div class="slot-box">' +
                    '<span class="slot-date">' +
                        niceDate +
                    '</span>' +

                    '<span class="slot-time">' +
                        niceTime +
                    '</span>' +
                '</div>';
        });

        html +=
            '<div class="slot-group">' +
                '<p class="calendar-header">' +
                    escapeHTML(group.name) +
                '</p>' +

                '<div class="slot-marquee">' +
                    '<div class="slot-track">' +
                        boxesHTML + boxesHTML +
                    '</div>' +
                '</div>' +
            '</div>';
    });

    calendarBox.innerHTML = html;
}


// ---------- FORMAT DATE ----------

function formatDate(dateString) {

    const parts =
        dateString.split("-");

    const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
    ];

    const month =
        monthNames[
            parseInt(parts[1], 10) - 1
        ];

    const day =
        parseInt(parts[2], 10);

    return month + " " + day;
}


// ---------- HELPER FUNCTIONS ----------

function getToken() {
    return localStorage.getItem("access_token");
}


function showMessage(elementId, text, type) {

    const el =
        document.getElementById(elementId);

    if (!el) {
        return;
    }

    el.textContent = text;

    el.classList.remove(
        "is-success",
        "is-error"
    );

    if (type === "success") {
        el.classList.add("is-success");
    }

    if (type === "error") {
        el.classList.add("is-error");
    }
}


function getErrorMessage(data) {

    if (!data) {
        return "Something went wrong.";
    }

    if (typeof data === "string") {
        return data;
    }

    if (data.message) {
        return data.message;
    }

    if (data.detail) {
        return data.detail;
    }

    if (data.error) {

        return typeof data.error === "string"
            ? data.error
            : "Something went wrong.";
    }


    let text = "";

    for (const key in data) {

        if (Array.isArray(data[key])) {

            text +=
                key +
                ": " +
                data[key].join(" ") +
                " ";
        }
    }

    return text.trim() ||
        "Something went wrong.";
}


function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text || "";

    return div.innerHTML;
}


// ---------- PENDING BOOKING ----------

function savePendingBooking(data) {

    sessionStorage.setItem(
        "pending_booking",
        JSON.stringify(data)
    );
}


function getPendingBooking() {

    const data =
        sessionStorage.getItem(
            "pending_booking"
        );

    if (!data) {
        return null;
    }

    try {
        return JSON.parse(data);

    } catch (e) {
        return null;
    }
}


function clearPendingBooking() {

    sessionStorage.removeItem(
        "pending_booking"
    );
}


// ---------- ACCOUNT TABS ----------

function showPanel(panelId) {

    const tabs =
        document.querySelectorAll(
            ".account-tab"
        );

    const panels =
        document.querySelectorAll(
            ".account-panel"
        );


    tabs.forEach(function (tab) {

        if (tab.dataset.target === panelId) {
            tab.classList.add("is-active");

        } else {
            tab.classList.remove("is-active");
        }
    });


    panels.forEach(function (panel) {

        if (panel.id === panelId) {
            panel.classList.add("is-active");

        } else {
            panel.classList.remove("is-active");
        }
    });
}


function setupAccountTabs() {

    const tabs =
        document.querySelectorAll(
            ".account-tab"
        );


    tabs.forEach(function (tab) {

        tab.addEventListener(
            "click",
            function () {

                showPanel(
                    tab.dataset.target
                );
            }
        );
    });
}


// ---------- NAV LOGIN ----------

function setupNavLogin() {

    const navLogin =
        document.getElementById(
            "navLogin"
        );

    if (!navLogin) {
        return;
    }


    navLogin.addEventListener(
        "click",
        function () {

            showPanel("login-panel");
        }
    );
}


// ---------- LOGIN FOR BOOKING ----------

function goToLoginForBooking() {

    showPanel("login-panel");


    const accountSection =
        document.getElementById(
            "account-section"
        );


    if (accountSection) {

        accountSection.scrollIntoView({
            behavior: "smooth"
        });
    }


    showMessage(
        "loginMessage",
        "Please log in or create an account to continue your booking.",
        "error"
    );
}


// ---------- SERVICE FEATURES ----------

function getServiceFeatures(serviceName) {

    const name =
        serviceName.toLowerCase();


    if (name.includes("basic")) {

        return [
            "Exterior body wash",
            "Wheel and tire rinse",
            "Quick towel dry"
        ];
    }


    if (name.includes("premium")) {

        return [
            "Everything in Standard",
            "Wax and shine coating",
            "Tire shine and dressing",
            "Air freshener"
        ];
    }


    if (name.includes("standard")) {

        return [
            "Everything in Basic",
            "Interior vacuum",
            "Dashboard and window cleaning"
        ];
    }


    return [];
}


function buildFeatureListHTML(features) {

    if (features.length === 0) {
        return "";
    }


    let html =
        '<ul class="service-features">';


    features.forEach(function (feature) {

        html +=
            "<li>" +
            escapeHTML(feature) +
            "</li>";
    });


    html += "</ul>";

    return html;
}


// ---------- LOAD SERVICES ----------

async function loadServices() {

    const container =
        document.getElementById(
            "services"
        );

    const select =
        document.getElementById(
            "service"
        );


    if (!container) {
        return;
    }


    try {

        const res =
            await fetch(
                API_URL +
                "/services/service/"
            );


        const data =
            await res.json();


        if (!res.ok) {

            throw new Error(
                getErrorMessage(data)
            );
        }


        const services =
            Array.isArray(data)
                ? data
                : (
                    data.data ||
                    data.results ||
                    []
                );


        // only active services
        const activeServices =
            services.filter(function (service) {

                return (
                    !service.status ||
                    service.status === "ACTIVE"
                );
            });


        // service dropdown
        if (select) {

            select.innerHTML =
                '<option value="">Choose your wash</option>';


            activeServices.forEach(
                function (service) {

                    const option =
                        document.createElement(
                            "option"
                        );


                    option.value =
                        service.id;


                    option.textContent =
                        service.service_name +
                        " - Rs. " +
                        service.price;


                    select.appendChild(
                        option
                    );
                }
            );
        }


        // service cards
        container.innerHTML = "";


        if (activeServices.length === 0) {

            container.innerHTML =
                '<p class="services-loading">No services available right now.</p>';

            return;
        }


        activeServices.forEach(
            function (service, index) {

                const card =
                    document.createElement(
                        "article"
                    );


                card.className =
                    "service-card";


                if (index === 1) {

                    card.classList.add(
                        "featured-service"
                    );
                }


                const badge =
                    index === 1
                        ? '<span class="popular-badge">POPULAR</span>'
                        : "";


                const featuresHTML =
                    buildFeatureListHTML(
                        getServiceFeatures(
                            service.service_name
                        )
                    );


                card.innerHTML =

                    badge +

                    '<div class="service-icon"></div>' +

                    "<h3>" +
                        escapeHTML(
                            service.service_name
                        ) +
                    "</h3>" +

                    "<p>" +
                        escapeHTML(
                            service.description || ""
                        ) +
                    "</p>" +

                    featuresHTML +

                    '<div class="service-bottom">' +

                        "<div>" +

                            "<span>Starting from</span>" +

                            "<strong>Rs. " +
                                escapeHTML(
                                    String(
                                        service.price
                                    )
                                ) +
                            "</strong>" +

                        "</div>" +

                        '<button type="button" class="service-book-button" data-service-id="' +
                            service.id +
                        '">Book now</button>' +

                    "</div>";


                container.appendChild(
                    card
                );
            }
        );


        setupServiceButtons();


    } catch (err) {

        console.error(
            "Could not load services:",
            err
        );


        container.innerHTML =
            '<p class="services-loading">Unable to load services.</p>';
    }
}


// ---------- SERVICE BUTTONS ----------

function setupServiceButtons() {

    const buttons =
        document.querySelectorAll(
            ".service-book-button"
        );


    buttons.forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                const select =
                    document.getElementById(
                        "service"
                    );


                if (select) {

                    select.value =
                        button.dataset.serviceId;
                }


                const bookingSection =
                    document.getElementById(
                        "booking-section"
                    );


                if (bookingSection) {

                    bookingSection.scrollIntoView({
                        behavior: "smooth"
                    });
                }
            }
        );
    });
}


// ---------- BOOKING FORM ----------

function setupBookingForm() {

    const form =
        document.getElementById(
            "bookingForm"
        );


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        async function (e) {

            e.preventDefault();


            const service =
                document.getElementById(
                    "service"
                ).value;


            const carModel =
                document.getElementById(
                    "carModel"
                ).value.trim();


            const carNumberPlate =
                document.getElementById(
                    "carNumberPlate"
                ).value.trim();


            const bookingDate =
                document.getElementById(
                    "bookingDate"
                ).value;


            const bookingTime =
                document.getElementById(
                    "bookingTime"
                ).value;


            if (!service) {

                showMessage(
                    "bookingMessage",
                    "Please select a service.",
                    "error"
                );

                return;
            }


            if (!carModel) {

                showMessage(
                    "bookingMessage",
                    "Please enter your car model.",
                    "error"
                );

                return;
            }


            if (!carNumberPlate) {

                showMessage(
                    "bookingMessage",
                    "Please enter your number plate.",
                    "error"
                );

                return;
            }


            if (!bookingDate) {

                showMessage(
                    "bookingMessage",
                    "Please select a booking date.",
                    "error"
                );

                return;
            }


            if (!bookingTime) {

                showMessage(
                    "bookingMessage",
                    "Please select a booking time.",
                    "error"
                );

                return;
            }


            // booking time must be 6 AM - 6 PM
            if (
                bookingTime < "06:00" ||
                bookingTime > "18:00"
            ) {

                showMessage(
                    "bookingMessage",
                    "Booking time must be between 6:00 AM and 6:00 PM.",
                    "error"
                );

                return;
            }


            // check if slot already exists
            const alreadyBooked =
                bookedSlots.some(
                    function (slot) {

                        return (
                            slot.booking_date ===
                                bookingDate &&

                            slot.booking_time.slice(0, 5) ===
                                bookingTime
                        );
                    }
                );


            if (alreadyBooked) {

                showMessage(
                    "bookingMessage",
                    "That time slot is already booked. Please choose another time.",
                    "error"
                );

                return;
            }


            const bookingData = {

                service:
                    service,

                car_model:
                    carModel,

                car_number_plate:
                    carNumberPlate,

                booking_date:
                    bookingDate,

                booking_time:
                    bookingTime
            };


            const token =
                getToken();


            // user is not logged in
            if (!token) {

                savePendingBooking(
                    bookingData
                );

                goToLoginForBooking();

                return;
            }


            const submitBtn =
                document.getElementById(
                    "bookingSubmitButton"
                );


            if (submitBtn) {

                submitBtn.disabled = true;

                submitBtn.textContent =
                    "Processing...";
            }


            await createBookingAndPay(
                bookingData,
                token
            );


            if (submitBtn) {

                submitBtn.disabled = false;

                submitBtn.textContent =
                    "Book now";
            }
        }
    );
}


// ---------- CREATE BOOKING + PAYMENT ----------

async function createBookingAndPay(
    booking,
    token
) {

    showMessage(
        "bookingMessage",
        "Creating your booking...",
        ""
    );


    try {

        // create booking
        const bookingRes =
            await fetch(
                API_URL +
                "/booking/view/",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            "Bearer " + token
                    },

                    body: JSON.stringify({

                        service:
                            Number(
                                booking.service
                            ),

                        car_model:
                            booking.car_model,

                        car_number_plate:
                            booking.car_number_plate,

                        booking_date:
                            booking.booking_date,

                        booking_time:
                            booking.booking_time
                    })
                }
            );


        const bookingData =
            await bookingRes.json();


        if (!bookingRes.ok) {

            showMessage(
                "bookingMessage",
                getErrorMessage(
                    bookingData
                ),
                "error"
            );

            return;
        }


        const bookingId =
            (
                bookingData.data &&
                bookingData.data.id
            ) ||
            bookingData.id;


        if (!bookingId) {

            showMessage(
                "bookingMessage",
                "Booking ID was not returned.",
                "error"
            );

            return;
        }


        clearPendingBooking();


        showMessage(
            "bookingMessage",
            "Booking created. Redirecting to payment...",
            "success"
        );


        // get payment URL
        const paymentRes =
            await fetch(
                API_URL +
                "/payment/" +
                bookingId +
                "/",
                {

                    method: "GET",

                    headers: {

                        "Authorization":
                            "Bearer " + token
                    }
                }
            );


        const paymentData =
            await paymentRes.json();


        if (!paymentRes.ok) {

            showMessage(
                "bookingMessage",
                getErrorMessage(
                    paymentData
                ),
                "error"
            );

            return;
        }


        const paymentUrl =
            paymentData.payment_url ||
            (
                paymentData.data &&
                paymentData.data.payment_url
            );


        if (!paymentUrl) {

            showMessage(
                "bookingMessage",
                "Payment URL was not returned.",
                "error"
            );

            return;
        }


        // redirect to Khalti
        window.location.href =
            paymentUrl;


    } catch (err) {

        console.error(
            "Booking error:",
            err
        );


        showMessage(
            "bookingMessage",
            "Something went wrong while creating the booking.",
            "error"
        );
    }
}


// ---------- LOGIN ----------

function setupLoginForm() {

    const form =
        document.getElementById(
            "loginForm"
        );


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        async function (e) {

            e.preventDefault();


            const email =
                document.getElementById(
                    "loginEmail"
                ).value.trim();


            const password =
                document.getElementById(
                    "loginPassword"
                ).value;


            if (!email || !password) {

                showMessage(
                    "loginMessage",
                    "Please enter your email and password.",
                    "error"
                );

                return;
            }


            showMessage(
                "loginMessage",
                "Logging in...",
                ""
            );


            try {

                const res =
                    await fetch(
                        API_URL +
                        "/account/login/",
                        {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                email:
                                    email,

                                password:
                                    password
                            })
                        }
                    );


                const data =
                    await res.json();


                if (!res.ok) {

                    showMessage(
                        "loginMessage",
                        getErrorMessage(
                            data
                        ),
                        "error"
                    );

                    return;
                }


                if (!data.access) {

                    showMessage(
                        "loginMessage",
                        "Login response did not contain an access token.",
                        "error"
                    );

                    return;
                }


                localStorage.setItem(
                    "access_token",
                    data.access
                );


                if (data.refresh) {

                    localStorage.setItem(
                        "refresh_token",
                        data.refresh
                    );
                }


                const pendingBooking =
                    getPendingBooking();


                form.reset();


                // normal login
                if (!pendingBooking) {

                    showMessage(
                        "loginMessage",
                        "Login successful.",
                        "success"
                    );


                    // load user's bookings
                    loadBookings();

                    return;
                }


                // login while booking
                showMessage(
                    "loginMessage",
                    "Login successful. Continuing your booking...",
                    "success"
                );


                await createBookingAndPay(
                    pendingBooking,
                    data.access
                );


            } catch (err) {

                console.error(
                    "Login error:",
                    err
                );


                showMessage(
                    "loginMessage",
                    "Unable to login. Please try again.",
                    "error"
                );
            }
        }
    );
}


// ---------- REGISTER ----------

function setupRegisterForm() {

    const form =
        document.getElementById(
            "registerForm"
        );


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        async function (e) {

            e.preventDefault();


            const fullName =
                document.getElementById(
                    "registerFullName"
                ).value.trim();


            const username =
                document.getElementById(
                    "registerUsername"
                ).value.trim();


            const email =
                document.getElementById(
                    "registerEmail"
                ).value.trim();


            const phone =
                document.getElementById(
                    "registerPhone"
                ).value.trim();


            const password =
                document.getElementById(
                    "registerPassword"
                ).value;


            if (
                !fullName ||
                !username ||
                !email ||
                !phone ||
                !password
            ) {

                showMessage(
                    "registerMessage",
                    "Please fill in all fields.",
                    "error"
                );

                return;
            }


            if (password.length < 8) {

                showMessage(
                    "registerMessage",
                    "Password must be at least 8 characters.",
                    "error"
                );

                return;
            }


            const submitBtn =
                document.getElementById(
                    "registerSubmitButton"
                );


            if (submitBtn) {

                submitBtn.disabled = true;

                submitBtn.textContent =
                    "Creating account...";
            }


            showMessage(
                "registerMessage",
                "Creating your account...",
                ""
            );


            try {

                const res =
                    await fetch(
                        API_URL +
                        "/account/register/",
                        {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                full_name:
                                    fullName,

                                username:
                                    username,

                                email:
                                    email,

                                phone_no:
                                    phone,

                                password:
                                    password
                            })
                        }
                    );


                const data =
                    await res.json();


                if (!res.ok) {

                    showMessage(
                        "registerMessage",
                        getErrorMessage(
                            data
                        ),
                        "error"
                    );

                    return;
                }


                const pendingBooking =
                    getPendingBooking();


                // normal registration
                if (!pendingBooking) {

                    form.reset();

                    showPanel(
                        "login-panel"
                    );


                    showMessage(
                        "loginMessage",
                        "Account created successfully. Please login.",
                        "success"
                    );

                    return;
                }


                // registration while booking
                showMessage(
                    "registerMessage",
                    "Account created. Logging you in...",
                    ""
                );


                const loginRes =
                    await fetch(
                        API_URL +
                        "/account/login/",
                        {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                email:
                                    email,

                                password:
                                    password
                            })
                        }
                    );


                const loginData =
                    await loginRes.json();


                if (
                    !loginRes.ok ||
                    !loginData.access
                ) {

                    form.reset();

                    showPanel(
                        "login-panel"
                    );


                    showMessage(
                        "loginMessage",
                        "Account created. Please login to continue your booking.",
                        "error"
                    );

                    return;
                }


                localStorage.setItem(
                    "access_token",
                    loginData.access
                );


                if (loginData.refresh) {

                    localStorage.setItem(
                        "refresh_token",
                        loginData.refresh
                    );
                }


                form.reset();


                await createBookingAndPay(
                    pendingBooking,
                    loginData.access
                );


            } catch (err) {

                console.error(
                    "Registration error:",
                    err
                );


                showMessage(
                    "registerMessage",
                    "Unable to create account. Please try again.",
                    "error"
                );


            } finally {

                if (submitBtn) {

                    submitBtn.disabled = false;

                    submitBtn.textContent =
                        "Create account";
                }
            }
        }
    );
}


// ---------- VIEW BOOKINGS ----------

async function loadBookings() {

    const container =
        document.getElementById(
            "bookingList"
        );


    const token =
        getToken();


    if (!container || !token) {
        return;
    }


    container.innerHTML =
        "<p>Loading your bookings...</p>";


    try {

        const res =
            await fetch(
                API_URL +
                "/booking/view/",
                {

                    method: "GET",

                    headers: {

                        "Authorization":
                            "Bearer " + token
                    }
                }
            );


        const data =
            await res.json();


        if (!res.ok) {

            console.error(
                "Booking fetch error:",
                data
            );


            container.innerHTML =
                "<p>Unable to load your bookings.</p>";

            return;
        }


        const bookings =
            Array.isArray(data)
                ? data
                : (
                    data.data ||
                    data.results ||
                    []
                );


        container.innerHTML = "";


        if (bookings.length === 0) {

            container.innerHTML =
                "<p>No bookings found.</p>";

            return;
        }


        bookings.forEach(
            function (booking) {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "booking-card";


                let serviceName = "";


                if (booking.service_name) {

                    serviceName =
                        booking.service_name;

                } else if (
                    booking.service &&
                    typeof booking.service === "object"
                ) {

                    serviceName =
                        booking.service.service_name ||
                        booking.service.name ||
                        "";

                } else {

                    serviceName =
                        booking.service || "";
                }


                card.innerHTML =

                    "<h3>Booking #" +
                        escapeHTML(
                            String(
                                booking.id || ""
                            )
                        ) +
                    "</h3>" +


                    "<p><strong>Service:</strong> " +
                        escapeHTML(
                            String(
                                serviceName
                            )
                        ) +
                    "</p>" +


                    "<p><strong>Car Model:</strong> " +
                        escapeHTML(
                            String(
                                booking.car_model || ""
                            )
                        ) +
                    "</p>" +


                    "<p><strong>Number Plate:</strong> " +
                        escapeHTML(
                            String(
                                booking.car_number_plate || ""
                            )
                        ) +
                    "</p>" +


                    "<p><strong>Booking Date:</strong> " +
                        escapeHTML(
                            String(
                                booking.booking_date || ""
                            )
                        ) +
                    "</p>" +


                    "<p><strong>Booking Time:</strong> " +
                        escapeHTML(
                            String(
                                booking.booking_time || ""
                            )
                        ) +
                    "</p>" +


                    "<p><strong>Payment Status:</strong> " +
                        escapeHTML(
                            String(
                                booking.payment_status || ""
                            )
                        ) +
                    "</p>";


                container.appendChild(
                    card
                );
            }
        );


    } catch (err) {

        console.error(
            "Bookings error:",
            err
        );


        container.innerHTML =
            "<p>Unable to load bookings.</p>";
    }
}


// ---------- LOGOUT ----------

function setupLogoutButton() {

    const btn =
        document.getElementById(
            "logoutButton"
        );


    if (!btn) {
        return;
    }


    btn.addEventListener(
        "click",
        function () {

            localStorage.removeItem(
                "access_token"
            );

            localStorage.removeItem(
                "refresh_token"
            );

            sessionStorage.removeItem(
                "pending_booking"
            );

            window.location.reload();
        }
    );
}


// ---------- MINIMUM BOOKING DATE ----------

function setMinDate() {

    const input =
        document.getElementById(
            "bookingDate"
        );


    if (!input) {
        return;
    }


    const now =
        new Date();


    const year =
        now.getFullYear();


    const month =
        String(
            now.getMonth() + 1
        ).padStart(2, "0");


    const day =
        String(
            now.getDate()
        ).padStart(2, "0");


    input.min =
        year +
        "-" +
        month +
        "-" +
        day;
}