-- 1. Create Database
CREATE DATABASE four_wheeler_service_center;
USE four_wheeler_service_center;

-- 2. Users Table
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    address TEXT,
    profile_image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Bookings Table
CREATE TABLE bookings (
    booking_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    car_name VARCHAR(100) NOT NULL,
    year YEAR NOT NULL,
    vehicle_number VARCHAR(20) NOT NULL,
    pickup_drop BOOLEAN DEFAULT FALSE,
    extra_notes TEXT,
    booking_number VARCHAR(50) UNIQUE NOT NULL,
    booking_date DATE DEFAULT CURRENT_DATE,
    payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
    status ENUM('pending','in-progress','completed','cancelled') DEFAULT 'pending',
    merchant_transaction_id VARCHAR(100) UNIQUE,
    media JSON,
    lat DECIMAL(10,6) NULL,
    lng DECIMAL(10,6) NULL,
    location_id INT NULL, 
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
-- 4. Services Table
CREATE TABLE services (
    service_id INT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT
);

-- Insert default services
INSERT INTO services (service_id, name, price, description) VALUES
(1, 'Battery Replacement', 1200.00, 'Replace old or faulty car battery with a new one'),
(2, 'Engine Repair', 3500.00, 'Full engine check-up and repair service'),
(3, 'Servicing', 800.00, 'General car servicing and inspection'),
(4, 'Washing', 200.00, 'Exterior and interior car wash'),
(5, 'Tyre Replacement', 4000.00, 'Replace old or damaged tyres with new ones'),
(6, 'Modification', 2500.00, 'Custom modifications and tuning for your vehicle');

-- 5. Recommendations Table (linked to bookings now)
CREATE TABLE recommendations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    booking_id INT NOT NULL,
    service_id INT NOT NULL,
    recommended_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(service_id) ON DELETE CASCADE
);

-- ===========================================================
-- LOCATIONS TABLE
-- ===========================================================
CREATE TABLE IF NOT EXISTS locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    city VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    lat DECIMAL(10,6) NOT NULL,
    lng DECIMAL(10,6) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================================
-- MUMBAI
-- ===========================================================
INSERT INTO locations (city, name, lat, lng) VALUES
('Mumbai', 'Gateway of India', 18.922, 72.834),
('Mumbai', 'Marine Drive', 18.944, 72.823),
('Mumbai', 'Chhatrapati Shivaji Terminus', 18.9402, 72.8356),
('Mumbai', 'Siddhivinayak Temple', 19.0169, 72.8305),
('Mumbai', 'Haji Ali Dargah', 18.9823, 72.8089),
('Mumbai', 'Juhu Beach', 19.0988, 72.8265),
('Mumbai', 'Bandra-Worli Sea Link', 19.0176, 72.8170),
('Mumbai', 'Elephanta Caves', 18.9633, 72.9311),
('Mumbai', 'Powai Lake', 19.1162, 72.9055),
('Mumbai', 'Colaba Causeway', 18.9229, 72.8321);

-- ===========================================================
-- PUNE
-- ===========================================================
INSERT INTO locations (city, name, lat, lng) VALUES
('Pune', 'Shaniwar Wada', 18.5195, 73.8553),
('Pune', 'Aga Khan Palace', 18.5523, 73.9036),
('Pune', 'Sinhagad Fort', 18.3663, 73.7559),
('Pune', 'Pataleshwar Temple', 18.5286, 73.8471),
('Pune', 'Dagadusheth Ganapati Temple', 18.5186, 73.8553),
('Pune', 'Rajiv Gandhi Zoological Park', 18.4485, 73.8733),
('Pune', 'Osho Ashram', 18.5362, 73.8930),
('Pune', 'Khadakwasla Dam', 18.4441, 73.7898),
('Pune', 'National Defence Academy', 18.4906, 73.7813),
('Pune', 'Parvati Hill', 18.5013, 73.8521);

