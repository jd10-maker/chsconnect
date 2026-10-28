import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Helper: Ensure Data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial default database state
function getInitialDb() {
  const now = new Date();
  const daysAgo = (days: number) => {
    const d = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return d.toISOString().split('T')[0];
  };

  return {
    settings: {
      schoolName: 'Cathedral High School',
      schoolMotto: 'Honor, Truth, Virtue',
      schoolDomain: 'cathedral.edu',
      requireSchoolEmail: false, // allow Gmail and school email
      facultyVerificationCode: 'CHS-2026',
      holdingPeriodDays: 15,
      collectionPointName: 'P.T. Department',
      collectionPointLocation: 'P.T. Department, School Ground',
      collectionHours: 'Mon - Fri: 12:30 PM - 1:30 PM (Recess) & 3:30 PM - 4:15 PM (School Ground)',
      availableClasses: [
        'Grade 9A',
        'Grade 9B',
        'Grade 10A',
        'Grade 10B',
        'Grade 11A',
        'Grade 11B',
        'Grade 12A',
        'Grade 12B'
      ],
      categories: ['Watches', 'Pouches', 'Bags', 'Water Bottles', 'Other'],
      donationApprovalRequired: true,
      allowAlumniDonations: true,
    },
    users: [
      {
        id: 'usr-teacher-1',
        email: 's.jenkins@cathedral.edu',
        name: 'Ms. Sarah Jenkins',
        role: 'teacher',
        password: 'Jenkins#PT26',
        department: 'Senior P.T. Instructor & Sports Master',
      },
      {
        id: 'usr-teacher-2',
        email: 'd.carter@cathedral.edu',
        name: 'Mr. David Carter',
        role: 'teacher',
        password: 'Carter!Sci88',
        department: 'Senior Physics & Discipline In-Charge',
      },
      {
        id: 'usr-teacher-3',
        email: 'r.thorne@cathedral.edu',
        name: 'Mrs. Rebecca Thorne',
        role: 'teacher',
        password: 'Thorne$Bio26',
        department: 'Life Sciences & Student Welfare',
      },
      {
        id: 'usr-student-1',
        email: 'jaedonpj13@gmail.com',
        name: 'Jaedon P.',
        role: 'student',
        currentClass: 'Grade 10A',
        isVerifiedStudent: true,
      },
      {
        id: 'usr-student-2',
        email: 'ananya.rao@gmail.com',
        name: 'Ananya Rao',
        role: 'student',
        currentClass: 'Grade 9B',
        isVerifiedStudent: true,
      },
      {
        id: 'usr-student-3',
        email: 'liam.chen@cathedral.edu',
        name: 'Liam Chen',
        role: 'student',
        currentClass: 'Grade 12A',
        isVerifiedStudent: true,
      }
    ],
    foundItems: [
      {
        id: 'item-101',
        name: 'Silver Casio Vintage Digital Watch',
        category: 'Watches',
        photos: [
          'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80'
        ],
        description: 'Classic silver stainless steel digital watch with stopwatch display. In working condition.',
        dateFound: daysAgo(3),
        locationFound: 'School Football Ground bleachers',
        storageLocation: 'P.T. Department Office (School Ground), Locker Box #4',
        privateIdentifyingDetails: 'Small scratch on right bottom bezel; alarm set for 07:15 AM; strap link clasp has small etched star symbol on the back.',
        reportedByTeacherEmail: 's.jenkins@cathedral.edu',
        reportedByTeacherName: 'Ms. Sarah Jenkins',
        status: 'Claim Pending',
        createdAt: daysAgo(3) + 'T10:15:00Z',
        updatedAt: daysAgo(1) + 'T14:20:00Z',
      },
      {
        id: 'item-102',
        name: 'Navy Blue Canvas Zip Pouch',
        category: 'Pouches',
        photos: [
          'https://images.unsplash.com/photo-1585336261026-681b671a5c68?auto=format&fit=crop&w=800&q=80'
        ],
        description: 'Dark blue zipper pencil pouch with two side compartments.',
        dateFound: daysAgo(6),
        locationFound: 'Science Lab 204, 3rd bench',
        storageLocation: 'P.T. Department (School Ground), Storage Rack A',
        privateIdentifyingDetails: 'Contains three Staedtler 0.5mm lead tubes, one silver metal ruler with initials "ALM" scratched on the metric side.',
        reportedByTeacherEmail: 'd.carter@cathedral.edu',
        reportedByTeacherName: 'Mr. David Carter',
        status: 'Stored / Available',
        createdAt: daysAgo(6) + 'T11:30:00Z',
        updatedAt: daysAgo(6) + 'T11:30:00Z',
      },
      {
        id: 'item-103',
        name: 'Black Nike Sport Duffel Bag',
        category: 'Bags',
        photos: [
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80'
        ],
        description: 'Black medium duffel bag with white swoosh, dual handle and shoulder strap.',
        dateFound: daysAgo(8),
        locationFound: 'School Ground Pavilion Bench',
        storageLocation: 'P.T. Department Office (School Ground), Cupboard C',
        privateIdentifyingDetails: 'Inside side zip contains a pair of blue training goggles and a locker lock with code combination 14-28-06.',
        reportedByTeacherEmail: 's.jenkins@cathedral.edu',
        reportedByTeacherName: 'Ms. Sarah Jenkins',
        status: 'Stored / Available',
        createdAt: daysAgo(8) + 'T16:00:00Z',
        updatedAt: daysAgo(8) + 'T16:00:00Z',
      },
      {
        id: 'item-104',
        name: 'Olive Green Hydro Flask 32oz',
        category: 'Water Bottles',
        photos: [
          'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80'
        ],
        description: 'Wide mouth 32oz insulated bottle with flex cap.',
        dateFound: daysAgo(18), // > 15 days!
        locationFound: 'Cricket Pitch Boundary, School Ground',
        storageLocation: 'P.T. Department Unclaimed Shelf #2 (School Ground)',
        privateIdentifyingDetails: 'Circular NASA sticker on side; dent on bottom edge from dropping; blue paracord loop on handle.',
        reportedByTeacherEmail: 's.jenkins@cathedral.edu',
        reportedByTeacherName: 'Ms. Sarah Jenkins',
        status: 'Unclaimed (15+ Days)',
        createdAt: daysAgo(18) + 'T09:00:00Z',
        updatedAt: daysAgo(3) + 'T09:00:00Z',
      },
      {
        id: 'item-105',
        name: 'Texas Instruments TI-84 Plus CE Calculator',
        category: 'Other',
        customCategory: 'Electronics & Calculators',
        photos: [
          'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=800&q=80'
        ],
        description: 'Blue graphing calculator with slide cover.',
        dateFound: daysAgo(2),
        locationFound: 'School Library Reading Room',
        storageLocation: 'P.T. Department Office (School Ground), Secure Drawer A',
        privateIdentifyingDetails: 'Slide case has yellow smiley sticker; battery door interior has taped note with AP Chem formula.',
        reportedByTeacherEmail: 'd.carter@cathedral.edu',
        reportedByTeacherName: 'Mr. David Carter',
        status: 'Stored / Available',
        createdAt: daysAgo(2) + 'T15:20:00Z',
        updatedAt: daysAgo(2) + 'T15:20:00Z',
      }
    ],
    lostReports: [
      {
        id: 'rep-201',
        studentId: 'usr-student-2',
        studentName: 'Ananya Rao',
        studentEmail: 'ananya.rao@gmail.com',
        studentClass: 'Grade 9B',
        itemName: 'Silver Digital Casio Watch',
        category: 'Watches',
        description: 'Lost my grandfather vintage style Casio digital watch on the football ground bleachers during P.T. hour.',
        dateLost: daysAgo(3),
        locationLost: 'School Football Ground bleachers',
        distinctiveFeatures: 'Has small scratch near the 2 oclock position, alarm set for early morning.',
        status: 'Potential Match Found',
        createdAt: daysAgo(2) + 'T08:30:00Z',
        updatedAt: daysAgo(2) + 'T08:30:00Z',
      }
    ],
    claims: [
      {
        id: 'clm-301',
        referenceCode: 'CLM-2026-1049',
        foundItemId: 'item-101',
        foundItemName: 'Silver Casio Vintage Digital Watch',
        studentId: 'usr-student-2',
        studentName: 'Ananya Rao',
        studentEmail: 'ananya.rao@gmail.com',
        studentClass: 'Grade 9B',
        description: 'I lost this watch right after football practice on the school ground.',
        privateDetailsEvidence: 'There is a scratch on the bottom right corner of the silver rim. The strap buckle has a faint hand-etched star mark my brother made, and the daily alarm goes off at 7:15 AM.',
        contactNumber: '555-0192',
        status: 'Pending Review',
        evidenceHistory: [
          {
            sender: 'student',
            message: 'Submitted initial claim with proof of engraved star and 7:15 AM alarm.',
            timestamp: daysAgo(1) + 'T14:20:00Z',
          }
        ],
        createdAt: daysAgo(1) + 'T14:20:00Z',
        updatedAt: daysAgo(1) + 'T14:20:00Z',
      }
    ],
    unclaimedRequests: [
      {
        id: 'uncl-401',
        referenceCode: 'RED-2026-0814',
        foundItemId: 'item-104',
        foundItemName: 'Olive Green Hydro Flask 32oz',
        studentId: 'usr-student-1',
        studentName: 'Jaedon P.',
        studentEmail: 'jaedonpj13@gmail.com',
        studentClass: 'Grade 10A',
        reason: 'Our relay athletics squad needs a shared backup water flask during school ground training.',
        status: 'Pending Review',
        createdAt: daysAgo(1) + 'T11:00:00Z',
      }
    ],
    donations: [
      {
        id: 'don-501',
        title: 'AP Calculus BC & AB Official Prep Guide (2025 Edition)',
        category: 'Books',
        photos: [
          'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'
        ],
        description: 'Comprehensive review guide with 4 full-length practice tests. Clean pages, no pencil marks.',
        condition: 'Like New',
        donorType: 'Staff',
        donorName: 'Mr. David Carter',
        donorEmail: 'd.carter@cathedral.edu',
        isAnonymous: false,
        status: 'Available',
        eligibilityRequirements: 'Open to Grade 10-12 students taking advanced mathematics.',
        collectionInstructions: 'Collect from P.T. Department Office, School Ground with Student ID.',
        createdAt: daysAgo(5) + 'T10:00:00Z',
        updatedAt: daysAgo(5) + 'T10:00:00Z',
      },
      {
        id: 'don-502',
        title: 'Cathedral Varsity P.T. Track Jacket (Medium)',
        category: 'Uniforms & PE Gear',
        photos: [
          'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80'
        ],
        description: 'Official Cathedral High School navy blue and gold lightweight water-resistant running jacket. Washed and sanitized.',
        condition: 'Like New',
        donorType: 'Former Student / Alumni',
        donorName: 'Cathedral Alumni Class of 2024',
        donorEmail: 'alumni@cathedral.edu',
        isAnonymous: true,
        status: 'Available',
        eligibilityRequirements: 'Priority given to student athletes or students in need of school ground winter gear.',
        collectionInstructions: 'Pick up from P.T. Department, School Ground.',
        createdAt: daysAgo(7) + 'T13:30:00Z',
        updatedAt: daysAgo(7) + 'T13:30:00Z',
      },
      {
        id: 'don-503',
        title: 'Art Studio Pro Drawing Set (12 Graphite Pencils + Blending Stumps)',
        category: 'Stationery',
        photos: [
          'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=800&q=80'
        ],
        description: 'Complete metal tin set with 2H through 8B pencils, eraser, and blending tortillons.',
        condition: 'Brand New',
        donorType: 'Student',
        donorName: 'Liam Chen (Grade 12)',
        donorEmail: 'liam.chen@cathedral.edu',
        isAnonymous: false,
        status: 'Available',
        eligibilityRequirements: 'Any student taking Art or Technical Drawing.',
        collectionInstructions: 'Collect at P.T. Department Office, School Ground during recess.',
        createdAt: daysAgo(4) + 'T09:15:00Z',
        updatedAt: daysAgo(4) + 'T09:15:00Z',
      }
    ],
    donationRequests: [
      {
        id: 'req-601',
        referenceCode: 'DON-2026-9021',
        donationId: 'don-501',
        donationTitle: 'AP Calculus BC & AB Official Prep Guide (2025 Edition)',
        studentId: 'usr-student-1',
        studentName: 'Jaedon P.',
        studentEmail: 'jaedonpj13@gmail.com',
        studentClass: 'Grade 10A',
        reason: 'Preparing early for advanced math placement exam next semester.',
        status: 'Pending',
        createdAt: daysAgo(1) + 'T16:45:00Z',
      }
    ],
    notifications: [
      {
        id: 'notif-1',
        recipientEmail: 'jaedonpj13@gmail.com',
        title: 'Donation Request Submitted',
        message: 'Your request for "AP Calculus BC Official Prep Guide" was received and is pending teacher approval.',
        type: 'info',
        linkTarget: 'donations',
        isRead: false,
        createdAt: daysAgo(1) + 'T16:45:00Z',
      },
      {
        id: 'notif-2',
        recipientEmail: 'alex.miller@gmail.com',
        title: 'Ownership Claim Under Review',
        message: 'Your claim for Silver Casio Vintage Digital Watch (Ref #CLM-2026-1049) is being reviewed by Ms. Sarah Jenkins.',
        type: 'info',
        linkTarget: 'claims',
        isRead: false,
        createdAt: daysAgo(1) + 'T14:20:00Z',
      },
      {
        id: 'notif-3',
        recipientEmail: 'teacher-all',
        title: 'Item Reached 15-Day Unclaimed Threshold',
        message: 'Olive Green Hydro Flask 32oz (ID: item-104) has reached 18 days in storage. Ready for unclaimed review.',
        type: 'alert',
        linkTarget: 'pe-desk',
        isRead: false,
        createdAt: daysAgo(3) + 'T09:00:00Z',
      }
    ],
    auditLogs: [
      {
        id: 'aud-1',
        action: 'System Initialized',
        actorEmail: 'system@chs.edu',
        actorName: 'System Core',
        actorRole: 'admin',
        targetType: 'settings',
        targetId: 'system',
        details: 'Lost & Found, P.E. Dept Handover and Donations repository initialized.',
        timestamp: daysAgo(18) + 'T08:00:00Z',
      },
      {
        id: 'aud-2',
        action: 'Found Item Uploaded',
        actorEmail: 'teacher@chs.edu',
        actorName: 'Ms. Sarah Jenkins',
        actorRole: 'teacher',
        targetType: 'found_item',
        targetId: 'item-101',
        details: 'Uploaded Silver Casio Vintage Digital Watch with private evidence markings.',
        timestamp: daysAgo(3) + 'T10:15:00Z',
      }
    ]
  };
}

