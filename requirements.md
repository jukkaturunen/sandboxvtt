# SandboxVTT - Technical Requirements Document

## 1. Project Overview

### 1.1 Purpose
A minimal online Virtual Table Top (VTT) application for playing role-playing games. SandboxVTT is designed as a lightweight, ephemeral sandbox that can be created on-the-fly for quick game visualization.

### 1.2 Key Principles
- Minimal setup - no user authentication or registration
- Ephemeral sandboxes accessed via unique links
- Real-time synchronization across all participants
- Simple, focused feature set

---

## 2. System Architecture

### 2.1 Application Structure
- **Pages**: 2 total pages
  1. Front page - sandbox creation
  2. Sandbox page - game session interface

### 2.2 User Roles
- **Game Master (GM)**: Creator of the sandbox with full control
- **Player**: Invited participants with limited control
- **Role determination**: Via URL parameter (no authentication)

### 2.3 Technical Stack Requirements
- **Real-time communication**: WebSocket-based (Socket.io or similar)
- **Database**: Persistent storage for sandbox data
- **File storage**: Image upload and storage system
- **Client-side storage**: LocalStorage for user preferences

---

## 3. Functional Requirements

### 3.1 Front Page

#### 3.1.1 Sandbox Creation
- **FR-1.1**: Provide interface to create new sandbox
- **FR-1.2**: Generate unique sandbox ID upon creation
- **FR-1.3**: Redirect GM to sandbox page with GM role parameter
- **FR-1.4**: Generate shareable GM and player invite links

### 3.2 Sandbox Session Management

#### 3.2.1 Link-Based Access
- **FR-2.1**: Sandbox accessible only through unique link
- **FR-2.2**: GM link must include GM role parameter
- **FR-2.3**: Player invite link must include player role parameter
- **FR-2.4**: Both links must include sandbox ID

#### 3.2.2 Persistence
- **FR-2.5**: Sandbox state persists between sessions
- **FR-2.6**: No expiration mechanism (persists indefinitely)

### 3.3 Character Naming (Players Only)

#### 3.3.1 Initial Name Setup
- **FR-3.1**: Show popup when player first accesses sandbox via invite link
- **FR-3.2**: Prompt player to enter character name
- **FR-3.3**: Save sandbox ID and character name to localStorage
- **FR-3.4**: Character name used for token identification and chat messages

#### 3.3.2 Returning Players
- **FR-3.5**: Check localStorage on page load
- **FR-3.6**: If sandbox ID and character name exist, skip name prompt
- **FR-3.7**: Automatically use stored character name

### 3.4 Image Management

#### 3.4.1 Image Upload (GM Only)
- **FR-4.1**: GM can upload multiple images to sandbox
- **FR-4.2**: GM can assign custom name to each uploaded image
- **FR-4.3**: Uploaded images persist in sandbox

#### 3.4.2 Image Display
- **FR-4.4**: One image designated as "active view"
- **FR-4.5**: Active view visible to all users (GM and players)
- **FR-4.6**: GM can preview non-active images (visible only to GM)
- **FR-4.7**: GM can switch active view (updates for all users)
- **FR-4.8**: Active image highlighted in GM's image list

#### 3.4.3 Image Interaction
- **FR-4.9**: All users can independently zoom the active image
- **FR-4.10**: All users can independently pan the active image
- **FR-4.11**: Tokens maintain relative position to image during zoom/pan
- **FR-4.12**: Zoom and pan state is client-side only (not synchronized)

### 3.5 Token Management

#### 3.5.1 Token Panel
- **FR-5.1**: Floating panel in upper right corner
- **FR-5.2**: Panel accessible to all user roles
- **FR-5.3**: Panel contains color selector for tokens
- **FR-5.4**: Panel contains text field for token name tag

#### 3.5.2 Token Creation
- **FR-5.5**: Any user can create tokens on the active view
- **FR-5.6**: Tokens display chosen color
- **FR-5.7**: Tokens display name tag below the token
- **FR-5.8**: Created tokens sync to all connected users

#### 3.5.3 Token Manipulation
- **FR-5.9**: Any user can move any token
- **FR-5.10**: Token positions sync to all connected users
- **FR-5.11**: Right-click on token shows delete option
- **FR-5.12**: Any user can delete any token
- **FR-5.13**: Token deletions sync to all connected users

