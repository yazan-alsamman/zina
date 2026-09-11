/**
 * ROBOTS.TXT — /robots.txt
 *
 * Content built by src/lib/robots.ts — see that file for why the policy never changes between a
 * mock and a real build, and why nothing is Disallowed.
 */
import type { APIRoute } from "astro";
import { robotsTxtContent } from "../lib/robots";

export const GET: APIRoute = () =>
  new Response(robotsTxtContent(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