// Database Read/Write
function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initial = getInitialDb();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading DB, falling back to default:', err);
    return getInitialDb();
  }
}

function writeDb(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing DB:', err);
  }
}

// Compute days unclaimed helper
function calculateDaysUnclaimed(dateStr: string): number {
  const d = new Date(dateStr);
  const now = new Date();
  const diffTime = Math.max(0, now.getTime() - d.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

// Update day counter dynamically on all found items
function getProcessedFoundItems(items: any[], holdingDays: number) {
  return items.map((item) => {
    const days = calculateDaysUnclaimed(item.dateFound);
    let status = item.status;
    if (status === 'Stored / Available' && days >= holdingDays) {
      status = 'Unclaimed (15+ Days)';
    }
    return {
      ...item,
      daysUnclaimed: days,
      status,
    };
  });
}

// Helper: Log audit trail
function addAuditLog(
  db: any,
  action: string,
  actor: { email: string; name: string; role: any },
  targetType: any,
  targetId: string,
  details: string
) {
  const log = {
    id: 'aud-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    action,
    actorEmail: actor.email,
    actorName: actor.name,
    actorRole: actor.role,
    targetType,
    targetId,
    details,
    timestamp: new Date().toISOString(),
  };
  db.auditLogs.unshift(log);
}

// Helper: Create notification
function createNotification(
  db: any,
  recipientEmail: string,
  title: string,
  message: string,
  type: 'info' | 'success' | 'warning' | 'alert' = 'info',
  linkTarget?: string
) {
  const notif = {
    id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    recipientEmail,
    title,
    message,
    type,
    linkTarget,
    isRead: false,
    createdAt: new Date().toISOString(),
  };
  db.notifications.unshift(notif);
}

// In-memory token sessions
const activeSessions: Record<string, any> = {};

// Auth middleware
function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    (req as any).user = null;
    return next();
  }
  const token = authHeader.split(' ')[1];
  const session = activeSessions[token];
  if (session) {
    (req as any).user = session;
  } else {
    (req as any).user = null;
  }
  next();
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!(req as any).user) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }
  next();
}

