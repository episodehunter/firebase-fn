export interface WatchHistory {
  episode: number;
  episodeNumber: number;
  season: number;
  showId: number;
  time: {
    toDate: () => Date;
  };
  type: number;
}

export interface Show {
  oldId: string;
  ids: {
    id: string;
    tvdb: number;
    imdb?: string;
  };
  airs: {
    day: number; // 0-6
    first: string;
    time: string;
  };
  ended: boolean;
  genre: string[];
  language: string;
  lastupdated: number;
  name: string;
  network: string;
  overview: string;
  runtime: number;
  numberOfFollowers: number;
  totalNumberOfEpisodes: number;
  seasons: number[];
}

export interface ShowTitle {
  id: string
  name: string
  followers: number
}
