const baseTestOptions = {
  exclude: [],
  include: ['__tests__/**/*.{test,spec}.{ts,js}', 'tests/**/*.{test,spec}.{ts,js}']
};

export function getConfig(): typeof baseTestOptions {
  return baseTestOptions;
};
