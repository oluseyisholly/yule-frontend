"use client";

import { type ReactNode, useMemo, useState } from "react";
import {
  ArchiveIcon,
  CircleIcon,
  FilterIcon as LucideFilterIcon,
  InboxIcon,
  MoreVerticalIcon,
  PaperclipIcon,
  SendHorizontalIcon,
  SendIcon,
  SmilePlusIcon,
  XIcon,
} from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import UserAvatar from "@/components/UserAvatar";
import { SearchInput } from "@/components/ui/search-input";
import { cn } from "@/lib/utils";

type MessageFolder = "inbox" | "outbox" | "archive";

type ThreadMessage = {
  id: string;
  sender: "me" | "them";
  text: string;
  time: string;
};

type MessageThread = {
  id: string;
  name: string;
  role: string;
  initials: string;
  avatarBg: string;
  avatarColor: string;
  avatarUrl?: string | null;
  online?: boolean;
  unreadCount?: number;
  dateLabel: string;
  preview: string;
  folder: MessageFolder;
  messages: ThreadMessage[];
};

const messageThreads: MessageThread[] = [
  {
    id: "thread-1",
    name: "Tunde Adeyemi",
    role: "HR Intern",
    initials: "TA",
    avatarBg: "#FDE0DE",
    avatarColor: "#A52A2A",
    online: true,
    unreadCount: 4,
    dateLabel: "Oct 2",
    preview: "I did. I'll send it to you after this meeting so we can make the changes.",
    folder: "inbox",
    messages: [
      {
        id: "message-1",
        sender: "them",
        text: "Morning, Sarah. Did you get a chance to review the client presentation?",
        time: "04:45 PM",
      },
      {
        id: "message-2",
        sender: "me",
        text: "Good morning! Yes, I went through it last night. Overall, it looks good, but I think we should update the sales figures on slide 8.",
        time: "04:45 PM",
      },
      {
        id: "message-3",
        sender: "them",
        text: "I noticed that too. The numbers are from last quarter. Do you have the latest report?",
        time: "04:45 PM",
      },
      {
        id: "message-4",
        sender: "me",
        text: "I do. I'll send it to you after this meeting so we can make the changes.",
        time: "04:45 PM",
      },
    ],
  },
  {
    id: "thread-2",
    name: "Tobi Adewale",
    role: "Product Designer",
    initials: "TA",
    avatarBg: "#DDF0FF",
    avatarColor: "#0067C9",
    online: true,
    dateLabel: "Oct 1",
    preview: "Sounds good. Have you heard anything from the IT team about the software issue?",
    folder: "inbox",
    messages: [
      {
        id: "message-5",
        sender: "them",
        text: "Sounds good. Have you heard anything from the IT team about the software issue?",
        time: "01:20 PM",
      },
    ],
  },
  {
    id: "thread-3",
    name: "Joseph Adeola",
    role: "Operations Lead",
    initials: "JA",
    avatarBg: "#FCEEC8",
    avatarColor: "#8A5B00",
    dateLabel: "Sept 30",
    preview: "No problem. We are a team after all.",
    folder: "inbox",
    messages: [
      {
        id: "message-6",
        sender: "them",
        text: "No problem. We are a team after all.",
        time: "11:00 AM",
      },
    ],
  },
  {
    id: "thread-4",
    name: "Sarah Eze",
    role: "Finance Associate",
    initials: "SE",
    avatarBg: "#EFE6FD",
    avatarColor: "#3300C9",
    dateLabel: "Sept 30",
    preview: "Will do. Thanks for your support.",
    folder: "outbox",
    messages: [
      {
        id: "message-7",
        sender: "me",
        text: "Will do. Thanks for your support.",
        time: "09:18 AM",
      },
    ],
  },
  {
    id: "thread-5",
    name: "Adaeze Nwosu",
    role: "Marketing Lead",
    initials: "AN",
    avatarBg: "#D9F4E2",
    avatarColor: "#1C8C4B",
    dateLabel: "Sept 30",
    preview: "Did you finish the monthly report yesterday?",
    folder: "archive",
    messages: [
      {
        id: "message-8",
        sender: "them",
        text: "Did you finish the monthly report yesterday?",
        time: "08:13 AM",
      },
    ],
  },
  {
    id: "thread-6",
    name: "Obinna Ejike",
    role: "Sales Manager",
    initials: "OE",
    avatarBg: "#FDE0DE",
    avatarColor: "#C34040",
    dateLabel: "Sept 30",
    preview: "They seem to be running behind this month.",
    folder: "inbox",
    messages: [
      {
        id: "message-9",
        sender: "them",
        text: "They seem to be running behind this month.",
        time: "07:41 AM",
      },
    ],
  },
];

function HeaderIconButton({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className="inline-flex size-9 items-center justify-center rounded-full border border-[#ECE8F7] bg-white text-[#7A9851] transition-colors hover:bg-[#F6FBEF] hover:text-[#5F7A3C]"
    >
      {children}
    </button>
  );
}

