# Welcome to the ConnectRemix real time chat application
Now you'll need to add some configuration for supabase.

### DIY
cd routetoproject
npm install

Make sure to create .env file with following properties in it

- `SUPABASE_URL=https://yoursupabaseurl.supabase.co`
- `SUPABASE_ANON_KEY=youranonkey`

You can find these keys in your supabase account.

In your pathfile add `supabase gen types typescript --project-id yoursupabaseurl > db_types.ts`

## Development

From your local dev:
```sh
npm run dev
```

This starts your app in development mode, rebuilding assets on file changes.

Then run the app in production mode:
```sh
npm start
```