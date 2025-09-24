# **App Name**: GuardianGate

## Core Features:

- User Authentication: Secure sign-up and login using Firebase Auth, with role-based access control (owner, admin, user, pending, rejected).
- Pass Generation: Generate standard or visitor passes with details like plate number, owner/visitor name, expiry date, and QR code.  Supports batch generation via .xlsx upload.
- Pass Verification: Public verifier interface allows users to check pass validity by manually entering plate details or scanning a QR code.
- Admin Dashboard: Dashboard for administrators to manage passes, search records, view statistics, and manage user roles.
- Statistics Generation: AI tool that analyzes pass usage data to provide insights into peak times, common visitors, and potential security risks. This helps in optimizing resource allocation and improving overall security measures.
- QR Code Generation: Automatically generate QR codes for each pass containing a shortened JSON payload with pass ID, plate details, and expiry time, embedding it directly into the pass for on-screen preview and printing.
- Role Management: Allows admins to approve pending users and modify user roles (user, admin).

## Style Guidelines:

- Primary color: Deep violet (#673AB7) for a sense of security and authority.
- Background color: Light violet (#E1D9ED), a desaturated version of the primary color for a calming yet professional feel.
- Accent color: Soft blue (#3F51B5), an analogous color, used to highlight interactive elements and calls to action, creating visual interest without being overwhelming.
- Font pairing: 'Space Grotesk' (sans-serif) for headlines to provide a modern, techy look and 'Inter' (sans-serif) for body text to ensure readability and a clean user interface.
- Use clear, modern icons from a consistent set, such as Material Design Icons, to represent different actions and categories in the application. Ensure icons are easily understandable and match the overall aesthetic.
- Implement a consistent grid-based layout with adequate spacing between elements to improve readability and visual appeal. Use cards to present information in a structured manner.
- Incorporate subtle animations and transitions, such as fade-ins and slide-ins, to enhance user experience and provide feedback on interactions. Ensure animations are smooth and do not distract from the content.