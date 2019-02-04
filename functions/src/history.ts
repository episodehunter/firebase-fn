import { firestore } from "./util/firebase-app";
import { WatchHistory, Show } from "./types";

function getHistoryPage(userId: string, page: number): Promise<WatchHistory[]> {
  return firestore
    .collection("users")
    .doc(userId)
    .collection("showsWatchHistory")
    .orderBy("time", "desc")
    .limit(20)
    .offset(page * 20)
    .get()
    .then(r => r.docs.map(d => d.data() as WatchHistory));
}

function getShow(showId: string): Promise<Show | null> {
  return firestore
    .collection("shows")
    .doc(showId)
    .get()
    .then(r => {
      if (r.exists) {
        const show = r.data() as Show;
        show.ids.id = r.id;
        return show;
      }
      return null;
    });
}

export async function get(userId: string, page: number) {
  const historyPage = await getHistoryPage(userId, page);
  const showsIds = new Set<string>();
  historyPage.forEach(h => showsIds.add(String(h.showId)));
  const shows = await Promise.all(Array.from(showsIds).map(getShow));
  return historyPage.map(h => {
    const show = shows.find(s => s.ids.id === String(h.showId));
    return {
      episodeNumber: h.episodeNumber,
      time: h.time.toDate(),
      ids: {
        showId: h.showId,
        showTvdb: show.ids.tvdb
      },
      type: h.type,
      season: h.season,
      episodeh: h.episode,
      showName: show.name
    }
  });
}
