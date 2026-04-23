import { PrismaClient, RoomMemberRole, StudySessionSource, RoomVisibility } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.roomActivity.deleteMany();
  await prisma.activeTimer.deleteMany();
  await prisma.studySession.deleteMany();
  await prisma.roomMember.deleteMany();
  await prisma.room.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Password123', 12);

  // ---- Users ----
  const alice = await prisma.user.create({
    data: {
      name: 'Alice Silva',
      email: 'alice@example.com',
      username: 'alice',
      passwordHash,
      bio: 'Computer Science student passionate about algorithms',
      institution: 'USP',
      course: 'Computer Science',
    },
  });

  const bob = await prisma.user.create({
    data: {
      name: 'Bob Santos',
      email: 'bob@example.com',
      username: 'bob',
      passwordHash,
      bio: 'Math enthusiast',
      institution: 'UNICAMP',
      course: 'Mathematics',
    },
  });

  const carol = await prisma.user.create({
    data: {
      name: 'Carol Oliveira',
      email: 'carol@example.com',
      username: 'carol',
      passwordHash,
      institution: 'UFMG',
      course: 'Physics',
    },
  });

  console.log(`  ✅ Created ${3} users (alice, bob, carol) — password: Password123`);

  // ---- Room ----
  const inviteCode = crypto.randomBytes(8).toString('base64url').slice(0, 8).toUpperCase();

  const room = await prisma.room.create({
    data: {
      name: 'Study Group Alpha',
      description: 'A room for focused study sessions and weekly challenges',
      visibility: RoomVisibility.INVITE_ONLY,
      ownerId: alice.id,
      inviteCode,
    },
  });

  // Add members
  await prisma.roomMember.createMany({
    data: [
      { roomId: room.id, userId: alice.id, role: RoomMemberRole.OWNER },
      { roomId: room.id, userId: bob.id, role: RoomMemberRole.ADMIN },
      { roomId: room.id, userId: carol.id, role: RoomMemberRole.MEMBER },
    ],
  });

  console.log(`  ✅ Created room "${room.name}" (invite: ${inviteCode})`);

  // ---- Study Sessions ----
  const today = new Date();
  const daysAgo = (n: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - n);
    return d;
  };

  const sessionsData = [
    // Alice sessions
    { userId: alice.id, title: 'Algorithms Review', subject: 'Algorithms', source: StudySessionSource.MANUAL, durationSeconds: 3600, studyDate: daysAgo(0), roomId: room.id },
    { userId: alice.id, title: 'Data Structures', subject: 'Data Structures', source: StudySessionSource.TIMER, durationSeconds: 5400, studyDate: daysAgo(1), startedAt: daysAgo(1), endedAt: daysAgo(1), roomId: room.id },
    { userId: alice.id, title: 'Calculus', subject: 'Mathematics', source: StudySessionSource.MANUAL, durationSeconds: 2700, studyDate: daysAgo(2) },
    { userId: alice.id, title: 'Operating Systems', subject: 'OS', source: StudySessionSource.TIMER, durationSeconds: 4500, studyDate: daysAgo(3), startedAt: daysAgo(3), endedAt: daysAgo(3), roomId: room.id },

    // Bob sessions
    { userId: bob.id, title: 'Linear Algebra', subject: 'Mathematics', source: StudySessionSource.MANUAL, durationSeconds: 7200, studyDate: daysAgo(0), roomId: room.id },
    { userId: bob.id, title: 'Topology', subject: 'Mathematics', source: StudySessionSource.TIMER, durationSeconds: 3600, studyDate: daysAgo(1), startedAt: daysAgo(1), endedAt: daysAgo(1), roomId: room.id },
    { userId: bob.id, title: 'Number Theory', subject: 'Mathematics', source: StudySessionSource.MANUAL, durationSeconds: 5400, studyDate: daysAgo(2), roomId: room.id },

    // Carol sessions
    { userId: carol.id, title: 'Quantum Mechanics', subject: 'Physics', source: StudySessionSource.MANUAL, durationSeconds: 4800, studyDate: daysAgo(0), roomId: room.id },
    { userId: carol.id, title: 'Thermodynamics', subject: 'Physics', source: StudySessionSource.TIMER, durationSeconds: 3000, studyDate: daysAgo(1), startedAt: daysAgo(1), endedAt: daysAgo(1) },
  ];

  for (const s of sessionsData) {
    await prisma.studySession.create({ data: s });
  }

  console.log(`  ✅ Created ${sessionsData.length} study sessions`);

  // ---- Room Activities ----
  await prisma.roomActivity.createMany({
    data: [
      { roomId: room.id, userId: alice.id, type: 'MEMBER_JOINED', message: 'created and joined the room' },
      { roomId: room.id, userId: bob.id, type: 'MEMBER_JOINED', message: 'joined the room' },
      { roomId: room.id, userId: carol.id, type: 'MEMBER_JOINED', message: 'joined the room' },
      { roomId: room.id, userId: alice.id, type: 'MEMBER_PROMOTED', message: 'promoted bob to admin' },
    ],
  });

  console.log('  ✅ Created room activities');
  console.log('\n✨ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