function requireTeacher(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
    return res.status(403).json({ error: 'Access denied. Authorized teacher credentials required.' });
  }
  next();
}

app.use(authenticate);

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

// Student Login / Registration
app.post('/api/auth/student-login', (req: Request, res: Response) => {
  const { email, currentClass, name } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }
  if (!currentClass) {
    return res.status(400).json({ error: 'Please select your current class.' });
  }

  const db = readDb();
  const normalizedEmail = email.trim().toLowerCase();

  // Check school domain policy if enabled
  if (db.settings.requireSchoolEmail && db.settings.schoolDomain) {
    if (!normalizedEmail.endsWith('@' + db.settings.schoolDomain.toLowerCase())) {
      return res.status(400).json({
        error: `Only verified school email addresses (@${db.settings.schoolDomain}) are permitted.`,
      });
    }
  }

  let user = db.users.find((u: any) => u.email.toLowerCase() === normalizedEmail);
  if (!user) {
    // Create new student
    const studentName = name && name.trim() ? name.trim() : normalizedEmail.split('@')[0];
    user = {
      id: 'usr-' + Date.now(),
      email: normalizedEmail,
      name: studentName,
      role: 'student',
      currentClass,
      isVerifiedStudent: true,
    };
    db.users.push(user);
    writeDb(db);
  } else {
    // Update existing student class if provided
    user.currentClass = currentClass;
    if (name && name.trim() && user.name.includes('@')) {
      user.name = name.trim();
    }
    writeDb(db);
  }

  const token = 'token-st-' + crypto.randomBytes(16).toString('hex');
  activeSessions[token] = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    currentClass: user.currentClass,
    isVerifiedStudent: user.isVerifiedStudent,
  };

  res.json({ token, user: activeSessions[token] });
});

// Update Student Class (without affecting other accounts or teacher views)
app.post('/api/auth/student-update-class', requireAuth, (req: Request, res: Response) => {
  const { currentClass } = req.body;
  const currentUser = (req as any).user;
  if (!currentClass) {
    return res.status(400).json({ error: 'Class must be specified.' });
  }

  const db = readDb();
  const user = db.users.find((u: any) => u.id === currentUser.id);
  if (user) {
    user.currentClass = currentClass;
    writeDb(db);
  }
  currentUser.currentClass = currentClass;

  res.json({ success: true, user: currentUser });
});

// Teacher Login
app.post('/api/auth/teacher-login', (req: Request, res: Response) => {
  const { email, password, facultyCode } = req.body;
  if (!email || !password || !facultyCode) {
    return res.status(400).json({ error: 'Email, password, and faculty verification code are required.' });
  }

  const db = readDb();
  const normalizedEmail = email.trim().toLowerCase();

  // Verify Faculty Code on backend
  if (facultyCode.trim() !== db.settings.facultyVerificationCode) {
    return res.status(401).json({ error: 'Invalid faculty verification code. Please check with the school administrator.' });
  }

  const teacher = db.users.find(
    (u: any) => u.email.toLowerCase() === normalizedEmail && (u.role === 'teacher' || u.role === 'admin')
  );

  if (!teacher || teacher.password !== password) {
    return res.status(401).json({ error: 'Invalid teacher email or password.' });
  }

  const token = 'token-tch-' + crypto.randomBytes(16).toString('hex');
  const userProfile = {
    id: teacher.id,
    email: teacher.email,
    name: teacher.name,
    role: teacher.role,
    department: teacher.department,
  };
  activeSessions[token] = userProfile;

  addAuditLog(db, 'Teacher Login', userProfile, 'settings', teacher.id, 'Teacher logged in to faculty portal.');
  writeDb(db);

  res.json({ token, user: userProfile });
});

// Teacher Self-Registration with Faculty Verification Code
app.post('/api/auth/teacher-register', (req: Request, res: Response) => {
  const { name, email, password, department, facultyCode } = req.body;
  if (!name || !email || !password || !facultyCode) {
    return res.status(400).json({ error: 'Full name, email, password, and faculty verification code are required.' });
  }

  const db = readDb();
  const normalizedEmail = email.trim().toLowerCase();

  // Validate Faculty Code
  if (facultyCode.trim() !== db.settings.facultyVerificationCode) {
    return res.status(401).json({ error: 'Invalid faculty verification code. Please consult the school administration.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  const existing = db.users.find((u: any) => u.email.toLowerCase() === normalizedEmail);
  if (existing) {
    return res.status(400).json({ error: 'An account with this email address already exists. Please log in.' });
  }

  const newTeacher = {
    id: 'usr-teacher-' + Date.now(),
    email: normalizedEmail,
    name: name.trim(),
    role: 'teacher',
    password: password,
    department: department && department.trim() ? department.trim() : 'Faculty Member',
  };

  db.users.push(newTeacher);

  const token = 'token-tch-' + crypto.randomBytes(16).toString('hex');
  const userProfile = {
    id: newTeacher.id,
    email: newTeacher.email,
    name: newTeacher.name,
    role: newTeacher.role,
    department: newTeacher.department,
  };
  activeSessions[token] = userProfile;

  addAuditLog(db, 'Faculty Account Registered', userProfile, 'settings', newTeacher.id, `New teacher account created for ${newTeacher.name} (${newTeacher.department}).`);
  writeDb(db);

  res.status(201).json({ token, user: userProfile });
});

// Current User Info
app.get('/api/auth/me', (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user) {
    return res.json({ user: null });
  }
  res.json({ user });
});

// Logout
app.post('/api/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    delete activeSessions[token];
  }
  res.json({ success: true });
});

// ==========================================
// SETTINGS & METADATA ROUTES
// ==========================================

app.get('/api/admin/settings', (req: Request, res: Response) => {
  const db = readDb();
  const user = (req as any).user;
  const isTeacher = user && (user.role === 'teacher' || user.role === 'admin');

  // Do not expose faculty verification code to students or unauthenticated users
  const publicSettings = { ...db.settings };
  if (!isTeacher) {
    delete (publicSettings as any).facultyVerificationCode;
  }
  res.json(publicSettings);
});

app.put('/api/admin/settings', requireTeacher, (req: Request, res: Response) => {
  const user = (req as any).user;
  const updates = req.body;
  const db = readDb();

  db.settings = {
    ...db.settings,
    ...updates,
    holdingPeriodDays: Number(updates.holdingPeriodDays) || 15,
  };

  addAuditLog(db, 'Settings Updated', user, 'settings', 'config', 'School administrator settings modified.');
  writeDb(db);

  res.json({ success: true, settings: db.settings });
});

// Audit Logs (Teacher only)
app.get('/api/admin/audit-logs', requireTeacher, (req: Request, res: Response) => {
  const db = readDb();
  res.json(db.auditLogs || []);
});

// ==========================================
// FOUND ITEMS (LOST & FOUND)
// ==========================================

