/**
 * Seed mock data for Loom/demo when no backend is configured.
 * Pakistani names, Urdu/English mix, varied statuses, images, one location.
 */

import type { Conversation, Label, ConversationParticipant } from "@/types/conversation";
import type { Contact } from "@/types/contact";
import type { Message } from "@/types/message";
import type { PaginatedResponse } from "@/types/api";

const DEMO_AGENT: ConversationParticipant = {
  id: "demo-user",
  name: "Demo User",
};

const LABELS: Label[] = [
  { id: "lbl-1", name: "VIP", color: "#eab308" },
  { id: "lbl-2", name: "Follow-up", color: "#3b82f6" },
  { id: "lbl-3", name: "Complaint", color: "#ef4444" },
  { id: "lbl-4", name: "Order", color: "#22c55e" },
  { id: "lbl-5", name: "Support", color: "#8b5cf6" },
];

function ts(daysAgo: number, hoursOffset = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(d.getHours() - hoursOffset, 0, 0, 0);
  return d.toISOString();
}

export const MOCK_CONTACTS: Contact[] = [
  { id: "c1", phone: "+92 300 1234567", name: "Ahmed Hassan", email: "ahmed.h@email.com", company: "Hassan Traders", language: "ur", tags: ["customer", "regular"], customFields: {}, optInStatus: "opted_in", createdAt: ts(30) },
  { id: "c2", phone: "+92 321 9876543", name: "Fatima Khan", email: "fatima.k@gmail.com", company: "Khan Fabrics", language: "ur", tags: ["VIP"], customFields: {}, optInStatus: "opted_in", createdAt: ts(25) },
  { id: "c3", phone: "+92 333 5551234", name: "Muhammad Rizwan", tags: ["wholesale"], customFields: {}, optInStatus: "opted_in", createdAt: ts(20) },
  { id: "c4", phone: "+92 302 7778899", name: "Ayesha Siddiqui", email: "ayesha.s@outlook.com", language: "en", tags: [], customFields: {}, optInStatus: "opted_in", createdAt: ts(18) },
  { id: "c5", phone: "+92 345 1112233", name: "Hassan Ali", company: "Ali & Sons", tags: ["follow-up"], customFields: {}, optInStatus: "opted_in", createdAt: ts(15) },
  { id: "c6", phone: "+92 311 4445566", name: "Zainab Malik", tags: ["customer"], customFields: {}, optInStatus: "opted_in", createdAt: ts(12) },
  { id: "c7", phone: "+92 322 6667788", name: "Bilal Ahmed", company: "Bilal Electronics", tags: [], customFields: {}, optInStatus: "opted_in", createdAt: ts(10) },
  { id: "c8", phone: "+92 334 8889900", name: "Sana Mahmood", email: "sana.m@yahoo.com", tags: ["complaint"], customFields: {}, optInStatus: "opted_in", createdAt: ts(8) },
  { id: "c9", phone: "+92 300 2223344", name: "Usman Sheikh", tags: ["order"], customFields: {}, optInStatus: "opted_in", createdAt: ts(7) },
  { id: "c10", phone: "+92 321 5556677", name: "Rabia Hussain", company: "Hussain Garments", tags: ["VIP"], customFields: {}, optInStatus: "opted_in", createdAt: ts(6) },
  { id: "c11", phone: "+92 333 9990011", name: "Imran Khan", tags: [], customFields: {}, optInStatus: "opted_in", createdAt: ts(5) },
  { id: "c12", phone: "+92 302 3334455", name: "Sadia Noor", email: "sadia.n@gmail.com", tags: ["support"], customFields: {}, optInStatus: "opted_in", createdAt: ts(4) },
  { id: "c13", phone: "+92 345 7778899", name: "Faisal Iqbal", company: "Iqbal Motors", tags: [], customFields: {}, optInStatus: "opted_in", createdAt: ts(3) },
  { id: "c14", phone: "+92 311 1112233", name: "Mariam Sheikh", tags: ["customer"], customFields: {}, optInStatus: "opted_in", createdAt: ts(2) },
  { id: "c15", phone: "+92 322 4445566", name: "Tariq Mahmood", tags: [], customFields: {}, optInStatus: "opted_in", createdAt: ts(1) },
  { id: "c16", phone: "+92 334 6667788", name: "Nadia Akhtar", company: "Akhtar Pharma", tags: ["follow-up"], customFields: {}, optInStatus: "opted_in", createdAt: ts(0) },
  { id: "c17", phone: "+92 300 8889900", name: "Kamran Ali", tags: [], customFields: {}, optInStatus: "opted_in", createdAt: ts(0) },
  { id: "c18", phone: "+92 321 2223344", name: "Hina Aslam", email: "hina.a@gmail.com", tags: ["order"], customFields: {}, optInStatus: "opted_in", createdAt: ts(0) },
];