-- ===========================================================
-- NAGPUR
-- ===========================================================
INSERT INTO locations (city, name, lat, lng) VALUES
('Nagpur', 'Deekshabhoomi', 21.1295, 79.0610),
('Nagpur', 'Futala Lake', 21.1570, 79.0506),
('Nagpur', 'Ambazari Lake', 21.1455, 79.0581),
('Nagpur', 'Sitabuldi Fort', 21.1480, 79.0842),
('Nagpur', 'Raman Science Centre', 21.1463, 79.0996),
('Nagpur', 'Dragon Palace Temple', 21.1391, 79.1683),
('Nagpur', 'Kasturchand Park', 21.1551, 79.0861),
('Nagpur', 'Maharajbagh Zoo', 21.1452, 79.0824),
('Nagpur', 'Ambazari Garden', 21.1502, 79.0703),
('Nagpur', 'Gorewada Lake', 21.1925, 79.0638);

-- ===========================================================
-- NASHIK
-- ===========================================================
INSERT INTO locations (city, name, lat, lng) VALUES
('Nashik', 'Sula Vineyards', 20.0117, 73.7247),
('Nashik', 'Trimbakeshwar Temple', 19.9334, 73.5291),
('Nashik', 'Pandavleni Caves', 19.9440, 73.7560),
('Nashik', 'Someshwar Waterfall', 20.0050, 73.7330),
('Nashik', 'Muktidham Temple', 19.9640, 73.7760),
('Nashik', 'Kalaram Temple', 19.9974, 73.7860),
('Nashik', 'Ramkund', 20.0066, 73.7926),
('Nashik', 'Saptashrungi Devi Temple', 20.4090, 73.9167),
('Nashik', 'Gangapur Dam', 20.0070, 73.7280),
('Nashik', 'Anjneri Hill', 19.9425, 73.6190);

-- ===========================================================
-- AURANGABAD
-- ===========================================================
INSERT INTO locations (city, name, lat, lng) VALUES
('Aurangabad', 'Ajanta Caves', 20.5519, 75.7033),
('Aurangabad', 'Ellora Caves', 20.0268, 75.1798),
('Aurangabad', 'Bibi Ka Maqbara', 19.9012, 75.3187),
('Aurangabad', 'Daulatabad Fort', 19.9429, 75.2257),
('Aurangabad', 'Aurangabad Caves', 19.9016, 75.3025),
('Aurangabad', 'Grishneshwar Temple', 20.0260, 75.1792),
('Aurangabad', 'Salim Ali Lake', 19.9180, 75.3462),
('Aurangabad', 'Siddharth Garden', 19.8903, 75.3395),
('Aurangabad', 'Panchakki', 19.8825, 75.3307),
('Aurangabad', 'Himayat Bagh', 19.8856, 75.3337);

-- ===========================================================
-- THANE
-- ===========================================================
INSERT INTO locations (city, name, lat, lng) VALUES
('Thane', 'Upvan Lake', 19.2306, 72.9722),
('Thane', 'Yeoor Hills', 19.2490, 72.9633),
('Thane', 'Talao Pali Lake', 19.1928, 72.9721),
('Thane', 'Kachrali Lake', 19.1940, 72.9720),
('Thane', 'Suraj Water Park', 19.2707, 72.9761),
('Thane', 'Viviana Mall', 19.2181, 72.9720),
('Thane', 'Korum Mall', 19.2091, 72.9722),
('Thane', 'Kelva Beach', 19.6430, 72.7525),
('Thane', 'Ghodbunder Fort', 19.2910, 72.8820),
('Thane', 'Masunda Lake', 19.1861, 72.9756);

-- ===========================================================
-- NAVI MUMBAI
-- ===========================================================
INSERT INTO locations (city, name, lat, lng) VALUES
('Navi Mumbai', 'Kharghar Hills', 19.0330, 73.0650),
('Navi Mumbai', 'Pandavkada Waterfalls', 19.0220, 73.0800),
('Navi Mumbai', 'Wonder Park Nerul', 19.0250, 73.0300),
('Navi Mumbai', 'DY Patil Stadium', 19.0330, 73.0300),
('Navi Mumbai', 'Seawoods Grand Central Mall', 19.0160, 73.0290),
('Navi Mumbai', 'Nerul Balaji Temple', 19.0260, 73.0305),
('Navi Mumbai', 'Rock Garden Nerul', 19.0255, 73.0302),
('Navi Mumbai', 'Palm Beach Road', 19.0270, 73.0330),
('Navi Mumbai', 'ISKCON Temple Kharghar', 19.0333, 73.0653),
('Navi Mumbai', 'Belapur Fort', 19.0160, 73.0275);

