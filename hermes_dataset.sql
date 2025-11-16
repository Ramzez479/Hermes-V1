-- hermes_dataset_supabase.sql
set search_path = public;

-- Vaciar tablas en orden correcto y reiniciar IDs
TRUNCATE TABLE trip_activities,
               trip_days,
               trips,
               routes,
               transport_modes,
               place_tags,
               tags,
               places,
               place_categories,
               cities,
               countries
RESTART IDENTITY CASCADE;

-- ============================
-- PAISES
-- ============================

INSERT INTO countries (country_id, name, iso_code) VALUES
(1, 'México', 'MX'),
(2, 'Francia', 'FR'),
(3, 'Italia', 'IT'),
(4, 'España', 'ES'),
(5, 'Alemania', 'DE'),
(6, 'Japón', 'JP'),
(7, 'Estados Unidos', 'US');

-- ============================
-- CIUDADES
-- ============================

INSERT INTO cities (city_id, country_id, name, region, latitude, longitude) VALUES
-- México
(1, 1, 'Ciudad de México', 'CDMX', 19.432608, -99.133209),
(2, 1, 'Guadalajara', 'Jalisco', 20.659699, -103.349609),
(3, 1, 'Cancún', 'Quintana Roo', 21.161908, -86.851528),

-- Francia
(4, 2, 'París', 'Île-de-France', 48.856613, 2.352222),
(5, 2, 'Lyon', 'Auvergne-Rhône-Alpes', 45.764043, 4.835659),
(6, 2, 'Niza', 'Provenza-Alpes-Costa Azul', 43.710173, 7.261953),

-- Italia
(7, 3, 'Roma', 'Lacio', 41.902782, 12.496366),
(8, 3, 'Florencia', 'Toscana', 43.769562, 11.255814),
(9, 3, 'Venecia', 'Véneto', 45.440847, 12.315515),

-- España
(10, 4, 'Madrid', 'Comunidad de Madrid', 40.416775, -3.703790),
(11, 4, 'Barcelona', 'Cataluña', 41.385064, 2.173404),
(12, 4, 'Sevilla', 'Andalucía', 37.389092, -5.984459),

-- Alemania
(13, 5, 'Berlín', 'Berlín', 52.520008, 13.404954),
(14, 5, 'Múnich', 'Baviera', 48.135125, 11.581981),
(15, 5, 'Hamburgo', 'Hamburgo', 53.551086, 9.993682),

-- Japón
(16, 6, 'Tokio', 'Tokio', 35.689487, 139.691711),
(17, 6, 'Kioto', 'Kioto', 35.011636, 135.768029),
(18, 6, 'Osaka', 'Osaka', 34.693738, 135.502165),

-- Estados Unidos
(19, 7, 'Nueva York', 'New York', 40.712776, -74.005974),
(20, 7, 'Los Ángeles', 'California', 34.052235, -118.243683),
(21, 7, 'San Francisco', 'California', 37.774929, -122.419418);

-- ============================
-- CATEGORÍAS DE LUGAR
-- ============================

INSERT INTO place_categories (place_category_id, name, description) VALUES
(1, 'Attraction', 'Puntos de interés y atracciones turísticas'),
(2, 'Museum', 'Museos y galerías de arte'),
(3, 'Park', 'Parques y áreas verdes'),
(4, 'Restaurant', 'Restaurantes para comer'),
(5, 'Café', 'Cafeterías y coffee shops'),
(6, 'Bar', 'Bares y vida nocturna'),
(7, 'Hotel', 'Hoteles y resorts'),
(8, 'Hostel', 'Hostales económicos'),
(9, 'Apartment', 'Departamentos turísticos'),
(10, 'Landmark', 'Sitios emblemáticos y monumentos');

-- ============================
-- TAGS (ETIQUETAS)
-- ============================

INSERT INTO tags (tag_id, name) VALUES
(1, 'romantic'),
(2, 'family-friendly'),
(3, 'nightlife'),
(4, 'budget'),
(5, 'luxury'),
(6, 'cultural'),
(7, 'outdoors'),
(8, 'foodie'),
(9, 'historic'),
(10, 'beach');

-- ============================
-- MODOS DE TRANSPORTE
-- ============================

INSERT INTO transport_modes (mode_id, name) VALUES
(1, 'Plane'),
(2, 'Train'),
(3, 'Bus'),
(4, 'Metro'),
(5, 'Ferry');

