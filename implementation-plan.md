# SandboxVTT - Implementation Plan

## Overview

This implementation plan breaks down the SandboxVTT project into manageable phases, with each phase building upon the previous one. The plan follows a bottom-up approach, establishing core infrastructure first, then adding features incrementally.

---

## Phase 0: Project Setup & Infrastructure

**Goal**: Establish development environment and core project structure

### Tasks

#### 0.1 Initialize Project
- [ ] Create project directory structure
- [ ] Initialize Node.js project (`package.json`)
- [ ] Set up Git repository
- [ ] Create `.gitignore` file

#### 0.2 Choose & Install Tech Stack
- [ ] Select frontend framework (React, Vue, or vanilla JS)
- [ ] Select backend framework (Node.js/Express recommended)
- [ ] Select database (SQLite for simplicity, or PostgreSQL for production)
- [ ] Select real-time library (Socket.io recommended)
- [ ] Install dependencies

#### 0.3 Project Structure
- [ ] Create client directory structure
- [ ] Create server directory structure
- [ ] Set up build configuration (Vite, webpack, or similar)
- [ ] Configure development hot-reload

**Deliverables**: Working dev environment with hello-world app

**Dependencies**: None

**Estimated Time**: 2-4 hours

---

## Phase 1: Database Schema & Basic Backend

**Goal**: Set up data persistence and basic API

### Tasks

#### 1.1 Design Database Schema
- [ ] Create `sandboxes` table (id, created_at)
- [ ] Create `images` table (id, sandbox_id, name, file_path, is_active, created_at)
- [ ] Create `tokens` table (id, sandbox_id, image_id, name, color, position_x, position_y, created_at)
- [ ] Create `chat_messages` table (id, sandbox_id, sender_name, sender_role, message, created_at)
- [ ] Write migration scripts

#### 1.2 File Storage Setup
- [ ] Create uploads directory structure
- [ ] Implement file naming convention (sandbox_id/image_filename)
- [ ] Configure file upload limits
- [ ] Set up static file serving

#### 1.3 Basic API Endpoints
- [ ] POST `/api/sandbox` - Create new sandbox
- [ ] GET `/api/sandbox/:id` - Get sandbox data
- [ ] POST `/api/sandbox/:id/image` - Upload image
- [ ] GET `/api/sandbox/:id/images` - Get all images
- [ ] GET `/api/sandbox/:id/tokens` - Get all tokens for sandbox
- [ ] GET `/api/sandbox/:id/messages` - Get chat history

**Deliverables**: Database schema + REST API for data access

**Dependencies**: Phase 0

**Estimated Time**: 4-6 hours

---

## Phase 2: WebSocket Infrastructure

**Goal**: Establish real-time communication layer

### Tasks

#### 2.1 WebSocket Server Setup
- [ ] Initialize Socket.io server
- [ ] Create connection handler
- [ ] Implement room-based architecture (one room per sandbox)
- [ ] Handle client connect/disconnect events

#### 2.2 Event Definitions
- [ ] Define event schema for token operations (create, move, delete)
- [ ] Define event schema for active view changes
- [ ] Define event schema for chat messages
- [ ] Define event schema for image uploads

#### 2.3 Basic Event Handlers
- [ ] Implement broadcast logic for token events
- [ ] Implement broadcast logic for chat messages
- [ ] Implement broadcast logic for active view changes
- [ ] Add event validation

#### 2.4 Connection Management
- [ ] Implement reconnection logic (client-side)
- [ ] Implement session restoration
- [ ] Add connection status indicators
- [ ] Handle graceful disconnections

**Deliverables**: Working real-time communication layer

**Dependencies**: Phase 1

**Estimated Time**: 4-6 hours

---

## Phase 3: Front Page & Sandbox Creation

**Goal**: Implement landing page and sandbox creation flow

### Tasks

#### 3.1 Front Page UI
- [ ] Create landing page layout
- [ ] Add "Create Sandbox" button
- [ ] Style landing page

#### 3.2 Sandbox Creation Logic
- [ ] Call backend API to create sandbox
- [ ] Generate unique sandbox ID
- [ ] Generate GM and player URLs
- [ ] Redirect to sandbox page with GM role parameter

#### 3.3 URL Routing
- [ ] Set up client-side routing (if using framework) or URL handling
- [ ] Route `/` to front page
- [ ] Route `/sandbox/:id` to sandbox page
- [ ] Parse URL parameters for role and sandbox ID

**Deliverables**: Working front page with sandbox creation

**Dependencies**: Phase 1

**Estimated Time**: 2-3 hours

---

## Phase 4: Basic Sandbox View & Layout

**Goal**: Create sandbox page structure and layout

### Tasks

