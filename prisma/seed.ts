import { PrismaClient, Role, BorrowStatus, FineStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Clean existing records (in reverse relation order)
  await prisma.fine.deleteMany({});
  await prisma.borrowRecord.deleteMany({});
  await prisma.student.deleteMany({});
  await prisma.book.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("Cleared existing data.");

  // 1. Seed Users
  const adminUser = await prisma.user.create({
    data: {
      clerkId: "user_admin_mock_1",
      name: "Dr. Eleanor Vance",
      email: "eleanor.vance@apex.edu",
      role: Role.ADMIN,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80",
    },
  });

  const librarianUser = await prisma.user.create({
    data: {
      clerkId: "user_librarian_mock_1",
      name: "Marcus Thorne",
      email: "marcus.thorne@apex.edu",
      role: Role.LIBRARIAN,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80",
    },
  });

  const studentUser1 = await prisma.user.create({
    data: {
      clerkId: "user_student_mock_1",
      name: "Sophia Chen",
      email: "sophia.chen@apex.edu",
      role: Role.STUDENT,
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80",
    },
  });

  const studentUser2 = await prisma.user.create({
    data: {
      clerkId: "user_student_mock_2",
      name: "Liam Washington",
      email: "liam.washington@apex.edu",
      role: Role.STUDENT,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80",
    },
  });

  console.log("Seeded Users.");

  // 2. Seed Students
  const students = await Promise.all([
    prisma.student.create({
      data: {
        studentNumber: "STU-2024-001",
        fullName: "Sophia Chen",
        department: "Computer Science",
        email: "sophia.chen@apex.edu",
        phone: "+1 (555) 234-5678",
        userId: studentUser1.id,
      },
    }),
    prisma.student.create({
      data: {
        studentNumber: "STU-2024-002",
        fullName: "Liam Washington",
        department: "Electrical Engineering",
        email: "liam.washington@apex.edu",
        phone: "+1 (555) 345-6789",
        userId: studentUser2.id,
      },
    }),
    prisma.student.create({
      data: {
        studentNumber: "STU-2024-003",
        fullName: "Aria Montgomery",
        department: "Business Administration",
        email: "aria.montgomery@apex.edu",
        phone: "+1 (555) 456-7890",
      },
    }),
    prisma.student.create({
      data: {
        studentNumber: "STU-2024-004",
        fullName: "Noah Al-Mansoor",
        department: "Mechanical Engineering",
        email: "noah.almansoor@apex.edu",
        phone: "+1 (555) 567-8901",
      },
    }),
    prisma.student.create({
      data: {
        studentNumber: "STU-2024-005",
        fullName: "Emma Watson",
        department: "Literature & Arts",
        email: "emma.watson@apex.edu",
        phone: "+1 (555) 678-9012",
      },
    }),
    prisma.student.create({
      data: {
        studentNumber: "STU-2024-006",
        fullName: "Daniel Kim",
        department: "Computer Science",
        email: "daniel.kim@apex.edu",
        phone: "+1 (555) 789-0123",
      },
    }),
  ]);

  console.log("Seeded Students.");

  // 3. Seed Books
  const books = await Promise.all([
    prisma.book.create({
      data: {
        title: "Clean Architecture: A Craftsman's Guide to Software Structure",
        author: "Robert C. Martin",
        isbn: "978-0134494166",
        category: "Computer Science",
        publisher: "Prentice Hall",
        publicationYear: 2017,
        quantity: 5,
        coverImage: "https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&w=400&q=80",
        description: "By applying universal rules of software architecture, you can dramatically improve developer productivity.",
      },
    }),
    prisma.book.create({
      data: {
        title: "Design Patterns: Elements of Reusable Object-Oriented Software",
        author: "Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides",
        isbn: "978-0201633610",
        category: "Computer Science",
        publisher: "Addison-Wesley Professional",
        publicationYear: 1994,
        quantity: 4,
        coverImage: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80",
        description: "Capturing a wealth of experience about the design of object-oriented software, four top-notch designers present a catalog of simple solutions.",
      },
    }),
    prisma.book.create({
      data: {
        title: "Introduction to Algorithms, 4th Edition",
        author: "Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein",
        isbn: "978-0262046305",
        category: "Computer Science",
        publisher: "MIT Press",
        publicationYear: 2022,
        quantity: 6,
        coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80",
        description: "A comprehensive update of the leading algorithms text, with new material on matchings in bipartite graphs, online algorithms, machine learning, and other topics.",
      },
    }),
    prisma.book.create({
      data: {
        title: "Artificial Intelligence: A Modern Approach (4th Edition)",
        author: "Stuart Russell, Peter Norvig",
        isbn: "978-0134610993",
        category: "Computer Science",
        publisher: "Pearson",
        publicationYear: 2020,
        quantity: 3,
        coverImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=400&q=80",
        description: "The most comprehensive, up-to-date introduction to the theory and practice of artificial intelligence.",
      },
    }),
    prisma.book.create({
      data: {
        title: "Principles of Corporate Finance",
        author: "Richard Brealey, Stewart Myers, Franklin Allen",
        isbn: "978-1260013900",
        category: "Business Administration",
        publisher: "McGraw-Hill",
        publicationYear: 2019,
        quantity: 4,
        coverImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=80",
        description: "Describes the theory and practice of corporate finance with real-world financial decision-making problems.",
      },
    }),
    prisma.book.create({
      data: {
        title: "Engineering Mechanics: Statics & Dynamics",
        author: "Russell C. Hibbeler",
        isbn: "978-0133915426",
        category: "Mechanical Engineering",
        publisher: "Pearson",
        publicationYear: 2015,
        quantity: 5,
        coverImage: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80",
        description: "A proven approach to conceptual understanding and problem-solving skills in engineering mechanics.",
      },
    }),
    prisma.book.create({
      data: {
        title: "Microelectronic Circuits (8th Edition)",
        author: "Adel S. Sedra, Kenneth C. Smith, Tony Chan Carusone, Vincent Gaudet",
        isbn: "978-0190853464",
        category: "Electrical Engineering",
        publisher: "Oxford University Press",
        publicationYear: 2020,
        quantity: 3,
        coverImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80",
        description: "The gold standard of electrical engineering texts, thoroughly updated with the latest CMOS technology.",
      },
    }),
    prisma.book.create({
      data: {
        title: "The Norton Anthology of World Literature",
        author: "Martin Puchner, Suzanne Conklin Akbari",
        isbn: "978-0393602814",
        category: "Literature & Arts",
        publisher: "W. W. Norton & Company",
        publicationYear: 2018,
        quantity: 7,
        coverImage: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=400&q=80",
        description: "An unmatched collection of world literature spanning centuries and civilizations.",
      },
    }),
    prisma.book.create({
      data: {
        title: "Database System Concepts (7th Edition)",
        author: "Abraham Silberschatz, Henry F. Korth, S. Sudarshan",
        isbn: "978-0078022159",
        category: "Computer Science",
        publisher: "McGraw-Hill",
        publicationYear: 2019,
        quantity: 4,
        coverImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=400&q=80",
        description: "The fundamentals of database management systems, covering relational databases, SQL, indexing, and NoSQL systems.",
      },
    }),
  ]);

  console.log("Seeded Books.");

  // Helper dates
  const now = new Date();
  const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const daysAhead = (days: number) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  // 4. Seed BorrowRecords & Fines
  // Record 1: Currently borrowed on time
  await prisma.borrowRecord.create({
    data: {
      studentId: students[0].id, // Sophia Chen
      bookId: books[0].id, // Clean Architecture
      borrowDate: daysAgo(5),
      dueDate: daysAhead(9),
      status: BorrowStatus.BORROWED,
      notes: "Issued for Software Engineering Capstone",
    },
  });

  // Record 2: Currently overdue by 4 days
  const overdueRecord1 = await prisma.borrowRecord.create({
    data: {
      studentId: students[1].id, // Liam Washington
      bookId: books[2].id, // Intro to Algorithms
      borrowDate: daysAgo(18),
      dueDate: daysAgo(4),
      status: BorrowStatus.OVERDUE,
      notes: "First reminder notification sent via email",
    },
  });

  // Fine for Record 2: 4 days * $1.00 = $4.00 (UNPAID)
  await prisma.fine.create({
    data: {
      borrowRecordId: overdueRecord1.id,
      amount: 4.0,
      paidStatus: FineStatus.UNPAID,
    },
  });

  // Record 3: Currently overdue by 10 days
  const overdueRecord2 = await prisma.borrowRecord.create({
    data: {
      studentId: students[2].id, // Aria Montgomery
      bookId: books[4].id, // Corporate Finance
      borrowDate: daysAgo(24),
      dueDate: daysAgo(10),
      status: BorrowStatus.OVERDUE,
      notes: "Urgent overdue notice triggered",
    },
  });

  // Fine for Record 3: 10 days * $1.00 = $10.00 (UNPAID)
  await prisma.fine.create({
    data: {
      borrowRecordId: overdueRecord2.id,
      amount: 10.0,
      paidStatus: FineStatus.UNPAID,
    },
  });

  // Record 4: Returned successfully on time
  await prisma.borrowRecord.create({
    data: {
      studentId: students[3].id, // Noah Al-Mansoor
      bookId: books[5].id, // Engineering Mechanics
      borrowDate: daysAgo(20),
      dueDate: daysAgo(6),
      returnDate: daysAgo(8),
      status: BorrowStatus.RETURNED,
      notes: "Returned in excellent physical condition",
    },
  });

  // Record 5: Returned late, fine paid
  const returnedWithPaidFine = await prisma.borrowRecord.create({
    data: {
      studentId: students[4].id, // Emma Watson
      bookId: books[7].id, // Norton Anthology
      borrowDate: daysAgo(30),
      dueDate: daysAgo(16),
      returnDate: daysAgo(11),
      status: BorrowStatus.RETURNED,
      notes: "Returned 5 days overdue. Fine collected at main desk.",
    },
  });

  await prisma.fine.create({
    data: {
      borrowRecordId: returnedWithPaidFine.id,
      amount: 5.0,
      paidStatus: FineStatus.PAID,
      paidAt: daysAgo(11),
      paymentMethod: "Credit Card / Stripe",
    },
  });

  // Record 6: Another active borrow
  await prisma.borrowRecord.create({
    data: {
      studentId: students[5].id, // Daniel Kim
      bookId: books[1].id, // Design Patterns
      borrowDate: daysAgo(2),
      dueDate: daysAhead(12),
      status: BorrowStatus.BORROWED,
      notes: "Object Oriented Design seminar preparation",
    },
  });

  console.log("Seeded Borrow Records and Fines.");
  console.log("✅ Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error while seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