#### 3.5.4 Token Persistence
- **FR-5.14**: Token positions persist when active view changes
- **FR-5.15**: Tokens remain associated with specific images
- **FR-5.16**: Tokens reappear when their associated image becomes active

### 3.6 Right Panel Interface

#### 3.6.1 Tabbed Interface
- **FR-6.1**: Right panel uses tabbed navigation for different functions
- **FR-6.2**: Three tabs: Tokens, Chat, and Players
- **FR-6.3**: Tab names displayed with small uppercase font
- **FR-6.4**: Active tab highlighted with turquoise accent color

#### 3.6.2 Tokens Tab
- **FR-6.5**: Token creation interface accessible to all user roles
- **FR-6.6**: Color selector for tokens (10 color options)
- **FR-6.7**: Text field for token name tag
- **FR-6.8**: "Click on Map to Place" button to activate placement mode
- **FR-6.9**: Instructions text explaining token usage

#### 3.6.3 Chat Tab
- **FR-6.10**: Scrollable message history
- **FR-6.11**: Text input field for new messages
- **FR-6.12**: Messages identified by sender's character name (for players)
- **FR-6.13**: Messages identified as "Game Master" (for GM)
- **FR-6.14**: Messages display in chronological order with timestamps
- **FR-6.15**: Chat messages persist across sessions
- **FR-6.16**: Message history loads when joining sandbox

#### 3.6.4 Players Tab
- **FR-6.17**: Display list of all connected players in real-time
- **FR-6.18**: Show player count (e.g., "3 Players Connected")
- **FR-6.19**: Each player entry shows circular avatar with first letter of name
- **FR-6.20**: Display player name and role (Game Master or Player)
- **FR-6.21**: List updates instantly when players join or leave
- **FR-6.22**: Players see themselves in the list

### 3.7 GM Control Panel

#### 3.7.1 Panel Layout
- **FR-7.1**: Panel located on left side of sandbox view
- **FR-7.2**: Panel visible only to GM role
- **FR-7.3**: Panel hidden for player role

#### 3.7.2 Link Sharing
- **FR-7.4**: Display player invite link at bottom of panel
- **FR-7.5**: Click player link to copy to clipboard
- **FR-7.6**: Show confirmation note when player link copied
- **FR-7.7**: Display GM link at bottom of panel
- **FR-7.8**: Click GM link to copy to clipboard
- **FR-7.9**: Show confirmation note when GM link copied

