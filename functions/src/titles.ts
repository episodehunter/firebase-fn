import { firestore } from "./util/firebase-app";
import { ShowTitle } from "./types";

function getShows(): Promise<ShowTitle[]> {
  return firestore
    .collection("shows")
    .get()
    .then(r => {
      return r.docs.map(d => {
        return {
          id: d.id,
          name: d.get("name"),
          followers: d.get("numberOfFollowers") || 0,
          tvdbId: d.get("ids.tvdb") || 0
        };
      });
    });
}

function updateTitels(titles: ShowTitle[]): Promise<any> {
  return firestore
    .collection("metadata")
    .doc("titles")
    .update({ titles: titles, lastupdated: new Date() });
}

function getLastUpdate(): Promise<Date> {
  return firestore
    .collection("metadata")
    .doc("titles")
    .get()
    .then(r => {
      const lastupdated = r.get("lastupdated");
      return lastupdated.toDate();
    });
}

function yesterDay() {
  const day = new Date();
  day.setDate(day.getDate() - 1);
  return day;
}

export async function updateTitles() {
  const lastupdated = await getLastUpdate();

  if (lastupdated > yesterDay()) {
    return {
      message: "Already up to date"
    };
  }

  const titles = await getShows();

  await updateTitels(titles);

  return {
    message: "Updated",
    number: titles.length
  };
}

export function getTitles(): Promise<ShowTitle[]> {
  return firestore
    .collection("metadata")
    .doc("titles")
    .get()
    .then(r => r.get('titles'));
}
