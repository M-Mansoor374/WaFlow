# WaFlow — Frontend Developer Task Breakdown
**Tech Stack:** React (Vite) + TailwindCSS + Shadcn/UI  
**All screens must be:** Mobile-first (375px & 768px tested), RTL-compatible, Urdu-ready, loading/empty/error states handled, page load < 2 seconds

---

## 🔧 GLOBAL / FOUNDATIONAL SETUP
*Do this first — everything depends on it*

- [ ] Project scaffold: Vite + React + TailwindCSS + Shadcn/UI configuration
- [ ] Routing setup (React Router) with protected routes and tenant-aware URL structure
- [ ] Global layout shell: sidebar nav, top header bar, content area
- [ ] RTL layout system: toggle entire dashboard to RTL when Urdu or Arabic is selected
- [ ] Theme engine: support custom primary/accent colors per tenant (for white-label)
- [ ] i18n setup: English / Urdu / Arabic language switching (per-user preference)
- [ ] Font loading: Jameel Noori Nastaleeq, Noto Nastaliq Urdu for Urdu mode
- [ ] Reusable component library: buttons, inputs, modals, dropdowns, badges, avatars, toasts
- [ ] WebSocket client: connect to backend, handle reconnect on drop, expose to app via context
- [ ] Global notification system: browser notifications + sound alerts (configurable per agent)
- [ ] Empty state, loading skeleton, and error boundary components for every major section
- [ ] Date/time formatting utilities: PKT default, per-account timezone, DD/MM/YYYY format
- [ ] Phone number formatting utility: +92 3XX XXXXXXX Pakistani format
- [ ] Currency formatting utility: PKR with Pakistani comma notation

---

## 📥 MODULE 01 — Inbox & Conversation Management

### INB-01 Real-Time Shared Team Inbox `[P0]`
- [ ] Three-panel layout: conversation list (left) → chat thread (center) → contact sidebar (right)
- [ ] Conversation list: shows contact name, last message snippet, timestamp, unread count badge
- [ ] Real-time unread count badge — updates via WebSocket without page refresh
- [ ] Sound alert and browser push notification on new message (toggle per agent in settings)
- [ ] Mobile responsive: collapses to single-panel with back navigation

### INB-02 Conversation Assignment System `[P0]`
- [ ] Assignee avatar + name shown prominently on each conversation card
- [ ] "Unassigned" pool as a visually distinct separate tab/view
- [ ] Assign button in conversation thread: opens agent selector dropdown
- [ ] Assignment history entries in conversation timeline
- [ ] Auto-assign rules config UI (round-robin, keyword routing, time-based routing)

### INB-03 Collision Prevention `[P0]`
- [ ] "Agent X is typing..." live indicator in conversation header, visible to all viewers
- [ ] Soft lock warning banner when a second agent tries to reply to a locked conversation
- [ ] Hard lock override modal with mandatory reason field
- [ ] Lock auto-expires after 60s of inactivity (visual countdown optional)

### INB-04 Conversation Labels & Status `[P0]`
- [ ] Status pill on every conversation: Open / Pending / Resolved / Snoozed
- [ ] Snoozed status picker: date-time input for wake time
- [ ] Label chips: color-coded, shown on conversation card
- [ ] One-click label application from inside conversation view
- [ ] Bulk operations toolbar: appears when conversations are selected (checkboxes)
- [ ] Filter bar: filter inbox by label, status, assignee, WhatsApp number (combinable)

### INB-05 Full Conversation History & Search `[P0]`
- [ ] Global search bar: searches across all message content, contact names, phone numbers
- [ ] Search results page: snippet preview + contact name + date
- [ ] Search filters: date range picker, message type, WhatsApp number
- [ ] Contact sidebar: "Previous Conversations" section in chronological order
- [ ] Message-level timestamps and delivery status icons (sent ✓ / delivered ✓✓ / read ✓✓ in blue)

### INB-06 Rich Media Send & Preview `[P0]`
- [ ] Compose area: drag-and-drop zone for file upload
- [ ] File size validation UI — show error before upload if over WhatsApp limits
- [ ] Inline image preview in thread (no click-to-open required)
- [ ] Video thumbnail with play button overlay in thread
- [ ] Document message: icon + filename + file size display
- [ ] Location message: embedded map preview (Google Maps or OpenStreetMap iframe)
- [ ] Media type selector in compose area (image, video, audio, document, location)