-- ===========================================================
-- KOLHAPUR
-- ===========================================================
INSERT INTO locations (city, name, lat, lng) VALUES
('Kolhapur', 'Mahalaxmi Temple', 16.6956, 74.2433),
('Kolhapur', 'Panhala Fort', 16.8100, 74.1100),
('Kolhapur', 'Rankala Lake', 16.6955, 74.2222),
('Kolhapur', 'Jyotiba Temple', 16.8270, 74.1700),
('Kolhapur', 'New Palace Museum', 16.7040, 74.2435),
('Kolhapur', 'Bhavani Mandap', 16.7045, 74.2437),
('Kolhapur', 'Chandrakant Mandhare Garden', 16.7032, 74.2400),
('Kolhapur', 'Radhanagari Dam', 16.3660, 73.9970),
('Kolhapur', 'Kopeshwar Temple', 16.7000, 74.2220),
('Kolhapur', 'Sagareshwar Wildlife Sanctuary', 16.8630, 74.5400);

-- ===========================================================
-- SOLAPUR
-- ===========================================================
INSERT INTO locations (city, name, lat, lng) VALUES
('Solapur', 'Siddheshwar Temple', 17.6599, 75.9064),
('Solapur', 'Bhuikot Fort', 17.6592, 75.9060),
('Solapur', 'Great Indian Bustard Sanctuary', 17.6330, 75.9000),
('Solapur', 'Hutatma Garden', 17.6570, 75.9070),
('Solapur', 'Hipparga Lake', 17.6400, 75.9200),
('Solapur', 'Kambar Talav', 17.6500, 75.9150),
('Solapur', 'Siddheshwar Lake', 17.6595, 75.9065),
('Solapur', 'Rukmini Temple', 17.6610, 75.9100),
('Solapur', 'Akkalkot Swami Samarth Mandir', 17.5250, 76.2000),
('Solapur', 'Khandoba Temple', 17.6780, 75.9180);

-- ===========================================================
-- AMRAVATI
-- ===========================================================
INSERT INTO locations (city, name, lat, lng) VALUES
('Amravati', 'Ambadevi Temple', 20.9333, 77.7500),
('Amravati', 'Chatri Talao', 20.9350, 77.7600),
('Amravati', 'Satidham Temple', 20.9335, 77.7550),
('Amravati', 'Wadali Talao', 20.9400, 77.7600),
('Amravati', 'Melghat Tiger Reserve', 21.3750, 77.3330),
('Amravati', 'Chikhaldara Hill Station', 21.4200, 77.3100),
('Amravati', 'Gugarnal National Park', 21.4100, 77.3200),
('Amravati', 'Horseshoe Lake', 21.4000, 77.3350),
('Amravati', 'Shri Ambadevi Mandir', 20.9340, 77.7520),
('Amravati', 'Hanuman Vyayam Shala', 20.9300, 77.7500);

-- ===========================================================
-- JALGAON
-- ===========================================================
INSERT INTO locations (city, name, lat, lng) VALUES
('Jalgaon', 'Ajanta Caves', 20.5519, 75.7033),
('Jalgaon', 'Omkareshwar Temple', 21.0100, 75.5600),
('Jalgaon', 'Mehrun Lake', 21.0120, 75.5630),
('Jalgaon', 'Patna Devi Temple', 20.7000, 75.8000),
('Jalgaon', 'Swinging Towers Farkande', 21.0500, 75.5500),
('Jalgaon', 'Pal Hill Station', 21.0200, 75.5800),
('Jalgaon', 'Gandhi Research Foundation', 21.0170, 75.5600),
('Jalgaon', 'Shivtirth', 21.0400, 75.5700),
('Jalgaon', 'Shendurni Jain Temple', 20.8800, 75.5900),
('Jalgaon', 'Ecchapurti Ganesh Mandir', 21.0000, 75.5500);

