import tmi from 'tmi.js';
import fetch from 'cross-fetch';
import { BOT_USERNAME, OAUTH_TOKEN, CHANNEL_NAME, CLIENT_ID, BLOCKED_WORDS, TOKEN } from './constants';

var active = true
var active_2 = true

const options = {
  options: { debug: true },
  connection: {
    reconnect: true,
    secure: true,
    timeout: 180000,
    reconnectDecay: 1.4,
    reconnectInterval: 1000,
  },
  identity: {
    username: BOT_USERNAME,
    password: OAUTH_TOKEN
  },
  channels: [CHANNEL_NAME]
}

const client = new tmi.Client(options)

client.connect()

// events
client.on('disconnected', (reason) => {
  onDisconnectedHandler(reason)
})

client.on('connected', (address, port) => {
  onConnectedHandler(address, port)
})

client.on('hosted', (channel, username, viewers, autohost) => {
  onHostedHandler(channel, username, viewers, autohost)
})

client.on('subscription', (channel, username, method, message, userstate) => {
  onSubscriptionHandler(channel, username, method, message, userstate)
})

client.on('raided', (channel, username, viewers) => {
  onRaidedHandler(channel, username, viewers)
})

client.on('cheer', (channel, userstate, message) => {
  onCheerHandler(channel, userstate, message)
})

client.on('giftpaidupgrade', (channel, username, sender, userstate) => {
  onGiftPaidUpgradeHandler(channel, username, sender, userstate)
})

client.on('hosting', (channel, target, viewers) => {
  onHostingHandler(channel, target, viewers)
})

client.on('reconnect', () => {
  reconnectHandler()
})

client.on('resub', (channel, username, months, message, userstate, methods) => {
  resubHandler(channel, username, months, message, userstate, methods)
})

client.on('subgift', (channel, username, streakMonths, recipient, methods, userstate) => {
  subGiftHandler(channel, username, streakMonths, recipient, methods, userstate)
})

// event handlers

client.on('message', (channel, userstate, message, self) => {
  var badmessage = checkTwitchChat(userstate, message, channel)
  if (self || badmessage) {
    return
  }

  if (userstate.username === BOT_USERNAME || userstate.username === "nightbot"
    || userstate.username === "streamelements" || userstate.username === "songlistbot") {
    console.log(`Not checking bot's messages.`)
    return
  }

  if (message.startsWith('!so')) {
    var array = message.split(" ");
    console.log(array)
    shoutout(channel, array[1])
    return
  }
  if (message.toLowerCase() === '!hello') {
    hello(channel, userstate)
    return
  }

  if (message.toLowerCase() === "!fleshegg") {

    client.say(channel, "you called? my commands are !hello !socials !discord !models !lurk !nini !flesh !comms");
  }


  if (message.toLowerCase() === "!socials") {

    client.say(channel, "https://angriegg.carrd.co");
  }


  if (message.toLowerCase() === "!discord") {

    client.say(channel, "come chill in the fridge https://discord.gg/JRJ94UVZvA");
  }

  if (message.toLowerCase() === "!models") {

    client.say(channel, "pick eggus model from these! https://imgur.com/a/kiPHnIX");
  }

  if (message.toLowerCase() === "!lurk") {

    client.say(channel, "ty for lurky wurkies");
  }

  if (message.toLowerCase() === "!nini") {
    client.say(channel, "nini dont let the flesheggs bite!");
  }

  if (message.toLowerCase() === "!flesh") {

    client.say(channel, "im always watching");
  }

  if (message.toLowerCase() === "!comms" || message.toLowerCase() === "!comm") {

    client.say(channel, "fill eggus fridge by commissioning her -> https://angriegg.com")

  }


  else {
    if (message.toLowerCase().startsWith("@") === false && message.toLowerCase().includes("ex") === true) {
      if (active) {
        client.say(channel, `don't you mean ${message.toLowerCase().replace(/ex/g, "EGGS")}? Kappa`)
        active = false
        setTimeout(() => {
          active = true
        }, 5000)
      }
    }

    if (message.toLowerCase().includes("eggs") === true) {
      if (active_2) {
        client.say(channel, ":egg: :egg: :egg:")
        active_2 = false
        setTimeout(() => {
          active_2 = true
        }, 5000)
      }
    }
  }

  onMessageHandler(channel, userstate, message, self)
})

function onMessageHandler(channel, userstate, message, self) {
  checkTwitchChat(userstate, message, channel)
}