-- ============================
-- LUGARES (ATRACCIONES, RESTAURANTES, HOSPEDAJES)
-- ============================

INSERT INTO places
(place_id, city_id, place_category_id, name, description, address,
 latitude, longitude, average_rating, price_level, website, phone, is_recommended)
VALUES
-- Ciudad de México
(1, 1, 2, 'Museo Nacional de Antropología',
 'Uno de los museos más importantes del mundo sobre culturas prehispánicas.',
 'Av. Paseo de la Reforma s/n, Chapultepec Polanco',
 19.426000, -99.186000, 4.8, 3, NULL, NULL, TRUE),
(2, 1, 3, 'Bosque de Chapultepec',
 'Gran parque urbano con lagos, museos y áreas verdes.',
 'Miguel Hidalgo, CDMX',
 19.420000, -99.191000, 4.7, 1, NULL, NULL, TRUE),
(3, 1, 4, 'Pujol',
 'Restaurante de alta cocina mexicana contemporánea.',
 'Tennyson 133, Polanco',
 19.432500, -99.194000, 4.9, 5, NULL, NULL, TRUE),
(4, 1, 7, 'Hotel Reforma Centro',
 'Hotel cómodo cerca de Paseo de la Reforma, ideal para turistas.',
 'Paseo de la Reforma 50, Centro',
 19.432800, -99.150000, 4.3, 3, NULL, NULL, TRUE),

-- Guadalajara
(5, 2, 10, 'Catedral de Guadalajara',
 'Icono histórico y religioso de la ciudad.',
 'Av. Fray Antonio Alcalde, Centro',
 20.676000, -103.348000, 4.7, 1, NULL, NULL, TRUE),
(6, 2, 4, 'La Chata',
 'Restaurante tradicional de comida tapatía.',
 'Av. Corona 126, Centro',
 20.673000, -103.347000, 4.5, 2, NULL, NULL, TRUE),
(7, 2, 7, 'Hotel Tapatío Urbano',
 'Hotel céntrico ideal para explorar Guadalajara.',
 'Centro Histórico',
 20.670000, -103.350000, 4.2, 2, NULL, NULL, FALSE),

-- Cancún
(8, 3, 3, 'Playa Delfines',
 'Playa pública con arena blanca y mirador panorámico.',
 'Zona Hotelera, Km 18',
 21.086000, -86.777000, 4.8, 1, NULL, NULL, TRUE),
(9, 3, 7, 'Resort Mar Caribe',
 'Resort todo incluido frente al mar Caribe.',
 'Blvd. Kukulcán Km 15',
 21.080000, -86.770000, 4.6, 5, NULL, NULL, TRUE),
(10, 3, 4, 'El Pozole de la Abuela',
 'Restaurante casero de comida mexicana económica.',
 'Centro de Cancún',
 21.160500, -86.845000, 4.3, 1, NULL, NULL, FALSE),

-- París
(11, 4, 10, 'Torre Eiffel',
 'Icono de París y uno de los monumentos más visitados del mundo.',
 'Champ de Mars, 5 Av. Anatole France',
 48.858370, 2.294481, 4.7, 3, NULL, NULL, TRUE),
(12, 4, 2, 'Museo del Louvre',
 'Museo de arte más grande del mundo, hogar de la Mona Lisa.',
 'Rue de Rivoli',
 48.860611, 2.337644, 4.8, 3, NULL, NULL, TRUE),
(13, 4, 4, 'Le Jules Verne',
 'Restaurante gourmet dentro de la Torre Eiffel.',
 'Torre Eiffel, 2do piso',
 48.858000, 2.294000, 4.6, 5, NULL, NULL, TRUE),
(14, 4, 7, 'Hotel Lumière Rivoli',
 'Hotel boutique cerca del Louvre y el río Sena.',
 'Rue de Rivoli 210',
 48.861000, 2.340000, 4.5, 4, NULL, NULL, TRUE),

-- Lyon
(15, 5, 4, 'Bouchon Lyonnais Tradicional',
 'Restaurante típico con gastronomía lionesa.',
 'Vieux Lyon',
 45.763000, 4.827000, 4.4, 3, NULL, NULL, FALSE),
(16, 5, 7, 'Hotel Rhône Panorama',
 'Hotel con vista al río Rhône, ideal para parejas.',
 'Quai du Rhône',
 45.764500, 4.835000, 4.3, 3, NULL, NULL, FALSE),

