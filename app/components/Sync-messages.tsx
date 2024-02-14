import { useOutletContext } from '@remix-run/react';
import type { Database } from 'db_types';
import { useEffect, useState } from 'react';
import { SupabaseOutletContext } from '~/root';

type Message = Database['public']['Tables']['messages']['Row'];

export default function SyncMessages({
  serverMessages,
}: {
  serverMessages: Message[];
}) {
  const [messages, setMessages] = useState(serverMessages);
  const { supabase } = useOutletContext<SupabaseOutletContext>();

  useEffect(() => {
    setMessages(serverMessages);
  }, [serverMessages]);
  
  useEffect(() => {
    const chanell = supabase
      .channel('*')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMessage = payload.new as Message;

          if (!messages.find((m) => m.id === newMessage.id)) {
            setMessages([...messages, newMessage]);
          }

        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(chanell);
    };
    
  }, [supabase, messages, setMessages]);

  const userId = '939b8447-4a3f-412a-b83c-3e26c779668d'
  
  return (
    <div className='mt-2 flex flex-col h-full items-end justify-end mb-2 gap-1'>
    {messages.map((m) => (
      <div
        className={`bg-[${m.user_id === userId ? '#375FFF' : '#0F1828'}] p-3 m-2 rounded-lg ${m.user_id === userId ? 'rounded-bl-none' : 'rounded-br-none'} text-white ${m.user_id === userId ? 'self-start' : 'self-end'}`}
        key={m.id}
      >
        {m.content}
      </div>
    ))}
</div>
  );
}
