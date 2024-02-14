import { LoaderFunctionArgs, json } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import Login from '~/components/Login';
import SyncMessages from '~/components/Sync-messages';
import createServerSupabase from 'utils/supabase.server';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { useRef } from 'react';

export const action = async ({ request }: LoaderFunctionArgs) => {
  const response = new Response();
  const supabase = createServerSupabase({ request, response });
  
  const { message } = Object.fromEntries(await request.formData());
  const { error } = await supabase
    .from('messages')
    .insert({ content: String(message) });
  if (error) {
    console.log(error);
  }

  return json(null, { headers: response.headers });
};
export const loader = async ({ request }: LoaderFunctionArgs) => {
  
  const response = new Response();
  const supabase = createServerSupabase({ request, response });
  const { data } = await supabase.from('messages').select();
  return json({ messages: data }, { headers: response.headers });
};

export default function Index() {
  const loaderData = useLoaderData<typeof loader>();
  const inputRef = useRef<HTMLInputElement>(null);
  if (!loaderData || !loaderData.messages) {
    return <div>Loading...</div>;
  }
  
  const { messages } = loaderData;
  if (loaderData && inputRef.current) {
    console.log(inputRef.current.value);
    inputRef.current.value = '';
  }
  return (
    <div className="max-w-sm mx-auto flex flex-col justify-between h-screen overflow-x-hidden dark:bg-[#152033] bg-[#EDEDED]">
      <Login />
      <SyncMessages serverMessages={messages} />
      <Form method="post">
        <div className="flex justify-center items-center gap-2 p-2">
          <input
            type="text"
            name="message"
            placeholder="Type a message"
            ref={inputRef}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          />
          <button type="submit">
            <FontAwesomeIcon icon={faPaperPlane} className='w-6 h-6 text-[#375FFF] me-1' />
          </button>
        </div>
      </Form>
    </div>
  );
}
