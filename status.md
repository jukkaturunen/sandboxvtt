# SandboxVTT - Implementation Status

**Last Updated**: 2025-10-28

---

## Overall Progress

| Phase | Status | Progress | Notes |
|-------|--------|----------|-------|
| Phase 0: Project Setup | ✅ Complete | 100% | All tasks done |
| Phase 1: Database & Backend | ✅ Complete | 100% | All endpoints working |
| Phase 2: WebSocket Infrastructure | ✅ Complete | 100% | Real-time events ready |
| Phase 3: Front Page & Creation | ✅ Complete | 100% | Routing and pages done |
| Phase 4: Sandbox View & Layout | ✅ Complete | 100% | Layout and WebSocket ready |
| Phase 5: Image Management | ✅ Complete | 100% | Upload, list, activate, preview |
| Phase 6: Image Display | ✅ Complete | 100% | Canvas with zoom/pan done |
| Phase 7: Token System | ✅ Complete | 100% | All token features working |
| Phase 8: Right Panel Tabbed UI | ✅ Complete | 100% | Tokens, Chat, Players tabs |
| Phase 9: Player Tracking | ✅ Complete | 100% | Real-time player list |
| Phase 10: Polish & Error Handling | ✅ Complete | 100% | All improvements done |
| Phase 11: Chat Channels & Private Messaging | ✅ Complete | 100% | All-to-all + 1-on-1 messaging |
| Phase 12: Testing & Deployment | ⏳ Not Started | 0% | - |

**Overall Completion**: 11/12 phases (92%)

---

## Current Phase: Phase 12 - Testing & Deployment

### Previous Phase (Phase 10) - COMPLETED ✅

#### 10.1 Error Handling
- [x] Improved GMPanel error handling with toast notifications
- [x] Enhanced CharacterNameModal with validation and error messages
- [x] Added WebSocket reconnection handling (5 attempts with 1s delay)
- [x] Added connect_error event handler in useSocket
- [x] Removed alert() calls, replaced with better UX

#### 10.2 Loading States
- [x] Created LoadingSpinner component (small, medium, large sizes)
- [x] Added inline spinner option for buttons
- [x] Integrated loading spinner in GMPanel upload button
- [x] Existing "Uploading..." text preserved with visual spinner

#### 10.3 Input Validation
- [x] CharacterNameModal: min 2 chars, max 30 chars validation
- [x] Real-time error clearing on input change
- [x] TokenPanel: maxLength={20} validation
- [x] ChatPanel: maxLength={500} validation
- [x] Fixed deprecated onKeyPress to onKeyDown

#### 10.4 UI/UX Improvements
- [x] Added ARIA labels to CharacterNameModal (role="dialog", aria-labelledby, etc.)
- [x] Added aria-invalid and aria-describedby for error states
- [x] Responsive design breakpoints (1024px and 768px)
- [x] Mobile-friendly layout (GM panel collapses, right panel hides)
- [x] Improved connection status display on small screens
- [x] Visual error message styling with colored border

#### 10.5 Performance Optimization
- [x] Token dragging already optimized (updates only on mouseUp, not on every mousemove)
- [x] Optimistic UI updates for token movement
- [x] WebSocket reconnection with exponential backoff built-in
- [x] Image upload validation (file type and size limits already in place)

### Previous Phase (Phase 9) - COMPLETED ✅

#### 9.1 Link Generation
- [x] Generate player invite URL with role=player
- [x] Generate GM URL with role=gm
- [x] Display links in GM panel Share Links section
- [x] Use window.location.origin for base URL

#### 9.2 Copy to Clipboard
- [x] Implement clipboard API for player link
- [x] Implement clipboard API for GM link
- [x] Handle browser compatibility with catch handler

#### 9.3 Copy Confirmation
- [x] Show toast notification when link copied
- [x] Style notification with slide-down animation
- [x] Auto-dismiss notification after 3 seconds
- [x] Display appropriate message for GM vs Player link

### Previous Phase (Phase 9) - COMPLETED ✅

**Real-Time Player Tracking** - Fully functional player list with real-time updates

#### 9.1 Backend Player Tracking
- [x] Added sandboxPlayers Map to server for tracking connected players
- [x] Enhanced join-sandbox event to accept {sandboxId, playerName, role}
- [x] Store player info: socketId, name, role, joinedAt timestamp
- [x] Broadcast updated player list on join/leave/disconnect events
- [x] Implemented request-players-list event for on-demand list requests
- [x] Clean up player data on disconnect with proper room cleanup
- [x] Fixed WebSocket proxy errors (EPIPE, ECONNRESET) suppression

