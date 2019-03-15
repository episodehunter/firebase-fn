import { dialogflow, SignIn } from "actions-on-google";
import { getUserId } from "../util/token";
import { getNumberOfEpisodesToWatch, getNextAirEpisode } from "./episode";

const dialogflowApp = dialogflow({ debug: true });

dialogflowApp.intent("Start Signin", (conv, params, argument, status) => {
  conv.ask(new SignIn("To get your profile"));
});

dialogflowApp.intent("Get Signin", (conv, params, argument, status) => {
  if (conv.user) {
    conv.user.profile.payload.sub;
    const payload = conv.user.profile.payload;
    conv.ask(`I got your account details, and your user id is ${payload.sub}.`);
  } else {
    conv.ask(`I won't be able to save your data, Dave?`);
  }
});

dialogflowApp.intent(
  "episodes_to_watch",
  async (conv, params, argument, status) => {
    console.log("Start episodes_to_watch");
    console.log("conv.user", conv.user);
    console.log("params", params);
    console.log("argument", argument);
    console.log("status", status);
    const userId = await getUserId(conv.user.raw.accessToken);
    if (!userId) {
      conv.ask(new SignIn("To know what to watch"));
    } else {
      const episodesToWatch = await getNumberOfEpisodesToWatch(userId);
      let strs = episodesToWatch
        .filter(e => e.numberOfEpisodesToWatch > 0)
        .map(e => `${e.numberOfEpisodesToWatch} episodes of ${e.show.name}`);

      if (strs.length === 0) {
        conv.ask(`You don't have any new episode to watch`);
      } else {
        const last = strs.pop();
        conv.ask(`You can watch ${strs.join(", ")} and ${last}`);
      }
    }
  }
);

dialogflowApp.intent(
  "Next episode to air",
  async (conv, params, argument, status) => {
    console.log("Start Next episode to air");
    console.log("conv.user", conv.user);
    console.log("params", params);
    console.log("argument", argument);
    console.log("status", status);

    let name = String(params.name);
    name = name
      .split(" ")
      .map(p => p.charAt(0).toUpperCase() + p.slice(1))
      .join(" ");

    console.log("Will search for ", name);

    const episode = await getNextAirEpisode(name);
    if (episode.type === "no-show") {
      conv.ask("I sorry but I could not found the show " + name);
    } else if (episode.type === "no-episode") {
      conv.ask(`There is not upcoming episode for ${name} right now`);
    } else {
      const data = episode.data;
      conv.ask(
        `The next episode of ${name} will air ${
          data.aired
        } and will be called ${data.name}`
      );
    }
  }
);

export { dialogflowApp };
