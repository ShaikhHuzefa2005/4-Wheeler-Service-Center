const express = require("express");
const path = require("path");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const multer = require("multer");
const { body, validationResult } = require("express-validator");
const bodyParser = require("body-parser");
const axios = require("axios");
const CryptoJS = require("crypto-js");
const cors = require("cors");
const { v4: uuidv4 } = require('uuid');
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const puppeteer = require("puppeteer");
const server = http.createServer(app);

const io = new Server(server, {       // ✅ Socket connection
    cors: {
        origin: "*", // for dev
        methods: ["GET", "POST"]
    }
});

app.use(cors());

//SESSION CREATION
const session = require("express-session");

// ✅ Create ONE session middleware
const sessionMiddleware = session({
    secret: "my_secret_key", // change this in production
    resave: false,
    saveUninitialized: true,
});

// ✅ Use it in Express
app.use(sessionMiddleware);

// ✅ Wrap and use it in Socket.IO
io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
});

function isAdmin(req, res, next) {
    if (!req.session.admin) {
        return res.redirect("/admin_login");
    }
    next();
}

// --- DB CONNECTION ---
const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "four_wheeler_service_center",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test DB connection (wrap in an async IIFE)
(async () => {
    try {
        const conn = await pool.getConnection();
        console.log("✅ MySQL Connected!");
        conn.release();
    } catch (err) {
        console.error("❌ DB Connection Failed:", err);
    }
})();

// --- VIEW ENGINE ---
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// --- STATIC FILES ---
app.use(express.static("public"));

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// --- ROUTES ---
app.get("/register", (req, res) => {
    res.render("register");
});


app.get("/book_service", (req, res) => {
    res.render("book_service", { session: req.session });
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/user_profile", async (req, res) => {
    try {
        if (!req.session.user_id) {
            return res.redirect("/login");
        }

        const [rows] = await pool.query("SELECT * FROM users WHERE user_id = ?", [req.session.user_id]);

        if (rows.length === 0) {
            return res.status(404).send("User not found");
        }

        const user = rows[0];
        res.render("user_profile", { user, session: req.session }); // ✅ Pass user to EJS
    } catch (err) {
        console.error("❌ Error fetching user profile:", err);
        res.status(500).send("Error loading profile");
    }
});

// --- SHOW ALL USER PROFILES ---
app.get("/profiles", isAdmin, async (req, res) => {
    try {
        // ✅ Fetch all users
        const [users] = await pool.query(`
            SELECT user_id, name, phone, email, address, profile_image
            FROM users
            ORDER BY created_at DESC
        `);

        // ✅ Pass users to EJS
        res.render("profiles", { users });
    } catch (err) {
        console.error("❌ Error fetching profiles:", err);
        res.status(500).send("Error loading profiles page");
    }
});

app.get("/index", (req, res) => {
    const cities = [
        "Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Thane",
        "Navi Mumbai", "Kolhapur", "Solapur", "Amravati", "Jalgaon",
        "Latur", "Sangli", "Satara", "Ratnagiri", "Nanded",
        "Akola", "Ahmednagar", "Palghar", "Gondia"
    ];

    res.render("index", { cities, session: req.session });
});

app.get("/city/:name", async (req, res) => {
    try {
        const city = req.params.name;

        const [rows] = await pool.query(
            "SELECT * FROM locations WHERE city = ? ORDER BY name LIMIT 10",
            [city]
        );

        res.render("city", { city, locations: rows, session: req.session });
    } catch (err) {
        console.error("❌ Error loading city:", err);
        res.status(500).send("Error loading city page");
    }
});

app.get("/admin_login", (req, res) => {
    res.render("admin_login");
});
app.get("/success", (req, res) => {
    res.render("success");
});

app.get("/failure", (req, res) => {
    res.render("failure");
});