-- ===========================================================
-- LATUR
-- ===========================================================
INSERT INTO locations (city, name, lat, lng) VALUES
('Latur', 'Udgir Fort', 18.3920, 77.1200),
('Latur', 'Kharosa Caves', 18.3900, 77.1800),
('Latur', 'Ganj Golai', 18.4000, 76.5700),
('Latur', 'Ashtavinayak Temple', 18.4200, 76.5800),
('Latur', 'Nilanga Fort', 18.3200, 76.7500),
('Latur', 'Hattibet-Devarjan', 18.3000, 76.7000),
('Latur', 'Saudagar Lake', 18.4100, 76.5800),
('Latur', 'Shivaji Chowk', 18.4100, 76.6000),
('Latur', 'Ambajogai Temple', 18.3500, 76.8500),
('Latur', 'Kasarsirsi Temple', 18.3400, 76.8300);

-- ===========================================================
-- SANGLI
-- ===========================================================
INSERT INTO locations (city, name, lat, lng) VALUES
('Sangli', 'Ganapati Temple', 16.8520, 74.5640),
('Sangli', 'Sagareshwar Sanctuary', 16.8630, 74.5400),
('Sangli', 'Dandoba Hill Forest', 16.8500, 74.5500),
('Sangli', 'Audumber Datta Temple', 16.8700, 74.5500),
('Sangli', 'Haripur', 16.8600, 74.5700),
('Sangli', 'Sangameshwar Temple', 16.8600, 74.5600),
('Sangli', 'Dandoba Hill', 16.8550, 74.5550),
('Sangli', 'Rajwada Palace', 16.8525, 74.5650),
('Sangli', 'Datta Mandir', 16.8530, 74.5680),
('Sangli', 'Kupwad Wildlife', 16.8600, 74.5900);

-- ===========================================================
-- SATARA
-- ===========================================================
INSERT INTO locations (city, name, lat, lng) VALUES
('Satara', 'Kaas Plateau', 17.7090, 73.8150),
('Satara', 'Ajinkyatara Fort', 17.6900, 73.9800),
('Satara', 'Thoseghar Waterfall', 17.6300, 73.8400),
('Satara', 'Sajjangad Fort', 17.6500, 73.9400),
('Satara', 'Koyna Dam', 17.6400, 73.7500),
('Satara', 'Bamnoli Lake', 17.6800, 73.8000),
('Satara', 'Natraj Mandir', 17.7000, 73.9900),
('Satara', 'Chalkewadi Windmill Farm', 17.6200, 73.9100),
('Satara', 'Shivsagar Lake', 17.6500, 73.7500),
('Satara', 'Kanher Dam', 17.7200, 73.8900);

-- ===========================================================
-- RATNAGIRI
-- ===========================================================
INSERT INTO locations (city, name, lat, lng) VALUES
('Ratnagiri', 'Ganpatipule Beach', 17.1500, 73.2700),
('Ratnagiri', 'Jaigad Fort', 17.3000, 73.2000),
('Ratnagiri', 'Thibaw Palace', 16.9900, 73.3100),
('Ratnagiri', 'Ratnadurg Fort', 16.9900, 73.3100),
('Ratnagiri', 'Ganpatipule Temple', 17.1500, 73.2700),
('Ratnagiri', 'Pawas Village', 16.9800, 73.2800),
('Ratnagiri', 'Tilak Ali Museum', 16.9900, 73.3200),
('Ratnagiri', 'Bhatye Beach', 16.9800, 73.3100),
('Ratnagiri', 'Mandavi Beach', 16.9900, 73.3000),
('Ratnagiri', 'Jaigad Lighthouse', 17.3100, 73.2100);

-- ===========================================================
-- NANDED
-- ===========================================================
INSERT INTO locations (city, name, lat, lng) VALUES
('Nanded', 'Hazur Sahib Gurudwara', 19.1380, 77.3200),
('Nanded', 'Nanded Fort', 19.1500, 77.3200),
('Nanded', 'Sahastrakund Waterfall', 19.2500, 77.3000),
('Nanded', 'Kandhar Fort', 19.2500, 77.3300),
('Nanded', 'Mahurgad Fort', 19.3500, 77.3500),
('Nanded', 'Isapur Dam', 19.1400, 77.3500),
('Nanded', 'Visawa Garden', 19.1450, 77.3300),
('Nanded', 'Siddheshwar Temple', 19.1600, 77.3400),
('Nanded', 'Sahastrakund Dam', 19.2550, 77.3050),
('Nanded', 'Mahatma Gandhi Park', 19.1500, 77.3250);

