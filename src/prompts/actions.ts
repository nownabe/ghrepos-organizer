import { Octokit } from "@octokit/rest";
import inquirer from "inquirer";

import actionBuilders, { Action, ActionName, Actions } from "../actions";

type Result = {
  targetOwner: string;
  actions: ActionName[];
};

const choices = [
  {
    name: "Close all issues",
    value: "closeIssues",
    short: "Close issues",
  },
  {
    name: "Close all pull requests",
    value: "closePullRequests",
    short: "Close pull requests",
  },
  {
    name: "Update repository (visibility, archive, etc.)",
    value: "update",
    short: "Update",
  },
  {
    name: "Transfer repository",
    value: "transfer",
    short: "Transfer",
  },
];

if (process.env.ENABLE_DELETE === "true") {
  choices.unshift({
    name: "Delete repository",
    value: "delete",
    short: "Delete",
  });
}

const buildQuestions = (user: string): inquirer.QuestionCollection<Result> => [
  {
    type: "input",
    name: "targetOwner",
    message: "Which organization do you want to organize?",
    default: user,
  },
  {
    type: "checkbox",
    name: "actions",
    message: "Choose actions.",
    choices,
  },
];

const actionsPrompt = async (octokit: Octokit): Promise<Actions> => {
  const user = (await octokit.request("GET /user")).data.login;

  const result = await inquirer.prompt<Result>(buildQuestions(user));

  if (result.actions.includes("delete")) {
    result.actions = ["delete"];
  }

  const actions: Action[] = [];

  for (const name of result.actions) {
    const builder = actionBuilders[name];
    const action = await builder(octokit);
    actions.push(action);
  }

  return {
    targetOwner: result.targetOwner,
    isOwnerUser: user === result.targetOwner,
    actions,
  };
};

export default actionsPrompt;
