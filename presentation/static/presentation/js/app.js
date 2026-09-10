const API_URL = "/api";


// =====================================================
// DOM READY
// =====================================================

document.addEventListener("DOMContentLoaded", function () {

    console.log("WashOS app.js loaded");

    initializeAccountTabs();
    initializeNavigation();
    initializeBooking();
    initializeLogin();
    initializeRegistration();
    initializeLogout();

    setMinimumBookingDate();

    getServices();

    if (getToken()) {
        getBookings();
    }

});


// =====================================================
// AUTH
// =====================================================

function getToken() {
    return localStorage.getItem("access_token");
}


function setMessage(element, message, type = "") {

    if (!element) {
        return;
    }

    element.textContent = message;

    element.classList.remove(
        "is-success",
        "is-error"
    );

    if (type === "success") {
        element.classList.add("is-success");
    }

    if (type === "error") {
        element.classList.add("is-error");
    }
}


// =====================================================
// ERROR HANDLING
// =====================================================

function extractErrorText(data) {

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

        if (typeof data.error === "string") {
            return data.error;
        }

        return extractErrorText(data.error);
    }

    if (typeof data === "object") {

        const messages = [];

        Object.keys(data).forEach(function (key) {

            const value = data[key];

            if (Array.isArray(value)) {

                messages.push(
                    `${key}: ${value.join(" ")}`
                );

            } else if (
                value &&
                typeof value === "object"
            ) {

                messages.push(
                    `${key}: ${extractErrorText(value)}`
                );

            } else {

                messages.push(
                    `${key}: ${String(value)}`
                );
            }

        });

        if (messages.length > 0) {
            return messages.join(" ");
        }
    }

    return "Something went wrong.";
}


// =====================================================
// PENDING BOOKING
// =====================================================

function savePendingBooking(booking) {

    sessionStorage.setItem(
        "pending_booking",
        JSON.stringify(booking)
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

    } catch (error) {

        sessionStorage.removeItem(
            "pending_booking"
        );

        return null;
    }
}


function clearPendingBooking() {

    sessionStorage.removeItem(
        "pending_booking"
    );
}


// =====================================================
// ACCOUNT TABS
// =====================================================

function showAccountPanel(targetId) {

    const tabs =
        document.querySelectorAll(
            ".account-tab"
        );

    const panels =
        document.querySelectorAll(
            ".account-panel"
        );

    tabs.forEach(function (tab) {

        const active =
            tab.dataset.target === targetId;

        tab.classList.toggle(
            "is-active",
            active
        );

        tab.setAttribute(
            "aria-selected",
            active ? "true" : "false"
        );

    });

    panels.forEach(function (panel) {

        panel.classList.toggle(
            "is-active",
            panel.id === targetId
        );

    });
}


function initializeAccountTabs() {

    const tabs =
        document.querySelectorAll(
            ".account-tab"
        );

    tabs.forEach(function (tab) {

        tab.addEventListener(
            "click",
            function (event) {

                event.preventDefault();
                event.stopPropagation();

                const target =
                    tab.dataset.target;

                console.log(
                    "Account tab clicked:",
                    target
                );

                showAccountPanel(target);

            }
        );

    });

}


function scrollToAccount() {

    const accountSection =
        document.getElementById(
            "account-section"
        );

    if (!accountSection) {
        return;
    }

    accountSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


function openAccountForBooking() {

    showAccountPanel("login-panel");

    scrollToAccount();

    setMessage(
        document.getElementById("loginMessage"),
        "Please log in or create an account to continue your booking.",
        "error"
    );

}


// =====================================================
// NAVIGATION
// =====================================================

function initializeNavigation() {

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

            showAccountPanel(
                "login-panel"
            );

        }
    );

}


// =====================================================
// SERVICES
// =====================================================

