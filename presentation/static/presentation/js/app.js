const API_URL = "/api";


// ================= HELPERS =================

function setMessage(el, text, type) {
    if (!el) return;

    el.textContent = text;
    el.classList.remove("is-success", "is-error");

    if (type === "success") {
        el.classList.add("is-success");
    } else if (type === "error") {
        el.classList.add("is-error");
    }
}


function setLoading(button, isLoading, loadingText, defaultText) {
    if (!button) return;

    button.disabled = isLoading;
    button.textContent = isLoading ? loadingText : defaultText;
}


function extractErrorText(data) {
    if (typeof data === "string") return data;

    if (data && data.message) return data.message;
    if (data && data.detail) return data.detail;
    if (data && data.error) return data.error;

    if (data && typeof data === "object") {
        const parts = [];

        Object.keys(data).forEach(function (key) {
            const value = data[key];

            if (Array.isArray(value)) {
                parts.push(value.join(" "));
            } else if (typeof value === "object") {
                parts.push(extractErrorText(value));
            } else {
                parts.push(value);
            }
        });

        if (parts.length) return parts.join(" ");
    }

    return "Something went wrong. Please try again.";
}


function getToken() {
    return localStorage.getItem("access_token");
}


// ================= ACCOUNT TABS =================

const accountTabs = document.querySelectorAll(".account-tab");

accountTabs.forEach(function (tab) {

    tab.addEventListener("click", function () {

        const targetId = tab.dataset.target;

        accountTabs.forEach(function (item) {
            item.classList.remove("is-active");
            item.setAttribute("aria-selected", "false");
        });

        document.querySelectorAll(".account-panel").forEach(function (panel) {
            panel.classList.remove("is-active");
        });

        tab.classList.add("is-active");
        tab.setAttribute("aria-selected", "true");

        const targetPanel = document.getElementById(targetId);

        if (targetPanel) {
            targetPanel.classList.add("is-active");
        }

    });

});


// ================= REGISTER =================

const registerForm = document.getElementById("registerForm");
const registerMessage = document.getElementById("registerMessage");

if (registerForm) {

    registerForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const username =
            document.getElementById("registerUsername").value;

        const email =
            document.getElementById("registerEmail").value;

        const phone =
            document.getElementById("registerPhone").value;

        const password =
            document.getElementById("registerPassword").value;

        const submitButton =
            registerForm.querySelector("button[type='submit']");


        setMessage(registerMessage, "", null);

        setLoading(
            submitButton,
            true,
            "Creating account...",
            "Create account"
        );


        try {

            const response = await fetch(
                `${API_URL}/account/register/`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        username: username,
                        email: email,
                        phone_no: phone,
                        password: password
                    })
                }
            );


            const data = await response.json();


            if (response.ok) {

                setMessage(
                    registerMessage,
                    data.message || "Account created successfully. Please login.",
                    "success"
                );

                registerForm.reset();

            } else {

                setMessage(
                    registerMessage,
                    extractErrorText(data),
                    "error"
                );

            }

        } catch (error) {

            console.error(error);

            setMessage(
                registerMessage,
                "Unable to connect to the server.",
                "error"
            );

        } finally {

            setLoading(
                submitButton,
                false,
                "Creating account...",
                "Create account"
            );

        }

    });

}


// ================= LOGIN =================

const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email =
            document.getElementById("loginEmail").value;

        const password =
            document.getElementById("loginPassword").value;

        const submitButton =
            loginForm.querySelector("button[type='submit']");


        setMessage(loginMessage, "", null);

        setLoading(
            submitButton,
            true,
            "Logging in...",
            "Log in"
        );


        try {

            const response = await fetch(
                `${API_URL}/account/login/`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );


            const data = await response.json();


            if (response.ok) {

                localStorage.setItem(
                    "access_token",
                    data.access
                );

                localStorage.setItem(
                    "refresh_token",
                    data.refresh
                );


                setMessage(
                    loginMessage,
                    "Logged in successfully. You can now book your wash.",
                    "success"
                );

                loginForm.reset();


                getServices();
                getBookings();

            } else {

                setMessage(
                    loginMessage,
                    extractErrorText(data),
                    "error"
                );

            }

        } catch (error) {

            console.error(error);

            setMessage(
                loginMessage,
                "Unable to connect to the server.",
                "error"
            );

        } finally {

            setLoading(
                submitButton,
                false,
                "Logging in...",
                "Log in"
            );

        }

    });

}


