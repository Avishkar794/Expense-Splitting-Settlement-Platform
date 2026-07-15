# Expense Split Platform Frontend Implementation Plan

This plan outlines the approach to configure CORS on the Spring Boot backend and create a modern, clean, responsive, and visually stunning single-page frontend application for the Expense Split Platform.

## User Review Required

> [!IMPORTANT]
> - **CORS Configuration**: The backend does not currently permit Cross-Origin Resource Sharing (CORS). We will add a global CORS configuration in `SecurityConfig.java` to allow the frontend to communicate with it.
> - **Frontend Stack**: We will build the application using **Vanilla HTML5, CSS3, and JavaScript (ES6+)** with a modular single-page application (SPA) design, which ensures fast load times, excellent responsiveness, and requires zero compilation or build steps.
> - **Typography & Styles**: We will import `Outfit` and `Inter` from Google Fonts to give a premium dashboard feel, using sleek dark glassmorphism gradients and custom animations.

## Proposed Changes

---

### Backend Components

We will update the backend to allow incoming cross-origin requests from our frontend application.

#### [MODIFY] [SecurityConfig.java](file:///d:/Code%20Playground/Expense-Split-Platform/ExpenseMgmt/src/main/java/com/avishkar/ExpenseMgmt/config/SecurityConfig.java)
- Configure `HttpSecurity` to enable CORS and permit requests from any origin (or localhost ports) with standard headers and methods.

---

### Frontend Components

All frontend code will reside in the [ExpenseMgmtFrontend](file:///d:/Code%20Playground/Expense-Split-Platform/ExpenseMgmtFrontend) folder. We will create the following files:

#### [NEW] [index.html](file:///d:/Code%20Playground/Expense-Split-Platform/ExpenseMgmtFrontend/index.html)
- Main HTML page containing layout containers for auth, dashboard, group details, and modals (e.g., Add Expense, Add Member, Create Group).

#### [NEW] [styles.css](file:///d:/Code%20Playground/Expense-Split-Platform/ExpenseMgmtFrontend/styles.css)
- Sleek, modern, and cohesive CSS styles utilizing CSS variables.
- Premium design: dark aesthetic by default, modern typography, glassmorphism, responsive grid layout, elegant tab styling, customized status badges, and interactive micro-animations.

#### [NEW] [api.js](file:///d:/Code%20Playground/Expense-Split-Platform/ExpenseMgmtFrontend/api.js)
- A robust API service wrapper that manages:
  - Base API URL configuration.
  - Automatic injection of the JWT `Authorization: Bearer <token>` header.
  - Standard error handling and parsing.
  - Fetch-based endpoints corresponding to all backend controllers:
    - Auth: login, register
    - Groups: list all, create, get details, add member
    - Expenses: create, list, get details, delete
    - Balances: list group balances, list simplified debts
    - Settlement: settle-up

#### [NEW] [app.js](file:///d:/Code%20Playground/Expense-Split-Platform/ExpenseMgmtFrontend/app.js)
- Core frontend application controller:
  - User session management (saves token and logged-in user in `localStorage`).
  - Screen state routing (Auth vs. Dashboard vs. Group Detail).
  - Dynamic UI rendering (loading indicators, toast alerts, expense split helper UI based on selected SplitType: Equal, Exact, Percentage).
  - Form validation and event listeners.

## Verification Plan

### Automated/Manual Verification
- Build and run the Spring Boot backend server.
- Serve the `ExpenseMgmtFrontend` directory using a simple HTTP server (like Python's `http.server` or VS Code Live Server) to verify the UI.
- Test the full user flow manually:
  1. Register a new account.
  2. Log in with the registered credentials.
  3. Create a new group.
  4. Search and add another member to the group (needs to register another account first to test).
  5. Add an expense split equally, exactly, and by percentage.
  6. View group balances and simplified debts.
  7. Delete an expense and verify balance updates.
  8. Click Settle Up and verify all debts are cleared.
