import { setTimeout as delay } from "node:timers/promises";

const origin = "https://3000-ipm73l9xe4jnsljoiu610-cf8d8d21.us4.manus.computer";

class CdpClient {
  constructor(url) {
    this.socket = new WebSocket(url);
    this.nextId = 1;
    this.pending = new Map();
    this.socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (!message.id) return;
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      message.error ? pending.reject(new Error(message.error.message)) : pending.resolve(message.result);
    });
  }

  async ready() {
    await new Promise((resolve, reject) => {
      this.socket.addEventListener("open", resolve, { once: true });
      this.socket.addEventListener("error", reject, { once: true });
    });
  }

  send(method, params = {}, sessionId) {
    const id = this.nextId++;
    this.socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
  }

  close() {
    this.socket.close();
  }
}

async function evaluate(client, sessionId, expression) {
  const response = await client.send("Runtime.evaluate", { expression, returnByValue: true }, sessionId);
  return response.result.value;
}

async function waitFor(client, sessionId, predicate, description) {
  for (let attempts = 0; attempts < 24; attempts += 1) {
    if (await predicate()) return;
    await delay(300);
  }
  throw new Error(`Timed out waiting for ${description}`);
}

async function waitForPageText(client, sessionId, text) {
  await waitFor(
    client,
    sessionId,
    async () => String(await evaluate(client, sessionId, "document.body?.innerText ?? ''")).includes(text),
    text,
  );
}

async function count(client, sessionId, ariaLabel) {
  return String(await evaluate(client, sessionId, `document.querySelector(${JSON.stringify(`[aria-label="${ariaLabel}"]`)})?.textContent?.trim() ?? ''`)).trim();
}

async function waitForCount(client, sessionId, ariaLabel, expected) {
  await waitFor(client, sessionId, async () => (await count(client, sessionId, ariaLabel)) === expected, `${ariaLabel} = ${expected}`);
  return expected;
}

async function waitForPositiveCount(client, sessionId, ariaLabel) {
  let value = "";
  await waitFor(client, sessionId, async () => {
    value = await count(client, sessionId, ariaLabel);
    return Number(value) > 0;
  }, `hydrated ${ariaLabel}`);
  return value;
}

async function clickSelector(client, sessionId, selector) {
  const clicked = await evaluate(client, sessionId, `(() => { const control = document.querySelector(${JSON.stringify(selector)}); if (!control) return false; control.click(); return true; })()`);
  if (!clicked) throw new Error(`Unable to find ${selector}`);
}

async function chooseUnsavedProduct(client, sessionId) {
  const product = await evaluate(client, sessionId, `(() => {
    const control = Array.from(document.querySelectorAll('button')).find((button) => button.getAttribute('aria-label')?.startsWith('Save '));
    const label = control?.getAttribute('aria-label') ?? '';
    const match = label.match(/^Save (.+) for later$/);
    return match ? { label, name: match[1] } : null;
  })()`);
  if (!product) throw new Error("No unsaved product available for validation");
  return product;
}

async function addProductToCart(client, sessionId, productName) {
  const clicked = await evaluate(client, sessionId, `(() => {
    const card = Array.from(document.querySelectorAll('article')).find((article) => article.textContent?.includes(${JSON.stringify(productName)}));
    const control = Array.from(card?.querySelectorAll('button') ?? []).find((button) => button.textContent?.trim() === 'Add to cart');
    if (!control) return false;
    control.click();
    return true;
  })()`);
  if (!clicked) throw new Error(`Unable to find ${productName} add-to-cart control`);
}

const version = await fetch("http://127.0.0.1:9222/json/version").then((response) => response.json());
const client = new CdpClient(version.webSocketDebuggerUrl);
await client.ready();

let browserContextId;
try {
  const targets = await client.send("Target.getTargets");
  const primaryTarget = targets.targetInfos.find((target) => target.type === "page" && target.url === `${origin}/`);
  if (!primaryTarget) throw new Error("Authenticated PRIME CART page was not found");

  const primary = await client.send("Target.attachToTarget", { targetId: primaryTarget.targetId, flatten: true });
  const primarySessionId = primary.sessionId;
  await evaluate(client, primarySessionId, "location.reload()");
  await waitForPageText(client, primarySessionId, "Hi, Srinath");
  await delay(700);

  const cookies = await client.send("Network.getAllCookies", {}, primarySessionId);
  const appCookies = cookies.cookies.filter((cookie) => cookie.domain.includes("3000-ipm73l9xe4jnsljoiu610-cf8d8d21.us4.manus.computer"));
  if (!appCookies.length) throw new Error("No PRIME CART session cookies available for independent-session validation");

  const context = await client.send("Target.createBrowserContext");
  browserContextId = context.browserContextId;
  const target = await client.send("Target.createTarget", { url: "about:blank", browserContextId });
  const independent = await client.send("Target.attachToTarget", { targetId: target.targetId, flatten: true });
  const independentSessionId = independent.sessionId;
  await client.send("Network.enable", {}, independentSessionId);
  await client.send("Network.setCookies", { cookies: appCookies }, independentSessionId);
  await client.send("Page.navigate", { url: `${origin}/` }, independentSessionId);
  await waitForPageText(client, independentSessionId, "Hi, Srinath");

  const before = {
    saved: await waitForPositiveCount(client, independentSessionId, "Saved items"),
    cart: await waitForPositiveCount(client, independentSessionId, "Open cart"),
  };
  const product = await chooseUnsavedProduct(client, independentSessionId);

  await clickSelector(client, independentSessionId, `button[aria-label=${JSON.stringify(product.label)}]`);
  const independentSavedAfterAdd = await waitForCount(client, independentSessionId, "Saved items", String(Number(before.saved) + 1));

  await evaluate(client, primarySessionId, "location.reload()");
  await waitForPageText(client, primarySessionId, "Hi, Srinath");
  const primarySavedAfterAdd = await waitForCount(client, primarySessionId, "Saved items", independentSavedAfterAdd);

  await clickSelector(client, primarySessionId, `button[aria-label=${JSON.stringify(`Remove ${product.name} from saved items`)}]`);
  const primarySavedAfterRemove = await waitForCount(client, primarySessionId, "Saved items", before.saved);

  await addProductToCart(client, independentSessionId, product.name);
  const independentCartAfterAdd = await waitForCount(client, independentSessionId, "Open cart", String(Number(before.cart) + 1));

  await evaluate(client, primarySessionId, "location.reload()");
  await waitForPageText(client, primarySessionId, "Hi, Srinath");
  const primaryCartAfterAdd = await waitForCount(client, primarySessionId, "Open cart", independentCartAfterAdd);

  await clickSelector(client, primarySessionId, 'button[aria-label="Open cart"]');
  await waitForPageText(client, primarySessionId, "Your cart");
  await clickSelector(client, primarySessionId, `button[aria-label=${JSON.stringify(`Remove ${product.name}`)}]`);
  const primaryCartAfterRemove = await waitForCount(client, primarySessionId, "Open cart", before.cart);

  const result = {
    independentAuthenticated: true,
    product: product.name,
    before,
    independentSavedAfterAdd,
    primarySavedAfterAdd,
    primarySavedAfterRemove,
    independentCartAfterAdd,
    primaryCartAfterAdd,
    primaryCartAfterRemove,
    cleanupRestoredBaseline: before.saved === primarySavedAfterRemove && before.cart === primaryCartAfterRemove,
  };
  console.log(JSON.stringify(result));
} finally {
  if (browserContextId) await client.send("Target.disposeBrowserContext", { browserContextId });
  client.close();
}