#### 4.1 Sandbox Page Layout
- [ ] Create main canvas area (center)
- [ ] Create left panel container (for GM controls)
- [ ] Create right panel container (for tokens and chat)
- [ ] Implement responsive layout
- [ ] Add role-based rendering (show/hide GM panel)

#### 4.2 Role Detection & Character Naming
- [ ] Parse role from URL parameters
- [ ] Implement localStorage check for returning players
- [ ] Create character name popup modal
- [ ] Save sandbox ID and character name to localStorage
- [ ] Display appropriate UI based on role

#### 4.3 Connection to Backend
- [ ] Establish WebSocket connection on page load
- [ ] Join sandbox room
- [ ] Load initial sandbox state (images, tokens, messages)
- [ ] Display connection status

**Deliverables**: Basic sandbox page with role-based layout

**Dependencies**: Phase 2, Phase 3

**Estimated Time**: 4-5 hours

---

## Phase 5: Image Management (GM)

**Goal**: Implement image upload and management for GM

### Tasks

#### 5.1 GM Control Panel - Image Upload
- [ ] Create image upload button
- [ ] Create image name input field
- [ ] Implement file selection dialog
- [ ] Upload image to backend via API
- [ ] Show upload progress/loading indicator
- [ ] Handle upload errors

#### 5.2 Image List Display
- [ ] Fetch and display list of uploaded images
- [ ] Show image names
- [ ] Highlight active image
- [ ] Add "Activate" button for each image
- [ ] Update list when new images uploaded

#### 5.3 Image Activation
- [ ] Implement activate button handler
- [ ] Update active status in database
- [ ] Emit WebSocket event to all clients
- [ ] Update UI to reflect new active image

#### 5.4 Image Preview (GM Only)
- [ ] Implement click handler on image name
- [ ] Display preview image to GM only
- [ ] Don't change active view for other users
- [ ] Allow GM to return to active view

**Deliverables**: Full image management for GM

**Dependencies**: Phase 4

**Estimated Time**: 5-6 hours

---

## Phase 6: Image Display & Interaction

**Goal**: Implement image viewing with zoom and pan

### Tasks

#### 6.1 Canvas Setup
- [ ] Create HTML5 Canvas or use canvas library
- [ ] Load and render active image
- [ ] Handle image loading states
- [ ] Fit image to canvas on initial load

#### 6.2 Zoom Functionality
- [ ] Implement mouse wheel zoom
- [ ] Implement pinch-to-zoom (touch devices)
- [ ] Set zoom limits (min/max)
- [ ] Center zoom on mouse/touch position
- [ ] Store zoom state client-side

#### 6.3 Pan Functionality
- [ ] Implement click-and-drag panning
- [ ] Implement touch-drag panning
- [ ] Set pan boundaries (prevent panning beyond image)
- [ ] Store pan state client-side

#### 6.4 Active View Synchronization
- [ ] Listen for active view change events
- [ ] Load new active image when changed
- [ ] Reset or maintain zoom/pan state (decide on UX)
- [ ] Handle transitions smoothly

**Deliverables**: Interactive image viewing with zoom/pan

**Dependencies**: Phase 5

**Estimated Time**: 6-8 hours

---

## Phase 7: Token System

**Goal**: Implement token creation, manipulation, and synchronization

### Tasks

#### 7.1 Token Panel UI
- [ ] Create floating token panel (upper right)
- [ ] Add color picker component
- [ ] Add token name input field
- [ ] Add "Create Token" or click-to-place functionality
- [ ] Style panel appropriately

#### 7.2 Token Creation
- [ ] Implement click-on-canvas to place token
- [ ] Send token data to backend (save to DB)
- [ ] Emit WebSocket event to all clients
- [ ] Render token on canvas at specified position
- [ ] Display token color and name tag

#### 7.3 Token Rendering
- [ ] Draw tokens as circles or markers
- [ ] Display color
- [ ] Display name tag below token
- [ ] Handle multiple tokens
- [ ] Optimize rendering performance

#### 7.4 Token Movement
- [ ] Implement drag-and-drop for tokens
- [ ] Update token position in database
- [ ] Emit position update via WebSocket
- [ ] Sync token positions across all clients
- [ ] Implement optimistic UI updates

#### 7.5 Token Deletion
- [ ] Implement right-click context menu on tokens
- [ ] Add delete option
- [ ] Delete token from database
- [ ] Emit deletion event via WebSocket
- [ ] Remove token from all clients' views

#### 7.6 Token-Image Relationship
- [ ] Associate tokens with specific images (image_id)
- [ ] Store tokens in coordinate system relative to image
- [ ] Hide/show tokens when active view changes
- [ ] Maintain token positions during zoom/pan

**Deliverables**: Full token system with real-time sync

**Dependencies**: Phase 6

**Estimated Time**: 8-10 hours

---