### INB-07 Internal Agent Notes `[P1]`
- [ ] Notes input in compose area (toggle between "Reply" and "Note" mode)
- [ ] Notes rendered in a visually distinct color/style in thread (e.g., yellow background)
- [ ] Note header: author avatar + name + timestamp always visible
- [ ] `@mention` autocomplete: type `@` to get agent dropdown in note input

### INB-08 Quick Replies Library `[P1]`
- [ ] Type `/` in compose to trigger quick reply dropdown
- [ ] Dropdown shows matching replies filtered as user types
- [ ] Quick replies sorted by usage count (most used first)
- [ ] Quick replies management page: create / edit / delete at account or personal level
- [ ] Variable preview in quick replies: `{{contact_name}}` shown resolved in dropdown

### INB-09 Contact Merge & Deduplication `[P1]`
- [ ] Duplicate contact flagging UI: yellow warning on contact profiles with similar names/numbers
- [ ] Contact merge modal: select two contacts, choose primary, preview merged result, confirm
- [ ] Merge audit log table (viewable in contact profile)

---

## 👥 MODULE 02 — Contact CRM & Segmentation

### CRM-01 Contact Profiles `[P0]`
- [ ] Contact profile sidebar: visible while in conversation (no page switch)
- [ ] Sidebar shows: name, phone, email, company, language preference, tags, lifecycle stage
- [ ] Inline edit of contact fields directly from conversation sidebar
- [ ] Custom fields section: render based on tenant's configured fields (text, number, date, dropdown, checkbox)
- [ ] Full contact profile page (accessible from contacts list)

### CRM-02 Contact Import `[P0]`
- [ ] CSV/XLSX file upload UI with drag-and-drop (max 50,000 rows)
- [ ] Visual column mapper: drag imported columns to match WaFlow fields
- [ ] Validation report view: list of rows with errors before confirming import
- [ ] Duplicate handling choice: radio buttons for Skip / Overwrite / Merge
- [ ] Import progress indicator (runs in background)
- [ ] Import history table with "Undo Last Import" button

### CRM-03 Tagging System `[P0]`
- [ ] Tag input with autocomplete from existing tag library
- [ ] Tag chips displayed on contact profile and in conversation sidebar
- [ ] Bulk tag action: select multiple contacts → apply/remove tags
- [ ] Tag creation inline (type new tag name and press enter)

### CRM-04 Advanced Segmentation Filters `[P0]`
- [ ] Segment builder UI: add filter rows, each with field selector + operator + value
- [ ] AND/OR logic toggle between filter rows
- [ ] Live contact count preview as filters change
- [ ] Save segment as named audience (name input + save button)
- [ ] Saved segments list page

### CRM-05 Contact Activity Timeline `[P1]`
- [ ] Chronological timeline on contact profile page
- [ ] Each entry shows event type icon + description + timestamp
- [ ] Timeline filter: filter by event type (messages, broadcasts, flows, tags, notes, purchases)
- [ ] "Export to PDF" button on timeline

### CRM-06 Opt-In & Opt-Out Management `[P0]`
- [ ] Opt-in status badge on contact profile: Opted In (green) / Opted Out (red) / Unknown (grey)
- [ ] Manual status change button on contact profile
- [ ] Consent audit log table on contact profile
- [ ] Bulk opt-in import UI (CSV upload with consent records)

### CRM-07 Contact Lifecycle Stages `[P1]`
- [ ] Lifecycle stage badge on contact profile (color-coded, configurable)
- [ ] Kanban board view: columns per lifecycle stage, contact cards draggable between columns
- [ ] Stage configuration page: create/rename/reorder/color stages
- [ ] Stage filter in contact list and broadcast audience

---

## ⚙️ MODULE 03 — Visual Flow Builder & Automation

### FLOW-01 Visual Drag-and-Drop Canvas `[P0]`
- [ ] Full-screen canvas using **React Flow** library
- [ ] Zoom in/out controls + pan + "Fit to Screen" button
- [ ] Grid snap for nodes
- [ ] Right-click context menu on nodes: Duplicate / Delete / View Stats
- [ ] Undo/redo support (Ctrl+Z / Ctrl+Y) with full history
- [ ] Auto-save indicator ("Saved 30s ago") + manual Save button
- [ ] Flow name and description editable inline in canvas header