// One conversation per contact; we'll build conversations + messages
const CONV_MESSAGES: Record<string, Message[]> = {};

function addMessages(convId: string, contactName: string, messages: Omit<Message, "id" | "conversationId" | "createdAt">[]) {
  const out: Message[] = [];
  messages.forEach((m, i) => {
    const createdAt = new Date(Date.now() - (messages.length - i) * 60000 * (i + 1)).toISOString();
    out.push({
      ...m,
      id: `msg-${convId}-${i}`,
      conversationId: convId,
      createdAt,
      sender: m.direction === "out" ? DEMO_AGENT : undefined,
    } as Message);
  });
  CONV_MESSAGES[convId] = out;
  return out;
}

// Build conversations and their messages
function buildConversations(): Conversation[] {
  const list: Conversation[] = [];
  const statuses: Conversation["status"][] = ["open", "open", "pending", "pending", "resolved", "resolved", "snoozed", "open", "pending", "resolved", "open", "pending", "resolved", "open", "pending", "resolved", "open", "open"];
  const whatsappId = "wa-demo-1";

  MOCK_CONTACTS.forEach((c, i) => {
    const convId = `conv-${c.id}`;
    const status = statuses[i % statuses.length];
    const labels = i % 4 === 0 ? [LABELS[i % LABELS.length]] : i % 3 === 0 ? [LABELS[0], LABELS[1]] : [];
    const assignedTo = (i % 3 === 0 && status !== "resolved") ? DEMO_AGENT : null;
    const unreadCount = status === "open" && i % 2 === 0 ? (i % 3) + 1 : 0;

    // Messages for this conversation (Urdu/English mix, varied types)
    const msgBodies: Array<{ dir: "in" | "out"; body?: string; type?: Message["type"]; media?: Message["media"]; location?: Message["location"] }> = [];

    switch (i % 6) {
      case 0:
        msgBodies.push({ dir: "in", body: "Assalam o alaikum, order ka status check karna hai." });
        msgBodies.push({ dir: "out", body: "Wa alaikum assalam! Order #1023 shipped hai, kal tak deliver ho jayega." });
        msgBodies.push({ dir: "in", body: "Shukriya! Tracking number bhej dein." });
        break;
      case 1:
        msgBodies.push({ dir: "in", body: "Delivery kab tak milegi? Lahore se hoon." });
        msgBodies.push({ dir: "out", body: "2-3 working days. Aapka area covered hai." });
        msgBodies.push({ dir: "in", body: "Okay done, thank you." });
        break;
      case 2:
        msgBodies.push({ dir: "in", body: "Ye product available hai? Price bata dein." });
        msgBodies.push({ dir: "out", body: "Haan available hai. Rs 2,499. COD bhi hai." });
        msgBodies.push({ dir: "in", body: "Theek hai, kal order place karunga." });
        break;
      case 3:
        msgBodies.push({ dir: "in", body: "Brother plz confirm kar dein — payment receive hua?" });
        msgBodies.push({ dir: "out", body: "Yes confirmed. Order process ho raha hai." });
        msgBodies.push({ dir: "in", body: "Bilkul theek hai 👍" });
        break;
      case 4:
        // Conversation with image
        msgBodies.push({ dir: "in", body: "Ye colour mil jayega?" });
        msgBodies.push({ dir: "in", type: "image", media: { url: "https://picsum.photos/400/400", mimeType: "image/jpeg", caption: "Ye wala" } });
        msgBodies.push({ dir: "out", body: "Haan ye available hai. Size bata dein." });
        break;
      case 5:
        // Conversation with location
        msgBodies.push({ dir: "in", body: "Yahan se pickup kar sakte hain?" });
        msgBodies.push({ dir: "in", type: "location", location: { latitude: 31.5204, longitude: 74.3587, name: "Liberty Market", address: "Lahore, Pakistan" } });
        msgBodies.push({ dir: "out", body: "Haan, Liberty area covered hai. Slot book karein." });
        break;
      default:
        msgBodies.push({ dir: "in", body: "Hi, need help with my order." });
        msgBodies.push({ dir: "out", body: "Sure, share your order ID." });
    }

    const msgs: Omit<Message, "id" | "conversationId" | "createdAt">[] = msgBodies.map((m) => ({
      direction: m.dir,
      type: (m.type as Message["type"]) || "text",
      body: m.body,
      media: m.media,
      location: m.location,
      status: m.dir === "in" ? "read" : "delivered",
      isNote: false,
    }));
    const last = msgBodies[msgBodies.length - 1]!;
    const createdMsgs = addMessages(convId, c.name, msgs);
    const lastMsgBody = last.body ?? (last.media?.caption) ?? (last.location?.name) ?? "—";
    const lastMsgTs = createdMsgs[createdMsgs.length - 1]?.createdAt ?? ts(0, 20 - i);

    list.push({
      id: convId,
      contactId: c.id,
      contactName: c.name,
      contactPhone: c.phone,
      contactAvatarUrl: undefined,
      assignedTo,
      status,
      labels,
      lastMessage: {
        body: lastMsgBody,
        timestamp: lastMsgTs,
        direction: last.dir,
      },
      unreadCount,
      whatsappNumberId: whatsappId,
      createdAt: ts(7),
      updatedAt: lastMsgTs,
    });
  });

  // Sort by updatedAt desc for inbox order
  list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  return list;
}