function FolderTabButton({
  label,
  active,
  icon,
  onClick,
}: {
  label: string;
  active: boolean;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 border-b px-1 pb-2 text-sm transition-colors",
        active
          ? "border-[#3300C9] font-semibold text-[#3300C9]"
          : "border-transparent text-[#9A96A8] hover:text-[#5F5A71]",
      )}
    >
      <span>{label}</span>
      <span className={cn(active ? "text-[#3300C9]" : "text-[#B6B2C5]")}>
        {icon}
      </span>
    </button>
  );
}

function ThreadListItem({
  thread,
  active,
  onClick,
}: {
  thread: MessageThread;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full border-b border-[#F0EDF7] px-3 py-3 text-left transition-colors",
        active ? "bg-[#F8F4FF]" : "hover:bg-[#FBFAFE]",
      )}
    >
      <div className="flex items-start gap-3">
        <div className="relative">
          <UserAvatar
            name={thread.name}
            initials={thread.initials}
            imageUrl={thread.avatarUrl}
            bgColor={thread.avatarBg}
            textColor={thread.avatarColor}
            className="size-10 text-sm"
          />
          {thread.online ? (
            <span className="absolute bottom-0 left-0 inline-flex size-2.5 rounded-full border border-white bg-[#26C943]" />
          ) : null}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#1E1E1E]">
                {thread.name}
              </p>
              <p className="mt-0.5 line-clamp-2 text-xs text-[#8F8A9F]">
                {thread.preview}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-xs text-[#6B677A]">{thread.dateLabel}</p>
              {thread.unreadCount ? (
                <span className="mt-2 inline-flex min-w-[20px] items-center justify-center rounded-full bg-[#5E8F1E] px-1.5 py-[2px] text-[11px] font-semibold text-white">
                  {thread.unreadCount}
                </span>
              ) : (
                <span className="mt-2 inline-flex text-[#8BC34A]">
                  <CircleIcon className="size-2 fill-current stroke-none" />
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

function MessageBubble({ message }: { message: ThreadMessage }) {
  const isMine = message.sender === "me";

  return (
    <div className={cn("flex", isMine ? "justify-end" : "justify-start")}>
      <div className={cn("max-w-[92%] sm:max-w-[75%]", isMine ? "items-end" : "items-start")}>
        <div
          className={cn(
            "rounded-[26px] px-4 py-3 text-sm leading-6 shadow-[0_4px_14px_rgba(51,0,201,0.04)]",
            isMine
              ? "rounded-br-[10px] bg-[#3300C9] text-white"
              : "rounded-bl-[10px] bg-[#F2EAFE] text-[#5E5873]",
          )}
        >
          {message.text}
        </div>
        <div
          className={cn(
            "mt-2 flex items-center gap-3 px-2 text-[11px]",
            isMine ? "justify-end text-[#B8AEEB]" : "text-[#B8B3C5]",
          )}
        >
          <span>{message.time}</span>
          <span className="hidden sm:inline">Forward</span>
          <span className="hidden sm:inline">Reply</span>
        </div>
      </div>
    </div>
  );
}

export default function MessagesScreen() {
  const [activeFolder, setActiveFolder] = useState<MessageFolder>("inbox");
  const [query, setQuery] = useState("");
  const [selectedThreadId, setSelectedThreadId] = useState(messageThreads[0]?.id ?? "");
  const [draftMessage, setDraftMessage] = useState("");

  const filteredThreads = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return messageThreads.filter((thread) => {
      if (thread.folder !== activeFolder) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return (
        thread.name.toLowerCase().includes(normalizedQuery) ||
        thread.preview.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [activeFolder, query]);

  const selectedThread =
    filteredThreads.find((thread) => thread.id === selectedThreadId) ??
    filteredThreads[0] ??
    null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Messages"
        description="Stay close to every conversation around your celebrations."
      />

      <section className="overflow-hidden  border border-[#ECE8F7] bg-white shadow-[0_18px_48px_rgba(41,24,99,0.06)]">
        <div className="grid min-h-[calc(100vh-14rem)] grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="border-b border-[#F0EDF7] xl:border-b-0 xl:border-r">
            <div className="flex items-center gap-3 border-b border-[#F0EDF7] px-4 py-4 sm:px-5">
              <button
                type="button"
                aria-label="Close messages"
                className="inline-flex size-7 items-center justify-center rounded-full text-[#B5B0C2] transition-colors hover:bg-[#F6F2FF] hover:text-[#5B5865]"
              >
                <XIcon className="size-4" />
              </button>
              <h2 className="text-[26px] font-semibold tracking-[-0.03em] text-[#1E1E1E]">
                Messages
              </h2>
              <button
                type="button"
                aria-label="Filter messages"
                className="ml-auto inline-flex size-8 items-center justify-center rounded-full text-[#B5B0C2] transition-colors hover:bg-[#F6F2FF] hover:text-[#5B5865]"
              >
                <LucideFilterIcon className="size-4" />
              </button>
            </div>

            <div className="space-y-4 p-4 sm:p-5">
              <SearchInput
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search Messages"
                className="h-[40px] rounded-[14px] border-[#E5E1F1] bg-white text-sm placeholder:text-[#B8B3C5]"
              />

              <div className="flex items-center gap-5 overflow-x-auto border-b border-[#F0EDF7] pb-1">
                <FolderTabButton
                  label="Inbox"
                  active={activeFolder === "inbox"}
                  icon={<InboxIcon className="size-3.5" />}
                  onClick={() => setActiveFolder("inbox")}
                />
                <FolderTabButton
                  label="Outbox"
                  active={activeFolder === "outbox"}
                  icon={<SendIcon className="size-3.5" />}
                  onClick={() => setActiveFolder("outbox")}
                />
                <FolderTabButton
                  label="Archive"
                  active={activeFolder === "archive"}
                  icon={<ArchiveIcon className="size-3.5" />}
                  onClick={() => setActiveFolder("archive")}
                />
              </div>
            </div>

            <div className="max-h-[420px] overflow-y-auto xl:max-h-[calc(100vh-24rem)]">
              {filteredThreads.length ? (
                filteredThreads.map((thread) => (
                  <ThreadListItem
                    key={thread.id}
                    thread={thread}
                    active={selectedThread?.id === thread.id}
                    onClick={() => setSelectedThreadId(thread.id)}
                  />
                ))
              ) : (
                <div className="px-5 py-12 text-center text-sm text-[#918CA1]">
                  No conversations match your current search.
                </div>
              )}
            </div>
          </aside>

          <div className="flex min-h-[620px] flex-col">
            {selectedThread ? (
              <>
                <div className="flex items-center gap-3 border-b border-[#F0EDF7] px-4 py-4 sm:px-6">
                  <UserAvatar
                    name={selectedThread.name}
                    initials={selectedThread.initials}
                    imageUrl={selectedThread.avatarUrl}
                    bgColor={selectedThread.avatarBg}
                    textColor={selectedThread.avatarColor}
                    className="size-11 text-sm"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold text-[#1E1E1E]">
                      {selectedThread.name}
                    </p>
                    <p className="truncate text-xs text-[#8F8A9F]">
                      {selectedThread.role}
                    </p>
                  </div>

                  <div className="ml-auto flex items-center gap-3">
                    <div className="hidden items-center gap-1 text-xs text-[#8A8892] sm:flex">
                      <span className="inline-flex size-2 rounded-full bg-[#26C943]" />
                      <span>Online</span>
                    </div>
                    <button
                      type="button"
                      aria-label="Conversation options"
                      className="inline-flex size-8 items-center justify-center rounded-full text-[#8A8892] transition-colors hover:bg-[#F6F2FF]"
                    >
                      <MoreVerticalIcon className="size-4" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 space-y-5 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
                  <div className="text-center text-xs text-[#B8B3C5]">Today</div>
                  {selectedThread.messages.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                  ))}
                </div>

                <div className="border-t border-[#F0EDF7] px-4 py-4 sm:px-6">
                  <div className="flex items-end gap-3 rounded-[18px] border border-[#EFEAF9] bg-white px-3 py-3 shadow-[0_8px_18px_rgba(41,24,99,0.04)]">
                    <textarea
                      value={draftMessage}
                      onChange={(event) => setDraftMessage(event.target.value)}
                      rows={1}
                      placeholder="Type your message"
                      className="max-h-28 min-h-[28px] flex-1 resize-none bg-transparent text-sm text-[#3A3648] outline-none placeholder:text-[#B8B3C5]"
                    />
                    <button
                      type="button"
                      aria-label="Add emoji"
                      className="inline-flex size-8 items-center justify-center rounded-full text-[#F3A01D] transition-colors hover:bg-[#FFF7E5]"
                    >
                      <SmilePlusIcon className="size-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Attach file"
                      className="inline-flex size-8 items-center justify-center rounded-full text-[#73914A] transition-colors hover:bg-[#F6FBEF]"
                    >
                      <PaperclipIcon className="size-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Send message"
                      className="inline-flex size-11 items-center justify-center rounded-[14px] bg-[#3300C9] text-white transition-colors hover:bg-[#2D00B4]"
                    >
                      <SendHorizontalIcon className="size-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center px-6 text-center text-sm text-[#918CA1]">
                Select a conversation to view messages.
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="flex items-center justify-end gap-2">
        <HeaderIconButton label="Export messages">
          <SendIcon className="size-4" />
        </HeaderIconButton>
        <HeaderIconButton label="Message settings">
          <MoreVerticalIcon className="size-4" />
        </HeaderIconButton>
      </div>
    </div>
  );
}