### FLOW-02 Complete Node Library `[P0]`
Each node type is a distinct React component with a configuration panel (opens in right sidebar when node is clicked).

**Trigger Nodes — build UI + config panel for each:**
- [ ] Keyword Trigger: keyword list input, exact/contains/regex toggle, case-sensitive toggle
- [ ] First Message: per-number or all-numbers toggle
- [ ] Opt-In Event: source tracking label input
- [ ] Button Click: button value input
- [ ] Schedule Trigger: cron-like config (daily/weekly/one-time), timezone picker
- [ ] Webhook Trigger: generated webhook URL display, auth token, field mapping UI
- [ ] Tag Added: tag selector dropdown
- [ ] Stage Changed: source stage + target stage selectors
- [ ] Broadcast Reply: broadcast selector dropdown

**Action Nodes — build UI + config panel for each:**
- [ ] Send Text: textarea with variable autocomplete (`{{`), typing delay slider (0–5s)
- [ ] Send Template: template selector, variable value mapping inputs
- [ ] Send Media: file upload or URL input, caption textarea
- [ ] Send Buttons: up to 3 button label inputs, type toggle (reply / link)
- [ ] Send List: section header + item title + description inputs (up to 10 items)
- [ ] Send Location: lat/long fields or address input
- [ ] Send Catalog: product selector from catalog
- [ ] Assign Agent: agent selector or round-robin group toggle
- [ ] Add Tag: tag multi-select
- [ ] Remove Tag: tag multi-select
- [ ] Update Field: field selector + value input (static or variable)
- [ ] Change Stage: lifecycle stage selector
- [ ] Trigger Webhook: URL input, headers editor, body template textarea with variables
- [ ] Send Email: SMTP template selector, to/from/subject fields
- [ ] Wait / Delay: duration input (minutes/hours/days) or specific time picker
- [ ] End Flow: optional "trigger another flow" selector

**Condition Nodes — build UI + config panel for each:**
- [ ] Condition Check: field selector + operator dropdown + value input; Yes/No output branches
- [ ] Message Contains: keyword input, regex toggle, case options
- [ ] Time of Day: time range pickers, business hours toggle
- [ ] Day of Week: day checkboxes
- [ ] Random Split: percentage split inputs (2–4 paths), must sum to 100%
- [ ] Has Tag: tag selector + has/does not have toggle
- [ ] Input Validator: validate-as selector (phone/email/number/date), pass/fail branches

### FLOW-03 Variable System `[P0]`
- [ ] `{{` autocomplete dropdown in all text fields: shows available variables with categories
- [ ] Variable picker: contact variables, system variables, flow input variables
- [ ] Preview mode: button that resolves all variables with sample data and shows rendered message

### FLOW-04 Flow Templates Library `[P0]`
- [ ] Templates gallery page: card grid with template name, description, use-case tags
- [ ] "Install" button per template — copies flow into account as editable draft
- [ ] Template preview: shows flow diagram before installing
- [ ] Templates: Welcome flow, Business hours auto-reply, FAQ bot, Appointment booking, Order status, Lead qualification, Post-purchase review, Abandoned cart, Restaurant menu bot, Real estate inquiry handler

### FLOW-05 Human Handoff `[P0]`
- [ ] Handoff node component in canvas
- [ ] Config panel: assign to specific agent / team / unassigned pool
- [ ] SLA timer config: 5 / 15 / 30 / 60 minutes dropdown

### FLOW-06 Flow Versioning `[P1]`
- [ ] Version history panel (accessible from canvas): list of versions with date + publisher + change summary
- [ ] Active version badge clearly labeled
- [ ] "Rollback" button per version with confirmation modal
- [ ] Draft vs Live version indicator in canvas header

### FLOW-07 Flow Duplication & Sharing `[P1]`
- [ ] "Duplicate" button on flow list page — prompts for new name
- [ ] "Export as .waflow" button — triggers JSON file download
- [ ] "Import .waflow" — file upload button on flows page
- [ ] (Agency only) "Push to Clients" button with client account multi-select

---

## 📢 MODULE 04 — Broadcast & Campaign Engine

