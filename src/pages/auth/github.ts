import type { APIRoute } from 'astro';
import { OAuthApp } from "@octokit/oauth-app";

const clientId = import.meta.env.GITHUB_CLIENT_ID;
const clientSecret = import.meta.env.GITHUB_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  throw new Error("GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET must be set");
}

const oauthApp = new OAuthApp({
  clientId,
  clientSecret,
});

export const get: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    // If no code, redirect to GitHub for authorization
    const a = oauthApp.getWebFlowAuthorizationUrl({
      redirectUrl: `${url.origin}/api/auth/github`,
      scopes: ["user"],
    });


    return new Response("Redirecting...", {
      status: 302,
      headers: { Location: url },
    });
  }

  try {
    // Exchange code for access token
    const { authentication } = await oauthApp.createToken({
      code,
    });

    // Get user data
    const { data: userData } = await oauthApp.octokit.request('GET /user', {
      headers: {
        authorization: `token ${authentication.token}`,
      },
    });

    // In a real app, you'd typically set a session cookie here
    // For this example, we'll just return the user data
    return new Response(JSON.stringify(userData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error in GitHub OAuth flow:", error);
    return new Response("Authentication failed", { status: 400 });
  }
};
