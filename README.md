# Gate Pass Guardian

This is a Next.js application for managing gate passes, built with Firebase.

## Getting Started

### 1. Prerequisites

- Node.js (v18 or later)
- Firebase account with a project created.

### 2. Firebase Setup

1.  In your Firebase project, enable the following services:
    *   **Authentication**: Email/Password sign-in method.
    *   **Firestore**: Create a database.

2.  Add a Web App to your Firebase project.

3.  Copy the Firebase configuration object. You will need these values for your environment variables.

4.  Navigate to **Firestore Database > Rules** and paste the contents of `firestore.rules` into the rules editor. Click **Publish**.

### 3. Local Development

1.  Install dependencies:
    ```bash
    npm install
    ```

2.  Create a `.env.local` file in the root of the project by copying the `.env.example` file:
    ```bash
    cp .env.example .env.local
    ```

3.  Fill in the `.env.local` file with your Firebase project credentials from Step 2.

4.  Run the development server:
    ```bash
    npm run dev
    ```

5.  Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

### 4. First User (Owner Account)

-   The first user to sign up for the application will automatically be assigned the `owner` role, which has the highest level of permissions.
-   Navigate to `/signup` to create this first account.
-   All subsequent users will be assigned the `pending` role and must be approved by an `admin` or `owner`.
