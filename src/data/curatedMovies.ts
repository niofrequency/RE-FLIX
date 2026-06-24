import { MediaItem } from '../types';

export const GENRES: { [key: number]: string } = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
  10759: 'Action & Adventure',
  10762: 'Kids',
  10763: 'News',
  10764: 'Reality',
  10765: 'Sci-Fi & Fantasy',
  10766: 'Soap',
  10767: 'Talk',
  10768: 'War & Politics'
};

export const CURATED_MOVIES: MediaItem[] = [
  {
    id: 157336,
    title: 'Interstellar',
    overview: 'The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.',
    poster_path: '/gEU2Qv6G37uBhI6GwYt7g6vun2Y.jpg',
    backdrop_path: '/xJHb7v0LIHdZ96p8v44u74vG68j.jpg',
    vote_average: 8.4,
    release_date: '2014-11-05',
    media_type: 'movie',
    genre_ids: [12, 18, 878]
  },
  {
    id: 299534,
    title: 'Avengers: Endgame',
    overview: 'After the devastating events of Avengers: Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos\' actions and restore balance to the universe.',
    poster_path: '/or066gI0bZg2sdv0NtGg6gZ3ZqG.jpg',
    backdrop_path: '/7RyGg48N7HX061666j06rYvwt6v.jpg',
    vote_average: 8.3,
    release_date: '2019-04-24',
    media_type: 'movie',
    genre_ids: [12, 878, 28]
  },
  {
    id: 693134,
    title: 'Dune: Part Two',
    overview: 'Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the known universe, he endeavors to prevent a terrible future only he can foresee.',
    poster_path: '/1pdfhudm9pZAW345TTvC88t0Y49.jpg',
    backdrop_path: '/xOMg7Ep7v6g2vFp7vY86t65vID.jpg',
    vote_average: 8.2,
    release_date: '2024-02-27',
    media_type: 'movie',
    genre_ids: [12, 878]
  },
  {
    id: 27205,
    title: 'Inception',
    overview: 'Cobb, a skilled thief who is the absolute best in the dangerous art of extraction, steals valuable secrets from deep within the subconscious during the dream state, when the mind is at its most vulnerable. Cobb\'s rare ability has made him a coveted player in this treacherous new world of corporate espionage, but it has also made him an international fugitive.',
    poster_path: '/o0O0o6NlmRzs67ST8H6gIov6vun.jpg',
    backdrop_path: '/8Zg06g2vFp7vY86t65vID8Zg0.jpg',
    vote_average: 8.4,
    release_date: '2010-07-15',
    media_type: 'movie',
    genre_ids: [28, 878, 12, 53]
  },
  {
    id: 155,
    title: 'The Dark Knight',
    overview: 'Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets. The partnership proves to be effective, but they soon find themselves prey to a reign of chaos unleashed by a rising criminal mastermind known to the terrified citizens of Gotham as the Joker.',
    poster_path: '/qJ2tWGBCg8mR0g9m7H6gIov6vun.jpg',
    backdrop_path: '/dqK77v6g2vFp7vY86t65vIDdqK.jpg',
    vote_average: 8.5,
    release_date: '2008-07-16',
    media_type: 'movie',
    genre_ids: [18, 28, 80, 53]
  },
  {
    id: 603,
    title: 'The Matrix',
    overview: 'Set in the 22nd century, The Matrix tells the story of a computer hacker who joins a group of underground insurgents fighting the vast and powerful computers who now rule the earth.',
    poster_path: '/f89U3Yv9pZAW345TTvC88t0Y59.jpg',
    backdrop_path: '/7RyGg48N7HX061666j06rYvwt6v.jpg',
    vote_average: 8.2,
    release_date: '1999-03-30',
    media_type: 'movie',
    genre_ids: [28, 878]
  },
  {
    id: 496243,
    title: 'Parasite',
    overview: 'All unemployed, Ki-taek\'s family takes peculiar interest in the wealthy and glamorous Parks for their livelihood until they get entangled in an unexpected incident.',
    poster_path: '/7IiTT06MAs8mR0g9m7H6gIov6vun.jpg',
    backdrop_path: '/xomG7v6g2vFp7vY86t65vIDxom.jpg',
    vote_average: 8.5,
    release_date: '2019-05-30',
    media_type: 'movie',
    genre_ids: [35, 18, 53]
  },
  {
    id: 550,
    title: 'Fight Club',
    overview: 'A ticking-time-bomb insomniac and a slippery soap salesman channel male aggression into a shocking new form of therapy. Their concept catches on, with undergound "fight clubs" forming in every town, until an eccentric gets in the way and ignites an out-of-control spiral toward disaster.',
    poster_path: '/pB8g7v6g2vFp7vY86t65vIDpB8.jpg',
    backdrop_path: '/7RyGg48N7HX061666j06rYvwt6v.jpg',
    vote_average: 8.4,
    release_date: '1999-10-15',
    media_type: 'movie',
    genre_ids: [18]
  }
];