#### 3.7.3 Image Management Interface
- **FR-7.10**: Button to import/upload new images
- **FR-7.11**: Prompt for image name during upload
- **FR-7.12**: Display list of all uploaded images with names
- **FR-7.13**: Click image name to preview (GM only, doesn't change active view)
- **FR-7.14**: "Activate" button for each image
- **FR-7.15**: Clicking "Activate" sets image as active view for all users
- **FR-7.16**: Highlight currently active image in list
- **FR-7.17**: GM must click active image's "Activate" button to return to active view from preview

---

## 4. Real-Time Synchronization Requirements

### 4.1 Synchronization Scope
- **RT-1**: Active view changes (GM activation of images)
- **RT-2**: Token creation, movement, and deletion
- **RT-3**: Chat messages
- **RT-4**: Image uploads (appear in GM's list)
- **RT-5**: Player join/leave events
- **RT-6**: Connected player list updates

### 4.2 Performance Requirements
- **RT-7**: Updates must sync across all clients within 1-2 seconds
- **RT-8**: Implement optimistic UI updates with server confirmation
- **RT-9**: Player list updates occur instantly (< 500ms)

### 4.3 Connection Management
- **RT-10**: Handle network disconnections gracefully
- **RT-11**: Implement automatic reconnection logic
- **RT-12**: Maintain session state during temporary disconnections
- **RT-13**: Restore synchronized state when reconnecting
- **RT-14**: Display real-time connection status indicator
- **RT-15**: Automatically rejoin sandbox room on reconnection

### 4.4 Player Tracking
- **RT-16**: Track all connected players per sandbox
- **RT-17**: Store player socket ID, name, role, and join time
- **RT-18**: Broadcast player list to all clients on join/leave
- **RT-19**: Support on-demand player list requests
- **RT-20**: Clean up player data on disconnect

### 4.5 Architecture
- **RT-21**: Event-driven architecture for state changes
- **RT-22**: WebSocket-based communication layer (Socket.io)
- **RT-23**: Room-based architecture for sandbox isolation

---

## 5. Data Persistence Requirements

### 5.1 Database Storage
- **DB-1**: Sandbox metadata (ID, creation timestamp)
- **DB-2**: Image metadata (name, file reference, active status)
- **DB-3**: Token data (position, color, name, associated image)
- **DB-4**: Chat message history
- **DB-5**: Current active view state

### 5.2 File Storage
- **FS-1**: Uploaded image files
- **FS-2**: File naming/organization scheme
- **FS-3**: Association between image files and sandbox ID

### 5.3 Client-Side Storage
- **CS-1**: Sandbox ID (localStorage)
- **CS-2**: Character name (localStorage)
- **CS-3**: Zoom/pan state (client-side only, not persisted)

---

## 6. User Interface Requirements

### 6.1 Layout Structure
- **UI-1**: Responsive canvas for image display (center)
- **UI-2**: GM control panel (left side, GM only)
- **UI-3**: Right panel with tabbed interface (Tokens, Chat, Players)
- **UI-4**: Dark color scheme (shades of black, grey, and turquoise)

### 6.2 Visual Feedback
- **UI-5**: Loading indicators for image uploads
- **UI-6**: Copy confirmation notifications (toast)
- **UI-7**: Active image highlighting
- **UI-8**: Connection status indicator (Connected/Disconnected)
- **UI-9**: Popup modal for character name input
- **UI-10**: Tab highlighting with turquoise accent
- **UI-11**: Hover effects on interactive elements
- **UI-12**: Player avatars with turquoise gradient
- **UI-13**: Smooth animations for tab transitions

### 6.3 Interaction Patterns
- **UI-14**: Right-click context menu for tokens
- **UI-15**: Click-to-copy for invite links
- **UI-16**: Drag-and-drop or click for token placement
- **UI-17**: Drag for panning images
- **UI-18**: Mouse wheel or pinch for zooming
- **UI-19**: Click tabs to switch between Tokens, Chat, and Players
- **UI-20**: Real-time updates without page refresh

---

## 7. Non-Functional Requirements

### 7.1 Security
- **NF-1**: Sandboxes accessible only via unique, unguessable IDs
- **NF-2**: No cross-sandbox data leakage
- **NF-3**: Input sanitization for character names, token names, and chat messages

### 7.2 Performance
- **NF-4**: Image loading optimization
- **NF-5**: Efficient token rendering for multiple tokens
- **NF-6**: Smooth zoom and pan operations

### 7.3 Scalability
- **NF-7**: Support multiple concurrent sandboxes
- **NF-8**: Support multiple users per sandbox (typical: 1 GM + 3-6 players)

### 7.4 Browser Compatibility
- **NF-9**: Modern browser support (Chrome, Firefox, Safari, Edge)
- **NF-10**: LocalStorage support required

---

## 8. Out of Scope

The following features are explicitly NOT included in this version:
- User authentication or account system
- Sandbox expiration or cleanup
- Drawing tools or measurement tools
- Dice rolling functionality
- Character sheets or stat tracking
- Audio/video communication
- Mobile app (web-only)
- Sandbox search or discovery features
- Admin or moderation tools

---

## 9. Future Considerations

Potential enhancements for future versions (not required now):
- Fog of war
- Grid overlay options
- Token templates/presets
- Image drawing/annotation tools
- Dice roller integration
- Sandbox cleanup/archival after inactivity
- Mobile-optimized interface

---

## 10. Success Criteria

The implementation will be considered successful when:
1. GM can create sandbox and share both GM and player links
2. Players can join via invite link and set character names
3. GM can upload images and control active view
4. All users can create, move, and delete tokens
5. All users can send and receive chat messages
6. All users can see connected players in real-time
7. All actions sync in real-time across all connected clients
8. Sandbox state persists between sessions
9. Returning users automatically reconnect without re-entering info
10. Connection status updates properly on connect/disconnect/reconnect
11. Player list updates instantly when players join or leave
