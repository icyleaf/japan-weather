import type { GithubUserStats } from "@/schemas";

export async function fetchGithubUserStats(
  username: string,
): Promise<GithubUserStats> {
  const url = `https://api.github.com/users/${username}`;

  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      Accept: "application/vnd.github.v3+json",
    },
  });

  if (res.status === 404) throw new Error(`GitHub user ${username} not found`);
  if (!res.ok) throw new Error(`GitHub API fetch failed: ${res.status}`);

  const data = await res.json();

  return {
    login: data.login,
    public_repos: data.public_repos,
    followers: data.followers,
    following: data.following,
    public_gists: data.public_gists,
  };
}
