module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["@typescript-eslint"],
  rules: {
    camelcase: [
      "error",
      {
        allow: [
          "full_name",
          "forks_count",
          "stargazers_count",
          "open_issues_count",
          "has_projects",
          "has_wiki",
          "delete_branch_on_merge",
          "per_page",
          "issue_number",
          "pull_number",
          "new_owner",
        ],
      },
    ],
  },
  ignorePatterns: ["bin/**/*", "dist/**/*"],
};