-- Roma
(17, 7, 10, 'Coliseo Romano',
 'Anfiteatro icónico de la antigua Roma.',
 'Piazza del Colosseo, 1',
 41.890210, 12.492231, 4.8, 3, NULL, NULL, TRUE),
(18, 7, 2, 'Museos Vaticanos',
 'Complejo de museos con obras maestras del arte renacentista.',
 'Viale Vaticano',
 41.906500, 12.453600, 4.7, 3, NULL, NULL, TRUE),
(19, 7, 4, 'Trattoria La Nonna',
 'Trattoria italiana acogedora con pasta casera.',
 'Trastevere',
 41.889000, 12.470000, 4.5, 2, NULL, NULL, TRUE),
(20, 7, 7, 'Hotel Roma Centro Histórico',
 'Hotel clásico a poca distancia del Coliseo.',
 'Centro Storico',
 41.895000, 12.485000, 4.4, 3, NULL, NULL, TRUE),

-- Venecia
(21, 9, 10, 'Plaza de San Marcos',
 'La plaza principal de Venecia, rodeada de edificios históricos.',
 'Piazza San Marco',
 45.434000, 12.338000, 4.7, 2, NULL, NULL, TRUE),
(22, 9, 7, 'Hotel Canal Grande',
 'Hotel con vista a los canales, ideal para viaje romántico.',
 'Canal Grande',
 45.438000, 12.335000, 4.6, 4, NULL, NULL, TRUE),

-- Madrid
(23, 10, 3, 'Parque del Retiro',
 'Famoso parque de Madrid con lago y áreas verdes.',
 'Plaza de la Independencia',
 40.415000, -3.683000, 4.8, 1, NULL, NULL, TRUE),
(24, 10, 2, 'Museo del Prado',
 'Importante museo de arte europeo.',
 'C. de Ruiz de Alarcón 23',
 40.413800, -3.692100, 4.7, 3, NULL, NULL, TRUE),
(25, 10, 4, 'Restaurante Tapas Sol',
 'Restaurante de tapas españolas cerca de la Puerta del Sol.',
 'Centro Histórico',
 40.417000, -3.703000, 4.4, 2, NULL, NULL, FALSE),
(26, 10, 7, 'Hotel Gran Vía Central',
 'Hotel moderno en la Gran Vía de Madrid.',
 'Gran Vía 45',
 40.420000, -3.703500, 4.5, 4, NULL, NULL, TRUE),

-- Barcelona
(27, 11, 10, 'Sagrada Familia',
 'Basílica icónica diseñada por Gaudí.',
 'C/ de Mallorca, 401',
 41.403629, 2.174356, 4.8, 3, NULL, NULL, TRUE),
(28, 11, 3, 'Parque Güell',
 'Parque público con obras de Gaudí y vistas de la ciudad.',
 'Carrer d''Olot 5',
 41.414494, 2.152694, 4.7, 2, NULL, NULL, TRUE),
(29, 11, 7, 'Hotel Rambla Mar',
 'Hotel cerca de Las Ramblas y el puerto.',
 'La Rambla',
 41.380000, 2.175000, 4.3, 3, NULL, NULL, FALSE),

-- Berlín
(30, 13, 10, 'Puerta de Brandeburgo',
 'Monumento emblemático de Berlín.',
 'Pariser Platz',
 52.516275, 13.377704, 4.7, 2, NULL, NULL, TRUE),
(31, 13, 2, 'Museo de Pérgamo',
 'Museo con colecciones arqueológicas impresionantes.',
 'Museumsinsel',
 52.521200, 13.396900, 4.6, 3, NULL, NULL, TRUE),
(32, 13, 7, 'Hotel Mitte City',
 'Hotel céntrico cerca de Alexanderplatz.',
 'Mitte',
 52.520500, 13.409000, 4.3, 3, NULL, NULL, FALSE),

-- Tokio
(33, 16, 3, 'Parque Ueno',
 'Parque amplio con museos y zoológico, famoso por los cerezos.',
 'Taitō, Tokio',
 35.714800, 139.773000, 4.5, 1, NULL, NULL, TRUE),
(34, 16, 4, 'Sushi Sakura',
 'Restaurante de sushi con barra tradicional.',
 'Shinjuku',
 35.693800, 139.703400, 4.6, 3, NULL, NULL, TRUE),
(35, 16, 7, 'Hotel Shibuya Sky',
 'Hotel moderno en el distrito de Shibuya.',
 'Shibuya',
 35.659000, 139.700000, 4.4, 4, NULL, NULL, TRUE),