### BCAST-01 Broadcast Composer `[P0]`
- [ ] Multi-step broadcast creation wizard: Audience → Message → Preview → Schedule → Send
- [ ] Audience selection: saved segment picker / manual contact selection / CSV upload / all contacts
- [ ] Live contact count display (updates as audience filters change)
- [ ] Message type selector: text / template / image+caption / video+caption / document / interactive buttons
- [ ] Variable personalization input per message field
- [ ] Preview pane: renders message exactly as recipient sees it (WhatsApp chat bubble style)
- [ ] Schedule options: "Send Now" or datetime picker with timezone selector

### BCAST-02 Anti-Ban UI `[P0]`
- [ ] Send rate config slider (e.g., 1 message per X–Y seconds, randomized)
- [ ] Daily send limit warning indicator per number
- [ ] Number rotation toggle (if multiple numbers connected)
- [ ] Inactive contact filter toggle: "Exclude contacts inactive for X days" with input
- [ ] Ban detection alert banner (shown if number quality drops during active send)

### BCAST-03 Broadcast Analytics Dashboard `[P0]`
- [ ] Per-broadcast analytics page: sent / delivered / read / reply counts (real-time during send)
- [ ] Delivery rate, read rate, reply rate percentage metrics
- [ ] "View Replies" expandable section: list of contacts who replied + message content
- [ ] Failed sends list: contact name + number + error reason
- [ ] Revenue attribution section (if enabled): revenue from this broadcast
- [ ] Benchmark comparison: this broadcast vs account average
- [ ] "Export CSV" and "Export PDF" buttons

### BCAST-04 Drip Campaign Builder `[P0]`
- [ ] Visual timeline layout: horizontal or vertical sequence of steps
- [ ] Each step card shows: message content preview + delay from previous step
- [ ] Add/remove/reorder steps
- [ ] Delay config per step: minutes / hours / days / specific day+time
- [ ] Entry conditions config: tag added / form submitted / contact created / manual enroll
- [ ] Exit conditions config: contact replies / purchases / tag added / keyword
- [ ] Active subscriber count shown per step
- [ ] A/B message variant toggle per step with split % input
- [ ] Pause/Resume drip global toggle

### BCAST-05 Smart Retargeting `[P1]`
- [ ] Post-broadcast retargeting panel on broadcast analytics page
- [ ] "Create segment" buttons: "Did not open" / "Opened but didn't reply" / "Replied"
- [ ] Pre-populate new broadcast with retargeting segment (one click)

### BCAST-06 Broadcast A/B Testing `[P1]`
- [ ] A/B test setup step in broadcast composer: sample size % input, Variant A + B message composition
- [ ] Winner metric selector: read rate / reply rate / conversion rate
- [ ] Auto-send winner config: "Send to remaining after X hours" input
- [ ] Results comparison view: Variant A vs B side by side with metrics

---

## 📊 MODULE 05 — Analytics & Revenue Intelligence

### ANL-01 Executive Dashboard `[P0]`
- [ ] Health Score widget: 0–100 gauge/donut, prominently displayed
- [ ] Today vs Yesterday comparison cards: conversations, messages, new contacts, revenue
- [ ] KPI metric cards: avg first response time, resolution rate, automation rate
- [ ] Conversation status donut chart (Open / Pending / Resolved / Snoozed)
- [ ] Message volume sparkline chart: last 30 days
- [ ] Top performing agent widget
- [ ] Alerts section: number quality warnings, missed SLAs, campaigns finishing

### ANL-02 Flow Performance Analytics `[P0]`
- [ ] Flow selector dropdown to switch between flows
- [ ] Per-flow summary: total enters, completion rate, average time to complete
- [ ] Node-level stat overlays: each node in the flow canvas shows a contact count badge
- [ ] Edge thickness / color visualization: thicker/darker = more contacts passed through
- [ ] Button click distribution: bar chart per button option with percentages
- [ ] Unanswered questions log: table of keywords that hit human handoff
- [ ] Conversion rate metric (if flow has purchase/form/appointment end)
- [ ] Average time at each wait node

### ANL-03 Revenue Attribution Engine `[P0]`
- [ ] Manual sale logging UI: from conversation view, "Mark as Converted" button + sale value input
- [ ] Revenue by channel chart: broadcast vs flow vs human conversation (stacked bar)
- [ ] Revenue by agent leaderboard
- [ ] Revenue by time heatmap: best hours/days
- [ ] Monthly revenue trend line chart
- [ ] ROI calculator widget: subscription cost input vs attributed revenue output
- [ ] Attribution window config: 72hr default, editable in settings

