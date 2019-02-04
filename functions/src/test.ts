import { getNumberOfEpisodesToWatch } from "./action/episode";

export async function testFunction() {
  const userId = '2';
  const episodesToWatch = await getNumberOfEpisodesToWatch(userId);
    let strs = episodesToWatch
      .filter(e => e.numberOfEpisodesToWatch > 0)
      .map(e => `${e.numberOfEpisodesToWatch} episodes of ${e.show.name}`);
    
    if (strs.length === 0) {
      return `You don't have any new episode to watch`;
    } else {
      const last = strs.pop();
      return `You kan watch ${strs.join(', ')} and ${last}`;
    }
}
