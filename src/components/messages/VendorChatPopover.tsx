"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { MoreVerticalIcon, SendHorizontalIcon, XIcon } from "lucide-react";
import { useState } from "react";
import UserAvatar from "@/components/UserAvatar";

type VendorChatPopoverProps = {
 open: boolean;
 onOpenChange: (open: boolean) => void;
 productTitle?: string;
};

export default function VendorChatPopover({
 open,
 onOpenChange,
 productTitle,
}: VendorChatPopoverProps) {
 const [draft, setDraft] = useState("");
 const [messages, setMessages] = useState<Array<{ id: string; text: string }>>([]);

 const sendMessage = () => {
 const text = draft.trim();
 if (!text) return;
 setMessages((current) => [...current, { id: `message-${Date.now()}`, text }]);
 setDraft("");
 };

 return (
 <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
 <DialogPrimitive.Portal>
 <DialogPrimitive.Overlay className="fixed inset-0 z-[170] bg-[#17131F]/30" />
 <DialogPrimitive.Content className="fixed inset-x-0 bottom-0 z-[171] flex h-[min(70dvh,500px)] flex-col overflow-hidden rounded-t-[26px] border border-[#E9E4F4] bg-white shadow-[0_-18px_60px_rgba(35,25,65,0.18)] outline-none data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom sm:inset-x-auto sm:bottom-6 sm:right-6 sm:h-[480px] sm:w-[380px] sm:rounded-[22px]">
 <header className="flex items-center gap-3 border-b border-[#EEEAF7] px-4 py-3.5">
 <UserAvatar name="Product Vendor" className="size-10 text-xs" />
 <div className="min-w-0 flex-1">
 <DialogPrimitive.Title className="text-sm font-semibold text-[#242126]">Product Vendor</DialogPrimitive.Title>
 <DialogPrimitive.Description className="flex items-center gap-1.5 text-[11px] text-[#8B8695]">
 <span className="size-1.5 rounded-full bg-[#22B83E]" /> Online
 </DialogPrimitive.Description>
 </div>
 <button type="button" aria-label="Conversation options" className="inline-flex size-8 items-center justify-center rounded-full text-[#77717F] hover:bg-[#F6F2FF]">
 <MoreVerticalIcon className="size-4" />
 </button>
 <DialogPrimitive.Close className="inline-flex size-8 items-center justify-center rounded-full bg-[#F6F2FF] text-[#5C5666]">
 <XIcon className="size-4" />
 <span className="sr-only">Close vendor chat</span>
 </DialogPrimitive.Close>
 </header>

 {productTitle ? (
 <p className="truncate border-b border-[#F1EDF8] bg-[#FAF8FE] px-4 py-2 text-[11px] text-[#817B8D]">
 Asking about <span className="font-semibold text-[#3300C9]">{productTitle}</span>
 </p>
 ) : null}

 <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
 <p className="text-center text-[10px] uppercase tracking-[0.08em] text-[#B2ACBC]">Today</p>
 <div className="max-w-[82%] self-start rounded-[16px] rounded-bl-[4px] bg-[#F1E9FC] px-3.5 py-2.5 text-[13px] leading-5 text-[#494252]">
 Hello, how can I help you with this item?
 </div>
 {messages.map((message) => (
 <div key={message.id} className="max-w-[82%] self-end rounded-[16px] rounded-br-[4px] bg-[#3300C9] px-3.5 py-2.5 text-[13px] leading-5 text-white">
 {message.text}
 </div>
 ))}
 </div>

 <footer className="border-t border-[#EEEAF7] p-3 pb-[max(12px,env(safe-area-inset-bottom))]">
 <div className="flex items-end gap-1 rounded-[16px] border border-[#E9E4F4] bg-[#FCFBFE] p-1.5">
 <textarea
 value={draft}
 onChange={(event) => setDraft(event.target.value)}
 onKeyDown={(event) => {
 if (event.key === "Enter" && !event.shiftKey) {
 event.preventDefault();
 sendMessage();
 }
 }}
 rows={1}
 placeholder="Type your message"
 className="max-h-20 min-h-9 flex-1 resize-none bg-transparent px-2 py-2 text-[13px] outline-none placeholder:text-[#AAA4B4]"
 />
 <button type="button" aria-label="Send message" onClick={sendMessage} disabled={!draft.trim()} className="inline-flex size-10 items-center justify-center rounded-[12px] bg-[#3300C9] text-white disabled:bg-[#C9BCEB]">
 <SendHorizontalIcon className="size-[18px]" />
 </button>
 </div>
 </footer>
 </DialogPrimitive.Content>
 </DialogPrimitive.Portal>
 </DialogPrimitive.Root>
 );
}
