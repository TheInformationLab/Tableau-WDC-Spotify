const tableau = require('./tableauwdc-2.3.latest.min.js');

const trackCols = [{
  id: 'album_type',
  alias: 'Album Type',
  dataType: tableau.dataTypeEnum.string,
}, {
  id: 'album_href',
  alias: 'Album Link',
  dataType: tableau.dataTypeEnum.string,
}, {
  id: 'album_id',
  alias: 'Album ID',
  dataType: tableau.dataTypeEnum.string,
}, {
  id: 'album_image',
  alias: 'Album Image',
  dataType: tableau.dataTypeEnum.string,
}, {
  id: 'album_name',
  alias: 'Album Name',
  dataType: tableau.dataTypeEnum.string,
}, {
  id: 'album_uri',
  alias: 'Album URI',
  dataType: tableau.dataTypeEnum.string,
}, {
  id: 'artists',
  alias: 'Artists',
  dataType: tableau.dataTypeEnum.string,
}, {
  id: 'disc_number',
  alias: 'Disc Number',
  dataType: tableau.dataTypeEnum.int,
}, {
  id: 'duration_ms',
  alias: 'Duration (ms)',
  dataType: tableau.dataTypeEnum.int,
}, {
  id: 'explicit',
  alias: 'Explicit',
  dataType: tableau.dataTypeEnum.bool,
}, {
  id: 'href',
  alias: 'Link',
  dataType: tableau.dataTypeEnum.string,
}, {
  id: 'id',
  alias: 'Track ID',
  dataType: tableau.dataTypeEnum.string,
}, {
  id: 'name',
  alias: 'Name',
  dataType: tableau.dataTypeEnum.string,
}, {
  id: 'popularity',
  alias: 'Popularity',
  dataType: tableau.dataTypeEnum.int,
}, {
  id: 'preview_url',
  alias: 'Preview Link',
  dataType: tableau.dataTypeEnum.string,
}, {
  id: 'track_number',
  alias: 'Track Number',
  dataType: tableau.dataTypeEnum.int,
}, {
  id: 'played_at',
  alias: 'Played At',
  dataType: 'datetime',
}];

const playlistCols = [{
  id: 'collaborative',
  alias: 'Collaborative',
  dataType: tableau.dataTypeEnum.bool,
}, {
  id: 'href',
  alias: 'Link',
  dataType: tableau.dataTypeEnum.string,
}, {
  id: 'id',
  alias: 'Playlist ID',
  dataType: tableau.dataTypeEnum.string,
  columnRole: 'dimension',
  columnType: 'discrete',
}, {
  id: 'image',
  alias: 'Image',
  dataType: tableau.dataTypeEnum.string,
}, {
  id: 'name',
  alias: 'Name',
  dataType: tableau.dataTypeEnum.string,
}, {
  id: 'owner_name',
  alias: 'Owner Name',
  dataType: tableau.dataTypeEnum.string,
}, {
  id: 'owner_href',
  alias: 'Owner Link',
  dataType: tableau.dataTypeEnum.string,
}, {
  id: 'owner_id',
  alias: 'Owner ID',
  dataType: tableau.dataTypeEnum.string,
}, {
  id: 'owner_type',
  alias: 'Owner Type',
  dataType: tableau.dataTypeEnum.string,
}, {
  id: 'primary_color',
  alias: 'Primary Colour',
  dataType: tableau.dataTypeEnum.string,
}, {
  id: 'public',
  alias: 'Public',
  dataType: tableau.dataTypeEnum.bool,
}, {
  id: 'tracks_total',
  alias: 'Track Count',
  dataType: tableau.dataTypeEnum.int,
}, {
  id: 'uri',
  alias: 'Playlist URI',
  dataType: tableau.dataTypeEnum.string,
}];

