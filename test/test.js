let yts = require( '../dist/yt-search.min.js' )

if ( !!process.env.test_yt_search ) {
  yts = require( '../src/index.js' )
}

// delay executions to avoid getting throttled by youtube
const _yts = yts
yts = async function ( o, c ) {
  let promise, _res, _rej

  if ( !c ) {
    promise = new Promise( function ( res, rej ) {
      _res = res
      _rej = rej
    } )
  }

  try {
    const r = await _yts( o )
    setTimeout( function () {
      if ( c ) {
        c( undefined, r )
      } else {
        _res( r )
      }
    }, 1000 )
  } catch ( err ) {
    if ( c ) {
      c( err )
    } else {
      _rej( err )
    }
  }

  return promise
}

const test = require( 'tape' )

test( 'basic search', function ( t ) {
  t.plan( 5 )

  yts( 'philip glass koyaanisqatsi', function ( err, r ) {
    t.error( err, 'no errors OK!' )

    const list = r.videos

    const koyaani = list.filter( function ( song ) {
      const keep = (
        song.title.toLowerCase().indexOf( 'koyaani' ) >= 0 &&
        song.title.toLowerCase().indexOf( 'glass' ) >= 0 &&
        ( song.author.name === 'DJDumato' ) &&
        song.seconds > 100 &&
        song.duration.seconds > 100 &&
        song.views > ( 100 * 1000 )
      )

      // console.log( song )

      return keep
    } )[ 0 ]

    console.log( koyaani )

    t.ok( koyaani, 'found koyaani OK!' )
    t.equal( koyaani.videoId, '_4Vt0UGwmgQ', 'koyani video id equal!' )
    t.equal( koyaani.timestamp, '3:29', 'koyani video timestamp equal!' )
    t.ok( koyaani.description.indexOf(
      'Koyaanisqatsi: Life out of balance ∞ um documentário lan°ado em 1983 dirigido'
    ), 'koyani video timestamp equal!' )
  } )
} )

test( 'videos, playlists and users/channels', function ( t ) {
  t.plan( 5 )

  yts( 'pewdiepie', function ( err, r ) {
    t.error( err, 'no errors OK!' )

    const videos = r.videos
    const accounts = r.accounts

    t.ok( videos.length > 0, 'videos found' )
    t.ok( accounts.length > 0, 'accounts found' )
  } )

  yts( 'pewdiepie list', function ( err, r ) {
    t.error( err, 'no errors OK!' )

    const playlists = r.playlists

    t.ok( playlists.length > 0, 'playlists found' )
  } )
} )

test( 'test order and relevance', function ( t ) {
  t.plan( 2 )

  const opts = {
    search: "Josh A & Jake Hill - Rest in Pieces (Lyrics)"
  }

  yts( opts, function ( err, r ) {
    t.error( err, 'no errors OK!' )

    const topVideos = r.videos.slice( 0, 5 )

    let hasTitle = false
    topVideos.forEach( function ( v ) {
      if ( v.title.match( /josh.*jake.*hill.*rest.*piece.*lyric/i ) ) {
        hasTitle = true
      }
    } )

    t.ok( hasTitle, 'relevance and order OK' )
  } )
} )

test( 'test non-en same top results and duration parsing', function ( t ) {
  t.plan( 4 )

  const opts = {
    search: "Josh A & Jake Hill - Rest in Pieces (Lyrics)"
  }

  yts( opts, function ( err, r ) {
    t.error( err, 'no errors OK!' )

    const topVideo = r.videos[ 0 ]

    yts( {
      search: opts.search,
      hl: 'fi'
    }, function ( err, r ) {
      t.error( err, 'no errors OK!' )

      const videos = r.videos

      t.equal( topVideo.title, videos[ 0 ].title, 'top result title the same!' )
      t.equal( topVideo.duration.timestamp, videos[ 0 ].duration.timestamp, 'top result timestamp the same!' )
    } )
  } )
} )

