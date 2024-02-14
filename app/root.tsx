import type { LinksFunction, LoaderFunctionArgs } from '@remix-run/node';
import styles from "./tailwind.css";

import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  json,
  useLoaderData,
  useOutletContext,
  useRevalidator
} from '@remix-run/react';
import { useEffect, useState } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from 'db_types'; 
import createServerSupaBase from 'utils/supabase.server';
import { createBrowserClient } from '@supabase/auth-helpers-remix';
type TypedDataBaseClient = SupabaseClient<Database>;

export type SupabaseOutletContext = {
  supabase: TypedDataBaseClient;
}
export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
];

export const loader = async ({request} : LoaderFunctionArgs) => {
  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
  };
  const response = new Response();
  const supabase = createServerSupaBase({request,response})
  const {
    data: {session},    
  } = await supabase.auth.getSession();
  return json({ env, session },{headers: response.headers});
};



export default function App() {
  const { env, session } = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();
  // console.log({server: {session}})
  const [supabase] = useState(() =>
    createBrowserClient<Database>
    (env.SUPABASE_URL, env.SUPABASE_ANON_KEY)
  );
  const serverAccessToken = session?.access_token;
  useEffect(() => {
    const {data: {subscription}} = supabase.auth.onAuthStateChange((event, session) => {
      if(session?.access_token !== serverAccessToken){
        // we need to call loaders
        revalidator.revalidate();
      }
    });
    return () => {
      subscription?.unsubscribe();
    }
  }, [serverAccessToken, revalidator, supabase.auth]);
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
      <Outlet context={{ supabase }} />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export function useSupabase(){
    return useOutletContext<SupabaseOutletContext>();
}