-- Kioto
(36, 17, 10, 'Templo Fushimi Inari',
 'Santuario famoso por sus miles de toriis rojos.',
 'Fushimi-ku',
 34.967100, 135.772700, 4.8, 2, NULL, NULL, TRUE),
(37, 17, 7, 'Ryokan Sakura',
 'Alojamiento tradicional japonés con onsen.',
 'Centro de Kioto',
 35.011000, 135.760000, 4.7, 4, NULL, NULL, TRUE),

-- Nueva York
(38, 19, 10, 'Times Square',
 'Zona comercial y de entretenimiento muy iluminada.',
 'Manhattan',
 40.758000, -73.985500, 4.6, 2, NULL, NULL, TRUE),
(39, 19, 2, 'Museo Metropolitano de Arte',
 'Gran museo de arte con colecciones de todo el mundo.',
 '1000 5th Ave',
 40.779400, -73.963200, 4.8, 3, NULL, NULL, TRUE),
(40, 19, 4, 'Central Park Diner',
 'Restaurante estilo diner americano cerca de Central Park.',
 'Manhattan',
 40.781000, -73.973000, 4.3, 2, NULL, NULL, FALSE),
(41, 19, 7, 'Hotel Manhattan Skyline',
 'Hotel de gama media con vistas al skyline.',
 'Midtown',
 40.754000, -73.984000, 4.2, 3, NULL, NULL, FALSE);

-- ============================
-- PLACE TAGS
-- ============================

INSERT INTO place_tags (place_id, tag_id) VALUES
-- CDMX
(1, 6), (1, 9),
(2, 7), (2, 2),
(3, 5), (3, 8),
(4, 5),

-- Guadalajara
(5, 9),
(6, 8), (6, 4),
(7, 4),

-- Cancún
(8, 7), (8, 10), (8, 2),
(9, 5), (9, 10),
(10, 4),

-- París
(11, 1), (11, 9),
(12, 6), (12, 9),
(13, 1), (13, 5), (13, 8),
(14, 1), (14, 5),

-- Roma
(17, 9), (17, 6),
(18, 6), (18, 9),
(19, 8), (19, 1),
(20, 5),

-- Madrid
(23, 7), (23, 2),
(24, 6), (24, 9),
(25, 8), (25, 4),
(26, 5),

-- Barcelona
(27, 9), (27, 6),
(28, 7),
(29, 1),

-- Berlín
(30, 9), (30, 6),
(31, 6),
(32, 4),

-- Tokio
(33, 7),
(34, 8), (34, 5),
(35, 5),

-- Kioto
(36, 9), (36, 6),
(37, 1), (37, 5),

-- Nueva York
(38, 3), (38, 2),
(39, 6), (39, 9),
(40, 8), (40, 4),
(41, 5);

-- ============================
-- RUTAS / TRANSPORTES
-- ============================

INSERT INTO routes
(route_id, origin_city_id, destination_city_id, mode_id, name,
 distance_km, average_duration_min, average_price)
VALUES
-- México
(1, 1, 2, 1, 'Vuelo CDMX - Guadalajara', 460.00, 60, 1800.00),
(2, 1, 3, 1, 'Vuelo CDMX - Cancún', 1280.00, 135, 2500.00),
(3, 2, 3, 2, 'Bus Guadalajara - Cancún (con escalas)', 2100.00, 1440, 1800.00),

-- Francia
(4, 4, 5, 2, 'TGV París - Lyon', 465.00, 120, 90.00),
(5, 5, 6, 2, 'Tren Lyon - Niza', 470.00, 300, 75.00),

-- Italia
(6, 7, 8, 2, 'Tren Roma - Florencia', 275.00, 95, 60.00),
(7, 8, 9, 2, 'Tren Florencia - Venecia', 260.00, 120, 55.00),

-- España
(8, 10, 11, 2, 'AVE Madrid - Barcelona', 620.00, 160, 80.00),

-- Japón
(9, 16, 17, 2, 'Shinkansen Tokio - Kioto', 450.00, 140, 110.00),
(10, 17, 18, 2, 'Tren Kioto - Osaka', 56.00, 30, 20.00),

-- Estados Unidos
(11, 19, 20, 1, 'Vuelo Nueva York - Los Ángeles', 3940.00, 360, 350.00),
(12, 20, 21, 1, 'Vuelo Los Ángeles - San Francisco', 560.00, 75, 120.00);