// Browse found items (Students never see private identifying details or exact storage bins)
app.get('/api/found-items', (req: Request, res: Response) => {
  const db = readDb();
  const user = (req as any).user;
  const isTeacher = user && (user.role === 'teacher' || user.role === 'admin');

  const { search, category, location, status, daysFilter } = req.query;
  let items = getProcessedFoundItems(db.foundItems || [], db.settings.holdingPeriodDays);

  if (category && category !== 'All') {
    items = items.filter((i) => i.category === category);
  }

  if (status && status !== 'All') {
    items = items.filter((i) => i.status === status);
  }

  if (location && typeof location === 'string' && location.trim()) {
    items = items.filter((i) => i.locationFound.toLowerCase().includes(location.toLowerCase()));
  }

  if (search && typeof search === 'string' && search.trim()) {
    const q = search.toLowerCase();
    items = items.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.locationFound.toLowerCase().includes(q) ||
        (i.customCategory && i.customCategory.toLowerCase().includes(q))
    );
  }

  if (daysFilter === 'over15') {
    items = items.filter((i) => i.daysUnclaimed >= db.settings.holdingPeriodDays);
  } else if (daysFilter === 'under7') {
    items = items.filter((i) => i.daysUnclaimed <= 7);
  }

  // Sanitize for students & public: strip private identifying details and exact storage shelves
  const sanitizedItems = items.map((item) => {
    if (isTeacher) {
      return item;
    }
    const { privateIdentifyingDetails, storageLocation, ...safeFields } = item;
    return {
      ...safeFields,
      storageLocation: 'Held at P.E. Dept Collection Point',
    };
  });

  res.json(sanitizedItems);
});

// Get single found item
app.get('/api/found-items/:id', (req: Request, res: Response) => {
  const db = readDb();
  const user = (req as any).user;
  const isTeacher = user && (user.role === 'teacher' || user.role === 'admin');

  const items = getProcessedFoundItems(db.foundItems || [], db.settings.holdingPeriodDays);
  const item = items.find((i) => i.id === req.params.id);

  if (!item) {
    return res.status(404).json({ error: 'Item not found.' });
  }

  if (!isTeacher) {
    const { privateIdentifyingDetails, storageLocation, ...safeFields } = item;
    return res.json({
      ...safeFields,
      storageLocation: 'Held at P.E. Dept Collection Point',
    });
  }

  res.json(item);
});

// Teacher creates found item
app.post('/api/found-items', requireTeacher, (req: Request, res: Response) => {
  const user = (req as any).user;
  const {
    name,
    category,
    customCategory,
    photos,
    description,
    dateFound,
    locationFound,
    storageLocation,
    privateIdentifyingDetails,
  } = req.body;

  if (!name || !category || !description || !dateFound || !locationFound || !storageLocation) {
    return res.status(400).json({ error: 'Please provide all required fields including storage location.' });
  }

  if (!privateIdentifyingDetails || privateIdentifyingDetails.trim().length < 5) {
    return res.status(400).json({
      error: 'Private identifying details are required for ownership verification (e.g. scratch, serial, markings).',
    });
  }

  const db = readDb();
  const newItem = {
    id: 'item-' + Date.now(),
    name: name.trim(),
    category,
    customCategory: category === 'Other' ? customCategory : undefined,
    photos: Array.isArray(photos) && photos.length > 0 ? photos : ['https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80'],
    description: description.trim(),
    dateFound,
    locationFound: locationFound.trim(),
    storageLocation: storageLocation.trim(),
    privateIdentifyingDetails: privateIdentifyingDetails.trim(),
    reportedByTeacherEmail: user.email,
    reportedByTeacherName: user.name,
    status: 'Stored / Available',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.foundItems.unshift(newItem);

  addAuditLog(
    db,
    'Found Item Published',
    user,
    'found_item',
    newItem.id,
    `Added "${newItem.name}" in category ${newItem.category} (Stored: ${newItem.storageLocation}).`
  );

  // Check if any open student lost reports match this newly found item!
  const keywords = newItem.name.toLowerCase().split(/\s+/).filter((w: string) => w.length > 2);
  (db.lostReports || []).forEach((rep: any) => {
    if (rep.status === 'Open' && (rep.category === newItem.category || newItem.category === 'Other')) {
      const matchKeywords = keywords.some((k: string) => rep.itemName.toLowerCase().includes(k) || rep.description.toLowerCase().includes(k));
      if (matchKeywords) {
        rep.status = 'Potential Match Found';
        createNotification(
          db,
          rep.studentEmail,
          'Potential Match Found!',
          `A teacher uploaded a found item ("${newItem.name}") that matches your reported lost item ("${rep.itemName}"). Check Lost & Found to claim.`,
          'info',
          'lost-found'
        );
      }
    }
  });

  writeDb(db);

  res.status(201).json(newItem);
});

// Teacher updates found item
app.put('/api/found-items/:id', requireTeacher, (req: Request, res: Response) => {
  const user = (req as any).user;
  const db = readDb();
  const index = db.foundItems.findIndex((i: any) => i.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Item not found.' });
  }

  const existing = db.foundItems[index];
  const updated = {
    ...existing,
    ...req.body,
    updatedAt: new Date().toISOString(),
  };

  db.foundItems[index] = updated;
  addAuditLog(db, 'Found Item Updated', user, 'found_item', updated.id, `Updated details for "${updated.name}".`);
  writeDb(db);

  res.json(updated);
});

// Teacher deletes found item
app.delete('/api/found-items/:id', requireTeacher, (req: Request, res: Response) => {
  const user = (req as any).user;
  const db = readDb();
  const item = db.foundItems.find((i: any) => i.id === req.params.id);

  if (!item) {
    return res.status(404).json({ error: 'Item not found.' });
  }

  db.foundItems = db.foundItems.filter((i: any) => i.id !== req.params.id);
  addAuditLog(db, 'Found Item Removed', user, 'found_item', item.id, `Removed found item "${item.name}".`);
  writeDb(db);

  res.json({ success: true });
});

// ==========================================
// STUDENT LOST-ITEM REPORTS
// ==========================================

// Student submits lost report
app.post('/api/lost-reports', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const {
    itemName,
    category,
    customCategory,
    description,
    dateLost,
    locationLost,
    photo,
    distinctiveFeatures,
    additionalNotes,
  } = req.body;

  if (!itemName || !category || !description || !dateLost || !locationLost || !distinctiveFeatures) {
    return res.status(400).json({ error: 'Please fill in all required fields including distinctive features.' });
  }

  const db = readDb();
  const newReport = {
    id: 'rep-' + Date.now(),
    studentId: user.id,
    studentName: user.name,
    studentEmail: user.email,
    studentClass: user.currentClass || 'Unassigned',
    itemName: itemName.trim(),
    category,
    customCategory: category === 'Other' ? customCategory : undefined,
    description: description.trim(),
    dateLost,
    locationLost: locationLost.trim(),
    photo: photo || '',
    distinctiveFeatures: distinctiveFeatures.trim(),
    additionalNotes: additionalNotes ? additionalNotes.trim() : '',
    status: 'Open',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.lostReports = db.lostReports || [];
  db.lostReports.unshift(newReport);

  // Check matching found items immediately
  const keywords = newReport.itemName.toLowerCase().split(/\s+/).filter((w: string) => w.length > 2);
  const potentialMatches = (db.foundItems || []).filter((found: any) => {
    if (found.status === 'Claimed / Collected' || found.status === 'Disposed') return false;
    const sameCat = found.category === newReport.category;
    const matchWord = keywords.some((k: string) => found.name.toLowerCase().includes(k) || found.description.toLowerCase().includes(k));
    return sameCat || matchWord;
  });

  if (potentialMatches.length > 0) {
    newReport.status = 'Potential Match Found';
    createNotification(
      db,
      user.email,
      'Potential Match Found',
      `We found ${potentialMatches.length} existing found items matching your lost report "${newReport.itemName}".`,
      'info',
      'lost-found'
    );
  }

  writeDb(db);
  res.status(201).json(newReport);
});

// Student's own lost reports
app.get('/api/lost-reports/my', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const db = readDb();
  const reports = (db.lostReports || []).filter((r: any) => r.studentEmail.toLowerCase() === user.email.toLowerCase());
  res.json(reports);
});

// Teacher views all lost reports
app.get('/api/lost-reports', requireTeacher, (req: Request, res: Response) => {
  const db = readDb();
  res.json(db.lostReports || []);
});

