// jQuery
import 'jquery';
// PopperJS
import 'popper.js';
// Bootstrap 4
import 'bootstrap';
// Material Design Bootstrap
import '../vendors/mdb/js/mdb';

const { schema } = require('./schema');

const { async } = window;

// const { async } = window;
const apiBase = 'https://api.spotify.com/v1';

let authUrl = 'https://accounts.spotify.com/authorize?response_type=code&client_id=5dcecf65c5e946be80561d930bdd1c4b&redirect_uri=https://spotify-wdc.theinformationlab.io&scope=user-top-read%20user-read-recently-played%20user-read-email';
let serverBase = '';
let proxyBase = '';
let tableau;

if (window.location.host !== 'spotify-wdc.theinformationlab.io') {
  authUrl = 'https://accounts.spotify.com/authorize?response_type=code&client_id=5dcecf65c5e946be80561d930bdd1c4b&redirect_uri=http://localhost:8000&scope=user-top-read%20user-read-recently-played%20user-read-email';
  serverBase = 'http://localhost:3001';
  proxyBase = 'http://localhost:3002';
}

// **
// START Utility functions
// **

// Function getQueryParams
//  - Parses URL parameters into a JSON Object
// @qs  {string}    The URL query string, usually from document.location.search
function getParameterByName(name) {
  const url = window.location.href;
  const testName = name.replace(/[[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${testName}(=([^&#]*)|&|#|$)`);
  const results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

// Function convertDateTime
//  - Parses datetime returned from API to one for Tableau
// @dt  {string}    The datetime to convert
function convertDateTime(dt) {
  const date = new Date(dt);
  const tabDate = `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()} ${date.getUTCHours()}:${date.getUTCMinutes()}:${date.getUTCSeconds()}`;
  return tabDate;
}

// Function getTokens
//  - Gets access and refresh tokens for the logged in user
// @code        {string}  authorisation code from OAuth2 redirect
// @callback    {function}  callback function returning the credentials
function getTokens(code, callback) {
  const settings = {
    url: `${serverBase}/api/auth?code=${code}`,
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  };

  $.ajax(settings).done((response) => {
    const creds = JSON.parse(response);
    const expires = new Date();
    expires.setSeconds(expires.getSeconds() + (creds.expires_in - 600));
    creds.expires = expires;
    callback(JSON.stringify(creds));
  });
}

function refreshTokens(callback) {
  const creds = JSON.parse(tableau.password);
  const settings = {
    url: `${serverBase}/api/refresh?token=${creds.refresh_token}`,
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  };
  $.ajax(settings).done((response) => {
    const newCreds = JSON.parse(response);
    const expires = new Date();
    expires.setSeconds(expires.getSeconds() + (creds.expires_in - 600));
    newCreds.expires = expires;
    callback(JSON.stringify(newCreds));
  });
}

function tokensHaveExpired() {
  const creds = JSON.parse(tableau.password);
  const now = new Date();
  const expires = new Date(creds.expires);
  return now > expires;
}

function tokensValid(callback) {
  const creds = JSON.parse(tableau.password);
  const url = `${apiBase}/me`;
  const settings = {
    url: `${proxyBase}/proxy`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${creds.access_token}`,
      'Target-URL': url,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  };
  $.ajax(settings).done((response) => {
    if (response && response.email) {
      callback(true);
    } else {
      callback(false);
    }
  });
}

function checkTokens(callback) {
  if (tokensHaveExpired()) {
    refreshTokens((newCreds) => {
      console.log(newCreds);
      tableau.password = newCreds;
      callback();
    });
  } else {
    tokensValid((result) => {
      if (result) {
        callback();
      } else {
        refreshTokens((newCreds) => {
          tableau.password = JSON.stringify(newCreds);
          callback();
        });
      }
    });
  }
}

function extractTracks(items, callback, playlistId) {
  const tracks = [];
  for (let i = 0; i < items.length; i += 1) {
    const track = {};
    if (items[i].added_at) {
      track.added_at = convertDateTime(items[i].added_at);
    }
    if (items[i].is_local) {
      track.is_local = items[i].is_local;
    }
    if (items[i].track && items[i].track.album) {
      track.album_type = items[i].track.album.album_type;
      track.album_href = items[i].track.album.href;
      track.album_id = items[i].track.album.id;
      if (items[i].track.album.images && items[i].track.album.images.length > 0) {
        track.album_image = items[i].track.album.images[0].url;
      }
      track.album_name = items[i].track.album.name;
      track.album_uri = items[i].track.album.uri;
    }
    if (items[i].track.artists && items[i].track.artists[0]) {
      track.artists = items[i].track.artists[0].name;
    }
    if (items[i].track.artists && items[i].track.artists[1]) {
      track.artists = `${track.artists}, ${items[i].track.artists[1].name}`;
    }
    if (items[i].track.artists && items[i].track.artists[2]) {
      track.artists = `${track.artists}, ${items[i].track.artists[2].name}`;
    }
    track.disc_number = items[i].track.disc_number;
    track.duration_ms = items[i].track.duration_ms;
    track.explicit = items[i].track.explicit;
    track.href = items[i].track.href;
    track.id = items[i].track.id;
    track.name = items[i].track.name;
    track.popularity = items[i].track.popularity;
    track.preview_url = items[i].track.preview_url;
    track.track_number = items[i].track.track_number;
    track.played_at = convertDateTime(items[i].played_at);
    if (playlistId) {
      track.playlist_id = playlistId;
    }
    tracks.push(track);
  }
  callback(tracks);
}

// Function getRecentTracks
//  - Gets recently played tracks associated with the current user
// @callback      {array}   List of organisations
// @data          {array}   Optional, data already downloaded and passed on for paging
// @continuation  {string}  Continuation url for next page of data
function getRecentTracks(callback, data, continuation) {
  checkTokens(() => {
    const creds = JSON.parse(tableau.password);
    let url = `${apiBase}/me/player/recently-played`;
    let params = '';
    if (!continuation) {
      params = '?limit=50';
    }
    if (continuation) {
      url = continuation;
    }
    const settings = {
      url: `${proxyBase}/proxy${params}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${creds.access_token}`,
        'Target-URL': url,
      },
    };

    $.ajax(settings).done((response) => {
      let tracks = [];
      if (data) {
        tracks = data;
      }
      if (response.items && response.items.length > 0) {
        tracks = tracks.concat(response.items);
      }
      if (response.next) {
        getRecentTracks(callback, tracks, response.next);
      } else {
        callback(tracks);
      }
    });
  });
}

// Function getMyPlaylists
//  - Gets playlists associated with the current user
// @callback      {array}   List of playlists
// @data          {array}   Optional, data already downloaded and passed on for paging
// @continuation  {string}  Continuation url for next page of data
function getMyPlaylists(callback, data, continuation) {
  checkTokens(() => {
    const creds = JSON.parse(tableau.password);
    let url = `${apiBase}/me/playlists`;
    let params = '';
    if (!continuation) {
      params = '?limit=50';
    }
    if (continuation) {
      url = continuation;
    }
    const settings = {
      url: `${proxyBase}/proxy${params}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${creds.access_token}`,
        'Target-URL': url,
      },
    };

    $.ajax(settings).done((response) => {
      let playlists = [];
      if (data) {
        playlists = data;
      }
      if (response.items && response.items.length > 0) {
        playlists = playlists.concat(response.items);
      }
      if (response.next) {
        getMyPlaylists(callback, playlists, response.next);
      } else {
        callback(playlists);
      }
    });
  });
}

// Function getPlaylistTracks
//  - Gets tracks belonging to a playlist
// @playlistIds   {string}  ID for playlist
// @callback      {array}   List of playlists
// @data          {array}   Optional, data already downloaded and passed on for paging
// @continuation  {string}  Continuation url for next page of data
function getPlaylistTracks(playlistId, callback, data, continuation) {
  checkTokens(() => {
    const creds = JSON.parse(tableau.password);
    let url = `${apiBase}/playlists/${playlistId}/tracks`;
    let params = '';
    if (!continuation) {
      params = '?limit=50';
    }
    if (continuation) {
      url = continuation;
    }
    const settings = {
      url: `${proxyBase}/proxy${params}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${creds.access_token}`,
        'Target-URL': url,
      },
    };
    $.ajax(settings).done((response) => {
      let tracks = [];
      if (data) {
        tracks = data;
      }
      if (response.items && response.items.length > 0) {
        tracks = tracks.concat(response.items);
      }
      if (response.next) {
        getPlaylistTracks(playlistId, callback, tracks, response.next);
      } else {
        callback(tracks);
      }
    });
  });
}

// **
// END Utility functions
// **

// **
// START Tableau WDC Code
// **
tableau = require('./tableauwdc-2.3.latest.min.js');

const ebConnector = tableau.makeConnector();

ebConnector.init = (initCallback) => {
  tableau.authType = tableau.authTypeEnum.custom;

  tableau.connectionName = 'Spotify';

  const code = getParameterByName('code');
  let hasAuth = false;
  if (tableau.password) {
    hasAuth = tableau.password.length > 0;
  }
  if (code) {
    // User has logged in. Saving token to password
    const authcode = code;
    getTokens(authcode, (tokens) => {
      if (tableau.phase === tableau.phaseEnum.interactivePhase
          || tableau.phase === tableau.phaseEnum.authPhase) {
        if (!hasAuth) {
          if (tableau.password === undefined || tableau.password === '') {
            tableau.password = tokens;
          }
          tableau.submit();
        } else {
          tableau.submit();
        }
      }
    });
  } else if (hasAuth) {
    tableau.submit();
  } else {
    const settings = {
      url: '/api/stats',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      processData: false,
      data: '{\n\t"wdc": "spotify",\n\t"action": "view"\n}',
    };
    $.ajax(settings)
      .done((response) => {
        console.log(response);
      })
      .always(() => {
        window.location.href = authUrl;
      });
  }
  initCallback();
};

// Define the schema
ebConnector.getSchema = (schemaCallback) => {
  // console.log(tableau.password);
  schemaCallback(schema.tables, schema.joins);
};

// Download the data
ebConnector.getData = (table, doneCallback) => {
  const settings = {
    url: '/api/stats',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    processData: false,
    data: '{\n\t"wdc": "spotify",\n\t"action": "download"\n}',
  };
  $.ajax(settings)
    .done((response) => {
      console.log(response);
    })
    .always(() => {
      if (table.tableInfo.id === 'recentTracks') {
        tableau.reportProgress('Getting 50 recently played tracks');
        getRecentTracks((items) => {
          extractTracks(items, (tracks) => {
            table.appendRows(tracks);
            doneCallback();
          });
        });
      } else if (table.tableInfo.id === 'myPlaylists') {
        tableau.reportProgress('Getting your playlists');
        getMyPlaylists((items) => {
          const playlists = [];
          for (let i = 0; i < items.length; i += 1) {
            const playlist = {};
            playlist.collaborative = items[i].collaborative;
            playlist.href = items[i].href;
            playlist.id = items[i].id;
            if (items[i].images && items[i].images[0]) {
              playlist.image = items[i].images[0].url;
            }
            playlist.name = items[i].name;
            if (items[i].owner) {
              playlist.owner_name = items[i].owner.display_name;
              playlist.owner_href = items[i].owner.href;
              playlist.owner_id = items[i].owner.id;
              playlist.owner_type = items[i].owner.type;
            }
            playlist.primary_color = items[i].primary_color;
            playlist.public = items[i].public;
            if (items[i].tracks) {
              playlist.tracks_total = items[i].tracks.total;
            }
            playlist.uri = items[i].uri;
            playlists.push(playlist);
          }
          table.appendRows(playlists);
          doneCallback();
        });
      } else if (table.tableInfo.id === 'playlistTracks') {
        const playlistIds = table.filterValues;
        if (!table.isJoinFiltered) {
          tableau.abortWithError('You must join with a playlist table');
          return;
        }
        if (playlistIds.length === 0) {
          doneCallback();
        }
        let p = 0;
        async.each(playlistIds, (playlist, donePlaylist) => {
          p += 1;
          tableau.reportProgress(`Getting tracks for playlist ${p} of ${playlistIds.length}`);
          getPlaylistTracks(playlist, (items) => {
            extractTracks(items, (tracks) => {
              table.appendRows(tracks);
              donePlaylist();
            }, playlist);
          });
        }, (err) => {
          if (err) console.error(err);
          doneCallback();
        });
      }
    });
};

tableau.registerConnector(ebConnector);


// **
// END Tableau WDC Code
// **
