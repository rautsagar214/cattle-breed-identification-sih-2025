const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const https = require('https');
const archiver = require('archiver');
require('dotenv').config();

const getDbClient = async () => {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
    await client.connect();
    return client;
};

const downloadImage = (url, dest) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close(resolve);
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => reject(err));
        });
    });
};

exports.generateDataset = async (req, res) => {
    let client;
    try {
        const { breed } = req.body;
        if (!breed) {
            return res.status(400).json({ success: false, message: 'Breed is required' });
        }

        client = await getDbClient();

        // 1. Get next version number
        const versionQuery = `SELECT MAX(version) as max_ver FROM dataset_versions WHERE breed = $1`;
        const versionResult = await client.query(versionQuery, [breed]);
        const nextVersion = (versionResult.rows[0].max_ver || 0) + 1;

        // 2. Fetch approved images for the breed
        // Note: We filter by evaluator_final_breed matching the requested breed
        const imagesQuery = `
            SELECT * FROM approved_samples 
            WHERE evaluator_final_breed ILIKE $1
        `;
        const imagesResult = await client.query(imagesQuery, [breed]);
        const images = imagesResult.rows;

        if (images.length === 0) {
            return res.status(404).json({ success: false, message: 'No approved samples found for this breed' });
        }

        // 3. Setup Directories
        const datasetName = `${breed}_v${nextVersion}`;
        const baseDir = path.join(__dirname, '../../public/datasets');
        const tempDir = path.join(baseDir, 'temp', datasetName);

        // Ensure directories exist
        ['train', 'val', 'test'].forEach(sub => {
            fs.mkdirSync(path.join(tempDir, sub), { recursive: true });
        });

        // 4. Distribute and Download Images
        const metadata = {
            breed,
            version: nextVersion,
            total_images: images.length,
            created_at: new Date().toISOString(),
            images: []
        };

        const downloadPromises = images.map(async (img, index) => {
            // 80/10/10 Split
            const rand = Math.random();
            let subset = 'train';
            if (rand > 0.9) subset = 'test';
            else if (rand > 0.8) subset = 'val';

            const ext = path.extname(img.final_image_url || img.original_image_url).split('?')[0] || '.jpg';
            const filename = `${breed}_${index + 1}${ext}`;
            const destPath = path.join(tempDir, subset, filename);
            const imageUrl = img.final_image_url || img.original_image_url;

            try {
                await downloadImage(imageUrl, destPath);
                metadata.images.push({
                    original_id: img.id,
                    filename,
                    subset,
                    angle: img.final_angle,
                    location: { lat: img.location_latitude, lng: img.location_longitude }
                });
            } catch (err) {
                console.error(`Failed to download image ${imageUrl}:`, err);
            }
        });

        await Promise.all(downloadPromises);

        // 5. Save Metadata
        fs.writeFileSync(path.join(tempDir, 'metadata.json'), JSON.stringify(metadata, null, 2));

        // 6. Create Zip
        const zipFileName = `${datasetName}.zip`;
        const zipFilePath = path.join(baseDir, zipFileName);
        const output = fs.createWriteStream(zipFilePath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        archive.pipe(output);
        archive.directory(tempDir, datasetName);
        await archive.finalize();

        // Wait for zip to finish writing
        await new Promise((resolve, reject) => {
            output.on('close', resolve);
            output.on('error', reject);
        });

        // 7. Cleanup Temp
        fs.rmSync(tempDir, { recursive: true, force: true });

        // 8. Record in DB
        const insertQuery = `
            INSERT INTO dataset_versions (breed, version, file_path, created_by)
            VALUES ($1, $2, $3, $4)
            RETURNING id
        `;
        // Assuming created_by is 1 for admin for now, or extract from token if available
        await client.query(insertQuery, [breed, nextVersion, `/datasets/${zipFileName}`, 1]);

        res.status(201).json({
            success: true,
            message: 'Dataset generated successfully',
            data: {
                breed,
                version: nextVersion,
                downloadUrl: `/datasets/${zipFileName}`,
                stats: {
                    total: images.length,
                    train: metadata.images.filter(i => i.subset === 'train').length,
                    val: metadata.images.filter(i => i.subset === 'val').length,
                    test: metadata.images.filter(i => i.subset === 'test').length
                }
            }
        });

    } catch (error) {
        console.error('Error generating dataset:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    } finally {
        if (client) await client.end();
    }
};

exports.getDatasetVersions = async (req, res) => {
    let client;
    try {
        client = await getDbClient();
        const query = `
            SELECT * FROM dataset_versions 
            ORDER BY created_at DESC
        `;
        const result = await client.query(query);
        res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error fetching dataset versions:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    } finally {
        if (client) await client.end();
    }
};