-- ===========================================================
-- AKOLA
-- ===========================================================
INSERT INTO locations (city, name, lat, lng) VALUES
('Akola', 'Narnala Fort', 21.2550, 77.0100),
('Akola', 'Raj Rajeshwar Temple', 20.7300, 77.0100),
('Akola', 'Shegaon Temple', 20.7900, 76.6900),
('Akola', 'Balapur Fort', 20.6600, 76.7800),
('Akola', 'Akola Fort', 20.7200, 77.0100),
('Akola', 'Rani Lakshmi Bai Garden', 20.7300, 77.0200),
('Akola', 'Asadgad Fort', 20.7100, 77.0300),
('Akola', 'Katepurna Sanctuary', 20.5700, 76.9500),
('Akola', 'Nepti Lake', 20.7200, 77.0000),
('Akola', 'Gajanan Maharaj Temple', 20.7900, 76.6900);

-- ===========================================================
-- AHMEDNAGAR
-- ===========================================================
INSERT INTO locations (city, name, lat, lng) VALUES
('Ahmednagar', 'Ahmednagar Fort', 19.1000, 74.7300),
('Ahmednagar', 'Meherabad', 19.0800, 74.7300),
('Ahmednagar', 'Shani Shingnapur Temple', 19.6000, 74.7700),
('Ahmednagar', 'Bhandardara Dam', 19.5500, 73.7500),
('Ahmednagar', 'Rehekuri Sanctuary', 19.4000, 74.6800),
('Ahmednagar', 'Tank Museum', 19.0900, 74.7300),
('Ahmednagar', 'Cavalry Tank Museum', 19.0950, 74.7350),
('Ahmednagar', 'Ralegan Siddhi', 19.4100, 74.7700),
('Ahmednagar', 'Kalsubai Peak', 19.6100, 73.7100),
('Ahmednagar', 'Shirdi Sai Baba Temple', 19.7700, 74.4800);

-- ===========================================================
-- PALGHAR
-- ===========================================================
INSERT INTO locations (city, name, lat, lng) VALUES
('Palghar', 'Kelva Beach', 19.6500, 72.7500),
('Palghar', 'Mahim Beach', 19.6500, 72.7800),
('Palghar', 'Shirgaon Fort', 19.6900, 72.7500),
('Palghar', 'Satpati Beach', 19.7400, 72.6800),
('Palghar', 'Vajreshwari Temple', 19.5000, 73.0000),
('Palghar', 'Tungareshwar Sanctuary', 19.4500, 72.9500),
('Palghar', 'Kelve Fort', 19.6600, 72.7400),
('Palghar', 'Bordi Beach', 20.0600, 72.7500),
('Palghar', 'Arnala Fort', 19.4500, 72.7400),
('Palghar', 'Chinchoti Waterfalls', 19.4500, 72.9000);

-- ===========================================================
-- GONDIA
-- ===========================================================
INSERT INTO locations (city, name, lat, lng) VALUES
('Gondia', 'Nagzira Wildlife Sanctuary', 21.2500, 80.0000),
('Gondia', 'Itiadoh Dam', 21.2000, 80.0500),
('Gondia', 'Hazara Falls', 21.2500, 80.0600),
('Gondia', 'Nagra Fort', 21.2500, 80.0200),
('Gondia', 'Chulbandh Dam', 21.1800, 80.0700),
('Gondia', 'Kachargarh Caves', 21.2500, 80.0300),
('Gondia', 'Pratapgad Fort', 21.2100, 80.0400),
('Gondia', 'Amgaon Lake', 21.2200, 80.0500),
('Gondia', 'Nawegaon Bandh National Park', 20.9700, 80.1200),
('Gondia', 'Salekasa Caves', 21.1900, 80.0800);
