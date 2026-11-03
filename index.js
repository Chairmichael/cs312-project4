import express from 'express';
import { Client } from 'pg';
import { pbkdf2 as pbkdf2Callback, randomBytes, timingSafeEqual } from 'node:crypto';
import path from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDirectory = path.join(__dirname, 'dist');
const pbkdf2 = promisify(pbkdf2Callback);

const client = new Client({
    user: 'postgres',
    password: 'abcde',
    host: '127.0.0.1',
    port: 5432,
    database: 'BlogDB',
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(distDirectory));

const cards = [
    {
        title: 'Coffee',
        body: 'Just switched to a pour-over setup and honestly the difference is night and day.',
        creatorUser: 'Mia',
        creatorUserID: 'mia95',
        tag: 'Lifestyle',
        date_created: new Date('2026-09-11T08:05:00'),
    },
    {
        title: 'Refactoring Our Auth Flow: Lessons From a Painful Migration',
        body: 'We spent three weeks migrating from session-based auth to JWTs and hit almost every pitfall along the way. This post covers what broke, why it broke, and the checklist we wish we had at the start. The first mistake was assuming we could swap the underlying mechanism without touching anything downstream, but token expiration, refresh logic, and CORS headers all needed to be reworked in tandem. We underestimated how much of our session middleware had quietly become load-bearing for things unrelated to login, like rate limiting and analytics tracking, and untangling those dependencies ate up more time than the migration itself. Testing in staging gave us false confidence since our traffic patterns there never matched production, so a handful of edge cases around token refresh races only showed up once real users hit them. We also learned the hard way that rotating signing keys without a grace period locks out anyone with a token issued in the last few minutes. By the end we had a much better mental model of the tradeoffs, and a runbook we now hand to anyone touching auth on the team.',
        creatorUser: 'Mia',
        creatorUserID: 'mia95',
        tag: 'Tech',
        date_created: new Date('2026-09-13T16:42:00'),
    },
    {
        title: 'Why I Started Journaling Again',
        body: 'Picked up an old habit after a long break. A few pages in, I already notice I am thinking more clearly before big decisions.',
        creatorUser: 'Priya Nandakumar',
        creatorUserID: 'priyaN24',
        tag: 'Hobby',
        date_created: new Date('2026-09-09T21:10:00'),
    },
    {
        title: 'Scaling a Two-Person Startup Without Losing Your Mind',
        body: 'No hiring budget, no runway to spare, and a growing customer base. Here is how we prioritized ruthlessly, automated the boring stuff, and said no to almost everything else.',
        creatorUser: 'Samuel T. Whitfield-Brooks',
        creatorUserID: 'samwhitfield7',
        tag: 'Business',
        date_created: new Date('2026-09-08T11:00:00'),
    },
    {
        title: 'Grading Season',
        body: 'A short reflection on burnout, boundaries, and why I started blocking my calendar during finals week this year.',
        creatorUser: 'Samuel T. Whitfield-Brooks',
        creatorUserID: 'samwhitfield7',
        tag: 'Tech',
        date_created: new Date('2026-09-12T13:27:00'),
    },
];
const post_tags = [
    'Tech', 'Lifestyle', 'Education', 'Hobby', 'Business'
];

async function writePost({ username, creatorUserID, title, body, tags, date_created }) {
    await client.query(
        `INSERT INTO blogs (creator_name, creator_user_id, title, body, date_created, tags)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
            username,
            creatorUserID || username,
            title,
            body,
            date_created || new Date(),
            Array.isArray(tags) ? tags : [tags],
        ]
    );
}

async function updatePost({ postId, username, title, body, tags }) {
    const result = await client.query(
        `UPDATE blogs
         SET title = $1,
             body = $2,
             tags = $3
         WHERE blog_id = $4 AND creator_user_id = $5`,
        [
            title,
            body,
            Array.isArray(tags) ? tags : [tags],
            postId,
            username,
        ]
    );

    return result.rowCount;
}

async function getAllPosts() {
    const result = await client.query(
        `SELECT blog_id, creator_name, creator_user_id, title, body, date_created, tags
         FROM blogs
         ORDER BY date_created DESC`
    );

    return result.rows.map((row) => ({
        title: row.title,
        body: row.body,
        description: row.body,
        creator_name: row.creator_name,
        tag: Array.isArray(row.tags) ? row.tags.join(' ') : row.tags,
        date_created: row.date_created,
        createdAt: row.date_created,
        id: String(row.blog_id),
        creatorUserID: row.creator_user_id,
    }));
}

async function seedDefaultPosts() {
    try {
        await client.connect();
        await client.query(
            `CREATE TABLE IF NOT EXISTS users (
                username VARCHAR(24) PRIMARY KEY,
                fullname TEXT NOT NULL,
                password_salt CHAR(32) NOT NULL,
                password_hash CHAR(64) NOT NULL
            )`
        );

        const existingRows = await client.query(
            `SELECT title, creator_user_id, body
             FROM blogs
             WHERE title = ANY($1) OR creator_user_id = ANY($2)`,
            [cards.map((card) => card.title), cards.map((card) => card.creatorUserID)]
        );

        const existingKeys = new Set(
            existingRows.rows.map((row) => `${row.title}::${row.creator_user_id}`)
        );

        const missingPosts = cards.filter(
            (card) => !existingKeys.has(`${card.title}::${card.creatorUserID}`)
        );

        for (const post of missingPosts) {
            await writePost({
                username: post.creatorUser,
                creatorUserID: post.creatorUserID,
                title: post.title,
                body: post.body,
                tags: post.tag,
                date_created: post.date_created,
            });
        }

        if (missingPosts.length > 0) {
            console.log(`Inserted ${missingPosts.length} default posts into the database.`);
        } else {
            console.log('All default posts already exist in the database.');
        }
    } catch (error) {
        console.error('Error syncing default posts to the database:', error.message);
    }
}

async function hashPassword(password, salt) {
    return pbkdf2(password, salt, 100000, 32, 'sha256');
}

app.post('/auth', async (req, res) => {
    const { action, username: rawUsername, password, fullname } = req.body ?? {};
    const username = typeof rawUsername === 'string' ? rawUsername.trim() : '';

    if (!['signin', 'signup'].includes(action) || !username || typeof password !== 'string') {
        return res.status(400).json({ error: 'Username and password are required.' });
    }

    try {
        if (action === 'signup') {
            if (username.length < 3 || username.length > 24 || password.length < 10 ||
                typeof fullname !== 'string' || !fullname.trim()) {
                return res.status(400).json({ error: 'Signup details are invalid.' });
            }

            const salt = randomBytes(16);
            const passwordHash = await hashPassword(password, salt);
            try {
                await client.query(
                    `INSERT INTO users (username, fullname, password_salt, password_hash)
                     VALUES ($1, $2, $3, $4)`,
                    [username, fullname.trim(), salt.toString('hex'), passwordHash.toString('hex')]
                );
            } catch (error) {
                if (error.code === '23505') {
                    return res.status(409).json({ error: 'Username is already taken.' });
                }
                throw error;
            }

            return res.redirect(303, '/');
        }

        const result = await client.query(
            `SELECT fullname, password_salt, password_hash
             FROM users
             WHERE username = $1`,
            [username]
        );
        if (result.rowCount === 0) {
            return res.status(401).json({ error: 'Invalid username or password.' });
        }

        const user = result.rows[0];
        const storedHash = Buffer.from(user.password_hash, 'hex');
        const submittedHash = await hashPassword(password, Buffer.from(user.password_salt, 'hex'));
        if (storedHash.length !== submittedHash.length || !timingSafeEqual(storedHash, submittedHash)) {
            return res.status(401).json({ error: 'Invalid username or password.' });
        }

        return res.redirect(303, '/');
    } catch (error) {
        console.error('Authentication request failed:', error.message);
        return res.status(500).json({ error: 'Authentication failed. Please try again.' });
    }
});

app.get('/posts', async (req, res) => {
    try {
        const posts = await getAllPosts();
        res.json(posts);
    } catch (error) {
        console.error('Error retrieving posts from the database:', error.message);
        res.status(500).json({ error: 'Failed to retrieve posts.' });
    }
});

app.post('/submitpost', async (req, res) => {
    const postData = req.body;
    const postId = String(postData.postId ?? '').trim();

    try {
        if (postId) {
            const updatedRows = await updatePost({ ...postData, postId });
            if (updatedRows === 0) {
                return res.status(404).json({ error: 'Post not found.' });
            }
            console.log('Updated existing post in database:', postData);
        } else {
            await writePost(postData);
            console.log('Inserted new post into database:', postData);
        }
        res.status(postId ? 200 : 201).json({ success: true });
    } catch (error) {
        console.error('Error syncing post to database:', error.message);
        res.status(500).json({ error: 'Failed to save post.' });
    }
});

app.post('/delete', async (req, res) => {
    const { postId, username } = req.body ?? {};
    if (!postId || !username) {
        return res.status(400).json({ error: 'Post ID and username are required.' });
    }

    try {
        const result = await client.query(
            'DELETE FROM blogs WHERE blog_id = $1 AND creator_user_id = $2 RETURNING blog_id',
            [postId, username]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Post not found or not owned by this user.' });
        }
        return res.json({ success: true });
    } catch (error) {
        console.error('Error deleting post:', error.message);
        return res.status(500).json({ error: 'Failed to delete post.' });
    }
});

app.use((req, res, next) => {
    if (req.method !== 'GET') {
        return next();
    }

    res.sendFile(path.join(distDirectory, 'index.html'), (error) => {
        if (error) {
            next(error);
        }
    });
});

app.listen(PORT, async () => {
    console.log(`Server running on http://localhost:${PORT}`);
    await seedDefaultPosts();
});