### ANL-04 Team Performance Analytics `[P0]`
- [ ] Per-agent metrics table: conversations handled, avg first response time, avg resolution time, CSAT score
- [ ] Team leaderboard (toggled on/off by admin)
- [ ] Peak hours heatmap: agents active vs contacts messaging (grid/calendar heatmap)
- [ ] Missed conversations list: conversations unanswered > X minutes (X configurable)
- [ ] Response time distribution histogram
- [ ] Filters: date range picker, agent selector, WhatsApp number selector

### ANL-05 Contact Intelligence `[P1]`
- [ ] Contact growth chart: line graph, toggleable by day/week/month
- [ ] Geographic distribution chart: inferred from phone prefix
- [ ] Engagement distribution: pie/donut chart (highly active / moderately active / inactive)
- [ ] Opt-in/opt-out trend: line chart over time
- [ ] Tag distribution: horizontal bar chart of most common tags
- [ ] Best time to message: heatmap per contact page + aggregate view

### ANL-06 Automated Weekly Report Config `[P1]`
- [ ] Report settings page: day/time config, recipient email list, metrics toggle checkboxes
- [ ] "Preview report" button: generate sample report preview in-app

### ANL-07 Industry Benchmarking `[P2]`
- [ ] Industry category selector (Restaurant / Retail / Real Estate / Education / Healthcare / Services)
- [ ] Benchmark comparison bars: your metric vs industry benchmark
- [ ] Percentile display: "You are faster than X% of [industry]"
- [ ] "Available from Month 4" gating UI with explanation

---

## 📝 MODULE 06 — Template Management

### TPL-01 Template Builder `[P0]`
- [ ] Template creation form with sections: Category → Header → Body → Footer → Buttons
- [ ] Category selector: Marketing / Utility / Authentication
- [ ] Header type toggle: text / image / video / document (with upload for media headers)
- [ ] Body textarea with `{{1}}`, `{{2}}` variable placeholder support
- [ ] Footer text input
- [ ] Button builder: up to 3 Quick Reply buttons or 2 CTA buttons (phone/URL), add/remove button rows
- [ ] Live phone preview (WhatsApp chat bubble UI): updates in real-time as you type
- [ ] Character count with limit warnings per section

### TPL-02 Template Submission & Status `[P0]`
- [ ] "Submit to Meta" button on template detail page
- [ ] Status badge: Pending (yellow) / Approved (green) / Rejected (red)
- [ ] Rejection reason display panel (when available)
- [ ] Edit + Re-submit flow for rejected templates
- [ ] Approval time estimate shown ("Typically 24–48 hours")

### TPL-03 Template Library `[P0]`
- [ ] Pre-built templates gallery: cards with category, language, approval likelihood indicator
- [ ] Template preview modal before copying
- [ ] "Use as Starting Point" button: opens builder pre-filled with template content
- [ ] Language variant filter: English / Urdu / Arabic
- [ ] Community templates section (high-performing user-shared templates)

---

## 🛒 MODULE 07 — WhatsApp Catalog & Commerce

### CAT-01 Product Catalog Manager `[P0]`
- [ ] Products list page: table with name, price, SKU, availability, WhatsApp sync status
- [ ] Add/Edit product form: name, description, price (currency selector: PKR/AED/SAR/USD), SKU, availability toggle
- [ ] Multi-image upload per product (up to 10 images) with drag-to-reorder
- [ ] Categories and subcategories management
- [ ] Bulk CSV import for products
- [ ] WhatsApp sync status indicator per product (synced / pending / error)

### CAT-02 Catalog Sharing in Conversations `[P0]`
- [ ] Product picker in compose area: search/browse catalog
- [ ] Single product send + product collection (multi-select) send
- [ ] Cart contents viewer in conversation sidebar (when customer has active cart)

### CAT-03 Order Management `[P1]`
- [ ] Orders list page: table with order ID, customer, items, total, status, date
- [ ] Order detail page: full line items, quantities, customer info, status timeline
- [ ] Order status update dropdown: Received → Confirmed → Processing → Shipped → Delivered
- [ ] Search and filter orders (by status, date range, customer)
- [ ] "Export to CSV" button

