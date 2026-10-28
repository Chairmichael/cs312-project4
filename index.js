const express = require('express');
const { Client } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

const client = new Client({
    user: 'postgres',
    password: 'abcde',
    host: '127.0.0.1',
    port: 5432,
    database: 'BlogDB',
});

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

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

async function writePost(post) {
    await client.query(
        `INSERT INTO blogs (creator_name, creator_user_id, title, body, date_created, tags)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
            post.creator_name,
            post.creatorUserID,
            post.title,
            post.body,
            post.date_created,
            [post.tag],
        ]
    );
}

async function updatePost(post) {
    await client.query(
        `UPDATE blogs
         SET creator_name = $1,
             title = $2,
             body = $3,
             tags = $4
         WHERE creator_user_id = $5
           AND date_created = $6`,
        [
            post.creator_name,
            post.title,
            post.body,
            [post.tag],
            post.creatorUserID,
            post.date_created,
        ]
    );
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
            await writePost(post);
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

app.get('/', async (req, res) => {
    const posts = await getAllPosts();
    res.render('index', { cards: posts, post_tags });
});

app.post('/', async (req, res) => {
    const { username, title, tags, body, creatorUserID, date_created } = req.body;

    const postDate = date_created ? new Date(date_created) : new Date();
    const newPost = {
        title,
        body,
        creator_name: username,
        creatorUserID: creatorUserID || username,
        tag: Array.isArray(tags) ? tags[0] : tags,
        date_created: postDate,
    };

    try {
        const existingPost = await client.query(
            `SELECT 1
             FROM blogs
             WHERE creator_user_id = $1
               AND date_created = $2`,
            [newPost.creatorUserID, newPost.date_created]
        );

        if (existingPost.rowCount > 0) {
            await updatePost(newPost);
            console.log('Updated existing post in database:', newPost);
        } else {
            await writePost(newPost);
            console.log('Inserted new post into database:', newPost);
        }
    } catch (error) {
        console.error('Error syncing post to database:', error.message);
    }

    console.log(newPost);

    res.redirect('/');
});

app.post('/delete', (req, res) => {
    const postIndex = cards.findIndex((card) => card.id === req.body.postId);

    if (postIndex !== -1) {
        cards.splice(postIndex, 1);
    }

    console.log(updatedPost);
    res.sendStatus(204);
});

app.listen(PORT, async () => {
    console.log(`Server running on http://localhost:${PORT}`);
    await seedDefaultPosts();
});

