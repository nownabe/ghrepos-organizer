import inquirer from "inquirer";

import type { ActionBuilder } from ".";

type Parameter =
  | "visibility"
  | "has_projects"
  | "has_wiki"
  | "delete_branch_on_merge"
  | "archived";

type UpdateOptions = {
  parametersToChange: Parameter[];
  visibility: "public" | "private";
  has_projects: boolean;
  has_wiki: boolean;
  delete_branch_on_merge: boolean;
};

const parameters: Parameter[] = [
  "visibility",
  "has_projects",
  "has_wiki",
  "delete_branch_on_merge",
  "archived",
];

const parameterChoices = [
  {
    name: "Visibility (public or private)",
    value: "visibility",
    short: "Visibility",
  },
  {
    name: "Projects feature (enable or disable)",
    value: "has_projects",
    short: "Projects",
  },
  {
    name: "Wiki feature (enable or disable)",
    value: "has_wiki",
    short: "Wiki",
  },
  {
    name: "Automatically delete branches on merge (enable or disable)",
    value: "delete_branch_on_merge",
    short: "Delete branches",
  },
  {
    name: "Archive",
    value: "archived",
    short: "Archive",
  },
];

const builder: ActionBuilder = async (octokit) => {
  const options = await inquirer.prompt<UpdateOptions>([
    {
      type: "checkbox",
      name: "parametersToChange",
      message: "Choose parameters to update.",
      choices: parameterChoices,
      loop: false,
    },
    {
      type: "list",
      name: "visibility",
      message: "Choose visibility.",
      choices: ["public", "private"],
      default: "private",
      loop: false,
      when: (current) => current.parametersToChange.includes("visibility"),
    },
    {
      type: "list",
      name: "has_projects",
      message: "Projects feature",
      choices: [
        { name: "Enable", value: true },
        { name: "Disable", value: false },
      ],
      default: false,
      when: (current) => current.parametersToChange.includes("has_projects"),
    },
    {
      type: "list",
      name: "has_wiki",
      message: "Wiki feature",
      choices: [
        { name: "Enable", value: true },
        { name: "Disable", value: false },
      ],
      default: false,
      when: (current) => current.parametersToChange.includes("has_wiki"),
    },
    {
      type: "list",
      name: "delete_branch_on_merge",
      message: "Automatically delete branches on merge",
      choices: [
        { name: "Enable", value: true },
        { name: "Disable", value: false },
      ],
      default: true,
      when: (current) =>
        current.parametersToChange.includes("delete_branch_on_merge"),
    },
  ]);

  return async (repo, updateText) => {
    if (options.parametersToChange.length === 0) {
      return;
    }

    // archived repos are read-only
    if (repo.archived) {
      return;
    }

    updateText("updating repository");

    const params: Record<string, string | boolean> = {};

    parameters.forEach((p) => {
      if (options.parametersToChange.includes(p)) {
        if (
          p === "visibility" &&
          (repo.visibility === options.visibility || repo.fork)
        ) {
          return;
        }

        if (p === "archived") {
          params[p] = true;
        } else {
          params[p] = options[p];
        }
      }
    });

    await octokit.request("PATCH /repos/{owner}/{repo}", {
      owner: repo.owner.login,
      repo: repo.name,
      ...params,
    });
  };
};

export default builder;
