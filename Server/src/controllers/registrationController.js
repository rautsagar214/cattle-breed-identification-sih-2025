const { Client } = require('pg');
const ImageKit = require('imagekit');
require('dotenv').config();

const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

const getDbClient = async () => {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
    await client.connect();
    return client;
};

exports.syncRegistration = async (req, res) => {
    let client;
    try {
        const {
            imagesBase64, predictions, latitude, longitude, locationName, timestamp, userId, userRole,
            pashuAadharTagId, species, breed, isBreedOverridden, overrideReason,
            phenotypicCharacteristics, identificationMarks, sex, ageYears, ageMonths,
            reproductiveBreedingHistory, healthVaccinationRecords, milkYieldInfo, birthDeathRegistrationInfo,
            ownerName, ownerAddress, ownerContact, premisesType, premisesLocation
        } = req.body;

        if (!imagesBase64 || !Array.isArray(imagesBase64) || imagesBase64.length === 0) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        client = await getDbClient();
        const createdAt = timestamp ? new Date(timestamp) : new Date();

        // Idempotency Check: Check if record already exists for this user at this timestamp
        // We do this BEFORE uploading images to save bandwidth/storage
        const checkQuery = `
            SELECT id, image_urls FROM cattle_registrations 
            WHERE user_id = $1 AND created_at = $2
        `;
        const checkResult = await client.query(checkQuery, [userId || null, createdAt]);

        if (checkResult.rows.length > 0) {
            console.log(`Duplicate registration detected for user ${userId} at ${createdAt}. Returning existing ID.`);
            return res.status(200).json({
                success: true,
                data: {
                    dbId: checkResult.rows[0].id,
                    imageUrls: checkResult.rows[0].image_urls,
                    syncedAt: new Date().toISOString()
                }
            });
        }

        // 1. Upload images to ImageKit
        const uploadPromises = imagesBase64.map(base64 =>
            imagekit.upload({
                file: base64, // base64 string
                fileName: `reg_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`,
                folder: '/cattle_registrations'
            })
        );

        const uploadResponses = await Promise.all(uploadPromises);
        const imageUrls = uploadResponses.map(response => response.url);

        // 2. Save to Database
        const query = `
            INSERT INTO cattle_registrations (
                user_id, user_role,
                pashu_aadhar_tag_id, species, breed, is_breed_overridden, override_reason,
                phenotypic_characteristics, identification_marks, sex, age_years, age_months,
                reproductive_breeding_history, health_vaccination_records, milk_yield_info, birth_death_registration_info,
                owner_name, owner_address, owner_contact, premises_type, premises_location,
                image_urls, predictions, latitude, longitude, location_name, created_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27)
            RETURNING id;
        `;

        const values = [
            userId || null, userRole || null,
            pashuAadharTagId, species, breed, isBreedOverridden, overrideReason,
            phenotypicCharacteristics, identificationMarks, sex, ageYears, ageMonths,
            reproductiveBreedingHistory, healthVaccinationRecords, milkYieldInfo, birthDeathRegistrationInfo,
            ownerName, ownerAddress, ownerContact, premisesType, premisesLocation,
            imageUrls, JSON.stringify(predictions.slice(0, 3)), latitude || null, longitude || null, locationName || null, createdAt
        ];

        const result = await client.query(query, values);
        const newDbId = result.rows[0].id;

        res.status(201).json({
            success: true,
            data: {
                dbId: newDbId,
                imageUrls: imageUrls,
                syncedAt: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Registration Sync error:', error);
        res.status(500).json({ success: false, message: 'Internal server error during registration sync', error: error.message });
    } finally {
        if (client) {
            await client.end();
        }
    }
};

exports.getAllRegistrations = async (req, res) => {
    let client;
    try {
        const {
            page = 1,
            limit = 10,
            search,
            state,
            city,
            species,
            breed,
            premisesType,
            startDate,
            endDate
        } = req.query;

        const offset = (page - 1) * limit;
        client = await getDbClient();

        let query = `
            SELECT r.*, w.name as registered_by_name 
            FROM cattle_registrations r
            LEFT JOIN workers w ON r.user_id = w.id
            WHERE 1=1
        `;
        let countQuery = `SELECT COUNT(*) FROM cattle_registrations WHERE 1=1`;
        const values = [];
        let paramIndex = 1;

        if (search) {
            query += ` AND (r.pashu_aadhar_tag_id ILIKE $${paramIndex} OR r.owner_name ILIKE $${paramIndex} OR r.breed ILIKE $${paramIndex})`;
            countQuery += ` AND (pashu_aadhar_tag_id ILIKE $${paramIndex} OR owner_name ILIKE $${paramIndex} OR breed ILIKE $${paramIndex})`;
            values.push(`%${search}%`);
            paramIndex++;
        }

        if (state) {
            query += ` AND (r.premises_location ILIKE $${paramIndex} OR r.owner_address ILIKE $${paramIndex})`;
            countQuery += ` AND (premises_location ILIKE $${paramIndex} OR owner_address ILIKE $${paramIndex})`;
            values.push(`%${state}%`);
            paramIndex++;
        }

        if (city) {
            query += ` AND (r.premises_location ILIKE $${paramIndex} OR r.owner_address ILIKE $${paramIndex} OR r.location_name ILIKE $${paramIndex})`;
            countQuery += ` AND (premises_location ILIKE $${paramIndex} OR owner_address ILIKE $${paramIndex} OR location_name ILIKE $${paramIndex})`;
            values.push(`%${city}%`);
            paramIndex++;
        }

        if (species) {
            query += ` AND r.species = $${paramIndex}`;
            countQuery += ` AND species = $${paramIndex}`;
            values.push(species);
            paramIndex++;
        }

        if (breed) {
            query += ` AND r.breed = $${paramIndex}`;
            countQuery += ` AND breed = $${paramIndex}`;
            values.push(breed);
            paramIndex++;
        }

        if (premisesType) {
            query += ` AND r.premises_type = $${paramIndex}`;
            countQuery += ` AND premises_type = $${paramIndex}`;
            values.push(premisesType);
            paramIndex++;
        }

        if (startDate) {
            query += ` AND r.created_at >= $${paramIndex}`;
            countQuery += ` AND created_at >= $${paramIndex}`;
            values.push(startDate);
            paramIndex++;
        }

        if (endDate) {
            query += ` AND r.created_at <= $${paramIndex}`;
            countQuery += ` AND created_at <= $${paramIndex}`;
            values.push(endDate);
            paramIndex++;
        }

        query += ` ORDER BY r.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;

        const queryValues = [...values, limit, offset];

        const result = await client.query(query, queryValues);
        const countResult = await client.query(countQuery, values);

        res.status(200).json({
            success: true,
            data: result.rows,
            pagination: {
                total: parseInt(countResult.rows[0].count),
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
            }
        });

    } catch (error) {
        console.error('Error fetching registrations:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    } finally {
        if (client) {
            await client.end();
        }
    }
};
