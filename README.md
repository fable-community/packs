### Fable ![deno](https://github.com/fable-community/packs/actions/workflows/deno.yml/badge.svg)

A portal app to create, manage and publish community packs

<https://packs.deno.dev>

### Contribute

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/fable-community/packs)
<a href="https://fresh.deno.dev">
<img width="175" height="33" src="https://fresh.deno.dev/fresh-badge-dark.svg" alt="Made with Fresh" />
</a>

```
deno task start
```

###### Required Environment Variables:

- DISCORD_CLIENT_ID: a discord oauth client id
- DISCORD_CLIENT_SECRET: a discord oauth client secret

###### Optional Environment Variables:

- API_ENDPOINT: an endpoint for a self-hosted instance of
  [Fable](https://github.com/ker0olos/fable)
- PUBLIC_DISCORD_WEBHOOK_URL: a discord webhook url
- B2_KEY_ID: [B2 Cloud Storage][b2] app key id
- B2_KEY: [B2 Cloud Storage][b2] app key
- B2_BUCKET_ID: [B2 Cloud Storage][b2] bucket id
- B2_BUCKET_NAME: [B2 Cloud Storage][b2] bucket name
- CF_ACCOUNT_ID: A cloudflare account id
- CF_AI_TOKEN: A cloudflare workers AI access token

[b2]: https://www.backblaze.com/b2/cloud-storage.html
