// all copyrights gose to def --> http://discord.com/users/933856726770413578

const express = require("express");
const app = express();
const db = require("quick.db");
const path = require("path");
const passport = require("passport");
const bodyparser = require("body-parser");
const Strategy = require("passport-discord").Strategy;
const url = require("url");
const session = require("express-session");
const memorystore = require("memorystore")(session);
const settings = require("./config").dashboard;
const discord = require("discord.js");
const client = new discord.Client({
  intents: new discord.Intents(32767),
});
client.login(settings.token);
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));
passport.use(
  new Strategy(
    {
      clientID: settings.id,
      clientSecret: settings.secret,
      callbackURL: settings.callback,
      scope: ["identify", "guilds", "guilds.join"],
    },
    (accessToken, refreshToken, profile, done) => {
      process.nextTick(() => done(null, profile));
    }
  )
);

app.use(
  session({
    store: new memorystore({ checkPeriod: 86400000 }),
    secret: `!@#$d8932%^ni#(!@bn9312)`,
    resave: false,
    saveUninitialized: false,
  })
);

app.set("views", __dirname + "/views");
app.set("view engine", "pug");

app.use(passport.initialize());
app.use(passport.session());

app.use(bodyparser.json());
app.use(
  bodyparser.urlencoded({
    extended: true,
  })
);

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.get(
  "/login",
  (req, res, next) => {
    if (req.session.backURL) {
      req.session.backURL = req.session.backURL;
    } else if (req.headers.referer) {
      const parsed = url.parse(req.headers.referer);
      if (parsed.hostname == app.locals.domain) {
        req.session.backURL = parsed.path;
      }
    } else {
      req.session.backURL = "/";
    }
    next();
  },
  passport.authenticate("discord", { prompt: "none" })
);

app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    req.logout();
    res.redirect("/");
  });
});

app.get(
  "/callback",
  passport.authenticate("discord", { fallureRedirect: "/" }),
  async (req, res) => {
    res.redirect("/thanks");
  }
);

app.get("/thanks", (req, res) => {
  res.render("thanks", {
    title: "Thanks",
    client: client,
    req: req,
    user: req.isAuthenticated() ? req.user : null,
  });
})

app.get("/", (req, res) => {
  res.render("index", {
    title: "Home",
    client: client,
    req: req,
    user: req.isAuthenticated() ? req.user : null,
  });
});

app.get("/dashboard", (req, res) => {
  res.render("servers", {
    title: "Servers",
    client: client,
    req: req,
    user: req.isAuthenticated() ? req.user : null,
    permissions: discord.Permissions,
    domain: settings.domain,
  });
});

app.get("/dashboard/:guildId", async (req, res) => {
  let guildId = req.params.guildId;
  if (!guildId) return res.redirect("/");
  let guild = client.guilds.cache.find((g) => g.id == guildId);
  if (!guild) return res.redirect("/");
  let userGG = req.user;
  if (!userGG) return res.redirect("/");
  let user = guild.members.cache.find((u) => u.id == req.user.id);
  if (!user) {
    user = await guild.members.fetch(req.user.id).then((u) => {
      if (!u) return res.redirect("/");
    });
  }
  if (!user.permissions.has(discord.Permissions.FLAGS.ADMINISTRATOR))
    return res.redirect("/");
  res.render("server", {
    title: guild.name,
    client: client,
    req: req,
    user: req.isAuthenticated() ? req.user : null,
    guild: guild,
  });
});

app.post("/dashboard/:guildId", async (req, res) => {
  let guildId = req.params.guildId;
  if (!guildId) return res.redirect("/");
  let guild = client.guilds.cache.find((g) => g.id == guildId);
  if (!guild) return res.redirect("/");
  let userGG = req.user;
  if (!userGG) return res.redirect("/");
  let user = guild.members.cache.find((u) => u.id == req.user.id);
  if (!user) {
    user = await guild.members.fetch(req.user.id).then((u) => {
      if (!u) return res.redirect("/");
    });
  }
  if (!user.permissions.has(discord.Permissions.FLAGS.ADMINISTRATOR))
    return res.redirect("/");
  let body = req.body;
  if (body?.language) {
    let language = body.language;
    db.set(`Lang_${guildId}`, language);
  } else if (body?.prefix) {
    let prefix = body.prefix;
    db.set(`Prefix_${guildId}`, prefix);
  }
  res.render("server", {
    title: guild.name,
    client: client,
    req: req,
    user: req.isAuthenticated() ? req.user : null,
    guild: guild,
  });
});

app.use(express.static(`${__dirname}/assets`));
app.locals.basedir = `${__dirname}/assets`;
app.listen(process.env.PORT || settings.port, () =>
  console.log("dashboard in load..")
);

let discordF = require("./discord");
discordF(discord, client, db)