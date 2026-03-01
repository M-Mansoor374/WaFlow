● MEETECH SOLUTIONS
WaFlow
WhatsApp Business Automation Platform
─────────────────────────────────
COMPLETE PRODUCT REQUIREMENTS DOCUMENT
Maximum Viable Product — Full Feature Specification
Version 1.0   ·   February 2026   ·   CONFIDENTIAL

Executive Summary

WaFlow is a full-stack WhatsApp Business Automation Platform built specifically for SMEs in Pakistan, UAE, Saudi Arabia, and the broader MENA region. It is not a minimal viable product. It is the most complete, most affordable, and most locally relevant WhatsApp business tool ever built for this market.

The global WhatsApp automation market is dominated by tools built for Western markets (Wati, AiSensy, Interakt, Kommo) that charge hidden per-message fees, offer English-only interfaces, integrate with Stripe instead of JazzCash/EasyPaisa, and provide analytics that show message delivery but cannot tell a business owner how much revenue their WhatsApp channel is generating. WaFlow fixes every one of these problems.

Metric	Target
Target Markets	Pakistan, UAE, Saudi Arabia, Egypt, Bangladesh
Primary Customer	SMEs: Restaurants, Retail, Real Estate, Education, Healthcare
Pricing Model	Flat monthly SaaS — zero per-message markup
Launch Timeline	Full platform in 4 months, beta in month 3
Revenue Target (Month 12)	$18,000 MRR / 150 customers
Team Size	7 engineers working full-time
Tech Stack	Node.js + React + PostgreSQL + WhatsApp Business API

 
System Architecture Overview

Tech Stack Decisions

Backend	Node.js (Express/Fastify) + PostgreSQL + Redis. Node is ideal for WhatsApp API event-driven architecture. PostgreSQL for all relational data. Redis for session management, queue processing, and rate limiting.

Frontend	React (Vite) + TailwindCSS + Shadcn/UI. Fast, component-based, easy to build multi-tenant dashboards. Mobile-first design — many SME owners will access via phone.

WhatsApp API	360dialog as primary BSP (Business Solution Provider). Fastest onboarding, $5-10/month per number, official Meta partner. Fallback: direct Cloud API integration for enterprise clients.

Queue System	BullMQ (Redis-based). All message sends go through queues. Handles rate limiting, retries, scheduling, and anti-spam delays automatically.

Hosting	DigitalOcean App Platform + Managed PostgreSQL + Managed Redis. Estimated cost: $120-180/month for production. Scalable to 500+ customers without architecture change.

Auth	JWT + Refresh tokens. Multi-tenant isolation at database level (tenant_id on every table). Row-Level Security in PostgreSQL.

Payments	Stripe (international) + JazzCash API + EasyPaisa API. First platform in this space to support local Pakistan payment methods natively.

Database Schema — Core Tables

Every table includes: id (UUID), tenant_id (UUID FK), created_at, updated_at, deleted_at (soft deletes). Multi-tenancy enforced at application AND database level.

Table	Key Fields	Purpose
tenants	id, name, plan, billing_status, whatsapp_numbers[]	Top-level account per business
users	id, tenant_id, email, role, permissions[], language_pref	Agents and admins
whatsapp_numbers	id, tenant_id, phone, waba_id, display_name, status	Connected WA numbers
contacts	id, tenant_id, phone, name, tags[], custom_fields (JSONB), opt_in_status	Customer CRM
conversations	id, tenant_id, contact_id, assigned_to, status, labels[], last_message_at	Chat threads
messages	id, conversation_id, direction, type, content (JSONB), status, wa_message_id	Individual messages
flows	id, tenant_id, name, trigger_type, nodes (JSONB), edges (JSONB), is_active, stats (JSONB)	Automation flows
broadcasts	id, tenant_id, name, template_id, audience_filter, schedule_at, status, stats (JSONB)	Bulk campaigns
templates	id, tenant_id, name, category, language, components (JSONB), wa_status	WA message templates
analytics_events	id, tenant_id, event_type, entity_id, metadata (JSONB), occurred_at	All trackable events
subscriptions	id, tenant_id, plan, amount, currency, payment_method, next_billing_at	Billing records

 
MODULE 01
Inbox & Conversation Management
The command center for all WhatsApp communications

Overview
The shared inbox is where agents spend 80% of their time. It must be fast, real-time, collision-proof, and organized. Every design decision prioritizes speed and clarity over features.

INB-01  Real-Time Shared Team Inbox    [P0 — Critical] 
All incoming WhatsApp messages across all connected numbers appear in a single, unified inbox. Updates are real-time via WebSocket — no page refresh needed. Multiple agents see the same inbox simultaneously.
•	Messages appear within 500ms of receipt
•	WebSocket connection auto-reconnects on drop without losing messages
•	Unread count badge updates in real-time across all open sessions
•	Sound and browser notification on new message (configurable per agent)
•	Mobile-responsive — fully functional on smartphone browser

INB-02  Conversation Assignment System    [P0 — Critical] 
Conversations can be manually assigned to specific agents, or automatically assigned via rules. Assignment is visible to all agents. Prevents two agents from working on the same conversation.
•	Manual assign: any agent can assign any conversation to any other agent
•	Auto-assign rules: round-robin by agent, keyword-based routing, time-based routing
•	Assigned conversations show assignee avatar and name prominently
•	Unassigned pool is a separate view — clear visual distinction
•	Agent can reassign or return to unassigned pool
•	Assignment history logged in conversation timeline

