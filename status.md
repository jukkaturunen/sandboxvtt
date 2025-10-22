# SandboxVTT - Implementation Status

**Last Updated**: 2025-10-21

---

## Overall Progress

| Phase | Status | Progress | Notes |
|-------|--------|----------|-------|
| Phase 0: Project Setup | ✅ Complete | 100% | All tasks done |
| Phase 1: Database & Backend | ✅ Complete | 100% | All endpoints working |
| Phase 2: WebSocket Infrastructure | ✅ Complete | 100% | Real-time events ready |
| Phase 3: Front Page & Creation | ✅ Complete | 100% | Routing and pages done |
| Phase 4: Sandbox View & Layout | ✅ Complete | 100% | Layout and WebSocket ready |
| Phase 5: Image Management | ✅ Complete | 100% | Upload, list, activate done |
| Phase 6: Image Display | ✅ Complete | 100% | Canvas with zoom/pan done |
| Phase 7: Token System | ✅ Complete | 100% | All token features working |
| Phase 8: Chat System | ✅ Complete | 100% | All chat features working |
| Phase 9: Link Sharing | ⏳ Not Started | 0% | - |
| Phase 10: Polish & Error Handling | ⏳ Not Started | 0% | - |
| Phase 11: Testing & Deployment | ⏳ Not Started | 0% | - |

**Overall Completion**: 9/11 phases (82%)

---

## Current Phase: Phase 9 - Link Sharing

### Previous Phase (Phase 8) - COMPLETED ✅

#### 8.1 Chat UI
- [x] Create ChatPanel component
- [x] Scrollable message container
- [x] Message input field and Send button
- [x] Empty state message
- [x] Auto-scroll to bottom on new messages

#### 8.2 Message Display
- [x] Display sender name and timestamp
- [x] Format timestamps (today shows time, older shows date)
- [x] Style messages with sender highlighting
- [x] Smooth slide-in animation for new messages

#### 8.3 Sending Messages
- [x] Send message via POST API
- [x] Include sender_name and sender_role
- [x] Clear input after sending
- [x] Disable input/button when no character name set

#### 8.4 Receiving Messages
- [x] Listen for chat-message WebSocket event
- [x] Add new messages to state
- [x] Real-time updates across all clients

#### 8.5 Message Persistence
- [x] Load chat history from database on page load
- [x] Display all previous messages
- [x] Messages survive page refreshes

### Previous Phase (Phase 7) - COMPLETED ✅

#### 7.1 Token Panel UI
- [x] Create token panel (upper right)
- [x] Add color selector with 10 colors
- [x] Add token name input field
- [x] Create token button
- [x] Instructions for users

#### 7.2 Token Creation
- [x] Implement pending token state
- [x] Click on map to place token
- [x] Send token data to backend
- [x] Broadcast to all clients via WebSocket
- [x] Render tokens on canvas

#### 7.3 Token Movement
- [x] Implement drag-and-drop for tokens
- [x] Update token position during drag
- [x] Save position to database on drop
- [x] Broadcast moves to all clients
- [x] Optimistic UI updates

#### 7.4 Token Deletion
- [x] Right-click context menu on tokens
- [x] Delete option in context menu
- [x] Delete from database
- [x] Broadcast deletion to all clients
- [x] Remove from all clients' views

#### 7.5 Token-Image Relationship
- [x] Associate tokens with specific images
- [x] Store image_id with each token
- [x] Filter tokens by active image
- [x] Tokens persist when switching views
- [x] Tokens reappear with their image

### Previous Phase (Phase 6) - COMPLETED ✅

#### 6.1 Canvas Setup
- [x] Create ImageCanvas component
- [x] Load and render active image
- [x] Handle image loading states
- [x] Fit image to canvas on initial load
- [x] Show "No Active Image" state

#### 6.2 Zoom Functionality
- [x] Implement mouse wheel zoom
- [x] Set zoom limits (0.5x to 5x)
- [x] Display zoom level percentage
- [x] Store zoom state client-side

#### 6.3 Pan Functionality
- [x] Implement click-and-drag panning
- [x] Mouse down/move/up handlers
- [x] Store pan state client-side
- [x] Visual cursor feedback (grab/grabbing)

#### 6.4 Active View Synchronization
- [x] Listen for active-view-changed events
- [x] Load new active image when changed
- [x] Reset zoom/pan state on image change
- [x] Handle transitions smoothly
- [x] Reset view button

### Previous Phase (Phase 5) - COMPLETED ✅

#### 5.1 GM Control Panel - Image Upload
- [x] Create image upload button and file input
- [x] Prompt for image name during upload
- [x] Implement file upload with FormData
- [x] Show upload progress/loading state
- [x] Handle upload errors
- [x] Real-time broadcast to all clients via WebSocket

