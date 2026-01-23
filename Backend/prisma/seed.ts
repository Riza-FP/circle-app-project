import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
    console.log("Start seeding...");

    // clear existing data
    await prisma.like.deleteMany();
    await prisma.reply.deleteMany();
    await prisma.thread.deleteMany();
    await prisma.user.deleteMany();

    const password = await bcrypt.hash("password123", 10);

    // 1. Create Users
    const usersData = [
        { username: "aurora", fullName: "Aurora Skies", email: "aurora@example.com", bio: "Chasing sunsets and dreams 🌅" }, // Index 0
        { username: "kai_dev", fullName: "Kai Takamura", email: "kai@example.com", bio: "Code, Sleep, Repeat. 💻" },     // Index 1
        { username: "luna_love", fullName: "Luna Lovegood", email: "luna@example.com", bio: "Believer in the impossible ✨" }, // Index 2
        { username: "max_power", fullName: "Max Power", email: "max@example.com", bio: "Living life to the max! 🚀" },     // Index 3
        { username: "sophia_art", fullName: "Sophia Rivera", email: "sophia@example.com", bio: "Art is life. 🎨" },     // Index 4
        {
            username: "nrlatifahh",
            fullName: "Siti Nurlatifah",
            email: "nurlatifah@gmail.com",
            bio: "I love myself!",
            photoProfile: "https://i.imgur.com/SpIeXBO.jpeg"
        } // Index 5
    ];

    const users = [];
    for (const userData of usersData) {
        const user = await prisma.user.create({
            data: {
                email: userData.email,
                username: userData.username,
                fullName: userData.fullName,
                password: password,
                bio: userData.bio,
                photoProfile: (userData as any).photoProfile || `https://i.pravatar.cc/150?u=${userData.username}`,
            },
        });
        users.push(user);
        console.log(`Created user: ${user.username}`);
    }

    // 2. Define Threads with contextual replies
    const fullThreadsData = [
        {
            authorIndex: 1, // Kai
            content: "Just finished refactoring the entire backend. It feels so clean now! 🧹✨ #coding #refactor",
            image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&auto=format&fit=crop&q=60",
            replies: [
                { authorIndex: 0, content: "That's the best feeling! Great job Kai." },
                { authorIndex: 3, content: "Did you break anything in the process? �" },
                { authorIndex: 1, content: "Only a few tests, but they are fixed now! �" },
                { authorIndex: 5, content: "Teach me your ways, sensei." },
            ]
        },
        {
            authorIndex: 5, // Siti
            content: "Look at this view! Sometimes you just need to disconnect. 🌿⛰️",
            image: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=500&auto=format&fit=crop&q=60",
            replies: [
                { authorIndex: 0, content: "Beautiful! Where is this?" },
                { authorIndex: 2, content: "Nature heals everything. Enjoy!" },
                { authorIndex: 5, content: "It's in Bandung, come visit!" },
            ]
        },
        {
            authorIndex: 3, // Max
            content: "Gym time! Leg day is the best day. �🏋️‍♂️",
            image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&auto=format&fit=crop&q=60",
            replies: [
                { authorIndex: 4, content: "You are crazy, leg day is torture!" },
                { authorIndex: 3, content: "No pain no gain! 😤" },
            ]
        },
        {
            authorIndex: 4, // Sophia
            content: "Working on a new digital painting. The colors are tricky today. 🎨🖌️",
            image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=500&auto=format&fit=crop&q=60",
            replies: [
                { authorIndex: 2, content: "Can't wait to see the result!" },
                { authorIndex: 0, content: "Blue and Orange always works well together." },
                { authorIndex: 4, content: "I'll try that combo, thanks Aurora!" },
                { authorIndex: 1, content: "Art is magic." },
            ]
        },
        {
            authorIndex: 0, // Aurora
            content: "Who is excited for the weekend? I plan to sleep for 48 hours. 😴",
            image: null,
            replies: [
                { authorIndex: 1, content: "I have a hackathon... so no sleep for me." },
                { authorIndex: 3, content: "Hiking trip! 🏔️" },
                { authorIndex: 5, content: "Cinema date with myself! 🍿" },
                { authorIndex: 2, content: "Same here Aurora, recharging needed." },
                { authorIndex: 4, content: "Enjoy your rest!" },
            ]
        },
        {
            authorIndex: 1, // Kai
            content: "Why is centering a div still so hard in 2026? 😭",
            image: null,
            replies: [
                { authorIndex: 0, content: "Just use Flexbox! `justify-center items-center`" },
                { authorIndex: 1, content: "I know, but sometimes it just refuses to cooperate." },
                { authorIndex: 5, content: "Grid is easier. place-items: center." },
                { authorIndex: 2, content: "The struggle is real." },
            ]
        },
        {
            authorIndex: 2, // Luna
            content: "Did you guys see the moon last night? It was huge! 🌕",
            image: "https://images.unsplash.com/photo-1522030299830-16b8d3d049fe?w=500&auto=format&fit=crop&q=60",
            replies: [
                { authorIndex: 0, content: "Supermoon season!" },
                { authorIndex: 4, content: "I missed it 😭" },
            ]
        },
        {
            authorIndex: 5, // Siti
            content: "Finally trying out that new coffee shop around the block. ☕🍰",
            image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&auto=format&fit=crop&q=60",
            replies: [
                { authorIndex: 3, content: "Is the coffee strong? I need energy." },
                { authorIndex: 5, content: "Very strong! And the cheesecake is divine." },
                { authorIndex: 1, content: "On my way." },
            ]
        }
    ];

    // 3. Insert Threads and Replies
    for (const threadData of fullThreadsData) {
        const thread = await prisma.thread.create({
            data: {
                content: threadData.content,
                images: threadData.image ? [threadData.image] : [],
                authorId: users[threadData.authorIndex].id,
            },
        });

        console.log(`Created thread by ${users[threadData.authorIndex].username}`);

        for (const replyData of threadData.replies) {
            await prisma.reply.create({
                data: {
                    content: replyData.content,
                    threadId: thread.id,
                    authorId: users[replyData.authorIndex].id,
                }
            });
        }
    }

    console.log("Seeding finished.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