async function getServices() {

    const serviceContainer =
        document.getElementById(
            "services"
        );

    const serviceSelect =
        document.getElementById(
            "service"
        );

    if (!serviceContainer) {
        return;
    }

    try {

        const response =
            await fetch(
                `${API_URL}/services/service/`
            );

        const data =
            await response.json();

        if (!response.ok) {

            throw new Error(
                extractErrorText(data)
            );
        }

        const services =
            Array.isArray(data)
                ? data
                : data.data ||
                  data.results ||
                  [];

        /*
         * If your backend does not return `status`,
         * the service will also be accepted.
         */

        const activeServices =
            services.filter(function (service) {

                return (
                    service.status === undefined ||
                    service.status === null ||
                    service.status === "ACTIVE"
                );

            });


        // =================================================
        // SERVICE SELECT
        // =================================================

        if (serviceSelect) {

            serviceSelect.innerHTML = `
                <option value="">
                    Choose your wash
                </option>
            `;

            activeServices.forEach(
                function (service) {

                    const option =
                        document.createElement(
                            "option"
                        );

                    option.value =
                        service.id;

                    // FIXED: service.service_name
                    option.textContent =
                        `${service.service_name} - Rs. ${service.price}`;

                    serviceSelect.appendChild(
                        option
                    );

                }
            );

        }


        // =================================================
        // SERVICE CARDS
        // =================================================

        serviceContainer.innerHTML = "";

        if (activeServices.length === 0) {

            serviceContainer.innerHTML = `
                <p class="services-loading">
                    No services available right now.
                </p>
            `;

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


                const popularBadge =
                    index === 1
                        ? `<span class="popular-badge">POPULAR</span>`
                        : "";


                card.innerHTML = `

                    ${popularBadge}

                    <div class="service-icon">
                        <svg
                            width="22"
                            height="22"
                            aria-hidden="true"
                        >
                            <use href="#icon-droplet"></use>
                        </svg>
                    </div>

                    <h3>
                        ${escapeHTML(
                            service.service_name
                        )}
                    </h3>

                    <p>
                        ${escapeHTML(
                            service.description || ""
                        )}
                    </p>

                    <div class="service-bottom">

                        <div>

                            <span>
                                Starting from
                            </span>

                            <strong>
                                Rs. ${escapeHTML(
                                    String(service.price)
                                )}
                            </strong>

                        </div>

                        <button
                            type="button"
                            class="service-book-button"
                            data-service-id="${service.id}"
                        >
                            Book now
                        </button>

                    </div>

                `;


                serviceContainer.appendChild(
                    card
                );

            }
        );


        initializeServiceButtons();


    } catch (error) {

        console.error(
            "Service loading error:",
            error
        );

        serviceContainer.innerHTML = `
            <p class="services-loading">
                Unable to load services.
            </p>
        `;

    }

}


// =====================================================
// SERVICE BUTTONS
// =====================================================

function initializeServiceButtons() {

    const buttons =
        document.querySelectorAll(
            ".service-book-button"
        );

    buttons.forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                const serviceId =
                    button.dataset.serviceId;

                const serviceSelect =
                    document.getElementById(
                        "service"
                    );

                if (serviceSelect) {

                    serviceSelect.value =
                        serviceId;

                }


                const bookingSection =
                    document.getElementById(
                        "booking-section"
                    );

                if (bookingSection) {

                    bookingSection.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                }

            }
        );

    });

}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(value) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        value ?? "";

    return div.innerHTML;
}


// =====================================================
// BOOKING
// =====================================================

function initializeBooking() {

    const bookingForm =
        document.getElementById(
            "bookingForm"
        );

    if (!bookingForm) {
        return;
    }


    bookingForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const bookingMessage =
                document.getElementById(
                    "bookingMessage"
                );

            const submitButton =
                document.getElementById(
                    "bookingSubmitButton"
                );


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


            // =================================================
            // VALIDATION
            // =================================================

            if (!service) {

                setMessage(
                    bookingMessage,
                    "Please select a service.",
                    "error"
                );

                return;
            }

            if (!carModel) {

                setMessage(
                    bookingMessage,
                    "Please enter your car model.",
                    "error"
                );

                return;
            }

            if (!carNumberPlate) {

                setMessage(
                    bookingMessage,
                    "Please enter your number plate.",
                    "error"
                );

                return;
            }

            if (!bookingDate) {

                setMessage(
                    bookingMessage,
                    "Please select a booking date.",
                    "error"
                );

                return;
            }

            if (!bookingTime) {

                setMessage(
                    bookingMessage,
                    "Please select a booking time.",
                    "error"
                );

                return;
            }


            // =================================================
            // TIME VALIDATION
            // =================================================

            if (
                bookingTime < "06:00" ||
                bookingTime > "18:00"
            ) {

                setMessage(
                    bookingMessage,
                    "Booking time must be between 6:00 AM and 6:00 PM.",
                    "error"
                );

                return;
            }


            // =================================================
            // BOOKING DATA
            // =================================================

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


            // =================================================
            // USER NOT LOGGED IN
            // =================================================

            if (!token) {

                savePendingBooking(
                    bookingData
                );

                openAccountForBooking();

                return;
            }


            // =================================================
            // USER LOGGED IN
            // =================================================

            if (submitButton) {

                submitButton.disabled = true;

                submitButton.textContent =
                    "Processing...";
            }

            await createBookingAndPay(
                bookingData,
                token
            );


            if (submitButton) {

                submitButton.disabled = false;

                submitButton.textContent =
                    "Book now";
            }

        }
    );

}


// =====================================================
// CREATE BOOKING + PAYMENT
// =====================================================