// Update lost report
app.put('/api/lost-reports/:id', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const db = readDb();
  const index = (db.lostReports || []).findIndex((r: any) => r.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Report not found.' });
  }

  const existing = db.lostReports[index];
  // Only student who created it or teacher can update
  if (user.role === 'student' && existing.studentEmail.toLowerCase() !== user.email.toLowerCase()) {
    return res.status(403).json({ error: 'Cannot modify another student’s report.' });
  }

  const updated = {
    ...existing,
    ...req.body,
    updatedAt: new Date().toISOString(),
  };

  db.lostReports[index] = updated;
  writeDb(db);

  res.json(updated);
});

// Find matching items for a lost report
app.get('/api/lost-reports/:id/matches', requireAuth, (req: Request, res: Response) => {
  const db = readDb();
  const report = (db.lostReports || []).find((r: any) => r.id === req.params.id);
  if (!report) {
    return res.status(404).json({ error: 'Report not found.' });
  }

  const user = (req as any).user;
  const isTeacher = user && (user.role === 'teacher' || user.role === 'admin');

  const keywords = report.itemName.toLowerCase().split(/\s+/).filter((w: string) => w.length > 2);
  const items = getProcessedFoundItems(db.foundItems || [], db.settings.holdingPeriodDays);

  const matches = items
    .filter((found: any) => found.status !== 'Claimed / Collected' && found.status !== 'Disposed')
    .map((found: any) => {
      let score = 0;
      if (found.category === report.category) score += 40;
      keywords.forEach((k: string) => {
        if (found.name.toLowerCase().includes(k)) score += 30;
        if (found.description.toLowerCase().includes(k)) score += 15;
      });
      return { item: found, score };
    })
    .filter((m: any) => m.score >= 25)
    .sort((a: any, b: any) => b.score - a.score)
    .map((m: any) => {
      if (!isTeacher) {
        const { privateIdentifyingDetails, storageLocation, ...safeFields } = m.item;
        return safeFields;
      }
      return m.item;
    });

  res.json(matches);
});

// ==========================================
// OWNERSHIP CLAIMS & VERIFICATION
// ==========================================

// Student submits ownership claim
app.post('/api/claims', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { foundItemId, description, privateDetailsEvidence, photoProof, contactNumber } = req.body;

  if (!foundItemId || !privateDetailsEvidence || privateDetailsEvidence.trim().length < 5) {
    return res.status(400).json({
      error: 'Please describe specific identifying evidence (e.g. unique marks, internal contents, serial numbers).',
    });
  }

  const db = readDb();
  const item = (db.foundItems || []).find((i: any) => i.id === foundItemId);

  if (!item) {
    return res.status(404).json({ error: 'Item not found.' });
  }

  if (item.status === 'Claimed / Collected') {
    return res.status(400).json({ error: 'This item has already been collected and verified by its owner.' });
  }

  // Generate Reference Code
  const refCode = 'CLM-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);

  const newClaim = {
    id: 'clm-' + Date.now(),
    referenceCode: refCode,
    foundItemId,
    foundItemName: item.name,
    studentId: user.id,
    studentName: user.name,
    studentEmail: user.email,
    studentClass: user.currentClass || 'Unassigned',
    description: description ? description.trim() : '',
    privateDetailsEvidence: privateDetailsEvidence.trim(),
    photoProof: photoProof || '',
    contactNumber: contactNumber || '',
    status: 'Pending Review',
    evidenceHistory: [
      {
        sender: 'student',
        message: privateDetailsEvidence.trim(),
        photo: photoProof || undefined,
        timestamp: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.claims = db.claims || [];
  db.claims.unshift(newClaim);

  // Update item status to Claim Pending if available
  if (item.status === 'Stored / Available') {
    item.status = 'Claim Pending';
  }

  // Notify Teachers with high-visibility alert
  createNotification(
    db,
    'teacher-all',
    '🔔 Student Claims Found Item!',
    `Attention Faculty: Student ${user.name} (${user.currentClass}) has identified and claimed "${item.name}" (Ref: ${refCode}) as their lost belonging. Detailed ownership evidence has been submitted for your review.`,
    'alert',
    'claims'
  );

  // If specific uploading teacher exists, notify them directly as well
  if (item.reportedByTeacherEmail && item.reportedByTeacherEmail !== 'teacher-all') {
    createNotification(
      db,
      item.reportedByTeacherEmail,
      '🔔 Student Claims Item You Logged!',
      `Student ${user.name} (${user.currentClass}) believes "${item.name}" (Ref: ${refCode}) is their lost property. Please check their evidence against your stored private markings.`,
      'alert',
      'claims'
    );
  }

  // Notify Student
  createNotification(
    db,
    user.email,
    'Ownership Claim Received',
    `Your claim for "${item.name}" has been recorded. Reference Code: ${refCode}. You will be notified once a teacher reviews your evidence.`,
    'info',
    'claims'
  );

  addAuditLog(db, 'Claim Submitted', user, 'claim', newClaim.id, `Submitted claim ${refCode} for item "${item.name}".`);
  writeDb(db);

  res.status(201).json(newClaim);
});

// Student's own claims
app.get('/api/claims/my', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const db = readDb();
  const claims = (db.claims || []).filter((c: any) => c.studentEmail.toLowerCase() === user.email.toLowerCase());
  res.json(claims);
});

// Teacher views all claims (with side-by-side comparison with private identifying details)
app.get('/api/claims', requireTeacher, (req: Request, res: Response) => {
  const db = readDb();
  const claims = (db.claims || []).map((claim: any) => {
    const item = (db.foundItems || []).find((i: any) => i.id === claim.foundItemId);
    return {
      ...claim,
      foundItemPrivateDetails: item ? item.privateIdentifyingDetails : 'Not available',
      foundItemStorageLocation: item ? item.storageLocation : 'Not available',
      foundItemPhotos: item ? item.photos : [],
    };
  });
  res.json(claims);
});

// Teacher reviews claim: approve, reject, or request additional evidence
app.post('/api/claims/:id/review', requireTeacher, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { action, feedback, collectionInstructions } = req.body;

  if (!['approve', 'reject', 'request_evidence'].includes(action)) {
    return res.status(400).json({ error: 'Valid action required: approve, reject, or request_evidence.' });
  }

  const db = readDb();
  const claim = (db.claims || []).find((c: any) => c.id === req.params.id);

  if (!claim) {
    return res.status(404).json({ error: 'Claim not found.' });
  }

  const item = (db.foundItems || []).find((i: any) => i.id === claim.foundItemId);

  claim.reviewedByTeacherName = user.name;
  claim.reviewedAt = new Date().toISOString();
  claim.updatedAt = new Date().toISOString();

  if (action === 'approve') {
    claim.status = 'Approved (Ready for Pickup)';
    claim.teacherFeedback = feedback || 'Claim verified. Please bring your student ID card to collect your item.';
    claim.collectionInstructions =
      collectionInstructions ||
      `Please visit ${db.settings.collectionPointName} (${db.settings.collectionPointLocation}) during ${db.settings.collectionHours}. Quote reference: ${claim.referenceCode}.`;

    if (item) {
      item.status = 'Claim Approved';
      item.approvedClaimId = claim.id;
    }

    createNotification(
      db,
      claim.studentEmail,
      'Claim Approved! 🎉 Ready for Collection',
      `Your claim for "${claim.foundItemName}" has been approved. Reference: ${claim.referenceCode}. Instructions: ${claim.collectionInstructions}`,
      'success',
      'claims'
    );

    addAuditLog(
      db,
      'Claim Approved',
      user,
      'claim',
      claim.id,
      `Approved claim ${claim.referenceCode} for student ${claim.studentName} (${claim.studentClass}).`
    );
  } else if (action === 'reject') {
    claim.status = 'Rejected';
    claim.teacherFeedback = feedback || 'Evidence provided did not sufficiently match confidential item markings.';

    if (item && item.status === 'Claim Pending') {
      // Check if other pending claims exist
      const otherPending = (db.claims || []).some(
        (c: any) => c.foundItemId === item.id && c.id !== claim.id && c.status === 'Pending Review'
      );
      if (!otherPending) {
        item.status = 'Stored / Available';
      }
    }

    createNotification(
      db,
      claim.studentEmail,
      'Claim Status Update',
      `Your claim for "${claim.foundItemName}" could not be verified. Feedback: ${claim.teacherFeedback}`,
      'warning',
      'claims'
    );

    addAuditLog(db, 'Claim Rejected', user, 'claim', claim.id, `Rejected claim ${claim.referenceCode}. Reason: ${claim.teacherFeedback}`);
  } else if (action === 'request_evidence') {
    claim.status = 'Additional Evidence Requested';
    claim.teacherFeedback = feedback || 'Please provide further specific descriptions or photos (e.g. exact screen lock, inner markings).';

    claim.evidenceHistory = claim.evidenceHistory || [];
    claim.evidenceHistory.push({
      sender: 'teacher',
      message: claim.teacherFeedback,
      timestamp: new Date().toISOString(),
    });

    createNotification(
      db,
      claim.studentEmail,
      'Additional Evidence Requested',
      `Teacher requested additional verification evidence for "${claim.foundItemName}": ${claim.teacherFeedback}`,
      'alert',
      'claims'
    );

    addAuditLog(db, 'Evidence Requested', user, 'claim', claim.id, `Requested additional evidence for claim ${claim.referenceCode}.`);
  }

  writeDb(db);
  res.json(claim);
});

