import { firestore } from "../util/firebase-app";

export type Episode = {
  episodeNumber?: number
  season: number;
  episode: number;
  aired: string;
  name: string;
};

export type UserMetaData = {
  following: number[];
};

export type Show = {
  name: string
  ids: {
    id: number
  }
}

const showCollection = () => firestore.collection('shows');

const showDoc = (id: string) =>
  firestore
    .collection('shows')
    .doc(String(id))

const userDoc = (id: string) =>
  firestore
    .collection('users')
    .doc(String(id))

const episodesCollection = (showId: string) =>
  showDoc(String(showId)).collection('episodes')

const showsWatchHistoryCollection = (userId: string) =>
  userDoc(userId).collection('showsWatchHistory')

function createDateString(date: Date) {
  let month = String(date.getMonth() + 1);
  if (month.length === 1) {
    month = '0' + month;
  }
  let day = String(date.getDate());
  if (month.length === 1) {
    day = '0' + day;
  }
  return `${date.getFullYear()}-${month}-${day}`;
}

function getNumberOfEpisodesAfter(
  showId: string,
  episodeNumber: number
): Promise<number> {
  return episodesCollection(showId)
    .where('episodeNumber', '>', episodeNumber)
    .orderBy('episodeNumber')
    .get()
    .then(querySnapshot => {
      let n = 0;
      let stop = false;
      querySnapshot.forEach(result => {
        if (stop) {
          return;
        } else if (result.data().aired <= createDateString(new Date())) {
          n++;
        } else {
          stop = true;
        }
      })
      return n;
    })
}

function getHighestWatchedEpisode(
  showId: string,
  userId: string
): Promise<Episode | null> {
  return showsWatchHistoryCollection(userId)
    .where('showId', '==', Number(showId))
    .orderBy('episodeNumber', 'desc')
    .limit(1)
    .get()
    .then(querySnapshot => {
      if (querySnapshot.size === 0) {
        return null;
      }
      return querySnapshot.docs[0].data() as Episode;
    });
}

function getUserMetaData(
  userId: string
): Promise<UserMetaData> {
  return userDoc(userId)
    .get()
    .then(r => r.data() as UserMetaData)
}

async function getFollowingShowIds(
  userId: string
): Promise<string[]> {
  const userMetadata = await getUserMetaData(userId);
  return (userMetadata.following || []).map(String);
}

async function getShow(id: string): Promise<Show | null> {
  return showDoc(id)
    .get()
    .then(r => {
      if (!r.exists) {
        return null
      }
      return r.data() as Show;
    });
}

async function getByName(name: string): Promise<Show | null> {
  return showCollection()
    .where('name', '==', name)
    .limit(1)
    .get()
    .then(r => {
      if (r.size === 1) {
        return r.docs[0].data() as Show
      }
      return null;
    });
}

export function getUpcommingEpisodes(
  showId: string,
  now = new Date()
): Promise<Episode> {
  return episodesCollection(showId)
    .where('aired', '>=', createDateString(now))
    .orderBy('aired')
    .limit(1)
    .get()
    .then(querySnapshot => {
      if (querySnapshot.size === 1) {
        return querySnapshot.docs[0].data() as Episode;
      }
      return null;
    });
}

export async function getNextAirEpisode(showName: string) {
  const show = await getByName(showName);
  if (!show) {
    return {
      type: 'no-show'
    };
  }
  const episode = await getUpcommingEpisodes(String(show.ids.id));
  if (!episode) {
    return {
      type: 'no-episode'
    };
  }
  return {
    type: 'episode',
    data: episode
  }
}

export async function getNumberOfEpisodesToWatch(userId: string) {
  const showIds = await getFollowingShowIds(userId);
  return Promise.all(showIds.map(async id => {
      const [ episode, show ] = await Promise.all([getHighestWatchedEpisode(id, userId), getShow(id)]);
      let nextNumber = 0;
      if (episode) {
        if (!episode.episodeNumber) {
          nextNumber = episode.season * 10000 + episode.episode + 1
        } else {
          nextNumber = episode.episodeNumber + 1;
        }
      }
      const numberOfEpisodesToWatch = await getNumberOfEpisodesAfter(id, nextNumber);
      return {
        show,
        numberOfEpisodesToWatch
      }
    })
  );
}