INB-03  Conversation Collision Prevention    [P0 — Critical] 
When Agent A is actively typing or viewing a conversation, Agent B sees a live indicator. Two agents cannot send a reply to the same conversation within the same 30-second window without explicit override.
•	"Agent X is typing..." indicator visible to all agents viewing the same conversation
•	Soft lock: warning shown if second agent attempts to reply
•	Hard lock override available with reason field
•	Lock expires automatically after 60 seconds of inactivity

INB-04  Conversation Labels & Status    [P0 — Critical] 
Every conversation has a status (Open, Pending, Resolved, Snoozed) and supports multiple custom labels. Labels are color-coded and filterable.
•	Statuses: Open, Pending Customer Reply, Resolved, Snoozed (with wake time)
•	Unlimited custom labels with custom colors
•	One-click label application from conversation view
•	Bulk label/status operations from inbox list view
•	Filter inbox by any combination of label, status, assignee, number

INB-05  Full Conversation History & Search    [P0 — Critical] 
Every message ever exchanged with a contact is stored and searchable. No pagination limits on history. Search across message content, contact name, phone number.
•	Full-text search across all messages (PostgreSQL full-text index)
•	Search results show conversation snippet + contact + date
•	Filter search by date range, message type, number
•	Contact sidebar shows all previous conversations in chronological order
•	Message-level timestamps, delivery status (sent/delivered/read) visible

INB-06  Rich Media Send & Preview    [P0 — Critical] 
Agents can send and receive images, videos, audio, documents, location pins, and interactive buttons from within the inbox.
•	Drag-and-drop file upload in compose area
•	File size validation before upload (WhatsApp limits enforced)
•	Image preview in conversation thread (no click-to-open)
•	Video thumbnail preview with play button
•	Document icon with filename and size
•	Location message shows embedded map preview

INB-07  Internal Agent Notes    [P1 — High] 
Agents can leave internal notes on conversations that are never sent to the customer. Notes appear in a distinct color in the conversation thread.
•	Notes visible to all agents with inbox access
•	Note author and timestamp always shown
•	Notes searchable via global search
•	@mention another agent in a note (triggers notification)

INB-08  Quick Replies Library    [P1 — High] 
Agents can save frequently used responses as quick replies and insert them with a / shortcut. Reduces response time for common questions.
•	Create quick replies at account level (shared) or personal level
•	Trigger by typing / in compose box — dropdown shows matching replies
•	Quick replies support variables: {{contact_name}}, {{agent_name}}
•	Usage count tracked — most-used replies shown first
•	Rich text support: quick replies can include links, formatting

INB-09  Contact Merge & Deduplication    [P1 — High] 
When the same customer contacts from different numbers, their history can be merged into one contact record.
•	Duplicate detection: flag contacts with same name or similar phone numbers
•	Manual merge: select two contacts, choose primary, merge histories
•	Merged contacts retain all conversation history from both numbers
•	Merge audit log maintained

 
MODULE 02
Contact CRM & Segmentation
Your customer database — built for WhatsApp-first businesses

CRM-01  Contact Profiles    [P0 — Critical] 
Every contact has a rich profile: name, phone, email, tags, custom fields, conversation history, and computed metrics. The profile is visible in a sidebar while chatting.
•	Default fields: name, phone, email, company, language preference
•	Unlimited custom fields: text, number, date, dropdown, checkbox
•	Custom fields configurable per tenant
•	Profile sidebar visible while in conversation (no page switch)
•	Profile edit available directly from conversation view

CRM-02  Contact Import (CSV/Excel)    [P0 — Critical] 
Import thousands of contacts in one operation. Smart column mapping. Duplicate detection. Field validation.
•	Upload CSV or XLSX file up to 50,000 rows
•	Visual column mapper: drag columns to match WaFlow fields
•	Duplicate detection: skip, overwrite, or merge options
•	Validation report before import: shows rows with errors
•	Import runs in background — email notification on completion
•	Import history with ability to undo last import

CRM-03  Tagging System    [P0 — Critical] 
Contacts can have unlimited tags. Tags are the primary segmentation tool for broadcasts and automation triggers.
•	Unlimited tags per contact
•	Tags auto-suggested from existing tag library
•	Bulk tag: apply/remove tags from contact list selection
•	Tags applied automatically by flow actions
•	Tag-based filtering everywhere: inbox, contact list, broadcast audience

CRM-04  Advanced Segmentation Filters    [P0 — Critical] 
Build dynamic contact segments using AND/OR filter logic across any field, tag, behavior, or custom attribute.
•	Filter by: tag, custom field value, last message date, opt-in status, conversation label, assigned agent, number they messaged
•	AND/OR logic between conditions
•	Save segments as named audiences
•	Segment count shows live as filters change
•	Segments used as broadcast audience or flow trigger

CRM-05  Contact Activity Timeline    [P1 — High] 
Every contact has a full timeline of all interactions: messages, broadcasts received, flows triggered, tags added, notes, and (if connected) purchases.
•	Chronological timeline of all events
•	Filter timeline by event type
•	Export contact timeline to PDF
•	Activity score computed: contacts ranked by engagement level

CRM-06  Opt-In & Opt-Out Management    [P0 — Critical] 
Track WhatsApp marketing consent per contact. Automatically suppress opted-out contacts from broadcasts. Full audit trail of consent changes.
•	Opt-in status field on every contact: Opted In / Opted Out / Unknown
•	Opted-out contacts excluded from all broadcast sends automatically
•	Opt-out keyword detection: contact replies STOP → auto opt-out + confirmation message
•	Bulk opt-in import from external consent records
•	Consent audit log: who changed status, when, how