// Student provides additional requested evidence
app.post('/api/claims/:id/add-evidence', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { additionalEvidence, photoProof } = req.body;

  if (!additionalEvidence || additionalEvidence.trim().length === 0) {
    return res.status(400).json({ error: 'Please enter additional evidence details.' });
  }

  const db = readDb();
  const claim = (db.claims || []).find((c: any) => c.id === req.params.id);

  if (!claim) {
    return res.status(404).json({ error: 'Claim not found.' });
  }

  if (claim.studentEmail.toLowerCase() !== user.email.toLowerCase()) {
    return res.status(403).json({ error: 'Cannot modify another student’s claim.' });
  }

  claim.status = 'Pending Review';
  claim.evidenceHistory = claim.evidenceHistory || [];
  claim.evidenceHistory.push({
    sender: 'student',
    message: additionalEvidence.trim(),
    photo: photoProof || undefined,
    timestamp: new Date().toISOString(),
  });
  claim.updatedAt = new Date().toISOString();

  createNotification(
    db,
    'teacher-all',
    'Student Provided Additional Evidence',
    `${user.name} submitted supplemental evidence for claim ${claim.referenceCode} ("${claim.foundItemName}").`,
    'info',
    'claims'
  );

  writeDb(db);
  res.json(claim);
});

// ==========================================
// PHYSICAL COLLECTION & HANDOVER (TEACHER / P.E. DEPT)
// ==========================================

app.post('/api/handover', requireTeacher, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { claimId, verifiedStudentId, notes } = req.body;

  if (!claimId) {
    return res.status(400).json({ error: 'Claim ID is required.' });
  }

  if (!verifiedStudentId) {
    return res.status(400).json({ error: 'You must verify the student ID card before physical handover.' });
  }

  const db = readDb();
  const claim = (db.claims || []).find((c: any) => c.id === claimId);

  if (!claim) {
    return res.status(404).json({ error: 'Claim record not found.' });
  }

  const item = (db.foundItems || []).find((i: any) => i.id === claim.foundItemId);

  if (!item) {
    return res.status(404).json({ error: 'Associated found item record not found.' });
  }

  if (item.status === 'Claimed / Collected') {
    return res.status(400).json({ error: 'This item has already been handed over.' });
  }

  const handoverRecord = {
    referenceCode: claim.referenceCode,
    itemType: 'found_claim' as const,
    itemId: item.id,
    recipientName: claim.studentName,
    recipientEmail: claim.studentEmail,
    recipientClass: claim.studentClass,
    staffName: user.name,
    staffEmail: user.email,
    verifiedStudentId: true,
    handoverDate: new Date().toISOString(),
    collectionLocation: db.settings.collectionPointName,
    notes: notes ? notes.trim() : 'Item physically handed over and student ID inspected.',
  };

  claim.status = 'Collected';
  claim.handoverRecord = handoverRecord;
  claim.updatedAt = new Date().toISOString();

  item.status = 'Claimed / Collected';
  item.handoverDetails = handoverRecord;
  item.updatedAt = new Date().toISOString();

  // Reject any other remaining claims on this exact item
  (db.claims || []).forEach((c: any) => {
    if (c.foundItemId === item.id && c.id !== claim.id && c.status !== 'Collected') {
      c.status = 'Rejected';
      c.teacherFeedback = 'Item has been collected by the verified rightful owner.';
      createNotification(
        db,
        c.studentEmail,
        'Item Claim Closed',
        `The item "${item.name}" has been claimed and collected by its owner. Your claim has been closed.`,
        'info',
        'claims'
      );
    }
  });

  // Notify student
  createNotification(
    db,
    claim.studentEmail,
    'Collection Handover Complete',
    `You have successfully collected "${item.name}". Handover logged by ${user.name} at ${db.settings.collectionPointName}.`,
    'success',
    'claims'
  );

  addAuditLog(
    db,
    'Physical Handover Recorded',
    user,
    'handover',
    item.id,
    `Handed over "${item.name}" to ${claim.studentName} (${claim.studentClass}). Ref: ${claim.referenceCode}. Student ID verified.`
  );

  writeDb(db);
  res.json({ success: true, handoverRecord, item, claim });
});

// ==========================================
// 15-DAY UNCLAIMED & REDISTRIBUTION
// ==========================================

// Student submits request for unclaimed item (15+ days)
app.post('/api/unclaimed-items/:id/request', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { reason } = req.body;

  if (!reason || reason.trim().length < 5) {
    return res.status(400).json({ error: 'Please state the intended educational, sports, or personal need for this item.' });
  }

  const db = readDb();
  const items = getProcessedFoundItems(db.foundItems || [], db.settings.holdingPeriodDays);
  const item = items.find((i) => i.id === req.params.id);

  if (!item) {
    return res.status(404).json({ error: 'Item not found.' });
  }

  if (item.daysUnclaimed < db.settings.holdingPeriodDays) {
    return res.status(400).json({
      error: `This item is still in its ${db.settings.holdingPeriodDays}-day holding period for the original owner.`,
    });
  }

  if (item.status === 'Claimed / Collected' || item.status === 'Redistributed') {
    return res.status(400).json({ error: 'This item is no longer available.' });
  }

  const refCode = 'RED-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
  const newReq = {
    id: 'uncl-' + Date.now(),
    referenceCode: refCode,
    foundItemId: item.id,
    foundItemName: item.name,
    studentId: user.id,
    studentName: user.name,
    studentEmail: user.email,
    studentClass: user.currentClass || 'Unassigned',
    reason: reason.trim(),
    status: 'Pending Review',
    createdAt: new Date().toISOString(),
  };

  db.unclaimedRequests = db.unclaimedRequests || [];
  db.unclaimedRequests.unshift(newReq);

  createNotification(
    db,
    'teacher-all',
    'Unclaimed Item Redistribution Request',
    `${user.name} (${user.currentClass}) requested unclaimed item "${item.name}" (Ref: ${refCode}).`,
    'info',
    'pe-desk'
  );

  createNotification(
    db,
    user.email,
    'Unclaimed Request Submitted',
    `Your redistribution request for "${item.name}" was sent to the P.E. Department (Ref: ${refCode}).`,
    'info',
    'claims'
  );

  writeDb(db);
  res.status(201).json(newReq);
});

// Teacher / P.E. Dept views all redistribution requests
app.get('/api/unclaimed-requests', requireTeacher, (req: Request, res: Response) => {
  const db = readDb();
  res.json(db.unclaimedRequests || []);
});

