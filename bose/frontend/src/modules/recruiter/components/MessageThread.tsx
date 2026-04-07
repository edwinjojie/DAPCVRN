import React, { useEffect, useRef } from 'react';
import { format } from 'date-fns';

interface Props {
  messages: any[];
  currentUserId?: string | null;
}

export default function MessageThread({ messages, currentUserId }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col space-y-4 min-h-full pb-4">
      {messages.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-slate-400 italic py-10">
          No messages yet. Start the conversation!
        </div>
      ) : (
        messages.map((m, i) => {
          // Robust check for current user's message
          const isMe = m.sender === 'me' || 
                       (m.senderId === currentUserId) || 
                       (m.senderId?._id === currentUserId);
          
          const timestamp = m.sentAt || m.createdAt;
          const time = timestamp ? format(new Date(timestamp), 'HH:mm') : '';
          
          return (
            <div 
              key={i} 
              className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <div 
                className={`max-w-[75%] sm:max-w-[65%] px-4 py-2.5 rounded-2xl shadow-sm relative group ${
                  isMe 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                }`}
              >
                <p className="text-sm sm:text-base leading-relaxed break-words">{m.text || m.content}</p>
                <div className={`text-[10px] mt-1 flex justify-end ${isMe ? 'text-blue-100' : 'text-slate-400'}`}>
                  {time}
                </div>
                
                {/* Message Bubble Tail */}
                <div 
                  className={`absolute top-0 w-2 h-2 ${
                    isMe 
                      ? 'right-[-2px] bg-blue-600 clip-path-tail-right' 
                      : 'left-[-2px] bg-white border-l border-t border-slate-100 clip-path-tail-left'
                  }`}
                  style={{ 
                    clipPath: isMe 
                      ? 'polygon(0 0, 0 100%, 100% 0)' 
                      : 'polygon(100% 0, 100% 100%, 0 0)' 
                  }}
                />
              </div>
            </div>
          );
        })
      )}
      <div ref={bottomRef} />
    </div>
  );
}