test( 'search by video id', function ( t ) {
  t.plan( 3 )

  const opts = {
    search: "_JzeIf1zT14"
  }

  yts( opts, function ( err, r ) {
    t.error( err, 'no errors OK!' )

    const topVideo = r.videos[ 0 ]

    t.ok( topVideo.title.match( /josh.*jake.*hill.*rest.*piece.*lyric/i ), 'top result title matched!' )
    t.ok( topVideo.videoId, opts.search, 'top result video id matched!' )
  } )
} )

test( 'video metadata by id', function ( t ) {
  t.plan( 13 )

  yts( { videoId: 'e9vrfEoc8_g' }, function ( err, video ) {
    t.error( err, 'no errors OK!' )

    const MILLION = 1000 * 1000

    t.equal( video.title, 'Superman Theme', 'title' )
    t.equal( video.videoId, 'e9vrfEoc8_g', 'videoId' )
    t.equal( video.timestamp, '4:13', 'timestamp' )
    t.equal( video.seconds, 253, 'seconds (duration)' )

    t.equal( video.description, 'The theme song from Superman: The Movie', 'description' )

    t.ok( video.views > ( 35 * MILLION ), 'views over 35 Million' )

    t.equal( video.genre, 'music', 'genre is music' )
    t.equal( video.uploadDate, '2009-07-27', 'uploadDate' )

    t.equal( video.author.id, 'Redmario2569', 'author id' )
    t.equal( video.author.url, 'https://youtube.com/user/Redmario2569', 'author url' )

    t.equal( video.thumbnail, 'https://i.ytimg.com/vi/e9vrfEoc8_g/default.jpg', 'thumbnail' )
    t.equal( video.image, 'https://i.ytimg.com/vi/e9vrfEoc8_g/hqdefault.jpg', 'image' )
  } )
} )

test( 'video metadata by faulty/non-existing id', function ( t ) {
  t.plan( 1 )

  yts( { videoId: 'X9vrfEoc8_g' }, function ( err, video ) {
    t.equal( err, 'video unavailable', 'video unavailable' )
  } )
} )

test( 'video metadata by id _JzeIf1zT14', function ( t ) {
  t.plan( 13 )

  yts( { videoId: '_JzeIf1zT14' }, function ( err, video ) {
    t.error( err, 'no errors OK!' )

    const MILLION = 1000 * 1000

    t.equal( video.title, 'Josh A & Jake Hill - Rest in Pieces (Lyrics)', 'title' )
    t.equal( video.videoId, '_JzeIf1zT14', 'videoId' )
    t.equal( video.timestamp, '2:27', 'timestamp' )
    t.equal( video.seconds, 147, 'seconds (duration)' )

    t.ok( video.description.indexOf( 'Produced by: Josh A SPOTIFY' ) >= 0, 'description' )

    t.ok( video.views > ( 1 * MILLION ), 'views over 1 Million' )

    t.equal( video.genre, 'music', 'genre is music' )
    t.equal( video.uploadDate, '2018-10-12', 'uploadDate' )

    t.equal( video.author.id, 'UCF7YjO3SzVUGJYcXipRY0zQ', 'author id' )
    t.equal( video.author.url, 'https://youtube.com/channel/UCF7YjO3SzVUGJYcXipRY0zQ', 'author url' )

    t.equal( video.thumbnail, 'https://i.ytimg.com/vi/_JzeIf1zT14/default.jpg', 'thumnail' )
    t.equal( video.image, 'https://i.ytimg.com/vi/_JzeIf1zT14/hqdefault.jpg', 'image' )
  } )
} )