app.get("/", (req, res) => {
    const reviews = [
        { name: "Sarah", img: "https://randomuser.me/api/portraits/women/44.jpg", text: "Great service, my car feels brand new!", stars: "★★★★★" },
        { name: "Jack", img: "https://randomuser.me/api/portraits/men/32.jpg", text: "Awesome, my car is brand new!", stars: "★★★★" },
        { name: "Peter", img: "https://randomuser.me/api/portraits/men/40.jpg", text: "There were a few ups and down but overall service was great!", stars: "★★★" },
        { name: "Abdul", img: "https://randomuser.me/api/portraits/men/20.jpg", text: "I like the look of my car after modifying it!", stars: "★★★★★" },
        { name: "Gulbahar", img: "https://randomuser.me/api/portraits/women/60.jpg", text: "Could have been better but nice according to the price!", stars: "★★★★" },
        { name: "Manthan", img: "https://randomuser.me/api/portraits/men/57.jpg", text: "It is alright.", stars: "★★★★" }
    ];

    res.render("landing", { reviews, session: req.session });
});

app.get("/landing", (req, res) => {
    const reviews = [
        { name: "Sarah", img: "https://randomuser.me/api/portraits/women/44.jpg", text: "Great service, my car feels brand new!", stars: "★★★★★" },
        { name: "Jack", img: "https://randomuser.me/api/portraits/men/32.jpg", text: "Awesome, my car is brand new!", stars: "★★★★" },
        { name: "Peter", img: "https://randomuser.me/api/portraits/men/40.jpg", text: "There were a few ups and down but overall service was great!", stars: "★★★" },
        { name: "Abdul", img: "https://randomuser.me/api/portraits/men/20.jpg", text: "I like the look of my car after modifying it!", stars: "★★★★★" },
        { name: "Gulbahar", img: "https://randomuser.me/api/portraits/women/60.jpg", text: "Could have been better but nice according to the price!", stars: "★★★★" },
        { name: "Manthan", img: "https://randomuser.me/api/portraits/men/57.jpg", text: "It is alright.", stars: "★★★★" }
    ];

    res.render("landing", { reviews, session: req.session });
});

app.get("/view_booking", async (req, res) => {
    try {
        if (!req.session.user_id) {
            return res.redirect("/login");
        }

        const [bookings] = await pool.query(
            `SELECT 
                b.booking_id, 
                b.car_name, 
                b.booking_date, 
                b.status, 
                b.payment_status,
                b.lat, 
                b.lng,
                CASE 
                    WHEN EXISTS (
                        SELECT 1 
                        FROM recommendations r
                        JOIN services s ON r.service_id = s.service_id
                        WHERE r.user_id = b.user_id
                    ) 
                    THEN 1 ELSE 0 
                END AS has_recommendations
            FROM bookings b
            WHERE b.user_id = ?
            ORDER BY b.booking_date DESC`,
            [req.session.user_id]
        );

        res.render("view_booking", { bookings, session: req.session });
    } catch (err) {
        console.error("❌ Error fetching bookings:", err);
        res.status(500).send("Error loading bookings");
    }
});

app.get("/admin", async (req, res) => {
    try {
        if (!req.session.admin) {
            return res.redirect("/admin_login"); // ✅ prevent direct access
        }

        // Get all users
        const [users] = await pool.query(`
            SELECT user_id, name, phone, email, address 
            FROM users
            ORDER BY user_id DESC
        `);

        // ✅ Get only paid bookings
        const [bookings] = await pool.query(`
            SELECT b.*, u.name as user_name
            FROM bookings b
            JOIN users u ON b.user_id = u.user_id
            WHERE b.payment_status = 'paid'
            ORDER BY b.booking_date DESC
        `);

        res.render("admin", { users, bookings });
    } catch (err) {
        console.error("❌ Error loading admin page:", err);
        res.status(500).send("Something went wrong.");
    }
});

app.get("/payment/:bookingId", async (req, res) => {
    try {
        if (!req.session.user_id) {
            return res.redirect("/login");
        }

        const bookingId = req.params.bookingId;

        // save bookingId in session 🔥
        req.session.bookingData = { booking_id: bookingId };

        // Fetch recommended services only for this booking
        const [recommendedServices] = await pool.query(
            `SELECT s.service_id, s.name, s.price 
             FROM recommendations r
             JOIN services s ON r.service_id = s.service_id
             WHERE r.user_id = ? AND r.booking_id = ?`,
            [req.session.user_id, bookingId]
        );

        if (recommendedServices.length === 0) {
            return res.send(`<script>alert('No recommended services available for this booking!'); window.location.href='/view_booking';</script>`);
        }

        const totalPrice = recommendedServices.reduce((sum, s) => sum + parseFloat(s.price), 0);
        req.session.totalPrice = totalPrice;

        res.render("payment", { services: recommendedServices, totalPrice, session: req.session });
    } catch (err) {
        console.error("❌ Error fetching payment:", err);
        res.status(500).send("Error loading payment page");
    }
});

