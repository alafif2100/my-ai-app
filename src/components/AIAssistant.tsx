import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Bot, User, Sparkles, MessageSquare, ShieldAlert, Loader2 } from 'lucide-react';
import { DashboardStats } from '../types';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

interface AIAssistantProps {
  stats: DashboardStats | null;
}

export default function AIAssistant({ stats }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'مرحباً بك! أنا مستشارك الذكي لتحليل المحتوى الدعوي. أستطيع قراءة وتحليل الإحصائيات الحالية وتقديم توصيات مخصصة حول تحسين النشر وزيادة التفاعل الدعوي. يمكنك سؤالي عن أي شيء يخص التقرير!'
    }
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const samplePrompts = [
    'لخص لي أهم إحصائيات هذا التقرير.',
    'أي المشايخ يسجل أعلى تفاعل؟ وما السر برأيك؟',
    'ما هي المنصة الأمثل لنشر المحاضرات العلمية الطويلة؟',
    'كيف يمكننا زيادة التفاعل مع الكلمات الوعظية القصيرة؟'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isSending) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsSending(true);

    try {
      const response = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: textToSend,
          statsSummary: stats ? {
            totalMaterials: stats.kpis.totalMaterials,
            totalInteractions: stats.kpis.totalInteractions,
            avgInteractions: stats.kpis.avgInteractions,
            uniqueSheikhsCount: stats.kpis.uniqueSheikhsCount,
            uniquePlatformsCount: stats.kpis.uniquePlatformsCount,
            topSheikhs: stats.topSheikhs,
            platforms: stats.platforms,
            contentTypes: stats.contentTypes,
          } : {}
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: 'ai',
            text: data.answer || 'عذراً، لم أستطع استخلاص إجابة حالياً.'
          }
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: 'ai',
            text: `⚠️ **خطأ في المعالجة:** ${data.error || 'فشل تحميل التحليل الذكي من الخادم.'}`
          }
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: '⚠️ **حدث خطأ في الشبكة:** تعذر الاتصال بخادم التحليل الذكي. يرجى التأكد من تشغيل الخادم وتثبيت مفتاح API.'
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm flex flex-col h-[520px]" id="ai-assistant-wrapper">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-l from-brand-50 to-white rounded-t-2xl">
        <div className="flex items-center gap-2">
          <div className="bg-brand-500 text-white p-1.5 rounded-lg">
            <Sparkles size={16} className="animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">مستشار البيانات الدعوية الذكي</h3>
            <p className="text-[10px] text-slate-500">مساعد فوري مدعوم بالذكاء الاصطناعي لتحليل مؤشرات النشر</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" id="chat-messages-container">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`p-2 rounded-xl shrink-0 ${
              msg.sender === 'user' 
                ? 'bg-brand-500 text-white' 
                : 'bg-slate-100 text-slate-700'
            }`}>
              {msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
            </div>
            
            <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
              msg.sender === 'user'
                ? 'bg-brand-500 text-white font-medium rounded-tr-none'
                : 'bg-slate-50 text-slate-800 border border-slate-100 rounded-tl-none'
            }`}>
              {msg.sender === 'ai' ? (
                <div className="markdown-body space-y-1 prose prose-sm max-w-none text-slate-800 font-sans">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{msg.text}</p>
              )}
            </div>
          </div>
        ))}
        {isSending && (
          <div className="flex items-start gap-2.5">
            <div className="p-2 rounded-xl shrink-0 bg-slate-100 text-slate-700">
              <Bot size={14} />
            </div>
            <div className="bg-slate-50 text-slate-800 border border-slate-100 rounded-2xl rounded-tl-none px-4 py-2.5 flex items-center gap-2 text-xs">
              <Loader2 className="animate-spin text-brand-500" size={13} />
              <span className="font-semibold text-slate-500">جاري تحليل البيانات وصياغة الرد...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Sample prompts */}
      {messages.length === 1 && (
        <div className="px-4 pb-2 pt-1 flex flex-wrap gap-1.5" id="chat-sample-prompts">
          {samplePrompts.map((p) => (
            <button
              key={p}
              onClick={() => handleSendMessage(p)}
              className="text-[10px] bg-slate-50 hover:bg-brand-50 border border-slate-200 hover:border-brand-200 text-slate-600 hover:text-brand-700 font-semibold px-2.5 py-1.5 rounded-lg transition-all"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(input);
        }}
        className="p-3 border-t border-slate-100 flex gap-2 items-center"
        id="chat-input-form"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="اسأل المستشار الذكي عن أي تحليل أو نصائح..."
          disabled={isSending}
          className="flex-1 text-xs bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-brand-500 rounded-xl px-3.5 py-2.5 outline-none transition-all text-slate-700"
          id="chat-text-input"
        />
        <button
          type="submit"
          disabled={!input.trim() || isSending}
          className="bg-brand-500 hover:bg-brand-600 disabled:bg-slate-150 disabled:text-slate-400 text-white p-2.5 rounded-xl transition-all shadow-md shadow-brand-500/10 shrink-0"
          id="chat-send-btn"
        >
          <Send size={15} className="scale-x-[-1]" />
        </button>
      </form>
    </div>
  );
}
