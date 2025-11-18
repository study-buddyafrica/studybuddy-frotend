# Teacher Profile & Booking Flow - Student Dashboard

## Overview
This document explains how the teacher profile system works in the student dashboard, what data is displayed, which teachers are visible, and the complete booking flow.

---

## 📋 **What Displays in Teacher Profiles**

### **1. Teacher List View (Grid Display)**

When students click "Teachers Profile" in the sidebar, they see a grid of teacher cards showing:

#### **Each Teacher Card Displays:**
- **Profile Picture** (`profile_picture` or `profilePicture`)
- **Rating** (star rating badge, e.g., "4.5 ★")
- **Teacher Name** (`name`)
- **School** (`current_school` or "School not set")
- **Grade** (`grade` or "Not set")
- **Subjects** (`subjects` - array or string)
- **Experience** (`experience` or default "5+ years")
- **Total Students** (`totalStudents` or 0)
- **Cost per Session** (`cost` in KES, e.g., "KES 1,500")
- **"View Profile" Button**

### **2. Teacher Detail View**

When a student clicks on a teacher card, they see a detailed profile with:

#### **Left Side:**
- Large profile picture
- **Session Cost** (prominently displayed)
- **"Schedule Lesson" Button**

#### **Right Side:**
- **Full Name**
- **School Name**
- **Grade**
- **Information Cards:**
  - Subjects taught
  - Years of experience
  - Rating
  - Total number of students

#### **Availability Section:**
- Grid of available time slots
- Each slot shows:
  - **Date** (e.g., "2024-11-27")
  - **Time Range** (e.g., "9:00 AM - 11:00 AM")
  - **Availability Status** (Available/Not Available)
  - Color-coded: Green for available, Red for unavailable

#### **Videos Section:**
- Teacher's uploaded educational videos
- Each video shows:
  - Title
  - Description
  - Playable video player

---

## 🔍 **Which Teachers Are Visible**

### **Filtering Logic:**

1. **Grade-Based Filtering:**
   - If student has a specific grade (`userInfo.grade` or `userInfo.class`):
     - Shows teachers whose `grades` array includes the student's grade
     - OR teachers whose `subjects` array contains subjects with matching grades
   - If student has no grade ("All Grades"):
     - Shows ALL teachers

2. **Client-Side Filters:**
   - **Search Filter:** By teacher name or subject name
   - **Subject Filter:** Filter by specific subject
   - **Grade Filter:** Filter by grade (1-12 or "All Grades")

### **API Endpoint:**
```
GET /api/teachers
Headers: Authorization: Bearer {token}
```

### **Expected API Response:**
```json
{
  "success": true,
  "teachers": [
    {
      "id": "uuid",
      "name": "Teacher Name",
      "profilePicture": "url",
      "current_school": "School Name",
      "grade": "9",
      "grades": ["9", "10", "11"],
      "subjects": ["Mathematics", "Physics"] or [
        {
          "name": "Mathematics",
          "grades": ["9", "10"]
        }
      ],
      "rating": 4.5,
      "totalStudents": 25,
      "experience": "5+ years",
      "cost": 1500,
      "availability": [
        {
          "date": "2024-11-27",
          "time": "9:00 AM - 11:00 AM",
          "isAvailable": true
        }
      ],
      "course_id": "uuid" (optional)
    }
  ]
}
```

---

## 📝 **Required Data Structure**

### **Teacher Object (Minimum Required Fields):**

```javascript
{
  id: string,                    // REQUIRED - Teacher unique ID
  name: string,                  // REQUIRED - Teacher full name
  profilePicture: string,        // Optional - Profile image URL
  current_school: string,        // Optional - School name
  grade: string,                 // Optional - Primary grade taught
  grades: string[],              // Optional - Array of grades taught
  subjects: string[] | object[], // Optional - Subjects taught
  rating: number,                // Optional - Rating (0-5)
  totalStudents: number,         // Optional - Number of students
  experience: string,             // Optional - Experience description
  cost: number,                  // REQUIRED - Cost per session in KES
  availability: [                // REQUIRED - Available time slots
    {
      date: string,              // Format: "YYYY-MM-DD"
      time: string,              // Format: "9:00 AM - 11:00 AM"
      isAvailable: boolean      // true/false
    }
  ],
  course_id: string,             // Optional - Course ID for booking
  registered_on: string         // Optional - Registration date
}
```

---

## 🔄 **Complete Booking Flow**

### **Step 1: Student Views Teachers**
1. Student navigates to "Teachers Profile" in sidebar
2. System fetches teachers from `/api/teachers`
3. Teachers are filtered by student's grade (if available)
4. Teachers displayed in grid format

### **Step 2: Student Filters/Searches**
- Student can:
  - Search by teacher name or subject
  - Filter by grade (1-12)
  - Filter by subject
- Filters work client-side on already-loaded teachers