// ================= SERVICES =================

async function getServices() {

    const servicesContainer =
        document.getElementById("services");

    const serviceSelect =
        document.getElementById("service");


    if (!servicesContainer) return;


    servicesContainer.innerHTML = `
        <p class="services-loading">
            Loading services...
        </p>
    `;


    try {

        const response = await fetch(
            `${API_URL}/services/service/`,
            {
                method: "GET"
            }
        );


        const data = await response.json();


        if (!response.ok) {
            throw new Error(extractErrorText(data));
        }


        servicesContainer.innerHTML = "";


        if (serviceSelect) {

            serviceSelect.innerHTML =
                `<option value="">Select a service</option>`;

        }


        const activeServices = data.filter(function (service) {
            return service.status === "ACTIVE";
        });


        if (activeServices.length === 0) {

            servicesContainer.innerHTML = `
                <p>No services are currently available.</p>
            `;

            return;
        }


        activeServices.forEach(function (service, index) {

            let icon = "icon-droplet";
            let extraClass = "";
            let badge = "";


            if (index === 1) {
                icon = "icon-foam";
                extraClass = "featured-service";
                badge = `
                    <div class="popular-badge">
                        Most popular
                    </div>
                `;
            }

            if (index === 2) {
                icon = "icon-shine";
            }


            servicesContainer.innerHTML += `

                <div class="service-card ${extraClass}">

                    ${badge}

                    <div class="service-icon">

                        <svg width="26" height="26" aria-hidden="true">
                            <use href="#${icon}"></use>
                        </svg>

                    </div>


                    <h3>
                        ${service.service_name}
                    </h3>


                    <p>
                        ${service.description || "Professional car wash service."}
                    </p>


                    <div class="service-bottom">

                        <div>

                            <span>
                                Price
                            </span>

                            <strong>
                                Rs. ${service.price}
                            </strong>

                        </div>


                        <button
                            type="button"
                            class="service-book-button"
                            data-service-id="${service.id}"
                        >
                            Book Now
                        </button>

                    </div>

                </div>

            `;


            if (serviceSelect) {

                serviceSelect.innerHTML += `

                    <option value="${service.id}">
                        ${service.service_name} - Rs. ${service.price}
                    </option>

                `;

            }

        });


        addServiceBookButtons();

    } catch (error) {

        console.error(error);

        servicesContainer.innerHTML = `
            <p>${error.message}</p>
        `;

    }

}


// ================= SERVICE BOOK NOW =================

function addServiceBookButtons() {

    const buttons =
        document.querySelectorAll(".service-book-button");


    buttons.forEach(function (button) {

        button.addEventListener("click", function () {

            const serviceId =
                button.dataset.serviceId;

            const serviceSelect =
                document.getElementById("service");

            const bookingSection =
                document.getElementById("booking-section");


            if (serviceSelect) {

                serviceSelect.value = serviceId;

            }


            if (bookingSection) {

                bookingSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }


            setTimeout(function () {

                if (serviceSelect) {
                    serviceSelect.focus();
                }

            }, 600);

        });

    });

}


// ================= BOOKING =================

const bookingForm =
    document.getElementById("bookingForm");

const bookingMessage =
    document.getElementById("bookingMessage");


