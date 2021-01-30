export const mutateBooleans = (options: Record<string, any>) => {
  for (let key in options) {
    // Turn booleans into 0 | 1
    typeof options[key] === "boolean" && (options[key] = Number(options[key]));
  }
};

export const sleep = (ms: number) => new Promise(res => setTimeout(() => res(true), ms));
