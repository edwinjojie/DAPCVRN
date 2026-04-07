import React, { useState } from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';

interface Props {
  onSend: (text: string) => void;
}

export default function MessageInput({ onSend }: Props) {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text);
    setText('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 sm:gap-3"
    >
      <button 
        type="button" 
        className="p-2 text-slate-400 hover:text-blue-600 transition-colors hidden sm:block"
        title="Attach file"
      >
        <Paperclip className="w-5 h-5" />
      </button>
      
      <div className="flex-1 relative flex items-center">
        <button 
          type="button" 
          className="absolute left-3 text-slate-400 hover:text-blue-600 transition-colors"
          title="Emojis"
        >
          <Smile className="w-5 h-5" />
        </button>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your message here..."
          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-slate-700 placeholder:text-slate-400"
        />
      </div>

      <button 
        type="submit" 
        disabled={!text.trim()}
        className={`p-3 rounded-xl font-semibold flex items-center justify-center transition-all shadow-sm ${
          text.trim() 
            ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md active:scale-95' 
            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
        }`}
      >
        <Send className="w-5 h-5" />
        <span className="ml-2 hidden sm:inline">Send</span>
      </button>
    </form>
  );
}