export const CURATED_TV_SHOWS: MediaItem[] = [
  {
    id: 66732,
    name: 'Stranger Things',
    overview: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.',
    poster_path: '/49W76OCmGZJu1Y68oo6v20hx86u.jpg',
    backdrop_path: '/56v2DnL56Yor3as7xtur9uG7Xv2.jpg',
    vote_average: 8.6,
    first_air_date: '2016-07-15',
    media_type: 'tv',
    genre_ids: [18, 10765, 9648],
    seasons: [
      {
        season_number: 1,
        name: 'Season 1',
        episode_count: 8,
        episodes: [
          { episode_number: 1, name: 'Chapter One: The Vanishing of Will Byers', overview: 'On his way home from a friend\'s house, young Will sees something terrifying. Nearby, a sinister secret lurks in the depths of a government lab.' },
          { episode_number: 2, name: 'Chapter Two: The Weirdo on Maple Street', overview: 'Lucas, Mike and Dustin try to talk to the girl they found in the woods. Hopper questions an anxious Joyce about a phone call.' },
          { episode_number: 3, name: 'Chapter Three: Holly, Jolly', overview: 'An increasingly concerned Nancy looks for Barb and finds out Jonathan\'s been taking pictures. Joyce believes Will is trying to talk to her.' },
          { episode_number: 4, name: 'Chapter Four: The Body', overview: 'Refusing to believe Will is dead, Joyce tries to connect with her son. The boys give Eleven a makeover.' },
          { episode_number: 5, name: 'Chapter Five: The Flea and the Acrobat', overview: 'Hopper breaks into the lab while Dustin and Lucas search for the "Gate". Nancy and Jonathan share a scary moment in the woods.' },
          { episode_number: 6, name: 'Chapter Six: The Monster', overview: 'A frantic Jonathan looks for Nancy in the dark. Steve gets into a fight. Hopper and Joyce learn the truth about the lab\'s experiments.' },
          { episode_number: 7, name: 'Chapter Seven: The Bathtub', overview: 'The government agents close in on the boys and Eleven. Joyce and Hopper team up with Nancy and Jonathan to rescue Will.' },
          { episode_number: 8, name: 'Chapter Eight: The Upside Down', overview: 'Hopper and Joyce enter the Upside Down to find Will. Eleven faces the Demogorgon in a final, dramatic showdown at the school.' }
        ]
      },
      {
        season_number: 2,
        name: 'Season 2',
        episode_count: 9,
        episodes: [
          { episode_number: 1, name: 'Chapter One: MADMAX', overview: 'As the town prepares for Halloween, a high-scoring new player kicks up a stir at the arcade. Hopper inspects a field of rotting pumpkins.' },
          { episode_number: 2, name: 'Chapter Two: Trick or Treat, Freak', overview: 'After Will sees something terrible on trick-or-treat night, Mike wonders if Eleven is still out there. Nancy struggles with Barb\'s death.' },
          { episode_number: 3, name: 'Chapter Three: The Pollywog', overview: 'Dustin adopts a strange new pet. Eleven grows increasingly impatient. Bob urges Will to stand up to his fears.' }
        ]
      }
    ]
  },
  {
    id: 119051,
    name: 'Wednesday',
    overview: 'Wednesday Addams is sent to Nevermore Academy, a bizarre boarding school where she attempts to master her emerging psychic ability, thwart a monstrous killing spree, and solve the mystery that embroiled her parents 25 years ago.',
    poster_path: '/9PF77Y1Sg867v68A67t0YgB9u.jpg',
    backdrop_path: '/iH7S9Z8vUsPPgZgYThvR6I93Yv.jpg',
    vote_average: 8.5,
    first_air_date: '2022-11-23',
    media_type: 'tv',
    genre_ids: [10765, 9648, 35],
    seasons: [
      {
        season_number: 1,
        name: 'Season 1',
        episode_count: 8,
        episodes: [
          { episode_number: 1, name: 'Wednesday\'s Child Is Full of Woe', overview: 'When a deliciously devious prank gets Wednesday expelled, her parents send her to Nevermore Academy, the boarding school where they fell in love.' },
          { episode_number: 2, name: 'Woe Is the Loneliest Number', overview: 'The sheriff questions Wednesday about a strange incident. Later, Wednesday matches wits with a fierce rival in the annual Poe Cup race.' },
          { episode_number: 3, name: 'Friend or Woe', overview: 'Wednesday stumbles upon a secret society. During Outreach Day, Nevermore\'s outcasts mingle with Jericho\'s normies in Pilgrim World.' }
        ]
      }
    ]
  },
  {
    id: 1396,
    name: 'Breaking Bad',
    overview: 'Walter White, a New Mexico chemistry teacher, learns he has terminal cancer and partners with a former student to manufacture and sell methamphetamine to secure his family\'s financial future.',
    poster_path: '/ggFHv76O06I66j06rYvwt6vwt.jpg',
    backdrop_path: '/ts9Z8vUsPPgZgYThvR6I93Yv1396.jpg',
    vote_average: 8.9,
    first_air_date: '2008-01-20',
    media_type: 'tv',
    genre_ids: [18, 80],
    seasons: [
      {
        season_number: 1,
        name: 'Season 1',
        episode_count: 7,
        episodes: [
          { episode_number: 1, name: 'Pilot', overview: 'Diagnosed with terminal lung cancer, high school chemistry teacher Walter White teams up with former student Jesse Pinkman to cook meth.' },
          { episode_number: 2, name: 'Cat\'s in the Bag...', overview: 'Walt and Jesse attempt to dispose of the two bodies in the RV, which becomes increasingly complicated.' },
          { episode_number: 3, name: '...And the Bag\'s in the River', overview: 'Walt is forced to decide the fate of Krazy-8, while Jesse cleans up the messy aftermath of their first batch.' }
        ]
      }
    ]
  },
  {
    id: 99966,
    name: 'The Last of Us',
    overview: 'Twenty years after modern civilization has been destroyed, Joel, a hardened survivor, is hired to smuggle Ellie, a 14-year-old girl, out of an oppressive quarantine zone. What starts as a small job soon becomes a brutal, heartbreaking journey, as they both must traverse the U.S. and depend on each other for survival.',
    poster_path: '/uKv7f6O06I66j06rYvwt6vwt99.jpg',
    backdrop_path: '/ts9Z8vUsPPgZgYThvR6I93Yv99966.jpg',
    vote_average: 8.6,
    first_air_date: '2023-01-15',
    media_type: 'tv',
    genre_ids: [18, 10759, 10765],
    seasons: [
      {
        season_number: 1,
        name: 'Season 1',
        episode_count: 9,
        episodes: [
          { episode_number: 1, name: 'When You\'re Lost in the Darkness', overview: 'In 2003, a parasitic fungal outbreak sparks global panic. In 2023, smuggler Joel receives a high-stakes request.' },
          { episode_number: 2, name: 'Infected', overview: 'Joel, Tess and Ellie traverse a dangerous, abandoned Boston to reach a Firefly rendezvous point.' },
          { episode_number: 3, name: 'Long, Long Time', overview: 'Survivor Bill prepares to live out the apocalypse alone—until a stranger arrives and changes everything.' }
        ]
      }
    ]
  }
];
