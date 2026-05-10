# **App Name**: CardSnap Studio

## Core Features:

- Template Browsing (User): Publicly display published photocard templates on the homepage grid, with titles, subtitles, and background thumbnails, allowing users to select a template.
- Photocard Customization & Preview (User): Allow users to upload a profile image and input required/optional text fields (Name, Designation/Department, Session) for their chosen template, featuring a real-time live preview of the generated photocard using Konva.js.
- High-Resolution Photocard Export (User): Enable users to download their customized photocard as a high-resolution (4K) PNG image, utilizing Konva.js's toDataURL method with a pixelRatio of 4.
- Admin Authentication: Secure admin login via Email/Password authentication using Firebase Auth, with protected routes for template management and editing.
- Template Management Dashboard (Admin): Provide an administrator dashboard to list all templates (draft/published), offering functionality to create new templates, edit existing ones, delete templates, and toggle their published status, all managed in Firestore.
- Real-time Template Editor (Admin): Offer a comprehensive admin editor with a real-time Konva.js canvas preview on the right panel, allowing administrators granular design control over photo shape (circle/square), size, position, text layers (position, font size, style, color, alignment) via synced sliders and input fields.
- Image Asset Management: Utilize Firebase Storage for efficient uploading and retrieval of all background images and user-uploaded profile images.

## Style Guidelines:

- Color scheme: Dark theme, using a very dark desaturated violet as the primary background for a modern, sophisticated feel.
- Primary interactive color: A vibrant medium-light violet, `#9152E4`, used for accents and interactive elements, providing strong contrast against the dark background.
- Accent color: A bold blue, `#2E6EF8`, derived analogously from the primary hue, used for calls-to-action and highlights, creating visual dynamism.
- Background color: Dark desaturated violet, `#1C1822`, forming a deep and clean foundation for the UI elements.
- Global font: 'Bricolage Grotesque' (sans-serif) for all text elements, providing a modern and clean aesthetic as requested. Note: currently only Google Fonts are supported.
- Utilize line-based (outline) icons throughout the application for a clean, minimalist, and modern aesthetic, complementing the rounded UI elements.
- Mobile-first responsive design, with a two-step input and preview flow for users on mobile devices, and a dual-panel layout (controls left, canvas right) for desktop interfaces.
- Generous use of rounded corners (rounded-xl or rounded-2xl) for containers, cards, and input fields to contribute to a friendly and modern UI.
- Implement smooth sliding transitions between steps on mobile for an improved user experience and provide loading spinners or progress indicators during image loading, canvas rendering, and file downloads.