### **Step 3: Student Views Teacher Details**
1. Student clicks on a teacher card
2. System displays detailed teacher profile
3. System fetches teacher's videos from `/lessons/api/videos/teacher/{teacher_id}`
4. Student sees:
   - Full profile information
   - Available time slots
   - Teacher's videos

### **Step 4: Student Schedules a Lesson**
1. Student clicks **"Schedule Lesson"** button
2. Modal opens with booking form
3. Student selects:
   - **Date** (from available dates in teacher's availability)
   - **Time** (from available times for selected date)
4. System validates:
   - Both date and time are selected
   - Selected slot exists and is available

### **Step 5: Booking Submission**
1. System creates booking payload:
```javascript
{
  teacher_id: string,           // Selected teacher's ID
  scheduled_start: string,      // ISO format: "2024-11-27T09:00:00.000Z"
  duration_hours: number,       // Default: 1 hour
  course: string | null         // Course ID if available
}
```

2. POST request sent to:
```
POST /api/student/session-bookings/
Headers: 
  Authorization: Bearer {token}
  Content-Type: application/json
```

3. Expected Response:
```json
{
  "id": "booking-uuid",
  "teacher_id": "teacher-uuid",
  "student_id": "student-uuid",
  "scheduled_start": "2024-11-27T09:00:00.000Z",
  "duration_hours": 1,
  "status": "pending",
  "cost": 1500,
  "amount": 1500
}
```

### **Step 6: Booking Confirmation**
1. Success message displayed:
   - Shows booking cost
   - Shows status (usually "pending")
   - Message: "Session booked successfully! Cost: 1500. Status: pending. Waiting for teacher confirmation."

2. Student returned to teacher list
3. Success message auto-dismisses after 5 seconds

### **Step 7: Teacher Confirmation (Backend Process)**
- Teacher receives booking request
- Teacher can accept/reject in their dashboard
- Once accepted, booking status changes to "accepted" or "confirmed"
- Student can see booking status in "My Lessons" section

---

## 🎯 **Key Features**

### **1. Grade-Based Matching**
- Students see teachers relevant to their grade level
- Ensures appropriate teacher-student matching

### **2. Availability Display**
- Real-time availability slots
- Color-coded for easy identification
- Only available slots can be selected

### **3. Subject Filtering**
- Grade-specific subjects shown:
  - Grades 1-3: English, Mathematics, Science
  - Grades 4-8: Adds Social Studies
  - Grades 9-12: Adds Biology, Chemistry, Physics, History, Geography, Computer Studies

### **4. Search Functionality**
- Search by teacher name
- Search by subject name
- Real-time filtering

### **5. Video Integration**
- Teachers can upload educational videos
- Students can preview teacher's teaching style
- Videos fetched from: `/lessons/api/videos/teacher/{teacher_id}`

---

## ⚠️ **Important Notes**

1. **Authentication Required:**
   - All API calls require Bearer token
   - Token stored in `localStorage.getItem('access_token')`

2. **Default Values:**
   - If teacher data missing, defaults are used:
     - `rating`: 4.5
     - `experience`: "5+ years"
     - `totalStudents`: 0
     - `availability`: Mock slots if not provided

3. **Time Format:**
   - Availability time format: "9:00 AM - 11:00 AM"
   - ISO conversion: `${date}T${time}:00` → ISO string

4. **Error Handling:**
   - 401 errors: Authentication required
   - 429 errors: Rate limiting (with retry logic)
   - Booking errors: User-friendly error messages

5. **Booking Status Flow:**
   - `pending` → Student submitted, waiting for teacher
   - `accepted` → Teacher accepted the booking
   - `confirmed` → Booking confirmed, session ready
   - `completed` → Session completed
   - `cancelled` → Booking cancelled

---

## 🔧 **Backend Requirements**

### **Required Endpoints:**

1. **GET /api/teachers**
   - Returns list of teachers
   - Should filter by grade if student grade provided
   - Must include availability data

2. **GET /lessons/api/videos/teacher/{teacher_id}**
   - Returns teacher's uploaded videos
   - Optional endpoint

3. **POST /api/student/session-bookings/**
   - Creates a new booking
   - Validates availability
   - Calculates cost
   - Returns booking with status

### **Data Validation:**
- Ensure teacher availability is up-to-date
- Validate time slots are not double-booked
- Calculate session cost based on teacher's rate
- Set initial booking status to "pending"

---

## 📊 **User Experience Flow Diagram**

```
Student Dashboard
    ↓
Click "Teachers Profile"
    ↓
Fetch Teachers (filtered by grade)
    ↓
Display Teacher Grid
    ↓
[Optional] Filter/Search
    ↓
Click Teacher Card
    ↓
Display Teacher Details + Videos
    ↓
Click "Schedule Lesson"
    ↓
Select Date & Time
    ↓
Submit Booking
    ↓
Booking Created (status: pending)
    ↓
Success Message
    ↓
Return to Teacher List
    ↓
[Later] Check "My Lessons" for status updates
```

---

This system ensures students can easily find, view, and book sessions with appropriate teachers based on their grade level and subject needs.