### CAT-04 Payment Link Integration `[P0]`
- [ ] Payment link generator in compose area: select provider (JazzCash / EasyPaisa / Stripe), enter amount + description + expiry
- [ ] Payment link message preview before sending
- [ ] Payment records list page: amount, method, status, date
- [ ] Payment confirmation note displayed in conversation timeline (auto-injected on success)

---

## 🌐 MODULE 08 — Multi-Language & Localization

### L10N-01 Full Urdu Interface `[P0]`
- [ ] All UI strings translated to Urdu (work with translation file)
- [ ] RTL layout fully applied when Urdu is selected (flex/grid direction, text alignment, icons mirrored)
- [ ] Font switcher in settings: Jameel Noori Nastaleeq vs Noto Nastaliq Urdu
- [ ] Urdu keyboard works in all text inputs and flow builder text nodes

### L10N-02 Arabic Interface `[P1]`
- [ ] All UI strings translated to Arabic (Modern Standard Arabic)
- [ ] RTL layout applied when Arabic selected

### L10N-03 Multilingual Flow Builder `[P0]`
- [ ] Language tag selector on each message node in flow builder
- [ ] Language detection result displayed in flow analytics
- [ ] Language condition node (branch by detected language)
- [ ] Preview renders Arabic/Urdu fonts correctly in flow preview mode

### L10N-04 Pakistan Timezone & Number Format `[P0]`
- [ ] Default timezone set to Asia/Karachi (PKT), configurable per account
- [ ] All datetime displays respect account timezone
- [ ] Phone number formatter applied globally
- [ ] PKR currency formatter applied globally
- [ ] DD/MM/YYYY date format applied globally

---

## 🏢 MODULE 09 — Agency & Multi-Business Features

### AGY-01 Agency Master Account `[P0]`
- [ ] Agency dashboard: table of all client accounts with health summary (messages, active flows, last activity)
- [ ] "Switch to Client" one-click account context switcher (no re-login, visible in top nav)
- [ ] "Create New Client Account" button + form
- [ ] Assign agency team members to specific clients UI
- [ ] Agency-level aggregate analytics dashboard

### AGY-02 White Label Mode `[P1]`
- [ ] White label settings page: logo upload, primary color picker, accent color picker
- [ ] Custom domain field (CNAME instruction shown)
- [ ] Custom email sender field
- [ ] "Remove WaFlow branding" toggle
- [ ] White-label login page config: background image upload, custom tagline
- [ ] Live preview of branded dashboard as you configure

### AGY-03 Flow Push to Clients `[P1]`
- [ ] Flow list page: "Push to Clients" button per flow
- [ ] Client selector modal: multi-select list of client accounts
- [ ] Push confirmation with override warning if clients already have this flow
- [ ] Version tracking table: shows which clients have which flow version

### AGY-04 Client Reporting `[P1]`
- [ ] Report schedule config: client selector, frequency, recipient email, metrics to include
- [ ] "Generate & Send Now" button
- [ ] Report preview in-app before sending
- [ ] Report history list (past reports sent with download link)

---

## 🔌 MODULE 10 — Integrations & API

### INT-01 Native Webhook System `[P0]`
- [ ] Webhooks list page: table of configured webhooks with event type, URL, status
- [ ] Add/Edit webhook form: URL, HTTP method, auth header, custom payload template editor
- [ ] "Send Test" button: sends sample payload to URL, shows response
- [ ] Webhook logs table: last 100 deliveries with timestamp, status code, response body

### INT-02 Public REST API `[P1]`
- [ ] API Keys management page: generate, name, revoke keys
- [ ] Link to /api/docs (Swagger UI embedded or linked)

### INT-03 Zapier Integration `[P1]`
- [ ] Zapier connection page: "Connect to Zapier" link + instructions
- [ ] Pre-built Zap templates shown with "Use this Zap" links

### INT-04 Google Sheets Integration `[P0]`
- [ ] "Connect Google Account" OAuth button
- [ ] Sheet selector dropdown after OAuth
- [ ] Visual field mapper: drag sheet columns to WaFlow contact fields
- [ ] Sync frequency toggle: real-time / hourly
- [ ] Sync log table: last sync time, records synced, error count

### INT-05 Shopify Integration `[P1]`
- [ ] "Connect Shopify Store" OAuth button + store URL input
- [ ] Automation config: order confirmation / shipping notification / abandoned cart toggle + hours delay
- [ ] Integration status dashboard: last sync, events processed

