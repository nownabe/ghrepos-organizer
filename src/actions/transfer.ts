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

  return async (repo) => {
    const sleep = () =>
      new Promise<void>((resolve) => setTimeout(() => resolve(), 1000));
    await sleep();
  };
};

export default builder;