#### 5.2 Image List Display
- [x] Fetch and display list of uploaded images
- [x] Show image names in GM panel
- [x] Highlight active image
- [x] Display image count
- [x] Listen for image-uploaded socket events

#### 5.3 Image Activation
- [x] Add "Activate" button for each image
- [x] Implement activate button handler
- [x] Update active status via API
- [x] Emit WebSocket event to all clients
- [x] Update UI to reflect new active image
- [x] Disable activate button for current image

#### 5.4 Link Sharing (GM Panel)
- [x] Display GM and Player invite links
- [x] Implement copy-to-clipboard functionality
- [x] Show confirmation when link copied

### Previous Phase (Phase 4) - COMPLETED ✅

#### 4.1 Sandbox Page Layout
- [x] Create main canvas area (center)
- [x] Create left panel container (GM controls)
- [x] Create right panel container (tokens and chat)
- [x] Implement responsive layout with CSS Grid
- [x] Add role-based rendering (show/hide GM panel)

#### 4.2 Role Detection & Character Naming
- [x] Parse role from URL parameters
- [x] Implement localStorage check for returning players
- [x] Create CharacterNameModal component
- [x] Save sandbox ID and character name to localStorage
- [x] Display appropriate UI based on role

#### 4.3 Connection to Backend
- [x] Create useSocket custom hook
- [x] Establish WebSocket connection on page load
- [x] Join sandbox room via socket
- [x] Display connection status indicator
- [x] Handle reconnection automatically

### Previous Phase (Phase 3) - COMPLETED ✅

#### 3.1 Front Page UI
- [x] Create landing page layout
- [x] Add "Create Sandbox" button
- [x] Style landing page with gradient design

#### 3.2 Sandbox Creation Logic
- [x] Call backend API to create sandbox
- [x] Handle sandbox creation in FrontPage component
- [x] Redirect to sandbox page with GM role parameter

#### 3.3 URL Routing
- [x] Set up React Router
- [x] Route `/` to front page
- [x] Route `/sandbox/:id` to sandbox page
- [x] Parse URL parameters for role and sandbox ID

### Previous Phase (Phase 2) - COMPLETED ✅

#### 2.1 WebSocket Server Setup
- [x] Initialize Socket.io server with room logic
- [x] Create connection handler
- [x] Implement room-based architecture (one room per sandbox)
- [x] Handle client connect/disconnect events

#### 2.2 Event Definitions
- [x] Define event schema for token operations (create, move, delete)
- [x] Define event schema for active view changes
- [x] Define event schema for chat messages
- [x] Define event schema for image uploads

#### 2.3 Basic Event Handlers
- [x] Implement broadcast logic for token events
- [x] Implement broadcast logic for chat messages
- [x] Implement broadcast logic for active view changes
- [x] Add event handlers in socketEvents.js

#### 2.4 Integration
- [x] Integrate WebSocket with REST API routes
- [x] Emit events from API endpoints (image upload, active view, tokens, chat)

### Previous Phase (Phase 1) - COMPLETED ✅

#### 1.1 Design Database Schema
- [x] Create `sandboxes` table (id, created_at)
- [x] Create `images` table (id, sandbox_id, name, file_path, is_active, created_at)
- [x] Create `tokens` table (id, sandbox_id, image_id, name, color, position_x, position_y, created_at)
- [x] Create `chat_messages` table (id, sandbox_id, sender_name, sender_role, message, created_at)
- [x] Write database initialization script

#### 1.2 File Storage Setup
- [x] Create uploads directory structure
- [x] Implement file naming convention (sandbox_id/image_filename)
- [x] Configure file upload limits (10MB)
- [x] Set up static file serving

#### 1.3 Basic API Endpoints
- [x] POST `/api/sandbox` - Create new sandbox
- [x] GET `/api/sandbox/:id` - Get sandbox data
- [x] POST `/api/sandbox/:id/image` - Upload image
- [x] GET `/api/sandbox/:id/images` - Get all images
- [x] PUT `/api/sandbox/:id/image/:imageId/activate` - Set active image
- [x] GET `/api/sandbox/:id/tokens` - Get all tokens
- [x] POST `/api/sandbox/:id/token` - Create token
- [x] PUT `/api/sandbox/:id/token/:tokenId` - Update token position
- [x] DELETE `/api/sandbox/:id/token/:tokenId` - Delete token
- [x] GET `/api/sandbox/:id/messages` - Get chat history
- [x] POST `/api/sandbox/:id/message` - Create message

### Previous Phase (Phase 0) - COMPLETED ✅

#### 0.1 Initialize Project
- [x] Create project directory structure
- [x] Initialize Node.js project (`package.json`)
- [x] Set up Git repository
- [x] Create `.gitignore` file