const playlistTrackCols = [{
  id: 'added_at',
  alias: 'Added At',
  dataType: tableau.dataTypeEnum.datetime,
}, {
  id: 'is_local',
  alias: 'Is Local',
  dataType: tableau.dataTypeEnum.bool,
}, {
  id: 'album_type',
  alias: 'Album Type',
  dataType: tableau.dataTypeEnum.string,
}, {
  id: 'album_href',
  alias: 'Album Link',
  dataType: tableau.dataTypeEnum.string,
}, {
  id: 'album_id',
  alias: 'Album ID',
  dataType: tableau.dataTypeEnum.string,
}, {
  id: 'album_image',
  alias: 'Album Image',
  dataType: tableau.dataTypeEnum.string,
}, {
  id: 'album_name',
  alias: 'Album Name',
  dataType: tableau.dataTypeEnum.string,
}, {
  id: 'album_uri',
  alias: 'Album URI',
  dataType: tableau.dataTypeEnum.string,
}, {
  id: 'artists',
  alias: 'Artists',
  dataType: tableau.dataTypeEnum.string,
}, {
  id: 'disc_number',
  alias: 'Disc Number',
  dataType: tableau.dataTypeEnum.int,
}, {
  id: 'duration_ms',
  alias: 'Duration (ms)',
  dataType: tableau.dataTypeEnum.int,
}, {
  id: 'explicit',
  alias: 'Explicit',
  dataType: tableau.dataTypeEnum.bool,
}, {
  id: 'href',
  alias: 'Link',
  dataType: tableau.dataTypeEnum.string,
}, {
  id: 'id',
  alias: 'Track ID',
  dataType: tableau.dataTypeEnum.string,
}, {
  id: 'name',
  alias: 'Name',
  dataType: tableau.dataTypeEnum.string,
}, {
  id: 'popularity',
  alias: 'Popularity',
  dataType: tableau.dataTypeEnum.int,
}, {
  id: 'preview_url',
  alias: 'Preview Link',
  dataType: tableau.dataTypeEnum.string,
}, {
  id: 'track_number',
  alias: 'Track Number',
  dataType: tableau.dataTypeEnum.int,
}, {
  id: 'played_at',
  alias: 'Played At',
  dataType: 'datetime',
}, {
  id: 'playlist_id',
  alias: 'Playlist ID',
  dataType: tableau.dataTypeEnum.string,
  filterable: true,
  columnRole: 'dimension',
  columnType: 'discrete',
}];

const recentTracks = {
  id: 'recentTracks',
  alias: '50 Recently Played Tracks',
  columns: trackCols,
};

const myPlaylists = {
  id: 'myPlaylists',
  alias: 'My Playlists',
  columns: playlistCols,
};

const playlistTracks = {
  id: 'playlistTracks',
  alias: 'Playlist Tracks',
  columns: playlistTrackCols,
  joinOnly: true,
  foreignKey: {
    tableId: 'myPlaylists',
    columnId: 'id',
  },
};

// const attendeesbyMyEventsOrganisations = {
//   alias: 'Attendees by My Organisations & Events',
//   tables: [{
//     id: myOrganisations.id,
//     alias: myOrganisations.alias,
//   }, {
//     id: myEvents.id,
//     alias: myEvents.alias,
//   }, {
//     id: myAttendees.id,
//     alias: myAttendees.alias,
//   }],
//   joins: [{
//     left: {
//       tableAlias: myOrganisations.alias,
//       columnId: 'id',
//     },
//     right: {
//       tableAlias: myEvents.alias,
//       columnId: 'organization_id',
//     },
//     joinType: 'inner',
//   }, {
//     left: {
//       tableAlias: myEvents.alias,
//       columnId: 'id',
//     },
//     right: {
//       tableAlias: myAttendees.alias,
//       columnId: 'event_id',
//     },
//     joinType: 'left',
//   }],
// };

module.exports = {
  schema: {
    tables: [
      recentTracks,
      myPlaylists,
      playlistTracks,
    ],
    joins: [
    ],
  },
};