### INT-06 WooCommerce Integration `[P1]`
- [ ] WooCommerce REST API key input + site URL
- [ ] Same automation config as Shopify
- [ ] Product catalog sync toggle

---

## 💳 MODULE 11 — Billing, Subscriptions & Plans

### BILL-01 Subscription Plan Management `[P0]`
- [ ] Pricing plans page (public + in-app): 3 plan cards — Starter $49 / Growth $99 / Agency $249
- [ ] Feature comparison table per plan
- [ ] Current plan highlighted with "Upgrade" / "Downgrade" CTAs
- [ ] Plan change confirmation modal

### BILL-02 Payment Processing `[P0]`
- [ ] Payment method selector: Stripe (card) / JazzCash / EasyPaisa / Bank Transfer
- [ ] Stripe card input (Stripe.js Elements)
- [ ] JazzCash and EasyPaisa UI flows (redirect or API-driven)
- [ ] Bank transfer: payment proof file upload
- [ ] Currency toggle: USD or PKR
- [ ] Receipt download link on billing history page

### BILL-03 Usage Dashboard `[P0]`
- [ ] Usage meters: progress bars for contacts used/limit, agents/limit, broadcasts this month
- [ ] Meta conversation fees running total with breakdown by conversation type
- [ ] Usage history table: monthly breakdown for last 12 months
- [ ] Upgrade prompt banner at 80% of any limit
- [ ] "Upgrade Plan" button directly in usage dashboard

---

## 🔐 MODULE 12 — Security, Compliance & Account Management

### SEC-01 Role-Based Access Control `[P0]`
- [ ] Team members management page: list with role badges, invite / edit / remove actions
- [ ] Role selector dropdown on invite/edit: Owner / Admin / Supervisor / Agent / View Only
- [ ] Permission matrix visible (what each role can do) — shown during invite
- [ ] "Invite by email" form

### SEC-02 Two-Factor Authentication `[P0]`
- [ ] 2FA setup flow: QR code display for TOTP apps + manual entry code
- [ ] WhatsApp OTP option UI
- [ ] Backup codes page: display 10 backup codes with download/copy option
- [ ] Sessions management page: list of active sessions with device/IP/time + "Revoke" button
- [ ] Admin "Enforce 2FA for all team members" toggle in security settings

### SEC-03 Data Security `[P0]`
- [ ] Data export button: "Download All My Data" with confirmation + progress
- [ ] Account deletion flow: multi-step confirmation with "all data deleted within 30 days" notice
- [ ] Audit log table: all admin actions with IP, timestamp, user (filterable, exportable)

### SEC-04 Number Health Monitoring `[P0]`
- [ ] Number health card per WhatsApp number: Green/Yellow/Red quality indicator
- [ ] Alert banners in dashboard when quality drops to Yellow or Red
- [ ] Block report widget: how many contacts blocked this number this week
- [ ] Number health history line chart: quality over last 90 days
- [ ] In-app best practices tips panel for maintaining number health

---

## ✅ DEFINITION OF DONE CHECKLIST (for every screen you build)
Before marking any screen complete, verify:
- [ ] Works at 375px (mobile) and 768px (tablet) widths
- [ ] Empty state UI designed (what shows when no data)
- [ ] Loading skeleton UI designed
- [ ] Error state UI designed (API failures, validation errors)
- [ ] RTL layout does not break when Urdu/Arabic selected
- [ ] All user text inputs are sanitized (no XSS possible from frontend)
- [ ] Page loads in < 2 seconds

---

## 📐 FRONTEND-SPECIFIC ARCHITECTURE NOTES
- **State Management:** Use React Context + Zustand (or Redux Toolkit) for global state (auth, tenant, WebSocket)
- **Real-time:** WebSocket client shared via Context — inbox, conversation typing indicators, notification counts all consume it
- **React Flow:** Used for the flow builder canvas (Module 03) — plan for custom node components
- **Charts:** Use Recharts or Chart.js for all analytics charts
- **Forms:** React Hook Form + Zod for all form validation
- **File uploads:** Handle drag-and-drop + click-to-upload with progress indicators
- **API layer:** Axios instance with JWT auth header + 401 refresh token interceptor
- **White label:** Primary/accent colors must be CSS variables so they can be swapped per tenant at runtime
- **RTL:** Use `dir="rtl"` on root element and Tailwind `rtl:` variants for layout flips