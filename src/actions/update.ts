import inquirer from "inquirer";

import type { ActionBuilder } from ".";

const builder: ActionBuilder = async (octokit) => {
  return async (repo, updateText) => {
    updateText("updating repository");
  };
};

export default builder;