async function createBookingAndPay(
    booking,
    token
) {

    const bookingMessage =
        document.getElementById(
            "bookingMessage"
        );

    setMessage(
        bookingMessage,
        "Creating your booking..."
    );


    try {

        // =================================================
        // CREATE BOOKING
        // =================================================

        const bookingResponse =
            await fetch(
                `${API_URL}/booking/view/`,
                {
                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`

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
            await bookingResponse.json();


        if (!bookingResponse.ok) {

            setMessage(
                bookingMessage,
                extractErrorText(
                    bookingData
                ),
                "error"
            );

            return;
        }


        // =================================================
        // GET BOOKING ID
        // =================================================

        const bookingId =
            bookingData?.data?.id ||
            bookingData?.id;


        if (!bookingId) {

            console.error(
                "Booking response:",
                bookingData
            );

            setMessage(
                bookingMessage,
                "Booking ID was not returned.",
                "error"
            );

            return;
        }


        clearPendingBooking();


        setMessage(
            bookingMessage,
            "Booking created. Redirecting to payment...",
            "success"
        );


        // =================================================
        // PAYMENT
        // =================================================

        const paymentResponse =
            await fetch(
                `${API_URL}/payment/${bookingId}/`,
                {
                    method: "GET",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`

                    }
                }
            );


        const paymentData =
            await paymentResponse.json();


        if (!paymentResponse.ok) {

            setMessage(
                bookingMessage,
                extractErrorText(
                    paymentData
                ),
                "error"
            );

            return;
        }


        const paymentUrl =
            paymentData?.payment_url ||
            paymentData?.data?.payment_url;


        if (!paymentUrl) {

            console.error(
                "Payment response:",
                paymentData
            );

            setMessage(
                bookingMessage,
                "Payment URL was not returned.",
                "error"
            );

            return;
        }


        // =================================================
        // REDIRECT TO KHALTI
        // =================================================

        window.location.href =
            paymentUrl;


    } catch (error) {

        console.error(
            "Booking error:",
            error
        );

        setMessage(
            bookingMessage,
            "Something went wrong while creating the booking.",
            "error"
        );

    }

}


// =====================================================
// LOGIN
// =====================================================

function initializeLogin() {

    const loginForm =
        document.getElementById(
            "loginForm"
        );

    if (!loginForm) {
        return;
    }


    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const loginMessage =
                document.getElementById(
                    "loginMessage"
                );


            const email =
                document.getElementById(
                    "loginEmail"
                ).value.trim();


            const password =
                document.getElementById(
                    "loginPassword"
                ).value;


            if (!email || !password) {

                setMessage(
                    loginMessage,
                    "Please enter your email and password.",
                    "error"
                );

                return;
            }


            setMessage(
                loginMessage,
                "Logging in..."
            );


            try {

                const response =
                    await fetch(
                        `${API_URL}/account/login/`,
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
                    await response.json();


                if (!response.ok) {

                    setMessage(
                        loginMessage,
                        extractErrorText(data),
                        "error"
                    );

                    return;
                }


                if (!data.access) {

                    setMessage(
                        loginMessage,
                        "Login response did not contain an access token.",
                        "error"
                    );

                    return;
                }


                // =================================================
                // SAVE JWT
                // =================================================

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


                // =================================================
                // CHECK PENDING BOOKING
                // =================================================

                const pendingBooking =
                    getPendingBooking();


                loginForm.reset();


                // =================================================
                // NORMAL LOGIN
                // =================================================

                if (!pendingBooking) {

                    setMessage(
                        loginMessage,
                        "Login successful.",
                        "success"
                    );

                    await getBookings();

                    return;
                }


                // =================================================
                // LOGIN DURING BOOKING
                // =================================================

                setMessage(
                    loginMessage,
                    "Login successful. Continuing your booking...",
                    "success"
                );


                await createBookingAndPay(
                    pendingBooking,
                    data.access
                );

            } catch (error) {

                console.error(
                    "Login error:",
                    error
                );

                setMessage(
                    loginMessage,
                    "Unable to login. Please try again.",
                    "error"
                );

            }

        }
    );

}


// =====================================================
// REGISTER
// =====================================================

