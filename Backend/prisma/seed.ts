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
        {
            username: "nrlatifahh",
            fullName: "Siti Nurlatifah",
            email: "nurlatifah@gmail.com",
            bio: "I love myself!",
            photoProfile: "https://i.imgur.com/SpIeXBO.jpeg"
        }
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

    const threadsData = [
        { content: "Just finished a great coding session! 🚀", image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&auto=format&fit=crop&q=60" },
        { content: "Does anyone know how to center a div? 😅", image: null },
        { content: "React 19 is looking amazing! 🔥", image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500&auto=format&fit=crop&q=60" },
        { content: "Coffee is my fuel ☕", image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&auto=format&fit=crop&q=60" },
        { content: "Building a social media app with the best stack!", image: null },
        { content: "Tailwind CSS makes styling so easy.", image: null },
        { content: "Bugs, bugs, everywhere... 🐛", image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500&auto=format&fit=crop&q=60" },
        { content: "Finally deployed my app! 🎉", image: null },
        { content: "Anyone up for a collab?", image: null },
        { content: "Good morning everyone! ☀️", image: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=500&auto=format&fit=crop&q=60" },
    ];

    for (const user of users) {
        // Each user creates 2 threads
        for (let j = 0; j < 2; j++) {
            const randomThread = threadsData[Math.floor(Math.random() * threadsData.length)];
            await prisma.thread.create({
                data: {
                    content: randomThread.content,
                    images: randomThread.image ? [randomThread.image] : [],
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
