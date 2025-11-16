-- ==========================================
-- SCHEMA: hermes_db
-- ==========================================

CREATE DATABASE IF NOT EXISTS hermes_db
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE hermes_db;

-- ============================
-- 1. USUARIOS
-- ============================

CREATE TABLE users (
  user_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (user_id),
  UNIQUE KEY ux_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE user_preferences (
  user_id INT UNSIGNED NOT NULL,
  preferred_language CHAR(5) DEFAULT NULL,
  preferred_currency CHAR(3) DEFAULT NULL,
  budget_level ENUM('low','medium','high') DEFAULT NULL,
  travel_style ENUM('relaxed','adventure','cultural','mixed') DEFAULT NULL,
  PRIMARY KEY (user_id),
  CONSTRAINT fk_user_preferences_user
    FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================
-- 2. GEOGRAFÍA
-- ============================

CREATE TABLE countries (
  country_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  iso_code CHAR(2) NOT NULL,
  PRIMARY KEY (country_id),
  UNIQUE KEY ux_countries_iso (iso_code),
  UNIQUE KEY ux_countries_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE cities (
  city_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  country_id INT UNSIGNED NOT NULL,
  name VARCHAR(100) NOT NULL,
  region VARCHAR(100) DEFAULT NULL,
  latitude DECIMAL(9,6) DEFAULT NULL,
  longitude DECIMAL(9,6) DEFAULT NULL,
  PRIMARY KEY (city_id),
  KEY idx_cities_country (country_id),
  CONSTRAINT fk_cities_country
    FOREIGN KEY (country_id) REFERENCES countries(country_id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================
-- 3. LUGARES Y CATEGORÍAS
-- ============================

CREATE TABLE place_categories (
  place_category_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  description VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (place_category_id),
  UNIQUE KEY ux_place_categories_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE places (
  place_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  city_id INT UNSIGNED NOT NULL,
  place_category_id INT UNSIGNED NOT NULL,
  name VARCHAR(150) NOT NULL,
  description TEXT DEFAULT NULL,
  address VARCHAR(255) DEFAULT NULL,
  latitude DECIMAL(9,6) DEFAULT NULL,
  longitude DECIMAL(9,6) DEFAULT NULL,
  average_rating DECIMAL(2,1) DEFAULT NULL,
  price_level TINYINT UNSIGNED DEFAULT NULL, -- 1 = barato, 5 = muy caro
  website VARCHAR(255) DEFAULT NULL,
  phone VARCHAR(50) DEFAULT NULL,
  is_recommended TINYINT(1) NOT NULL DEFAULT 0, -- 1 = recomendado
  PRIMARY KEY (place_id),
  KEY idx_places_city (city_id),
  KEY idx_places_category (place_category_id),
  CONSTRAINT fk_places_city
    FOREIGN KEY (city_id) REFERENCES cities(city_id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT fk_places_category
    FOREIGN KEY (place_category_id) REFERENCES place_categories(place_category_id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE tags (
  tag_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  PRIMARY KEY (tag_id),
  UNIQUE KEY ux_tags_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE place_tags (
  place_id INT UNSIGNED NOT NULL,
  tag_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (place_id, tag_id),
  KEY idx_place_tags_tag (tag_id),
  CONSTRAINT fk_place_tags_place
    FOREIGN KEY (place_id) REFERENCES places(place_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_place_tags_tag
    FOREIGN KEY (tag_id) REFERENCES tags(tag_id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================
-- 4. TRANSPORTE
-- ============================

CREATE TABLE transport_modes (
  mode_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  PRIMARY KEY (mode_id),
  UNIQUE KEY ux_transport_modes_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE routes (
  route_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  origin_city_id INT UNSIGNED NOT NULL,
  destination_city_id INT UNSIGNED NOT NULL,
  mode_id INT UNSIGNED NOT NULL,
  name VARCHAR(150) DEFAULT NULL,
  distance_km DECIMAL(7,2) DEFAULT NULL,
  average_duration_min INT DEFAULT NULL,
  average_price DECIMAL(10,2) DEFAULT NULL,
  PRIMARY KEY (route_id),
  KEY idx_routes_origin (origin_city_id),
  KEY idx_routes_destination (destination_city_id),
  KEY idx_routes_mode (mode_id),
  CONSTRAINT fk_routes_origin_city
    FOREIGN KEY (origin_city_id) REFERENCES cities(city_id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT fk_routes_destination_city
    FOREIGN KEY (destination_city_id) REFERENCES cities(city_id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT fk_routes_mode
    FOREIGN KEY (mode_id) REFERENCES transport_modes(mode_id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================
-- 5. VIAJES (PLANES / ITINERARIOS)
-- ============================

CREATE TABLE trips (
  trip_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT DEFAULT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_budget DECIMAL(10,2) DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (trip_id),
  KEY idx_trips_user (user_id),
  CONSTRAINT fk_trips_user
    FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE trip_days (
  trip_day_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  trip_id INT UNSIGNED NOT NULL,
  date DATE NOT NULL,
  day_index INT NOT NULL,
  PRIMARY KEY (trip_day_id),
  UNIQUE KEY ux_trip_days_trip_date (trip_id, date),
  UNIQUE KEY ux_trip_days_trip_day_index (trip_id, day_index),
  KEY idx_trip_days_trip (trip_id),
  CONSTRAINT fk_trip_days_trip
    FOREIGN KEY (trip_id) REFERENCES trips(trip_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE trip_activities (
  activity_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  trip_day_id INT UNSIGNED NOT NULL,
  place_id INT UNSIGNED DEFAULT NULL,
  route_id INT UNSIGNED DEFAULT NULL,
  activity_type ENUM('visit','meal','transport','checkin','checkout','other') NOT NULL,
  start_time TIME DEFAULT NULL,
  end_time TIME DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  estimated_cost DECIMAL(10,2) DEFAULT NULL,
  PRIMARY KEY (activity_id),
  KEY idx_trip_activities_day (trip_day_id),
  KEY idx_trip_activities_place (place_id),
  KEY idx_trip_activities_route (route_id),
  CONSTRAINT fk_trip_activities_trip_day
    FOREIGN KEY (trip_day_id) REFERENCES trip_days(trip_day_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_trip_activities_place
    FOREIGN KEY (place_id) REFERENCES places(place_id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT fk_trip_activities_route
    FOREIGN KEY (route_id) REFERENCES routes(route_id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================
-- 6. VISTAS DE RECOMENDADOS (OPCIONAL, ÚTIL PARA IA)
-- ============================

CREATE OR REPLACE VIEW view_recommended_restaurants AS
SELECT
  p.*,
  c.name AS city_name,
  co.name AS country_name
FROM places p
JOIN cities c ON p.city_id = c.city_id
JOIN countries co ON c.country_id = co.country_id
JOIN place_categories pc ON p.place_category_id = pc.place_category_id
WHERE pc.name = 'Restaurant'
  AND p.is_recommended = 1;

CREATE OR REPLACE VIEW view_recommended_lodgings AS
SELECT
  p.*,
  c.name AS city_name,
  co.name AS country_name
FROM places p
JOIN cities c ON p.city_id = c.city_id
JOIN countries co ON c.country_id = co.country_id
JOIN place_categories pc ON p.place_category_id = pc.place_category_id
WHERE pc.name IN ('Hotel','Hostel','Apartment')
  AND p.is_recommended = 1;
