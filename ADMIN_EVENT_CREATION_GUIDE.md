# Admin Panel Event Creation Guide 🎬

## How to Access & Create Events

### Step 1: Access the Admin Panel

1. Open browser: **http://localhost:8000/admin/**
2. Login with credentials:
   - Username: `admin`
   - Password: `admin123`

### Step 2: Create Event Venue (if needed)

1. Navigate to **Venues**
2. Click **"Add Venue"**
3. Fill in:
   - **Venue Name**: "Grand Tournament Arena"
   - **Location**: "College Central Auditorium"
   - **Capacity**: 500
   - **Facilities**: "Stage, Sound System, LED Screens, Seating for 500"
   - **Has Projector**: ✓ Check
   - **Has Sound System**: ✓ Check
   - **Availability Status**: "Available"
4. Click **"Save"**

### Step 3: Create Event Category (if needed)

1. Navigate to **Categories**
2. Click **"Add Category"**
3. Fill in:
   - **Category Name**: "Anime Tournament"
   - **Description**: "Competitive anime-themed tournaments and events"
   - **Icon**: "⚔️" (or leave blank)
4. Click **"Save"**

### Step 4: Create the Event

1. Navigate to **Events**
2. Click **"Add Event"**
3. Fill in all fields:

#### Required Fields:

- **Title**: "The God of High School: Tournament Arc"
- **Description**:

  ```
  An intense tournament-style competition inspired by the God of High School anime!

  Event Features:
  - Multiple rounds of competitive battles
  - Teams compete for glory and prizes
  - Live streaming and spectator seating
  - Prizes for top 3 teams

  Rules:
  - Fair gameplay and respect for all participants
  - Best sportsmanship award
  - Registration deadline: 2 days before event
  ```

- **Event Date**: Select a future date (e.g., 2026-02-15)
- **Start Time**: 10:00 AM
- **End Time**: 05:00 PM
- **Venue**: Select "Grand Tournament Arena"
- **Category**: Select "Anime Tournament"
- **Department**: Select any department (e.g., "Computer Science")
- **Max Capacity**: 100 (registration limit)
- **Event Type**: "Competition"
- **Status**: "Draft" (or "Published" if ready)

#### Optional Fields:

- **Image**: Upload tournament poster (if available)
- **Event Coordinators**: Assign staff members
- **Event Resources**: Add equipment/supplies needed

### Step 5: Save the Event

Click **"Save"** button at bottom

### Event Management Actions:

After creating, you can:

- ✏️ **Edit**: Change event details anytime
- 🗑️ **Delete**: Remove event (if no registrations)
- 📊 **View Registrations**: See who registered
- ✓ **Mark Attendance**: Track attendees
- 📋 **Generate Reports**: Event statistics

---

## Event Fields Explained

| Field            | Type      | Purpose                                      |
| ---------------- | --------- | -------------------------------------------- |
| **Title**        | Text      | Event name (e.g., "Tournament Arc")          |
| **Description**  | Long Text | Detailed event info, rules, prizes           |
| **Event Date**   | Date      | When event happens                           |
| **Start Time**   | Time      | Event begins (10:00 AM)                      |
| **End Time**     | Time      | Event ends (05:00 PM)                        |
| **Venue**        | Dropdown  | Location (must exist first)                  |
| **Category**     | Dropdown  | Type (Tournament, Workshop, etc.)            |
| **Department**   | Dropdown  | Organizing department                        |
| **Max Capacity** | Number    | How many can register                        |
| **Event Type**   | Dropdown  | Competition/Workshop/Seminar/Cultural/Sports |
| **Status**       | Dropdown  | Draft/Published/Ongoing/Completed/Cancelled  |

---

## Example: "The God of High School" Event Data

```
Title: The God of High School: Tournament Arc
Event Type: Competition
Category: Anime Tournament
Status: Published

Description:
An elite tournament competition inspired by the God of High School anime!

TOURNAMENT STRUCTURE:
- Round 1: Qualifying Matches (Best of 3)
- Round 2: Group Stage (4 groups, top 2 advance)
- Round 3: Semi-Finals (Direct elimination)
- Finals: Championship Match (Live broadcast)

REGISTRATION:
- Team Size: 3-5 members per team
- Deadline: Feb 13, 2026
- Entry Fee: Free (college students only)

PRIZES:
🥇 1st Place: Trophy + ₹5000 + Certificate
🥈 2nd Place: Trophy + ₹3000 + Certificate
🥉 3rd Place: Trophy + ₹1000 + Certificate
⭐ Best Sportsmanship: Special Award

EVENT DATE: February 15, 2026
TIME: 10:00 AM - 5:00 PM
VENUE: Grand Tournament Arena
CAPACITY: 100 participants (20 teams × 5)
```

---

## Database Setup (Auto-created)

The system automatically creates:

- Event record in `events_event` table
- Audit log entry in `events_auditlog`
- Registration status tracking
- Attendance records (created when marked)

---

## API Integration

Once created, event is available at:

```
GET /api/events/          - List all events
GET /api/events/{id}/     - Get event details
POST /api/events/         - Create event (admin only)
PUT /api/events/{id}/     - Update event (admin only)
DELETE /api/events/{id}/  - Delete event (admin only)
```

---

## Quick Tips

✅ **DO:**

- Create venue first, then use it for events
- Use clear, descriptive titles
- Include rules and expectations in description
- Set status to "Draft" until ready, then "Published"
- Assign event coordinators for management

❌ **DON'T:**

- Delete events with active registrations (archive instead)
- Create duplicates (edit existing instead)
- Leave description empty (helps participants)
- Forget to set max_capacity (limits registrations)

---

## Troubleshooting

**Event not showing in frontend?**

- Ensure Status = "Published"
- Check Event Date is in future
- Verify Venue is selected

**Can't register participants?**

- Check if max_capacity is reached
- Verify event status is "Published"
- Ensure event date is in future

**Need to modify event?**

- Go to Events → Click event name → Edit → Save

**Need to cancel event?**

- Edit event → Change Status to "Cancelled"
- Add note in description

---

Created: February 1, 2026
Last Updated: February 1, 2026