function onDisconnectedHandler(reason) {
  console.log(`Disconnected: ${reason}`)
}

function onConnectedHandler(address, port) {
  console.log(`Connected: ${address}:${port}`)
}

async function onHostedHandler(channel, username, viewers) {
  const game = await isUser(username, channel)
  client.say(channel,
    `thank you @${username} for the host of ${viewers}!!! They were absolutely killing it at ${game}
    pls perceive them at https://twitch.tv/${username}`);
}

async function onRaidedHandler(channel, username, viewers) {
  const game = await isUser(username, channel)
  client.say(channel,
    `/announce thank you @${username} for the raid of ${viewers}!!! They were absolutely killing it at ${game}
    pls perceive them at https://twitch.tv/${username}`);
}

function onSubscriptionHandler(channel, username, method, message, userstate) {
  client.say(channel,
    `thank you @${username} for subbiesssss!!!`
  )
}

function onCheerHandler(channel, userstate, message) {
  client.say(channel,
    `thank you @${userstate.username} for the ${userstate.bits} bitties`
  )
}

function onGiftPaidUpgradeHandler(channel, username, sender, userstate) {
  client.say(channel,
    `thank you @${username} for continuing your gifted sub!!!`
  )
}

function onHostingHandler(channel, target, viewers) {
  client.say(channel,
    `We are now hosting ${target} with ${viewers} viewers!`
  )
}

function reconnectHandler() {
  console.log('Reconnecting...')
}

function resubHandler(channel, username, months, message, userstate, methods) {
  const cumulativeMonths = userstate['msg-param-cumulative-months']
  client.say(channel,
    `thank you @${username} for ${cumulativeMonths} eggs!`
  )
}

function subGiftHandler(channel, username, streakMonths, recipient, methods, userstate) {
  const senderCount =  ~userstate["msg-param-sender-count"];
  client.say(channel,
    `${username} has gifted ${senderCount} subs!`
  )
}
//-----------------------------------------------------------------------------------------------//

// commands

async function shoutout(channel, username) {
  const game = await isUser(username, channel)
  client.say(channel,
    `/announce go support @${username} because theyre a beautiful little eggling!!! They were absolutely killing it at ${game} PogChamp PogChamp PogChamp!
    pls perceive them at https://twitch.tv/${username}`)
}

function hello(channel, userstate) {
  client.say(channel, `:egg: :lips: :egg: hi @${userstate.username}`)
}


//==============================================================================================

function checkTwitchChat(userstate, message, channel) {
  console.log(message)
  message = message.toLowerCase()
  let shouldSendMessage = false
  let bannable = false
  let timeout = false
  bannable = BANNED_PHRASES.some(bannedPhrase => message.includes(bannedPhrase.toLowerCase()))
  if (bannable) {
    // ban
    client.ban(channel, userstate.username, "You've been caught by fleshegg for saying nono words")
    return bannable
  }
  timeout = TIMEOUT_WORDS.some(timeoutwords => message.includes(timeoutwords.toLowerCase()))
  if (timeout) {
    client.say(channel, `@${userstate.username}, stop it`)
    // timeout
    client.timeout(channel, userstate.username, "You've been caught by fleshegg for saying nono words")
    return timeout
  }
  shouldSendMessage = BLOCKED_WORDS.some(blockedWord => message.includes(blockedWord.toLowerCase()))
  if (shouldSendMessage) {
    // tell user
    client.say(channel, `@${userstate.username}, sorry!  You message was deleted.`)
    // delete message
    client.deletemessage(channel, userstate.id)
    return shouldSendMessage
  }
  return false
}

async function isUser(userLookUp, channel) {
  var url = `https://api.twitch.tv/helix/users?login=${userLookUp.toLowerCase().trim()}`;
  try {
    const response = await fetch(url,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Client-Id": CLIENT_ID
        }
      }
    );

    if (response.status >= 400) {
      throw new Error("Error fetching user")
    }

    const user = await response.json();
    // console.log(user.data[0].id);
    var url_broad = `https://api.twitch.tv/helix/channels?broadcaster_id=${user.data[0].id}`
    const broadcast = await fetch(url_broad,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Client-Id": CLIENT_ID
        }
      });
    const game = await broadcast.json();
    // console.log(game.data[0].game_name)
    return game.data[0].game_name
  } catch (err) {
    console.error(err);
  }
}