let MOCK_CONVERSATIONS = buildConversations();

export function getMockConversations(): Conversation[] {
  return MOCK_CONVERSATIONS;
}

export function getMockConversation(id: string): Conversation | undefined {
  return MOCK_CONVERSATIONS.find((c) => c.id === id);
}

export function getMockMessages(conversationId: string): Message[] {
  return CONV_MESSAGES[conversationId] ?? [];
}

export function getMockContact(id: string): Contact | undefined {
  return MOCK_CONTACTS.find((c) => c.id === id);
}

export function getMockLabels(): Label[] {
  return LABELS;
}

export function getMockAgents(): ConversationParticipant[] {
  return [DEMO_AGENT];
}

export function getMockPaginatedConversations(page: number, perPage: number): PaginatedResponse<Conversation> {
  const start = (page - 1) * perPage;
  const data = MOCK_CONVERSATIONS.slice(start, start + perPage);
  return {
    data,
    meta: {
      page,
      perPage,
      total: MOCK_CONVERSATIONS.length,
      totalPages: Math.ceil(MOCK_CONVERSATIONS.length / perPage),
    },
  };
}

// Allow in-place updates for demo (status, assign) so UI reflects changes
export function updateMockConversation(id: string, patch: Partial<Conversation>): void {
  MOCK_CONVERSATIONS = MOCK_CONVERSATIONS.map((c) => (c.id === id ? { ...c, ...patch } : c));
}

export function appendMockMessage(conversationId: string, message: Message): void {
  const list = CONV_MESSAGES[conversationId] ?? [];
  CONV_MESSAGES[conversationId] = [...list, message];
}
