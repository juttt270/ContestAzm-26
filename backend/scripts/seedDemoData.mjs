import mongoose from "mongoose";
import crypto from "crypto";
import QRCode from "qrcode";
import { env } from "../src/config/env.js";
import { User } from "../src/models/user.model.js";
import { Flat } from "../src/models/flat.model.js";
import { Complaint } from "../src/models/complaint.model.js";
import { MaintenanceBill } from "../src/models/maintenanceBill.model.js";
import { Amenity } from "../src/models/amenity.model.js";
import { AmenityBooking } from "../src/models/amenityBooking.model.js";
import { Visitor } from "../src/models/visitor.model.js";
import { Notice } from "../src/models/notice.model.js";
import { Guideline } from "../src/models/guideline.model.js";
import { EmergencyContact } from "../src/models/emergencyContact.model.js";

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const daysFromNow = (n) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

async function main() {
  await mongoose.connect(env.MONGO_URI);
  console.log("Connected to MongoDB for seeding.");

  // ---------------- FLATS ----------------
  const blocks = ["A", "B", "C", "D"];
  const flatDefs = [];
  for (const block of blocks) {
    for (let n = 102; n <= 106; n++) {
      flatDefs.push({ blockName: block, flatNumber: String(n), floor: Math.ceil((n - 100) / 2) });
    }
  }

  const flats = [];
  for (const def of flatDefs) {
    let flat = await Flat.findOne({ blockName: def.blockName, flatNumber: def.flatNumber });
    if (!flat) {
      flat = await Flat.create({
        ...def,
        maintenanceRate: rand([2200, 2500, 2800, 3000, 3500]),
      });
    }
    flats.push(flat);
  }
  console.log(`Flats ready: ${flats.length} (new + existing)`);

  // ---------------- RESIDENTS ----------------
  const residentNames = [
    "Ahmed Raza", "Fatima Khan", "Usman Tariq", "Sana Malik", "Bilal Hussain",
    "Zainab Ahmed", "Hassan Ali", "Mariam Yousuf", "Omar Farooq", "Nadia Iqbal",
    "Imran Sheikh", "Rabia Chaudhry", "Kamran Baig", "Sadia Nawaz", "Faisal Mahmood",
    "Sobia Aslam", "Tariq Jameel", "Hina Riaz",
  ];

  const vehicleTypes = ["2-Wheeler", "4-Wheeler", "Other"];
  const relations = ["Spouse", "Son", "Daughter", "Parent", "Sibling", "Tenant"];

  const residents = [];
  for (let i = 0; i < residentNames.length; i++) {
    const flat = flats[i % flats.length];
    if (flat.ownerId) continue; // don't double-assign

    const email = `resident${i + 2}@smartsociety.com`;
    let user = await User.findOne({ email });
    if (!user) {
      const vehicleCount = randInt(0, 2);
      const vehicles = Array.from({ length: vehicleCount }, () => ({
        type: rand(vehicleTypes),
        vehicleNumber: `LE${randInt(10, 99)}-${randInt(1000, 9999)}`,
      }));
      const familyMemberCount = randInt(0, 3);
      const familyMembers = Array.from({ length: familyMemberCount }, () => ({
        name: rand(["Ali", "Sara", "Zoya", "Hamza", "Areeba", "Danish"]),
        relation: rand(relations),
        age: randInt(2, 70),
      }));

      user = await User.create({
        name: residentNames[i],
        email,
        phone: `+9230${randInt(1000000, 9999999)}`,
        password: "Resident@123",
        role: "Resident",
        flatId: flat._id,
        occupancyStatus: "Owner",
        vehicles,
        familyMembers,
      });
    }
    residents.push(user);

    flat.ownerId = user._id;
    flat.occupancyType = "Owner";
    await flat.save();
  }
  console.log(`Residents ready: ${residents.length}`);

  // ---------------- GUARDS & STAFF ----------------
  const guardNames = ["Naveed Akhtar", "Shahid Mehmood", "Aslam Pervez", "Rashid Qureshi"];
  const guards = [];
  for (let i = 0; i < guardNames.length; i++) {
    const email = `guard${i + 2}@smartsociety.com`;
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name: guardNames[i],
        email,
        phone: `+9231${randInt(1000000, 9999999)}`,
        password: "Guard@123",
        role: "Guard",
      });
    }
    guards.push(user);
  }

  const staffDefs = [
    { name: "Sajid Mehboob", profession: "Electrician" },
    { name: "Waqas Anwar", profession: "Carpenter" },
    { name: "Imtiaz Gill", profession: "Painter" },
    { name: "Kashif Rasheed", profession: "AC Technician" },
    { name: "Nasreen Bibi", profession: "Cleaner" },
  ];
  const staff = [];
  for (let i = 0; i < staffDefs.length; i++) {
    const email = `${staffDefs[i].profession.toLowerCase().replace(/\s+/g, "")}2@smartsociety.com`;
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name: staffDefs[i].name,
        email,
        phone: `+9232${randInt(1000000, 9999999)}`,
        password: "Staff@123",
        role: "Staff",
        profession: staffDefs[i].profession,
      });
    }
    staff.push(user);
  }
  console.log(`Guards ready: ${guards.length}, Staff ready: ${staff.length}`);

  // ---------------- COMPLAINTS ----------------
  const categories = ["Plumbing", "Electrical", "Carpentry", "Security", "Cleanliness", "Other"];
  const complaintDefs = [
    ["Leaking kitchen tap", "The kitchen tap has been dripping continuously for two days."],
    ["Flickering hallway light", "The light outside flat keeps flickering at night."],
    ["Broken cupboard hinge", "Wardrobe door hinge is broken and won't close."],
    ["Unauthorized visitor at gate", "A visitor entered without proper verification at the main gate."],
    ["Garbage not collected", "Garbage bins on this floor haven't been emptied in 3 days."],
    ["AC not cooling", "Split AC unit is running but not cooling the room."],
    ["Water seepage in bathroom ceiling", "Ceiling paint is peeling due to water seepage from the flat above."],
    ["Power socket sparking", "One of the power sockets in the living room sparks when used."],
    ["Lift making noise", "Elevator makes a loud grinding noise between floors 2 and 3."],
    ["Parking lot pothole", "There's a large pothole near the visitor parking area."],
    ["Clogged bathroom drain", "Bathroom floor drain is clogged and water doesn't go down."],
    ["Intercom not working", "The flat intercom has stopped receiving calls from the gate."],
    ["Balcony railing loose", "The balcony railing feels unstable and needs tightening."],
    ["Common area WiFi down", "The clubhouse WiFi has been down since yesterday."],
    ["Pest control needed", "Cockroaches spotted in the kitchen, needs pest control visit."],
    ["Main door lock jammed", "Main entrance door lock is jamming and hard to turn."],
    ["Water pressure low", "Water pressure on the top floors has been very low this week."],
    ["Corridor tile cracked", "A floor tile in the 3rd floor corridor is cracked and unsafe."],
    ["Gym equipment broken", "Treadmill in the gym is not powering on."],
    ["Streetlight not working", "Streetlight near Block C entrance has been off for a week."],
  ];

  let complaintsCreated = 0;
  for (let i = 0; i < complaintDefs.length; i++) {
    const [title, description] = complaintDefs[i];
    const exists = await Complaint.findOne({ title });
    if (exists) continue;

    const resident = residents[i % residents.length];
    const priority = rand(["Low", "Medium", "High", "Emergency"]);
    const statusRoll = i % 4;
    const status = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"][statusRoll];
    const slaHours = priority === "Emergency" ? 24 : priority === "High" ? 48 : 72;
    // A few OPEN/IN_PROGRESS ones get a past SLA date to demo the overdue indicator.
    const overdue = (status === "OPEN" || status === "IN_PROGRESS") && i % 5 === 0;
    const slaDueDate = overdue ? daysFromNow(-randInt(1, 4)) : new Date(Date.now() + slaHours * 60 * 60 * 1000);

    let ticketNumber = `TKT-${100000 + i}`;
    while (await Complaint.findOne({ ticketNumber })) ticketNumber = `TKT-${randInt(100000, 999999)}`;

    await Complaint.create({
      ticketNumber,
      residentId: resident._id,
      flatId: resident.flatId,
      category: rand(categories),
      title,
      description,
      priority,
      status,
      assignedStaffId: status !== "OPEN" ? rand(staff)._id : null,
      resolutionNotes: status === "RESOLVED" || status === "CLOSED" ? "Issue inspected and resolved by maintenance team." : "",
      slaDueDate,
      resolvedAt: status === "RESOLVED" || status === "CLOSED" ? daysFromNow(-randInt(1, 10)) : null,
    });
    complaintsCreated++;
  }
  console.log(`Complaints created: ${complaintsCreated}`);

  // ---------------- BILLS ----------------
  const billingMonths = ["2026-06", "2026-07", "2026-08"];
  let billIndex = (await MaintenanceBill.countDocuments()) + 1;
  let billsCreated = 0;
  for (const month of billingMonths) {
    for (const resident of residents) {
      if (billsCreated >= 20 && month !== billingMonths[0]) break;
      const flat = await Flat.findById(resident.flatId);
      if (!flat) continue;
      const existing = await MaintenanceBill.findOne({ flatId: flat._id, billingMonth: month });
      if (existing) continue;

      const amountDue = flat.maintenanceRate || 2500;
      const statusRoll = randInt(0, 2);
      const paymentStatus = ["PAID", "PENDING", "OVERDUE"][statusRoll];
      const seq = String(billIndex).padStart(3, "0");
      billIndex++;

      await MaintenanceBill.create({
        billNumber: `INV-${month.replace("-", "")}-${seq}`,
        flatId: flat._id,
        residentId: resident._id,
        billingMonth: month,
        amountDue,
        breakdown: {
          waterCharges: Math.round(amountDue * 0.2),
          securityCharges: Math.round(amountDue * 0.32),
          repairCharges: Math.round(amountDue * 0.16),
          commonAreaCharges: Math.round(amountDue * 0.32),
        },
        dueDate: new Date(`${month}-10`),
        penaltyAmount: paymentStatus === "OVERDUE" ? Math.round(amountDue * 0.05) : 0,
        paymentStatus,
        paymentMethod: paymentStatus === "PAID" ? rand(["SIMULATED_CARD", "UPI", "NET_BANKING", "CASH"]) : "NONE",
        transactionId: paymentStatus === "PAID" ? `TXN${randInt(100000000, 999999999)}` : "",
        paidAt: paymentStatus === "PAID" ? daysFromNow(-randInt(1, 20)) : null,
      });
      billsCreated++;
    }
  }
  console.log(`Bills created: ${billsCreated}`);

  // ---------------- AMENITIES ----------------
  const amenityDefs = [
    ["Gymnasium", 30, 0],
    ["Swimming Pool", 25, 200],
    ["Kids Play Area", 20, 0],
    ["Tennis Court", 4, 300],
    ["Badminton Court", 4, 200],
    ["Community Hall", 100, 1500],
    ["Yoga & Meditation Room", 15, 0],
    ["Library & Reading Room", 20, 0],
    ["Guest Parking Bay", 10, 100],
    ["BBQ & Grill Deck", 25, 500],
    ["Squash Court", 2, 250],
    ["Table Tennis Room", 6, 100],
    ["Cricket Practice Net", 8, 300],
    ["Jogging Track", 30, 0],
    ["Amphitheater", 80, 1000],
    ["Co-working Lounge", 12, 150],
    ["Indoor Games Room", 15, 0],
    ["Banquet Hall", 150, 2500],
    ["Snooker Room", 6, 150],
    ["Barbeque Garden", 40, 400],
  ];
  const amenities = [];
  for (const [name, capacity, bookingFee] of amenityDefs) {
    let amenity = await Amenity.findOne({ name });
    if (!amenity) {
      amenity = await Amenity.create({
        name,
        description: `${name} available for residents to book by time slot.`,
        capacity,
        rules: "Please book in advance and vacate on time for the next reservation.",
        bookingFee,
      });
    }
    amenities.push(amenity);
  }
  console.log(`Amenities ready: ${amenities.length}`);

  // ---------------- AMENITY BOOKINGS ----------------
  let bookingsCreated = 0;
  for (let i = 0; i < 16; i++) {
    const amenity = amenities[i % amenities.length];
    const resident = residents[(i * 3) % residents.length];
    const bookingDate = daysFromNow(randInt(-5, 12)).toISOString().slice(0, 10);
    const startHour = 9 + (i % 10);
    const startTime = `${String(startHour).padStart(2, "0")}:00`;
    const endTime = `${String(startHour + 1).padStart(2, "0")}:00`;

    const conflict = await AmenityBooking.findOne({ amenityId: amenity._id, bookingDate, startTime });
    if (conflict) continue;

    await AmenityBooking.create({
      amenityId: amenity._id,
      residentId: resident._id,
      bookingDate,
      startTime,
      endTime,
      guestCount: randInt(1, 6),
      notes: "",
      status: i % 9 === 0 ? "CANCELLED" : "CONFIRMED",
      totalFee: amenity.bookingFee || 0,
    });
    bookingsCreated++;
  }
  console.log(`Amenity bookings created: ${bookingsCreated}`);

  // ---------------- VISITORS ----------------
  const visitorNames = [
    "Sameer Anwar", "Lubna Shah", "Kashif Iqbal", "Rida Fatima", "Junaid Butt",
    "Farah Naz", "Adeel Rana", "Shazia Perveen", "Yasir Latif", "Noreen Aslam",
    "Zeeshan Haider", "Amber Siddiq", "Mudassar Iqbal", "Saima Khalid", "Waseem Akram",
    "Bushra Tariq", "Hamid Nawaz", "Sidra Yousaf",
  ];
  const visitorTypes = ["Guest", "Delivery", "Cab", "Vendor", "Service"];
  const visitorStatuses = ["APPROVED", "CHECKED_IN", "COMPLETED", "EXPIRED"];

  let visitorsCreated = 0;
  for (let i = 0; i < visitorNames.length; i++) {
    const exists = await Visitor.findOne({ visitorName: visitorNames[i], phone: `+9233${1000000 + i}` });
    if (exists) continue;

    const resident = residents[i % residents.length];
    const status = visitorStatuses[i % visitorStatuses.length];
    const validFrom = daysFromNow(status === "EXPIRED" ? -3 : -randInt(0, 1));
    const validUntil = status === "EXPIRED" ? daysFromNow(-1) : daysFromNow(randInt(1, 3));

    let passCode = String(randInt(100000, 999999));
    while (await Visitor.findOne({ passCode })) passCode = String(randInt(100000, 999999));
    let qrToken = `VQR-${crypto.randomBytes(8).toString("hex").toUpperCase()}`;
    while (await Visitor.findOne({ qrToken })) qrToken = `VQR-${crypto.randomBytes(8).toString("hex").toUpperCase()}`;

    const qrPayload = JSON.stringify({ passCode, qrToken, visitorName: visitorNames[i], flatId: resident.flatId, validUntil });
    const qrCodeDataUrl = await QRCode.toDataURL(qrPayload, { errorCorrectionLevel: "H", margin: 2 });

    await Visitor.create({
      passCode,
      qrToken,
      qrCodeDataUrl,
      residentId: resident._id,
      targetFlatId: resident.flatId,
      visitorName: visitorNames[i],
      phone: `+9233${1000000 + i}`,
      vehicleNumber: i % 3 === 0 ? `LE${randInt(10, 99)}-${randInt(1000, 9999)}` : "N/A",
      purpose: rand(["Personal Visit", "Package Delivery", "Cab Pickup", "Vendor Service", "Maintenance Visit"]),
      visitorType: visitorTypes[i % visitorTypes.length],
      validFrom,
      validUntil,
      status,
      checkedInAt: status === "CHECKED_IN" || status === "COMPLETED" ? validFrom : null,
      checkedOutAt: status === "COMPLETED" ? daysFromNow(-randInt(0, 1)) : null,
    });
    visitorsCreated++;
  }
  console.log(`Visitors created: ${visitorsCreated}`);

  // ---------------- NOTICES ----------------
  const admin = await User.findOne({ role: "Admin" });
  const noticeDefs = [
    ["Society AGM scheduled", "Annual General Meeting will be held in the Community Hall on the last Sunday of this month.", "Event", false],
    ["Water supply maintenance", "Water supply will be interrupted from 10 AM to 2 PM for tank cleaning.", "MaintenanceNotice", false],
    ["New parking rules in effect", "Visitor vehicles must now be registered at the gate before entry.", "Rule", false],
    ["Independence Day celebration", "Join us for flag hoisting and breakfast at the clubhouse.", "Event", false],
    ["Fire drill this Friday", "A mandatory fire safety drill will be conducted for all blocks.", "Announcement", false],
    ["Lift maintenance in Block B", "Block B lift will be under maintenance for two days.", "MaintenanceNotice", false],
    ["Diwali decoration guidelines", "Please avoid open flame decorations in common corridors.", "Rule", false],
    ["Society painting project", "Exterior painting of all blocks begins next month.", "Announcement", false],
    ["Which weekend works for the community picnic?", "Vote for your preferred weekend for the annual community picnic.", "Event", true],
    ["Preferred new gym equipment?", "Help us decide what new equipment to add to the gymnasium.", "Announcement", true],
    ["Should we add CCTV in the parking area?", "Vote on whether to install additional CCTV cameras in parking.", "Rule", true],
    ["Clubhouse renovation feedback", "Share your preference for the clubhouse renovation theme.", "Event", true],
  ];

  let noticesCreated = 0;
  for (const [title, content, category, isPoll] of noticeDefs) {
    const exists = await Notice.findOne({ title });
    if (exists) continue;

    const pollOptions = isPoll
      ? [
          { optionText: "Option A", votesCount: randInt(0, 12), votedUserIds: [] },
          { optionText: "Option B", votesCount: randInt(0, 12), votedUserIds: [] },
          { optionText: "Option C", votesCount: randInt(0, 12), votedUserIds: [] },
        ]
      : [];

    await Notice.create({
      title,
      content,
      category,
      authorId: admin._id,
      targetAudience: rand(["ALL", "OWNERS", "TENANTS"]),
      isPoll,
      pollOptions,
      expiresAt: isPoll ? daysFromNow(14) : null,
    });
    noticesCreated++;
  }
  console.log(`Notices created: ${noticesCreated}`);

  // ---------------- GUIDELINES ----------------
  const guidelineDefs = [
    ["Quiet hours policy", "Please keep noise to a minimum between 10 PM and 7 AM out of respect for neighbors.", "General"],
    ["Visitor parking rules", "Visitors must park only in designated guest bays and register at the gate.", "Parking"],
    ["Pet leash policy", "All pets must be leashed while in common areas and corridors.", "Pets"],
    ["Amenity booking etiquette", "Cancel your amenity booking at least 2 hours in advance if plans change.", "Amenities"],
    ["Fire safety guidelines", "Keep fire exits clear at all times and do not store items in stairwells.", "Safety"],
    ["Maintenance request process", "Log all maintenance issues through the Complaints page for faster resolution.", "Maintenance"],
  ];
  let guidelinesCreated = 0;
  for (let i = 0; i < guidelineDefs.length; i++) {
    const [title, content, category] = guidelineDefs[i];
    const exists = await Guideline.findOne({ title });
    if (exists) continue;
    await Guideline.create({ title, content, category, order: i, authorId: admin._id });
    guidelinesCreated++;
  }
  console.log(`Guidelines created: ${guidelinesCreated}`);

  // ---------------- EMERGENCY CONTACTS ----------------
  const contactDefs = [
    ["Society Security Desk", "Main Gate Security", "+923011112222", "Security"],
    ["Fire Brigade", "Emergency Services", "1122", "Fire"],
    ["Local Police Station", "City Police", "15", "Police"],
    ["Ambulance Service", "Edhi Emergency", "115", "Ambulance"],
    ["Society Management Office", "Admin Office", "+923011119999", "Society Office"],
    ["Plumbing Emergency", "On-call Plumber", "+923011117777", "Maintenance"],
  ];
  let contactsCreated = 0;
  for (const [name, designation, phone, type] of contactDefs) {
    const exists = await EmergencyContact.findOne({ name, phone });
    if (exists) continue;
    await EmergencyContact.create({ name, designation, phone, type });
    contactsCreated++;
  }
  console.log(`Emergency contacts created: ${contactsCreated}`);

  console.log("\nSeed complete.");
  await mongoose.connection.close();
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
