# LinkShrink - Frontend

LinkShrink is a full-stack URL shortener and analytics dashboard, similar to Bitly. This frontend client allows users to login, shorten URLs, generate custom aliases, set expiration dates, and view analytics for their shortened links via charts and statistics.

## Backend Repository

The backend for LinkShrink is available here: [LinkShrink Backend](https://github.com/Preterno/LinkShrink-Backend)

## Features

- Email/password login using JWT
- Create shortened links with optional custom alias and expiration date
- Dashboard displaying:
  - Original & shortened URLs
  - Created & expiration dates
  - Total click count
- Analytics:
  - Clicks over time (bar/line chart)
  - Device and browser breakdown
- QR Code generation for each short URL
- Pagination and search support

## Technologies & Libraries Used

- **React.js** – Core frontend framework for building the user interface.
- **React Router DOM** – Enables client-side routing for navigation.
- **Axios** – HTTP client for making API requests.
- **Chart.js & React Chart.js 2** – For rendering interactive analytics charts.
- **Formik & Yup** – For managing and validating forms.
- **QRCode** – To generate QR codes for shortened URLs.
- **Toastify** – Provides customizable toast notifications.
- **Tailwind CSS** – Utility-first CSS framework for styling.

## Installation & Setup

1. Clone the repository:

```bash
git clone https://github.com/Preterno/LinkShrink-Frontend.git
cd LinkShrink-Frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file and set the base URL:

```ini
VITE_API_BASE_URL=http://localhost:3000
```

4. Run the frontend:

```bash
npm run dev
```
5. Open `http://localhost:5173` in your browser.

## Connect with Me

Feel free to connect with me on [LinkedIn](https://www.linkedin.com/in/aslam8483).