## Phase 8: Right Panel with Tabbed Interface

**Goal**: Implement tabbed interface for Tokens, Chat, and Players

### Tasks

#### 8.1 Tabbed Navigation
- [x] Create RightPanel component with tab navigation
- [x] Implement three tabs: Tokens, Chat, Players
- [x] Style tabs with small uppercase font
- [x] Add active tab highlighting with turquoise accent
- [x] Remove individual panel headings (tabs provide context)

#### 8.2 Tokens Tab
- [x] Move TokenPanel into tab structure
- [x] Update styling to match dark theme
- [x] Ensure color picker and input work in tabbed layout

#### 8.3 Chat Tab
- [x] Create chat panel (right side)
- [x] Create scrollable message container
- [x] Create message input field
- [x] Add send button (or enter-to-send)
- [x] Style chat interface with dark theme
- [x] Fetch chat history from backend on load
- [x] Display messages in chronological order
- [x] Format messages with sender name and timestamp
- [x] Differentiate GM vs player messages
- [x] Auto-scroll to latest message
- [x] Capture input from text field
- [x] Send message to backend (save to DB)
- [x] Emit message via WebSocket
- [x] Clear input field after send
- [x] Handle enter key to send
- [x] Listen for incoming message events
- [x] Store messages in database with sandbox_id
- [x] Load message history on sandbox join

#### 8.4 Players Tab
- [x] Create PlayersPanel component
- [x] Display real-time list of connected players
- [x] Show player count header
- [x] Display circular avatars with first letter of name
- [x] Show player name and role (GM/Player)
- [x] Style with dark theme and turquoise accents
- [x] Update list on join/leave events

#### 8.5 Dark Color Scheme
- [x] Update all panels to use dark theme
- [x] Backgrounds: #2c3e50 (dark blue-grey)
- [x] Inputs/elements: #34495e (medium dark)
- [x] Text: #ecf0f1 (light), #95a5a6 (muted)
- [x] Accents: #4ecdc4 (turquoise)

**Deliverables**: Tabbed interface with Tokens, Chat, and Players panels

**Dependencies**: Phase 4

**Estimated Time**: 8-10 hours

---

## Phase 9: Real-Time Player Tracking

**Goal**: Track and display connected players in real-time

### Tasks

#### 9.1 Backend Player Tracking
- [x] Add sandboxPlayers Map to track connected players
- [x] Store player info (socketId, name, role, joinTime) on join
- [x] Enhance join-sandbox event to accept player info
- [x] Broadcast updated player list on join/leave/disconnect
- [x] Clean up player data on disconnect
- [x] Add request-players-list event handler

#### 9.2 Frontend Integration
- [x] Update useSocket hook to send player name and role
- [x] Pass characterName and role to useSocket
- [x] PlayersPanel listens for players-list events
- [x] Request player list on component mount
- [x] Display players with avatars and role badges

#### 9.3 Connection Status
- [x] Add connection status indicator to UI
- [x] Update status on connect/disconnect
- [x] Handle reconnection properly
- [x] Automatically rejoin room on reconnect
- [x] Update player list on reconnection

**Deliverables**: Real-time player tracking and connection status

**Dependencies**: Phase 8

**Estimated Time**: 6-8 hours

---

## Phase 10: Polish & Error Handling

**Goal**: Improve UX and handle edge cases

### Tasks

#### 10.1 Error Handling
- [ ] Handle sandbox not found (invalid ID)
- [ ] Handle WebSocket connection failures
- [ ] Handle image upload failures
- [ ] Handle database errors gracefully
- [ ] Display user-friendly error messages

#### 10.2 Loading States
- [ ] Add loading spinner for image uploads
- [ ] Add loading state for sandbox initialization
- [ ] Add loading state for chat history
- [ ] Add skeleton screens where appropriate

#### 10.3 Input Validation
- [ ] Validate character name input (not empty, length limits)
- [ ] Validate token name input
- [ ] Validate chat messages (not empty, length limits)
- [ ] Sanitize inputs to prevent XSS

#### 10.4 UI/UX Improvements
- [ ] Add visual feedback for interactions (hover states, etc.)
- [ ] Ensure consistent styling across components
- [ ] Test responsive behavior on different screen sizes
- [ ] Improve accessibility (keyboard navigation, ARIA labels)

#### 10.5 Performance Optimization
- [ ] Optimize image loading (compression, caching)
- [ ] Optimize token rendering (canvas optimization)
- [ ] Minimize WebSocket message payload
- [ ] Add debouncing for frequent events (token drag)

**Deliverables**: Polished, production-ready application

**Dependencies**: All previous phases

**Estimated Time**: 6-8 hours

---

## Phase 11: Testing & Deployment

**Goal**: Test application and deploy to production

### Tasks