CRM-07  Contact Lifecycle Stages    [P1 — High] 
Define custom lifecycle stages (e.g., Lead → Prospect → Customer → VIP). Move contacts through stages manually or automatically via flows.
•	Unlimited custom stages with custom names and colors
•	Drag-and-drop Kanban view of contacts by stage
•	Stage changes trigger available as flow conditions
•	Stage history tracked per contact
•	Stage-based filtering for broadcasts

 
MODULE 03
Visual Flow Builder & Automation
Build any conversation flow without writing a single line of code

Architecture Note for Engineering
Flows are stored as node-edge graphs in PostgreSQL (JSONB). The frontend uses React Flow library for the visual canvas. The backend has a Flow Execution Engine that processes flows event-driven via BullMQ. Every flow execution creates an execution_log record for analytics.

FLOW-01  Visual Drag-and-Drop Canvas    [P0 — Critical] 
A full-screen canvas where flows are built by dragging nodes and connecting them with edges. Nodes represent actions or conditions. Edges represent the path a conversation takes.
•	Canvas supports zoom in/out, pan, and fit-to-screen
•	Nodes snap to grid for clean layouts
•	Right-click context menu on nodes: duplicate, delete, view stats
•	Undo/redo with full history (Ctrl+Z / Ctrl+Y)
•	Auto-save every 30 seconds + manual save button
•	Flow name and description editable from canvas header

FLOW-02  Complete Node Library    [P0 — Critical] 
Every type of action or decision a flow can take is represented as a node. Engineers build these as discrete, composable components.

Trigger Nodes (entry points to a flow)
Node Type	Trigger Condition	Config Options
Keyword Trigger	Contact sends a message matching keywords	Exact match, contains, regex; case-sensitive toggle; multiple keywords (OR)
First Message	Contact messages for the first time ever	Per number or across all numbers
Opt-In Event	Contact opts in via link or QR code	Source tracking (which opt-in link)
Button Click	Contact clicks an interactive button	Specific button value matching
Schedule Trigger	Time-based: daily, weekly, one-time	Timezone aware; recurring interval config
Webhook Trigger	External system sends HTTP POST to WaFlow	Custom URL, auth token, field mapping
Tag Added	A specific tag is added to contact	Tag selection; triggers from any tag source
Stage Changed	Contact lifecycle stage changes	Source and target stage selection
Broadcast Reply	Contact replies to a specific broadcast	Per-broadcast trigger

Action Nodes (things the flow does)
Node Type	What It Does	Config Options
Send Text	Send a text message	Message body with variable support; typing simulation delay (0-5s)
Send Template	Send a pre-approved WA template	Template selection; variable mapping
Send Media	Send image, video, audio, document	Upload file or URL; caption support
Send Buttons	Send interactive button message (up to 3 buttons)	Button labels (max 20 chars each); button type: reply or link
Send List	Send interactive list message (up to 10 items)	Section headers, item titles and descriptions
Send Location	Send a map pin	Lat/long or address input
Send Catalog	Send product catalog items	Select from product catalog; single or multi-item
Assign Agent	Assign conversation to specific agent or team	Agent selection or round-robin from group
Add Tag	Add one or more tags to contact	Tag selection; create new tag inline
Remove Tag	Remove tags from contact	Tag selection
Update Field	Update a contact custom field	Field + value (static or from variable)
Change Stage	Move contact to a lifecycle stage	Stage selection
Trigger Webhook	POST data to external URL	URL, headers, body template with variables
Send Email	Send email via connected SMTP/Sendgrid	Template selection, to/from/subject
Wait / Delay	Pause flow execution	Duration (minutes to days); or wait for specific time
End Flow	Terminate this flow execution	Optional: trigger another flow on end

Condition Nodes (branching logic)
Node Type	Branch Logic	Config Options
Condition Check	If/else based on contact field or tag	Field/tag; operator (equals, contains, greater than, etc.); value
Message Contains	Branch based on what contact said	Keywords, regex; case options
Time of Day	Branch by current time	Business hours vs off-hours; custom time ranges
Day of Week	Branch by weekday	Specific day selection; weekday vs weekend
Random Split	A/B test branching	Percentage split across 2-4 paths; tracks which path per contact
Has Tag	Branch if contact has/lacks a tag	Tag selection; has / does not have
Input Validator	Validate what contact typed	Validate as: phone, email, number, date; pass/fail branches

