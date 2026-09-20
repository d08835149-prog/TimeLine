# Timeline

Timeline is a personal timeline web application for organizing important dates, milestones, deadlines, and time periods.

Users can create events, track how much time has passed or how much time remains, view progress for date ranges, and manage everything through a visual timeline interface.

## Live Demo

https://timeline-nine-tawny.vercel.app

## Features

- Create timeline events
- Start and optional end dates
- D-Day countdowns
- Days passed / days remaining
- Progress bars for date ranges
- Event categories
- Custom event colors
- Edit and delete events
- Time gaps between events
- Light and Dark mode
- Custom accent colors
- Dashboard overview
- Upcoming and active event statistics
- Next event display
- Neon PostgreSQL database storage
- Responsive layout
- Privacy Policy
- Terms of Use

## Tech Stack

**Frontend**
- HTML
- CSS
- JavaScript

**Backend**
- Node.js
- Express

**Database**
- PostgreSQL
- Neon

**Deployment**
- Vercel

## Project Structure

```text
TimeLine/
├── public/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   ├── privacy.html
│   └── terms.html
│
├── server.js
├── package.json
├── package-lock.json
├── .env.example
├── .gitignore
└── README.md
```

## Environment Variables

Create a `.env` file in the project root.

```env
DATABASE_URL=your_neon_database_url
PORT=3000
```

`DATABASE_URL` should contain your Neon PostgreSQL connection string.

Example:

```env
DATABASE_URL=postgresql://username:password@your-neon-host/neondb?sslmode=require
PORT=3000
```

Do not commit the `.env` file to GitHub.

Make sure `.gitignore` contains:

```gitignore
node_modules/
.env
.DS_Store
```

## Installation

Clone the repository:

```bash
git clone YOUR_REPOSITORY_URL
```

Move into the project directory:

```bash
cd TimeLine
```

Install dependencies:

```bash
npm install
```

Start the application:

```bash
npm start
```

The local server will run at:

```text
http://localhost:3000
```

## Database Setup

Timeline uses Neon PostgreSQL.

Create the `events` table:

```sql
CREATE TABLE IF NOT EXISTS events (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Personal',
  start_date DATE NOT NULL,
  end_date DATE,
  color VARCHAR(20) NOT NULL DEFAULT '#7c5cff',
  favorite BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Check the table:

```sql
SELECT * FROM events;
```

## API

### Health Check

```http
GET /api/health
```

Example response:

```json
{
  "ok": true,
  "database": true,
  "time": "2026-09-20T20:29:22.902Z"
}
```

### Get All Events

```http
GET /api/events
```

Example response:

```json
[
  {
    "id": 1,
    "title": "Graduation",
    "category": "School",
    "startDate": "2027-06-20",
    "endDate": "",
    "color": "#3478f6",
    "favorite": false
  }
]
```

### Create Event

```http
POST /api/events
```

Example body:

```json
{
  "title": "Graduation",
  "category": "School",
  "startDate": "2027-06-20",
  "endDate": "",
  "color": "#3478f6"
}
```

### Update Event

```http
PUT /api/events/:id
```

Example:

```text
PUT /api/events/1
```

### Delete Event

```http
DELETE /api/events/:id
```

Example:

```text
DELETE /api/events/1
```

## Dashboard

The dashboard gives a quick overview of the timeline.

It displays:

- Total Events
- Upcoming Events
- Active Events
- Next Event
- D-Day until the next event
- Neon database connection status

## Timeline

Events are displayed chronologically on a visual vertical timeline.

Each event can display:

- Event title
- Category
- Start date
- End date
- Event color
- Current status
- D-Day
- Days passed
- Days remaining
- Progress percentage

A `TODAY` marker separates past and future events.

## Event Progress

Events with both a start date and an end date automatically display progress.

Example:

```text
Sep 1, 2026 → Dec 18, 2026

Progress: 18%

████░░░░░░░░░░░░░░
```

Before an event begins, progress is `0%`.

After an event ends, progress is `100%`.

## Event Categories

Available categories:

```text
Personal
School
Work
Travel
Project
Birthday
Other
```

## Event Colors

Individual events can use different colors:

- Purple
- Blue
- Cyan
- Green
- Orange
- Pink
- Red

The selected event color is used for timeline markers and visual accents.

## Theme Customization

Timeline supports:

- Dark Mode
- Light Mode

Users can also change the main accent color.

Available interface colors:

- Purple
- Blue
- Cyan
- Green
- Orange
- Pink

Theme and interface color preferences are stored in browser `localStorage`.

Event data is stored separately in Neon PostgreSQL.

## Data Storage

### Neon PostgreSQL

The database stores:

- Event title
- Category
- Start date
- End date
- Event color
- Favorite state

### Browser Local Storage

The browser stores UI preferences such as:

- Light / Dark mode
- Accent color

## Privacy Policy

Privacy Policy:

```text
/privacy.html
```

Live page:

https://timeline-nine-tawny.vercel.app/privacy.html

The policy explains:

- What event information is stored
- Database storage
- Browser local storage
- Data deletion
- Sensitive information recommendations

## Terms of Use

Terms of Use:

```text
/terms.html
```

Live page:

https://timeline-nine-tawny.vercel.app/terms.html

The Terms explain:

- Intended use
- User responsibility
- Date calculation limitations
- Important deadline warnings
- Service availability
- Data responsibility

## Deployment

Timeline is deployed using Vercel.

Production:

https://timeline-nine-tawny.vercel.app

The backend uses Express and the database is hosted with Neon PostgreSQL.

The Vercel deployment requires the following environment variable:

```text
DATABASE_URL
```

Add it under:

```text
Vercel
→ Project Settings
→ Environment Variables
```

The Neon database URL should never be placed directly inside frontend JavaScript.

## Security

The Neon connection string is used only by the server.

The browser communicates with the backend through API endpoints such as:

```text
/api/events
/api/health
```

Database credentials are not exposed to frontend JavaScript.

## Future Ideas

Possible future improvements:

- User accounts
- Authentication
- Private timelines
- Favorite events
- Search
- Event filters
- Repeating events
- Notifications
- Calendar view
- Event notes
- Data export / import
- Timeline sharing
- Custom categories
- More dashboard statistics

## Author

Built as a personal full-stack web development project.

## License

This project is intended for learning and personal use.