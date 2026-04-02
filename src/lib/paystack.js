const PAYSTACK_SCRIPT_URL = "https://js.paystack.co/v2/inline.js";

let paystackScriptPromise = null;

function getPaystackConstructor() {
  return window.Paystack || window.PaystackPop || null;
}

function loadPaystackScript() {
  if (typeof window === "undefined") {
    return Promise.reject(
      new Error("Paystack checkout is only available in the browser."),
    );
  }

  if (getPaystackConstructor()) {
    return Promise.resolve(getPaystackConstructor());
  }

  if (!paystackScriptPromise) {
    paystackScriptPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector(
        `script[src="${PAYSTACK_SCRIPT_URL}"]`,
      );

      if (existingScript) {
        existingScript.addEventListener("load", () => resolve(getPaystackConstructor()));
        existingScript.addEventListener("error", () => {
          reject(new Error("Unable to load Paystack checkout."));
        });
        return;
      }

      const script = document.createElement("script");
      script.src = PAYSTACK_SCRIPT_URL;
      script.async = true;
      script.onload = () => resolve(getPaystackConstructor());
      script.onerror = () => {
        reject(new Error("Unable to load Paystack checkout."));
      };
      document.body.appendChild(script);
    });
  }

  return paystackScriptPromise;
}

export async function startPaystackCheckout({ accessCode }) {
  if (!accessCode) {
    throw new Error("Missing Paystack access code.");
  }

  const PaystackConstructor = await loadPaystackScript();

  if (!PaystackConstructor) {
    throw new Error("Paystack checkout is unavailable right now.");
  }

  return new Promise((resolve, reject) => {
    const popup = new PaystackConstructor();

    popup.onCancel = () => {
      reject(
        new Error("Paystack checkout was cancelled. The sale is still pending."),
      );
    };

    popup.onError = (error) => {
      reject(new Error(error?.message || "Unable to complete Paystack checkout."));
    };

    popup.onSuccess = (transaction) => {
      resolve(transaction);
    };

    popup.resumeTransaction(accessCode);
  });
}