FLOW-03  Variable System    [P0 — Critical] 
Dynamic variables that pull real data into messages at send time. Used in text nodes, template variables, condition values, and webhook payloads.
•	Contact variables: {{contact.name}}, {{contact.phone}}, {{contact.email}}, {{contact.custom.field_name}}
•	System variables: {{business.name}}, {{agent.name}}, {{date.today}}, {{time.now}}
•	Flow input variables: data captured during the current flow execution
•	Variables shown in autocomplete when typing {{ in any text field
•	Preview mode shows variables resolved with sample data

FLOW-04  Flow Templates Library    [P0 — Critical] 
Pre-built flows for the most common use cases. One-click install into any account. Templates are editable after installation.
•	Welcome flow (first-time contact greeting)
•	Business hours auto-reply with human handoff
•	FAQ bot (question → answer tree)
•	Appointment booking (date/time collection → confirmation)
•	Order status inquiry handler
•	Lead qualification (collect name, budget, requirement)
•	Post-purchase review request
•	Abandoned cart recovery (for e-commerce)
•	Restaurant menu bot (show menu, collect order)
•	Real estate inquiry handler (collect property type, budget, area)

FLOW-05  Human Handoff    [P0 — Critical] 
When a flow reaches a point requiring human attention, it can transfer the conversation to the agent inbox with a notification. The flow pauses and waits.
•	Handoff node available in action library
•	Assign to specific agent, team, or unassigned pool
•	Agent receives real-time notification with conversation context
•	Flow resumes from handoff point when agent marks as resolved (optional)
•	Handoff reason logged in conversation timeline
•	SLA timer starts on handoff (configurable: 5/15/30/60 minutes)

FLOW-06  Flow Versioning    [P1 — High] 
Every published flow version is saved. You can roll back to any previous version. Compare versions side by side.
•	Version created on every publish action
•	Version list shows: date, publisher, change summary
•	One-click rollback to any version
•	Active version always clearly labeled
•	Draft version separate from live version (edit without affecting live)

FLOW-07  Flow Duplication & Sharing    [P1 — High] 
Duplicate any flow within an account. Export flows as JSON for sharing between accounts (agency feature).
•	One-click duplicate with new name
•	Export flow as .waflow JSON file
•	Import .waflow file into any account
•	Template marketplace: submit flows to global library (future)
•	Agency accounts can push flows to client accounts

 
MODULE 04
Broadcast & Campaign Engine
Send to thousands. Personalize for each one. Never get banned.

BCAST-01  Broadcast Composer    [P0 — Critical] 
Rich broadcast creation interface. Select audience, compose message, preview, schedule, send.
•	Audience selection: saved segment, manual selection, CSV upload, all contacts
•	Live contact count updates as audience filters change
•	Message types: text, template, image+caption, video+caption, document, interactive buttons
•	Variable personalization: {{contact.name}} works in all message types
•	Preview mode: see message exactly as recipient will see it, with sample data
•	Schedule: send now, or schedule for specific date/time in any timezone

BCAST-02  Anti-Ban Broadcasting System    [P0 — Critical] 
The most important broadcast feature. Meta bans numbers that send too many messages too fast. WaFlow handles this automatically so customers never need to worry about it.
•	Message queue with configurable send rate (default: 1 message per 3-7 seconds randomized)
•	Daily send limit tracking per number (flags when approaching Meta limits)
•	Number rotation: if multiple numbers connected, distributes broadcast load
•	Opt-out checking: removes opted-out contacts from send list at time of send
•	Inactive contact filter: option to exclude contacts who havent messaged in X days
•	Ban detection: if number quality drops during send, pause broadcast + alert admin

BCAST-03  Broadcast Analytics Dashboard    [P0 — Critical] 
Real-time and historical analytics for every broadcast. Beyond just delivery — measures replies and revenue.
•	Real-time: sent count, delivered count, read count, reply count (updates live during send)
•	Delivery rate, read rate, reply rate percentages
•	Replies breakdown: click to see all contacts who replied + what they said
•	Failed sends: list of failed numbers with error reason
•	Revenue attribution: if contact replies then purchases within 72hrs, broadcast gets credit
•	Benchmark comparison: how this broadcast compares to your account average
•	Export report as CSV or PDF

BCAST-04  Drip Campaign Builder    [P0 — Critical] 
Automated multi-step message sequences sent over time. Build once, runs automatically for every new subscriber.
•	Visual timeline: each step shows message content + delay from previous step
•	Delays: minutes, hours, days, specific day of week + time
•	Entry conditions: tag added, form submitted, contact created, manual enroll
•	Exit conditions: contact replies, contact purchases, tag added, specific keyword
•	Active subscriber count shown per step
•	A/B test message variants within drip (split %)
•	Pause/resume drip for all active subscribers

BCAST-05  Smart Retargeting    [P1 — High] 
After sending a broadcast, automatically create follow-up audiences based on engagement.
•	One-click: create segment of contacts who received but did not open
•	One-click: create segment of contacts who opened but did not reply
•	One-click: create segment of contacts who replied
•	Follow-up broadcast pre-populated with audience from retargeting
•	Retargeting available for any completed broadcast

BCAST-06  Broadcast A/B Testing    [P1 — High] 
Test two versions of a broadcast message on a sample audience before sending to everyone.
•	Split test: define sample size % (e.g., 20% of audience)
•	Split 50/50 between Variant A and Variant B
•	Winner metric: read rate, reply rate, or conversion rate
•	Auto-send winner to remaining 80% after X hours
•	Results dashboard: variant comparison side by side

 
MODULE 05
Analytics & Revenue Intelligence
The feature that makes WaFlow a revenue tool, not just a messaging tool

Philosophy
Every other WhatsApp tool shows you how many messages were delivered. WaFlow shows you how much money your WhatsApp channel made. This is the core differentiator and must be excellent at launch.

ANL-01  Executive Dashboard    [P0 — Critical] 
The first screen an account owner sees after login. Shows business health at a glance. Designed for someone who has 30 seconds to check their business.
•	WaFlow Health Score: 0-100 composite score (response time + automation + satisfaction + revenue)
•	Today vs Yesterday: conversations, messages, new contacts, revenue
•	Top metrics cards: average first response time, resolution rate, automation rate
•	Active conversations by status: donut chart
•	Message volume graph: last 30 days sparkline
•	Top performing agent: by conversations resolved
•	Alerts: any number quality warnings, missed SLAs, campaigns finishing

ANL-02  Flow Performance Analytics    [P0 — Critical] 
The most important analytics feature. Shows exactly where contacts drop off in every flow, which buttons get clicked, which paths perform best.
•	Per-flow analytics: total enters, completion rate, average time to complete
•	Node-level analytics: each node shows how many contacts passed through it
•	Drop-off visualization: edges colored by volume — thicker = more contacts
•	Button click distribution: which button options contacts choose (% breakdown)
•	Unanswered questions log: questions that fell through to human handoff by keyword
•	Conversion tracking: if flow ends in purchase/form/appointment, conversion rate shown
•	Time analytics: average time spent at each wait node

ANL-03  Revenue Attribution Engine    [P0 — Critical] 
Connects WhatsApp conversations to revenue. Requires businesses to either connect their e-commerce platform or manually log sales.
•	Manual sales logging: agent can mark a conversation as converted + sale value
•	Shopify integration (Phase 2): auto-pull purchase data and match to contact
•	Attribution window: configurable (default 72 hours from last WhatsApp interaction)
•	Revenue by channel: broadcast vs flow vs human conversation
•	Revenue by agent: which agent drives most conversions
•	Revenue by time: best hours/days for WhatsApp sales
•	Monthly revenue trend chart
•	ROI calculator: WaFlow subscription cost vs attributed revenue

ANL-04  Team Performance Analytics    [P0 — Critical] 
For managers to track agent performance. Fair, transparent metrics.
•	Per-agent: conversations handled, average first response time, average resolution time, customer satisfaction score
•	Team leaderboard (opt-in by admin — can be disabled)
•	Peak hours heatmap: when agents are most active vs when contacts message most
•	Missed conversations: conversations that went unanswered for > X minutes
•	Response time distribution: histogram
•	Filter by date range, agent, number

ANL-05  Contact Intelligence    [P1 — High] 
Analytics about your contact base, not just messages.
•	Contact growth chart: new contacts by day/week/month
•	Geographic distribution: where contacts are located (inferred from phone prefix)
•	Engagement distribution: % of contacts who are highly active / moderately active / inactive
•	Opt-in/opt-out trend: are you growing or shrinking your audience?
•	Tag distribution: most common tags
•	Best time to message: when your contacts are most likely to reply (per contact and aggregate)

ANL-06  Automated Weekly Business Report    [P1 — High] 
Every Monday morning, account owners receive an email with the previous week in numbers. No login required.
•	Auto-generated PDF report: sent every Monday at 9am (configurable)
•	Includes: message volume, response time, new contacts, best performing broadcast, revenue (if tracked)
•	Week-over-week comparison with trend arrows
•	One recommended action based on data (e.g., "Your Sunday response time is 3x higher than other days. Consider scheduling an auto-reply for Sunday.")
•	Configurable: who receives it, which metrics to include, day/time

ANL-07  Industry Benchmarking    [P2 — Medium] 
Compare your metrics against anonymized data from similar businesses in your industry. Turns raw numbers into context.
•	Industry categories: Restaurant, Retail, Real Estate, Education, Healthcare, Services
•	Benchmarks: read rate, reply rate, response time, automation rate
•	Your position shown as percentile: "You are faster than 73% of restaurants"
•	Benchmarks update monthly from aggregate platform data
•	Available from month 4 onwards (needs sufficient platform data)

 
MODULE 06
Template Management
Create, submit, and manage WhatsApp message templates

TPL-01  Template Builder    [P0 — Critical] 
Visual interface to create WhatsApp-approved message templates without understanding Meta's template format requirements.
•	Template categories: Marketing, Utility, Authentication
•	Header options: text, image, video, document
•	Body text with variable placeholders: {{1}}, {{2}} etc.
•	Footer text (shown in gray below message)
•	Button options: Quick Reply (up to 3), Call to Action (phone/URL, up to 2)
•	Live preview updates as you type
•	Character count with limit warnings

TPL-02  Template Submission & Status    [P0 — Critical] 
Submit templates to Meta for approval directly from WaFlow. Track approval status.
•	One-click submit to Meta via WhatsApp Business API
•	Status displayed: Pending, Approved, Rejected
•	Rejection reason shown when available
•	Rejected templates editable and re-submittable
•	Approval time typically 24-48hrs (shown as estimate)
•	Email notification when template is approved or rejected

TPL-03  Template Library    [P0 — Critical] 
Pre-built, Meta-approved template examples for common use cases. One-click copy as starting point.
•	Categories: appointment reminders, order updates, payment reminders, welcome messages, promotional offers
•	Each template shown with approval likelihood indicator
•	Customize from template: all fields editable before submission
•	Language variants: templates available in English, Urdu, Arabic
•	Community templates: high-performing templates shared by WaFlow users (anonymized)

 
MODULE 07
WhatsApp Catalog & Commerce
Sell directly inside WhatsApp conversations

CAT-01  Product Catalog Manager    [P0 — Critical] 
Upload and manage your product catalog within WaFlow. Products sync to WhatsApp Business catalog automatically.
•	Product fields: name, description, price, currency, SKU, image, availability status
•	Bulk upload via CSV
•	Multi-image support per product (up to 10)
•	Categories and subcategories
•	Sync status with WhatsApp catalog shown per product
•	Price in PKR, AED, SAR, USD supported

CAT-02  Catalog Sharing in Conversations    [P0 — Critical] 
Agents or flows can share product cards directly in chat. Customers can browse and add to cart within WhatsApp.
•	Share single product: select from catalog in compose area
•	Share product collection: send multiple products grouped
•	Customer receives native WhatsApp product card with image, price, description
•	Customer can click "Add to Cart" and "View Cart" within WhatsApp
•	Cart contents visible to agent in conversation sidebar

CAT-03  Order Management    [P1 — High] 
When a customer places an order via WhatsApp catalog, track it in WaFlow.
•	Order created automatically on catalog purchase
•	Order fields: items, quantities, total, customer info, status
•	Order status flow: Received → Confirmed → Processing → Shipped → Delivered
•	Status update auto-sends WhatsApp notification to customer
•	Orders list view with search and filter
•	Export orders to CSV

CAT-04  Payment Link Integration    [P0 — Critical] 
Send payment links inside WhatsApp conversations. Customer clicks, pays, and payment is confirmed back to the conversation.
•	JazzCash payment link generation (Pakistan)
•	EasyPaisa payment link generation (Pakistan)
•	Stripe payment link generation (international)
•	Payment link message shows: amount, description, expiry time
•	Auto-webhook: when payment completes, conversation gets a success note
•	Payment confirmation auto-reply to customer
•	All payment records in WaFlow: amount, method, status, date

 
MODULE 08
Multi-Language & Localization
Built for Pakistan and MENA from day one

L10N-01  Full Urdu Interface    [P0 — Critical] 
The entire WaFlow dashboard available in Urdu. RTL layout support. Nastaliq or Naskh font options.
•	All UI text translated to Urdu
•	RTL layout applied when Urdu selected
•	Font options: Jameel Noori Nastaleeq (Nastaliq) and Noto Nastaliq Urdu
•	Urdu keyboard support in flow builder text nodes
•	Urdu quick replies and templates
•	User-level language preference (each agent can set own language)

L10N-02  Arabic Interface    [P1 — High] 
Full Arabic translation of dashboard for UAE and Saudi markets. RTL layout.
•	All UI text in Modern Standard Arabic
•	RTL layout
•	Arabic quick replies and template examples
•	Phase 2 delivery (2 months after Urdu)

L10N-03  Multilingual Flow Builder    [P0 — Critical] 
Build chatbot flows in any language. Send messages in Urdu, Arabic, English or mixed within the same flow.
•	Each message node has language tag
•	Language auto-detected from contact's message (via langdetect)
•	Branch by detected language: send Urdu reply to Urdu speakers, English to others
•	Template variables work in all languages
•	Preview renders fonts correctly for all languages

L10N-04  Pakistan Timezone & Number Format    [P0 — Critical] 
All times shown in PKT (Pakistan Standard Time) by default. Phone numbers displayed in Pakistani format. Currency in PKR.
•	Default timezone: Asia/Karachi (PKT UTC+5)
•	Per-account timezone configuration
•	Phone number format: +92 3XX XXXXXXX
•	Currency display: PKR with Pakistani comma notation
•	Date format: DD/MM/YYYY by default

 
MODULE 09
Agency & Multi-Business Features
Manage all your clients from one place

AGY-01  Agency Master Account    [P0 — Critical] 
An agency account can create, manage, and access unlimited client sub-accounts from a single login. The client never knows WaFlow is behind it.
•	Agency dashboard: list of all client accounts with health summary
•	One-click switch between client accounts (no re-login)
•	Create new client account from agency dashboard
•	Assign agency team members to specific client accounts
•	Agency-level analytics: aggregate stats across all clients
•	Agency billing: consolidated invoice or pass-through billing to clients

AGY-02  White Label Mode    [P1 — High] 
Clients see your agency's brand, not WaFlow's. Full custom branding including logo, colors, and domain.
•	Custom logo upload (replaces WaFlow logo everywhere)
•	Custom primary and accent colors (applied to entire dashboard)
•	Custom domain: clients access via your.agency.com instead of app.waflow.io
•	Custom email sender: notifications come from your agency email
•	All WaFlow branding removed from client-facing UI
•	White-label login page with custom background image

AGY-03  Flow Push to Clients    [P1 — High] 
Agency builds a master flow, pushes it to all client accounts with one action. Clients get the flow pre-installed.
•	Select flow + select target client accounts
•	Flow copies to each client account as a draft
•	Clients can edit or delete their copy
•	Agency can update master and push update to clients (with override warning)
•	Version tracking: which clients have which version

AGY-04  Client Reporting    [P1 — High] 
Generate branded PDF reports for clients. Monthly, weekly, or on-demand.
•	Auto-scheduled: send report to client email on set schedule
•	Branded with agency logo and colors
•	Metrics: message volume, response time, automations, contacts, revenue
•	Month-over-month comparison
•	One-click generate and send from agency dashboard
•	Client can also access their own report from their account

 
MODULE 10
Integrations & API
Connect WaFlow to the tools your customers already use

INT-01  Native Webhook System    [P0 — Critical] 
WaFlow sends real-time webhooks to external systems when events occur. Essential for connecting to custom business systems.
•	Events: new message received, conversation assigned, contact created, tag added, broadcast completed, payment received
•	Webhook config: URL, HTTP method, auth header, custom payload template
•	Webhook test: send sample payload to URL before activating
•	Webhook logs: last 100 deliveries with status code and response body
•	Retry logic: failed webhooks retried 3x with exponential backoff

INT-02  Public REST API    [P1 — High] 
Full REST API for developers to build custom integrations. Documented with OpenAPI spec.
•	Authentication: API key per tenant
•	Endpoints: send message, create contact, get conversations, trigger flow, get analytics
•	Rate limiting: 1000 requests/hour per API key
•	OpenAPI (Swagger) documentation at /api/docs
•	SDK: JavaScript/Node.js SDK published to npm
•	Webhook receiving endpoint for external systems to trigger WaFlow actions

INT-03  Zapier Integration    [P1 — High] 
Connect WaFlow to 5,000+ apps via Zapier without any code.
•	WaFlow as Trigger: new contact, new message, conversation resolved, tag added
•	WaFlow as Action: send message, add tag, create contact, trigger flow
•	Official Zapier app listing
•	Common Zap templates: Google Sheets → WaFlow contact, WaFlow → Google Sheets row, Typeform → WaFlow

INT-04  Google Sheets Integration    [P0 — Critical] 
Most Pakistani SMEs use Google Sheets as their CRM. Native two-way sync.
•	Connect Google account via OAuth
•	Sheet → Contacts: sync rows to WaFlow contacts (column mapping)
•	Contacts → Sheet: write new contacts and conversation data to sheet
•	Sync frequency: real-time or hourly
•	Field mapping UI: drag sheet columns to WaFlow contact fields
•	Sync log: shows last sync time, records synced, errors

INT-05  Shopify Integration    [P1 — High] 
Connect Shopify store for order notifications and abandoned cart recovery.
•	Connect via Shopify OAuth
•	Order created: auto-send order confirmation on WhatsApp
•	Order shipped: auto-send tracking link on WhatsApp
•	Abandoned cart: trigger flow if cart abandoned after X hours
•	Customer phone auto-matched to WaFlow contact
•	Revenue auto-attributed to WhatsApp channel when applicable

INT-06  WooCommerce Integration    [P1 — High] 
Same as Shopify but for WooCommerce (WordPress). More relevant for Pakistani e-commerce.
•	Connect via WooCommerce REST API
•	Order status webhooks trigger WaFlow automations
•	Product catalog sync from WooCommerce to WaFlow catalog
•	Customer auto-created as WaFlow contact on first order

 
MODULE 11
Billing, Subscriptions & Plans
Transparent pricing — the cornerstone of trust

BILL-01  Subscription Plan Management    [P0 — Critical] 
Three clear plans. No per-message markup. No hidden fees. All charges transparent.

Feature	Starter — $49/mo	Growth — $99/mo	Agency — $249/mo
WhatsApp Numbers	1	3	Unlimited
Team Agents	3	15	Unlimited
Contacts	5,000	25,000	Unlimited
Broadcasts/month	5	30	Unlimited
Flows	5 active	25 active	Unlimited
Analytics	Basic	Full + Revenue	Full + Revenue + Agency
Drip Campaigns	No	Yes	Yes
A/B Testing	No	Yes	Yes
White Label	No	No	Yes
Multi-Business	No	No	Yes
API Access	No	Yes	Yes
Support	Email (48hr)	Email (24hr)	Priority WhatsApp
Meta Conversation Fees	At cost — no markup	At cost — no markup	At cost — no markup

BILL-02  Payment Processing    [P0 — Critical] 
Accept payments in Pakistan and internationally. First WhatsApp SaaS to support JazzCash and EasyPaisa subscriptions.
•	Stripe: credit/debit card, international customers
•	JazzCash: Pakistani mobile wallet and bank
•	EasyPaisa: Pakistani mobile wallet
•	Manual bank transfer option with payment proof upload (for enterprise)
•	All payments in USD or PKR (user choice)
•	Automatic receipt emailed on every charge
•	Failed payment: 3-day grace period with daily retry before suspension

BILL-03  Usage Dashboard    [P0 — Critical] 
Real-time usage meters so customers never get surprised by overages.
•	Live meters: contacts used / limit, agents / limit, broadcasts used this month
•	Meta conversation fees: running total for current billing period, broken down by conversation type
•	Usage history: monthly breakdown for last 12 months
•	Upgrade prompt when approaching 80% of any limit
•	One-click upgrade from usage dashboard

 
MODULE 12
Security, Compliance & Account Management
Enterprise-grade security at every level

SEC-01  Role-Based Access Control    [P0 — Critical] 
Granular permissions system. Control exactly what each team member can see and do.

Role	Capabilities
Owner	Full access including billing, number management, all settings, delete account
Admin	Full access except billing and delete account
Supervisor	Inbox access, view all agents, analytics, flows — cannot edit billing or team
Agent	Inbox access (assigned + unassigned), send messages, add tags — no flows or analytics
View Only	Read-only access to inbox and analytics — cannot send or edit anything

Custom roles: admins can create custom roles with specific permission toggles (Phase 2).

SEC-02  Two-Factor Authentication    [P0 — Critical] 
Optional 2FA for all users. Required 2FA option for admin accounts.
•	TOTP authenticator app support (Google Authenticator, Authy)
•	WhatsApp 2FA: receive OTP on their own WhatsApp (meta)
•	Admin can force 2FA for all team members
•	Backup codes generated on 2FA setup
•	Session management: view and revoke all active sessions

SEC-03  Data Security    [P0 — Critical] 
All data encrypted at rest and in transit. GDPR-compliant data handling.
•	Encryption at rest: AES-256 for database (DigitalOcean Managed Database)
•	Encryption in transit: TLS 1.3 for all API calls
•	WhatsApp messages: end-to-end encrypted by WhatsApp — WaFlow only receives via official API
•	Data residency: configurable (Singapore, Frankfurt, New York) — Phase 2
•	Data export: account owner can download all data at any time
•	Account deletion: all data purged within 30 days of deletion request
•	Audit log: all admin actions logged with IP, timestamp, user

SEC-04  Number Health Monitoring    [P0 — Critical] 
WhatsApp number quality is critical. WaFlow monitors it and alerts proactively.
•	Quality rating displayed: Green (High) / Yellow (Medium) / Red (Low)
•	Alert when quality drops to Yellow: pause broadcasts recommendation
•	Alert when quality drops to Red: automatic broadcast pause + urgent notification
•	Block report: how many contacts blocked your number this week
•	Best practices guide: in-app tips to maintain number health
•	Number health history chart: quality over last 90 days

 
Development Roadmap

Priority Classification
P0 = Launch blocker. Must ship in Month 1-2. P1 = Core product value. Ship in Month 2-3. P2 = Differentiation. Ship in Month 3-4. P3 = Moat features. Ship in Month 4+.

Phase 1 — Foundation (Month 1)
7 engineers. Focus: core infrastructure, inbox, contacts, basic flows. By end of Month 1: internal demo ready.

Sprint	Engineering Focus	Deliverable
Week 1	Project setup, DB schema, auth system, multi-tenancy, WhatsApp API connection via 360dialog	Receive and send WhatsApp messages programmatically
Week 2	Real-time inbox (WebSocket), conversation assignment, contact CRM, CSV import	Agents can manage conversations from web app
Week 3	Basic flow builder (canvas + 5 core nodes), keyword triggers, auto-reply	Simple keyword-triggered bots working
Week 4	Broadcast engine with anti-ban queuing, template manager, basic analytics	Send broadcast to 1000 contacts safely

Phase 2 — Full Platform (Month 2)
Focus: complete flow library, analytics depth, payment integration, multi-language.

Sprint	Engineering Focus	Deliverable
Week 5	Full node library (all trigger, action, condition nodes), variable system, flow versioning	Complete flow builder ready
Week 6	Revenue attribution, flow performance analytics, team analytics, executive dashboard	Full analytics platform live
Week 7	Urdu UI, RTL layout, JazzCash/EasyPaisa billing, subscription management	Pakistan-market-ready product
Week 8	Agency features, white label, client reporting, catalog + orders	Agency accounts can onboard clients

Phase 3 — Integrations & Scale (Month 3-4)
Sprint	Engineering Focus	Deliverable
Week 9-10	Google Sheets integration, Zapier app, public REST API, Webhook system	Integration-ready platform
Week 11-12	Shopify/WooCommerce, drip campaigns, A/B testing, retargeting	Full marketing automation
Week 13-14	Arabic UI, performance optimization, load testing, security audit, bug bash	Production-hardened for scale
Week 15-16	Mobile web optimization, onboarding flows, help center, in-app tooltips	Self-serve onboarding — no support needed to start

 
Recommended Team Allocation — 7 Engineers

Engineer	Primary Domain	Modules Owned
Engineer 1 (Lead/Architect)	System architecture, database, security, code review	SEC, Database, DevOps, API design
Engineer 2 (Backend — Messaging)	WhatsApp API integration, message queuing, anti-ban system	INB (backend), BCAST, Templates
Engineer 3 (Backend — Flows)	Flow execution engine, trigger system, variable resolution	FLOW (backend), Webhooks, Drip
Engineer 4 (Backend — Analytics)	Analytics pipeline, revenue attribution, reporting engine	ANL, BILL, Reporting
Engineer 5 (Frontend — Core)	Inbox UI, contacts UI, real-time WebSocket integration	INB (UI), CRM, Dashboard
Engineer 6 (Frontend — Flow Builder)	Visual canvas, node components, flow preview	FLOW (UI), Templates UI, Canvas
Engineer 7 (Full Stack — Growth)	Integrations, agency features, localization, catalog	INT, AGY, L10N, CAT

 
Product Identity

Product Name	WaFlow — short, memorable, says exactly what it does. Works in English, Urdu, Arabic. Easy to say in all target markets.

Tagline	"WhatsApp that works for your business" — simple, direct, benefit-focused

Domain Target	waflow.io (check availability) — short, clean, professional

Core Promise	The only WhatsApp business tool built for Pakistan and MENA — in your language, with your payment methods, at transparent pricing.

Definition of Done — Engineering Standards

Every feature shipped must meet ALL of the following before being considered complete:

•	Unit tests written and passing (minimum 80% coverage per module)
•	API endpoint has OpenAPI documentation
•	Feature works in Urdu language mode without layout breaking
•	Mobile web view tested on 375px and 768px widths
•	Error states handled: empty state, loading state, error state all designed
•	Performance: page load under 2 seconds, API response under 500ms
•	WhatsApp API calls have retry logic and dead letter queue
•	All user inputs sanitized and validated (no SQL injection, XSS possible)
•	Multi-tenant isolation verified: tenant A cannot access tenant B data (test this explicitly)
•	Feature reviewed by one other engineer before merge to main

Launch Criteria

WaFlow is ready for public launch when ALL of the following are true:

1.	All P0 features complete and tested
2.	80% of P1 features complete
3.	10 beta customers have used the platform for minimum 14 days
4.	Zero critical bugs open, fewer than 5 high-severity bugs open
5.	Load test passed: 200 concurrent users without performance degradation
6.	Security audit completed by external reviewer
7.	Payment processing tested end-to-end for Stripe, JazzCash, EasyPaisa
8.	Urdu interface 100% translated and tested with native Urdu speaker
9.	Customer support process defined: who answers, SLA, escalation path
10.	Onboarding flow tested: new user can connect number and send first message in under 15 minutes unassisted

WaFlow — Built by Meetech Solutions
CONFIDENTIAL — For Internal Engineering Use Only