test( 'playlist metadata by id', function ( t ) {
  t.plan( 11 )

  yts( { listId: 'PL7k0JFoxwvTbKL8kjGI_CaV31QxCGf1vJ' }, function ( err, playlist ) {
    t.error( err, 'no errors OK!' )

    t.equal( playlist.title, 'Superman Themes', 'title' )
    t.equal( playlist.listId, 'PL7k0JFoxwvTbKL8kjGI_CaV31QxCGf1vJ', 'listId' )

    t.equal( playlist.url, 'https://www.youtube.com/playlist?hl=en&list=PL7k0JFoxwvTbKL8kjGI_CaV31QxCGf1vJ', 'playlist url' )

    t.equal( playlist.videoCount, 10 , 'views over 300 (as of 2020-01-08)' )
    t.ok( playlist.views > 300, 'views over 300 (as of 2020-01-08)' )

    t.equal( playlist.lastUpdate, '2018-5-24' , 'last updated' )

    t.equal( playlist.author.name, 'Cave Spider10', 'author name' )
    t.equal( playlist.author.channelId, 'UCdwR7fIE2xyXlNRc7fb9tJg', 'author channelId' )
    t.equal( playlist.author.channelUrl, 'https://youtube.com/channel/UCdwR7fIE2xyXlNRc7fb9tJg', 'author channelUrl' )

    t.equal( playlist.thumbnail, 'https://i.ytimg.com/vi/IQtKjU_pOuw/hqdefault.jpg', 'playlist thumbnail' )
  } )
} )

test( 'playlist metadata by faulty/non-existing id', function ( t ) {
  t.plan( 1 )

  yts( { listId: 'XLhf_RSaUvUVvuJHpeiTvnk5n99rlRM' }, function ( err, playlist ) {
    t.equal( err, 'http status: 303', 'http error 303' )
  } )
} )

test( 'search results: playlist', function ( t ) {
  t.plan( 5 )

  yts( 'superman theme list', function ( err, r ) {
    t.error( err, 'no errors OK!' )

    const lists = r.playlists

    // Superman Theme Songs Playlist
    const sts = lists.filter( function ( playlist ) {
      const keep = (
        playlist.title.toLowerCase() === 'superman theme songs' &&
        playlist.author.name === 'AJ Lelievre' &&

        // is exactly 21 as of now but test with some leeway
        playlist.videoCount >= 12
      )

      return keep
    } )[ 0 ]


    t.equal( sts.url, 'https://youtube.com/playlist?list=PLYhKAl2FoGzC0IQkgfVtM991w3E8ro1yG', 'playlist url' )
    t.equal( sts.listId, 'PLYhKAl2FoGzC0IQkgfVtM991w3E8ro1yG', 'playlist id' )
    t.equal( sts.thumbnail, 'https://i.ytimg.com/vi/yCCq_6ankAI/default.jpg', 'playlist thumbnail' )
    t.equal( sts.type, 'list', 'playlist type' )
  } )
} )

test( 'search results: channel', function ( t ) {
  t.plan( 5 )

  yts( 'PewDiePie', function ( err, r ) {
    t.error( err, 'no errors OK!' )

    const channels = r.channels
    const topChannel = channels[ 0 ]

    t.equal( topChannel.name, 'PewDiePie', 'channel name' )
    t.equal( topChannel.url, 'https://youtube.com/user/PewDiePie', 'channel url' )

    t.ok( topChannel.videoCount > 4000, 'video count' )
    t.equal( topChannel.thumbnail, 'https://yt3.ggpht.com/a/AGF-l79FVckie4j9WT-4cEW6iu3gPd4GivQf_XNSWg=s176-c-k-c0x00ffffff-no-rj-mo', 'thumbnail url' )
  } )
} )

test( 'test promise support ( search by video id )', async function ( t ) {
  t.plan( 2 )

  const opts = {
    search: "_JzeIf1zT14"
  }

  const r = await yts( opts )

  const topVideo = r.videos[ 0 ]

  t.ok( topVideo.title.match( /josh.*jake.*hill.*rest.*piece.*lyric/i ), 'top result title matched!' )
  t.ok( topVideo.videoId, opts.search, 'top result video id matched!' )
} )