#### 11.1 Manual Testing
- [ ] Test sandbox creation flow
- [ ] Test GM functionality (image upload, activation, preview)
- [ ] Test player functionality (joining, character naming)
- [ ] Test token creation, movement, deletion
- [ ] Test chat functionality
- [ ] Test link copying
- [ ] Test with multiple concurrent users
- [ ] Test reconnection scenarios
- [ ] Test on different browsers (Chrome, Firefox, Safari, Edge)

#### 11.2 Bug Fixes
- [ ] Fix issues discovered during testing
- [ ] Verify fixes don't introduce regressions

#### 11.3 Deployment Preparation
- [ ] Set up production database
- [ ] Configure environment variables
- [ ] Set up file storage for production
- [ ] Configure WebSocket for production (HTTPS/WSS)
- [ ] Set up hosting (Heroku, DigitalOcean, AWS, etc.)

#### 11.4 Deployment
- [ ] Deploy backend server
- [ ] Deploy frontend (or serve from backend)
- [ ] Test production deployment
- [ ] Monitor for errors

#### 11.5 Documentation
- [ ] Write README with setup instructions
- [ ] Document API endpoints
- [ ] Document environment variables
- [ ] Write basic user guide (optional)

**Deliverables**: Deployed, working application

**Dependencies**: All previous phases

**Estimated Time**: 6-10 hours

---

## Summary Timeline

| Phase | Description | Estimated Time |
|-------|-------------|----------------|
| 0 | Project Setup | 2-4 hours |
| 1 | Database & Backend API | 4-6 hours |
| 2 | WebSocket Infrastructure | 4-6 hours |
| 3 | Front Page & Creation | 2-3 hours |
| 4 | Sandbox View & Layout | 4-5 hours |
| 5 | Image Management (GM) | 5-6 hours |
| 6 | Image Display & Interaction | 6-8 hours |
| 7 | Token System | 8-10 hours |
| 8 | Chat System | 4-5 hours |
| 9 | GM Link Sharing | 2-3 hours |
| 10 | Polish & Error Handling | 6-8 hours |
| 11 | Testing & Deployment | 6-10 hours |
| **Total** | | **53-74 hours** |

---

## Development Approach

### Recommended Order
Follow the phases in order (0 through 11). Each phase builds upon previous work.

### Minimum Viable Product (MVP)
For fastest time-to-working-product, focus on core features:
- Phases 0-4: Basic infrastructure and layout
- Phase 5-6: Image management (simplified)
- Phase 7: Basic token placement (without drag-and-drop initially)
- Phase 8: Basic chat
- Phase 9: Link sharing

This MVP approach can reduce initial development to ~30-40 hours.

### Testing Strategy
- Test each phase thoroughly before moving to the next
- Keep a checklist of success criteria from requirements.md Section 10
- Use multiple browser tabs to simulate multiple users
- Test with actual images and realistic token counts

### Git Strategy
- Commit after each major task completion
- Use descriptive commit messages
- Consider branching for each phase
- Tag releases (v0.1, v0.2, etc.)

---

## Technology Recommendations

### Frontend
- **Framework**: React (most ecosystem support) or Vue (simpler learning curve)
- **Canvas**: Konva.js or Fabric.js (simplifies canvas interactions)
- **Styling**: CSS Modules or Tailwind CSS

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **WebSocket**: Socket.io
- **File Upload**: Multer
- **Database**: SQLite (development), PostgreSQL (production)
- **ORM**: Sequelize or Prisma (optional but helpful)

### Development Tools
- **Build Tool**: Vite (fast, modern)
- **Package Manager**: npm or pnpm
- **Environment Variables**: dotenv

### Deployment
- **Simple Option**: Render.com or Railway.app (free tier available)
- **Traditional**: DigitalOcean Droplet or AWS EC2
- **Serverless**: Vercel (frontend) + Railway (backend)

---

## Risk Mitigation

### Potential Challenges

1. **WebSocket complexity**: Start simple, add optimizations later
2. **Canvas performance with many tokens**: Use canvas libraries, implement culling
3. **File upload size limits**: Set reasonable limits, add compression
4. **Coordinate system for zoom/pan**: Plan coordinate transformation carefully
5. **Race conditions in real-time updates**: Use optimistic UI + confirmation pattern

### Contingency Plans

- If canvas is too complex, start with DOM-based tokens (div elements)
- If WebSocket is problematic, fall back to polling initially
- If file storage is complex, use cloud service (AWS S3, Cloudinary)

---

## Next Steps

1. Review this plan with stakeholders
2. Set up development environment (Phase 0)
3. Begin Phase 1 implementation
4. Iterate based on learnings

**Note**: Time estimates assume a developer with moderate experience in the chosen tech stack. Adjust accordingly based on your experience level.
