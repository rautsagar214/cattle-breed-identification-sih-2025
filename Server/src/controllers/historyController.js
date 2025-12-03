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

exports.syncHistory = async (req, res) => {
    let client;
    try {
        const { imagesBase64, predictions, latitude, longitude, locationName, timestamp, userId, userRole } = req.body;

        if (!imagesBase64 || !Array.isArray(imagesBase64) || imagesBase64.length === 0 || !predictions) {
            return res.status(400).json({ success: false, message: 'Missing required fields or invalid images format' });
        }

        client = await getDbClient();
        const createdAt = timestamp ? new Date(timestamp) : new Date();

        // Idempotency Check: Check if record already exists for this user at this timestamp
        // We do this BEFORE uploading images to save bandwidth/storage
        const checkQuery = `
            SELECT id, image_urls FROM prediction_runs 
            WHERE user_id = $1 AND created_at = $2
        `;
        const checkResult = await client.query(checkQuery, [userId || null, createdAt]);

        if (checkResult.rows.length > 0) {
            console.log(`Duplicate scan detected for user ${userId} at ${createdAt}. Returning existing ID.`);
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
                fileName: `scan_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`,
                folder: '/cattle_scans'
            })
        );

        const uploadResponses = await Promise.all(uploadPromises);
        const imageUrls = uploadResponses.map(response => response.url);

        // 2. Save to Database
        const query = `
            INSERT INTO prediction_runs (
                user_id, user_role, image_urls, predictions, latitude, longitude, location_name, created_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id;
        `;

        const values = [
            userId || null,
            userRole || null,
            imageUrls, // Postgres/CockroachDB handles array automatically with node-postgres
            JSON.stringify(predictions),
            latitude || null,
            longitude || null,
            locationName || null,
            createdAt
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
        console.error('Sync error:', error);
        res.status(500).json({ success: false, message: 'Internal server error during sync', error: error.message });
    } finally {
        if (client) {
            await client.end();
        }
    }
};
