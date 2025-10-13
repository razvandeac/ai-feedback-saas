module.exports = {
  plugins: {
    // Explicitly point to THIS app's Tailwind config to avoid monorepo resolution issues
    tailwindcss: { config: "./tailwind.config.js" },
    autoprefixer: {},
  },
};

