### Fable ![deno](https://github.com/fable-community/packs/actions/workflows/deploy.yml/badge.svg)

A portal app to create, manage and publish community packs

<https://packs.deno.dev>

### Contribute

<img width="175" height="33" src="https://fresh.deno.dev/fresh-badge-dark.svg" alt="Made with Fresh" />
</a>

```
deno task start
```

#### Required Environment Variables

- DISCORD_CLIENT_ID: a discord oauth client id
- DISCORD_CLIENT_SECRET: a discord oauth client secret

#### Optional Variables

###### Use a self-hosted instance of Fable

- API_ENDPOINT: an endpoint for a self-hosted instance of
  [Fable](https://github.com/ker0olos/fable)

###### Send public packs update messages to a discord channel

- PUBLIC_DISCORD_WEBHOOK_URL: a discord webhook url

###### Allow users to upload their own images

- S3_KEY_ID: A S3-compatible key id
- S3_ACCESS_KEY: A S3-compatible key access key
- S3_BUCKET_NAME: A S3-compatible bucket name
- S3_ENDPOINT: A S3-compatible endpoint (for uploading)
- S3_PUBLIC_ENDPOINT: the public url for the bucket (the image file name will be
  added to the end e.g.: `S3_PUBLIC_ENDPOINT/filename.png`)

###### Allow users to auto generate descriptions

- GEMINI_API_KEY: A [Gemini API Key](https://aistudio.google.com/app/apikey)
