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

exports.getStats = async (req, res) => {
    let client;
    try {
        client = await getDbClient();

        const approvedCountQuery = 'SELECT COUNT(*) FROM approved_samples';
        const registrationCountQuery = 'SELECT COUNT(*) FROM cattle_registrations';
        const scansCountQuery = 'SELECT COUNT(*) FROM prediction_runs';

        const [approvedRes, registrationRes, scansRes] = await Promise.all([
            client.query(approvedCountQuery),
            client.query(registrationCountQuery),
            client.query(scansCountQuery)
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalApproved: parseInt(approvedRes.rows[0].count),
                totalRegistrations: parseInt(registrationRes.rows[0].count),
                totalScans: parseInt(scansRes.rows[0].count)
            }
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    } finally {
        if (client) await client.end();
    }
};

exports.getDistributions = async (req, res) => {
    let client;
    try {
        client = await getDbClient();

        // Breed Distribution (from approved samples)
        const breedQuery = `
            SELECT evaluator_final_breed as name, COUNT(*) as value 
            FROM approved_samples 
            GROUP BY evaluator_final_breed
        `;

        // Angle Distribution
        const angleQuery = `
            SELECT final_angle as name, COUNT(*) as value 
            FROM approved_samples 
            GROUP BY final_angle
        `;

        const [breedRes, angleRes] = await Promise.all([
            client.query(breedQuery),
            client.query(angleQuery)
        ]);

        res.status(200).json({
            success: true,
            data: {
                breedDistribution: breedRes.rows,
                angleDistribution: angleRes.rows
            }
        });
    } catch (error) {
        console.error('Error fetching distributions:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    } finally {
        if (client) await client.end();
    }
};

exports.getGrowthTrends = async (req, res) => {
    let client;
    try {
        client = await getDbClient();

        // Get last 6 months data
        // We will group by month for a broader trend, or day if requested. Defaulting to daily for last 30 days for now, or monthly for last 6 months.
        // Let's do monthly for the last 6 months for a cleaner graph.

        const registrationTrendQuery = `
            SELECT TO_CHAR(created_at, 'YYYY-MM') as date, COUNT(*) as count
            FROM cattle_registrations
            WHERE created_at >= NOW() - INTERVAL '6 months'
            GROUP BY TO_CHAR(created_at, 'YYYY-MM')
            ORDER BY date ASC
        `;

        const approvedTrendQuery = `
            SELECT TO_CHAR(evaluation_timestamp, 'YYYY-MM') as date, COUNT(*) as count
            FROM approved_samples
            WHERE evaluation_timestamp >= NOW() - INTERVAL '6 months'
            GROUP BY TO_CHAR(evaluation_timestamp, 'YYYY-MM')
            ORDER BY date ASC
        `;

        const [regRes, approvedRes] = await Promise.all([
            client.query(registrationTrendQuery),
            client.query(approvedTrendQuery)
        ]);

        // Merge data to have a unified structure if needed, or send separate arrays
        // Sending separate arrays is easier for the frontend to handle with Recharts (can combine there or just plot one)
        // Actually, for a multi-line chart, it's best to have [{ name: 'Jan', registrations: 10, approved: 5 }, ...]

        // Let's process this in JS
        const dataMap = {};

        regRes.rows.forEach(row => {
            if (!dataMap[row.date]) dataMap[row.date] = { name: row.date, registrations: 0, approved: 0 };
            dataMap[row.date].registrations = parseInt(row.count);
        });

        approvedRes.rows.forEach(row => {
            if (!dataMap[row.date]) dataMap[row.date] = { name: row.date, registrations: 0, approved: 0 };
            dataMap[row.date].approved = parseInt(row.count);
        });

        const chartData = Object.values(dataMap).sort((a, b) => a.name.localeCompare(b.name));

        res.status(200).json({
            success: true,
            data: chartData
        });
    } catch (error) {
        console.error('Error fetching growth trends:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    } finally {
        if (client) await client.end();
    }
};

exports.getImbalanceAlerts = async (req, res) => {
    let client;
    try {
        client = await getDbClient();
        const THRESHOLD = 50; // Configurable threshold

        const breedCountsQuery = `
            SELECT evaluator_final_breed as breed, COUNT(*) as count
            FROM approved_samples
            GROUP BY evaluator_final_breed
            HAVING COUNT(*) < $1
        `;

        const result = await client.query(breedCountsQuery, [THRESHOLD]);

        const alerts = result.rows.map(row => ({
            breed: row.breed,
            count: parseInt(row.count),
            message: `Low sample count for ${row.breed} (${row.count} samples). Recommended: ${THRESHOLD}+`
        }));

        res.status(200).json({
            success: true,
            data: alerts
        });
    } catch (error) {
        console.error('Error fetching imbalance alerts:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    } finally {
        if (client) await client.end();
    }
};