if (bookingForm) {

    bookingForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            if (!getToken()) {

                setMessage(
                    bookingMessage,
                    "Please login before making a booking.",
                    "error"
                );


                const accountSection =
                    document.getElementById("account-section");

                if (accountSection) {

                    setTimeout(function () {

                        accountSection.scrollIntoView({
                            behavior: "smooth"
                        });

                    }, 500);

                }

                return;

            }


            const service =
                document.getElementById("service").value;

            const carModel =
                document.getElementById("carModel").value;

            const carNumberPlate =
                document.getElementById("carNumberPlate").value;

            const bookingDate =
                document.getElementById("bookingDate").value;

            const bookingTime =
                document.getElementById("bookingTime").value;


            const submitButton =
                bookingForm.querySelector(
                    "button[type='submit']"
                );


            setMessage(bookingMessage, "", null);


            setLoading(
                submitButton,
                true,
                "Booking...",
                "Book Now"
            );


            try {

                const response = await fetch(
                    `${API_URL}/booking/view/`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json",

                            "Authorization":
                                `Bearer ${getToken()}`
                        },

                        body: JSON.stringify({

                            service: Number(service),

                            car_model: carModel,

                            car_number_plate:
                                carNumberPlate,

                            booking_date:
                                bookingDate,

                            booking_time:
                                bookingTime

                        })

                    }
                );


                const data =
                    await response.json();


                if (response.ok) {

                    setMessage(
                        bookingMessage,
                        data.message || "Booking successful!",
                        "success"
                    );


                    bookingForm.reset();


                    getBookings();

                } else {

                    setMessage(
                        bookingMessage,
                        extractErrorText(data),
                        "error"
                    );

                }

            } catch (error) {

                console.error(error);

                setMessage(
                    bookingMessage,
                    "Unable to connect to the server.",
                    "error"
                );

            } finally {

                setLoading(
                    submitButton,
                    false,
                    "Booking...",
                    "Book Now"
                );

            }

        }
    );

}


// ================= MY BOOKINGS =================

async function getBookings() {

    const bookingsContainer =
        document.getElementById("bookings");


    if (!bookingsContainer) return;


    if (!getToken()) {

        bookingsContainer.innerHTML = `
            <p>Please login to view your bookings.</p>
        `;

        return;

    }


    bookingsContainer.innerHTML = `
        <p>Loading your bookings...</p>
    `;


    try {

        const response = await fetch(
            `${API_URL}/booking/view/`,
            {
                headers: {

                    "Authorization":
                        `Bearer ${getToken()}`

                }
            }
        );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                extractErrorText(data)
            );

        }


        bookingsContainer.innerHTML = "";


        if (data.length === 0) {

            bookingsContainer.innerHTML = `
                <p>No bookings found yet.</p>
            `;

            return;

        }


        data.forEach(function (booking) {

            const serviceName =
                booking.service_name ||
                `Service #${booking.service}`;


            bookingsContainer.innerHTML += `

                <div class="booking-card">

                    <div class="booking-card-top">

                        <div>

                            <span class="booking-id">
                                Booking #${booking.id}
                            </span>

                            <h3>
                                ${serviceName}
                            </h3>

                        </div>


                        <span class="payment-status">
                            ${booking.payment_status}
                        </span>

                    </div>


                    <div class="booking-details">

                        <p>
                            <strong>Car:</strong>
                            ${booking.car_model}
                        </p>

                        <p>
                            <strong>Plate:</strong>
                            ${booking.car_number_plate}
                        </p>

                        <p>
                            <strong>Date:</strong>
                            ${booking.booking_date}
                        </p>

                        <p>
                            <strong>Time:</strong>
                            ${booking.booking_time}
                        </p>

                    </div>

                </div>

            `;

        });

    } catch (error) {

        console.error(error);

        bookingsContainer.innerHTML = `
            <p>${error.message}</p>
        `;

    }

}


// ================= REFRESH BOOKINGS =================

const loadBookingsButton =
    document.getElementById("loadBookingsButton");


if (loadBookingsButton) {

    loadBookingsButton.addEventListener(
        "click",
        function () {

            getBookings();

        }
    );

}


// ================= DATE RESTRICTION =================

const bookingDateInput =
    document.getElementById("bookingDate");


if (bookingDateInput) {

    const today =
        new Date().toISOString().split("T")[0];

    bookingDateInput.min = today;

}


// ================= AUTO LOAD =================

getServices();

if (getToken()) {

    getBookings();

}