// Teacher reviews redistribution request
app.post('/api/unclaimed-requests/:id/review', requireTeacher, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { action, notes } = req.body;
  if (!['approve', 'reject'].includes(action)) {
    return res.status(400).json({ error: 'Action must be approve or reject.' });
  }

  const db = readDb();
  const reqItem = (db.unclaimedRequests || []).find((r: any) => r.id === req.params.id);

  if (!reqItem) {
    return res.status(404).json({ error: 'Request not found.' });
  }

  reqItem.reviewedBy = user.name;
  reqItem.reviewedAt = new Date().toISOString();

  if (action === 'approve') {
    reqItem.status = 'Approved';
    createNotification(
      db,
      reqItem.studentEmail,
      'Unclaimed Item Request Approved!',
      `Your request for "${reqItem.foundItemName}" was approved. Collect from ${db.settings.collectionPointName} (Ref: ${reqItem.referenceCode}).`,
      'success',
      'claims'
    );
  } else {
    reqItem.status = 'Rejected';
    createNotification(
      db,
      reqItem.studentEmail,
      'Unclaimed Request Update',
      `Your request for "${reqItem.foundItemName}" could not be approved at this time.`,
      'warning',
      'claims'
    );
  }

  addAuditLog(db, `Redistribution ${action.toUpperCase()}`, user, 'unclaimed', reqItem.id, `Decision for student ${reqItem.studentName}`);
  writeDb(db);

  res.json(reqItem);
});

// Handover of redistributed unclaimed item
app.post('/api/unclaimed-requests/:id/handover', requireTeacher, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { verifiedStudentId, notes } = req.body;

  if (!verifiedStudentId) {
    return res.status(400).json({ error: 'Student ID must be verified.' });
  }

  const db = readDb();
  const reqItem = (db.unclaimedRequests || []).find((r: any) => r.id === req.params.id);

  if (!reqItem) {
    return res.status(404).json({ error: 'Request not found.' });
  }

  const foundItem = (db.foundItems || []).find((i: any) => i.id === reqItem.foundItemId);
  if (foundItem) {
    foundItem.status = 'Redistributed';
    foundItem.updatedAt = new Date().toISOString();
  }

  const handover = {
    referenceCode: reqItem.referenceCode,
    itemType: 'unclaimed_redistribution' as const,
    itemId: reqItem.foundItemId,
    recipientName: reqItem.studentName,
    recipientEmail: reqItem.studentEmail,
    recipientClass: reqItem.studentClass,
    staffName: user.name,
    staffEmail: user.email,
    verifiedStudentId: true,
    handoverDate: new Date().toISOString(),
    collectionLocation: db.settings.collectionPointName,
    notes: notes || 'Unclaimed item redistributed per school policy.',
  };

  reqItem.status = 'Handed Over';
  reqItem.handoverRecord = handover;

  addAuditLog(db, 'Redistribution Handover', user, 'handover', reqItem.foundItemId, `Handed over to ${reqItem.studentName}`);
  writeDb(db);

  res.json({ success: true, reqItem, handover });
});

// ==========================================
// DONATIONS SECTION
// ==========================================

// Get all donations
app.get('/api/donations', (req: Request, res: Response) => {
  const db = readDb();
  const user = (req as any).user;
  const isTeacher = user && (user.role === 'teacher' || user.role === 'admin');

  const { category, donorType, condition, search } = req.query;
  let list = db.donations || [];

  // Students & public only see 'Available' or 'Reserved' donations (pending ones are teacher only)
  if (!isTeacher) {
    list = list.filter((d: any) => d.status === 'Available' || d.status === 'Reserved' || d.status === 'Distributed');
  }

  if (category && category !== 'All') {
    list = list.filter((d: any) => d.category === category);
  }

  if (donorType && donorType !== 'All') {
    list = list.filter((d: any) => d.donorType === donorType);
  }

  if (condition && condition !== 'All') {
    list = list.filter((d: any) => d.condition === condition);
  }

  if (search && typeof search === 'string' && search.trim()) {
    const q = search.toLowerCase();
    list = list.filter((d: any) => d.title.toLowerCase().includes(q) || d.description.toLowerCase().includes(q));
  }

  // Anonymize donor name if requested
  const sanitized = list.map((d: any) => {
    if (d.isAnonymous && !isTeacher) {
      return { ...d, donorName: 'Anonymous Donor (' + d.donorType + ')' };
    }
    return d;
  });

  res.json(sanitized);
});

