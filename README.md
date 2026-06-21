# Sudo Science

Sudo Science is a comprehensive web platform connecting students, educators, and recruiters. It features distinct portals tailored to different user roles, facilitating learning, mentorship, and career opportunities in technology.

## Key Features

- **Public/Community Portal**: A community hub featuring a component catalog, an AI-powered component scanner using Gemini, and a Q&A forum.
- **Student Portal**: A dedicated space for students to manage their learning journey, participate in mentor chats, and track job applications.
- **Educator Portal**: Tools for educators to manage course materials, request sample kits, and interact with the student community.
- **Recruiter Portal**: A dashboard for recruiters to view candidate profiles, track hiring stages, and post opportunities.
- **Supabase Integration**: Secure authentication and backend data persistence.
- **AI Component Scanner**: Upload images of UI components to receive AI-generated code snippets and descriptions.

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm 

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up Environment Variables**:
   Create a `.env.local` file in the root directory and add the following keys. You will need a Gemini API Key and Supabase project credentials:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   VITE_SUPABASE_URL=your_supabase_url_here
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to `http://localhost:5173` (or the port provided in your terminal) to view the application.

## Technologies Used
- React
- Vite
- Tailwind CSS
- Supabase
- Google Gemini API
