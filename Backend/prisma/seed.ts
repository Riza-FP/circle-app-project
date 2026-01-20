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

    const usersData = [
        { username: "aurora", fullName: "Aurora Skies", email: "aurora@example.com", bio: "Chasing sunsets and dreams 🌅" },
        { username: "kai_dev", fullName: "Kai Takamura", email: "kai@example.com", bio: "Code, Sleep, Repeat. 💻" },
        { username: "luna_love", fullName: "Luna Lovegood", email: "luna@example.com", bio: "Believer in the impossible ✨" },
        { username: "max_power", fullName: "Max Power", email: "max@example.com", bio: "Living life to the max! 🚀" },
        { username: "sophia_art", fullName: "Sophia Rivera", email: "sophia@example.com", bio: "Art is life. 🎨" },
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
                photoProfile: `https://i.pravatar.cc/150?u=${userData.username}`,
            },
        });
        users.push(user);
        console.log(`Created user: ${user.username}`);
    }

    const threadsData = [
        "Just finished a great coding session! 🚀",
        "Does anyone know how to center a div? 😅",
        "React 19 is looking amazing! 🔥",
        "Coffee is my fuel ☕",
        "Building a social media app with the best stack!",
        "Tailwind CSS makes styling so easy.",
        "Bugs, bugs, everywhere... 🐛",
        "Finally deployed my app! 🎉",
        "Anyone up for a collab?",
        "Good morning everyone! ☀️",
    ];

    for (const user of users) {
        // Each user creates 2 threads
        for (let j = 0; j < 2; j++) {
            const randomContent = threadsData[Math.floor(Math.random() * threadsData.length)];
            await prisma.thread.create({
                data: {
                    content: randomContent,
                    authorId: user.id,
                },
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
