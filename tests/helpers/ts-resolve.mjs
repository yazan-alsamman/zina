/**
 * A resolve hook that lets Node import the project's TypeScript the way the bundler does.
 *
 * Node strips types from a `.ts` file happily, but it will not GUESS an extension: `./materials`
 * resolves under Vite and fails under Node. Rather than writing `./materials.ts` in application
 * code — which exists to be bundled, not run by Node — the test process registers this hook and
 * the source stays idiomatic.
 *
 * Used by tests/cosmetics.test.mjs, which builds the 3D catalogue outside a browser.
 */
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith(".") && !/\.[a-z]+$/i.test(specifier)) {
    for (const extension of [".ts", ".mts", ".js"]) {
      try {
        const candidate = new URL(specifier + extension, context.parentURL);
        if (existsSync(fileURLToPath(candidate))) {
          return { url: candidate.href, shortCircuit: true, format: extension === ".js" ? "module" : "module-typescript" };
        }
      } catch {
        /* not a file URL parent — fall through to Node's own resolution */
      }
    }
  }
  return nextResolve(specifier, context);
}