// Submit a donation
app.post('/api/donations', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const isTeacher = user && (user.role === 'teacher' || user.role === 'admin');
  const {
    title,
    category,
    photos,
    description,
    condition,
    donorType,
    isAnonymous,
    eligibilityRequirements,
    collectionInstructions,
  } = req.body;

  if (!title || !category || !description || !condition || !donorType) {
    return res.status(400).json({ error: 'Please complete all required donation details.' });
  }

  const db = readDb();
  const requiresApproval = db.settings.donationApprovalRequired && !isTeacher;

  const newDonation = {
    id: 'don-' + Date.now(),
    title: title.trim(),
    category,
    photos: Array.isArray(photos) && photos.length > 0 ? photos : ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'],
    description: description.trim(),
    condition,
    donorType,
    donorName: user.name,
    donorEmail: user.email,
    isAnonymous: !!isAnonymous,
    status: requiresApproval ? 'Pending Approval' : 'Available',
    eligibilityRequirements: eligibilityRequirements ? eligibilityRequirements.trim() : 'Open to all students',
    collectionInstructions: collectionInstructions ? collectionInstructions.trim() : `Collect from ${db.settings.collectionPointName}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.donations = db.donations || [];
  db.donations.unshift(newDonation);

  if (requiresApproval) {
    createNotification(
      db,
      'teacher-all',
      'New Donation Pending Approval',
      `${user.name} submitted a donation: "${newDonation.title}" (${newDonation.category}).`,
      'info',
      'donations'
    );
  }

  addAuditLog(db, 'Donation Submitted', user, 'donation', newDonation.id, `Donation "${newDonation.title}" created.`);
  writeDb(db);

  res.status(201).json(newDonation);
});

// Teacher updates/approves donation listing
app.put('/api/donations/:id', requireTeacher, (req: Request, res: Response) => {
  const user = (req as any).user;
  const db = readDb();
  const idx = (db.donations || []).findIndex((d: any) => d.id === req.params.id);

  if (idx === -1) {
    return res.status(404).json({ error: 'Donation not found.' });
  }

  const existing = db.donations[idx];
  const updated = {
    ...existing,
    ...req.body,
    approvedByTeacher: user.name,
    updatedAt: new Date().toISOString(),
  };

  db.donations[idx] = updated;
  addAuditLog(db, 'Donation Updated', user, 'donation', updated.id, `Updated status to ${updated.status}.`);
  writeDb(db);

  res.json(updated);
});

// Student requests a donation
app.post('/api/donations/:id/request', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { reason } = req.body;

  if (!reason || reason.trim().length < 5) {
    return res.status(400).json({ error: 'Please state why you need this donation.' });
  }

  const db = readDb();
  const donation = (db.donations || []).find((d: any) => d.id === req.params.id);

  if (!donation) {
    return res.status(404).json({ error: 'Donation not found.' });
  }

  if (donation.status !== 'Available') {
    return res.status(400).json({ error: 'This donation is not currently available for request.' });
  }

  const refCode = 'DON-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
  const newRequest = {
    id: 'req-' + Date.now(),
    referenceCode: refCode,
    donationId: donation.id,
    donationTitle: donation.title,
    studentId: user.id,
    studentName: user.name,
    studentEmail: user.email,
    studentClass: user.currentClass || 'Unassigned',
    reason: reason.trim(),
    status: 'Pending',
    createdAt: new Date().toISOString(),
  };

  db.donationRequests = db.donationRequests || [];
  db.donationRequests.unshift(newRequest);

  createNotification(
    db,
    'teacher-all',
    'New Donation Request',
    `${user.name} (${user.currentClass}) requested donation "${donation.title}".`,
    'info',
    'donations'
  );

  createNotification(
    db,
    user.email,
    'Donation Request Submitted',
    `Your request for "${donation.title}" is pending staff review. Ref: ${refCode}.`,
    'info',
    'claims'
  );

  writeDb(db);
  res.status(201).json(newRequest);
});

// Student gets their own donation requests
app.get('/api/donations/my-requests', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const db = readDb();
  const reqs = (db.donationRequests || []).filter((r: any) => r.studentEmail.toLowerCase() === user.email.toLowerCase());
  res.json(reqs);
});

// Teacher reviews all donation requests
app.get('/api/donations/requests', requireTeacher, (req: Request, res: Response) => {
  const db = readDb();
  res.json(db.donationRequests || []);
});

// Teacher approves or rejects donation request
app.post('/api/donations/requests/:id/review', requireTeacher, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { action } = req.body;

  if (!['approve', 'reject'].includes(action)) {
    return res.status(400).json({ error: 'Action must be approve or reject.' });
  }

  const db = readDb();
  const reqItem = (db.donationRequests || []).find((r: any) => r.id === req.params.id);

  if (!reqItem) {
    return res.status(404).json({ error: 'Request not found.' });
  }

  const donation = (db.donations || []).find((d: any) => d.id === reqItem.donationId);

  reqItem.reviewedBy = user.name;
  reqItem.reviewedAt = new Date().toISOString();

  if (action === 'approve') {
    reqItem.status = 'Approved';
    if (donation) {
      donation.status = 'Reserved';
      donation.approvedRecipientId = reqItem.studentId;
      donation.approvedRecipientName = reqItem.studentName;
      donation.approvedRecipientClass = reqItem.studentClass;
    }

    createNotification(
      db,
      reqItem.studentEmail,
      'Donation Request Approved! 🎁',
      `Your request for "${reqItem.donationTitle}" has been approved! Collect at ${db.settings.collectionPointName}. Ref: ${reqItem.referenceCode}.`,
      'success',
      'claims'
    );
  } else {
    reqItem.status = 'Declined';
    createNotification(
      db,
      reqItem.studentEmail,
      'Donation Request Update',
      `Your request for "${reqItem.donationTitle}" could not be allocated.`,
      'warning',
      'claims'
    );
  }

  addAuditLog(db, `Donation Request ${action}`, user, 'donation', reqItem.id, `Reviewed request for ${reqItem.studentName}`);
  writeDb(db);

  res.json(reqItem);
});

// Handover of donation item to student
app.post('/api/donations/requests/:id/handover', requireTeacher, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { verifiedStudentId, notes } = req.body;

  if (!verifiedStudentId) {
    return res.status(400).json({ error: 'Student ID must be verified.' });
  }

  const db = readDb();
  const reqItem = (db.donationRequests || []).find((r: any) => r.id === req.params.id);

  if (!reqItem) {
    return res.status(404).json({ error: 'Request not found.' });
  }

  const donation = (db.donations || []).find((d: any) => d.id === reqItem.donationId);
  if (donation) {
    donation.status = 'Distributed';
    donation.updatedAt = new Date().toISOString();
  }

  const handover = {
    referenceCode: reqItem.referenceCode,
    itemType: 'donation' as const,
    itemId: reqItem.donationId,
    recipientName: reqItem.studentName,
    recipientEmail: reqItem.studentEmail,
    recipientClass: reqItem.studentClass,
    staffName: user.name,
    staffEmail: user.email,
    verifiedStudentId: true,
    handoverDate: new Date().toISOString(),
    collectionLocation: db.settings.collectionPointName,
    notes: notes || 'Donated item handed over to recipient.',
  };

  reqItem.status = 'Collected';
  reqItem.handoverRecord = handover;

  addAuditLog(db, 'Donation Handover', user, 'handover', reqItem.donationId, `Distributed to ${reqItem.studentName}`);
  writeDb(db);

  res.json({ success: true, reqItem, handover });
});

// ==========================================
// P.E. DEPARTMENT COMMAND CENTER LOOKUP
// ==========================================

app.get('/api/pe-desk/summary', requireTeacher, (req: Request, res: Response) => {
  const db = readDb();
  const items = getProcessedFoundItems(db.foundItems || [], db.settings.holdingPeriodDays);

  const pendingClaims = (db.claims || []).filter((c: any) => c.status === 'Pending Review').length;
  const approvedClaimsWaitingPickup = (db.claims || []).filter((c: any) => c.status === 'Approved (Ready for Pickup)').length;
  const unclaimedReviewCount = items.filter((i) => i.daysUnclaimed >= db.settings.holdingPeriodDays && i.status !== 'Claimed / Collected' && i.status !== 'Redistributed').length;
  const pendingRedistribution = (db.unclaimedRequests || []).filter((r: any) => r.status === 'Pending Review' || r.status === 'Approved').length;
  const pendingDonationRequests = (db.donationRequests || []).filter((r: any) => r.status === 'Pending' || r.status === 'Approved').length;
  const totalHandedOver = items.filter((i) => i.status === 'Claimed / Collected' || i.status === 'Redistributed').length;

  res.json({
    totalFoundItems: items.length,
    pendingClaims,
    approvedClaimsWaitingPickup,
    unclaimedReviewCount,
    pendingRedistribution,
    pendingDonationRequests,
    totalHandedOver,
    collectionLocation: db.settings.collectionPointLocation,
    collectionHours: db.settings.collectionHours,
  });
});

// Instant reference code lookup (CLM-..., RED-..., DON-...)
app.get('/api/pe-desk/lookup/:code', requireTeacher, (req: Request, res: Response) => {
  const db = readDb();
  const rawCode = req.params.code.trim().toUpperCase();

  // Search in claims
  const claim = (db.claims || []).find((c: any) => c.referenceCode.toUpperCase() === rawCode || c.id === rawCode);
  if (claim) {
    const item = (db.foundItems || []).find((i: any) => i.id === claim.foundItemId);
    return res.json({
      type: 'claim',
      claim,
      item,
      canHandover: claim.status === 'Approved (Ready for Pickup)',
    });
  }

  // Search in redistribution requests
  const redReq = (db.unclaimedRequests || []).find((r: any) => r.referenceCode.toUpperCase() === rawCode || r.id === rawCode);
  if (redReq) {
    const item = (db.foundItems || []).find((i: any) => i.id === redReq.foundItemId);
    return res.json({
      type: 'unclaimed_redistribution',
      redistributionRequest: redReq,
      item,
      canHandover: redReq.status === 'Approved',
    });
  }

  // Search in donation requests
  const donReq = (db.donationRequests || []).find((d: any) => d.referenceCode.toUpperCase() === rawCode || d.id === rawCode);
  if (donReq) {
    const donation = (db.donations || []).find((d: any) => d.id === donReq.donationId);
    return res.json({
      type: 'donation',
      donationRequest: donReq,
      donation,
      canHandover: donReq.status === 'Approved',
    });
  }

  // Search by found item ID
  const item = (db.foundItems || []).find((i: any) => i.id === rawCode);
  if (item) {
    return res.json({
      type: 'found_item',
      item,
    });
  }

  res.status(404).json({ error: `No record found matching code or identifier "${rawCode}".` });
});

// ==========================================
// NOTIFICATIONS
// ==========================================

app.get('/api/notifications', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const db = readDb();
  const isTeacher = user.role === 'teacher' || user.role === 'admin';

  const userNotifs = (db.notifications || []).filter((n: any) => {
    if (n.recipientEmail.toLowerCase() === user.email.toLowerCase()) return true;
    if (isTeacher && n.recipientEmail === 'teacher-all') return true;
    return false;
  });

  res.json(userNotifs);
});

app.post('/api/notifications/:id/read', requireAuth, (req: Request, res: Response) => {
  const db = readDb();
  const notif = (db.notifications || []).find((n: any) => n.id === req.params.id);
  if (notif) {
    notif.isRead = true;
    writeDb(db);
  }
  res.json({ success: true });
});

app.post('/api/notifications/mark-all-read', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const db = readDb();
  const isTeacher = user.role === 'teacher' || user.role === 'admin';

  (db.notifications || []).forEach((n: any) => {
    if (n.recipientEmail.toLowerCase() === user.email.toLowerCase() || (isTeacher && n.recipientEmail === 'teacher-all')) {
      n.isRead = true;
    }
  });

  writeDb(db);
  res.json({ success: true });
});

// ==========================================
// VITE DEV / PRODUCTION INTEGRATION
// ==========================================

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`School Lost & Found server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