app.get("/receipt/:booking_id/download", async (req, res) => {
    let browser = null;
    try {
        const { booking_id } = req.params;

        // Fetch booking + user
        const [bookingRows] = await pool.query(
            `SELECT b.*, u.name, u.email, u.phone, u.address
             FROM bookings b
             JOIN users u ON b.user_id = u.user_id
             WHERE b.booking_id = ?`,
            [booking_id]
        );

        if (bookingRows.length === 0) return res.status(404).send("Booking not found");
        const booking = bookingRows[0];

        // Fetch services
        const [services] = await pool.query(
            `SELECT s.name, s.price
             FROM recommendations r
             JOIN services s ON r.service_id = s.service_id
             WHERE r.booking_id = ?`,
            [booking_id]
        );

        // Location
        let bookingLocation = null;
        if (booking.location_id) {
            const [locRows] = await pool.query(
                "SELECT city, name, lat, lng FROM locations WHERE id = ?",
                [booking.location_id]
            );
            if (locRows.length > 0) bookingLocation = locRows[0];
        }

        // Render HTML from EJS
        const ejs = require("ejs");
        const html = await ejs.renderFile(
            path.join(__dirname, "views", "receipt.ejs"),
            { booking, services, bookingLocation }
        );

        // Launch Puppeteer to generate PDF with proper configuration
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu'
            ]
        });
        
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: "networkidle0" });

        const pdfBuffer = await page.pdf({ format: "A4" });

        // Send PDF as download
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=receipt_${booking_id}.pdf`);
        res.send(pdfBuffer);

    } catch (err) {
        console.error("❌ Error generating receipt PDF:", err);
        res.status(500).send("Error generating receipt");
    } finally {
        // ✅ Always close browser in finally block
        if (browser) {
            try {
                await browser.close();
            } catch (closeErr) {
                console.error("❌ Error closing browser:", closeErr);
            }
        }
    }
});

app.get("/profile/:id", async (req, res) => {
    const userId = req.params.id;

    // fetch user
    const [userRows] = await pool.query("SELECT * FROM users WHERE user_id = ?", [userId]);
    if (userRows.length === 0) return res.status(404).send("User not found");

    // fetch bookings
    const [bookingRows] = await pool.query(
        "SELECT * FROM bookings WHERE user_id = ? ORDER BY booking_date DESC",
        [userId]
    );

    // parse JSON media field
    bookingRows.forEach((b) => {
        if (b.media) {
            try {
                b.media = JSON.parse(b.media);
            } catch {
                b.media = {};
            }
        }
    });

    // fetch services
    const [serviceRows] = await pool.query("SELECT * FROM services");

    // fetch recommendations
    const [recommendRows] = await pool.query(
        `SELECT r.id, s.name, s.price, r.recommended_at 
     FROM recommendations r 
     JOIN services s ON r.service_id = s.service_id 
     WHERE r.user_id = ?`,
        [userId]
    );

    res.render("profile_detail", {
        user: userRows[0],
        bookings: bookingRows,
        services: serviceRows,
        recommendations: recommendRows,
        session: req.session
    });
});

// Admin dashboard route (add this near other admin routes)
app.get("/admin_dashboard", isAdmin, async (req, res) => {
    try {
        // Users per month
        const [users] = await pool.query(`
            SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COUNT(*) AS count
            FROM users
            GROUP BY month
            ORDER BY month
        `);

        // Bookings by status
        const [bookings] = await pool.query(`
            SELECT status, COUNT(*) AS count
            FROM bookings
            GROUP BY status
        `);

        // Monthly revenue (only paid bookings)
        const [revenue] = await pool.query(`
            SELECT DATE_FORMAT(b.booking_date, '%Y-%m') AS month, IFNULL(SUM(s.price),0) AS total
            FROM bookings b
            JOIN recommendations r ON b.booking_id = r.booking_id
            JOIN services s ON r.service_id = s.service_id
            WHERE b.payment_status = 'paid'
            GROUP BY month
            ORDER BY month
        `);

        // Services popularity
        const [services] = await pool.query(`
            SELECT s.name AS service_name, COUNT(*) AS count
            FROM recommendations r
            JOIN services s ON r.service_id = s.service_id
            GROUP BY s.service_id
            ORDER BY count DESC
            LIMIT 10
        `);

        // Summary numbers (fixed ✅ no [] around queries)
        const [[{ total_bookings = 0 }]] = await pool.query(`
            SELECT COUNT(*) AS total_bookings FROM bookings
        `);

        const [[{ total_users = 0 }]] = await pool.query(`
            SELECT COUNT(*) AS total_users FROM users
        `);

        const [[{ total_revenue = 0 }]] = await pool.query(`
            SELECT IFNULL(SUM(s.price),0) AS total_revenue
            FROM bookings b
            JOIN recommendations r ON b.booking_id = r.booking_id
            JOIN services s ON r.service_id = s.service_id
            WHERE b.payment_status = 'paid'
        `);

        res.render("admin_dashboard", {
            summary: {
                totalBookings: total_bookings,
                totalUsers: total_users,
                totalRevenue: total_revenue
            },
            chartData: {
                users,
                bookings,
                revenue,
                services
            },
            session: req.session
        });
    } catch (err) {
        console.error("❌ Error fetching admin dashboard data:", err);
        res.status(500).send("Error loading admin dashboard");
    }
});


// Multer Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/uploads/");  // save inside public/uploads
    },
    filename: (req, file, cb) => {
        const uniqueName = crypto.randomBytes(8).toString("hex") + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({ storage });

// --- UPDATE STATUS (admin) ---
app.post("/admin/update-status", async (req, res) => {
    try {
        const { booking_id, status } = req.body;

        await pool.query("UPDATE bookings SET status = ? WHERE booking_id = ?", [status, booking_id]);

        console.log(`✅ Booking ${booking_id} updated -> ${status}`);

        // 🔥 Emit event to all clients (admins/users)
        io.emit("statusUpdated", { booking_id, status });

        res.json({ success: true, message: "Status updated" });
    } catch (err) {
        console.error("❌ Failed to update status:", err);
        res.status(500).json({ success: false, message: "Error updating status" });
    }
});

app.post("/book_service",
    upload.fields([
        { name: "exterior_photos[]", maxCount: 5 },
        { name: "engine_photos[]", maxCount: 5 },
        { name: "tire_photos[]", maxCount: 5 },
        { name: "brake_photos[]", maxCount: 5 },
        { name: "interior_photos[]", maxCount: 5 },
        { name: "underbody_photos[]", maxCount: 5 },
        { name: "problem_video", maxCount: 2 }
    ]),
    [
        body("car_model")
            .trim()
            .notEmpty().withMessage("Car model is required")
            .isLength({ min: 2, max: 50 }).withMessage("Car model must be 2–50 characters"),
        body("year")
            .isInt({ min: 1990, max: new Date().getFullYear() + 1 })
            .withMessage("Enter a valid year between 1990 and current year"),
        body("vehicle_number")
            .trim()
            .matches(/^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$/i)
            .withMessage("Enter a valid vehicle number (e.g., MH12AB1234)"),
        body("pickup_drop")
            .isIn(["0", "1"]).withMessage("Pickup & Drop must be Yes(1) or No(0)"),
        body("extra_notes")
            .optional({ checkFalsy: true })
            .isLength({ max: 500 }).withMessage("Notes must be under 500 characters"),
        body("location_id")
            .custom((value, { req }) => {
                if (req.body.pickup_drop === "1" && (!value || !req.session.selectedLocation)) {
                    throw new Error("Location is required when Pickup & Drop is Yes");
                }
                return true;
            })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            if (!req.session.user_id) {
                return res.redirect("/login");
            }

            const user_id = req.session.user_id;
            const { car_model, year, vehicle_number, pickup_drop, extra_notes } = req.body;

            const booking_number = "BOOK-" + crypto.randomBytes(4).toString("hex");

            // Build media JSON safely
            const media = {
                exterior: (req.files["exterior_photos[]"] || []).map(f => "/uploads/" + f.filename),
                engine: (req.files["engine_photos[]"] || []).map(f => "/uploads/" + f.filename),
                tire: (req.files["tire_photos[]"] || []).map(f => "/uploads/" + f.filename),
                brake: (req.files["brake_photos[]"] || []).map(f => "/uploads/" + f.filename),
                interior: (req.files["interior_photos[]"] || []).map(f => "/uploads/" + f.filename),
                underbody: (req.files["underbody_photos[]"] || []).map(f => "/uploads/" + f.filename),
                video: (req.files["problem_video"] || []).map(f => "/uploads/" + f.filename)
            };

            // Insert Query
            let query = `
                INSERT INTO bookings 
                (user_id, car_name, year, vehicle_number, pickup_drop, extra_notes, booking_number, media
            `;
            let values = [
                user_id,
                car_model,
                year,
                vehicle_number,
                pickup_drop ? 1 : 0,
                extra_notes || "",
                booking_number,
                JSON.stringify(media)
            ];

            if (req.session.selectedLocation) {
                query += `, lat, lng, location_id`;
                values.push(
                    req.session.selectedLocation.lat,
                    req.session.selectedLocation.lng,
                    req.session.selectedLocation.id
                );
            }

            query += `) VALUES (${values.map(() => "?").join(",")})`;

            await pool.query(query, values);

            // Clear session location
            delete req.session.selectedLocation;

            res.send(`<script>alert('✅ Booking stored successfully!'); window.location.href='/book_service';</script>`);
        } catch (err) {
            console.error("❌ Error saving booking:", err);
            res.status(500).send("Error saving booking");
        }
    }
);
app.post("/save-location", async (req, res) => {
    try {
        if (!req.session.user_id) {
            return res.status(401).json({ message: "User not logged in" });
        }

        const { location_id, lat, lng, name } = req.body;

        // Validate inputs
        if (!location_id || !name || isNaN(parseFloat(lat)) || isNaN(parseFloat(lng))) {
            return res.status(400).json({ message: "Invalid location data" });
        }

        const [locRows] = await pool.query(
            "SELECT id, city, name, lat, lng FROM locations WHERE id = ?",
            [location_id]
        );

        if (locRows.length === 0) {
            return res.status(404).json({ message: "Location not found" });
        }

        // Store location in session
        req.session.selectedLocation = {
            id: location_id,
            name: locRows[0].name,
            lat: parseFloat(lat),
            lng: parseFloat(lng)
        };


        res.json({ message: `Location saved: ${locRows[0].city} - ${locRows[0].name}` });
    } catch (err) {
        console.error("❌ Error saving location:", err);
        res.status(500).json({ message: "Error saving location" });
    }
});

app.post("/user_profile/update", upload.single("profile_image"), async (req, res) => {
    try {
        if (!req.session.user_id) {
            return res.redirect("/login");
        }

        const { name, email, phone, address } = req.body;
        const profileImage = req.file ? "/uploads/" + req.file.filename : null;

        let query = `
            UPDATE users 
            SET name = ?, email = ?, phone = ?, address = ?
        `;
        let values = [name, email, phone, address];

        if (profileImage) {
            query += `, profile_image = ?`;
            values.push(profileImage);
        }

        query += ` WHERE user_id = ?`;
        values.push(req.session.user_id);

        await pool.query(query, values);

        console.log("✅ User updated:", req.session.user_id);
        res.redirect("/user_profile"); // reload profile page with updated data
    } catch (err) {
        console.error("❌ User update failed:", err);
        res.status(500).send("Something went wrong while updating profile.");
    }
});

// --- REGISTER ROUTE (POST) ---
app.post("/register",
    upload.single("profile_image"),
    [
        body("name")
        .trim()
    .notEmpty().withMessage("Name is required")
    .isLength({ min: 2, max: 50 }).withMessage("Name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s]+$/).withMessage("Name can only contain letters and spaces")
    .escape(),
        body("email").trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Invalid email address")
    .normalizeEmail({ gmail_remove_dots: false }),
        body("phone").isLength({ min: 10, max: 10 }).withMessage("Phone must be 10 digits"),
        body("password")
            .isLength({ min: 8, max: 72 }).withMessage("Password must be between 8 to 72 characters")
            .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter")
            .matches(/[a-z]/).withMessage("Password must contain at least one lowercase letter")
            .matches(/\d/).withMessage("Password must contain at least one number")
            .matches(/[@$!%*?&#]/).withMessage("Password must contain at least one special character"),
        body("confirm_password").custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error("Passwords do not match");
            }
            return true;
        }),
        body("address").notEmpty().withMessage("Address is required"),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // Send validation errors to user
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, phone, password, address } = req.body;
        const profileImage = req.file ? "/uploads/" + req.file.filename : null;

        try {
            const saltRounds = 10;
            const password_hash = await bcrypt.hash(password, saltRounds);

            await pool.query(
                `INSERT INTO users (name, email, phone, password_hash, address, profile_image) 
                 VALUES (?,?,?,?,?,?)`,
                [name, email, phone, password_hash, address, profileImage]
            );

            console.log("✅ User registered:", email);
            res.redirect("/login");
        } catch (err) {
            console.error("❌ Registration failed:", err);
            res.status(500).send("Something went wrong during registration.");
        }
    }
);


// --- LOGIN ROUTE ---
app.post("/login",
    [
        body("email").isEmail().withMessage("Invalid email address"),
        body("password").notEmpty().withMessage("Password is required"),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;
        try {
            const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);

            if (rows.length === 0) {
                return res.status(400).send("❌ User not found");
            }

            const user = rows[0];
            const match = await bcrypt.compare(password, user.password_hash);

            if (!match) {
                return res.status(401).send("❌ Invalid password");
            }

            req.session.user_id = user.user_id;
            console.log("✅ User logged in:", user.email);
            res.redirect("/user_profile");
        } catch (err) {
            console.error("❌ Login failed:", err);
            res.status(500).send("Something went wrong during login.");
        }
    }
);

const crypto = require("crypto");

io.on("connection", (socket) => {
    console.log("🔌 New client connected:", socket.id);

    socket.on("checkLogin", () => {
        const userSession = socket.request.session;

        if (userSession && userSession.user_id) {
            console.log("✅ User logged in:", userSession.user_id);
            // Do nothing → user stays on the page
        } else {
            console.log("❌ User not logged in");
            socket.emit("redirect", "/login");
        }
    });

    socket.on("disconnect", () => {
        console.log("❌ Client disconnected:", socket.id);
    });
});



app.use(bodyParser.json());

const MERCHANT_KEY = "96434309-7796-489d-8924-ab56988a6076"
const MERCHANT_ID = "PGTESTPAYUAT86"

const MERCHANT_BASE_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay"
const MERCHANT_STATUS_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status"

const redirectUrl = "http://localhost:3000/status"


const successUrl = "http://localhost:3000/success"
const failureUrl = "http://localhost:3000/failure"


app.post('/create-order', async (req, res) => {
    try {
        if (!req.session.user_id) {
            return res.status(401).json({ error: "User not logged in" });
        }

        // Fetch user details
        const [rows] = await pool.query("SELECT * FROM users WHERE user_id = ?", [req.session.user_id]);
        if (rows.length === 0) return res.status(404).json({ error: "User not found" });
        const user = rows[0];

        // ✅ Use total saved in session
        const amount = req.session.totalPrice ? req.session.totalPrice * 100 : 0; // paise
        if (amount <= 0) {
            return res.status(400).json({ error: "Invalid amount" });
        }

        const orderId = uuidv4(); // merchantTransactionId

        // ✅ Save merchantTransactionId to this booking
        if (req.session.bookingData) {
            await pool.query(
                "UPDATE bookings SET merchant_transaction_id = ? WHERE booking_id = ?",
                [orderId, req.session.bookingData.booking_id]
            );
        }

        const paymentPayload = {
            merchantId: MERCHANT_ID,
            merchantUserId: user.name,
            mobileNumber: user.phone,
            amount: amount,
            merchantTransactionId: orderId,
            redirectUrl: `${redirectUrl}?id=${orderId}`,
            redirectMode: 'GET',
            paymentInstrument: { type: 'PAY_PAGE' }
        };

        const payload = Buffer.from(JSON.stringify(paymentPayload)).toString('base64');
        const keyIndex = 1;
        const string = payload + '/pg/v1/pay' + MERCHANT_KEY;
        const sha256 = crypto.createHash('sha256').update(string).digest('hex');
        const checksum = sha256 + '###' + keyIndex;

        const option = {
            method: 'POST',
            url: MERCHANT_BASE_URL,
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                'X-VERIFY': checksum
            },
            data: { request: payload }
        };

        const response = await axios.request(option);
        return res.status(200).json({ url: response.data.data.instrumentResponse.redirectInfo.url });

    } catch (error) {
        console.error("error in payment", error);
        res.status(500).json({ error: 'Failed to initiate payment' });
    }
});


// ✅ Payment Status Handler Function
const handlePaymentStatus = async (req, res) => {
    const merchantTransactionId = req.query.id || req.body.transactionId || req.body.merchantTransactionId;

    if (!merchantTransactionId) {
        return res.status(400).send("Invalid status request");
    }

    const string = `/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}` + MERCHANT_KEY;
    const sha256 = crypto.createHash('sha256').update(string).digest('hex');
    const checksum = sha256 + '###' + 1;

    const option = {
        method: 'GET',
        url: `${MERCHANT_STATUS_URL}/${MERCHANT_ID}/${merchantTransactionId}`,
        headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
            'X-VERIFY': checksum,
            'X-MERCHANT-ID': MERCHANT_ID
        }
    };

    try {
        const response = await axios.request(option);
        console.log("📌 PhonePe status:", response.data);

        if (response.data.success && response.data.code === 'PAYMENT_SUCCESS') {
            // ✅ Update booking status
            await pool.query(
                "UPDATE bookings SET payment_status = 'paid' WHERE merchant_transaction_id = ?",
                [merchantTransactionId]
            );

            return res.redirect("/success");
        } else {
            // ❌ Payment failed or pending
            await pool.query(
                "UPDATE bookings SET payment_status = 'failed' WHERE merchant_transaction_id = ?",
                [merchantTransactionId]
            );

            return res.redirect("/failure");
        }
    } catch (err) {
        console.error("❌ Error checking payment status:", err);
        return res.redirect("/failure");
    }
};

// ✅ Payment Status Routes (both GET and POST)
app.get('/status', handlePaymentStatus);
app.post('/status', handlePaymentStatus);


app.post("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error("Session destruction error:", err);
            return res.status(500).send("Logout failed");
        }
        res.clearCookie("connect.sid"); // clear session cookie
        res.status(200).send("Logged out");
    });
});

// --- ADMIN LOGIN (hardcoded) ---
app.post("/admin_login", (req, res) => {
    const { email, password } = req.body;

    // ✅ Hardcoded credentials
    const ADMIN_EMAIL = "admin@gmail.com";
    const ADMIN_PASSWORD = "admin123"; // change this if needed

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        req.session.admin = true; // mark session as admin
        console.log("✅ Admin logged in:", email);
        return res.redirect("/profiles"); // redirect to admin dashboard
    } else {
        console.log("❌ Invalid admin login attempt:", email);
        return res.send(`<script>alert('Invalid credentials'); window.location.href='/admin_login';</script>`);
    }
});

app.post("/recommend_service", async (req, res) => {
    const { user_id, booking_id, service_ids } = req.body;

    if (!Array.isArray(service_ids)) {
        return res.redirect(`/profile/${user_id}`);
    }

    for (let service_id of service_ids) {
        await pool.query(
            "INSERT INTO recommendations (user_id,booking_id, service_id) VALUES (?,?, ?)",
            [user_id, booking_id, service_id]
        );
    }

    res.redirect(`/profile/${user_id}`);
});

// ✅ Admin updates booking status
app.post("/update_status/:id", async (req, res) => {
    try {
        const bookingId = req.params.id;
        const { status } = req.body;

        // Update DB
        await pool.query(
            "UPDATE bookings SET status = ? WHERE booking_id = ?",
            [status, bookingId]
        );

        // Broadcast update to all connected clients
        io.emit("statusUpdated", { bookingId, status });

        res.json({ success: true });
    } catch (err) {
        console.error("❌ Error updating booking status:", err);
        res.status(500).json({ success: false });
    }
});


// --- START SERVER ---
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));