/**
 * Module 01 — Inbox & Conversation Management
 * Demo script for client walkthrough. Open this page, then click "Open Inbox" to demonstrate.
 */

import { Link } from "react-router-dom";
import { MessageCircle, CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FEATURES = [
  {
    id: "INB-01",
    title: "Real-Time Shared Team Inbox [P0]",
    points: [
      "Three-panel layout: conversation list (left) → chat thread (center) → contact sidebar (right)",
      "Conversation list: contact name, last message snippet, timestamp, unread count badge",
      "Real-time unread badge (WebSocket); sound & push notification toggles in settings",
      "Mobile: single-panel with back navigation",
    ],
  },
  {
    id: "INB-02",
    title: "Conversation Assignment System [P0]",
    points: [
      "Assignee avatar + name on each conversation card",
      '"Unassigned" tab — visually distinct',
      "Assign button in thread header → agent selector dropdown",
      "Assignment history in timeline; auto-assign rules config (round-robin, keyword, time-based)",
    ],
  },
  {
    id: "INB-03",
    title: "Collision Prevention [P0]",
    points: [
      '"Agent X is typing…" in conversation header',
      "Soft lock warning banner when another agent has the conversation",
      "Hard lock override modal with mandatory reason",
      "Lock auto-expires after 60s (countdown optional)",
    ],
  },
  {
    id: "INB-04",
    title: "Conversation Labels & Status [P0]",
    points: [
      "Status pill: Open / Pending / Resolved / Snoozed; snoozed → date-time picker",
      "Label chips (color-coded) on conversation card",
      "One-click label from inside thread",
      "Bulk toolbar when conversations selected; filter bar (label, status, assignee, WhatsApp number)",
    ],
  },
  {
    id: "INB-05",
    title: "Full Conversation History & Search [P0]",
    points: [
      "Global search: message content, contact names, phone numbers",
      "Search results: snippet + contact + date; filters: date range, message type, number",
      "Contact sidebar: Previous Conversations (chronological)",
      "Message timestamps & delivery icons (sent ✓ / delivered ✓✓ / read ✓✓ blue)",
    ],
  },
  {
    id: "INB-06",
    title: "Rich Media Send & Preview [P0]",
    points: [
      "Compose: drag-and-drop file upload; file size validation before upload",
      "Inline image preview; video thumbnail + play in thread",
      "Document: icon + filename + size; Location: embedded map (OSM/Google)",
      "Media type selector in compose (image, video, audio, document, location)",
    ],
  },
  {
    id: "INB-07",
    title: "Internal Agent Notes [P1]",
    points: [
      "Reply vs Note toggle in compose",
      "Notes: distinct style (e.g. yellow); author avatar + name + timestamp",
      "@mention autocomplete in note input",
    ],
  },
  {
    id: "INB-08",
    title: "Quick Replies Library [P1]",
    points: [
      "Type / in compose → quick reply dropdown; filtered as you type",
      "Sorted by usage (most used first); management page: create/edit/delete (account or personal)",
      "Variable preview e.g. {{contact_name}} resolved in dropdown",
    ],
  },
  {
    id: "INB-09",
    title: "Contact Merge & Deduplication [P1]",
    points: [
      "Duplicate warning on contact profiles (similar name/number)",
      "Merge modal: pick two, choose primary, preview merged result, confirm",
      "Merge audit log in contact profile",
    ],
  },
];

export function Component() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Module 01 — Inbox & Conversation Management</h1>
          <p className="mt-1 text-muted-foreground">
            Demo script for client. Use the checklist below while showing the Inbox.
          </p>
        </div>
        <Button asChild size="lg" className="shrink-0">
          <Link to="/chats">
            <MessageCircle className="mr-2 h-5 w-5" />
            Open Inbox to demonstrate
          </Link>
        </Button>
      </div>

      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-base">Quick start</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1">
          <p>1. Click <strong className="text-foreground">Open Inbox to demonstrate</strong> above.</p>
          <p>2. Show the three panels: list → thread → contact (open a conversation, then the contact icon).</p>
          <p>3. Use the tabs <strong className="text-foreground">All / Mine / Unassigned</strong>, then Filters (status, labels, assignee).</p>
          <p>4. Select conversations with checkboxes to show bulk actions.</p>
          <p>5. In a thread: change status, add label, assign agent; try Reply vs Note and type <code className="rounded bg-muted px-1">/</code> for quick replies.</p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Feature checklist (INB-01 → INB-09)</h2>
        <ul className="space-y-3">
          {FEATURES.map((f) => (
            <Card key={f.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Circle className="h-5 w-5 shrink-0 text-muted-foreground" />
                  <span className="font-mono text-xs text-muted-foreground">{f.id}</span>
                  <span className="font-medium">{f.title}</span>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {f.points.map((p, i) => (
                    <li key={i} className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                      {p}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </ul>
      </div>
    </div>
  );
}