#### 0.2 Choose & Install Tech Stack
- [x] Select frontend framework (React + Vite)
- [x] Select backend framework (Express.js)
- [x] Select database (SQLite)
- [x] Select real-time library (Socket.io)
- [x] Install dependencies

#### 0.3 Project Structure
- [x] Create client directory structure
- [x] Create server directory structure
- [x] Set up build configuration (Vite)
- [x] Configure development hot-reload (nodemon + concurrently)

### Current Phase Tasks

Phase 7-11 will be implemented next.

### Current Status
Phase 8 complete! Full chat system is now working with message history persistence, real-time synchronization, and smart timestamp formatting. All users can chat in real-time with sender identification. Ready for Phase 9 - Link Sharing (note: some link sharing already exists in GMPanel from Phase 5).

---

## Technology Stack Decisions

| Component | Choice | Reason |
|-----------|--------|--------|
| Frontend Framework | React 19 | Most popular, great ecosystem |
| Backend Framework | Express 5 | Simple, flexible, well-documented |
| Database | SQLite (better-sqlite3) | Simple setup, no external dependencies |
| WebSocket Library | Socket.io | Easy to use, handles reconnection |
| Build Tool | Vite | Fast, modern, great DX |
| Canvas Library | Konva + React-Konva | Simplifies canvas interactions |

---

## Completed Milestones

- **2025-10-22**: Phase 8 complete - Chat System
  - ChatPanel component with scrollable message list
  - Message input field with send button
  - Sender name and timestamp display
  - Smart timestamp formatting (time for today, date for older)
  - Auto-scroll to bottom on new messages
  - Real-time message synchronization via WebSocket
  - Chat history persistence (loads from database)
  - Disabled state when character name not set
  - Smooth slide-in animation for new messages
  - All users can chat in real-time

- **2025-10-21**: Phase 7 complete - Token System
  - TokenPanel component with color picker and name input
  - Click-to-place token creation workflow
  - Full drag-and-drop token movement
  - Right-click context menu for deletion
  - Token-image association (tokens tied to specific maps)
  - Real-time synchronization across all clients
  - Optimistic UI updates for smooth interaction
  - All users can create, move, and delete any token

- **2025-10-21**: Phase 6 complete - Image Display & Interaction
  - ImageCanvas component with full zoom/pan controls
  - Mouse wheel zoom (0.5x to 5x range)
  - Click-and-drag panning with visual feedback
  - Reset view button
  - Zoom level display
  - Real-time synchronization of active view changes
  - Smooth image transitions
  - Auto-centering on image load

- **2025-10-21**: Phase 5 complete - Image Management (GM)
  - Complete GMPanel component with all image management features
  - File upload with image naming
  - Real-time image list with active highlighting
  - Image activation/switching functionality
  - GM and Player link sharing with copy-to-clipboard
  - WebSocket integration for real-time updates
  - All users see image changes instantly

- **2025-10-21**: Phase 4 complete - Sandbox view and WebSocket integration
  - Complete 3-column layout (GM panel, canvas, right panel)
  - Character name modal for players with localStorage persistence
  - WebSocket connection with useSocket custom hook
  - Real-time connection status indicator
  - Role-based UI rendering (GM vs Player views)
  - Placeholder areas for image canvas, tokens, and chat

- **2025-10-21**: Phase 3 complete - Front page and routing
  - Beautiful landing page with gradient design
  - Sandbox creation flow with API integration
  - React Router setup with dynamic routes
  - URL parameter parsing for role and sandbox ID
  - Error handling and loading states

- **2025-10-21**: Phase 2 complete - WebSocket real-time infrastructure
  - Room-based Socket.io architecture (one room per sandbox)
  - Complete event system for tokens, images, chat
  - Events: join-sandbox, token-created/moved/deleted, chat-message, active-view-changed, image-uploaded
  - REST API integrated with WebSocket broadcasts
  - All CRUD operations now emit real-time updates

- **2025-10-21**: Phase 1 complete - Database and REST API ready
  - SQLite database with all tables (sandboxes, images, tokens, chat_messages)
  - Complete REST API for all operations
  - File upload system with multer
  - All endpoints tested and working

- **2025-10-21**: Phase 0 complete - Project setup and infrastructure ready
  - React + Vite frontend configured
  - Express backend with Socket.io
  - Development environment with hot-reload
  - Server successfully running on port 3001

---

## Known Issues

_None yet_

---

## Next Steps

1. Build React frontend pages (landing page and sandbox page)
2. Implement client-side routing with URL parameters
3. Create sandbox view with role-based layout
4. Integrate Socket.io client for real-time updates
5. Build UI components (GM panel, token panel, chat, canvas)

---

## Notes

- Implementation started: 2025-10-21
- Following implementation-plan.md