#### 9.2 Frontend Integration
- [x] Updated useSocket hook to accept playerName and role parameters
- [x] Pass characterName and role from SandboxPage to useSocket
- [x] Created PlayersPanel component with real-time player list
- [x] Register event listener and request player list on mount
- [x] Display player count header (e.g., "3 Players Connected")
- [x] Show circular avatars with first letter of player name
- [x] Display player name and role (Game Master or Player)
- [x] Fixed timing issue - players now see themselves in the list

#### 9.3 Connection Status Improvements
- [x] Enhanced connection status indicator with real-time updates
- [x] Added handleConnect, handleDisconnect, handleReconnect functions
- [x] Automatically rejoin sandbox room on reconnection
- [x] Proper cleanup of event listeners to prevent memory leaks
- [x] Connection status updates immediately on state changes

### Previous Phase (Phase 8) - COMPLETED ✅

**Tabbed Right Panel Interface** - Clean, organized UI with dark theme

#### 8.1 Tabbed Navigation
- [x] Created RightPanel component with tab navigation
- [x] Implemented three tabs: Tokens, Chat, Players
- [x] Styled tabs with small uppercase font (0.85rem)
- [x] Added active tab highlighting with turquoise accent (#4ecdc4)
- [x] Removed individual panel headings (tabs provide context)
- [x] Smooth fade-in animations when switching tabs

#### 8.2 Tokens Tab
- [x] Moved TokenPanel into tabbed structure
- [x] Updated styling to match dark theme (#2c3e50 background)
- [x] Color picker and input work seamlessly in tabbed layout
- [x] Instructions text styled with muted grey (#95a5a6)

#### 8.3 Chat Tab
- [x] Created ChatPanel component with dark theme
- [x] Scrollable message container with custom scrollbar
- [x] Message input field and Send button
- [x] Empty state message ("No messages yet...")
- [x] Auto-scroll to bottom on new messages
- [x] Display sender name (turquoise) and timestamp (grey)
- [x] Format timestamps (today shows time, older shows date)
- [x] Style messages with dark cards (#34495e)
- [x] Smooth slide-in animation for new messages
- [x] Send messages via Enter key or Send button
- [x] Message persistence and history loading

#### 8.4 Players Tab
- [x] Created PlayersPanel component (integrated in Phase 9)
- [x] Prepared structure for real-time player tracking
- [x] Placeholder replaced with functional player list

#### 8.5 Dark Color Scheme
- [x] Unified color scheme across all panels
- [x] Background: #2c3e50 (dark blue-grey)
- [x] Inputs/elements: #34495e (medium dark)
- [x] Text: #ecf0f1 (light), #95a5a6 (muted)
- [x] Accents: #4ecdc4 (turquoise)
- [x] Matching GM panel colors for visual consistency
- [x] Custom scrollbars styled to match theme

#### 8.6 Chat Backend Integration
- [x] POST message to /api/sandbox/:id/message
- [x] Include sender_name and sender_role
- [x] Clear input after sending
- [x] Disable input/button when no character name set

#### 8.7 Receiving Messages
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

### Recent Updates (2025-10-28)

#### Phase 11: Chat Channels & Private Messaging - COMPLETED ✅

**Channel-Based Chat System** - All-to-all broadcasting + private 1-on-1 messaging

##### 11.1 Database Schema Updates
- [x] Added `recipient_name` column to `chat_messages` table (nullable)
- [x] NULL recipient = message to ALL (broadcast)
- [x] Specific recipient = private 1-on-1 message
- [x] Database migration handling for existing installations

##### 11.2 Backend API Enhancements
- [x] Updated `POST /api/sandbox/:id/message` to accept optional `recipient_name`
- [x] Updated `GET /api/sandbox/:id/messages` with `?for_player=<name>` query filter
- [x] Added `getMessagesForPlayer` prepared statement for efficient filtering
- [x] Messages filtered server-side: shows ALL messages + private messages to/from player
- [x] Socket.io `chat-message` event includes `recipient_name` for client filtering

##### 11.3 Channel Pills UI
- [x] Horizontal scrollable channel selector above chat messages
- [x] Compact design: 11px font, 4px/10px padding, 4px gaps
- [x] "ALL" channel always first and selected by default
- [x] Dynamic player channels (one pill per connected player)
- [x] Selected channel: turquoise background (#4ecdc4)
- [x] Unread channel indicator: pulsating orange background animation
- [x] Hidden scrollbar for clean appearance

##### 11.4 Message Filtering & Routing
- [x] Client-side message filtering based on selected channel
- [x] ALL channel: shows only messages where `recipient_name === null`
- [x] Player channel: shows messages between current user and selected player
- [x] Outgoing messages include correct `recipient_name` based on selected channel
- [x] Smart channel detection using `getMessageChannel()` function

##### 11.5 Unread Notification System
- [x] **Tab-level indicator**: Orange dot on "Chat" tab when tab is inactive and new messages arrive
- [x] **Channel-level indicator**: Orange pulsating background on channel pills for unread messages
- [x] Indicators clear automatically when user views the channel/tab
- [x] Works even when right panel is collapsed (components stay mounted)
- [x] Fixed rendering approach: all tabs always mounted but hidden with CSS

##### 11.6 Component Architecture Improvements
- [x] RightPanel now always renders all tabs (not conditional mounting)
- [x] Active/hidden states controlled via CSS classes
- [x] ChatPanel stays mounted and listening to Socket.io events even when hidden
- [x] Proper prop passing: `isActiveTab` and `onUnreadChange` callbacks
- [x] Players list shared from RightPanel to ChatPanel
- [x] Efficient React hooks: `useCallback` for memoization

##### 11.7 Visual Design
- [x] Channel pills match dark theme (#2c3e50 background)
- [x] Small 6px orange dot on tab button with pulse animation
- [x] Smooth transitions and animations throughout
- [x] Compact spacing to minimize vertical space usage
- [x] Clean, minimal design consistent with existing UI

##### 11.8 Testing & Edge Cases
- [x] Messages correctly filtered for each player
- [x] Private messages hidden from other players
- [x] Indicators work when chat tab is inactive
- [x] Indicators work when right panel is collapsed
- [x] Channel pills update dynamically as players join/leave
- [x] No performance issues with real-time updates

**Result**: Fully functional channel-based chat system with private messaging, ready for production. Future-proof architecture prepared for dice roll integration.

---

#### Production Deployment & Bug Fixes
- [x] **Deployment Infrastructure**
  - Created comprehensive deployment setup for DigitalOcean Ubuntu servers
  - PM2 ecosystem configuration for process management
  - Deployment scripts (setup.sh, deploy.sh) for one-command deployment
  - Optional nginx reverse proxy configuration
  - Complete DEPLOYMENT.md documentation (400+ lines)
  - Environment configuration templates (.env.production, .env.example)
  - Production build scripts added to package.json

- [x] **Production Features**
  - Configurable PUBLIC_CLIENT_PORT for flexible deployment
  - Server serves built React app in production (NODE_ENV=production)
  - Automatic CORS configuration based on SERVER_IP and port
  - Express 5 compatibility fix for wildcard routes (regex pattern)
  - Health check endpoint monitoring ready

- [x] **Bug Fixes**
  - Fixed canvas controls hidden under right panel (animated CSS right property)
  - Fixed Express 5 wildcard route syntax error (changed '*' to regex)
  - Fixed clipboard API for HTTP environments (fallback to document.execCommand)
  - Share links now work in production without HTTPS

- [x] **Image Positioning Improvements**
  - Images now center properly on activation and reset
  - Automatic zoom-to-fit calculation (scales to show full image)
  - Works for both active images and GM preview mode
  - Center-based positioning algorithm accounting for transform-origin
  - Images never cropped - always fully visible on canvas
  - GM preview images also center and fit automatically

### Recent Updates (2025-10-27)

#### Collapsible Panel System
- [x] **Floating Panel Architecture**
  - Refactored from CSS Grid to layered layout approach
  - Canvas now full-width (100vw) and never resizes
  - Side panels float on top of canvas with `position: absolute`
  - Eliminates image jumping issue entirely

- [x] **Collapse Functionality**
  - White triangle arrows in canvas header control panel visibility
  - Arrows positioned absolutely and animate with panels
  - Smooth 0.3s slide transitions using `transform: translateX()`
  - Left panel: Slides left, leaving 10px visible edge when collapsed
  - Right panel: Slides right, leaving 10px visible edge when collapsed
  - Arrows slide with their respective panels (always at panel edge)

- [x] **Visual Refinements**
  - All headers unified at exactly 43px height (GM panel, canvas, right panel tabs)
  - Canvas header padding reduced to 0.1rem (left/right) for minimal spacing
  - Collapse arrows vertically centered in header
  - Arrows positioned close to panel edges (left: 250px/10px, right: 300px/10px)
  - No shadows - clean minimalist design
  - Panels maintain fixed width (GM: 250px, Right: 300px)

#### Technical Improvements
- [x] Removed ResizeObserver (no longer needed with full-width canvas)
- [x] Panel containers wrap actual panel components
- [x] Panels always rendered, visibility controlled via CSS transforms
- [x] Higher z-index for arrows (z-index: 25) ensures always visible
- [x] Smooth synchronized animations between panels and arrows

### Recent Updates (2025-10-24)

#### UI/UX Improvements
- [x] Unified color scheme across all panels (GM, Canvas, Right Panel)
- [x] All top bars now have matching height (44px) and color (#1a252f)
- [x] GM Controls header styled to match right panel tabs
- [x] Compact GM panel with reduced padding and centered section headers
- [x] Canvas background changed to #4a5f7f for better contrast
- [x] Zoom controls moved to bottom-right with dark theme styling
- [x] Added +/- buttons for zoom control

#### GM Panel Enhancements
- [x] File upload redesigned with link-style interface
  - "Choose file" displayed as underlined link (centered)
  - Selected file shown with red × cancel button
  - Upload button styled as smaller underlined link (centered)
- [x] Image list section improvements
  - Centered section headers without image count
  - Each image with name and button on single line
  - Smaller activate buttons with compact styling
  - Active images show green background (#27ae60)
  - Image names underlined to show they're clickable
  - Preview mode shows "Exit" button in yellow text
  - Removed "Return to Active" button (exit via image button)
- [x] Share links section
  - Fixed to bottom of GM panel
  - Collapsible with click-to-toggle header
  - Hidden by default with ▼/▲ indicator
  - Reduced button padding (0.3rem)

#### Token System Improvements
- [x] Fixed token placement bug with coordinate system
  - Added `imageLoaded` state to prevent position recalculation
  - Fixed token hit detection to account for zoom scale
  - Tokens now place correctly on first try
- [x] Improved token creation workflow
  - Name input auto-focuses when opening Tokens tab
  - Button text changes: "Give Token a Name" → "Add to Map"
  - Tokens auto-place at canvas center (no click needed)
  - Selected color has white border (red default)
  - Removed click-to-place workflow
  - Updated instructions to reflect new workflow

### Current Status
Phase 10 complete with extensive UI polish and innovative collapsible panel system! Application features:
- Floating panels over full-width canvas (eliminates image jumping)
- Smooth collapsible UI with 10px visible edges
- Unified design with 43px headers across all panels
- Professional VTT experience similar to industry-standard tools
All major features production-ready with excellent UX. Ready for Phase 11 - Testing & Deployment.

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

- **2025-10-24**: UI/UX Polish & Token System Improvements
  - Unified color scheme and layout across all interface elements
  - Compact GM panel with improved file upload and image management
  - Fixed critical token placement bug
  - Redesigned token creation for better UX (auto-place at center)
  - Enhanced visual consistency with matching headers and styling
  - Improved zoom controls with +/- buttons
  - Collapsible share links section

- **2025-10-22**: Phase 10 complete - Polish & Error Handling
  - Comprehensive error handling with toast notifications
  - LoadingSpinner component for better loading states
  - Input validation across all forms (character names, tokens, chat)
  - ARIA labels and accessibility improvements
  - Responsive design for mobile and tablet (breakpoints at 1024px and 768px)
  - Mobile layout optimization (GM panel collapses, canvas prioritized)
  - WebSocket reconnection with retry logic
  - Optimistic UI updates already in place for tokens
  - Removed all alert() calls in favor of better UX
  - Visual error messages with proper styling

- **2025-10-22**: Phase 9 complete - Link Sharing
  - GM and Player invite link generation
  - Copy-to-clipboard functionality for both links
  - Toast notification system with slide-down animation
  - Auto-dismiss after 3 seconds
  - Error handling for clipboard API failures
  - Fixed positioning at top center of screen
  - Links include full URL with sandbox ID and role parameter
  - Improved UX over basic alert() notifications

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

- **2025-10-22**: Phase 5 complete - Image Management (GM) - UPDATED
  - Complete GMPanel component with all image management features
  - File upload with image naming
  - Real-time image list with active highlighting
  - Image activation/switching functionality
  - **GM-only Image Preview feature (Section 5.4)**
    - Click image name or "Preview" button to preview without activating
    - Preview mode shows yellow border and "Preview Mode" indicator
    - "Previewing" badge on currently previewed image
    - "Return to Active" button to exit preview mode
    - Preview doesn't affect what players see (GM-only)
    - Tokens still shown for previewed images
  - Images no longer auto-activate on upload (GM must manually activate)
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
