const { Client } = require('pg');
require('dotenv').config();

const getDbClient = async () => {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
    await client.connect();
    return client;
};

exports.getPendingEvaluations = async (req, res) => {
    let client;
    try {
        client = await getDbClient();

        const query = `
            WITH evaluated_images AS (
                SELECT original_image_url AS img FROM approved_samples
                UNION
                SELECT image_url AS img FROM rejected_samples
            ),
            run_images AS (
                SELECT 
                    pr.id,
                    unnest(pr.image_urls) AS img
                FROM prediction_runs pr
            ),
            pending_images AS (
                SELECT
                    r.id,
                    CASE WHEN e.img IS NULL THEN 1 ELSE 0 END AS pending_flag
                FROM run_images r
                LEFT JOIN evaluated_images e
                    ON r.img = e.img
            )
            SELECT 
                pr.*,
                w.name as user_name,
                SUM(pi.pending_flag) AS total_pending_evals,
                array_length(pr.image_urls, 1) as total_images
            FROM prediction_runs pr
            JOIN pending_images pi
                ON pr.id = pi.id
            LEFT JOIN workers w ON pr.user_id = w.id
            GROUP BY pr.id, w.name
            HAVING SUM(pi.pending_flag) > 0
            ORDER BY pr.created_at DESC;
        `;

        const result = await client.query(query);

        res.status(200).json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        console.error('Error fetching pending evaluations:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    } finally {
        if (client) {
            await client.end();
        }
    }
};

exports.getRunDetails = async (req, res) => {
    let client;
    try {
        const { id } = req.params;
        client = await getDbClient();

        // 1. Fetch Run Details
        const runQuery = `
            SELECT pr.*, w.name as user_name
            FROM prediction_runs pr
            LEFT JOIN workers w ON pr.user_id = w.id
            WHERE pr.id = $1
        `;
        const runResult = await client.query(runQuery, [id]);

        if (runResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Run not found' });
        }

        const run = runResult.rows[0];
        const imageUrls = run.image_urls || [];

        // 2. Check Image Statuses
        // We check if images exist in approved or rejected tables
        const statusQuery = `
            SELECT original_image_url as img, 'Approved' as status FROM approved_samples WHERE original_image_url = ANY($1)
            UNION
            SELECT image_url as img, 'Rejected' as status FROM rejected_samples WHERE image_url = ANY($1)
        `;

        const statusResult = await client.query(statusQuery, [imageUrls]);
        const statusMap = {};
        statusResult.rows.forEach(row => {
            statusMap[row.img] = row.status;
        });

        // 3. Construct Response with Angles and Status
        const angles = ['Side Profile', 'Front Profile', '45 Degree View'];
        const imagesWithDetails = imageUrls.map((url, index) => ({
            url,
            angle: angles[index] || `Image ${index + 1}`,
            status: statusMap[url] || 'Pending'
        }));

        res.status(200).json({
            success: true,
            data: {
                ...run,
                images: imagesWithDetails
            }
        });

    } catch (error) {
        console.error('Error fetching run details:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    } finally {
        if (client) {
            await client.end();
        }
    }
};

exports.approveImage = async (req, res) => {
    let client;
    try {
        const {
            run_id,
            original_image_url,
            final_image_url,
            final_angle,
            evaluator_final_breed,
            average_top3_predictions,
            location_latitude,
            location_longitude,
            quality_notes,
            evaluator_id,
            evaluation_timestamp
        } = req.body;

        client = await getDbClient();

        const query = `
            INSERT INTO approved_samples (
                run_id, original_image_url, final_image_url, final_angle, 
                evaluator_final_breed, average_top3_predictions, 
                location_latitude, location_longitude, quality_notes, 
                evaluator_id, evaluation_timestamp
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING id
        `;

        const values = [
            run_id, original_image_url, final_image_url, final_angle,
            evaluator_final_breed, JSON.stringify(average_top3_predictions),
            location_latitude, location_longitude, quality_notes,
            evaluator_id, evaluation_timestamp
        ];

        const result = await client.query(query, values);

        res.status(201).json({
            success: true,
            message: 'Image approved successfully',
            data: { id: result.rows[0].id }
        });

    } catch (error) {
        console.error('Error approving image:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    } finally {
        if (client) {
            await client.end();
        }
    }
};

exports.rejectImage = async (req, res) => {
    let client;
    try {
        const {
            run_id,
            image_url,
            reject_reason,
            evaluator_id,
            timestamp
        } = req.body;

        client = await getDbClient();

        const query = `
            INSERT INTO rejected_samples (
                run_id, image_url, reject_reason, evaluator_id, timestamp
            ) VALUES ($1, $2, $3, $4, $5)
            RETURNING id
        `;

        const values = [run_id, image_url, reject_reason, evaluator_id, timestamp];

        const result = await client.query(query, values);

        res.status(201).json({
            success: true,
            message: 'Image rejected successfully',
            data: { id: result.rows[0].id }
        });

    } catch (error) {
        console.error('Error rejecting image:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    } finally {
        if (client) {
            await client.end();
        }
    }
};

exports.getApprovedSamples = async (req, res) => {
    let client;
    try {
        client = await getDbClient();
        const query = `
            SELECT a.*, w.name as evaluator_name 
            FROM approved_samples a
            LEFT JOIN workers w ON a.evaluator_id = w.id
            ORDER BY a.evaluation_timestamp DESC
        `;
        const result = await client.query(query);
        res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error fetching approved samples:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    } finally {
        if (client) await client.end();
    }
};

exports.getRejectedSamples = async (req, res) => {
    let client;
    try {
        client = await getDbClient();
        const query = `
            SELECT r.*, w.name as evaluator_name 
            FROM rejected_samples r
            LEFT JOIN workers w ON r.evaluator_id = w.id
            ORDER BY r.timestamp DESC
        `;
        const result = await client.query(query);
        res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error fetching rejected samples:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    } finally {
        if (client) await client.end();
    }
};