function initializeRegistration() {

    const registerForm =
        document.getElementById(
            "registerForm"
        );

    if (!registerForm) {
        return;
    }


    registerForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            console.log(
                "REGISTER BUTTON CLICKED"
            );


            const registerMessage =
                document.getElementById(
                    "registerMessage"
                );


            const submitButton =
                document.getElementById(
                    "registerSubmitButton"
                );


            // =================================================
            // VALUES
            // =================================================

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


            // =================================================
            // VALIDATION
            // =================================================

            if (
                !fullName ||
                !username ||
                !email ||
                !phone ||
                !password
            ) {

                setMessage(
                    registerMessage,
                    "Please fill in all fields.",
                    "error"
                );

                return;
            }


            if (password.length < 8) {

                setMessage(
                    registerMessage,
                    "Password must be at least 8 characters.",
                    "error"
                );

                return;
            }


            // =================================================
            // DISABLE BUTTON
            // =================================================

            if (submitButton) {

                submitButton.disabled = true;

                submitButton.textContent =
                    "Creating account...";

            }


            setMessage(
                registerMessage,
                "Creating your account..."
            );


            try {

                // =================================================
                // REGISTER
                // =================================================

                const response =
                    await fetch(
                        `${API_URL}/account/register/`,
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
                    await response.json();


                console.log(
                    "Registration response:",
                    data
                );


                if (!response.ok) {

                    setMessage(
                        registerMessage,
                        extractErrorText(data),
                        "error"
                    );

                    return;
                }


                // =================================================
                // CHECK PENDING BOOKING
                // =================================================

                const pendingBooking =
                    getPendingBooking();


                // =================================================
                // NORMAL REGISTRATION
                // =================================================

                if (!pendingBooking) {

                    registerForm.reset();

                    showAccountPanel(
                        "login-panel"
                    );

                    setMessage(
                        document.getElementById(
                            "loginMessage"
                        ),
                        "Account created successfully. Please login.",
                        "success"
                    );

                    return;
                }


                // =================================================
                // REGISTER DURING BOOKING
                // =================================================

                setMessage(
                    registerMessage,
                    "Account created. Logging you in..."
                );


                // =================================================
                // AUTO LOGIN
                // =================================================

                const loginResponse =
                    await fetch(
                        `${API_URL}/account/login/`,
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
                    await loginResponse.json();


                if (!loginResponse.ok) {

                    registerForm.reset();

                    showAccountPanel(
                        "login-panel"
                    );

                    setMessage(
                        document.getElementById(
                            "loginMessage"
                        ),
                        "Account created successfully. Please login to continue your booking.",
                        "error"
                    );

                    return;
                }


                if (!loginData.access) {

                    registerForm.reset();

                    showAccountPanel(
                        "login-panel"
                    );

                    setMessage(
                        document.getElementById(
                            "loginMessage"
                        ),
                        "Account created. Please login to continue.",
                        "error"
                    );

                    return;
                }


                // =================================================
                // SAVE JWT
                // =================================================

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


                registerForm.reset();


                // =================================================
                // CONTINUE BOOKING
                // =================================================

                await createBookingAndPay(
                    pendingBooking,
                    loginData.access
                );


            } catch (error) {

                console.error(
                    "Registration error:",
                    error
                );

                setMessage(
                    registerMessage,
                    "Unable to create account. Please try again.",
                    "error"
                );

            } finally {

                if (submitButton) {

                    submitButton.disabled = false;

                    submitButton.textContent =
                        "Create account";

                }

            }

        }
    );

}


// =====================================================
// GET BOOKINGS
// =====================================================

async function getBookings() {

    const bookingsContainer =
        document.getElementById(
            "bookings"
        );


    if (!bookingsContainer) {
        return;
    }


    const token =
        getToken();


    if (!token) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/booking/view/`,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            console.error(
                "Booking fetch error:",
                data
            );

            return;
        }


        const bookings =
            Array.isArray(data)
                ? data
                : data.data ||
                  data.results ||
                  [];


        bookingsContainer.innerHTML = "";


        if (bookings.length === 0) {

            bookingsContainer.innerHTML = `
                <p>No bookings found.</p>
            `;

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


                card.innerHTML = `

                    <h3>
                        Booking #${booking.id}
                    </h3>

                    <p>
                        Date:
                        ${escapeHTML(
                            String(booking.booking_date || "")
                        )}
                    </p>

                    <p>
                        Time:
                        ${escapeHTML(
                            String(booking.booking_time || "")
                        )}
                    </p>

                    <p>
                        Car:
                        ${escapeHTML(
                            String(booking.car_model || "")
                        )}
                    </p>

                    <p>
                        Number Plate:
                        ${escapeHTML(
                            String(
                                booking.car_number_plate || ""
                            )
                        )}
                    </p>

                    <p>
                        Payment:
                        ${escapeHTML(
                            String(
                                booking.payment_status || ""
                            )
                        )}
                    </p>

                `;


                bookingsContainer.appendChild(
                    card
                );

            }
        );


    } catch (error) {

        console.error(
            "Bookings error:",
            error
        );

    }

}


// =====================================================
// LOGOUT
// =====================================================

function initializeLogout() {

    const logoutButton =
        document.getElementById(
            "logoutButton"
        );

    if (!logoutButton) {
        return;
    }


    logoutButton.addEventListener(
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


// =====================================================
// MINIMUM BOOKING DATE
// =====================================================

function setMinimumBookingDate() {

    const bookingDateInput =
        document.getElementById(
            "bookingDate"
        );

    if (!bookingDateInput) {
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


    const today =
        `${year}-${month}-${day}`;


    bookingDateInput.min =
        today;

}