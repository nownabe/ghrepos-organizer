import inquirer from "inquirer";
import type { ActionBuilder } from ".";

type TransferOptions = {
  destination: string;
};

const builder: ActionBuilder = async (octokit) => {
  const options = await inquirer.prompt<TransferOptions>([
    {
      type: "list",
      name: "destination",
      message: "Choose the destination of transfer.",
      choices: (
        await octokit.request("GET /user/orgs")
      ).data.map((org) => org.login),
      loop: false,
    },
  ]);

  return async (repo, updateText) => {
    updateText("transfering repository");

    await octokit.request("POST /repos/{owner}/{repo}/transfer", {
      owner: repo.owner.login,
      repo: repo.name,
      new_owner: options.destination,
    });
  };
};

export default builder;
